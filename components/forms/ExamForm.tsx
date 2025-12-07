"use client";

import { examSchema, ExamSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  CreateExamMutation,
  ExamType,
  UpdateExamMutation,
  useCreateExamMutation,
  useGetGradesQuery,
  useGetSubjectsQuery,
  useGetTermsQuery,
  useUpdateExamMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { examTypes, schoolTerms } from "@/constants";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const ExamForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const [subjectsResult] = useGetSubjectsQuery();
  const [gradesResult] = useGetGradesQuery();
  const [termsResult] = useGetTermsQuery({ variables: { take: 3 } });

  const subjects = subjectsResult?.data?.subjects ?? [];
  const grades = gradesResult?.data?.grades ?? [];
  const terms = termsResult?.data?.terms ?? [];

  const form = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      ...data,
      date: data?.date ? new Date(data.date) : undefined,
      subjectId: data?.subject.id ?? "",
      gradeId: data?.grade.id ?? "",
      termId: data?.term.id ?? "",
      files: data?.files ?? [],
    },
  });

  const [createResult, createExam] = useCreateExamMutation();
  const [updateResult, updateExam] = useUpdateExamMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
      type: values.type as ExamType,
    };

    const response =
      type === "create"
        ? await createExam({ input: formData })
        : await updateExam({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateExamMutation)?.createExam
        : (response.data as UpdateExamMutation)?.updateExam;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateExamSuccess" ||
      mutationResult.__typename === "MutationUpdateExamSuccess"
    ) {
      toast.success(`Exam ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading = createResult.fetching || updateResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Subject"
            name="subjectId"
          >
            <SelectContent>
              {subjects?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            label="Date"
            name="date"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
          />

          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Exam Type"
            name="type"
          >
            <SelectContent>
              {examTypes.map((type) => (
                <SelectItem key={type} value={type.toUpperCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Max Score"
            name="maxScore"
            type="number"
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Grade"
            name="gradeId"
          >
            <SelectContent>
              {grades?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Term"
            name="termId"
          >
            <SelectContent>
              {terms?.map(({ id, session, academicYear }) => (
                <SelectItem key={id} value={id!}>
                  {schoolTerms.find((t) => session === t.id)?.name} -{" "}
                  {academicYear.year}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>
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

export default ExamForm;
