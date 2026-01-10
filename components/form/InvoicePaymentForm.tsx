"use client";

import { transactionSchema, TransactionSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import UserSearchForm from "./UserSearchForm";
import { Form } from "../ui/form";
import {
  MutationInitiateFeePaymentArgs,
  useGetInvoicesQuery,
  useGetStudentsQuery,
  useInitializeFeePaymentMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "../ui/select";
import { useEffect } from "react";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { RoleAccessLevel } from "@/types";

interface TransactionFormProps {
  accessLevel: RoleAccessLevel;
  invoiceId: string;
  studentId?: string;
}

const InvoicePaymentForm = ({
  accessLevel,
  invoiceId,
  studentId,
}: TransactionFormProps) => {
  const router = useRouter();

  const [invoicesResult] = useGetInvoicesQuery();
  const invoices = invoicesResult.data?.invoices;

  const form = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema(accessLevel)),
    defaultValues: {
      invoiceId: invoiceId ?? "",
      student: studentId ? { id: studentId } : { id: "" },
      email: "",
      amount: 0,
    },
  });

  const [studentsResponse] = useGetStudentsQuery({
    pause: accessLevel !== "parent",
  });

  const [initiateResult, initiateFeePayment] =
    useInitializeFeePaymentMutation();

  const fee = form.watch("invoiceId");
  const amount = form.watch("amount");

  useEffect(() => {
    if (fee && fee.length > 3) {
      const selectedInvoiceAmount = invoices?.find(
        (invoice) => invoice.id === fee,
      )?.amount;

      form.setValue("amount", selectedInvoiceAmount ?? 0);
    }
  }, [fee, form, invoices]);

  const onSubmit = form.handleSubmit(async (values) => {
    const input: MutationInitiateFeePaymentArgs = {
      input: {
        amount: values.amount,
        studentId:
          typeof values.student === "string"
            ? values.student
            : values.student.id,
        invoiceId: values.invoiceId,
        email: values.email,
      },
    };

    const res = await initiateFeePayment({ ...input });

    const mutationResult = res.data?.initiateFeePayment;

    if (mutationResult?.__typename === "MutationInitiateFeePaymentSuccess") {
      toast.success("Payment Initialized");
      router.push(mutationResult.data.authorization_url);
    } else {
      const message = handleGraphqlClientErrors(mutationResult);
      toast.error(message);
    }
  });

  const gradesForSelectedInvoice = invoices
    ?.find((invoice) => invoice.id === fee)
    ?.grades.map((grade) => grade.id);

  const isLoading = initiateResult.fetching;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Invoice"
            name="invoiceId"
          >
            <SelectContent>
              {invoices?.map(({ id, number, title }) => (
                <SelectItem key={id} value={id}>
                  {number} - {title}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            label="Email"
            name="email"
            type="email"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          {accessLevel === "parent" ? (
            <InputField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              label="Student"
              name="student"
            >
              <SelectContent>
                {studentsResponse.data?.students?.map(
                  ({ id, name, surname }) => (
                    <SelectItem key={id} value={id}>
                      {name} {surname}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </InputField>
          ) : (
            <UserSearchForm
              type="student"
              control={form.control}
              name="student"
              label="Student"
              filters={{
                grades: gradesForSelectedInvoice,
              }}
            />
          )}

          <InputField
            label="Amount"
            name="amount"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            disabled
          />
        </div>

        <button
          type="submit"
          className="form-submit_btn mt-5 w-full"
          disabled={isLoading}
        >
          {!isLoading ? `Pay ${amount}` : <Loader2 className="animate-spin" />}
        </button>
      </form>
    </Form>
  );
};

export default InvoicePaymentForm;
