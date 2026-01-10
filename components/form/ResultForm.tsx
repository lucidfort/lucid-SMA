"use client";

import { resultSchema, ResultSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import UserSearchForm from "./UserSearchForm";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  GetAssignmentsQuery,
  GetExamsQuery,
  useCreateAssessmentResultMutation,
  useCreateExamResultMutation,
  useGetAssignmentsQuery,
  useGetClassesQuery,
  useGetExamsQuery,
  useGetGradesQuery,
  useGetTermsQuery,
  useUpdateAssessmentResultMutation,
  useUpdateExamResultMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { useState } from "react";

type ResultType = "exam" | "assessment";

type TestItem = {
  id: string;
  maxScore: number;
  subjectName: string;
};

const RESULT_CONFIG = {
  exam: {
    label: "Exam",
    useTestsQuery: useGetExamsQuery,
    useCreateMutation: useCreateExamResultMutation,
    useUpdateMutation: useUpdateExamResultMutation,
    successTypenames: [
      "MutationCreateExamResultSuccess",
      "MutationUpdateExamResultSuccess",
    ],
    selectTests: (data: GetExamsQuery | undefined): TestItem[] =>
      data?.exams?.map((e) => ({
        id: e.id,
        maxScore: e.maxScore,
        subjectName: e.subject.name,
      })) ?? [],
  },
  assessment: {
    label: "Assignment",
    useTestsQuery: useGetAssignmentsQuery,
    useCreateMutation: useCreateAssessmentResultMutation,
    useUpdateMutation: useUpdateAssessmentResultMutation,
    successTypenames: [
      "MutationCreateAssessmentResultSuccess",
      "MutationUpdateAssessmentResultSuccess",
    ],
    selectTests: (data: GetAssignmentsQuery | undefined): TestItem[] =>
      data?.assignments?.map((a) => ({
        id: a.id,
        maxScore: a.maxScore,
        subjectName: a.subject.name,
      })) ?? [],
  },
} satisfies Record<
  ResultType,
  {
    label: string;
    useTestsQuery: any;
    useCreateMutation: any;
    useUpdateMutation: any;
    successTypenames: readonly string[];
    selectTests: (data: any) => TestItem[];
  }
>;

const ResultForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const config = RESULT_CONFIG[data.type as ResultType];

  const [testMaxScore, setTestMaxScore] = useState(data?.test?.maxScore ?? 0);

  const form = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema(testMaxScore)),
    defaultValues: {
      score: data?.score ?? 0,
      student: data?.student
        ? {
            id: data.student.id,
            name: `${data.student.name} ${data.student.surname}`,
          }
        : { id: "" },
      testId: data?.test.id ?? null,
      termId: data?.test?.termId ?? null,
      classId: data?.student?.class.id ?? null,
      gradeId: data?.student?.class.gradeId ?? null,
    },
  });

  const [termsResult] = useGetTermsQuery();
  const [gradesResult] = useGetGradesQuery();

  const gradeId = form.watch("gradeId");
  const [classesResult] = useGetClassesQuery({
    pause: !gradeId,
    variables: { filter: { gradeId } },
  });

  const termId = form.watch("termId");
  const classId = form.watch("classId");

  const [testResults] = config.useTestsQuery({
    pause: !classId && !termId,
    variables: { filter: { classId, termId } },
  });

  const tests = config.selectTests(testResults.data);

  const [createMutationState, createResult] = config.useCreateMutation();
  const [updateMutationState, updateResult] = config.useUpdateMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const input = {
      ...(type === "update" && { id: data.id }),
      score: values.score,
      studentId: values.student.id,
      testId: values.testId,
    };

    const response =
      type === "create"
        ? await createResult({ input })
        : await updateResult({ input });

    const mutationResult = Object.values(response.data ?? {})[0];

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (config.successTypenames.includes(mutationResult.__typename)) {
      toast.success(`Result ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(
        handleGraphqlClientErrors(mutationResult) ?? "Something went wrong",
      );
    }
  });

  const isLoading =
    createMutationState.fetching || updateMutationState.fetching;

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
              {termsResult.data?.terms?.map(({ id, session, academicYear }) => (
                <SelectItem key={id} value={id!}>
                  {session} - {academicYear.year}
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
            filters={{
              classId,
            }}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label={config.label}
            name="testId"
          >
            <SelectContent>
              {tests.map(({ id, maxScore, subjectName }) => (
                <SelectItem key={id} value={id} className="py-1">
                  <span onClick={() => setTestMaxScore(maxScore)}>
                    {subjectName}
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

export default ResultForm;
