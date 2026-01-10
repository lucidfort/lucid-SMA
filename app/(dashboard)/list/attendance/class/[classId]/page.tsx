import AttendanceMarker from "@/components/dashboard/AttendanceMarker";
import {
  GetClassAttendanceQuery,
  GetClassAttendanceQueryVariables,
} from "@/lib/generated/graphql/server";
import { SearchParams } from "@/types";
import { endOfDay, startOfDay } from "date-fns";
import { notFound } from "next/navigation";
import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { getRetryAfterSeconds, isRateLimitError } from "@/lib/utils/client.utils";
import RateLimitNotice from "@/components/RateLimitNotice";

const GET_CLASS_ATTENDANCE = gql(`
  query GetClassAttendance($id: ID!, $attendanceFilter: AttendanceFilter!) {
    class(id: $id) {
      id 
      name
      grade {
        id
        name
      }
      supervisors {
        teacher {
          id 
          name 
          surname
        }
      }
      students {
        id
        name
        surname
        registrationNumber
      }
    }
    
    classAttendances(filter: $attendanceFilter) {
      id studentId status arrivalTime note
    } 
  }
`);

const ClassAttendanceInfo = async ({ params, searchParams }: SearchParams) => {
  const { classId } = await params;
  const { date } = await searchParams;

  const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { client } = await createUrqlServerClient();
  const { data, error } = await client
    .query<GetClassAttendanceQuery, GetClassAttendanceQueryVariables>(
      GET_CLASS_ATTENDANCE,
      {
        id: classId,
        attendanceFilter: { startDate: start, endDate: end },
      },
    )
    .toPromise();

  if (error && isRateLimitError(error)) {
    const retryAfter = getRetryAfterSeconds(error) ?? 60;

    return <RateLimitNotice retryAfter={retryAfter} />;
  }

  if (!data?.class || !data.classAttendances) notFound();

  const classInfo = data.class;

  const supervisor = classInfo.supervisors?.[0]?.teacher;

  return (
    <div className="relative m-4 mt-0 space-y-7 rounded-md bg-white p-4">
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/list/attendance/class">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Attendance Register
                </h1>
                <p className="text-muted-foreground">
                  {classInfo.grade.name} {classInfo.name} • {supervisor?.name}{" "}
                  {supervisor?.surname}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <AttendanceMarker
          classId={classId}
          date={start}
          students={classInfo.students}
          currentState={data.classAttendances || []}
        />
      </div>
    </div>
  );
};
export default ClassAttendanceInfo;
