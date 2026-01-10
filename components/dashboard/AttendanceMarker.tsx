"use client";

import Table from "@/components/table/Table";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  AttendanceStatus,
  Student,
  useMarkClassAttendanceMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { useRouter } from "next/navigation";

interface AttendanceState {
  studentId: string;
  status: AttendanceStatus;
  arrivalTime?: string | null;
  note?: string | null;
}

interface AttendanceMarkerProps {
  classId: string;
  date: Date;
  students: {
    id: string;
    name: string;
    surname: string;
    registrationNumber: string;
  }[];
  currentState: AttendanceState[];
}

interface ColumnData {
  index: number;
  id: string;
  name: string;
  surname: string;
  registrationNumber: string;
  status: AttendanceStatus;
  arrivalTime?: Date;
  note?: string;
}

const AttendanceMarker = ({
  classId,
  date,
  students,
  currentState,
}: AttendanceMarkerProps) => {
  const router = useRouter();
  const [attendanceState, setAttendanceState] = useState(currentState);

  const [mutationResult, markAttendance] = useMarkClassAttendanceMutation();

  const [selectedDate, setSelectedDate] = useState(
    new Date(date).toISOString().split("T")[0],
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setAttendanceState(currentState);
    setHasChanges(false);
  }, [currentState]);

  useEffect(() => {
    if (!selectedDate) return;

    const isoDate = new Date(selectedDate).toLocaleDateString("en-CA");
    const params = new URLSearchParams(window.location.search);

    if (params.get("date") === isoDate) return;
    params.set("date", isoDate);

    router.replace(`?${params.toString()}`);
  }, [selectedDate, router]);

  // Stats
  const stats = useMemo(() => {
    const present = attendanceState.filter(
      ({ status }) => status === "PRESENT",
    ).length;
    const absent = attendanceState.filter(
      ({ status }) => status === "ABSENT",
    ).length;
    const unmarked = students.filter((s) =>
      attendanceState.find((a) => a.studentId !== s.id),
    ).length;
    const total = students.length;

    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, unmarked, attendanceRate };
  }, [attendanceState]);

  // Update student status
  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prevState) => {
      const index = prevState.findIndex((s) => s.studentId === studentId);

      const updatedRecord = {
        studentId,
        status,
        arrivalTime:
          status === "LATE"
            ? new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
      };

      if (index !== -1) {
        return prevState.map((s, i) => (i === index ? updatedRecord : s));
      } else {
        return [...prevState, updatedRecord];
      }
    });
    setHasChanges(true);
  };

  // Update student note
  const updateStudentNote = (studentId: string, note: string) => {
    setAttendanceState((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, note } : s)),
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (currentState === attendanceState) return;

    const response = await markAttendance({
      input: {
        classId,
        date: new Date(selectedDate),
        records: attendanceState,
      },
    });

    const result = response.data?.markClassAttendance;

    if (result?.__typename === "MutationMarkClassAttendanceSuccess") {
      toast.success("Attendance updated!");
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(result);
      toast.error(error);
    }
  };

  // Mark all present
  const markAllPresent = () => {
    setAttendanceState(
      students.map((s) => ({
        studentId: s.id,
        status: AttendanceStatus.Present,
      })),
    );
    setHasChanges(true);
  };

  // Reset all
  const resetAll = () => {
    setAttendanceState(currentState);
    setHasChanges(false);
  };

  // Navigate date
  const navigateDate = (direction: "prev" | "next") => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const tableData = students.map((student, index) => {
    const state = attendanceState.find((s) => s.studentId === student.id);

    return {
      index,
      ...student,
      ...state,
    };
  });

  const columns = [
    {
      header: "#",
      className: "min-w-12",
      cell: (student: ColumnData) => <span>{student.index + 1}</span>,
    },
    {
      header: "Student",
      accessor: "name",
      className: "min-w-40",
      cell: (student: ColumnData) => (
        <div>
          <div className="font-medium text-slate-900">
            {student.name} {student.surname}
          </div>
          <div className="text-muted-foreground text-xs">
            {student.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (student: ColumnData) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant={student.status === "PRESENT" ? "default" : "outline"}
            size="sm"
            className={`w-12 ${student.status === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600" : "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"}`}
            onClick={() =>
              updateStudentStatus(student.id, AttendanceStatus.Present)
            }
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant={student.status === "ABSENT" ? "default" : "outline"}
            size="sm"
            className={`w-12 ${student.status === "ABSENT" ? "bg-red-500 hover:bg-red-600" : "hover:border-red-300 hover:bg-red-50 hover:text-red-600"}`}
            onClick={() =>
              updateStudentStatus(student.id, AttendanceStatus.Absent)
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      header: "Note",
      cell: (student: ColumnData) => (
        <Input
          placeholder="Add note..."
          value={student.note}
          onChange={(e) => updateStudentNote(student.id, e.target.value)}
          className="h-8 text-sm"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Date Selector & Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date Picker Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate("prev")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-auto border-0 bg-transparent p-0 text-center text-lg font-semibold"
                      />
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate("next")}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Stats Card */}
            <Card className="from-primary/5 to-primary/10 border-0 bg-gradient-to-br shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Attendance Rate
                  </span>
                  <span className="text-primary text-3xl font-bold">
                    {stats.attendanceRate}%
                  </span>
                </div>
                <Progress value={stats.attendanceRate} className="mb-3 h-2" />
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>
                    {stats.present} / {stats.total} Present
                  </span>
                  <span>{stats.unmarked} Unmarked</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card className="gap-0 border-0 shadow-md">
            <CardHeader className="border-b bg-slate-50/50 pb-0">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="w-full">
                  <CardTitle>Student Roster</CardTitle>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark All Present
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetAll}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  {hasChanges && (
                    <Button
                      size="sm"
                      className="bg-lamaYellow text-primary hover:bg-lamaYellow/75 cursor-pointer transition-opacity"
                      onClick={handleSave}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {mutationResult.fetching ? "Saving" : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table columns={columns} data={tableData} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notify Absentees
              </Button>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Present</span>
                  </div>
                  <span className="font-semibold">{stats.present}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Absent</span>
                  </div>
                  <span className="font-semibold">{stats.absent}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="text-sm">Unmarked</span>
                  </div>
                  <span className="text-muted-foreground font-semibold">
                    {stats.unmarked}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarker;
