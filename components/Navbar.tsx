import { SidebarTrigger } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";
import { RoleAccessLevel } from "@/types";
import Image from "next/image";
import { Suspense } from "react";
import Notifications from "./Notifications";
import { Skeleton } from "./ui/skeleton";
import { School } from "@/lib/generated/graphql/server";

type SchoolDetails = Pick<School, "name" | "motto" | "slug" | "id" | "logo">;

const Navbar = async ({
  accessLevel,
  userId,
  school,
}: {
  accessLevel: RoleAccessLevel;
  userId: string;
  school: SchoolDetails;
}) => {
  const delegates: Record<string, any> = {
    finance: prisma.staff,
    academics: prisma.staff,
    teacher: prisma.staff,
    administration: prisma.staff,
    student: prisma.student,
    parent: prisma.parent,
    manager: prisma.manager,
  };

  const user = await delegates[accessLevel!].findUnique({
    where: {
      id: userId,
      schoolId: school.id,
    },
    select: {
      name: true,
      surname: true,
    },
  });

  return (
    <div className="flex items-center justify-between p-4">
      <Image
        src={school.logo || "/logo.svg"}
        alt="Logo"
        width={100}
        height={100}
        className="h-14 w-14 rounded-full object-center sm:h-20 sm:w-20 md:hidden"
      />

      <div className="flex w-full items-center justify-end gap-4">
        <div className="navbar-user_icons">
          <Image src="/message.svg" alt="message" width={20} height={20} />
        </div>
        <div className="navbar-user_icons relative">
          <Image src="/announcement.svg" alt="message" width={20} height={20} />
          <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
            <Notifications schoolId={school.id} />
          </Suspense>
        </div>

        <div className="flex-center h-9 w-9 rounded-full bg-lamaPurple p-0.5">
          {user?.name[0]}
          {user?.surname[0]}
        </div>

        <SidebarTrigger />
      </div>
    </div>
  );
};

export default Navbar;
