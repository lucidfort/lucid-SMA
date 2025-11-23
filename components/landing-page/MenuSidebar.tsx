import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server/utils";
import { defaultHome } from "@/lib/settings";
import { Separator } from "@/components/ui/separator";

const MenuSidebar = async () => {
  const { currentUserId, accessLevel } = await getCurrentUser();

  return (
    <div className="flex items-center justify-between p-4">
      <Image
        src={"/logo.svg"}
        alt="Logo"
        width={100}
        height={100}
        className="h-14 w-14 rounded-full object-center"
      />

      <div className="flex w-full items-center justify-end gap-4">
        <Link href="/">Developers</Link>

        <Separator orientation="vertical" className="bg-black" />

        <Link
          href={
            currentUserId && accessLevel ? defaultHome[accessLevel] : "/sign-in"
          }
        >
          {currentUserId ? "Dashboard" : "Sign in"}
        </Link>
      </div>
    </div>
  );
};

export default MenuSidebar;
