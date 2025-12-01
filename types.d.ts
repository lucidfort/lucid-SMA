import { ColumnDef } from "@tanstack/react-table";
import React, { ReactNode } from "react";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string }>;
  params: Promise<{ [key: string]: string }>;
};

type CurrentState = {
  success: boolean;
  error: boolean | string;
  data?: string;
};

type Table =
  | "staff"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "club"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement"
  | "grade"
  | "program"
  | "timetable"
  | "term"
  | "academic-year"
  | "invoice"
  | "transaction"
  | "payroll-profile"
  | "payroll-transaction";

type RoleAccessLevel =
  | "student"
  | "parent"
  | "academics"
  | "finance"
  | "administration"
  | "teacher"
  | "manager";

enum Sex {
  MALE = "male",
  FEMALE = "female",
}

declare type ErrorTypes =
  | "AppError"
  | "BaseAppError"
  | "UniqueConstraintError"
  | "ForeignKeyError"
  | "NotFoundError"
  | "IdentifierExistsError"
  | "PasswordTooShortError"
  | "PasswordPwnedError";

declare type FormModalProps = {
  table: Table;
  type: "create" | "update";
  data?: any;
  studentId?: string;
  triggerTitle?: string;
  relatedData?: any;
  children?: React.ReactNode;
};

declare interface FormProps
  extends Pick<FormModalProps, "type" | "data" | "relatedData"> {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

declare type AttendanceSchema = {
  id?: number;
  date: Date;
  present: boolean;
  studentId: string;
  lessonId: number;
};

declare type TransactionData = {
  id: number;
  status: boolean;
  reference: string;
  amount: number;
  customer: {
    email: string;
  };
  metadata: {
    description: string;
    fee_id: string;
    first_name: string;
    last_name: string;
    user_id: string;
  };
  paidAt: Date | string;
};

declare interface ParentProfileProps {
  students: {
    id: string;
    name: string;
    surname: string;
    class: { name: string };
    attendances: Array<{
      date: string;
      present: boolean;
      lesson: {
        name: string;
        subject: {
          name: string;
        };
      };
    }>;
    results: Array<{
      score: number;
      createdAt: Date;
      exam?: {
        title: string;
      };
      assignment?: {
        title: string;
      };
    }>;
  }[];
}

declare interface TabItemProps {
  icon: ReactNode;
  label: string;
  subLabel: string;
  value: string;
  className?: string;
}

type PaystackTransactionStatus =
  | "success"
  | "failed"
  | "abandoned"
  | "pending"
  | "reversed"
  | "refund"
  | "timeout";

declare interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    domain: string;
    status: PaystackTransactionStatus;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    plan: any;
    split: any;
    paidAt: string;
    createdAt: string;
    pos_transaction_data: any;
  };
}

declare interface DataTableProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  accessLevel: RoleAccessLevel;
  title?: string;
  termFilter?: TermSelectorProps;
  tableFor: Table;
  filters?: {
    listCreation?: boolean;
    termFilter?: boolean;
    selectCount?: boolean;
  };
  relatedData?: any;
  paginate?: boolean;
}
