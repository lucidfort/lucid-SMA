import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";

const DropdownOptions = ({
  children,
  triggerClassName,
}: {
  children: ReactNode;
  triggerClassName?: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`${triggerClassName} rounded-full`}>
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="space-y-2">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownOptions;
