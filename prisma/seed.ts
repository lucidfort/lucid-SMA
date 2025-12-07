import { faker } from "@faker-js/faker";
import {
  ActiveState,
  ParentStudentRelationship,
  PrismaClient,
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
  const schoolId = "5aa305c3-4aa5-4a49-9d32-920413ed43d4";
  // console.log("Deleting users...");

  // const client = await clerkClient();
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
  });

  const terms = await prisma.term.findMany({
    where: { schoolId, isCurrent: true },
  });

  // const classes = [];
  // for (const grade of grades) {
  //   const response = await prisma.class.createManyAndReturn({
  //     data: ["A", "B"].map((name, index) => ({
  //       schoolId,
  //       gradeId: grade.id,
  //       name,
  //       capacity: (index + 1) * 3,
  //     })),
  //   });

  //   classes.push(...response);
  // }

  const classes = await prisma.class.findMany({
    where: { schoolId },
  });

  const parents = await prisma.parent.findMany({
    where: {
      schoolId,
    },
  });

  // Parent
  // const parents = [];
  // for (let i = 0; i < 12; i++) {
  //   const primaryId = `${school?.slug}-p${String(i + 1).padStart(3, "0")}`;
  //   let clerkUserId;

  //   const firstName = faker.person.firstName();
  //   const lastName = faker.person.lastName();
  //   const email = faker.internet.email();

  //   if (i % 2 === 0) {
  //     const user = await client.users.createUser({
  //       username: primaryId,
  //       password: `${primaryId}@@11`,
  //       firstName,
  //       lastName,
  //       emailAddress: [email],
  //       publicMetadata: { accessLevel: "parent", schoolId },
  //     });
  //     clerkUserId = user.id;
  //   }

  //   const parent = await prisma.parent.create({
  //     data: {
  //       schoolId,
  //       clerkUserId,
  //       name: firstName,
  //       surname: lastName,
  //       primaryId,
  //       email,
  //       phone: faker.phone.number(),
  //       address: faker.location.streetAddress(),
  //     },
  //   });
  //   parents.push(parent);
  // }

  console.log("Seeding Students");
  // Student
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
        activeState: ActiveState.ACTIVE,
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

  for (let i = 0; i < 4; i++) {
    const gradeId = grades[i].id;
    await prisma.event.create({
      data: {
        title: faker.lorem.slug(2),
        description: faker.lorem.sentences(2),
        startTime: addDays(new Date(), 2),
        endTime: addDays(new Date(), 3),
        gradeId: i % 2 === 0 ? gradeId : null,
        termId: terms[0].id,
        schoolId,
      },
    });
  }

  for (let i = 0; i < 4; i++) {
    const gradeId = grades[i + 1].id;

    await prisma.announcement.create({
      data: {
        title: faker.lorem.slug(2),
        content: faker.lorem.sentence(),
        publishedAt: addDays(new Date(), 2),
        gradeId: i % 2 !== 0 ? gradeId : null,
        termId: terms[0].id,
        schoolId,
      },
    });
  }

  // Subject
  // for (const name of subjectNames) {
  //   await prisma.subject.upsert({
  //     where: {
  //       schoolId_name: {
  //         schoolId,
  //         name: name,
  //       },
  //     },
  //     update: {
  //       name: name,
  //     },
  //     create: {
  //       schoolId: schoolId,
  //       name,
  //     },
  //   });
  // }

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
