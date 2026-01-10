import { getCurrentUser } from "@/lib/utils/server.utils";
import { defaultHome } from "@/lib/settings";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (user.isAuthenticated && user.accessLevel) {
    redirect(defaultHome[user.accessLevel]);
  }

  return <div className="w-full">{children}</div>;
};
export default AuthLayout;
