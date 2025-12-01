import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressSteps = ({
  steps,
  currentStep,
}: {
  currentStep: number;
  steps: {
    title: string;
    description: string;
  }[];
}) => {
  return (
    <div className="flex w-full items-center">
      <div className="w-full xl:w-2/3">
        <h2 className="text-2xl font-semibold">{steps[currentStep - 1].title}</h2>
      </div>

      <div className="flex items-center justify-around w-full xl:w-1/3 gap-2">
        {steps.map(({ title }, index) => {
          const step = index + 1;

          return (
            <div key={title} className="flex items-center flex-1 gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  currentStep > step
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {currentStep > step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>

              {step < steps.length && (
                <div
                  className={cn(
                    "h-0.5 px-1 flex-1 transition-colors",
                    currentStep > step ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};
export default ProgressSteps;
