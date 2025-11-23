"use server";

import { AppError, UniqueConstraintError } from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { TermSchema } from "@/lib/validation";
import { CreateSchoolInput, UserAuthInput } from "@/types";
import { clerkClient } from "@clerk/nextjs/server";

export async function createSchoolAction(args: CreateSchoolInput) {
  try {
    const client = await clerkClient();
    const {
      programs,
      grades,
      manager: { password, ...managerArgs },
      ...input
    } = args;

    const user = await createUser({
      username: managerArgs.username,
      password,
      firstName: managerArgs.name,
      lastName: managerArgs.surname,
      accessLevel: "manager",
      schoolId: "",
    });

    return await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          ...input,
        },
      });

      const createdPrograms = await Promise.all(
        programs.map((program) =>
          tx.program.create({
            data: {
              name: program,
              schoolId: school.id,
            },
          }),
        ),
      );

      const programMap = Object.fromEntries(
        createdPrograms.map((program) => [program.name, program.id]),
      );

      const gradeInserts = grades.map((g) => ({
        name: g.gradeName,
        programId: programMap[g.programName],
        schoolId: school.id,
      }));

      await tx.grade.createMany({ data: gradeInserts });

      await tx.manager.create({
        data: { ...managerArgs, schoolId: school.id, clerkUserId: user.id },
      });

      await client.users
        .updateUserMetadata(user.id, {
          publicMetadata: { schoolId: school.id },
        })
        .catch((err) => {
          throw new Error(err?.message || "Failed to update user metadata");
        });

      return school;
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
    console.log(e);
  }
}

export async function createTermAction(args: Omit<TermSchema, "year">) {
  try {
    const { schoolId } = await getCurrentUser();

    const { id, term, academicYearId, ...input } = args;

    return await prisma.term.upsert({
      where: {
        schoolId_academicYearId_term: {
          schoolId: schoolId!,
          term: parseInt(term!),
          academicYearId: academicYearId!,
        },
        id: id!,
      },
      update: {
        ...input,
        academicYearId: academicYearId!,
      },
      create: {
        schoolId: schoolId!,
        term: parseInt(term!),
        academicYearId: academicYearId!,
        ...input,
      },
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
  }
}

export async function createAcademicYearAction(
  args: Omit<TermSchema, "term" | "academicYearId">,
) {
  try {
    const { schoolId } = await getCurrentUser();

    const { id, year, ...input } = args;

    return await prisma.academicYear.upsert({
      where: {
        schoolId_year: {
          schoolId: schoolId!,
          year: year!,
        },
        id: id!,
      },
      update: {
        ...input,
        year: year!,
      },
      create: {
        schoolId: schoolId!,
        ...input,
        year: year!,
      },
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
  }
}

export async function createUser(args: UserAuthInput) {
  const client = await clerkClient();

  const { accessLevel, schoolId, ...input } = args;

  return await client.users
    .createUser({
      ...input,
      publicMetadata: { accessLevel, schoolId },
    })
    .catch((error) => {
      if (error?.code !== "P2002") {
        throw new AppError(error.message || "Failed to create user", "");
      } else {
        const target = error?.meta?.target;
        const meta = target[target.length - 1];

        throw new UniqueConstraintError(meta);
      }
    });
}

export async function updateUser(args: UserAuthInput & { clerkId: string }) {
  const client = await clerkClient();

  const { accessLevel, schoolId, clerkId, ...input } = args;

  return await client.users
    .updateUser(clerkId, {
      ...input,
      publicMetadata: { accessLevel, schoolId },
    })
    .catch((error) => {
      if (error?.code !== "P2002") {
        throw new AppError(error.message || "Failed to create user", "");
      } else {
        const target = error?.meta?.target;
        const meta = target[target.length - 1];

        throw new UniqueConstraintError(meta);
      }
    });
}

export async function deleteUserAuthInfo(clerkId: string) {
  const client = await clerkClient();

  return await client.users.deleteUser(clerkId);
}
