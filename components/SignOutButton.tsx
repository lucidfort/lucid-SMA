"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const SignOutButton = () => {
  const { signOut } = useClerk();

  return (
    <SidebarMenuButton
      className="group ml-0.5 flex w-full items-center gap-4 hover:bg-transparent"
      onClick={() => signOut({ redirectUrl: "/auth/sign-in" })}
    >
      <div className="transform duration-300 ease-in-out group-hover:translate-x-1">
        <LogOut size={21} color="#4a5565" />
      </div>
      <span>Sign Out</span>
    </SidebarMenuButton>
  );
};

export default SignOutButton;
