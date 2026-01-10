import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollProfile } from "@/lib/generated/graphql/server";
import FormModal from "@/components/form/ui/FormModal";

interface Props {
  profile?: Partial<PayrollProfile> | null;
  staff: { id: string; name: string; surname: string };
}
const PayrollProfileCard = ({ profile, staff }: Props) => {
  const details = [
    { label: "Account Number", value: profile?.accountNumber },
    { label: "Account Name", value: profile?.accountName },
    { label: "Bank", value: profile?.bankName },
    { label: "Salary", value: profile?.salary },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Payroll Profile</CardTitle>
          <div className="rounded-lg p-1 shadow-md shadow-gray-500">
            <FormModal
              table="payroll-profile"
              type={profile ? "update" : "create"}
              data={{ ...profile, staff }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {profile ? (
          <div className="space-y-4">
            {details.map((item) => (
              <div key={item.label}>
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-base">{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No profile found</p>
        )}
      </CardContent>
    </Card>
  );
};
export default PayrollProfileCard;
