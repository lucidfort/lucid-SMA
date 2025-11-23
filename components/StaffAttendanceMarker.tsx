"use client"

import { useMarkStaffAttendanceMutation } from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Form } from "./ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField, { FormFieldType } from "./InputField";

interface StaffAttendanceMarkerProps {
    type: "check-in" | "absent";
    date: Date;
    staffId: string;
}

const schema = (type: "check-in" | "absent") => z.object({
    reasonForAbsence: type === "absent" ? z.string().min(1, "What's the reason for absence?") : z.string().optional().nullable()
})

type AttendanceSchema = z.infer<ReturnType<typeof schema>>

const StaffAttendanceMarker = ({ type, date, staffId }: StaffAttendanceMarkerProps) => {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const form = useForm<AttendanceSchema>({
        resolver: zodResolver(schema(type)),
        defaultValues: {
            reasonForAbsence: type === "check-in" ? null : ""
        }
    })

    const [mutationResult, markAttendance] = useMarkStaffAttendanceMutation()

    const handleSubmit = form.handleSubmit(async (values) => {
        const res = await markAttendance({
            input: {
                date,
                staffId,
                ...(type === "check-in"
                    ? { clockInTime: new Date() }
                    : { reasonForAbsence: values.reasonForAbsence }
                )
            }
        })

        const mutationResult = res.data?.markStaffAttendance

        if (mutationResult?.__typename === "MutationMarkStaffAttendanceSuccess") {
            toast.success("Saved ✔");
            setOpen(false);
            router.refresh();
        } else {
            const error = handleGraphqlClientErrors(mutationResult);
            toast.error(error ?? "Something went wrong");
        }

    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button
                    className="flex cursor-pointer items-center gap-1 px-2 text-sm font-normal capitalize"
                    aria-describedby={type}
                    onClick={() => type === "check-in" ? handleSubmit() : setOpen(true)}
                >
                    {type === "check-in" ? "Check In" : "Excuse Absence"}
                </button>
            </AlertDialogTrigger>

            {type === "absent" && (
                <AlertDialogContent className="custom-scrollbar max-h-[90vh] overflow-y-scroll sm:max-w-3xl">
                    <AlertDialogCancel className="absolute top-5 right-5 h-8 w-8 rounded-full">
                        <X />
                    </AlertDialogCancel>

                    <AlertDialogHeader>
                        <AlertDialogTitle className="capitalize">
                            Excuse Form
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <Form {...form}>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <InputField fieldType={FormFieldType.INPUT} control={form.control} name="reasonForAbsence" label="Reason For Absence" />

                            <button
                                type="submit"
                                disabled={!form.formState.isDirty || mutationResult.fetching}
                                className="form-submit_btn"
                            >
                                {!mutationResult.fetching ? (
                                    "Excuse"
                                ) : (
                                    <Loader2 className="animate-spin text-lamaYellow" />
                                )}
                            </button>
                        </form>
                    </Form>
                </AlertDialogContent>
            )}
        </AlertDialog>
    )
}

export default StaffAttendanceMarker