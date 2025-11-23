"use client";

import {
  deleteAnnouncementAction,
  deleteAssignmentAction,
  deleteClassAction,
  deleteEventAction,
  deleteExamAction,
  deleteInvoiceAction,
  deleteGradeAction,
  deleteClubAction,
  deleteParentAction,
  deleteResultAction,
  deleteStaffAction,
  deleteStudentAction,
  deleteSubjectAction,
  deleteProgramAction,
} from "@/lib/actions";
import { Table } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type DeleteModalProps = {
  id: string;
  table: Table;
  triggerTitle?: string;
  children?: ReactNode;
};

const deleteActionMap = {
  subject: deleteSubjectAction,
  grade: deleteGradeAction,
  class: deleteClassAction,
  staff: deleteStaffAction,
  student: deleteStudentAction,
  exam: deleteExamAction,
  assignment: deleteAssignmentAction,
  club: deleteClubAction,
  parent: deleteParentAction,
  result: deleteResultAction,
  event: deleteEventAction,
  announcement: deleteAnnouncementAction,
  attendance: deleteSubjectAction,
  invoice: deleteInvoiceAction,
  program: deleteProgramAction,
  // TRANSACTION DOESN'T HAVE A DELETE ACTION SINCE YOU SHOULDN'T DELETE A TRANSACTION HISTORY. THIS IS JUST TO AVOID TYPESCRIPT ERRORS, IT WON'T DO ANYTHING
  transaction: deleteInvoiceAction,
  timetable: deleteInvoiceAction,
  term: deleteInvoiceAction,
  "academic-year": deleteInvoiceAction,
};

const DeleteModal = ({
  id,
  table,
  triggerTitle,
  children,
}: DeleteModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteActionMap[table](id.toString());

      if (result?.success) {
        toast.success(`${table} deleted successfully.`);
        router.refresh();

        setOpen(false);
      } else {
        setError(
          typeof result?.error == "string"
            ? result?.error
            : `Failed to delete ${table}`,
        );
      }
    } catch {
      setError("An unexpected error occurred.");
      toast.error(`An unexpected error occurred.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger>
        {children}

        {triggerTitle && (
          <span className="px-2 py-1 text-sm font-medium text-destructive">
            {triggerTitle}
          </span>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this{" "}
            {table} and remove all data from the servers.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {error && (
            <div className="text-center text-sm text-red-500">{error}</div>
          )}

          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="cursor-pointer bg-red-400 font-medium text-black hover:bg-red-500/75"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
