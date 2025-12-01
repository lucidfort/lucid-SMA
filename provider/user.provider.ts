"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserStore } from "@/stores/user.store";
import { RoleAccessLevel } from "@/types";
import { useGetSchoolSlugQuery } from "@/lib/generated/graphql/client";

export const UserProvider = () => {
  const { user, isLoaded } = useUser();
  const { setUser, setLoaded } = useUserStore();
  const [result, retryQuery] = useGetSchoolSlugQuery({
    pause: true,
    variables: { id: (user?.publicMetadata?.schoolId as string) ?? "" },
  });

  useEffect(() => {
    if (isLoaded && user) {
      const currentUser = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        accessLevel: user?.publicMetadata.accessLevel as RoleAccessLevel,
        schoolId: user?.publicMetadata.schoolId as string,
        schoolSlug: "",
      };

      retryQuery();

      currentUser.schoolSlug = result.data?.school?.slug ?? "";

      setUser(currentUser);
      setLoaded(true);
    }
  }, [user, isLoaded]);

  return null;
};
