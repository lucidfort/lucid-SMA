"use client";

import { Form } from "@/components/ui/form";
import {
  CreateParentMutation,
  UpdateParentMutation,
  useCreateParentMutation,
  useGetSchoolSlugQuery,
  useUpdateParentMutation,
} from "@/lib/generated/graphql/client";
import { ParentSchema, parentSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { useUser } from "@clerk/nextjs";

const ParentForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      ...data,
      primaryId: data?.primaryId.split("-s")[1] ?? "",
    },
  });

  const [schoolResult] = useGetSchoolSlugQuery({
    variables: { id: (user?.publicMetadata?.schoolId as string) ?? "" },
    requestPolicy: "cache-first",
  });

  const [createResult, createParent] = useCreateParentMutation();
  const [updateResult, updateParent] = useUpdateParentMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && {
        id: data.id,
        clerkUserId: data?.clerkUserId,
      }),
      ...values,
    };

    const res =
      type === "create"
        ? await createParent({ input: formData })
        : await updateParent({ input: formData });

    const mutationResult =
      type === "create"
        ? (res.data as CreateParentMutation)?.createParent
        : (res.data as UpdateParentMutation)?.updateParent;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateParentSuccess" ||
      mutationResult.__typename === "MutationUpdateParentSuccess"
    ) {
      toast.success(`Parent ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const slug = schoolResult.data?.school?.slug;

  const isLoading = createResult.fetching || updateResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <span className="text-xs font-medium text-gray-400">
          Personal Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="First Name"
            name="name"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Surname"
            name="surname"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Phone"
            name="phone"
            type="tel"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Address"
            name="address"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
        </div>

        <span className="mt-6 text-xs font-medium text-gray-400">
          Authentication Information - Only for primary parents
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Username"
            name="primaryId"
            placeholder="202"
            prefix={`${slug}_s`}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            control={form.control}
            fieldType={FormFieldType.INPUT}
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
            <Loader2 className="text-lamaYellow animate-spin" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default ParentForm;
