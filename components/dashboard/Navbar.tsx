"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import ThemeSwitch from "@/components/ThemeSwitch";
import { UserAvatar } from "@clerk/clerk-react";

interface NavbarProps {
  school: {
    id: string;
    name: string;
    logo?: string | null;
    recentAnnouncementsCount: number;
  };
}

const Navbar = ({ school }: NavbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 xl:py-10">
      <Image
        src={school.logo || "/logo.webp"}
        alt="Logo"
        width={100}
        height={100}
        loading="eager"
        className="h-20 w-20 rounded-full object-center sm:h-20 sm:w-20 md:hidden"
      />

      <div className="flex w-full items-center justify-end gap-4">
        <div className="navbar-user_icons">
          <Image src="/message.svg" alt="message" width={20} height={20} />
        </div>
        <div className="navbar-user_icons relative">
          <Image src="/announcement.svg" alt="message" width={20} height={20} />
          {school.recentAnnouncementsCount > 0 && (
            <div className="flex-center absolute -top-3 -right-3 h-5 w-5 rounded-full bg-purple-500 text-xs text-white">
              {school.recentAnnouncementsCount}
            </div>
          )}
        </div>

        <ThemeSwitch />

        <UserAvatar />

        <SidebarTrigger />
      </div>
    </div>
  );
};

export default Navbar;
