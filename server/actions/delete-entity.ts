import { GraphQlContext, Table } from "@/types";
import prisma from "@/lib/prisma";
import { resourceDeletionAccess } from "@/lib/settings";
import { AppError, AuthenticationError } from "@/server/graphql/errors";
import { extractImageId } from "@/lib/utils/client.utils";
import { deleteImage } from "@/lib/cloudinary";
import { deleteUserAuth } from "@/server/actions/school";

type DeleteContext = {
  context: GraphQlContext;
};

type DeleteHandler = (id: string, ctx: DeleteContext) => Promise<void>;

interface DeleteEntityProps {
  table: Table;
  id: string;
  context: GraphQlContext;
}

const deleteHandlers: Record<Table, DeleteHandler> = {
  "academic-year": async (id, { context }) => {
    await prisma.academicYear.delete({
      where: { schoolId: context.schoolId, id },
    });
  },

  announcement: async (id, { context }) => {
    await prisma.announcement.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  assignment: async (id, { context }) => {
    await prisma.assessment.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  "assessment-result": async (id, { context }) => {
    await prisma.assessmentResult.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  class: async (id, { context }) => {
    await prisma.class.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  event: async (id, { context }) => {
    await prisma.event.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  exam: async (id, { context }) => {
    await prisma.exam.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  "exam-result": async (id, { context }) => {
    await prisma.examResult.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  grade: async (id, { context }) => {
    await prisma.grade.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  invoice: async (id, { context }) => {
    await prisma.invoice.delete({
      where: {
        id,
        schoolId: context.schoolId,
      },
    });
  },

  parent: async (id, { context }) => {
    const parent = await prisma.parent.findUnique({
      where: { id, schoolId: context.schoolId },
      select: { clerkUserId: true },
    });

    if (parent && parent.clerkUserId) {
      await deleteUserAuth(parent.clerkUserId);
    }

    await prisma.parent.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  "payroll-profile": async (id, { context }) => {
    const transaction = await prisma.payrollTransaction.findFirst({
      where: {
        schoolId: context.schoolId,
        profileId: id,
      },
      select: { id: true },
    });

    if (!transaction) {
      await prisma.payrollProfile.delete({
        where: {
          id,
          schoolId: context.schoolId,
        },
      });
    } else {
      await prisma.payrollProfile.update({
        where: { id, schoolId: context.schoolId },
        data: { isActive: false },
      });
    }
  },

  program: async (id, { context }) => {
    await prisma.program.delete({
      where: { id, schoolId: context.schoolId },
    });
  },

  staff: async (id, { context }) => {
    const staff = await prisma.staff.findUnique({
      where: { id, schoolId: context.schoolId },
      select: { img: true, clerkUserId: true },
    });

    let imageToDelete: string | null = null;

    if (staff?.img) {
      const extracted = extractImageId(staff.img);
      imageToDelete = extracted?.id ?? null;
    }

    await prisma.staff.delete({
      where: { id, schoolId: context.schoolId },
    });

    if (imageToDelete) {
      await deleteImage(imageToDelete);
    }

    if (staff?.clerkUserId) {
      await deleteUserAuth(staff.clerkUserId);
    }
  },

  student: async (id, { context }) => {
    const student = await prisma.student.findFirst({
      where: { id, schoolId: context.schoolId },
      select: { id: true, img: true },
    });

    if (!student) {
      throw new AppError("Student not found", "RECORD_MISSING");
    }

    let imageIdToDelete: string | null = null;

    if (student.img) {
      const extracted = extractImageId(student.img);
      imageIdToDelete = extracted?.id ?? null;
    }

    await prisma.$transaction(async (tx) => {
      const parentLinks = await tx.parentStudent.findMany({
        where: { studentId: id },
        select: { parentId: true },
      });

      const parentIds = parentLinks.map((p) => p.parentId);

      // Delete student first (this cascades parentStudent deletion)
      await tx.student.delete({
        where: { id },
      });

      if (parentIds.length === 0) return;

      const parentsWithRemainingKids = await tx.parentStudent.findMany({
        where: {
          parentId: { in: parentIds },
        },
        distinct: ["parentId"],
        select: { parentId: true },
      });

      const parentsWithKids = new Set(
        parentsWithRemainingKids.map((p) => p.parentId),
      );

      const orphanedParentIds = parentIds.filter(
        (id) => !parentsWithKids.has(id),
      );

      if (orphanedParentIds.length === 0) {
        await tx.parent.deleteMany({
          where: {
            id: { in: orphanedParentIds },
          },
        });
      }
    });

    if (imageIdToDelete) {
      await deleteImage(imageIdToDelete);
    }
  },

  subject: async (id, { context }) => {
    await prisma.subject.delete({ where: { id, schoolId: context.schoolId } });
  },

  term: async (id, { context }) => {
    await prisma.term.delete({
      where: { schoolId: context.schoolId, id },
    });
  },

  transaction: () => {
    throw new Error("Function not implemented.");
  },
  attendance: () => {
    throw new Error("Function not implemented.");
  },
  timetable: () => {
    throw new Error("Function not implemented.");
  },
  "payroll-transaction": (id: string, ctx: DeleteContext) => {
    throw new Error("Function not implemented.");
  },
  "class-assignment": () => {
    throw new Error("Function not implemented.");
  },
};

export async function deleteEntityAction({
  table,
  id,
  context,
}: DeleteEntityProps) {
  const handler = deleteHandlers[table];

  if (!handler) {
    throw new Error(`Deletion not supported for ${table}`);
  }

  if (!resourceDeletionAccess[context.accessLevel]?.includes(table)) {
    throw new AuthenticationError("You are not authorized to delete resource");
  }

  await handler(id, { context });

  return { success: true };
}
