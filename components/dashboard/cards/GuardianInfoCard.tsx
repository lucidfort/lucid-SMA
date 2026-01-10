import { Parent } from "@/lib/generated/graphql/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ParentType = Omit<Parent, "children" | "childrenCount">;

interface Props {
  guardians: {
    isPrimary: boolean;
    parent: ParentType;
    relation: string;
  }[];
}

const GuardianInfoCard = ({ guardians }: Props) => {
  const getColumns = (parent: ParentType) => [
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

  if (guardians.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guardian</CardTitle>
        </CardHeader>
        <CardContent>No parent was found</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row">
      {guardians.map((guardian) => (
        <Card key={guardian.parent.id}>
          <CardHeader>
            <CardTitle>{guardian.relation}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-2 text-sm font-medium">
              {getColumns(guardian.parent).map((item, index) => (
                <div key={index}>
                  <span className="text-gray-700">{item.label}: </span>
                  <span className="ml-5">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GuardianInfoCard;
