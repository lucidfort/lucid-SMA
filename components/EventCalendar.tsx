"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();
  const searchParams = useSearchParams()

  useEffect(() => {
    if (value instanceof Date) {
      const isoDate = value.toLocaleDateString("en-CA");

      const params = new URLSearchParams(searchParams.toString())
      params.set("date", isoDate);

      router.push(`?${params.toString()}`);
    }
  }, [value, router, searchParams]);

  return <Calendar onChange={onChange} value={value} view="month" />;
};

export default EventCalendar;
