"use server";

import { AcademicYearInput } from "@/lib/generated/graphql/server";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import prisma from "@/lib/prisma";
import {
  AcademicYearFindManyArgs,
  AcademicYearFindUniqueArgs,
  AcademicYearUpdateArgs,
  AcademicYearUpsertArgs,
} from "@/lib/generated/prisma/models/AcademicYear";
import { ServerActions } from "@/types";

interface GetAcademicYearsProps extends ServerActions {
  query?: Pick<AcademicYearFindManyArgs, "select" | "include">;
  take?: number | null | undefined;
}

interface GetAcademicYearProps extends ServerActions {
  query?: Pick<AcademicYearFindUniqueArgs, "select" | "include">;
  id: string;
}

interface UpsertAcademicYearProps extends ServerActions {
  input: AcademicYearInput;
  query?: Pick<AcademicYearUpsertArgs, "select" | "include">;
}

interface ActivateAcademicYearProps extends ServerActions {
  query?: Pick<AcademicYearUpdateArgs, "select" | "include">;
  academicYearId: string;
}

export async function getAcademicYearsAction({
  take,
  query,
  context,
}: GetAcademicYearsProps) {
  const { schoolId } = context;

  return await prisma.academicYear.findMany({
    where: {
      schoolId: schoolId!,
    },
    ...query,
    ...(take && { take: take }),
  });
}

export async function getAcademicYearAction({
  id,
  query,
  context,
}: GetAcademicYearProps) {
  const { schoolId } = context;

  return await prisma.academicYear.findUnique({
    where: {
      id: id,
      schoolId: schoolId!,
    },
    ...query,
  });
}

export async function upsertAcademicYearAction({
  query,
  context,
  input: { id, year, ...input },
}: UpsertAcademicYearProps) {
  const { schoolId } = context;

  try {
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
      ...query,
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function activateAcademicYearAction({
  query,
  academicYearId,
  context,
}: ActivateAcademicYearProps) {
  const { schoolId } = context;

  try {
    return await prisma.$transaction(async (tx) => {
      // Deactivate all academic years
      await tx.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Deactivate all terms
      await tx.term.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Activate the target academic year
      const targetYear = await tx.academicYear.update({
        where: { id: academicYearId, schoolId },
        data: { isCurrent: true },
        ...query,
      });

      // Find the most recently created term in that academic year
      const lastTerm = await tx.term.findFirst({
        where: { schoolId, academicYearId },
        select: { id: true },
        orderBy: { session: "desc" },
      });

      // Activate if it exists
      if (lastTerm) {
        await tx.term.update({
          where: { id: lastTerm.id, schoolId },
          data: { isCurrent: true },
        });
      }

      return targetYear;
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}
