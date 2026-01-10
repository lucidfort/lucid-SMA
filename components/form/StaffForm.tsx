"use client";

import FileUploader from "@/components/form/ui/FileUploader";
import {
  AccessLevel,
  ContractType,
  CreateStaffMutation,
  Sex,
  UpdateStaffMutation,
  useCreateStaffMutation,
  useGetSchoolSlugQuery,
  useUpdateStaffMutation,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { staffSchema, StaffSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "./ui/InputField";
import { Form } from "../ui/form";
import { SelectContent, SelectItem } from "../ui/select";
import { useUser } from "@clerk/nextjs";

const StaffForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<StaffSchema>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      id: data?.id,
      clerkUserId: data?.clerkUserId,
      employeeId: data?.employeeId.split("-s")[1] ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
      birthday: data?.birthday ?? new Date(),
      sex: data?.sex ?? "MALE",
      contractType: data?.contractType ?? "PERMANENT",
      accessLevel: data?.accessLevel ?? "RESTRICTED",
      role: data?.role ?? "",
      img: data?.img,
      isActive: data?.isActive ?? false,
    },
  });

  const [schoolResult] = useGetSchoolSlugQuery({
    variables: { id: (user?.publicMetadata?.schoolId as string) ?? "" },
    requestPolicy: "cache-first",
  });

  const accessLevel = form.watch("accessLevel");

  const [createResult, createStaff] = useCreateStaffMutation();
  const [updateResult, updateStaff] = useUpdateStaffMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    const hasOldImage = data?.img && values.img !== data.img;

    const formData = {
      ...values,
      employeeId: values.employeeId.trim().toLowerCase(),
      accessLevel: values.accessLevel as AccessLevel,
      contractType: values.contractType as ContractType,
      sex: values.sex as Sex,
      ...(type === "update" && hasOldImage && { oldImg: data.img }),
    };

    const response =
      type === "create"
        ? await createStaff({ input: formData })
        : await updateStaff({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateStaffMutation)?.createStaff
        : (response.data as UpdateStaffMutation)?.updateStaff;

    if (
      mutationResult?.__typename === "MutationCreateStaffSuccess" ||
      mutationResult?.__typename === "MutationUpdateStaffSuccess"
    ) {
      toast.success(`Staff ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
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
            label="First Name"
            name="name"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Surname"
            name="surname"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Email"
            name="email"
            type="email"
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Phone"
            name="phone"
            type="tel"
          />
          <InputField
            label="Address"
            name="address"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          <InputField
            label="Date of Birth"
            name="birthday"
            type="date"
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
          />

          {/* SEX */}
          <InputField
            label="Sex"
            name="sex"
            control={form.control}
            fieldType={FormFieldType.SELECT}
          >
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </InputField>

          <FileUploader
            control={form.control}
            name="img"
            label="Photo"
            folder={slug ?? "unclaimed"}
          />
        </div>

        <span className="mt-4 text-xs font-medium text-gray-400">
          Work Information
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Employee ID"
            control={form.control}
            name="employeeId"
            placeholder="202"
            prefix={`${slug}_s`}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Contract Type"
            name="contractType"
          >
            <SelectContent>
              <SelectItem value="PERMANENT">Permanent</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="PART_TIME">Part-Time</SelectItem>
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Access Level"
            name="accessLevel"
          >
            <SelectContent>
              <SelectItem value="FINANCE">Finance</SelectItem>
              <SelectItem value="ACADEMICS">Academics</SelectItem>
              <SelectItem value="ADMINISTRATION">Administration</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="RESTRICTED">Restricted</SelectItem>
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            label="Role"
            name="role"
            placeholder="eg: Mathematics Teacher"
          />

          <InputField
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
            label="Hire Date"
            name="hireDate"
          />

          {accessLevel !== "RESTRICTED" && (
            <InputField
              label="Password"
              name="password"
              type="password"
              control={form.control}
              fieldType={FormFieldType.INPUT}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {!isLoading ? (
            type
          ) : (
            <Loader2 className="text-lamaYellow animate-spin" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default StaffForm;
