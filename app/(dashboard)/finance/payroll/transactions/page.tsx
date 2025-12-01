import EventCalendar from '@/components/EventCalendar';
import { DataTable } from '@/components/tables/data-table';
import { payrollProfileColumns } from '@/components/tables/payrollProfileColumns';
import { getCurrentUser } from '@/lib/server/utils';
import { createUrqlServerClient } from '@/lib/urql/clients/server.client';
import { SearchParams } from '@/types';
import { gql } from '@urql/core';
import { format, getMonth, getYear } from 'date-fns';

const GET_PAYROLL_TRANSACTIONS = gql(`
    query GetPayrollTransactions($month: Int!, $year: Int!, $paymentDate: DateTime) {
        payrollTransactions (month: $month, year: $year, paymentDate: $paymentDate) {
            id
            netAmount
            grossAmount
            paymentDate
            createdAt
            reference
            status
            staff {
                id name surname
            }
        }
    }
`)

const PayrollTransactionsPage = async ({ searchParams }: SearchParams) => {
    const { date } = await searchParams;
    const { accessLevel } = await getCurrentUser()

    const targetDate = date ? new Date(`${date}T08:12:00Z`) : new Date();

    const { client } = await createUrqlServerClient()
    const { data } = await client.query(GET_PAYROLL_TRANSACTIONS, {
        month: getMonth(targetDate),
        year: getYear(targetDate)
    })

    return (
        <div className="mt-0 w-full p-4 space-y-8">
            <div className="bg-white rounded-md w-full p-4">
                <EventCalendar view='year' />
            </div>

            <div className="bg-white rounded-md w-full p-4">
                <DataTable
                    accessLevel={accessLevel!}
                    columns={payrollProfileColumns}
                    data={data?.payrollTransactions ?? []}
                    tableFor="payroll-transaction"
                    title={`Transactions for ${format(targetDate, "MMMM yyy")}`}
                />
            </div>
        </div>
    )
}

export default PayrollTransactionsPage