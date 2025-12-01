"use server";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { SchoolInput } from "../generated/graphql/server";
import { handleGraphqlServerErrors } from "../server/utils";
import { getCurrentSession } from "../utils";

interface UserAuthInput {
  username: string;
  password?: string;
  email?: string;
  phone: string;
  name: string;
  surname: string;
  accessLevel: string;
  schoolId: string;
  userClerkId?: string;
  organizationId?: string;
}

interface SchoolInputArgs extends Omit<SchoolInput, "programs"> {
  programs: ("CRECHE" | "NURSERY" | "PRIMARY" | "SECONDARY")[];
}

export async function createSchoolAction(args: SchoolInputArgs) {
  let clerkUserId = "";
  let organizationId = "";

  try {
    const client = await clerkClient();
    const {
      programs,
      grades,
      manager: { password, ...managerArgs },
      ...input
    } = args;

    const user = await createUser({
      ...managerArgs,
      password,
      accessLevel: "manager",
      schoolId: "",
    });

    clerkUserId = user.id;

    const organization = await client.organizations.createOrganization({
      name: input.name,
      slug: input.slug,
      createdBy: user.id,
    });

    organizationId = organization.id;

    const response = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          ...input,
          organizationId: organization.id,
        },
      });

      const createdPrograms = await tx.program.createManyAndReturn({
        data: programs.map((program) => ({
          name: program,
          schoolId: school.id,
        })),
      });

      const programMap = Object.fromEntries(
        createdPrograms.map((program) => [program.name, program.id]),
      );

      await tx.grade.createMany({
        data: grades.map((g) => ({
          name: g.gradeName,
          programId: programMap[g.programName],
          schoolId: school.id,
        })),
      });

      await tx.manager.create({
        data: { ...managerArgs, schoolId: school.id, clerkUserId: user.id },
      });

      const session = getCurrentSession();

      await tx.academicYear.create({
        data: {
          schoolId: school.id,
          year: session.academicYear,
          startDate: session.academicYearStartDate,
          isCurrent: true,
          terms: {
            create: {
              session: parseInt(session.currentTerm),
              startDate: session.termStartDate,
              isCurrent: true,
              schoolId: school.id,
            },
          },
        },
      });

      return school;
    });

    await client.users.updateUserMetadata(user.id, {
      publicMetadata: { schoolId: response.id },
    });

    return response;
  } catch (e) {
    if (clerkUserId && clerkUserId !== "") {
      await deleteUserAuthInfo(clerkUserId);
    }

    if (organizationId && organizationId !== "") {
      await deleteOrganization(organizationId);
    }

    return await handleGraphqlServerErrors(e);
  }
}

export async function createUser(args: UserAuthInput) {
  const client = await clerkClient();

  const {
    accessLevel,
    schoolId,
    name,
    surname,
    email,
    username,
    password,
    organizationId,
  } = args;

  const user = await client.users.createUser({
    username,
    password,
    firstName: name,
    lastName: surname,
    ...(email && { emailAddress: [email] }),
    publicMetadata: { accessLevel, schoolId },
  });

  if (email && organizationId) {
    await client.organizations.createOrganizationMembership({
      organizationId,
      userId: user.id,
      role: `org:${accessLevel}`,
    });
  }

  return user;
}

export async function updateUser(args: UserAuthInput) {
  const client = await clerkClient();

  const {
    accessLevel,
    schoolId,
    name,
    surname,
    username,
    password,
    userClerkId,
  } = args;

  if (!userClerkId) {
    throw new Error("User Clerk ID is required for updating user");
  }

  return await client.users.updateUser(userClerkId, {
    username,
    password,
    firstName: name,
    lastName: surname,
    publicMetadata: { accessLevel, schoolId },
  });
}

export async function deleteUserAuthInfo(id: string) {
  const client = await clerkClient();

  return await client.users.deleteUser(id);
}

export async function deleteOrganization(id: string) {
  const client = await clerkClient();

  return await client.organizations.deleteOrganization(id);
}
