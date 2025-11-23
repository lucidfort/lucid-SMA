import TransactionForm from '@/components/forms/TransactionForm'
import { SearchParams } from '@/types'

const FeePaymentPage = async ({ searchParams }: SearchParams) => {
    const { invoiceId } = await searchParams

    return (
        <div className='flex-center flex-col w-full gap-8 max-w-[50rem] mx-auto m-4 mt-0 flex-1 rounded-md bg-white p-4'>
            <div className='w-full'>
                <TransactionForm invoiceId={invoiceId} studentId='' />
            </div>
        </div>
    )
}

export default FeePaymentPage