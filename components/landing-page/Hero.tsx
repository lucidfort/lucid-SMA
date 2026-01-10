import { Button } from "@/components/ui/button";
import { ArrowRight, School, PlayCircle } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b">
      <div className="container mx-auto px-4 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Run your school with fewer meetings, less paperwork
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg text-pretty">
                Manage students, staff, and daily operations from one reliable
                system designed to reduce manual work, eliminate confusion, and
                keep your school running smoothly.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up" className="gap-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <PlayCircle className="h-4 w-4" />
                Request demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-card relative overflow-hidden rounded-lg border shadow-2xl">
              <div className="from-primary/10 to-primary/5 flex aspect-[4/3] items-center justify-center bg-gradient-to-br">
                <div className="space-y-4 p-8 text-center">
                  <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <School className="text-primary h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    School Management Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card absolute -right-4 -bottom-4 h-32 w-48 rounded-lg border p-4 shadow-lg">
              <p className="mb-2 text-xs font-medium">Onboarding wizard</p>
              <div className="space-y-2">
                <div className="bg-primary/20 h-2 rounded" />
                <div className="bg-primary/20 h-2 w-3/4 rounded" />
                <div className="bg-primary h-2 w-1/2 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
