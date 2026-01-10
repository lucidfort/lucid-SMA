import Menu from "@/components/dashboard/Menu";
import Navbar from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  GetSchoolQuery,
  GetSchoolQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";
import { gql } from "@urql/core";

const GET_SCHOOL = gql(`
  query GetSchool($id: ID!) {
    school(id: $id) {
      id
      slug
      name
      logo
      motto
      currentTerm {
        id
      }
      recentAnnouncementsCount
    }
  }
`);

export async function generateMetadata(): Promise<Metadata> {
  const { isAuthenticated, schoolId } = await getCurrentUser();

  if (!isAuthenticated || !schoolId) {
    return {
      title: "Eduvia",
      description: "Manage your school efficiently with advanced analytics",
    };
  }

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetSchoolQuery, GetSchoolQueryVariables>(
    GET_SCHOOL,
    { id: schoolId },
  );

  const school = data?.school;

  if (!school) {
    return {
      title: "Eduvia",
      description: "Manage your school efficiently with advanced analytics",
    };
  }

  return {
    title: school.name,
    description: school.motto,
    icons: school.logo ? [{ url: school.logo, rel: "icon" }] : [],
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
  const { isAuthenticated, accessLevel, schoolId } = await getCurrentUser();

  if (!isAuthenticated || !schoolId) redirect("/auth/sign-in");

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
        <Menu accessLevel={accessLevel!} school={school!} />

        <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F8FA]">
          <Navbar school={school} />

          <div className="flex-1 p-4">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
