"use client";

import { ClubSchema, clubSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import {
  CreateClubMutation,
  UpdateClubMutation,
  useCreateClubMutation,
  useUpdateClubMutation,
} from "@/lib/generated/graphql/client";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const ClubForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const [createMutationResult, createLesson] = useCreateClubMutation();
  const [updateMutationResult, updateLesson] = useUpdateClubMutation();

  const form = useForm<ClubSchema>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      foundedAt: data.foundedAt ? new Date(data?.foundedAt) : undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    const response =
      type === "create"
        ? await createLesson({ input: formData })
        : await updateLesson({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateClubMutation)?.createClub
        : (response.data as UpdateClubMutation)?.updateClub;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateClubSuccess" ||
      mutationResult.__typename === "MutationUpdateClubSuccess"
    ) {
      toast.success(`Club ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const isLoading =
    createMutationResult.fetching || updateMutationResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Name"
            name="name"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          <InputField
            label="Description"
            name="description"
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
          />

          <InputField
            label="Founded At"
            name="foundedAt"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
          />
        </div>

        <button
          type="submit"
          className="form-submit_btn"
          disabled={!form.formState.isDirty || isLoading}
        >
          {!isLoading ? type : <Loader2 className="animate-spin" />}
        </button>
      </form>
    </Form>
  );
};

export default ClubForm;
