"use client";

import { announcementSchema, AnnouncementSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import { Form } from "@/components/ui/form";
import {
  CreateAnnouncementMutation,
  UpdateAnnouncementMutation,
  useCreateAnnouncementMutation,
  useGetGradesQuery,
  useUpdateAnnouncementMutation,
} from "@/lib/generated/graphql/client";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";

const AnnouncementForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const [gradesResult] = useGetGradesQuery();
  const grades = gradesResult?.data?.grades ?? [];

  const form = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      content: data?.content ?? "",
      announcementType: data?.staffOnly ? "STAFF_ONLY" : "GENERAL",
      gradeId: data?.grade?.id,
    },
  });

  const [createResult, createAnnouncement] = useCreateAnnouncementMutation();
  const [updateResult, updateAnnouncement] = useUpdateAnnouncementMutation();

  const onSubmit = form.handleSubmit(
    async ({ announcementType, ...values }) => {
      const formData = {
        ...values,
        staffOnly: announcementType === "STAFF_ONLY",
      };

      const response =
        type === "create"
          ? await createAnnouncement({ input: formData })
          : await updateAnnouncement({ input: formData });

      const mutationResult =
        type === "create"
          ? (response.data as CreateAnnouncementMutation)?.createAnnouncement
          : (response.data as UpdateAnnouncementMutation)?.updateAnnouncement;

      if (!mutationResult) {
        toast.error("Something went wrong");
        return;
      }

      if (
        mutationResult.__typename === "MutationCreateAnnouncementSuccess" ||
        mutationResult.__typename === "MutationUpdateAnnouncementSuccess"
      ) {
        toast.success(`Announcement ${type}d successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        const error = handleGraphqlClientErrors(mutationResult);
        toast.error(error ?? "Something went wrong");
      }
    },
  );

  const isLoading = createResult.fetching || updateResult.fetching;
  const announcementType = form.watch("announcementType");

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Type"
            name="announcementType"
          >
            <SelectContent>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="STAFF_ONLY">Staff Only</SelectItem>
            </SelectContent>
          </InputField>

          <InputField
            label="Title"
            name="title"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          {announcementType === "GENERAL" && (
            <InputField
              label="Grade"
              name="gradeId"
              control={form.control}
              fieldType={FormFieldType.SELECT}
            >
              <SelectContent>
                {grades.map(({ id, name }) => (
                  <SelectItem key={id} value={id!} className="py-1">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </InputField>
          )}

          <InputField
            label="Description"
            name="content"
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
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

export default AnnouncementForm;
