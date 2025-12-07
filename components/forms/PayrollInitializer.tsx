"use client";

import { GeneratePayrollReferenceMutation, InitiatePayrollTransferMutation, useGeneratePayrollReferenceMutation, useInitiatePayrollTransferMutation } from "@/lib/generated/graphql/client";
import { PaymentStatus, PayrollProfile } from "@/lib/generated/prisma/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { FormProps } from "@/types";
import { getMonth, getYear } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TransactionData = PayrollProfile & {
  staff: {
    id: string;
    name: string;
    surname: string;
  }
  transaction?: {
    id: string;
    amount: number;
    status: PaymentStatus
  }
  date: string;
}

const PayrollInitializer = ({ data, setOpen }: FormProps) => {
  const router = useRouter()

  const [generateResult, generateReference] = useGeneratePayrollReferenceMutation()
  const [initiateResult, initiateTransfer] = useInitiatePayrollTransferMutation()

  const { transaction, staff, date, ...profile } = data as TransactionData

  const initializeResultType = generateResult.data?.generatePayrollReference

  const transactionReference = initializeResultType?.__typename === "MutationGeneratePayrollReferenceSuccess" ? initializeResultType.data.id : transaction?.id

  const handleClick = async () => {
    const input = {
      month: getMonth(date),
      year: getYear(date),
      amount: profile.salary,
      profileId: profile.id
    }

    const response = transactionReference ?
      await initiateTransfer({ input: { ...input, reference: transactionReference } })
      : await generateReference({ input })

    const mutationResult =
      transactionReference
        ? (response.data as InitiatePayrollTransferMutation)?.initiatePayrollTransfer
        : (response.data as GeneratePayrollReferenceMutation)?.generatePayrollReference;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationGeneratePayrollReferenceSuccess" ||
      mutationResult.__typename === "MutationInitiatePayrollTransferSuccess"
    ) {
      toast.success(`${transactionReference ? "Payment initiation" : "Transaction reference generation"} is successful!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  }

  const transactionDetails = [
    { label: "Staff", value: `${staff.name} ${staff.surname}` },
    { label: "Salary", value: profile.salary }
  ]

  const isLoading = generateResult.fetching || initiateResult.fetching

  return (
    <div className="space-y-6">
      <div className="flex items-start flex-col gap-3 w-full">
        {transactionDetails.map(item => (
          <div key={item.label} className="flex flex-row items-center gap-3">
            <div>{item.label}:</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="form-submit_btn w-full"
        disabled={isLoading}
        onClick={handleClick}
      >
        {!isLoading ? (transactionReference ? "Complete Payment" : "Initialize") : (
          <Loader2 className="animate-spin text-lamaYellow" />
        )}
      </button>
    </div>
  );
};

export default PayrollInitializer;
