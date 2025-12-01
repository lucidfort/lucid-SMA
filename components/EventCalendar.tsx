"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = ({ view = "month" }: { view?: "month" | "year" | "decade" | "century" }) => {
  const [value, onChange] = useState<Value>(new Date());

  console.log({ value })

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
    maxDate={new Date()}
  />;
};

export default EventCalendar;
