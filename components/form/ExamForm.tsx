"use client";

import { examSchema, ExamSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  CreateExamMutation,
  ExamType,
  UpdateExamMutation,
  useCreateExamMutation,
  useGetGradesQuery,
  useGetSubjectsQuery,
  useUpdateExamMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { examTypes } from "@/lib/constants";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";

const ExamForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const [subjectsResult] = useGetSubjectsQuery();
  const [gradesResult] = useGetGradesQuery();

  const subjects = subjectsResult?.data?.subjects ?? [];
  const grades = gradesResult?.data?.grades ?? [];

  const form = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      date: data?.date ? new Date(data.date) : undefined,
      subjectId: data?.subject.id ?? "",
      gradeId: data?.grade.id ?? "",
      maxScore: data?.maxScore,
      type: data?.type,
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
            label="Score"
            name="maxScore"
            type="number"
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

export default ExamForm;
