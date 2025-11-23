"use client";

import { transactionSchema, TransactionSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import UserSearchForm from "../UserSearchForm";
import { Form } from "../ui/form";
import {
  MutationInitiateFeePaymentArgs,
  useGetInvoicesQuery,
  useInitializeFeePaymentMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "../ui/select";
import { useEffect } from "react";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

interface TransactionFormProps {
  invoiceId: string;
  studentId?: string;
}

const TransactionForm = ({ invoiceId, studentId }: TransactionFormProps) => {
  const router = useRouter();

  const [invoicesResult] = useGetInvoicesQuery({
    variables: { filter: { invoiceId: invoiceId } },
  });
  const invoices = invoicesResult.data?.invoices;

  const form = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      invoiceId,
      student: { id: studentId },
      amount: 0,
    },
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
        studentId: values.student.id,
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

          <UserSearchForm
            type="student"
            control={form.control}
            name="student"
            label="Student"
            grades={gradesForSelectedInvoice}
          />

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

export default TransactionForm;
