"use client";

import { isWeekend } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = ({ view = "month", minDate, maxDate, disableWeekends = false }: { view?: "month" | "year" | "decade" | "century"; minDate?: Date; maxDate?: Date; disableWeekends?: boolean }) => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();

  useEffect(() => {
    if (!(value instanceof Date)) return;

    const isoDate = value.toLocaleDateString("en-CA");

    const params = new URLSearchParams(window.location.search)
    const current = params.get("date")

    if (current === isoDate) return;

    params.set("date", isoDate);

    router.replace(`?${params.toString()}`);
  }, [value]);

  return <Calendar
    onChange={onChange}
    onClickMonth={(date) => {
      onChange(date)
    }}
    value={value}
    view={view}
    minDate={minDate}
    maxDate={maxDate}
    tileDisabled={({ date }) => disableWeekends && isWeekend(date)}
    tileClassName={({ date }) => (disableWeekends && isWeekend(date)) ? "hidden" : ""}
  />;
};

export default EventCalendar;
