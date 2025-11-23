import FormModal from "@/components/FormModal";
import { dayOfWeek } from "@/constants";
import {
  GetTimetableQuery,
  GetTimetableQueryVariables,
  PeriodSlot,
} from "@/lib/generated/graphql/server";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";
import { Clock } from "lucide-react";

const GET_TIMETABLE = gql`
  query GetTimetable($classId: ID!) {
    timetable(classId: $classId) {
      id
      startTime
      endTime
      periodSlots {
        id
        dayOfWeek
        timetableAssignments(classId: $classId) {
          id
          teacher {
            id
            name
            surname
          }
          subject {
            id
            name
          }
        }
      }
    }
  }
`;

const TimetableBoard = async ({ classId }: { classId: string }) => {
  const { client } = await createUrqlServerClient();
  const { data, error } = await client
    .query<
      GetTimetableQuery,
      GetTimetableQueryVariables
    >(GET_TIMETABLE, { classId })
    .toPromise();

  const timetable = data?.timetable || [];

  const getAssignmentForDay = (periodSlots: PeriodSlot[], dayIndex: number) => {
    const slot = periodSlots.find((p) => p.dayOfWeek === dayIndex);
    const assignment = slot?.timetableAssignments?.[0];

    if (!slot) {
      return { unregistered: true };
    }

    if (!assignment)
      return {
        periodSlotId: slot?.id,
        unassigned: true,
      };

    return {
      periodSlotId: slot?.id,
      subject: {
        id: assignment.subject?.id,
        name: assignment.subject?.name || "—",
      },
      teacher: {
        id: assignment.teacher?.id,
        name: `${assignment.teacher?.name || ""} ${assignment.teacher?.surname || ""}`.trim(),
      },
    };
  };

  const daysOfWeek = timetable.flatMap((item) =>
    item.periodSlots.map((slot) => slot.dayOfWeek.toString()),
  );

  return (
    <div className="rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="my-4 text-xl font-semibold">Class Timetable</h2>
        <FormModal
          type="create"
          table="timetable"
          data={{ classId, formType: "period", daysOfWeek }}
        />
      </div>

      <div className="overflow-x-auto">
        {error ? (
          <div className="flex-center h-16 text-sm font-light text-red-500">
            Can&apos;t get timetable at the moment. Please try again later.
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 border-b border-border">
              <div className="flex items-center gap-2 bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Time
              </div>
              {dayOfWeek.map((day) => (
                <div
                  key={day}
                  className="border-l border-border bg-muted/50 p-4 text-center text-sm font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Rows for each period */}
            {timetable.map((period: any) => {
              const timeSlot = `${period.startTime} - ${period.endTime}`;

              return (
                <div
                  key={period.id}
                  className="grid grid-cols-6 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center bg-muted/30 p-4">
                    <div className="text-sm font-medium">{timeSlot}</div>
                  </div>

                  {dayOfWeek.map((_, dayIndex) => {
                    const slot = getAssignmentForDay(
                      period.periodSlots,
                      dayIndex + 1,
                    );

                    return (
                      <div
                        key={`${period.id}-${dayIndex}`}
                        className="flex min-h-[80px] items-center justify-center border-l border-border p-2"
                      >
                        <FormModal
                          table="timetable"
                          type="create"
                          data={{
                            formType: "assignment",
                            startTime: period.startTime,
                            endTime: period.endTime,
                            daysOfWeek: [(dayIndex + 1).toString()],
                            classId,
                            ...slot,
                          }}
                        >
                          {slot.unregistered ? (
                            <button
                              disabled={true}
                              className="text-xs text-gray-400 italic"
                            >
                              Not Registered
                            </button>
                          ) : slot.unassigned ? (
                            <div className="cursor-pointer text-xs text-muted-foreground/50">
                              Free Period
                            </div>
                          ) : (
                            <div className="w-full cursor-pointer rounded-md bg-yellow-100 p-2 text-center transition hover:bg-yellow-200">
                              <div className="mb-1 text-sm font-medium">
                                {slot.subject?.name}
                              </div>
                              {slot.teacher?.name && (
                                <div className="text-xs text-gray-500">
                                  {slot.teacher.name}
                                </div>
                              )}
                            </div>
                          )}
                        </FormModal>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableBoard;
