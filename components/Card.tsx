import FormModal from "@/components/FormModal";
import { Parent } from "@/lib/generated/graphql/server";
import { listCreationAccess } from "@/lib/settings";
import { RoleAccessLevel } from "@/types";
import { Cake, Mail, MapPinHouse, Pen, Phone } from "lucide-react";
import Image from "next/image";
import { type ReactElement } from "react";

export const InfoCard = ({
  data,
  table,
  accessLevel,
  schoolId,
}: {
  data: any;
  table: "staff" | "student";
  accessLevel: RoleAccessLevel;
  schoolId: string;
}) => {
  const items = [
    {
      icon: Cake,
      alt: "age",
      value: data.birthday
        ? new Intl.DateTimeFormat("en-NG").format(new Date(data.birthday))
        : "-",
    },
    {
      icon: MapPinHouse,
      alt: "address",
      value: data.address || "-",
    },
    ...(table === "staff"
      ? [
          {
            icon: Phone,
            alt: "phone",
            value: data.phone || "-",
          },
          {
            icon: Mail,
            alt: "email",
            value: data.email || "-",
          },
        ]
      : []),
  ];

  return (
    <div className="flex max-h-fit gap-4 rounded-md bg-lamaSky px-4 py-6">
      <Image
        src={data.img || "/noAvatar.png"}
        alt="teacher"
        width={144}
        height={144}
        className="h-24 w-24 rounded-full object-center"
      />

      <div className="flex w-2/3 max-w-96 flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {data.name} {data.surname}
            </h1>
            <h2 className="text-sm">
              @{data?.registrationNumber || data?.employeeId}
            </h2>
          </div>

          {listCreationAccess[accessLevel].includes(table) && schoolId && (
            <FormModal
              table={table}
              type="update"
              data={data}
              relatedData={{ schoolId }}
            >
              <div className="flex-center size-8 rounded-full bg-lamaYellow p-2">
                <Pen className="text-black" />
              </div>
            </FormModal>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
          {items.map((item) => (
            <div
              key={item.alt}
              className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3"
            >
              <item.icon size={14} />
              <span>{item.value}</span>
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
    value: string | number;
    desc: string;
    img?: string;
    icon?: ReactElement;
  }[];
}) => {
  return (
    <div className="flex flex-1 flex-wrap justify-between gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex w-full gap-4 rounded-md bg-white p-6 shadow-xs md:w-[45%] xl:w-[47%] 2xl:w-[48%]"
        >
          {card.img ? (
            <Image
              src={card.img}
              height={32}
              width={32}
              alt="icon"
              className="size-8 w-fit"
            />
          ) : (
            card.icon
          )}
          <div className="">
            <h2 className="text-xl font-semibold">{card.value}</h2>
            <span className="text-sm text-gray-400">{card.desc}</span>
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
