"use client";

import FileUploader from "@/components/form/ui/FileUploader";
import InputField, { FormFieldType } from "@/components/form/ui/InputField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { gradeMap } from "@/lib/constants";
import {
  ProgramName,
  useCreateSchoolMutation,
} from "@/lib/generated/graphql/client";
import {
  extractGraphqlErrors,
  getFirstCharacters,
  handleGraphqlClientErrors,
} from "@/lib/utils/client.utils";
import { schoolSchema, SchoolSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ProgressSteps from "@/components/form/ProgressSteps";

const STEPS = [
  {
    title: "School Details",
    description: "Basic information about your school",
  },
  {
    title: "Management (You)",
    description: "Finish setting up your account",
  },
];

const STEP_FIELDS: Record<number, (keyof SchoolSchema)[]> = {
  1: [
    "name",
    "slug",
    "address",
    "email",
    "phone",
    "motto",
    "logo",
    "programs",
    "grades",
  ],
  2: ["manager"],
};

const SchoolOnboardingForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<SchoolSchema>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      slug: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      motto: null,
      programs: [],
      grades: [],
      manager: {
        name: "",
        surname: "",
        phone: "",
      },
    },
  });

  const [result, createSchool] = useCreateSchoolMutation();

  const selectedPrograms = form.watch("programs");

  useEffect(() => {
    const selectedPrograms = form.getValues("programs");
    const selectedGrades = form.getValues("grades");

    const allowedGrades = selectedPrograms.flatMap(
      (program) => gradeMap[program],
    );

    const filteredGrades = selectedGrades.filter((grade) =>
      allowedGrades.includes(grade),
    );

    if (filteredGrades.length !== selectedGrades.length) {
      form.setValue("grades", filteredGrades, { shouldValidate: true });
    }
  }, [selectedPrograms]);

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];

    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      return;
    }

    if (currentStep !== STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await onSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (currentStep !== STEPS.length) {
      return;
    }

    const transformedGrades = values.grades.map((grade: string) => {
      const programName = values.programs.find((program: string) =>
        gradeMap[program]?.includes(grade),
      );

      return {
        programName: programName as ProgramName,
        gradeName: grade,
      };
    });

    const data = {
      ...values,
      slug: values.slug.toLowerCase().replaceAll(" ", "-"),
      grades: transformedGrades,
    };

    const response = await createSchool({
      input: { ...data, programs: data.programs as ProgramName[] },
    });

    if (response.error?.graphQLErrors) {
      const error = extractGraphqlErrors(response.error.graphQLErrors);

      if (error) {
        toast.error(error.message);
      }
      return;
    }

    const mutationResult = response.data?.createSchool;

    if (mutationResult?.__typename === "MutationCreateSchoolSuccess") {
      toast.success("School created successfully!", {
        description: "Please sign in to continue",
      });
      router.push("/admin");
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const allPossiblePrograms = Object.keys(gradeMap).map((program) => ({
    id: program,
    name: program,
  }));

  const availableGrades = selectedPrograms?.flatMap((program) =>
    (gradeMap[program] || []).map((grade) => ({
      id: grade,
      name: grade,
    })),
  );
  const slug = form.watch("slug");
  const name = form.watch("name");

  const exampleSlug = getFirstCharacters(name);

  return (
    <Form {...form}>
      <form className="w-full space-y-8" onSubmit={onSubmit}>
        <ProgressSteps currentStep={currentStep} steps={STEPS} />

        <div className="flex w-full flex-col gap-4">
          {currentStep === 1 && (
            <>
              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="Name"
                name="name"
              />

              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="Slug"
                name="slug"
                placeholder={`eg: ${exampleSlug} (This will be used as your school's domain)`}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  label="Email"
                  type="email"
                  name="email"
                />

                <InputField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  label="Phone Number"
                  name="phone"
                  type="tel"
                />
              </div>

              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="School Address"
                name="address"
              />
              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="School Motto"
                name="motto"
              />

              <FileUploader
                folder={slug}
                name="logo"
                control={form.control}
                label="School Logo"
              />

              <InputField
                control={form.control}
                fieldType={FormFieldType.MULTI_SELECT}
                label="Programs"
                name="programs"
                placeholder="Select a program"
                options={allPossiblePrograms}
              />

              <InputField
                control={form.control}
                fieldType={FormFieldType.MULTI_SELECT}
                label="Grades"
                name="grades"
                placeholder="Select a grade"
                options={availableGrades}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="First Name"
                name="manager.name"
              />

              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="Surname"
                name="manager.surname"
              />

              <InputField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                label="Phone Number"
                name="manager.phone"
                type="tel"
              />
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex w-full justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button type="button" onClick={handleNext} disabled={result.fetching}>
            {currentStep === STEPS.length ? (
              <>
                {result.fetching ? (
                  <>
                    <Loader className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit
                  </>
                )}
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SchoolOnboardingForm;
