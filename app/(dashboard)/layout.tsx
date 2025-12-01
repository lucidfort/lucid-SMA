import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  GetSchoolQuery,
  GetSchoolQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { GET_SCHOOL } from "@/operations/server/shared";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const { schoolId } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetSchoolQuery, GetSchoolQueryVariables>(
    GET_SCHOOL,
    { id: schoolId || "" },
  );
  const school = data?.school;

  if (!school)
    return {
      title: "Schoolkit",
      description: "Manage your school efficiently with advanced analytics",
    };

  return {
    title: school.name,
    description: school.motto,
    icons: school.logo
      ? [{ url: school.logo, rel: "icon" }]
      : [{ url: "/logo.svg", rel: "icon" }],
    openGraph: {
      title: school.name,
      description: school.motto || "",
      images: school.logo ? [school.logo] : [],
    },
    twitter: {
      card: "summary",
      title: school.name,
      description: school.motto || "",
      images: school.logo ? [school.logo] : [],
    },
  };
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { accessLevel, currentUserId, schoolId } = await getCurrentUser();
  if (!accessLevel || !currentUserId || !schoolId) redirect("/sign-in");

  const cookieStore = await cookies();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetSchoolQuery, GetSchoolQueryVariables>(
    GET_SCHOOL,
    { id: schoolId },
  );

  const school = data?.school;
  if (!school) notFound();

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <main className="flex w-full">
        <Menu accessLevel={accessLevel} school={school!} />

        <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F8FA]">
          <Navbar
            accessLevel={accessLevel}
            userId={currentUserId}
            school={school}
          />

          <div className="flex-1 p-4">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
