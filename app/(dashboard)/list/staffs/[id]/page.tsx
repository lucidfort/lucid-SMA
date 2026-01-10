import {
  GetStaffQuery,
  GetStaffQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { BriefcaseBusiness, LockKeyhole } from "lucide-react";
import PayrollProfileCard from "@/components/dashboard/cards/PayrollProfileCard";
import { subDays } from "date-fns";
import UserInfoCard from "@/components/dashboard/cards/UserInfoCard";
import ShortcutLinks from "@/components/dashboard/ShortcutLinks";

const GET_STAFF = gql(`
  query GetStaff($id: ID!, $attendanceFilter: AttendanceFilter!) {
    staff(id: $id) {
      id
      name
      surname
      phone
      email
      address
      img
      clerkUserId
      employeeId
      accessLevel
        contractType
      birthday
      role
      assignedClass {
          class {
              id
              name
              grade {
                  id
                  name
                  program {
                      id
                      name
                  }
              }
          }
      }
      payrollProfile {
        accountNumber
        bankName
        salary
        accountName
      }
        attendances(filter: $attendanceFilter) {
            clockInTime
        }
    }
  }
`);

const TeacherDetailsPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const today = new Date();
  const daysSinceMonday = (today.getDay() / 6) % 7;

  const lastMonday = subDays(today, daysSinceMonday);

  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetStaffQuery, GetStaffQueryVariables>(GET_STAFF, {
      id,
      attendanceFilter: {
        startDate: lastMonday,
      },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  const staff = data?.staff;

  if (!staff) return notFound();

  const attendances = staff?.attendances || [];
  // const punctualRate = attendances.filter((day) => {
  //   if (!day.clockInTime) return;
  //
  //   const clockIn = new Date(day.clockInTime);
  //   const sevenThirty = new Date(clockIn);
  //   sevenThirty.setHours(8, 0, 0, 0);
  //
  //   return clockIn > sevenThirty;
  // }).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full space-y-5 lg:space-y-12 xl:w-2/3">
        <UserInfoCard
          table="staff"
          data={staff}
          accessLevel={accessLevel!}
          cards={[
            {
              label: "Access Level",
              value: staff.accessLevel,
              icon: LockKeyhole,
            },
            {
              label: "Contract Type",
              value: staff.contractType,
              icon: BriefcaseBusiness,
            },
          ]}
        />

        <div className="flex flex-col gap-4 lg:mt-8 lg:flex-row">
          <PayrollProfileCard profile={staff.payrollProfile} staff={staff} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        {staff.accessLevel === "TEACHER" && (
          <ShortcutLinks
            links={[
              {
                href: `/list/classes?supervisorId=${id}`,
                label: "Teacher's Classes",
              },
              {
                href: `/list/students?teacherId=${id}`,
                label: "Teacher's Students",
              },
              { href: `/list/exams?teacherId=${id}`, label: "Teacher's Exams" },
              {
                href: `/list/lessons?teacherId=${id}`,
                label: "Teacher's Lessons",
              },
              {
                href: `/list/assignments?teacherId=${id}`,
                label: "Teacher's Assignments",
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDetailsPage;
