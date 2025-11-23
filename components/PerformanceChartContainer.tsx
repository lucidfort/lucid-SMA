import { GetResultsForPerformanceQuery, GetResultsForPerformanceQueryVariables } from '@/lib/generated/graphql/server';
import { createUrqlServerClient } from '@/lib/urql/clients/server.client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { gql } from 'urql';

const PerformanceChart = dynamic(() => import('./PerformanceChart'), {
    loading: () => <h1>Loading...</h1>,
});

const GET_RESULTS_FOR_PERFORMANCE = gql(`
    query GetResultsForPerformance($filter: ResultFilter!, $termId: ID) {
        results(filter: $filter) {
            id
            score
            exam(termId: $termId) {
                id
                maxScore
            }
            assignment(termId: $termId) {
                id
                maxScore
            }
        }
    }    
`)

const PerformanceChartContainer = async ({ studentId }: { studentId: string }) => {
    const { client } = await createUrqlServerClient()
    const { data } = await client.query<GetResultsForPerformanceQuery, GetResultsForPerformanceQueryVariables>(GET_RESULTS_FOR_PERFORMANCE, { filter: { studentId } }).toPromise()

    const results = data?.results ?? []

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalMaxScore = results.reduce((sum, r) => sum + (r.exam?.maxScore ?? 0) + (r.assignment?.maxScore ?? 0), 0)

    const performance = totalMaxScore ? (totalScore / totalMaxScore) * 10 : 1.0;

    const chartData = [
        { name: "Group A", value: performance * 100, fill: "#C3EBFA" },
        { name: "Group B", value: (10 - performance) * 100, fill: "#FAE27C" },
    ];


    return (
        <div className="bg-white p-4 rounded-md h-80 relative">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Performance</h2>
                <Image src="/moreDark.svg" alt="" width={16} height={16} />
            </div>

            <PerformanceChart data={chartData} />

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-3xl font-bold">{performance.toFixed(1)}</p>
                <p className="text-xs text-gray-300">of 10 max GPI</p>
            </div>

            <h3 className="font-medium absolute bottom-16 left-0 right-0 m-auto text-center">
                Assignments & Exams
            </h3>
        </div>
    )
}

export default PerformanceChartContainer