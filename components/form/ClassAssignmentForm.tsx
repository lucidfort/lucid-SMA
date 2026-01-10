"use client";

import { classAssignmentSchema, ClassAssignmentSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  AssignClassMutation,
  useAssignClassMutation,
  useGetClassesQuery,
  useGetGradesQuery,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { SelectContent, SelectItem } from "@/components/ui/select";
import UserSearchForm from "@/components/form/UserSearchForm";

const ClassAssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: FormProps) => {
  const router = useRouter();

  const form = useForm<ClassAssignmentSchema>({
    resolver: zodResolver(classAssignmentSchema),
    defaultValues: {
      gradeId: data?.gradeId ?? relatedData?.gradeId ?? "",
      classId: data?.classId ?? relatedData?.classId ?? "",
      staff: data?.staff
        ? {
            id: data.staff.id,
            name: `${data.staff.name} ${data.staff.surname}`,
          }
        : { id: "", name: "" },
    },
  });

  const [gradesResult] = useGetGradesQuery();

  const selectedGrade = form.watch("gradeId");
  const [classesResult] = useGetClassesQuery({
    pause: !selectedGrade || selectedGrade === "",
    variables: { filter: { gradeId: selectedGrade } },
  });

  const [assignResult, assignClass] = useAssignClassMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      classId: values.classId,
      staffId: values.staff.id,
    };

    const response = await assignClass(formData);

    const mutationResult = (response.data as AssignClassMutation)?.assignClass;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (mutationResult.__typename === "MutationAssignClassSuccess") {
      toast.success(`Grade ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading = assignResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="gradeId"
            label="Grade"
            disabled={relatedData?.disableAcademicStructure}
          >
            <SelectContent>
              {gradesResult.data?.grades?.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="classId"
            label="Class"
            disabled={relatedData?.disableAcademicStructure}
          >
            <SelectContent>
              {classesResult.data?.classes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <UserSearchForm
            type="staff"
            label="Supervisor"
            name="staff"
            control={form.control}
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

export default ClassAssignmentForm;
