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
import InputField, { FormFieldType } from "./ui/InputField";
import { Form } from "../ui/form";
import { SelectContent, SelectItem } from "../ui/select";
import {
  AccessLevel,
  AssignTimetablePeriodMutation,
  CreateTimetablePeriodMutation,
  useAssignTimetablePeriodMutation,
  useCreateTimetablePeriodMutation,
  useGetStaffsQuery,
  useGetSubjectsQuery,
} from "@/lib/generated/graphql/client";
import { dayOfWeek } from "@/lib/constants";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";

const TimetableForm = ({ data, setOpen }: FormProps) => {
  const router = useRouter();
  const isAssignmentForm = data.formType === "assignment";

  const form = useForm<TimetableAssignmentSchema>({
    resolver: zodResolver(timetableAssignmentSchema),
    defaultValues: {
      dayOfWeek: data?.daysOfWeek ?? [],
      startMinute: data?.startMinute ?? "",
      endMinute: data?.endMinute ?? "",

      subjectId: data?.subject?.id ?? null,
      teacherId: data?.teacher?.id ?? null,
    },
  });

  const [subjectsResult] = useGetSubjectsQuery({ pause: !isAssignmentForm });
  const [teachersResult] = useGetStaffsQuery({
    pause: !isAssignmentForm,
    variables: { filter: { isActive: true, accessLevel: AccessLevel.Teacher } },
  });

  const [assignmentResult, assignPeriod] = useAssignTimetablePeriodMutation();
  const [periodAssignmentResult, createPeriod] =
    useCreateTimetablePeriodMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    if (isAssignmentForm && !data.periodId) {
      toast.error(
        "You have not registered this slot. Please register before continuing",
      );
      return;
    }

    const response = isAssignmentForm
      ? await assignPeriod({
        input: {
          dayOfWeek: 2,
          classId: data.classId,
          periodId: data.periodId,
          subjectId: values.subjectId,
          teacherId: values.teacherId,
        },
      })
      : await createPeriod({
        input: {
          startMinute: timeToMinutes(values.startMinute),
          endMinute: timeToMinutes(values.endMinute),
        },
      });

    const mutationResult = isAssignmentForm
      ? (response.data as AssignTimetablePeriodMutation)?.assignTimetablePeriod
      : (response.data as CreateTimetablePeriodMutation)?.createTimetablePeriod;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationAssignTimetablePeriodSuccess" ||
      mutationResult.__typename === "MutationCreateTimetablePeriodSuccess"
    ) {
      toast.success(`Assigned successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      throw new Error(`Invalid time value: ${time}`);
    }

    return hours * 60 + minutes;
  };

  const isLoading =
    assignmentResult.fetching || periodAssignmentResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isAssignmentForm && (
            <InputField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              label="Day"
              name="daysOfWeek"
              placeholder="Select days"
            >
              <SelectContent>
                {dayOfWeek.map((day, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </InputField>
          )}

          <InputField
            label="Start Time"
            name="startMinute"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            disabled={isAssignmentForm}
            inputProps={{
              min: "07:00",
              max: "18:00",
            }}
          />

          <InputField
            label="End Time"
            name="endMinute"
            type="time"
            control={form.control}
            fieldType={FormFieldType.INPUT}
            disabled={isAssignmentForm}
            inputProps={{
              min: "07:00",
              max: "18:00",
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
