import { MoreHorizontal } from "lucide-react";

const UserCard = async ({
  label,
  value = 0,
}: {
  label: string;
  value?: string | number;
}) => {
  return (
    <div className="odd:bg-lamaPurple even:bg-lamaYellow min-w-[130px] flex-1 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white px-2 py-1 text-[10px] text-green-600">
          2024/25
        </span>

        <MoreHorizontal />
      </div>

      <h2 className="my-4 text-2xl font-semibold">{value}</h2>
      <h2 className="text-sm font-medium text-gray-500 capitalize">{label}</h2>
    </div>
  );
};

export default UserCard;
