"use client";

import { GradeSchema, gradeSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { gradeMap } from "@/constants";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import {
  CreateGradeMutation,
  UpdateGradeMutation,
  useCreateGradeMutation,
  useGetGradesQuery,
  useGetProgramsQuery,
  useUpdateGradeMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const ClassForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const [programsResult] = useGetProgramsQuery();
  const [gradesResult] = useGetGradesQuery();

  const [createResult, createGrade] = useCreateGradeMutation();
  const [updateResult, updateGrade] = useUpdateGradeMutation();

  const form = useForm<GradeSchema>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      programId: data?.programId ?? "",
    },
  });

  const schoolPrograms = programsResult.data?.programs;
  const schoolGrades = gradesResult.data?.grades?.map(({ name }) => name);

  const selectedProgramId = form.watch("programId");

  const selectedProgram = schoolPrograms?.find(
    (program) => program.id === selectedProgramId,
  );

  const gradesForProgram = gradeMap[selectedProgram?.name ?? ""] ?? [];

  const unregisteredGrades = schoolPrograms
    ?.flatMap((program) => gradeMap[program?.name ?? ""])
    ?.filter((grade: string) => !schoolGrades?.includes(grade));

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    const response =
      type === "create"
        ? await createGrade({ input: formData })
        : await updateGrade({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateGradeMutation)?.createGrade
        : (response.data as UpdateGradeMutation)?.updateGrade;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateGradeSuccess" ||
      mutationResult.__typename === "MutationUpdateGradeSuccess"
    ) {
      toast.success(`Grade ${type}d successfully!`);
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
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Program"
            control={form.control}
            name="programId"
            placeholder="Select program"
            fieldType={FormFieldType.SELECT}
            containerClassName={"md:w-1/2"}
          >
            <SelectContent>
              {schoolPrograms?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            label="Grade"
            control={form.control}
            name="name"
            placeholder="Select grade"
            fieldType={FormFieldType.SELECT}
            containerClassName={"md:w-1/2"}
          >
            <SelectContent>
              {gradesForProgram?.map((level) => (
                <SelectItem
                  key={level}
                  value={level!}
                  disabled={!unregisteredGrades?.includes(level!)}
                >
                  {level}
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

export default ClassForm;
