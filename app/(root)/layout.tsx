import { getCurrentUser } from "@/lib/server/utils";
import { defaultHome } from "@/lib/settings";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  const { currentUserId, accessLevel } = await getCurrentUser();

  if (currentUserId && accessLevel) redirect(defaultHome[accessLevel])

  return (
    <div className="w-full">
      {children}
    </div>
  );
};
export default Layout;
