import { DataTable } from "@/components/tables/data-table";
import { getCurrentUser } from "@/lib/server/utils";
import { gql } from "@urql/core";
import { GetTermsQuery } from "@/lib/generated/graphql/server";
import { termsColumns } from "@/components/tables/termColumns";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";

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
  const { accessLevel } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query<GetTermsQuery>(GET_TERMS, {});

  const formattedData = data?.terms?.map(term => ({
    ...term,
    year: term.academicYear.year,
    academicYearId: term.academicYear.id
  }))

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={termsColumns}
        data={formattedData ?? []}
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
