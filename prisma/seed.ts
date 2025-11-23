import { faker } from "@faker-js/faker";
import {
  ActiveState,
  PrismaClient,
  UserSex,
} from "../lib/generated/prisma/client";
import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

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

async function main() {
  const schoolId = "f1983031-44b7-46a2-8467-1c180bf96cd3";
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

  const classes = await prisma.class.findMany({
    where: {
      schoolId,
    },
  });

  // Parent

  const parents = [];
  for (let i = 0; i < 12; i++) {
    const primaryId = `${school?.slug}_p${String(i + 1).padStart(3, "0")}`;
    let clerkUserId;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    if (i % 2 === 0) {
      const user = await client.users.createUser({
        username: primaryId,
        password: `${primaryId}@@11`,
        firstName,
        lastName,
        publicMetadata: { accessLevel: "parent", schoolId },
      });
      clerkUserId = user.id;
    }

    const parent = await prisma.parent.create({
      data: {
        schoolId,
        clerkUserId,
        name: firstName,
        surname: lastName,
        primaryId,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      },
    });
    parents.push(parent);
  }

  // Student
  // for (let i = 0; i < 25; i++) {
  //   const name = faker.person.firstName();
  //   const surname = faker.person.lastName();
  //   const cls = classes[i % classes.length];
  //   const regNo = `${school?.slug}_${String(i + 1).padStart(4, "0")}`;
  //
  //   await prisma.student.create({
  //     data: {
  //       registrationNumber: regNo,
  //       name,
  //       surname,
  //       address: faker.location.streetAddress(),
  //       birthday: randomBirthday(5, 18),
  //       sex: randomSex(),
  //       activeState: ActiveState.ACTIVE,
  //       schoolId,
  //       classId: cls.id,
  //     },
  //   });
  //
  //   // Link student to parent
  //   // await prisma.parentStudent.create({
  //   //   data: {
  //   //     parentId: parents[i % parents.length].id,
  //   //     studentId: student.id,
  //   //     relation:
  //   //       i % 2 === 0
  //   //         ? ParentStudentRelationship.FATHER
  //   //         : ParentStudentRelationship.MOTHER,
  //   //   },
  //   // });
  // }
  //
  // // Subject
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
