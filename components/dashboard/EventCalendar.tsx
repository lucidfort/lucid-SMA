"use client";

import { isToday, isWeekend } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Props {
  view?: "month" | "year" | "decade" | "century";
  minDate?: Date;
  maxDate?: Date;
  disableWeekends?: boolean;
}

const EventCalendar = ({
  view = "month",
  minDate,
  maxDate,
  disableWeekends = false,
}: Props) => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();

  useEffect(() => {
    if (!(value instanceof Date)) return;

    const isoDate = value.toLocaleDateString("en-CA");
    const params = new URLSearchParams(window.location.search);

    if (!params.get("date")) {
      params.set("date", isoDate);
      router.replace(`?${params.toString()}`);
    }
  }, []);

  useEffect(() => {
    if (!(value instanceof Date)) return;

    const isoDate = value.toLocaleDateString("en-CA");
    const params = new URLSearchParams(window.location.search);

    if (params.get("date") === isoDate) return;

    params.set("date", isoDate);
    router.replace(`?${params.toString()}`);
  }, [value]);

  return (
    <Calendar
      onChange={onChange}
      onClickMonth={(date) => {
        onChange(date);
      }}
      value={value}
      view={view}
      minDate={minDate}
      maxDate={maxDate}
      tileDisabled={({ date }) => disableWeekends && isWeekend(date)}
      tileClassName={({ date }) =>
        isToday(date) ? "bg-primary text-white" : undefined
      }
      showNeighboringMonth={false}
    />
  );
};

export default EventCalendar;
