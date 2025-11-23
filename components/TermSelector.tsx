"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface TermSelectorProps {
  terms: {
    id: string;
    term: number;
    isCurrent: boolean;
    academicYear: {
      year: string;
    };
  }[];
  selectedTermId: string;
}

const TermSelector = ({ terms, selectedTermId }: TermSelectorProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const currentTerm = terms?.find((t) =>
    selectedTermId ? selectedTermId === t.id : t.isCurrent,
  );

  const groupedTerms = terms?.reduce(
    (acc, term) => {
      const year = term.academicYear.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(term);
      return acc;
    },
    {} as Record<string, typeof terms>,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center gap-1 rounded-full border-0 bg-lamaYellow p-2">
        <Image src="/filter.svg" alt="filter" width={12} height={12} />
        <span className="text-sm">
          {currentTerm?.term}
          {currentTerm?.term === 1
            ? "st"
            : currentTerm?.term === 2
              ? "nd"
              : "rd"}{" "}
          Term
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(groupedTerms!).map(([year, terms], idx, arr) => (
          <DropdownMenuGroup key={year}>
            <DropdownMenuLabel>{year}</DropdownMenuLabel>
            {terms.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => {
                  const newParams = new URLSearchParams(params.toString());
                  newParams.set("term", t.id);
                  router.push(`?${newParams.toString()}`);
                }}
              >
                {t.term}
              </DropdownMenuItem>
            ))}

            {idx < arr.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TermSelector;
