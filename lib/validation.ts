import { parse, isBefore, subYears } from "date-fns";
import { z } from "zod";
import { RoleAccessLevel } from "@/types";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const phonePattern = /^\+?\d{10,15}$/;
const usernamePattern = /^[a-z0-9._]+$/;

const birthday = (diff: number) =>
  z.coerce
    .date({ message: "Birthday is required" })
    .max(new Date(), {
      message: "This user is not yet born? Please, select the correct birthday",
    })
    .refine(
      (date) => {
        return isBefore(date, subYears(new Date(), diff));
      },
      { message: `User must be at least ${diff} years old` },
    );

export const authSchema = (type: "sign-in" | "sign-up") => {
  const baseSchema = z.object({
    email:
      type === "sign-up"
        ? z.string().email("Email address is required")
        : z.null(),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: type === "sign-up" ? z.string().min(8) : z.null(),
  });

  if (type === "sign-up") {
    return baseSchema.refine((data) => data.password === data.confirmPassword, {
      message: "Password doesn't match",
      path: ["confirmPassword"],
    });
  }

  return baseSchema;
};

export type AuthSchema = z.infer<ReturnType<typeof authSchema>>;

export const schoolSchema = z.object({
  slug: z.string().min(3, "This is required"),
  name: z.string().min(3, "What's your school's name?"),
  email: z.string().email(),
  phone: z.string().min(3, "Please enter a phone number"),
  address: z.string().min(3, "Please enter an address"),
  motto: z.string().nullable(),
  logo: z.string().optional(),
  programs: z
    .array(z.enum(["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"]))
    .min(1, "Please select at least one program"),
  grades: z.array(z.string()).min(1, "Please select at least one grade"),
  manager: z.object({
    name: z.string().min(3, { message: "First Name is required" }),
    surname: z.string().min(3, { message: "Surname is required" }),
    phone: z.string().min(10, "Phone number is incorrect"),
  }),
});

export type SchoolSchema = z.infer<typeof schoolSchema>;

export const programSchema = z.object({
  name: z.string().min(1, "Please select a program"),
  grades: z.array(z.string()).min(1, "Select at least one grade"),
});

export type ProgramSchema = z.infer<typeof programSchema>;

export const studentSchema = z
  .object({
    id: z.string().optional(),
    clerkUserId: z.string().optional(),
    registrationNumber: z
      .string()
      .min(1, "This must be up to 3 characters")
      .max(10, "Sorry. This shouldn't exceed 20 characters"),
    name: z.string().min(2, { message: "First Name is required" }),
    surname: z.string().min(2, { message: "Surname is required" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(passwordPattern, {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      })
      .optional()
      .nullable()
      .or(z.literal("")),
    address: z.string().min(3, "Please enter an address"),
    img: z.string().optional().nullable(),
    oldImg: z.string().optional().nullable(),
    birthday: birthday(1),
    medicalCondition: z.string().optional().nullable(),
    sex: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Sex is required" }),
    programId: z.string().optional().nullable(),
    gradeId: z.string().optional().nullable(),
    classId: z.string().min(10, { message: "Class is required" }),

    primaryGuardian: z.object(
      {
        id: z.string().min(5, "Id is missing"),
        name: z.string(),
        relation: z.string().min(1),
      },
      { message: "Primary Guardian is required" },
    ),
    secondaryGuardian: z
      .object({
        id: z.string().optional().nullable(),
        name: z.string().optional().nullable(),
        relation: z.string().nullable(),
      })
      .nullable()
      .refine((data) => !data?.id || data?.relation, {
        message: "How is he/she related to this student?",
        path: ["relation"],
      })
      .refine((data) => !data?.relation || data?.id, {
        message: "Secondary Guardian is missing",
        path: ["id"],
      }),
  })
  .refine(
    (data) =>
      !data.secondaryGuardian ||
      data.primaryGuardian.id !== data.secondaryGuardian.id,
    {
      message: "Primary and secondary guardian cannot be the same person",
      path: ["secondaryGuardian"],
    },
  );

export type StudentSchema = z.infer<typeof studentSchema>;

export const staffSchema = z.object({
  id: z.string().optional().nullable(),
  clerkUserId: z.string().optional().nullable(),
  employeeId: z.string().min(1, "Too short").max(10, "Too long"),
  name: z.string().min(1, { message: "First Name is required" }),
  surname: z.string().min(1, { message: "Surname is required" }),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(phonePattern, "Invalid phone number"),
  password: z
    .union([
      z.string().min(8).regex(passwordPattern, {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  address: z.string().min(5, { message: "Address is required" }),
  birthday: birthday(18),
  hireDate: z.coerce.date().optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  img: z.string().optional().nullable(),
  oldImg: z.string().optional().nullable(),
  contractType: z.enum(["CONTRACT", "PART_TIME", "PERMANENT"]),
  accessLevel: z.enum(["TEACHER", "FINANCE", "RESTRICTED"]),
  role: z.string().min(1, { message: "Role is required" }),
  isActive: z.boolean(),
});

export type StaffSchema = z.infer<typeof staffSchema>;

export const subjectSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(2, { message: "Subject Name is required" }),
  teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const gradeSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().nonempty("Name is required"),
  programId: z.string({ message: "Please indicate the grade's program" }),
});

export type GradeSchema = z.infer<typeof gradeSchema>;

export const classSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, { message: "Class name is required" }),
  capacity: z.coerce
    .number({
      message: "How many students can this class hold?",
    })
    .min(1, { message: "Capacity must be at least 1" }),
  gradeId: z.string({ message: "Grade is required" }),
  supervisors: z.array(z.string()).optional().nullable(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const examSchema = z.object({
  id: z.string().optional().nullable(),
  date: z.coerce.date({ message: "Date is required" }),
  type: z.enum(["FINAL", "TEST", "MIDTERM", "QUIZ", "PRACTICAL"]),
  maxScore: z.coerce.number().min(1),
  subjectId: z.string().min(1, { message: "What subject is this exam for?" }),
  gradeId: z.string().min(1, { message: "Which grade is this exam for?" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const assignmentSchema = z
  .object({
    id: z.string().optional().nullable(),
    dueDate: z.coerce.date({ message: "When's the due date?" }),
    maxScore: z.coerce.number().min(1),
    subjectId: z
      .string()
      .min(1, { message: "What subject is this assignment for?" }),
    classId: z
      .string()
      .min(1, { message: "Which class is this assignment for?" }),
    gradeId: z
      .string({ message: "Which class is this assignment for?" })
      .optional()
      .nullable(),
  })
  .refine((data) => data.dueDate >= new Date(), {
    path: ["dueDate"],
    message: "Due date must be after today's date",
  });

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const timetableAssignmentSchema = z
  .object({
    // Period
    startMinute: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endMinute: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),

    // Assignment
    periodId: z.string().optional().nullable(),
    dayOfWeek: z.string().optional().nullable(),
    subjectId: z.string().optional().nullable(),
    teacherId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const start = parse(data.startMinute, "HH:mm", new Date("1970-01-01"));
      const end = parse(data.endMinute, "HH:mm", new Date("1970-01-01"));
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endMinute"],
    },
  );

export type TimetableAssignmentSchema = z.infer<
  typeof timetableAssignmentSchema
>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, "Username must be up to 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      usernamePattern,
      "Username must contain only lowercase letters, numbers, dots, or underscores",
    )
    .optional()
    .nullable(),
  name: z.string().min(1, { message: "First Name is required" }),
  surname: z.string().min(1, { message: "Surname is required" }),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(11, { message: "Phone is required" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(passwordPattern, {
      message:
        "Password must include uppercase, lowercase, number, and special character",
    })
    .optional()
    .nullable(),
  address: z.string(),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const resultSchema = (maxScore: number) =>
  z.object({
    id: z.string().optional().nullable(),
    score: z.coerce
      .number()
      .min(0)
      .max(maxScore, `Score cannot exceed ${maxScore}`),
    testId: z.string().min(1, "Select a test"),
    student: z.object(
      {
        id: z.string().min(1),
        name: z.string(),
      },
      { message: "Student is required" },
    ),

    termId: z.string().min(1, { message: "Term is required" }),
    gradeId: z.string().min(1, { message: "Grade is required" }),
    classId: z.string().min(1, { message: "Class is required" }),
  });

export type ResultSchema = z.infer<ReturnType<typeof resultSchema>>;

export const eventSchema = z.object({
  id: z.string().optional().nullable(),
  title: z
    .string()
    .min(1, { message: "Event title must be over 8 characters" }),
  description: z
    .string()
    .min(5, { message: "Description is too short" })
    .max(500, { message: "Description is too long" }),
  date: z.coerce.date(),
  gradeId: z.string().optional().nullable(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(50, "Too long"),
  content: z
    .string()
    .min(5, { message: "Description is too short" })
    .max(1000, { message: "Description is too long" }),
  gradeId: z.string().optional().nullable(),
  announcementType: z.enum(["GENERAL", "STAFF_ONLY"]),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const invoiceSchema = z
  .object({
    id: z.string().optional().nullable(),
    number: z.string().min(2),
    title: z.string().min(2),
    amount: z.coerce.number().gt(1000, { message: "Please enter an amount" }),
    dueDate: z.coerce.date().optional().nullable(),
    termId: z.string().min(2),
    grades: z.array(z.string()).optional().nullable(),
  })
  .refine((data) => data.dueDate && data?.dueDate >= new Date(), {
    path: ["dueDate"],
    message: "Due date cannot be in the past",
  });

export type InvoiceSchema = z.infer<typeof invoiceSchema>;

export const transactionSchema = (role: RoleAccessLevel) =>
  z.object({
    email: z.string().email({ message: "Enter a valid email" }),
    student:
      role === "parent"
        ? z.string().min(1)
        : z.object(
            {
              id: z.string().min(1),
              name: z.string(),
            },
            { message: "Student is required" },
          ),
    invoiceId: z.string().min(3, { message: "Which fee are you paying for?" }),
    amount: z.coerce.number().min(1000),
  });

export type TransactionSchema = z.infer<ReturnType<typeof transactionSchema>>;

export const payrollProfileSchema = z.object({
  id: z.string().optional().nullable(),
  staffId: z.string().min(1),
  bankCode: z.string().min(1, "Select the customer's bank"),
  accountNumber: z
    .string({ message: "Provide the customer's account number" })
    .min(10, "Invalid account number")
    .max(11, "Invalid account number"),
  accountName: z
    .string()
    .min(
      1,
      "Select the customer's bank and provide it's associated account number",
    ),
  salary: z.coerce.number(),
});

export type PayrollProfileSchema = z.infer<typeof payrollProfileSchema>;

export const termSchema = z
  .object({
    id: z.string().optional().nullable(),
    session: z.string().min(1, "Session is required"),
    startDate: z.coerce.date({ message: "Start date is required" }),
    endDate: z.coerce
      .date({ message: "End date is required" })
      .optional()
      .nullable(),
    academicYearId: z
      .string({ message: "Please select an academic year" })
      .min(1, "Please select an academic year"),
  })
  .refine((data) => data.endDate == null || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End Date cannot be before Start Date",
  });

export type TermSchema = z.infer<typeof termSchema>;

export const academicYearSchema = z
  .object({
    id: z.string().optional().nullable(),
    year: z.string(),
    startDate: z.coerce.date({ message: "Start date is required" }),
    endDate: z.coerce
      .date({ message: "End date is required" })
      .optional()
      .nullable(),
  })
  .refine((data) => data.endDate == null || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End Date cannot be before Start Date",
  });

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;

export const classAssignmentSchema = z.object({
  gradeId: z.string().min(2, "Grade is required"),
  classId: z.string().min(2, "Class is required"),
  staff: z.object({
    id: z.string().min(1, "Staff is required"),
    name: z.string(),
  }),
});

export type ClassAssignmentSchema = z.infer<typeof classAssignmentSchema>;

export const staffAttendanceSchema = (type: "check-in" | "absent") =>
  z.object({
    reasonForAbsence:
      type === "absent"
        ? z.string().min(1, "What's the reason for absence?")
        : z.string().optional().nullable(),
  });

export type StaffAttendanceSchema = z.infer<
  ReturnType<typeof staffAttendanceSchema>
>;
