import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, BarChart, GraduationCap, UserPlus, Users } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Programs & Grade Management",
    description:
      "Map programs to available grades. Prevent duplicate grade assignments across programs and streamline student management.",
  },
  {
    icon: Users,
    title: "Staff & Manager Management",
    description:
      "Create and manage staff accounts with different permission levels. Easily onboard new staff members.",
  },
  {
    icon: UserPlus,
    title: "Parent & Guardian Accounts",
    description:
      "Separate parent accounts with primary vs secondary guardian relationships. Per-ward access control for better security.",
  },
  {
    icon: Baby,
    title: "Student Lifecycle",
    description:
      "Manage students with age validation and automatic grade assignment. Track student progress throughout their education.",
  },
  {
    icon: BarChart,
    title: "Reports & Analytics",
    description:
      "Generate comprehensive reports on attendance, grades, and financial data. Make data-driven decisions for your school.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Powerful features for modern schools
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-pretty">
            From onboarding to daily operations, every feature is designed for
            efficiency and ease of use
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
