"use client";

import { useMemo } from "react";
import { Student } from "@/lib/generated/graphql/client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, GraduationCap, UserCheck, Users, UserX } from "lucide-react";
import { cn } from "@/lib/utils/client.utils";
import { useRouter } from "next/navigation";

const StudentsStatCard = ({ students }: { students: Student[] }) => {
  const router = useRouter();

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "ACTIVE").length;
    const inactive = students.filter((s) =>
      ["EXPELLED", "WITHDRAWN", "TRANSFERRED"].includes(s.status),
    ).length;
    const suspended = students.filter((s) => s.status === "SUSPENDED").length;
    const graduated = students.filter((s) => s.status === "GRADUATED").length;

    return {
      total,
      active,
      inactive,
      suspended,
      graduated,
    };
  }, [students]);

  const cards = [
    {
      label: "Total Students",
      value: stats.total,
      icon: Users,
      clickable: false,
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCheck,
      className: "text-green-600",
    },
    {
      label: "Suspended",
      value: stats.suspended,
      icon: Clock,
      className: "text-gray-600",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: UserX,
      className: "text-red-600",
    },
    {
      label: "Graduated",
      value: stats.graduated,
      icon: GraduationCap,
      className: "text-blue-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {cards.map(({ clickable = true, ...card }, idx) => (
        <Card
          key={idx}
          className={cn(
            "pointer-events-none max-w-56 min-w-44 flex-1 border-0 shadow-sm",
            clickable && "cursor-pointer transition-shadow hover:shadow-md",
          )}
          onClick={() =>
            clickable && router.push(`?status=${card.label.toLowerCase()}`)
          }
        >
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <card.icon
                  className={cn("h-5 w-5 text-slate-600", card.className)}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl font-bold text-slate-800",
                    card.className,
                  )}
                >
                  {card.value}
                </p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default StudentsStatCard;
