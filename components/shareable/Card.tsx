import FormModal from "@/components/FormModal";
import { Parent } from "@/lib/generated/graphql/server";
import { listCreationAccess } from "@/lib/settings";
import { RoleAccessLevel } from "@/types";
import { ForwardRefExoticComponent, RefAttributes, type ReactElement } from "react";
import { UserAvatar } from ".";
import { LucideProps } from "lucide-react";

export const InfoCard = ({
  data,
  table,
  accessLevel,
  cards
}: {
  data: any;
  table: "staff" | "student";
  accessLevel: RoleAccessLevel;
  cards: {
    value: string;
    label: string
    icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  }[]
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="relative">
          <UserAvatar name={`${data.name} ${data.surname}`} img={data.img} className="size-48" />

          {listCreationAccess[table].includes(accessLevel) && (
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white">
              <FormModal table={table} type="update" data={data} />
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-stone-800">
            {data.name} {data.surname}
          </h1>
          <p className="text-stone-600 text-lg">
            {data.class.grade.name} Student
          </p>
          <p className="text-sm text-stone-500 mt-1">{table === "student" ? data.registrationNumber : data.employeeId}</p>
        </div>
      </div>

      {/* Here */}
      <div className="flex-1 space-y-6">
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {cards.map((card, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl">
              {card.icon && <card.icon className="w-5 h-5 text-amber-600 mt-0.5" />}

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

export const SmallCard = async ({
  cards,
}: {
  cards: {
    value: string;
    label: string
    icon?: ReactElement;
  }[];
}) => {
  return (
    <div className="flex flex-1 flex-wrap justify-between gap-4">
      {cards.map((card, index) => (
        <div key={index} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl">
          {card.icon}

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
  );
};

export const ParentInfoCard = ({
  relation,
  parent,
}: {
  relation: string;
  parent: Parent;
}) => {
  const columns = [
    {
      label: "Name",
      value: `${parent.name} ${parent.surname}`,
    },
    {
      label: "Email",
      value: parent.email || "-",
    },
    {
      label: "Phone",
      value: parent.phone || "-",
    },
    {
      label: "Address",
      value: parent.address,
    },
  ];

  return (
    <div className="w-full rounded-md bg-lamaSky">
      <div className="flex flex-col gap-4 p-4">
        <h3 className="text-lg font-semibold">{relation}</h3>

        <div className="flex flex-col gap-2 text-sm font-medium">
          {columns.map((item) => (
            <div key={item.label}>
              <span className="text-gray-700">{item.label}: </span>
              <span className="ml-5">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
