import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Fast school onboarding",
    description:
      "Program & grade mapping with visual grade-picker. Prevent duplicate grade registration and streamline setup in minutes.",
  },
  {
    icon: Shield,
    title: "Secure role-based access",
    description:
      "Parent/student/teacher/manager roles with secure authentication. Easily manage user access without data loss.",
  },
  {
    icon: BarChart3,
    title: "Data-driven insights",
    description:
      "Comprehensive reporting and analytics for attendance, grades, and financial data. Make informed decisions for your school.",
  },
];

const Benefits = () => {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Everything you need to manage your school
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-pretty text-muted-foreground">
            Built for school administrators and educators
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-2">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
