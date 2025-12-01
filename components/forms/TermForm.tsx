"use client";

import { termSchema, TermSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { generateAcademicYears, handleGraphqlClientErrors } from "@/lib/utils";
import {
  MutateAcademicYearMutation,
  MutateTermMutation,
  useGetAcademicYearsQuery,
  useMutateAcademicYearMutation,
  useMutateTermMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { schoolTerms } from "@/constants";

const TermForm = ({ type, data, setOpen, relatedData }: FormProps) => {
  const router = useRouter();

  const isAcademicYearForm = relatedData?.isAcademicYearForm;

  const form = useForm<TermSchema>({
    resolver: zodResolver(
      termSchema(isAcademicYearForm ? "academic-year" : "term"),
    ),
    defaultValues: {
      isCurrent: data?.isCurrent ?? false,
      startDate: data?.startDate ? new Date(data?.startDate) : undefined,
      endDate: data?.endDate ? new Date(data?.endDate) : undefined,
      term: data?.term?.toString() ?? null,
      year: data?.year ?? null,
      academicYearId: data?.academicYearId ?? null,
    },
  });

  const [academicYearsQueryResult] = useGetAcademicYearsQuery({
    pause: isAcademicYearForm,
  });

  const [termMutationResult, mutateTerm] = useMutateTermMutation();
  const [academicYearMutationResult, mutateAcademicYear] =
    useMutateAcademicYearMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const { year, academicYearId, term, ...input } = values;

    const response = isAcademicYearForm
      ? await mutateAcademicYear({ input: { ...input, year: year! } })
      : await mutateTerm({
        input: {
          ...input,
          academicYearId: academicYearId!,
          session: term!,
        },
      });

    const mutationResult = isAcademicYearForm
      ? (response.data as MutateAcademicYearMutation)?.mutateAcademicYear
      : (response.data as MutateTermMutation)?.mutateTerm;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationMutateAcademicYearSuccess" ||
      mutationResult.__typename === "MutationMutateTermSuccess"
    ) {
      toast.success(
        `${isAcademicYearForm ? "Academic Year" : "Term"} ${type}d successfully!`,
      );
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading =
    termMutationResult.fetching || academicYearMutationResult.fetching;

  const academicYears = academicYearsQueryResult.data?.academicYears;

  const registeredTerms = academicYears?.flatMap(({ terms }) =>
    terms.map((term) => term.session),
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {!isAcademicYearForm && (
            <InputField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              label="Academic Year"
              name="academicYearId"
            >
              <SelectContent>
                {academicYears?.length === 0 && (
                  <SelectItem
                    value="0"
                    disabled
                    className="max-w-[18rem] text-wrap"
                  >
                    No Academic Year Found. Register one if you haven&apos;t yet
                  </SelectItem>
                )}
                {academicYears?.map(({ id, year, isCurrent }) => (
                  <SelectItem key={id} value={id!}>
                    {year} {isCurrent ? "- Current" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </InputField>
          )}

          <InputField
            label={isAcademicYearForm ? "Academic Year" : "Term"}
            name={isAcademicYearForm ? "year" : "term"}
            control={form.control}
            fieldType={FormFieldType.SELECT}
          >
            {isAcademicYearForm ? (
              <SelectContent>
                {generateAcademicYears().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            ) : (
              <SelectContent>
                {schoolTerms.map(({ id, name }) => (
                  <SelectItem
                    key={id}
                    value={id.toString()}
                    disabled={registeredTerms?.includes(id)}
                  >
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </InputField>

          <InputField
            label="Start Date"
            name="startDate"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
          />

          <InputField
            label="End Date"
            name="endDate"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
          />

          <InputField
            label={`Is this the current ${isAcademicYearForm ? "academic year" : "term"}?`}
            name="isCurrent"
            control={form.control}
            fieldType={FormFieldType.CHECKBOX}
          />
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {!isLoading ? (
            type
          ) : (
            <Loader2 className="animate-spin text-lamaYellow" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default TermForm;
