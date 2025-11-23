"use client";

import {
  timetableAssignmentSchema,
  TimetableAssignmentSchema,
} from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";
import { Form } from "../ui/form";
import { SelectContent, SelectItem } from "../ui/select";
import {
  AccessLevel,
  AssignTimetablePeriodMutation,
  UpdateTimetableAssignmentMutation,
  useAssignTimetablePeriodMutation,
  useGetStaffsQuery,
  useGetSubjectsQuery,
  useUpdateTimetableAssignmentMutation,
} from "@/lib/generated/graphql/client";
import { dayOfWeek } from "@/constants";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const TimetableForm = ({ data, setOpen }: FormProps) => {
  const router = useRouter();
  const isAssignmentForm = data.formType === "assignment";

  const form = useForm<TimetableAssignmentSchema>({
    resolver: zodResolver(timetableAssignmentSchema),
    defaultValues: {
      id: data?.id,
      daysOfWeek: data?.daysOfWeek ?? [],
      startTime: data?.startTime ?? "",
      endTime: data?.endTime ?? "",

      subjectId: data?.subject?.id ?? null,
      teacherId: data?.teacher?.id ?? null,
    },
  });

  const [subjectsResult] = useGetSubjectsQuery({ pause: !isAssignmentForm });
  const [teachersResult] = useGetStaffsQuery({
    pause: !isAssignmentForm,
    variables: { filter: { isActive: true, accessLevel: AccessLevel.Teacher } },
  });

  const [assignmentResult, assignTimetable] =
    useUpdateTimetableAssignmentMutation();
  const [periodAssignmentResult, assignPeriod] =
    useAssignTimetablePeriodMutation();

  const isLoading =
    assignmentResult.fetching || periodAssignmentResult.fetching;

  const onSubmit = form.handleSubmit(async (values) => {
    if (isAssignmentForm && !data.periodSlotId) {
      toast.error(
        "You have not registered this slot. Please register before continuing",
      );
      return;
    }

    const response = isAssignmentForm
      ? await assignTimetable({
          input: {
            classId: data.classId,
            periodSlotId: data.periodSlotId,
            subjectId: values.subjectId,
            teacherId: values.teacherId,
          },
        })
      : await assignPeriod({
          input: {
            startTime: values.startTime,
            endTime: values.endTime,
            daysOfWeek: values.daysOfWeek,
          },
        });

    const mutationResult = isAssignmentForm
      ? (response.data as UpdateTimetableAssignmentMutation)
          ?.updateTimetableAssignment
      : (response.data as AssignTimetablePeriodMutation)?.updatePeriodSlot;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename ===
        "MutationUpdateTimetableAssignmentSuccess" ||
      mutationResult.__typename === "MutationUpdatePeriodSlotSuccess"
    ) {
      toast.success(`Assigned successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.MULTI_SELECT}
            label="Days"
            name="daysOfWeek"
            placeholder="Select days"
            options={dayOfWeek.map((day, index) => ({
              id: (index + 1).toString(),
              name: day,
            }))}
            disabled={isAssignmentForm}
          />

          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            disabled={isAssignmentForm}
            inputProps={{
              min: "07:00",
              max: "18:00",
              step: "1800",
            }}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            disabled={isAssignmentForm}
            inputProps={{
              min: "07:00",
              max: "18:00",
              step: "1800",
            }}
          />

          {isAssignmentForm && (
            <>
              <InputField
                label="Subject"
                name="subjectId"
                control={form.control}
                fieldType={FormFieldType.SELECT}
              >
                <SelectContent>
                  {subjectsResult.data?.subjects?.map(({ id, name }) => (
                    <SelectItem key={id} value={id!}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </InputField>

              <InputField
                label="Teacher"
                name="teacherId"
                control={form.control}
                fieldType={FormFieldType.SELECT}
              >
                <SelectContent>
                  {teachersResult.data?.staffs?.map(({ id, name }) => (
                    <SelectItem key={id} value={id!}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </InputField>
            </>
          )}
        </div>

        <button
          type="submit"
          className="form-submit_btn"
          disabled={!form.formState.isDirty || isLoading}
        >
          {!isLoading ? (
            <>{isAssignmentForm ? "Update" : "Create"}</>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default TimetableForm;
