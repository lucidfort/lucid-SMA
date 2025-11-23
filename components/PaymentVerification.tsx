"use client"

import { RoleAccessLevel } from "@/types"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { format } from "date-fns"
import { useVerifyPaymentStatusMutation } from "@/lib/generated/graphql/client"
import { handleGraphqlClientErrors } from "@/lib/utils"
import { toast } from "sonner"

const PaymentVerification = ({ reference, userRole }: { reference: string; userRole: RoleAccessLevel }) => {
    const router = useRouter()

    const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed" | null>(null)
    const [open, setOpen] = useState(false)
    const hasRunRef = useRef(false)

    const [verificationResult, verifyPayment] = useVerifyPaymentStatusMutation()

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (hasRunRef.current) return;

        if (reference) {
            hasRunRef.current = true
            setOpen(true)
            handleVerification()
        }
    }, [reference])

    const handleVerification = async () => {
        try {
            const response = await verifyPayment({ reference })
            const mutationResult = response.data?.verifyPaymentStatus

            if (mutationResult?.__typename === "MutationVerifyPaymentStatusSuccess") {
                setVerificationStatus("success")
            } else {
                setVerificationStatus("failed")
            }
        } catch (error) {
            console.error("Verification error:", error)

            const message = handleGraphqlClientErrors(error)
            toast.error(message)

            setVerificationStatus("failed")
        }
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)

        if (!open) {
            setVerificationStatus(null)
            router.replace(userRole === "manager"
                ? '/list/transactions'
                : '/list/fees',
                { scroll: false }
            )
        }
    }

    const transactionData = verificationResult.data?.verifyPaymentStatus?.__typename === "MutationVerifyPaymentStatusSuccess" ? verificationResult.data.verifyPaymentStatus.data : null

    const transactionDetails = [
        {
            label: 'Reference',
            value: transactionData?.reference
        },
        {
            label: 'Amount',
            value: `₦${(transactionData?.amountPaid || 0)}`
        },
        {
            label: 'Email',
            value: transactionData?.payerEmail
        },
        {
            label: 'Student',
            value: transactionData?.students.map(student => `${student.name} ${student.surname}`).join(", ")
        },
        {
            label: 'Date',
            value: transactionData?.paidAt
                ? format(new Date(transactionData.paidAt), "MMMM d, yyyy - h:mm: a")
                : ""
        }
    ]

    if (reference) {
        return (
            <Dialog open={open} onOpenChange={(open) => handleOpenChange(open)}>
                <DialogContent className="max-h-[90vh] sm:w-[75vw] lg:w-[45vw]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>
                            Payment Verification
                        </DialogTitle>
                    </DialogHeader>
                    {verificationStatus === "loading" && (
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                            <h3 className="text-lg font-semibold">Verifying Payment...</h3>
                            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
                        </div>
                    )}

                    {verificationStatus === "success" && (
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                            <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                            <p className="text-muted-foreground">Your payment has been processed successfully</p>

                            {transactionData && (
                                <div className="bg-green-50 p-4 rounded-lg space-y-2 text-left">
                                    {transactionDetails.map(item => (
                                        <div key={item.label} className="flex gap-4 items-center">
                                            <strong className="min-w-20">{item.label}:</strong>
                                            <p>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {verificationStatus === "failed" && (
                        <div className="text-center space-y-4">
                            <XCircle className="h-12 w-12 mx-auto text-red-600" />
                            <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
                            <p className="text-muted-foreground">
                                We couldn&apos;t verify your payment. Please try again or contact support.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        )
    }
}

export default PaymentVerification