import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import {
  GetAssignmentQuery,
  GetAssignmentQueryVariables,
} from "@/lib/generated/graphql/server";
import { SearchParams } from "@/types";
import { DataTable } from "@/components/table/column/data-table";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { examResultColumn } from "@/components/table/column/examResultColumn";
import ResultStatCard from "@/components/dashboard/cards/ResultStatCard";
import { ScoreDistributionChartContainer } from "@/components/dashboard";
import { Calendar, FileText, Users } from "lucide-react";
import ExportResultButton from "@/components/dashboard/buttons/ExportResultButton";
import { schoolTerms } from "@/lib/constants";

const GET_ASSIGNMENT = gql(`
    query GetAssignment($id: ID!) {
        assignment(id: $id) {
            id
            createdAt
            dueDate
            maxScore
            term {
                session
                academicYear {
                    year
                }
            }
            subject {
                id
                name
            }
            class {
              id
              name
                grade {
                    name
                }
              students {
                id
                name
                surname
                registrationNumber
              }
            }
            results {
                studentId
                score
            }
        }
    }
`);

const AssignmentSummaryPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<
      GetAssignmentQuery,
      GetAssignmentQueryVariables
    >(GET_ASSIGNMENT, { id })
    .toPromise();

  const assignment = data?.assignment;

  if (!assignment) notFound();

  const { accessLevel } = await getCurrentUser();

  const tableData = assignment.class.students.map((s) => ({
    studentId: s.id,
    studentName: `${s.name} ${s.surname}`,
    studentRegNo: s.registrationNumber,
    studentScore:
      assignment.results.find((r) => r.studentId === s.id)?.score ?? 0,
    classId: assignment.class.id,
    className: assignment.class.name,
  }));

  const studentsCount = assignment.class.students.length;

  const exportContext = {
    subject: assignment.subject.name,
    grade: assignment.class.grade.name,
    class: assignment.class.name,
    maxScore: assignment.maxScore,
    term: assignment.term.session,
    academicYear: assignment.term.academicYear.year,
    date: new Date(assignment.dueDate),
  };

  return (
    <div className="m-4 mt-0 flex flex-1 flex-col gap-4">
      <div className="bg-background rounded-md border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                {assignment.subject.name} Assignment
              </h1>
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {
                    schoolTerms.find((t) => t.id === assignment.term.session)
                      ?.name
                  }{" "}
                  Term {assignment.term.academicYear.year}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(assignment.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {studentsCount} Students
                </div>
              </div>
            </div>

            <ExportResultButton results={tableData} context={exportContext} />
          </div>
        </div>
      </div>

      <ResultStatCard maxScore={assignment.maxScore} results={tableData} />

      <ScoreDistributionChartContainer
        results={tableData}
        maxScore={assignment.maxScore}
      />

      <div className="rounded-md bg-white p-4">
        <DataTable
          title="Test Results"
          columns={examResultColumn}
          data={tableData}
          accessLevel={accessLevel!}
          tableFor="assessment-result"
          filters={{ termFilter: false, sortFilter: false, selectCount: false }}
        />
      </div>
    </div>
  );
};
export default AssignmentSummaryPage;
