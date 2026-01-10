import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { defaultHome } from "@/lib/settings";

const MenuSidebar = async () => {
  const { isAuthenticated: isLoggedIn, accessLevel } = await getCurrentUser();

  const isAuthenticated = isLoggedIn && !!accessLevel;

  return (
    <div className="flex items-center justify-between p-4">
      <Image
        src="/logo.webp"
        alt="Logo"
        width={100}
        height={100}
        className="w-24 rounded-full object-center"
      />

      <div className="flex w-full items-center justify-end gap-4">
        <Link
          href={isAuthenticated ? defaultHome[accessLevel] : "/auth/sign-in"}
        >
          {isAuthenticated ? "Dashboard" : "Sign in"}
        </Link>
      </div>
    </div>
  );
};

export default MenuSidebar;
