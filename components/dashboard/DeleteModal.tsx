"use client";

import { Table } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  useDeleteEntityMutation,
  Table as TableEnum,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";

type DeleteModalProps = {
  id: string;
  table: Table;
  triggerTitle?: string;
  children?: ReactNode;
};

const DeleteModal = ({
  id,
  table,
  triggerTitle,
  children,
}: DeleteModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deletionResult, deleteEntity] = useDeleteEntityMutation();

  const handleDelete = async () => {
    setError(null);

    const formattedTable = table.replace("-", "_");

    const response = await deleteEntity({
      id,
      table: formattedTable.toUpperCase() as TableEnum,
    });

    const mutationResult = response.data?.deleteEntity;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (mutationResult.__typename === "MutationDeleteEntitySuccess") {
      toast.success(`${table} deleted successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      setError(error ?? "Something went wrong");
    }
  };

  const isDeleting = deletionResult.fetching;

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger className="w-full cursor-pointer text-left">
        {children}

        {triggerTitle && (
          <span className="text-destructive px-2 py-1 text-sm font-medium">
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
