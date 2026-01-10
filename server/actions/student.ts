"use server";

import { AppError } from "@/server/graphql/errors";
import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { StudentFilter, StudentInput } from "@/lib/generated/graphql/server";
import { extractImageId } from "@/lib/utils/client.utils";
import {
  StudentCreateArgs,
  StudentFindManyArgs,
  StudentFindUniqueArgs,
  StudentUpdateArgs,
  StudentWhereInput,
} from "@/lib/generated/prisma/models/Student";
import { ServerActions } from "@/types";
import { deleteImage } from "@/lib/cloudinary";
import { resolveAcademicScopeAction } from "@/server/actions/school";

type GuardianRelation =
  | "FATHER"
  | "MOTHER"
  | "GUARDIAN"
  | "GRANDPARENT"
  | "SIBLING"
  | "OTHER";

type StudentStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "GRADUATED"
  | "TRANSFERRED"
  | "WITHDRAWN"
  | "EXPELLED";

interface StudentInputType
  extends Omit<StudentInput, "sex" | "primaryGuardian" | "secondaryGuardian"> {
  sex: "MALE" | "FEMALE";
  primaryGuardian: { id: string; relation: GuardianRelation };
  secondaryGuardian?: { id: string; relation: GuardianRelation } | null;
}

interface GetStudentsProps extends ServerActions {
  filter?:
    | (Omit<StudentFilter, "status"> & {
        status?: StudentStatus[] | null;
      })
    | null;
  query?: Pick<StudentFindManyArgs, "select" | "include">;
}

interface GetStudentProps extends ServerActions {
  id: string;
  query: Pick<StudentFindUniqueArgs, "select" | "include">;
}

interface CreateStudentProps extends ServerActions {
  input: Omit<StudentInputType, "id">;
  query?: Pick<StudentCreateArgs, "select" | "include">;
}

interface UpdateStudentProps extends ServerActions {
  input: StudentInputType;
  query?: Pick<StudentUpdateArgs, "select" | "include">;
}

export async function checkClassAvailability(
  classId: string,
  schoolId: string,
) {
  const classItem = await prisma.class.findUnique({
    where: { id: classId, schoolId: schoolId },
    select: { capacity: true, _count: { select: { students: true } } },
  });

  if (classItem && classItem.capacity === classItem._count.students) {
    throw new AppError("There's no space in this class", "CLASS_OCCUPIED");
  }

  return;
}

export async function getStudentsAction({
  filter,
  query,
  context,
}: GetStudentsProps) {
  const { schoolId } = context;
  const { parentId, searchTerm, gradeId, grades, classId, status, take, skip } =
    filter ?? {};

  const scope = await resolveAcademicScopeAction({
    context,
    classId,
    gradeId,
  });

  if (!scope) return [];

  const where: StudentWhereInput = {
    schoolId,

    ...(searchTerm && {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { surname: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),

    ...(parentId && {
      parentStudents: { some: { parentId } },
    }),

    ...(status && { status: { in: status } }),
  };

  // Class always wins
  if (scope.classIds?.length) {
    where.classId = { in: scope.classIds };
  }
  // Single grade filter
  else if (gradeId && scope.gradeIds?.includes(gradeId)) {
    where.class = { gradeId };
  }
  // Multi grade filter
  else if (grades?.length && scope.gradeIds?.length) {
    const allowedGrades = grades.filter((g) => scope.gradeIds!.includes(g));

    if (!allowedGrades.length) return [];

    where.class = { gradeId: { in: allowedGrades } };
  }
  // No explicit filter -> fallback to scope
  else if (scope.gradeIds?.length) {
    where.class = { gradeId: { in: scope.gradeIds } };
  }

  return await prisma.student.findMany({
    ...query,
    where,
    ...(take && { take: take + 1 }),
    ...(skip && { skip }),
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentAction({
  id,
  query,
  context,
}: GetStudentProps) {
  const { schoolId } = context;

  return await prisma.student.findUnique({
    where: { id, schoolId },
    ...query,
  });
}

export async function createStudentAction({
  input,
  query,
  context,
}: CreateStudentProps) {
  const { schoolId, slug } = context;
  const {
    primaryGuardian,
    secondaryGuardian,
    registrationNumber: regNo,
    ...data
  } = input;

  if (!slug) {
    throw new AppError("Slug is required", "MISSING_SCHOOL_SLUG");
  }

  try {
    await checkClassAvailability(input.classId, schoolId!);

    const registrationNumber = `${slug}-${regNo}`;

    return await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          schoolId: schoolId!,
          registrationNumber,
          ...data,
        },
        ...query,
      });

      const guardians = [
        {
          parentId: primaryGuardian.id,
          studentId: student.id,
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
        ...(secondaryGuardian
          ? [
              {
                parentId: secondaryGuardian.id,
                studentId: student.id,
                relation: secondaryGuardian.relation!,
                isPrimary: false,
              },
            ]
          : []),
      ];

      await tx.parentStudent.createMany({
        data: guardians,
      });

      return student;
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateStudentAction({
  input: { id, ...input },
  query,
  context,
}: UpdateStudentProps) {
  if (!id) {
    throw new AppError("Student ID is required", "MISSING_STUDENT_ID");
  }

  const { schoolId, slug } = context;

  if (!slug) {
    throw new AppError("Slug is required", "MISSING_SCHOOL_SLUG");
  }

  const {
    primaryGuardian,
    secondaryGuardian,
    registrationNumber: regNo,
    oldImg,
    img,
    ...data
  } = input;

  try {
    await checkClassAvailability(data.classId, schoolId!);

    // Delete an old image if a new one was uploaded
    if (img && oldImg && img !== oldImg) {
      const publicId = extractImageId(oldImg);
      await deleteImage(publicId.id as string);
    }

    const registrationNumber = `${slug}@${regNo}`;

    const guardianOps = [
      {
        where: {
          parentId_studentId: {
            parentId: primaryGuardian.id,
            studentId: id!,
          },
        },
        create: {
          parentId: primaryGuardian.id,
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
        update: {
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
      },
      ...(secondaryGuardian
        ? [
            {
              where: {
                parentId_studentId: {
                  parentId: secondaryGuardian.id,
                  studentId: id!,
                },
              },
              create: {
                parentId: secondaryGuardian.id,
                relation: secondaryGuardian.relation!,
                isPrimary: false,
              },
              update: {
                relation: secondaryGuardian.relation,
                isPrimary: false,
              },
            },
          ]
        : []),
    ];

    // Remove any guardians that are no longer in the list
    const validGuardianIds = [
      primaryGuardian.id,
      ...(secondaryGuardian ? [secondaryGuardian.id] : []),
    ];

    return await prisma.student.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...data,
        img,
        registrationNumber,
        parentStudents: {
          deleteMany: {
            parentId: { notIn: validGuardianIds },
          },
          upsert: guardianOps,
        },
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
