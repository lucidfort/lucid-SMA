"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader,
  School,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { schoolSchema, SchoolSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { schoolDefaultValues } from "@/lib/zod/defaultValues";
import { Form } from "@/components/ui/form";
import ProgressSteps from "@/components/forms/ProgressSteps";
import InputField, { FormFieldType } from "@/components/InputField";
import FileUploader from "@/components/FileUploader";
import { gradeMap } from "@/constants";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ProgramName,
  useCreateSchoolMutation,
} from "@/lib/generated/graphql/client";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "School Details",
    description: "Basic information about your school",
  },
  {
    id: 2,
    title: "Programs & Grades",
    description: "Select the education programs you offer",
  },
  {
    id: 3,
    title: "Management",
    description: "Director or manager of the school",
  },
  {
    id: 4,
    title: "Review & Confirm",
    description: "Review your information before submitting",
  },
];

const STEP_FIELDS: Record<number, (keyof SchoolSchema)[]> = {
  1: ["name", "slug", "address", "email", "phone", "motto", "logo"],
  2: ["programs", "grades"],
  3: [
    "managerEmail",
    "managerBirthday",
    "managerImage",
    "managerName",
    "managerSurname",
    "managerPhone",
    "password",
    "managerUsername",
  ],
};

const SchoolOnboardingForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<SchoolSchema>({
    resolver: zodResolver(schoolSchema),
    defaultValues: schoolDefaultValues,
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
  }, [selectedPrograms, form]);

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
        programName: programName || "",
        gradeName: grade,
      };
    });

    const transformedManager = {
      name: values.managerName,
      email: values.managerEmail,
      birthday: values.managerBirthday.toISOString(),
      img: values.managerImage,
      surname: values.managerSurname,
      phone: values.managerPhone,
      password: values.password,
      username: values.managerUsername,
    };

    const data = {
      address: values.address,
      email: values.email,
      name: values.name,
      slug: values.slug.toLowerCase().replaceAll(" ", "-"),
      motto: values.motto,
      phone: values.phone,
      programs: values.programs,
      logo: values.logo,
      grades: transformedGrades,
      manager: transformedManager,
    };

    const response = await createSchool(
      { input: { ...data, programs: data.programs as ProgramName[] } },
      { fetchOptions: { headers: { "x-onboarding": "true" } } },
    );

    const typeName = response.data?.createSchool?.__typename;
    if (typeName === "MutationCreateSchoolSuccess") {
      toast.success("School created successfully!", {
        description: "Please sign in to continue",
      });
      router.push("/sign-in");
    } else {
      const error = handleGraphqlClientErrors(typeName);
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

  const formData = form.getValues();
  const reviewMap = {
    school: [
      { name: "Name", value: formData.name },
      { name: "Slug", value: formData.slug },
      { name: "Email", value: formData.email },
      { name: "Phone", value: formData.phone },
      { name: "Address", value: formData.address },
      { name: "Motto", value: formData.motto || "-" },
      { name: "Logo", value: formData.logo },
    ],
    management: [
      {
        name: "Full Name",
        value: `${formData.managerName} ${formData.managerSurname}`,
      },
      { name: "Username", value: formData.managerUsername },
      { name: "Email", value: formData.managerEmail },
      { name: "Phone", value: formData.managerPhone },
      {
        name: "Birthday",
        value: formData.managerBirthday.toISOString().split("T")[0],
      },
      { name: "Photo", value: formData.managerImage },
    ],
  };

  const slug = form.watch("slug");

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={onSubmit}>
        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} steps={STEPS} />

        {/* Form Content */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: School Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Name"
                    name="name"
                    containerClassName={"md:w-full"}
                  />

                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Slug"
                    name="slug"
                    containerClassName={"md:w-full"}
                    placeholder="learnatffs: This will be used in your school's url"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Email"
                    type="email"
                    name="email"
                    containerClassName={"md:w-full"}
                  />

                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    containerClassName={"md:w-full"}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="School Address"
                    name="address"
                    containerClassName={"md:w-full"}
                  />
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="School Motto"
                    name="motto"
                    containerClassName={"md:w-full"}
                  />
                </div>

                <div className="space-y-2">
                  <FileUploader
                    folder={`${slug}`}
                    name="logo"
                    control={form.control}
                    label="School Logo"
                    containerClassname={"md:w-1/2"}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Programs & Grades */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <School className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Select Your Programs
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose the education programs your school offers, then
                        select the specific grades within each program.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      control={form.control}
                      fieldType={FormFieldType.MULTI_SELECT}
                      label="Program"
                      name="programs"
                      placeholder="Select a program"
                      containerClassName={"md:w-full"}
                      options={allPossiblePrograms}
                    />

                    <InputField
                      control={form.control}
                      fieldType={FormFieldType.MULTI_SELECT}
                      label="Grade"
                      name="grades"
                      placeholder="Select a grade"
                      containerClassName={"md:w-full"}
                      options={availableGrades}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Username"
                    control={form.control}
                    name="managerUsername"
                    fieldType={FormFieldType.INPUT}
                    containerClassName={"md:w-full"}
                  />
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="First Name"
                    name="managerName"
                    containerClassName={"md:w-full"}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Surname"
                    name="managerSurname"
                    containerClassName={"md:w-full"}
                  />
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.DATE_PICKER}
                    label="Date of Birth"
                    name="managerBirthday"
                    containerClassName={"md:w-full"}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Email"
                    name="managerEmail"
                    type="email"
                    containerClassName={"md:w-full"}
                  />
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Phone Number"
                    name="managerPhone"
                    type="tel"
                    containerClassName={"md:w-full"}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    label="Password"
                    name="password"
                    type="password"
                    containerClassName={"md:w-full"}
                  />

                  <FileUploader
                    folder="managers"
                    name="managerImage"
                    control={form.control}
                    label="Photo"
                    containerClassname={"md:w-full"}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-accent/20 bg-accent/10 p-4">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Almost Done!
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Please review your information below. You can go back to
                        make changes if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* School Details Summary */}
                  <div className="rounded-lg border-2 border-border p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        School Details
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {reviewMap["school"].map((detail) => (
                        <div key={detail.name}>
                          <>
                            <p className="text-sm font-medium text-muted-foreground">
                              {detail.name}
                            </p>
                            {detail.name === "Logo" && detail.value ? (
                              <Image
                                src={detail.value}
                                alt={detail.name}
                                width={170}
                                height={170}
                                className="rounded-xl"
                              />
                            ) : (
                              <p className="font-medium text-foreground">
                                {detail.value}
                              </p>
                            )}
                          </>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Programs & Grades Summary */}
                  <div className="rounded-lg border-2 border-border p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        Programs & Grades
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {selectedPrograms.map((program) => {
                        const selectedGrades = form.watch("grades");
                        const programGrades = selectedGrades.filter((g) =>
                          gradeMap[program].includes(g),
                        );

                        return (
                          <div
                            key={program}
                            className="rounded-lg bg-secondary/50 p-4"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              <p className="font-semibold text-foreground">
                                {program}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                ({programGrades.length} grade
                                {programGrades.length > 1 ? "s" : ""})
                              </span>
                            </div>
                            <div className="ml-6 flex flex-wrap gap-2">
                              {programGrades.map((grade) => (
                                <span
                                  key={grade}
                                  className="rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-accent"
                                >
                                  {grade}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/*  Management */}
                  <div className="rounded-lg border-2 border-border p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        Management
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {reviewMap["management"].map((detail) => (
                        <div key={detail.name}>
                          <>
                            <p className="text-sm font-medium text-muted-foreground">
                              {detail.name}
                            </p>
                            {detail.name === "Photo" && detail.value ? (
                              <Image
                                src={detail.value}
                                alt={detail.name}
                                width={170}
                                height={170}
                                className="rounded-xl"
                              />
                            ) : (
                              <p className="font-medium text-foreground">
                                {detail.value}
                              </p>
                            )}
                          </>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {result?.error && <p>Error: {result.error.message}</p>}

          <Button type="button" onClick={handleNext} disabled={result.fetching}>
            {currentStep === STEPS.length ? (
              <>
                {result.fetching ? (
                  <>
                    <Loader className="animate-spin" />
                    Submitting...
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
