"use client";

import { assignmentSchema, AssignmentSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  CreateAssignmentMutation,
  UpdateAssignmentMutation,
  useCreateAssignmentMutation,
  useGetClassesQuery,
  useGetGradesQuery,
  useGetSubjectsQuery,
  useUpdateAssignmentMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { useEffect } from "react";

const AssignmentForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
      maxScore: data?.maxScore,
      subjectId: data?.subject.id ?? "",
      classId: data?.class.id ?? "",
      gradeId: data?.class.grade.id ?? "",
    },
  });

  const [subjectsResult] = useGetSubjectsQuery();
  const [gradesResult] = useGetGradesQuery();

  const gradeId = form.watch("gradeId");
  const [classesResult] = useGetClassesQuery({
    pause: !gradeId,
    variables: { filter: { gradeId } },
  });

  const subjects = subjectsResult?.data?.subjects ?? [];
  const classes = classesResult?.data?.classes ?? [];
  const grades = gradesResult?.data?.grades ?? [];

  const [createResult, createAssignment] = useCreateAssignmentMutation();
  const [updateResult, updateAssignment] = useUpdateAssignmentMutation();

  useEffect(() => {
    form.resetField("classId");
  }, [gradeId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    delete formData.gradeId;

    const response =
      type === "create"
        ? await createAssignment({ input: formData })
        : await updateAssignment({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateAssignmentMutation)?.createAssignment
        : (response.data as UpdateAssignmentMutation)?.updateAssignment;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateAssignmentSuccess" ||
      mutationResult.__typename === "MutationUpdateAssignmentSuccess"
    ) {
      toast.success(`Assignment ${type}d successfully!`);
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
            label="Class"
            name="classId"
          >
            <SelectContent>
              {classes?.length === 0 && (
                <SelectItem
                  className="px-1 text-sm text-gray-700"
                  value={"1"}
                  disabled
                >
                  No class was found for selected grade
                </SelectItem>
              )}
              {classes?.map(({ id, name }) => (
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
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Max Score"
            name="maxScore"
            type="number"
            inputProps={{ min: 1 }}
          />

          <InputField
            label="Due Date"
            name="dueDate"
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

export default AssignmentForm;
