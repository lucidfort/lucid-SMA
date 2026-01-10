import InvoicePaymentForm from "@/components/form/InvoicePaymentForm";
import { SearchParams } from "@/types";
import { getCurrentUser } from "@/lib/utils/server.utils";

const FeePaymentPage = async ({ searchParams }: SearchParams) => {
  const { invoice, studentId } = await searchParams;

  const { accessLevel } = await getCurrentUser();

  return (
    <div className="flex-center m-4 mx-auto w-full max-w-[50rem] flex-1 flex-col gap-8 rounded-md bg-white p-4">
      <h1 className="text-2xl font-semibold">Invoice Payment</h1>

      <div className="w-full">
        <InvoicePaymentForm
          invoiceId={invoice}
          studentId={studentId}
          accessLevel={accessLevel!}
        />
      </div>
    </div>
  );
};

export default FeePaymentPage;
