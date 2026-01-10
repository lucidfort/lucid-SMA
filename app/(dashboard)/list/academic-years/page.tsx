import { DataTable } from "@/components/table/column/data-table";
import { getCurrentUser } from "@/lib/utils/server.utils";
import { gql } from "@urql/core";
import { GetAcademicYearsQuery } from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/server.client";
import { UserAuth } from "@/types";
import { academicYearColumn } from "@/components/table/column/academic-year-columns";

const GET_ACADEMIC_YEARS = gql(`
    query GetAcademicYears {
        academicYears {
            id
            year
            startDate
            endDate
            isCurrent
            terms(isCurrent: true) {
                id
                session
            }
        }
    }
`);

const AcademicYearsListPage = async () => {
  const { client } = await createUrqlServerClient();
  const { data } = await client
    .query<GetAcademicYearsQuery>(GET_ACADEMIC_YEARS, {})
    .toPromise();

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <DataTable
        columns={academicYearColumn}
        data={data?.academicYears ?? []}
        accessLevel={accessLevel!}
        tableFor="academic-year"
        title="Academic Years"
        filters={{ selectCount: false }}
        relatedData={{ isAcademicYearForm: true }}
      />
    </div>
  );
};
export default AcademicYearsListPage;
