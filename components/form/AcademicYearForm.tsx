import React, { useEffect } from "react";
import InputField, { FormFieldType } from "@/components/form/ui/InputField";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  generateAcademicYears,
  handleGraphqlClientErrors,
} from "@/lib/utils/client.utils";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { academicYearSchema, AcademicYearSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProps } from "@/types";
import {
  MutateAcademicYearMutation,
  useGetAcademicYearsQuery,
  useMutateAcademicYearMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";

const AcademicYearForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<AcademicYearSchema>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      startDate: data?.startDate ? new Date(data?.startDate) : undefined,
      endDate: data?.endDate ? new Date(data?.endDate) : undefined,
      year: data?.year ?? null,
    },
  });

  const [{ data: queryData }] = useGetAcademicYearsQuery({
    variables: { includeTerm: false },
  });

  const [academicYearMutationResult, mutateAcademicYear] =
    useMutateAcademicYearMutation();

  const academicYear = useWatch({
    control: form.control,
    name: "year",
  });

  useEffect(() => {
    if (!academicYear) return;

    const [startYear, endYear] = academicYear.split("/");

    if (!startYear || !endYear) return;

    const startDate = new Date(parseInt(startYear), 8, 1);
    const endDate = new Date(parseInt(endYear), 5, 30);

    form.setValue("startDate", startDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("endDate", endDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [academicYear, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await mutateAcademicYear({
      input: values,
    });

    const mutationResult = (response.data as MutateAcademicYearMutation)
      ?.upsertAcademicYear;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (mutationResult.__typename === "MutationUpsertAcademicYearSuccess") {
      toast.success(`Academic Year ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading = academicYearMutationResult.fetching;

  const registeredYears = queryData?.academicYears?.map((a) => a.year);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Academic Year"
            name="year"
            control={form.control}
            fieldType={FormFieldType.SELECT}
          >
            <SelectContent>
              {generateAcademicYears().map((year) => (
                <SelectItem
                  key={year}
                  value={year}
                  disabled={registeredYears?.includes(year)}
                >
                  {year}
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
export default AcademicYearForm;
