import { ForwardRefExoticComponent, RefAttributes } from "react";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils/client.utils";
import { Cake, Edit3, LucideProps, MapPin } from "lucide-react";
import { RoleAccessLevel } from "@/types";
import { listCreationAccess } from "@/lib/settings";
import UserAvatar from "@/components/dashboard/UserAvatar";
import FormModal from "@/components/form/ui/FormModal";

interface Props {
  data: any;
  table: "staff" | "student";
  accessLevel: RoleAccessLevel;
  cards: {
    value: string;
    label: string;
    icon?: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}

const UserInfoCard = ({ data, table, accessLevel, cards }: Props) => {
  const items = [
    {
      label: "Birthday",
      value: `${format(new Date(data.birthday), "MMM d, yyy")} (${calculateAge(data.birthday)} years)`,
      icon: Cake,
    },
    {
      label: "Address",
      value: data.address,
      icon: MapPin,
    },
    ...cards,
  ];

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="relative">
          <UserAvatar
            name={`${data.name} ${data.surname}`}
            img={data.img}
            className="size-48"
          />
        </div>
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-stone-800">
              {data.name} {data.surname}
            </h1>

            {listCreationAccess[accessLevel].includes(table) && (
              <FormModal table={table} type="update" data={data}>
                <Edit3 className="text-primary-btn fill-primary-btn size-5 cursor-pointer" />
              </FormModal>
            )}
          </div>
          {table === "student" && (
            <p className="text-lg text-stone-600">
              {data.class.grade.name} Student
            </p>
          )}
          <p className="mt-1 text-sm text-stone-500">
            {table === "student" ? data.registrationNumber : data.employeeId}
          </p>
        </div>
      </div>

      {/* Here */}
      <div className="flex-1 space-y-6">
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((card, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-white/60 p-4"
            >
              {card.icon && (
                <card.icon className="mt-0.5 h-5 w-5 text-amber-600" />
              )}

              <div>
                <div className="text-xs text-stone-500 uppercase">
                  {card.label}
                </div>
                <div className="text-sm font-medium text-stone-800">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default UserInfoCard;
