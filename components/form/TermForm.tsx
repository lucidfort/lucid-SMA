"use client";

import { termSchema, TermSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import {
  MutateTermMutation,
  useGetAcademicYearsQuery,
  useMutateTermMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { schoolTerms } from "@/lib/constants";
import { useEffect } from "react";
import { isAfter, isBefore } from "date-fns";

const TermForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<TermSchema>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      startDate: data?.startDate ? new Date(data?.startDate) : undefined,
      endDate: data?.endDate ? new Date(data?.endDate) : undefined,
      session: data?.term?.toString() ?? null,
      academicYearId: data?.academicYearId ?? null,
    },
  });

  const [academicYearsQueryResult] = useGetAcademicYearsQuery({
    variables: { includeTerm: true },
  });

  const academicYearId = useWatch({
    control: form.control,
    name: "academicYearId",
  });

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
  });

  const endDate = useWatch({
    control: form.control,
    name: "endDate",
  });

  useEffect(() => {
    if (!academicYearId || !academicYearsQueryResult.data) return;

    const academicYear = academicYearsQueryResult.data.academicYears?.find(
      (year) => year.id === academicYearId,
    );

    let yearEnd = null;
    if (!academicYear?.startDate) return;

    const yearStart = new Date(academicYear.startDate);

    if (academicYear?.endDate) {
      yearEnd = new Date(academicYear.endDate);
    }

    // If startDate is empty, autofill it from the academic year
    if (!startDate) {
      form.setValue("startDate", yearStart, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    //   START DATE VALIDATION
    if (startDate && isBefore(new Date(startDate), yearStart)) {
      form.setError("startDate", {
        type: "manual",
        message: "Start date cannot be before the academic year's start date",
      });
    } else {
      form.clearErrors("startDate");
    }

    //   END DATE VALIDATION
    if (endDate && yearEnd && isAfter(new Date(endDate), yearEnd)) {
      form.setError("endDate", {
        type: "manual",
        message: "Term end date cannot be after the academic year's end date",
      });
    } else {
      form.clearErrors("endDate");
    }
  }, [academicYearId, startDate, endDate, academicYearsQueryResult.data, form]);

  const [termMutationResult, mutateTerm] = useMutateTermMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await mutateTerm({
      input: values,
    });

    const mutationResult = (response.data as MutateTermMutation)?.upsertTerm;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (mutationResult.__typename === "MutationUpsertTermSuccess") {
      toast.success(`Term ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading = termMutationResult.fetching;

  const academicYears = academicYearsQueryResult.data?.academicYears;

  const registeredTerms = academicYears?.flatMap(({ terms }) =>
    terms?.map((term) => term.session),
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <InputField
            label="Term"
            name="session"
            control={form.control}
            fieldType={FormFieldType.SELECT}
          >
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
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {!isLoading ? (
            type
          ) : (
            <Loader2 className="text-lamaYellow animate-spin" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default TermForm;
