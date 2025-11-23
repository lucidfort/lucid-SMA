import { ClassSchema, SchoolSchema } from "@/lib/validation";

export const schoolDefaultValues: SchoolSchema = {
  slug: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  motto: null,
  programs: [],
  grades: [],
  managerEmail: "",
  managerBirthday: new Date(),
  managerName: "",
  managerSurname: "",
  managerPhone: "",
  password: "",
  managerUsername: "",
};

export const classDefaultValues = (data?: ClassSchema) => ({
  id: data?.id,
  name: data?.name ?? "",
  gradeId: data?.gradeId ?? "",
  capacity: data?.capacity ?? 0,
  supervisors: data?.supervisors ?? null,
});
