import { examsColumn } from "@/components/table/column/examsColumn";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { gql } from "@urql/core";
import { DataTable } from "@/components/table/column/data-table";
import {
  GetExamsQuery,
  GetExamsQueryVariables,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { SearchParams } from "@/types";

const GET_EXAMS = gql(`
  query GetExams($filter: ExamFilter) {
    exams(filter: $filter) {
      id
      date
      type
      maxScore
      grade {
        id 
        name
      }
      subject {
        id 
        name
      }
    }
  }
`);

const ExamsListPage = async ({ searchParams }: SearchParams) => {
  const { term } = await searchParams;
  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<GetExamsQuery, GetExamsQueryVariables>(GET_EXAMS, {
      filter: {
        termId: term,
      },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={examsColumn}
        data={data?.exams ?? []}
        accessLevel={accessLevel!}
        tableFor="exam"
        title="Exams"
        filters={{ selectCount: false, termFilter: true }}
      />
    </div>
  );
};

export default ExamsListPage;
