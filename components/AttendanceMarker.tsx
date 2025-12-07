"use client";

import { Loader2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Student, useMarkStudentAttendanceMutation } from "@/lib/generated/graphql/client";
import Table from "./Table";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AttendanceMarkerProps {
  classId: string;
  date: Date;
  students: { id: string; name: string; surname: string }[];
  attendanceState: { present: boolean; studentId: string }[];
}

const AttendanceMarker = ({
  classId,
  date,
  students,
  attendanceState,
}: AttendanceMarkerProps) => {
  const router = useRouter()
  const [attendance, setAttendance] = useState(attendanceState);

  const [mutationResult, markAttendance] = useMarkStudentAttendanceMutation()

  const handleAttendanceChange = (
    studentId: string,
    present: boolean,
  ) => {
    setAttendance((prev) => {
      const student = prev.find((att) => att.studentId === studentId);

      if (student) {
        return prev.map((att) =>
          att.studentId === studentId ? { ...att, present } : att,
        );
      } else {
        return [...prev, { studentId, present }];
      }
    });
  };

  const attendanceStats = {
    present: attendance.filter(({ present }) => present).length,
    absent: attendance.filter(({ present }) => !present).length,
    total: students.length,
  };

  const updateAttendance = async () => {
    if (attendance === attendanceState) return;

    const response = await markAttendance({
      input: {
        classId, date, records: attendance
      }
    })

    const result = response.data?.markStudentAttendance

    if (result?.__typename === "MutationMarkStudentAttendanceSuccess") {
      toast.success("Attendance updated!");
      router.refresh()
    } else {
      const error = handleGraphqlClientErrors(result)
      toast.error(error)
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      className: "min-w-56 lg:min-w-40",
      cell: (item: Student) => <span>{item.name} {item.surname}</span>
    },
    {
      header: "",
      accessor: "action",
      cell: (item: Student) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={
              attendance.find((a) => a.studentId === item.id)
                ?.present
                ? "default"
                : "outline"
            }
            onClick={() => handleAttendanceChange(item.id, true)}
            className="text-xs"
          >
            Present
          </Button>
          <Button
            size="sm"
            variant={
              attendance.find((a) => a.studentId === item.id)
                ?.present === false
                ? "destructive"
                : "outline"
            }
            onClick={() => handleAttendanceChange(item.id, false)}
            className="text-xs"
          >
            Absent
          </Button>
        </div>
      )
    }
  ]

  return (
    <Card className="h-fit flex-1">
      <CardHeader>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm">Present: {attendanceStats.present}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm">Absent: {attendanceStats.absent}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table columns={columns} data={students} />

        <div className="mt-4 flex items-end justify-end">
          <Button
            disabled={attendance === attendanceState || mutationResult.fetching}
            onClick={updateAttendance}
          >
            {mutationResult.fetching ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceMarker;
