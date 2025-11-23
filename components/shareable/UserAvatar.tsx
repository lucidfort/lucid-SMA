import React from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils';

type Props = {
  img?: string | null;
  name: string;
  size?: string
}

const UserAvatar = ({ img, name, size }: Props) => {
  return (
    <Avatar className={cn("size-6", size)}>
      <AvatarImage src={img ?? "./noAvatar.png"} alt={name} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar