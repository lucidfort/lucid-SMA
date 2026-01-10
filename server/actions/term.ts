import {
  TermFindManyArgs,
  TermFindUniqueArgs,
  TermUpdateArgs,
  TermUpsertArgs,
} from "@/lib/generated/prisma/models/Term";
import { TermInput } from "@/lib/generated/graphql/server";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { ServerActions } from "@/types";
import prisma from "@/lib/prisma";

interface GetTermsProps extends ServerActions {
  query?: Pick<TermFindManyArgs, "select" | "include">;
  take?: number | null | undefined;
}

interface GetTermProps extends ServerActions {
  id: string;
  query?: Pick<TermFindUniqueArgs, "select" | "include">;
}

interface UpsertTermProps extends ServerActions {
  input: TermInput;
  query?: Pick<TermUpsertArgs, "select" | "include">;
}

interface ActivateTermProps extends ServerActions {
  query?: Pick<TermUpdateArgs, "select" | "include">;
  termId: string;
  academicYearId: string;
}

export async function getTermsAction({ take, query, context }: GetTermsProps) {
  const { schoolId } = context;

  return await prisma.term.findMany({
    where: {
      schoolId: schoolId!,
    },
    ...query,
    ...(take && { take: take }),
    orderBy: { startDate: "desc" },
  });
}

export async function getTermAction({ id, query, context }: GetTermProps) {
  const { schoolId } = context;

  return await prisma.term.findUnique({
    where: {
      id,
      schoolId: schoolId!,
    },
    ...query,
  });
}

export async function upsertTermAction({
  input: { id, session, academicYearId, ...input },
  query,
  context,
}: UpsertTermProps) {
  const { schoolId } = context;

  try {
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
      ...query,
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function activateTermAction({
  academicYearId,
  termId,
  query,
  context,
}: ActivateTermProps) {
  const { schoolId } = context;

  try {
    return await prisma.$transaction(async (tx) => {
      // Deactivate all current terms
      await tx.term.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Get the current academic year
      const currentAcademicYear = await tx.academicYear.findFirst({
        where: {
          schoolId,
          isCurrent: true,
        },
        select: { id: true },
      });

      // If the term's academic year is different from the current academic year, update it
      const isDifferentYear =
        !currentAcademicYear || currentAcademicYear?.id !== academicYearId;

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
      return await tx.term.update({
        where: { id: termId, schoolId },
        data: { isCurrent: true },
        ...query,
      });
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}
