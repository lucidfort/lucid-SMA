"use client";

import FormModal from "@/components/form/ui/FormModal";
import { dayOfWeek } from "@/lib/constants";
import { Clock } from "lucide-react";
import { useGetTimetableQuery } from "@/lib/generated/graphql/client";

type TimetablePeriod = {
  id: string;
  startMinute: number;
  endMinute: number;
  assignments: {
    id: string;
    dayOfWeek: number;
    teacher?: {
      id: string;
      name: string;
      surname: string;
    } | null;
    subject?: {
      id: string;
      name: string;
    } | null;
  }[];
};

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const TimetableBoard = ({ classId }: { classId: string }) => {
  const [{ data, error }] = useGetTimetableQuery({
    variables: { filter: { classId } },
  });

  const timetable: TimetablePeriod[] = data?.timetable ?? [];
  console.log(timetable);

  const getAssignmentForDay = (
    assignments: TimetablePeriod["assignments"],
    dayIndex: number,
  ) => {
    return assignments.find((a) => a.dayOfWeek === dayIndex) ?? null;
  };

  return (
    <div className="rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="my-4 text-xl font-semibold">Class Timetable</h2>

        <FormModal
          type="create"
          table="timetable"
          data={{
            classId,
            formType: "period",
          }}
        />
      </div>

      <div className="overflow-x-auto">
        {error ? (
          <div className="flex-center h-16 text-sm font-light text-red-500">
            Can&apos;t get timetable at the moment. Please try again later.
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b">
              <div className="bg-muted/50 flex items-center gap-2 p-4 text-sm font-semibold">
                <Clock className="h-4 w-4" />
                Time
              </div>

              {dayOfWeek.map((day) => (
                <div
                  key={day}
                  className="bg-muted/50 border-l p-4 text-center text-sm font-semibold"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Period rows */}
            {timetable.map((period) => {
              const timeSlot = `${formatMinutes(
                period.startMinute,
              )} – ${formatMinutes(period.endMinute)}`;

              return (
                <div
                  key={period.id}
                  className="grid grid-cols-6 border-b last:border-b-0"
                >
                  <div className="bg-muted/30 flex items-center p-4">
                    <div className="text-sm font-medium">{timeSlot}</div>
                  </div>

                  {dayOfWeek.map((_, index) => {
                    const dayIndex = index + 1;
                    const assignment = getAssignmentForDay(
                      period.assignments,
                      dayIndex,
                    );

                    return (
                      <div
                        key={`${period.id}-${dayIndex}`}
                        className="flex min-h-[80px] items-center justify-center border-l p-2"
                      >
                        <FormModal
                          table="timetable"
                          type="create"
                          data={{
                            formType: "assignment",
                            periodId: period.id,
                            dayOfWeek: dayIndex,
                            classId,
                          }}
                        >
                          {!assignment ? (
                            <div className="text-muted-foreground/50 cursor-pointer text-xs">
                              Free Period
                            </div>
                          ) : (
                            <div className="w-full cursor-pointer rounded-md bg-yellow-100 p-2 text-center transition hover:bg-yellow-200">
                              <div className="mb-1 text-sm font-medium">
                                {assignment.subject?.name ?? "—"}
                              </div>

                              {assignment.teacher && (
                                <div className="text-xs text-gray-500">
                                  {`${assignment.teacher.name} ${assignment.teacher.surname}`}
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
