"use client";

import FileUploader from "@/components/FileUploader";
import {
  AccessLevel,
  ContractType,
  CreateStaffMutation,
  Sex,
  UpdateStaffMutation,
  useCreateStaffMutation,
  useGetClassesQuery,
  useGetGradesQuery,
  useGetProgramsQuery,
  useGetSubjectsQuery,
  useUpdateStaffMutation
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { staffSchema, StaffSchema } from "@/lib/validation";
import { FormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField, { FormFieldType } from "../InputField";
import { Form } from "../ui/form";
import { SelectContent, SelectItem } from "../ui/select";
import { useUserStore } from "@/stores/user.store";

const StaffForm = ({ type, data, setOpen }: FormProps) => {
  const router = useRouter();
  const { user } = useUserStore()

  const form = useForm<StaffSchema>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      employeeId: data?.employeeId ?? "",
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
      isActive: true,
      programId: data?.class.grade.program.id ?? null,
      gradeId: data?.class.grade.id ?? null,
      classId: data?.class.id ?? null,
    },
  });

  const accessLevel = form.watch("accessLevel");
  const [programsResult] = useGetProgramsQuery({
    pause: accessLevel !== "TEACHER",
  });

  const programId = form.watch("programId");

  const selectedProgram = programsResult.data?.programs?.find(
    (program) => program.id === programId,
  )?.name;

  const [gradesResult] = useGetGradesQuery({
    pause: !programId || accessLevel !== "TEACHER",
    variables: { where: { programId } },
  });

  const [subjectsResult] = useGetSubjectsQuery({
    pause: accessLevel !== "TEACHER" || selectedProgram !== "SECONDARY",
  });

  // PRIMARY | NURSERY
  const gradeId = form.watch("gradeId");
  const [classesResult] = useGetClassesQuery({
    pause:
      accessLevel !== "TEACHER" || selectedProgram === "SECONDARY" || !gradeId,
    variables: { filter: { gradeId } },
  });

  const [createResult, createStaff] = useCreateStaffMutation();
  const [updateResult, updateStaff] = useUpdateStaffMutation();

  useEffect(() => {
    form.resetField(
      selectedProgram === "SECONDARY" ? "classId" : "assignments",
    );
  }, [selectedProgram, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = {
      ...values,
      ...(type === "update" ? { id: data.id, oldImg: "" } : {}),
      employeeId: values.employeeId.trim().toLowerCase(),
      accessLevel: values.accessLevel as AccessLevel,
      contractType: values.contractType as ContractType,
      sex: values.sex as Sex,
    };

    delete formData.programId;
    delete formData.gradeId;

    const response =
      type === "create"
        ? await createStaff({ input: formData })
        : await updateStaff({ input: formData });

    const mutationResult =
      type === "create"
        ? (response.data as CreateStaffMutation)?.createStaff
        : (response.data as UpdateStaffMutation)?.updateStaff;

    if (!mutationResult) {
      toast.error("Something went wrong");
      return;
    }

    if (
      mutationResult.__typename === "MutationCreateStaffSuccess" ||
      mutationResult.__typename === "MutationUpdateStaffSuccess"
    ) {
      toast.success(`Staff ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  });

  const slug = user?.schoolSlug

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
            prefix={`${slug}-p`}
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

        {accessLevel === "TEACHER" && (
          <>
            <span className="mt-4 text-xs font-medium text-gray-400">
              For Teachers Only
            </span>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                label="Program"
                name="programId"
                placeholder="Which program will this teacher teach?"
              >
                <SelectContent>
                  {programsResult.data?.programs?.map(({ id, name }) => (
                    <SelectItem key={id} value={id!}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </InputField>

              {selectedProgram &&
                (selectedProgram === "SECONDARY" ? (
                  <>
                    <InputField
                      control={form.control}
                      fieldType={FormFieldType.SELECT}
                      label="Subject"
                      name="assignments.subjectId"
                      placeholder="Select Subject"
                    >
                      <SelectContent>
                        {subjectsResult.fetching && (
                          <div className="text-sm text-gray-600">Loading</div>
                        )}
                        {subjectsResult.data?.subjects?.length === 0 && (
                          <div className="text-sm text-gray-600">
                            No grade was found
                          </div>
                        )}

                        {subjectsResult.data?.subjects?.map(({ id, name }) => (
                          <SelectItem key={id} value={id!}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </InputField>

                    <InputField
                      control={form.control}
                      fieldType={FormFieldType.MULTI_SELECT}
                      label="Grades"
                      name="assignments.gradeIds"
                      placeholder={
                        gradesResult.fetching
                          ? "Fetching grades..."
                          : "What grade will they teach?"
                      }
                      options={gradesResult.data?.grades ?? []}
                    />
                  </>
                ) : (
                  <>
                    <InputField
                      control={form.control}
                      fieldType={FormFieldType.SELECT}
                      label="Grade"
                      name="gradeId"
                      placeholder="Select Grade"
                    >
                      <SelectContent>
                        {gradesResult.fetching && (
                          <div className="text-sm text-gray-600">Loading</div>
                        )}
                        {gradesResult.data?.grades?.length === 0 && (
                          <div className="text-sm text-gray-600">
                            No grade was found
                          </div>
                        )}

                        {gradesResult.data?.grades?.map(({ id, name }) => (
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
                      placeholder="Select Class"
                    >
                      <SelectContent>
                        {classesResult.fetching && (
                          <div className="text-sm text-gray-600">Loading</div>
                        )}
                        {classesResult.data?.classes?.length === 0 && (
                          <div className="text-sm text-gray-600">
                            No class was found
                          </div>
                        )}

                        {classesResult.data?.classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </InputField>
                  </>
                ))}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn"
        >
          {!isLoading ? (
            type
          ) : (
            <Loader2 className="animate-spin text-lamaYellow" />
          )}
        </button>
      </form>
    </Form>
  );
};

export default StaffForm;
