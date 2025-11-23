"use client";

import {
  CreateInvoiceMutation,
  UpdateInvoiceMutation,
  useCreateInvoiceMutation,
  useGetGradesQuery,
  useGetTermsQuery,
  useUpdateInvoiceMutation,
} from "@/lib/generated/graphql/client";
import { generateUuid, handleGraphqlClientErrors } from "@/lib/utils";
import { InvoiceSchema, invoiceSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "../InputField";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SelectContent, SelectItem } from "../ui/select";

const InvoiceForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      id: data?.id,
      number: data?.number ?? "",
      termId: data?.termId ?? "",
      amount: data?.amount ?? 0,
      title: data?.title ?? "",
      grades: data?.grades?.map((g: { id: string }) => g.id) ?? null,
      dueDate: data?.dueDate ? new Date(data.dueDate) : null,
    },
  });

  const [termsResult] = useGetTermsQuery({ variables: { take: 2 } });
  const [gradesResult] = useGetGradesQuery();

  const terms = termsResult.data?.terms ?? [];
  const grades = gradesResult.data?.grades ?? [];

  const [createResult, createInvoice] = useCreateInvoiceMutation();
  const [updateResult, updateInvoice] = useUpdateInvoiceMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    const response =
      type === "create"
        ? await createInvoice({ input: formData })
        : await updateInvoice({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateInvoiceMutation)?.createInvoice
        : (response.data as UpdateInvoiceMutation)?.updateInvoice;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateInvoiceSuccess" ||
      mutationResult.__typename === "MutationUpdateInvoiceSuccess"
    ) {
      toast.success(`Invoice ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading = createResult.fetching || updateResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="termId"
            label="Term"
            placeholder="Select Term"
          >
            <SelectContent>
              {terms.map(({ id, term, isCurrent, academicYear }) => (
                <SelectItem key={id} value={id}>
                  {academicYear.year} - {term} {isCurrent ? "(Current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="number">Number</Label>
            <div className="relative">
              <Input
                {...form.register("number")}
                placeholder="Generate a number"
                disabled
                className="w-full rounded-md p-2 text-sm ring-[1.5px] ring-gray-300"
              />

              <button
                type="button"
                className="absolute top-1/2 right-4 w-4 -translate-y-1/2 cursor-pointer bg-white"
                onClick={() => {
                  const key = generateUuid();
                  form.setValue("number", key, { shouldValidate: true });
                }}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <InputField
            label="Title"
            name="title"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          <InputField
            label="Amount"
            name="amount"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            inputProps={{
              step: 1000,
            }}
          />

          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.MULTI_SELECT}
            name="grades"
            label="Grades"
            options={grades}
          />
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {!isLoading ? (
            type
          ) : (
            <Loader2 className="animate-spin text-lamaYellow" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default InvoiceForm;
