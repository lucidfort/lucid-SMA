import { DataTable } from "@/components/table/column/data-table";
import { resultsColumn } from "@/components/table/column/resultsColumn";
import {
  GetResultsQuery,
  GetResultsQueryVariables,
} from "@/lib/generated/graphql/server";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { gql } from "@urql/core";
import { SearchParams } from "@/types";

const GET_RESULTS = gql(`
  query GetResults($filter: ResultFilter!) {
    results(filter: $filter) {
      ... on AssessmentResult {
        id
        score
        uploadedAt
        student {
          id
          name 
          surname
          class {
            id 
            gradeId
          }
        }
        assignment {
          id
          termId
          maxScore
          subject {
            name
          }
        }
      }

      ...on ExamResult {
        id
        score
        uploadedAt
        student {
          id
          name
          surname
          class {
            id
            gradeId
          }
        }
        exam {
          id
          termId
          maxScore
          subject {
            name
          }
        }
      }
    }
  }
`);

const ResultsListPage = async ({ searchParams }: SearchParams) => {
  const { term } = await searchParams;
  const { client } = await createUrqlServerClient();

  const { data } = await client
    .query<GetResultsQuery, GetResultsQueryVariables>(GET_RESULTS, {
      filter: {
        termId: term,
      },
    })
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  const normalizedResults = (data?.results ?? []).map((r) => {
    switch (r.__typename) {
      case "ExamResult":
        return { ...r, test: r.exam, type: "exam" };
      case "AssessmentResult":
        return { ...r, test: r.assignment, type: "assessment" };
      default:
        return r;
    }
  });

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={resultsColumn}
        data={normalizedResults}
        accessLevel={accessLevel!}
        tableFor="exam-result"
        title="Results"
        filters={{ selectCount: false, listCreation: false, termFilter: true }}
      />
    </div>
  );
};

export default ResultsListPage;
