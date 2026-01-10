import { DataTable } from "@/components/table/column/data-table";
import { termColumns } from "@/components/table/column/termColumns";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { GetTermsQuery } from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";

import { gql } from "@urql/core";

const GET_TERMS = gql(`
    query GetTerms {
        terms {
            id
            session
            startDate
            endDate
            isCurrent
            academicYear {
              id
              year
            }
        }
    }
`);

const TermsListPage = async () => {
  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetTermsQuery>(GET_TERMS, {});

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={termColumns}
        data={data?.terms ?? []}
        accessLevel={accessLevel!}
        tableFor="term"
        title="Terms"
        filters={{ selectCount: false }}
        relatedData={{ isAcademicYearForm: false }}
      />
    </div>
  );
};
export default TermsListPage;
