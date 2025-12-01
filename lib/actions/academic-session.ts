"use server";

import { AcademicYearInput, TermInput } from "@/lib/generated/graphql/server";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import prisma from "@/lib/prisma";

export async function upsertTermAction(args: TermInput) {
  try {
    const { schoolId } = await getCurrentUser();

    const { id, session, academicYearId, ...input } = args;

    return await prisma.term.upsert({
      where: {
        schoolId_academicYearId_session: {
          schoolId: schoolId!,
          session: parseInt(session!),
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
        session: parseInt(session!),
        academicYearId: academicYearId!,
        ...input,
      },
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function upsertAcademicYearAction(args: AcademicYearInput) {
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
    await handleGraphqlServerErrors(e);
  }
}

export async function updateTermStatusAction({
  termId,
  academicYearId,
  schoolId,
}: {
  termId: string;
  academicYearId: string;
  schoolId: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Deactivate all current terms
      await tx.term.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Get current academic year
      const currentAcademicYear = await tx.academicYear.findFirst({
        where: {
          schoolId,
          isCurrent: true,
        },
        select: { id: true },
      });

      // If the term's academic year is different from the current academic year, update it
      const isDifferentYear = currentAcademicYear?.id !== academicYearId;

      if (isDifferentYear) {
        // Deactivate old academic year
        await tx.academicYear.updateMany({
          where: { schoolId, isCurrent: true },
          data: { isCurrent: false },
        });

        // Activate the new academic year
        await tx.academicYear.update({
          where: { id: academicYearId, schoolId },
          data: { isCurrent: true },
        });
      }

      // Finally, activate the target term
      await tx.term.update({
        where: { id: termId, schoolId },
        data: { isCurrent: true },
      });

      return true;
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}

export async function updateAcademicYearStatusAction({
  academicYearId,
  schoolId,
}: {
  academicYearId: string;
  schoolId: string;
}) {
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
      await tx.academicYear.update({
        where: { id: academicYearId, schoolId },
        data: {
          isCurrent: true,
        },
      });

      // Find the most recently created term in that academic year
      const lastTerm = await tx.term.findFirst({
        where: { schoolId, academicYearId },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });

      // Activate if it exists
      if (lastTerm) {
        await tx.term.update({
          where: { id: lastTerm.id, schoolId },
          data: { isCurrent: true },
        });
      }

      return true;
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}
