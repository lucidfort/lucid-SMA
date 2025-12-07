import EventCalendar from '@/components/EventCalendar';
import { DataTable } from '@/components/tables/data-table';
import { payrollTransactionsColumn } from '@/components/tables/payrollTransactionsColumn';
import { GetPayrollTransactionsQuery, GetPayrollTransactionsQueryVariables } from '@/lib/generated/graphql/server';
import { getCurrentUser } from '@/lib/server/utils';
import { createUrqlServerClient } from '@/lib/urql/clients/server.client';
import { SearchParams } from '@/types';
import { gql } from '@urql/core';
import { format, getMonth, getYear } from 'date-fns';

const GET_PAYROLL_TRANSACTIONS = gql(`
    query GetPayrollTransactions($salaryFilter: SalaryFilterInput!) {
        payrollProfile{
            id
            salary
            recipientCode
            accountName
            accountNumber
            staff {
                id
                name
                surname
            }
            transactions(filter: $salaryFilter) {
                id
                amount
                status
            }
        }
    }
`)

const PayrollTransactionsPage = async ({ searchParams }: SearchParams) => {
    const { date } = await searchParams;
    const { accessLevel } = await getCurrentUser()

    const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

    const { client } = await createUrqlServerClient()
    const { data } = await client.query<GetPayrollTransactionsQuery, GetPayrollTransactionsQueryVariables>(GET_PAYROLL_TRANSACTIONS, {
        salaryFilter: {
            month: getMonth(targetDate),
            year: getYear(targetDate)
        },
    })

    const formattedDate = format(targetDate, "MMMM yyy")

    const formattedData = data?.payrollProfile?.map(({ transactions, ...profile }) => ({
        ...profile,
        transaction: transactions?.[0],
        date: formattedDate
    })) || []

    return (
        <div className="mt-0 w-full p-4 space-y-8">
            <div className="bg-white rounded-md w-full p-4">
                <EventCalendar view='year' />
            </div>

            <div className="bg-white rounded-md w-full p-4">
                <DataTable
                    accessLevel={accessLevel!}
                    columns={payrollTransactionsColumn}
                    data={formattedData}
                    tableFor="payroll-transaction"
                    title={`Transactions for ${formattedDate}`}
                />
            </div>
        </div>
    )
}

export default PayrollTransactionsPage