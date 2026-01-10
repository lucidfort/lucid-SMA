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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.svg" alt="more" width={20} height={20} />
      </div>

      <CountChart boys={boys} girls={girls} />
    </div>
  );
};

export default CountChartContainer;
