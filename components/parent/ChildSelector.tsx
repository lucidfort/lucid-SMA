"use client";

import { Student } from "@/lib/generated/graphql/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

const ChildSelector = ({ students }: { students: Student[] }) => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("general");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = [
    { label: "General Overview", value: "general" },
    ...students.map((s) => ({
      label: `${s.name} ${s.surname}`,
      value: s.id,
    })),
  ];

  const handleFilterChange = (value: string) => {
    if (value === selectedFilter) return;

    const params = new URLSearchParams(searchParams.toString());

    if (value === "general") {
      params.delete("child");
    } else {
      params.set("child", value);
    }

    const query = params.toString();
    const url = query ? `?${query}` : pathname;

    setSelectedFilter(value);
    router.replace(url, { scroll: false });
  };

  return (
    <Select
      defaultValue={"all"}
      value={selectedFilter}
      onValueChange={(value) => handleFilterChange(value)}
    >
      <SelectTrigger className="w-full rounded-md p-2 text-sm ring-[1.5px] ring-gray-300 md:max-w-[250px]">
        {filters.find((f) => f.value === selectedFilter)?.label || "All"}
      </SelectTrigger>
      <SelectContent>
        {filters.map((filter, idx) => (
          <SelectItem key={idx} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChildSelector;
