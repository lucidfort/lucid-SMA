import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, Megaphone } from "lucide-react";
import { ReactNode } from "react";

type MessageBoardProps = {
  type: "announcement" | "event";
  title: string;
  description: string;
  date: string;
  trigger: ReactNode
};

const MessageBoard = ({
  type,
  title,
  description,
  date,
  trigger
}: MessageBoardProps) => {
  const icon =
    type === "announcement" ? (
      <Megaphone className="h-8 w-8 text-indigo-500" />
    ) : (
      <Calendar className="h-8 w-8 text-green-500" />
    );

  return (
    <Dialog>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl bg-gradient-to-b from-white to-gray-200 shadow-xl">
        <DialogHeader className="flex flex-col gap-2">
          {icon}

          <div className="flex-center flex-col gap-1">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <p className="text-sm text-gray-600">
              {format(new Date(date), "dd/MM/yyyy - hh:mm a")}
            </p>
          </div>
        </DialogHeader>

        <DialogDescription className="mt-4 text-base text-gray-900">
          {description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default MessageBoard;
