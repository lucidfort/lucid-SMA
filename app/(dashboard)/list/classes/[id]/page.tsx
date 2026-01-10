import AnnouncementsCard from "@/components/dashboard/cards/AnnouncementsCard";
import AttendanceChartContainer from "@/components/dashboard/charts/AttendanceChartContainer";
import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import UpcomingEventsCard from "@/components/dashboard/cards/UpcomingEventsCard";
import FeeSummaryCard from "@/components/dashboard/cards/FeeSummaryCard";
import FormModal from "@/components/form/ui/FormModal";
import { classStudentsColumn } from "@/components/table/column/classStudentsColumn";
import { DataTable } from "@/components/table/column/data-table";
import TimetableBoard from "@/components/dashboard/TimetableBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GetClassQuery,
  GetClassQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import { startOfDay, startOfWeek, subDays } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserAvatar from "@/components/dashboard/UserAvatar";
import { Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/client.utils";

const GET_CLASS = gql`
  query GetClass(
    $id: ID!
    $attendanceFilter: AttendanceFilter!
    $eventFilter: EventFilter!
    $announcementFilter: AnnouncementFilter!
    $invoiceSummaryFilter: InvoiceFilter!
  ) {
    class(id: $id) {
      id
      name
      capacity
      activeStudentsCount
      grade {
        id
        name
        program {
          id
        }
      }
      supervisors(isActive: true) {
        teacher {
          id
          name
          surname
          img
          employeeId
          email
          phone
        }
      }
      students {
        id
        name
        surname
        sex
        birthday
        registrationNumber
        img
        status
      }
    }

    classAttendances(filter: $attendanceFilter) {
      date
      status
    }

    events(filter: $eventFilter) {
      id
      title
      description
      date
    }

    announcements(filter: $announcementFilter) {
      id
      content
      title
      publishedAt
    }

    invoices(filter: $invoiceSummaryFilter) {
      id
      title
      paymentCount
      studentCount
    }
  }
`;

const ClassInfoPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const today = new Date();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetClassQuery, GetClassQueryVariables>(
    GET_CLASS,
    {
      id,
      attendanceFilter: { startDate: startOfWeek(today, { weekStartsOn: 1 }) },
      eventFilter: {
        date: startOfDay(today),
        take: 3,
      },
      announcementFilter: {
        rangeFrom: subDays(new Date(), 10),
        take: 3,
      },
      invoiceSummaryFilter: {},
    },
  );

  if (!data || !data.class) redirect("/list/classes");

  const { accessLevel } = await getCurrentUser();

  const classInfo = data.class;

  const cards = [
    {
      label: "Class",
      value: classInfo.name,
    },
    {
      label: "Grade",
      value: classInfo?.grade?.name,
    },
    {
      label: "Active Students",
      value: classInfo.activeStudentsCount,
    },
    { label: "Class Capacity", value: classInfo.capacity },
  ];

  const supervisor = classInfo.supervisors?.[0]?.teacher;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full flex-col gap-8 lg:w-2/3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Class Information</CardTitle>

              {["manager"].includes(accessLevel!) && (
                <DropdownOptions>
                  <DropdownMenuItem asChild>
                    <FormModal
                      table="class"
                      type="update"
                      data={classInfo}
                      triggerTitle="Update"
                    />
                  </DropdownMenuItem>

                  <DropdownMenuItem>Deactivate</DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-destructive" asChild>
                    <DeleteModal id={classInfo.id!} table="class">
                      <span className="text-destructive pl-2.5 text-sm">
                        Delete
                      </span>
                    </DeleteModal>
                  </DropdownMenuItem>
                </DropdownOptions>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {cards.map((card, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span>{card.label} :</span>
                  <span>{card.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex w-full items-center justify-between">
              <CardTitle>Supervisor</CardTitle>

              <FormModal
                table="class-assignment"
                type="create"
                formTitle="Assign A Supervisor"
                relatedData={{
                  classId: classInfo.id,
                  gradeId: classInfo.grade?.id,
                  disableAcademicStructure: true,
                }}
              >
                <Button
                  className={cn(
                    "text-primary-btn border-gray-400 bg-transparent shadow-sm transition-colors duration-200 ease-in-out hover:bg-transparent",
                    supervisor ? "hover:text-red-400" : "hover:text-green-400",
                  )}
                >
                  {supervisor ? (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Unassign
                    </>
                  ) : (
                    "Assign"
                  )}
                </Button>
              </FormModal>
            </CardHeader>

            <CardContent className="p-5 pb-0">
              {supervisor ? (
                <div className="w-full space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <UserAvatar name={supervisor.name} className="size-14" />
                    <Link
                      href={`/list/staffs/${supervisor.id}`}
                      className="font-semibold text-slate-800 transition-colors hover:text-blue-600"
                    >
                      {supervisor.name} {supervisor.surname}
                    </Link>
                    <p className="font-mono text-xs text-slate-500">
                      {supervisor.employeeId}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 py-1 hover:bg-transparent"
                      disabled={!supervisor?.email}
                    >
                      <Link
                        href={`mailto:${supervisor?.email}`}
                        className="hover:text-lamaPurple flex flex-col items-center"
                      >
                        <Mail className="mr-1 h-4 w-4" />
                        Email
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 py-1 hover:bg-transparent"
                    >
                      <Link
                        href={`tel:${supervisor.phone}`}
                        className="flex flex-col items-center hover:text-green-600"
                      >
                        <Phone className="mr-1 h-4 w-4" />
                        Call
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-10 text-center">Unassigned</div>
              )}
            </CardContent>
          </Card>
        </div>

        <DataTable
          title="Students"
          tableFor="student"
          columns={classStudentsColumn}
          accessLevel={accessLevel!}
          data={classInfo.students}
          relatedData={{
            programId: classInfo.grade?.program?.id,
            gradeId: classInfo.grade?.id,
            classId: classInfo.id,
            disableAcademicStructure: true,
          }}
          filters={{
            selectCount: false,
          }}
        />

        <TimetableBoard classId={classInfo.id} />

        <div className="h-[450px] w-full">
          <AttendanceChartContainer data={data?.classAttendances || []} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 lg:w-1/3">
        <FeeSummaryCard invoices={data?.invoices || []} />
        <UpcomingEventsCard events={data?.events || []} />
        <AnnouncementsCard announcements={data?.announcements || []} />
      </div>
    </div>
  );
};

export default ClassInfoPage;
