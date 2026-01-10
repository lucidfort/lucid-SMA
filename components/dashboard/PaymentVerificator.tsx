"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { format } from "date-fns";
import { useVerifyPaymentStatusMutation } from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";

type VerificationMode = "auto" | "manual";

interface Props {
  reference: string;
  mode?: VerificationMode;
  trigger?: ReactNode;
}

const PaymentVerificator = ({ reference, mode, trigger }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "failed" | null
  >(null);
  const [open, setOpen] = useState(false);

  const [verifyPaymentState, verifyPayment] = useVerifyPaymentStatusMutation();

  useEffect(() => {
    if (mode !== "auto") return;
    if (!reference) return;

    startVerification();
  }, [mode, reference]);

  const startVerification = async () => {
    if (!reference) return;

    setOpen(true);
    setVerificationStatus("loading");

    const response = await verifyPayment({ reference });
    const result = response.data?.verifyPaymentStatus;

    if (result?.__typename === "MutationVerifyPaymentStatusSuccess") {
      setVerificationStatus("success");
    } else {
      setVerificationStatus("failed");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setVerificationStatus(null);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("reference");
      params.delete("trxref");

      const newUrl =
        params.toString().length > 0
          ? `${pathname}?${params.toString()}`
          : pathname;

      router.replace(newUrl, { scroll: false });
    }
  };

  const transactionData =
    verifyPaymentState.data?.verifyPaymentStatus?.__typename ===
    "MutationVerifyPaymentStatusSuccess"
      ? verifyPaymentState.data.verifyPaymentStatus.data
      : null;

  const transactionDetails = [
    {
      label: "Reference",
      value: transactionData?.reference,
    },
    {
      label: "Amount",
      value: `₦${transactionData?.amountPaid || 0}`,
    },
    {
      label: "Email",
      value: transactionData?.payerEmail,
    },
    {
      label: "Student",
      value: transactionData?.students
        .map((student) => `${student.name} ${student.surname}`)
        .join(", "),
    },
    {
      label: "Date",
      value: transactionData?.paidAt
        ? format(new Date(transactionData.paidAt), "MMMM d, yyyy - h:mm: a")
        : "",
    },
  ];

  if (reference) {
    return (
      <Dialog open={open} onOpenChange={(open) => handleOpenChange(open)}>
        {mode === "manual" && trigger && (
          <DialogTrigger asChild onClick={startVerification} className="w-full">
            {trigger}
          </DialogTrigger>
        )}

        <DialogContent className="max-h-[90vh] sm:w-[75vw] lg:w-[45vw]">
          <DialogHeader className="sr-only">
            <DialogTitle>Payment Verification</DialogTitle>
          </DialogHeader>
          {verificationStatus === "loading" && (
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <h3 className="text-lg font-semibold">Verifying Payment...</h3>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment
              </p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="text-lg font-semibold text-green-600">
                Payment Successful!
              </h3>
              <p className="text-muted-foreground">
                Your payment has been processed successfully
              </p>

              {transactionData && (
                <div className="space-y-2 rounded-lg bg-green-50 p-4 text-left">
                  {transactionDetails.map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <strong className="min-w-20">{item.label}:</strong>
                      <p>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {verificationStatus === "failed" && (
            <div className="space-y-4 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">
                Verification Failed
              </h3>
              <p className="text-muted-foreground">
                {handleGraphqlClientErrors(verifyPaymentState.data)}
              </p>
              <p className="text-muted-foreground">
                We couldn&apos;t process your payment. Please try again or
                contact support.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
};

export default PaymentVerificator;
