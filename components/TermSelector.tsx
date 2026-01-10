"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAcademicYearsQuery } from "@/lib/generated/graphql/client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TermSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentTerm, setCurrentTerm] = useState(
    searchParams.get("term") || "",
  );
  const [date, setDate] = useState<{ start: string; end?: string } | null>(
    null,
  );

  const [queryResult] = useGetAcademicYearsQuery({
    variables: { includeTerm: true },
  });
  const academicYears = queryResult.data?.academicYears || [];

  useEffect(() => {
    if (currentTerm === "") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("term") === currentTerm) return;

    params.set("term", currentTerm);

    if (pathname.startsWith("/list/attendance") && date) {
      // tsd = term start date; ted = term end date
      params.set("tsd", date.start);
      if (date.end) params.set("ted", date.end);
    }

    router.replace(`?${params.toString()}`);
  }, [currentTerm, pathname, date]);

  useEffect(() => {
    if (currentTerm) return;
    if (!academicYears.length) return;

    const current = academicYears
      .flatMap((y) => y.terms)
      .find((t) => t?.isCurrent);

    if (!current) return;

    setCurrentTerm(current.id);
    setDate({
      start: new Date(current.startDate).toLocaleDateString("en-CA"),
      ...(current.endDate && {
        end: new Date(current.endDate).toLocaleDateString("en-CA"),
      }),
    });
  }, [academicYears]);

  const selectedYear = academicYears.find((y) =>
    y?.terms?.some((t) => (currentTerm ? t.id === currentTerm : t.isCurrent)),
  );

  const selectedTerm = selectedYear?.terms?.find((t) =>
    currentTerm ? t.id === currentTerm : t.isCurrent,
  )?.session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center gap-1 rounded-full border p-2">
        <Image src="/filter.svg" alt="filter" width={12} height={12} />
        <span className="text-sm">
          {selectedYear?.year ? `${selectedYear?.year} -` : ""}
          {selectedTerm || "Select session"}
          {selectedTerm &&
            (selectedTerm === 1
              ? "st Term"
              : selectedTerm === 2
                ? "nd Term"
                : "rd Term")}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {academicYears.map(({ id, year, terms }, index) => (
          <DropdownMenuGroup key={id}>
            <DropdownMenuLabel>{year}</DropdownMenuLabel>
            {terms?.map(({ id, session, startDate, endDate }) => (
              <DropdownMenuItem
                key={id}
                onClick={() => {
                  setCurrentTerm(id);

                  setDate({
                    start: new Date(startDate).toLocaleDateString("en-CA"),
                    ...(endDate && {
                      end: new Date(endDate).toLocaleDateString("en-CA"),
                    }),
                  });
                }}
              >
                {session}
                {session === 1 ? "st" : session === 2 ? "nd" : "rd"} Term
              </DropdownMenuItem>
            ))}

            {index < academicYears.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TermSelector;
