"use client";

import {
  useDeactivateStaffMutation,
  DeactivateStaffMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type User = "staff";

interface Props {
  type: User;
  userId: string;
  clerkUserId?: string;
  activate: boolean;
}

const RESULT_CONFIG = {
  staff: {
    label: "Exam",
    useMutation: useDeactivateStaffMutation,
    successTypenames: ["MutationDeactivateStaffSuccess"],
  },
} satisfies Record<
  User,
  {
    label: string;
    useMutation: any;
    successTypenames: readonly string[];
  }
>;

const DeactivateUserDialog = ({
  type,
  userId,
  clerkUserId,
  activate,
}: Props) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const config = RESULT_CONFIG[type];

  const [updateState, updateStatus] = config.useMutation();

  const handleClick = async () => {
    const response = await updateStatus({
      staffId: userId,
      clerkUserId,
      activate,
    });

    const mutationResult = response.data?.deactivateStaff;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (config.successTypenames.includes(mutationResult?.__typename)) {
      toast.success(
        `${type} ${activate ? "deactivated" : "activated"} successfully!`,
      );
      setOpen(false);
      router.refresh();
    } else {
      toast.error(
        handleGraphqlClientErrors(mutationResult) ?? "Something went wrong",
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => setOpen(value)}>
      <AlertDialogTrigger>{`${activate ? "Deactivate" : "Activate"} ${type}`}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeactivateUserDialog;
