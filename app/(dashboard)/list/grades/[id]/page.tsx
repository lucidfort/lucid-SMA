import Announcements from "@/components/Announcements";
import DeleteModal from "@/components/DeleteModal";
import DropdownOptions from "@/components/DropdownOptions";
import EventList from "@/components/EventList";
import FeeSummary from "@/components/FeeSummary";
import FormModal from "@/components/FormModal";
import { UserAvatar } from "@/components/shareable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GetGradeQuery,
  GetGradeQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { SearchParams } from "@/types";
import { gql } from "@urql/core";
import Link from "next/link";
import { notFound } from "next/navigation";

const GET_GRADE = gql`
  query GetGrade($id: ID!) {
    grade(id: $id) {
      id
      name
      classes {
        id
        name
        studentCount
        supervisors {
          id
          name
          surname
          img
        }
      }
    }
  }
`;

const GradeDetailsPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetGradeQuery, GetGradeQueryVariables>(
    GET_GRADE,
    { id },
  );

  const grade = data?.grade;
  if (!grade) notFound();

  const studentCount = grade.classes.reduce((acc, c) => {
    return acc + c.studentCount;
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

              {["manager", "administration"].includes(accessLevel!) && (
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
                      <span className="pl-2.5 text-sm text-destructive">
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

          {grade.classes.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Supervisor</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {item.supervisors.length > 0 &&
                  item.supervisors.map((supervisor) => (
                    <Link
                      key={supervisor.id}
                      href={`/list/staffs/${supervisor.id}`}
                      className="flex items-center gap-3"
                    >
                      <UserAvatar name="" img={supervisor.img} />
                      <h3>
                        {supervisor.name} {supervisor.surname}
                      </h3>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          ))}
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
        <Announcements gradeId={grade.id} />
        <EventList gradeId={grade.id} />
        <FeeSummary gradeId={grade.id} />
      </div>
    </div>
  );
};

export default GradeDetailsPage;
