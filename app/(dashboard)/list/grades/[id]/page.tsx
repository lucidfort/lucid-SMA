import AnnouncementsCard from "@/components/dashboard/cards/AnnouncementsCard";
import DeleteModal from "@/components/dashboard/DeleteModal";
import DropdownOptions from "@/components/dashboard/DropdownOptions";
import UpcomingEventsCard from "@/components/dashboard/cards/UpcomingEventsCard";
import FeeSummaryCard from "@/components/dashboard/cards/FeeSummaryCard";
import FormModal from "@/components/form/ui/FormModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GetGradeQuery,
  GetGradeQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams, UserAuth } from "@/types";
import { gql } from "@urql/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startOfDay, subDays } from "date-fns";

const GET_GRADE = gql`
  query GetGrade(
    $id: ID!
    $eventFilter: EventFilter!
    $announcementFilter: AnnouncementFilter!
    $invoiceSummaryFilter: InvoiceFilter!
  ) {
    grade(id: $id) {
      id
      name
      activeStudentsCount
      classes {
        id
        name
        activeStudentsCount
        supervisors {
          teacher {
            id
            name
            surname
          }
        }
      }
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

const GradeDetailsPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const { accessLevel } = user as UserAuth;

  const today = new Date();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetGradeQuery, GetGradeQueryVariables>(
    GET_GRADE,
    {
      id,
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

  if (!data?.grade) notFound();

  const grade = data.grade;
  const studentCount = grade.classes.reduce((acc, c) => {
    return acc + c.activeStudentsCount;
  }, 0);

  const cards = [
    {
      label: "Class",
      value: grade.name,
    },
    {
      label: "Active Classes",
      value: grade.classes.length,
    },
    {
      label: "Active Students",
      value: studentCount,
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full flex-col gap-8 lg:w-2/3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Grade Information</CardTitle>

              {["manager"].includes(accessLevel!) && (
                <DropdownOptions>
                  <DropdownMenuItem asChild>
                    <FormModal
                      table="grade"
                      type="update"
                      data={grade}
                      triggerTitle="Update"
                    />
                  </DropdownMenuItem>

                  <DropdownMenuItem>Deactivate</DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-destructive" asChild>
                    <DeleteModal id={grade.id!} table="grade">
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

          {grade.classes.map(
            ({ id, name, supervisors, activeStudentsCount }) => (
              <Card key={id}>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>
                    {grade.name} {name}
                  </CardTitle>

                  <div>
                    <FormModal
                      table="class-assignment"
                      type="create"
                      data={{ gradeId: grade.id, classId: id }}
                      triggerTitle="Assign Supervisor"
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-3">
                    <div>Supervisor(s): </div>
                    <div>
                      {!supervisors || supervisors.length === 0 ? (
                        <p>Not assigned</p>
                      ) : (
                        <>
                          {supervisors
                            .map(({ teacher }) => (
                              <Link
                                key={teacher.id}
                                href={`/list/staffs/${teacher.id}`}
                              >
                                {teacher.name} {teacher.surname}
                              </Link>
                            ))
                            .join(", ")}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div>Active Students: </div>
                    <div>{activeStudentsCount}</div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6"></CardContent>
          </Card>
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 lg:w-1/3">
        <UpcomingEventsCard events={data?.events || []} />
        <AnnouncementsCard announcements={data?.announcements || []} />
        <FeeSummaryCard invoices={data?.invoices || []} />
      </div>
    </div>
  );
};

export default GradeDetailsPage;
