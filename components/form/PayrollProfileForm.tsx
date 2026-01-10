"use client";

import { Form } from "@/components/ui/form";
import {
  CreatePayrollProfileMutation,
  UpdatePayrollProfileMutation,
  useCreatePayrollProfileMutation,
  useGetStaffsQuery,
  useGetStandardBanksQuery,
  useResolveRecipientAccountQuery,
  useUpdatePayrollProfileMutation,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { PayrollProfileSchema, payrollProfileSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "./ui/InputField";
import UserSearchForm from "./UserSearchForm";
import { useEffect, useMemo } from "react";

const PayrollProfileForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<PayrollProfileSchema>({
    resolver: zodResolver(payrollProfileSchema),
    defaultValues: {
      id: data?.id,
      staffId: data?.staff.id ?? "",
      bankCode: data?.bankCode ?? "",
      accountNumber: data?.accountNumber ?? "",
      accountName: data?.accountName ?? "",
      salary: data?.salary ?? 0,
    },
  });

  const [staffsResult] = useGetStaffsQuery({
    variables: { filter: { isActive: true } },
  });

  const [banksResult] = useGetStandardBanksQuery();

  const staffs = useMemo(
    () =>
      (staffsResult.data?.staffs || []).map((s) => ({
        id: s.id,
        name: `${s.name} ${s.surname} - ${s.employeeId}`,
      })),
    [staffsResult.data],
  );

  const banks = useMemo(
    () =>
      (banksResult.data?.standardBanks || []).map((b) => ({
        id: b.code,
        name: b.name,
      })),
    [banksResult.data],
  );

  const bankCode = useWatch({ control: form.control, name: "bankCode" });
  const accountNumber = useWatch({
    control: form.control,
    name: "accountNumber",
  });

  const [resolveRecipientState, resolveRecipientAccount] =
    useResolveRecipientAccountQuery({
      pause: true,
      variables: { accountNumber, bankCode },
    });

  useEffect(() => {
    if (!accountNumber || accountNumber.length < 10 || !bankCode) return;

    const handler = setTimeout(() => {
      resolveRecipientAccount();
    }, 400);

    return () => clearTimeout(handler);
  }, [bankCode, accountNumber]);

  useEffect(() => {
    if (!resolveRecipientState.data) return;

    const account = resolveRecipientState.data.resolveRecipientAccount;
    if (account?.__typename === "QueryResolveRecipientAccountSuccess") {
      if (form.getValues("accountName") !== account.data) {
        form.setValue("accountName", account.data);
      }
    }
  }, [resolveRecipientState.data, form]);

  const [createResult, createPayrollProfile] =
    useCreatePayrollProfileMutation();
  const [updateResult, updatePayrollProfile] =
    useUpdatePayrollProfileMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && {
        id: data.id,
      }),
      accountNumber: values.accountNumber,
      salary: values.salary,
      staffId: values.staffId,
      bankCode: values.bankCode,
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
          <InputField
            control={form.control}
            fieldType={FormFieldType.COMBOBOX}
            name="staffId"
            label="Staff"
            options={staffs}
            placeholder={"Select Staff"}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.COMBOBOX}
            name="bankCode"
            label="Bank"
            options={banks}
            disabled={type === "update"}
            placeholder={"Select Bank"}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="accountNumber"
            label="Account Number"
            disabled={type === "update"}
            inputProps={{ min: 10, max: 10 }}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="accountName"
            label="Account Name"
            disabled
            placeholder={
              resolveRecipientState.fetching ? "Getting account info..." : ""
            }
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="salary"
            label="Salary"
            type="number"
            inputProps={{ step: 1000 }}
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

export default PayrollProfileForm;
