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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [currentTerm, setCurrentTerm] = useState(searchParams.get("term") || "")
  const [date, setDate] = useState<{ start: string; end?: string } | null>(null)

  const [termsResult] = useGetAcademicYearsQuery()
  const academicYears = termsResult.data?.academicYears || []

  useEffect(() => {
    if (currentTerm === "") return;

    const params = new URLSearchParams(window.location.search)
    const current = params.get("term")

    if (current === currentTerm) return;

    params.set("term", currentTerm);

    if (pathname.startsWith("/list/attendance") && date) {
      // tsd = term start date
      params.set("tsd", date.start)

      if (date.end) {
        // ted = term end date
        params.set("ted", date.end)
      }
    }

    router.replace(`?${params.toString()}`);
  }, [currentTerm, pathname])

  const selectedYear = academicYears.find(y => y.terms.some(t => currentTerm ? t.id === currentTerm : t.isCurrent))

  const selectedTerm = selectedYear?.terms.find(t => currentTerm ? t.id === currentTerm : t.isCurrent)?.session

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center gap-1 rounded-full border p-2">
        <Image src="/filter.svg" alt="filter" width={12} height={12} />
        <span className="text-sm">
          {selectedYear?.year || ""} - {selectedTerm || "Select session"}{selectedTerm === 1
            ? "st"
            : selectedTerm === 2
              ? "nd"
              : "rd"}
          Term
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {academicYears.map(({ id, year, terms }, index) => (
          <DropdownMenuGroup key={id}>
            <DropdownMenuLabel>{year}</DropdownMenuLabel>
            {terms.map(({ id, session, startDate, endDate }) => (
              <DropdownMenuItem
                key={id}
                onClick={() => {
                  setCurrentTerm(id)

                  setDate({
                    start: new Date(startDate).toLocaleDateString("en-CA"),
                    ...(endDate && { end: new Date(endDate).toLocaleDateString("en-CA") })
                  })
                }}
              >
                {session}{session === 1
                  ? "st"
                  : session === 2
                    ? "nd"
                    : "rd"} Term
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
