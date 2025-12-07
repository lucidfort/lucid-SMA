"use client";

import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  AccessLevel,
  CreateClassMutation,
  UpdateClassMutation,
  useCreateClassMutation,
  useGetGradesQuery,
  useGetStaffsQuery,
  useUpdateClassMutation,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { classSchema, ClassSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "../InputField";

const ClassForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      gradeId: data?.grade.id ?? "",
      capacity: data?.capacity ?? 0,
      supervisors: data?.supervisors ?? null,
    }
  });

  const [gradesResult] = useGetGradesQuery();
  const [teachersResult] = useGetStaffsQuery({
    variables: { filter: { isActive: true, accessLevel: AccessLevel.Teacher } },
  });
  const [createResult, createClass] = useCreateClassMutation();
  const [updateResult, updateClass] = useUpdateClassMutation();

  const grades = gradesResult?.data?.grades;
  const teachers = teachersResult?.data?.staffs;


  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    const res =
      type === "create"
        ? await createClass({ input: formData })
        : await updateClass({ input: formData });

    const mutationResult =
      type === "create"
        ? (res.data as CreateClassMutation)?.createClass
        : (res.data as UpdateClassMutation)?.updateClass;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateClassSuccess" ||
      mutationResult.__typename === "MutationUpdateClassSuccess"
    ) {
      toast.success(`Class ${type}d successfully!`);
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
        <span className="text-xs font-medium text-gray-500">
          Class Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Grade"
            control={form.control}
            name="gradeId"
            placeholder="Select grade"
            fieldType={FormFieldType.SELECT}
          >
            <SelectContent>
              <SelectItem value="0">
                {gradesResult.fetching
                  ? "Loading"
                  : grades?.length === 0
                    ? "No grade was found"
                    : "Select grade"}
              </SelectItem>
              {grades?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Name"
            name="name"
            placeholder="A B or Gold"
          />

          <InputField
            label="Capacity"
            name="capacity"
            type="number"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            placeholder="100"
          />

          <InputField
            label="Supervisors"
            control={form.control}
            name="supervisors"
            placeholder={
              teachers?.length === 0
                ? "No teacher was found"
                : "Select supervisors"
            }
            fieldType={FormFieldType.MULTI_SELECT}
            options={teachers ?? []}
          />
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {isLoading ? (
            <Loader2 className="animate-spin text-lamaYellow" />
          ) : (
            type
          )}
        </button>
      </form>
    </Form>
  );
};

export default ClassForm;
