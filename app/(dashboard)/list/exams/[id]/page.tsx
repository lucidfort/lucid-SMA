import { gql } from "@urql/core";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import {
  GetExamQuery,
  GetExamQueryVariables,
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

const GET_EXAM = gql(`
    query GetExam($id: ID!) {
        exam(id: $id) {
            id
            date
            maxScore
            type
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
            grade {
                id
                name
              classes {
                id
                name
                students {
                  id
                  name 
                  surname
                    registrationNumber
                }
              }
            }
            results {
              studentId
              score
            }
        }
    }
`);

const ExamSummaryPage = async ({ params }: SearchParams) => {
  const { id } = await params;
  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<GetExamQuery, GetExamQueryVariables>(GET_EXAM, { id })
    .toPromise();

  const exam = data?.exam;

  if (!exam) notFound();

  const { accessLevel } = await getCurrentUser();

  const tableData = exam.grade.classes.flatMap((c) => {
    return c.students.map((student) => {
      const testScore = exam.results.find(
        (r) => r.studentId === student.id,
      )?.score;

      return {
        studentId: student.id,
        studentName: `${student.name} ${student.surname}`,
        studentRegNo: student.registrationNumber,
        studentScore: testScore ?? 0,
        classId: c.id,
        className: c.name,
      };
    });
  });

  const studentsCount = exam.grade.classes.reduce(
    (sum, c) => sum + c.students.length,
    0,
  );

  const exportContext = {
    subject: exam.subject.name,
    grade: exam.grade.name,
    maxScore: exam.maxScore,
    term: exam.term.session,
    academicYear: exam.term.academicYear.year,
    date: new Date(exam.date),
    examType: exam.type,
  };

  return (
    <div className="m-4 mt-0 flex flex-1 flex-col gap-4">
      <div className="bg-background rounded-md border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                {exam.subject.name} Exam
              </h1>
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {
                    schoolTerms.find((t) => t.id === exam.term.session)?.name
                  }{" "}
                  Term {exam.term.academicYear.year}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(exam.date).toLocaleDateString("en-US", {
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

      <ResultStatCard maxScore={exam.maxScore} results={tableData} />

      <ScoreDistributionChartContainer
        results={tableData}
        maxScore={exam.maxScore}
      />

      <div className="rounded-md bg-white p-4">
        <DataTable
          title="Test Results"
          columns={examResultColumn}
          data={tableData}
          accessLevel={accessLevel!}
          tableFor="exam-result"
          filters={{ termFilter: false, sortFilter: false, selectCount: false }}
        />
      </div>
    </div>
  );
};
export default ExamSummaryPage;
