import React from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils';

type Props = {
  img?: string | null;
  name: string;
  className?: string
}

const UserAvatar = ({ img, name, className }: Props) => {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarImage src={img ?? "./noAvatar.png"} alt={name} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar