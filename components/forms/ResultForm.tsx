"use client";

import { resultSchema, ResultSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import UserSearchForm from "../UserSearchForm";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  CreateResultMutation,
  ResultType,
  UpdateResultMutation,
  useCreateResultMutation,
  useGetAssignmentsQuery,
  useGetClassesQuery,
  useGetExamsQuery,
  useGetGradesQuery,
  useGetTermsQuery,
  useUpdateResultMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { useState } from "react";

const ResultForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const [testMaxScore, setTestMaxScore] = useState(0);

  const form = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema(testMaxScore)),
    defaultValues: {
      ...data,
      score: data?.score ?? 0,
      student: data?.student,
      termId: data?.term.id ?? null,
      classId: data?.class.id ?? null,
      gradeId: data?.grade.id ?? null,
      testId: data?.test.id ?? null,
      type: data?.type ?? null,
    },
  });

  const resultType = form.watch("type");

  const [termsResult] = useGetTermsQuery();
  const [gradesResult] = useGetGradesQuery();

  const gradeId = form.watch("gradeId");
  const [classesResult] = useGetClassesQuery({
    pause: !gradeId,
    variables: { filter: { gradeId } },
  });

  const termId = form.watch("termId");
  const classId = form.watch("classId");
  const [assignmentsResult] = useGetAssignmentsQuery({
    pause: resultType === "exam" && !classId && !termId,
    variables: { filter: { classId, termId } },
  });

  const [examsResult] = useGetExamsQuery({
    pause: resultType === "assignment" && !classId && !termId,
    variables: { filter: { classId, termId } },
  });

  const [createMutationResult, createResult] = useCreateResultMutation();
  const [updateMutationResult, updateResult] = useUpdateResultMutation();

  const resultTests =
    resultType === "assignment"
      ? assignmentsResult.data?.assignments
      : examsResult.data?.exams;

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      score: values.score,
      type: values.type.toUpperCase() as ResultType,
      studentId: values.student.id,
      testId: values.testId,
    };

    const response =
      type === "create"
        ? await createResult({ input: formData })
        : await updateResult({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateResultMutation)?.createResult
        : (response.data as UpdateResultMutation)?.updateResult;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateResultSuccess" ||
      mutationResult.__typename === "MutationUpdateResultSuccess"
    ) {
      toast.success(`Result ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading =
    createMutationResult.fetching || updateMutationResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Term"
            name="termId"
          >
            <SelectContent>
              {termsResult.data?.terms?.map(({ id, term, academicYear }) => (
                <SelectItem key={id} value={id!}>
                  {term} - {academicYear.year}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Grade"
            name="gradeId"
          >
            <SelectContent>
              {gradesResult.data?.grades?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Class"
            name="classId"
          >
            <SelectContent>
              {classesResult.data?.classes?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <UserSearchForm
            type="student"
            label="Student"
            name="student"
            control={form.control}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.RADIO}
            label="Type"
            name="type"
            options={[
              { id: "exam", name: "exam" },
              { id: "assignment", name: "assignment" },
            ]}
          />

          {resultType && classId && termId && (
            <>
              <InputField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                label={resultType ?? "Test - Select a test type first"}
                name="testId"
              >
                <SelectContent>
                  {resultTests?.map(({ id, maxScore, subject }) => (
                    <SelectItem key={id} value={id} className="py-1">
                      <span onClick={() => setTestMaxScore(maxScore)}>
                        {subject.name} {`(Max Score: ${maxScore})`}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </InputField>

              <InputField
                label="Score"
                name="score"
                type="number"
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputProps={{ max: testMaxScore }}
              />
            </>
          )}
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

export default ResultForm;
