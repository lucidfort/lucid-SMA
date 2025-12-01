"use client";

import { Form } from "@/components/ui/form";
import {
  CreatePayrollProfileMutation,
  UpdatePayrollProfileMutation,
  useCreatePayrollProfileMutation,
  useUpdatePayrollProfileMutation
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { PayrollProfileSchema, payrollProfileSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "../InputField";
import UserSearchForm from "../UserSearchForm";

const ClassForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const form = useForm<PayrollProfileSchema>({
    resolver: zodResolver(payrollProfileSchema),
    defaultValues: {
      id: data?.id,
      staff: {
        id: data?.staff.id ?? "",
        name: data?.staff ? `${data.staff.name} ${data.staff.surname}` : ""
      },
      bankName: data?.bankName ?? "",
      accountNumber: data?.accountNumber ?? "",
      accountName: data?.accountName ?? "",
      salary: data?.salary ?? "",
    },
  });

  const [createResult, createPayrollProfile] = useCreatePayrollProfileMutation()
  const [updateResult, updatePayrollProfile] = useUpdatePayrollProfileMutation()

  const onSubmit = form.handleSubmit(async ({ staff, ...values }) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
      staffId: staff.id
    };

    const response =
      type === "create"
        ? await createPayrollProfile({ input: formData })
        : await updatePayrollProfile({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreatePayrollProfileMutation)?.createPayrollProfile
        : (response.data as UpdatePayrollProfileMutation)?.updatePayrollProfile;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreatePayrollProfileSuccess" ||
      mutationResult.__typename === "MutationUpdatePayrollProfileSuccess"
    ) {
      toast.success(`Payroll Profile ${type}d successfully!`);
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
          <UserSearchForm control={form.control} name="staff" label="Staff" type="staff" />

          <InputField control={form.control} fieldType={FormFieldType.INPUT} name="bankName" label="Bank Name" />

          <InputField control={form.control} fieldType={FormFieldType.INPUT} name="accountNumber" label="Account Number" />

          <InputField control={form.control} fieldType={FormFieldType.INPUT} name="accountName" label="Account Name" />

          <InputField control={form.control} fieldType={FormFieldType.INPUT} name="salary" label="Salary" type="number" inputProps={{ step: 1000 }} />
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
