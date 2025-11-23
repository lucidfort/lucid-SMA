import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-8 lg:w-2/3">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[130px] flex-1 rounded-2xl p-4">
              <Skeleton className="h-[50px] w-[50px] rounded-full" />
              <Skeleton className="h-[40px] w-full rounded-md" />
              <Skeleton className="h-[80px] w-full rounded-md" />
            </Skeleton>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="h-[450px] w-full lg:w-1/3">
            <Skeleton className="h-[450px] w-full rounded-md" />
          </div>

          <div className="h-[450px] w-full lg:w-2/3">
            <Skeleton className="h-[450px] w-full rounded-md" />
          </div>
        </div>

        <div className="h-[500px] w-full">
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 lg:w-1/3">
        <Skeleton className="h-[200px] w-full rounded-md" />
        <Skeleton className="h-[200px] w-full rounded-md" />
        <Skeleton className="h-[200px] w-full rounded-md" />
      </div>
    </div>
  );
};

export default Loading;
