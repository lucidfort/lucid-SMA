import Image from "next/image";
import dynamic from "next/dynamic";
import { StudentSexCount } from "@/lib/generated/graphql/server";

const CountChart = dynamic(() => import("./CountChart"), {
  loading: () => <h1>Loading...</h1>,
});

const CountChartContainer = async ({ data }: { data: StudentSexCount[] }) => {
  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="h-full w-full rounded-xl bg-white p-4">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.svg" alt="more" width={20} height={20} />
      </div>

      {/* CHART */}
      <CountChart boys={boys} girls={girls} />

      {/* LEGEND */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="h-5 w-5 rounded-full bg-lamaSky" />
          <h1 className="font-bold">{boys}</h1>
          <h2 className="text-xs text-gray-300">
            Boys ({Math.round((boys / (boys + girls)) * 100)}%){" "}
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-5 w-5 rounded-full bg-lamaYellow" />
          <h1 className="font-bold">{girls}</h1>
          <h2 className="text-xs text-gray-300">
            Girls ({Math.round((girls / (boys + girls)) * 100)}%){" "}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
