"use client";

import FileUploader from "@/components/form/ui/FileUploader";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { relationships, userSex } from "@/lib/constants";
import {
  CreateStudentMutation,
  ParentStudent,
  ParentStudentRelationship,
  Sex,
  UpdateStudentMutation,
  useCreateStudentMutation,
  useGetClassesQuery,
  useGetGradesQuery,
  useGetProgramsQuery,
  useGetSchoolSlugQuery,
  useUpdateStudentMutation,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { StudentSchema, studentSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "./ui/InputField";
import UserSearchForm from "./UserSearchForm";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

const StudentForm = ({ type, data, setOpen, relatedData }: FormProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const primaryParent = data?.guardians?.find(
    (guardian: Omit<ParentStudent, "student">) => guardian.isPrimary,
  );

  const secondaryParent = data?.guardians?.find(
    (guardian: Omit<ParentStudent, "student">) => !guardian.isPrimary,
  );

  const form = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      address: data?.address ?? "",
      registrationNumber: data?.registrationNumber?.split("@")[1] ?? "",
      birthday: data?.birthday ? new Date(data.birthday) : new Date(),
      sex: data?.sex ?? "MALE",
      img: data?.img,
      programId: data?.class.grade.programId ?? relatedData?.programId,
      gradeId: data?.class.grade.id ?? relatedData?.gradeId,
      classId: data?.class.id ?? relatedData?.classId,
      primaryGuardian: {
        id: primaryParent?.parent.id ?? "",
        name: primaryParent
          ? `${primaryParent.parent.name} ${primaryParent.parent.surname}`
          : "",
        relation: primaryParent?.relation ?? "",
      },
      secondaryGuardian: secondaryParent
        ? {
            id: secondaryParent?.parent.id,
            name: secondaryParent
              ? `${secondaryParent.parent.name} ${secondaryParent.parent.surname}`
              : "",
            relation: secondaryParent?.relation,
          }
        : null,
    },
  });

  const [schoolResult] = useGetSchoolSlugQuery({
    variables: { id: (user?.publicMetadata?.schoolId as string) ?? "" },
    requestPolicy: "cache-first",
  });
  const [programs] = useGetProgramsQuery();

  const programId = form.watch("programId");
  const [grades] = useGetGradesQuery({
    pause: !programId,
    variables: { filter: { programId: programId! } },
  });

  const gradeId = form.watch("gradeId");
  const [classes] = useGetClassesQuery({
    pause: !gradeId,
    variables: { filter: { gradeId: gradeId! } },
  });

  const [createResult, createStudent] = useCreateStudentMutation();
  const [updateResult, updateStudent] = useUpdateStudentMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const hasNewImg = data?.img !== values.img;

    const formData = {
      ...(type === "update" && {
        id: data.id,
        oldImg: hasNewImg ? data?.img : null,
      }),
      primaryGuardian: {
        id: values.primaryGuardian.id,
        relation: values.primaryGuardian.relation as ParentStudentRelationship,
      },
      ...(values.secondaryGuardian &&
        values.secondaryGuardian.id && {
          secondaryGuardian: {
            id: values.secondaryGuardian.id,
            relation: values.secondaryGuardian
              .relation as ParentStudentRelationship,
          },
        }),
      name: values.name,
      surname: values.surname,
      address: values.address,
      birthday: values.birthday,
      registrationNumber: values.registrationNumber,
      img: values.img,
      sex: values.sex as Sex,
      classId: values.classId,
      medicalCondition: values.medicalCondition,
    };

    setError(null);

    const response =
      type === "create"
        ? await createStudent({ input: formData })
        : await updateStudent({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateStudentMutation)?.createStudent
        : (response.data as UpdateStudentMutation)?.updateStudent;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateStudentSuccess" ||
      mutationResult.__typename === "MutationUpdateStudentSuccess"
    ) {
      toast.success(`Student ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error =
        handleGraphqlClientErrors(mutationResult) ?? "Something went wrong";

      setError(error);
      toast.error(error);
    }
  });

  const slug = schoolResult.data?.school?.slug;

  const isLoading = createResult.fetching || updateResult.fetching;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <span className="text-xs font-medium text-gray-400">
          Personal Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Registration Number"
            control={form.control}
            name="registrationNumber"
            placeholder="202"
            prefix={`${slug}@`}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="First Name"
            name="name"
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Surname"
            name="surname"
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
            label="Date of Birth"
            name="birthday"
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Gender"
            name="sex"
          >
            <SelectContent>
              {userSex.map((sex) => (
                <SelectItem key={sex} value={sex.toUpperCase()}>
                  {sex}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Address"
            name="address"
          />

          <FileUploader
            control={form.control}
            name="img"
            folder={slug ? `${slug}/students` : "students"}
            label="Students"
          />
        </div>

        <span className="text-xs font-medium text-gray-400">
          Guardian Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UserSearchForm
            type="parent"
            label="Primary Guardian"
            control={form.control}
            name="primaryGuardian"
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Relationship"
            name="primaryGuardian.relation"
          >
            <SelectContent>
              {relationships.map((relationship) => (
                <SelectItem value={relationship} key={relationship}>
                  {relationship}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <UserSearchForm
            type="parent"
            label="Secondary Guardian"
            control={form.control}
            name="secondaryGuardian"
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Relationship"
            name="secondaryGuardian.relation"
            placeholder="Select relationship"
          >
            <SelectContent>
              {/*<SelectItem value={""}>Select</SelectItem>*/}
              {relationships.map((relationship) => (
                <SelectItem value={relationship} key={relationship}>
                  {relationship}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>
        </div>

        <span className="text-xs font-medium text-gray-400">
          Class Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Program"
            name="programId"
            placeholder="Select a program"
            disabled={relatedData?.disableAcademicStructure}
          >
            <SelectContent>
              {programs?.data?.programs?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Grade"
            name="gradeId"
            placeholder="Select a grade"
            disabled={relatedData?.disableAcademicStructure}
          >
            <SelectContent>
              {grades?.data?.grades?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Class"
            name="classId"
            placeholder="Select a class"
            disabled={relatedData?.disableAcademicStructure}
          >
            <SelectContent>
              {classes?.data?.classes?.map(({ id, name }) => (
                <SelectItem key={id} value={id!}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>
        </div>

        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}

        <Button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {isLoading ? (
            <Loader2 className="text-lamaYellow animate-spin" />
          ) : (
            type
          )}
        </Button>
      </form>
    </Form>
  );
};

export default StudentForm;
