import { faker } from "@faker-js/faker";
import {
  AccessLevel,
  ParentStudentRelationship,
  PrismaClient,
  StudentStatus,
  UserSex,
} from "../lib/generated/prisma/client";
import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";
import { withAccelerate } from "@prisma/extension-accelerate";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient().$extends(withAccelerate());

const subjectNames = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Further Mathematics",
  "Geography",
  "History",
  "Computer Science",
  "Fine Arts",
];

function randomSex() {
  return Math.random() > 0.5 ? UserSex.MALE : UserSex.FEMALE;
}

function randomBirthday(minAge: number, maxAge: number) {
  const today = new Date();
  const min = new Date(today.getFullYear() - maxAge, 0, 1);
  const max = new Date(today.getFullYear() - minAge, 11, 31);
  return new Date(
    min.getTime() + Math.random() * (max.getTime() - min.getTime()),
  );
}

function randomDate(interval = 30, direction: "future" | "past") {
  const now = new Date();
  const offset = Math.floor(Math.random() * interval);

  return direction === "future" ? addDays(now, offset) : subDays(now, offset);
}

async function main() {
  const schoolId = "c878ee09-510f-476e-a3d7-8c5dcead4ab8";
  // console.log("Deleting users...");

  const client = await clerkClient();
  // const users = await client.users.getUserList({ limit: 100 });
  // for (const user of users.data) {
  //   await client.users.deleteUser(user.id);
  // }
  // console.log("Users deleted!");

  console.log("🌱 Seeding database...");
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, slug: true },
  });

  const grades = await prisma.grade.findMany({
    where: { schoolId },
    include: { program: true },
  });

  const terms = await prisma.term.findMany({
    where: { schoolId, isCurrent: true },
  });

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
  });

  let classes = await prisma.class.findMany({
    where: { schoolId },
  });

  if (classes.length === 0) {
    const data = grades.flatMap((grade) =>
      ["A", "B"].map((name, index) => ({
        schoolId,
        gradeId: grade.id,
        name,
        capacity: (index + 1) * 3,
      })),
    );

    await prisma.class.createMany({
      data,
      skipDuplicates: true,
    });

    classes = await prisma.class.findMany({
      where: { schoolId },
    });
  }

  // Staff
  const staffs = await prisma.staff.findMany({
    where: { schoolId },
  });

  if (staffs.length === 0) {
    console.log("Seeding Staffs");
    for (let i = 0; i < 10; i++) {
      const employeeId = `${school?.slug}-s${String(i + 1).padStart(3, "0")}`;
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const accessLevel = [
        AccessLevel.TEACHER,
        AccessLevel.FINANCE,
        AccessLevel.ADMINISTRATION,
      ][Math.random() * 2];
      const subject = subjects[i % subjects.length];
      const grade = grades[i % grades.length];

      const clerkUserId =
        i % 2 === 0
          ? (
              await client.users.createUser({
                username: employeeId,
                password: `${employeeId}@@11`,
                firstName,
                lastName,
                emailAddress: [email],
                publicMetadata: { accessLevel: "parent", schoolId },
              })
            ).id
          : null;

      await prisma.$transaction(async (tx) => {
        const staff = await prisma.staff.create({
          data: {
            name: firstName,
            surname: lastName,
            schoolId: schoolId!,
            email: email,
            accessLevel: i % 2 !== 0 ? AccessLevel.RESTRICTED : accessLevel,
            clerkUserId,
            employeeId,
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            sex: UserSex.MALE,
            role: "staff",
            birthday: randomBirthday(21, 51),
          },
        });

        if (
          accessLevel === "TEACHER" &&
          subject &&
          grade.program.name === "SECONDARY"
        ) {
          await tx.teacherSubjectAssignment.create({
            data: {
              schoolId: schoolId!,
              teacherId: staff.id,
              subjectId: subject.id,
              grades: {
                connect: {
                  id: grade.id,
                },
              },
            },
          });
        }
      });
    }

    // staffs = await prisma.staff.findMany({
    //   where: { schoolId },
    // });
  }

  // Parent
  let parents = await prisma.parent.findMany({
    where: { schoolId },
  });

  if (parents.length === 0) {
    console.log("Seeding Parents");
    for (let i = 0; i < 12; i++) {
      const primaryId = `${school?.slug}-p${String(i + 1).padStart(3, "0")}`;
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();

      const clerkUserId =
        i % 2 === 0
          ? (
              await client.users.createUser({
                username: primaryId,
                password: `${primaryId}@@11`,
                firstName,
                lastName,
                emailAddress: [email],
                publicMetadata: { accessLevel: "parent", schoolId },
              })
            ).id
          : null;

      try {
        await prisma.parent.create({
          data: {
            schoolId,
            clerkUserId,
            name: firstName,
            surname: lastName,
            primaryId: i % 2 === 0 ? primaryId : null,
            email,
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
          },
        });
      } catch (e) {
        if (clerkUserId) {
          await client.users.deleteUser(clerkUserId);
        }
      }
    }

    parents = await prisma.parent.findMany({
      where: { schoolId },
    });
  }

  const students = await prisma.student.findMany({
    where: { schoolId },
    select: { id: true },
  });

  // Student
  if (students.length === 0) {
    console.log("Seeding Students");
    for (let i = 0; i < 8; i++) {
      const name = faker.person.firstName();
      const surname = faker.person.lastName();
      const regNo = `${school?.slug}-s${String(i + 20).padStart(2, "0")}`;

      const cls = classes[i % classes.length];
      const parent = parents[i % parents.length];

      const student = await prisma.student.create({
        data: {
          schoolId,
          registrationNumber: regNo,
          name,
          surname,
          address: faker.location.streetAddress(),
          birthday: randomBirthday(5, 18),
          sex: randomSex(),
          status: StudentStatus.ACTIVE,
          classId: cls.id,
        },
      });

      // Link student to parent
      await prisma.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: student.id,
          isPrimary: !!parent.clerkUserId,
          relation:
            i % 2 === 0
              ? ParentStudentRelationship.FATHER
              : ParentStudentRelationship.MOTHER,
        },
      });
    }

    // students = await prisma.student.findMany({
    //   where: { schoolId },
    //   select: { id: true },
    // });
  }

  for (let i = 0; i < 4; i++) {
    const gradeId = grades[i % grades.length]?.id;

    await prisma.event.create({
      data: {
        title: faker.lorem.slug(2),
        description: faker.lorem.sentences(2),
        date: addDays(new Date(), i * 2),
        gradeId: i % 2 === 0 ? gradeId : null,
        schoolId,
      },
    });
  }

  for (let i = 0; i < 4; i++) {
    const gradeId = grades[i % grades.length].id;

    await prisma.announcement.create({
      data: {
        title: faker.lorem.slug(2),
        content: faker.lorem.sentence(),
        publishedAt: subDays(new Date(), i * 2),
        gradeId: i % 2 !== 0 ? gradeId : null,
        schoolId,
      },
    });
  }

  // Subject
  if (subjects.length === 0) {
    console.log("Seeding subjects");
    for (const name of subjectNames) {
      await prisma.subject.upsert({
        where: {
          schoolId_name: {
            schoolId,
            name: name,
          },
        },
        update: {
          name: name,
        },
        create: {
          schoolId: schoolId,
          name,
        },
      });
    }
  }

  const exams = await prisma.exam.findMany({
    where: { schoolId },
    select: { id: true },
  });

  const assessments = await prisma.assessment.findMany({
    where: { schoolId },
    select: { id: true },
  });

  if (exams.length === 0) {
    console.log("Seeding exams");
    for (let i = 0; i < 4; i++) {
      const subjectId = subjects[i % subjects.length].id;
      const gradeId = grades[i % grades.length].id;
      const termId = terms.find((t) => t.isCurrent)?.id || terms[0].id;

      await prisma.exam.create({
        data: {
          schoolId,
          subjectId,
          gradeId,
          termId,
          date: subDays(new Date(), i * 2),
          type: "FINAL",
          maxScore: 70,
        },
      });
    }
  }

  if (assessments.length === 0) {
    console.log("Seeding assessments");
    for (let i = 0; i < 4; i++) {
      const subjectId = subjects[i % subjects.length].id;
      const classId = classes[i % classes.length].id;
      const termId = terms.find((t) => t.isCurrent)?.id || terms[0].id;

      await prisma.assessment.create({
        data: {
          schoolId,
          subjectId,
          classId,
          termId,
          dueDate: addDays(new Date(), i * 2),
          maxScore: 30,
        },
      });
    }
  }

  const examResults = await prisma.examResult.findMany({
    where: { schoolId },
    select: { id: true },
  });

  const assessmentResults = await prisma.assessmentResult.findMany({
    where: { schoolId },
    select: { id: true },
  });

  if (examResults.length === 0) {
    console.log("Seeding examResults");
    for (let i = 0; i < 4; i++) {
      const examId = exams[i % exams.length].id;
      const studentId = students[i % students.length].id;

      await prisma.examResult.create({
        data: {
          schoolId,
          examId,
          studentId,
          score: Math.random() * i + 50,
        },
      });
    }
  }

  if (assessmentResults.length === 0) {
    console.log("Seeding assessmentResults");
    for (let i = 0; i < 4; i++) {
      const assignmentId = assessments[i % assessments.length].id;
      const studentId = students[i % students.length].id;

      await prisma.assessmentResult.create({
        data: {
          schoolId,
          assignmentId,
          studentId,
          score: Math.random() * i + 50,
        },
      });
    }
  }

  const invoices = await prisma.invoice.findMany({
    where: { schoolId },
    select: { id: true },
  });

  if (invoices.length === 0) {
    console.log("Seeding invoices");
    for (let i = 0; i < 4; i++) {
      const termId = terms.find((t) => t.isCurrent)?.id || terms[0].id;

      await prisma.invoice.create({
        data: {
          schoolId,
          termId,
          number: faker.vehicle.vrm(),
          title: faker.lorem.words(2),
          amount: faker.number.int({ min: 5000, max: 40000 }),
        },
      });
    }
  }

  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
