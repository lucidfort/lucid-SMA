import { ColumnDef } from "@tanstack/react-table";
import type React from "react";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string }>;
  params: Promise<{ [key: string]: string }>;
};

type UserAuth = {
  isAuthenticated: boolean;
  accessLevel?: RoleAccessLevel;
  currentUserId?: string;
  schoolId?: string;
};

type GraphQlContext = {
  userId: string;
  schoolId: string;
  accessLevel: RoleAccessLevel;
  currentTerm: string | null;
  slug: string | null;
};

declare interface ServerActions {
  context: GraphQlContext;
}

type Table =
  | "staff"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "exam"
  | "assignment"
  | "exam-result"
  | "assessment-result"
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
  | "payroll-transaction"
  | "class-assignment";

type RoleAccessLevel = "parent" | "finance" | "teacher" | "manager";

enum Sex {
  MALE = "male",
  FEMALE = "female",
}

declare type FormModalProps = {
  table: Table;
  type: "create" | "update";
  data?: any;
  formTitle?: string;
  studentId?: string;
  triggerTitle?: string;
  relatedData?: any;
  children?: React.ReactNode;
};

declare interface FormProps
  extends Pick<FormModalProps, "type" | "data" | "relatedData"> {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

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

declare interface PaystackBank {
  id: number;
  name: string;
  code: string;
  active: boolean;
  type: "nuban" | string;
  is_deleted: boolean;
}

declare interface ResolveRecipientResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

declare interface CreateRecipientResponse {
  id: number;
  active: boolean;
  recipient_code: string;
  details: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

declare interface TransferResponse {
  amount: number;
  reference: string;
  reason: string | null;
  status: "success" | "failed" | "pending";
  failures: any | null;
  transfer_code: string;
  id: number;
}

declare interface DataTableProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  accessLevel: RoleAccessLevel;
  title?: string;
  tableFor: Table;
  filters?: {
    listCreation?: boolean;
    termFilter?: boolean;
    selectCount?: boolean;
    sortFilter?: boolean;
  };
  relatedData?: any;
  pagination?: {
    page: string;
    hasNextPage: boolean;
  };
}

export type AttendanceRange = "WEEKLY" | "MONTHLY" | "YEARLY";
