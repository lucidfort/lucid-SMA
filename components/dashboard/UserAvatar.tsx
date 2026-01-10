import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/client.utils";

type Props = {
  img?: string | null;
  name: string;
  className?: string;
};

const UserAvatar = ({ img, name, className }: Props) => {
  const formattedName = name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <Avatar
      className={cn(
        "bg-lamaPurple/80 flex size-6 items-center justify-center",
        className,
      )}
    >
      <AvatarImage src={img ?? "/noAvatar.png"} alt={name} />
      <AvatarFallback>{formattedName}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
