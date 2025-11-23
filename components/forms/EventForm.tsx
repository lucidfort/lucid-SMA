"use client";

import { eventSchema, EventSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import {
  CreateEventMutation,
  UpdateEventMutation,
  useCreateEventMutation,
  useGetGradesQuery,
  useUpdateEventMutation,
} from "@/lib/generated/graphql/client";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const EventForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [gradesResult] = useGetGradesQuery();
  const [createResult, createEvent] = useCreateEventMutation();
  const [updateResult, updateEvent] = useUpdateEventMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...(type === "update" && { id: data.id }),
      ...values,
    };

    const response =
      type === "create"
        ? await createEvent({ input: formData })
        : await updateEvent({ input: formData });
    const mutationResult =
      type === "create"
        ? (response.data as CreateEventMutation)?.createEvent
        : (response.data as UpdateEventMutation)?.updateEvent;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateEventSuccess" ||
      mutationResult.__typename === "MutationUpdateEventSuccess"
    ) {
      toast.success(`Event ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
    console.log(formData);
  });

  const isLoading = createResult.fetching || updateResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Title"
            name="title"
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
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Grade"
            name="gradeId"
          >
            <SelectContent>
              {gradesResult.data?.grades?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Start Date"
              name="startDate"
              control={form.control}
              fieldType={FormFieldType.DATE_PICKER}
            />

            <InputField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              label="Time"
              name="startTime"
              type="time"
            />
          </div>

          <div>
            <InputField
              label="End Date"
              name="endDate"
              control={form.control}
              fieldType={FormFieldType.DATE_PICKER}
            />

            <InputField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              label="Time"
              name="endTime"
              type="time"
            />
          </div>
          {/*toDatetimeLocal(data?.startTime)*/}
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

export default EventForm;
