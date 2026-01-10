"use server";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { SchoolInput } from "@/lib/generated/graphql/server";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { getCurrentSession } from "@/lib/utils/client.utils";
import {
  SchoolCreateArgs,
  SchoolFindFirstArgs,
  SchoolWhereInput,
} from "@/lib/generated/prisma/models/School";
import { RoleAccessLevel, ServerActions } from "@/types";
import { AppError } from "@/server/graphql/errors";
import { getParentChildrenScope } from "@/server/actions/parent";
import { getStaffScope } from "@/server/actions/staff";

interface UserAuthInput {
  username: string;
  password?: string;
  email?: string;
  name: string;
  surname: string;
  accessLevel: string;
  schoolId: string;
  userClerkId?: string;
  organizationId?: string;
}

interface GetSchoolProps extends ServerActions {
  id: string;
  query: Pick<SchoolFindFirstArgs, "select" | "include">;
}

interface CreateSchoolProps extends ServerActions {
  input: Omit<SchoolInput, "programs" | "grades"> & {
    programs: ("CRECHE" | "NURSERY" | "PRIMARY" | "SECONDARY")[];
    grades: {
      gradeName: string;
      programName: "CRECHE" | "NURSERY" | "PRIMARY" | "SECONDARY";
    }[];
  };
  query?: Pick<SchoolCreateArgs, "select" | "include">;
}

interface ResolveAcademicScope extends ServerActions {
  classId?: string | null;
  gradeId?: string | null;
  studentId?: string | null;
}

export async function getSchoolAction({ id, query, context }: GetSchoolProps) {
  const { accessLevel, userId } = context;
  let where: SchoolWhereInput = {};

  if (accessLevel && userId) {
    switch (accessLevel as RoleAccessLevel) {
      case "parent":
        where = { parents: { some: { clerkUserId: userId } } };
        break;
      case "manager":
        where = { managers: { some: { clerkUserId: userId } } };
        break;
      case "finance":
      case "teacher":
        where = { staffs: { some: { clerkUserId: userId } } };
        break;
      default:
        where = {
          OR: [
            { parents: { some: { clerkUserId: userId } } },
            { staffs: { some: { clerkUserId: userId } } },
          ],
        };
    }
  }

  return await prisma.school.findFirst({
    where: {
      id,
      ...where,
    },
    ...query,
  });
}

export async function createSchoolAction({
  input: { programs, manager, grades, ...input },
  query,
  context,
}: CreateSchoolProps) {
  const client = await clerkClient();
  const { userId } = context;

  const user = await client.users.getUser(userId);

  if (!user || !user?.username || !user.primaryEmailAddressId) {
    throw new AppError(
      "We couldn't find your account. Please try again later",
      "CLERK_USER_NOT_FOUND",
    );
  }

  try {
    const response = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: input,
        ...query,
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

      await tx.manager.create({
        data: {
          schoolId: school.id,
          clerkUserId: user.id,
          username: user.username!,
          email:
            user.emailAddresses.find(
              (email) => email.id === user.primaryEmailAddressId,
            )?.emailAddress || user.emailAddresses[0].emailAddress,
          ...manager,
        },
      });

      return school;
    });

    await client.users.updateUser(userId, {
      firstName: manager.name,
      lastName: manager.surname,
    });

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { schoolId: response.id, accessLevel: "manager" },
    });

    return response;
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function createUserAuth(args: UserAuthInput) {
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

export async function updateUserAuth(args: UserAuthInput) {
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

export async function deleteUserAuth(id: string) {
  const client = await clerkClient();

  return await client.users.deleteUser(id);
}

export async function resolveAcademicScopeAction({
  classId,
  gradeId,
  studentId,
  context,
}: ResolveAcademicScope) {
  const { accessLevel } = context;

  // Managers bypass scope entirely
  if (accessLevel === "manager") {
    return {
      ...(classId && { classIds: [classId] }),
      ...(gradeId && { gradeIds: [gradeId] }),
      ...(studentId && { studentIds: [studentId] }),
    };
  }

  const scope: {
    classIds: string[];
    gradeIds: string[];
    studentIds?: string[];
  } | null =
    accessLevel === "teacher"
      ? await getStaffScope({ context })
      : accessLevel === "parent"
        ? await getParentChildrenScope({ context })
        : null;

  if (!scope) return null;

  if (classId && !scope.classIds.includes(classId)) return null;
  if (gradeId && !scope.gradeIds.includes(gradeId)) return null;
  if (studentId && scope.studentIds && !scope.studentIds.includes(studentId))
    return null;

  return {
    classIds: classId ? [classId] : scope.classIds,
    gradeIds: gradeId ? [gradeId] : scope.gradeIds,
    ...(scope.studentIds && {
      studentIds: studentId ? [studentId] : scope.studentIds,
    }),
  };
}
