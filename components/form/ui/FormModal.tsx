"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormModalProps } from "@/types";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { Dispatch, JSX, SetStateAction, useState } from "react";

const StaffForm = dynamic(() => import("../StaffForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("../StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("../SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("../ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const GradeForm = dynamic(() => import("../GradeForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ProgramForm = dynamic(() => import("../ProgramForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("../ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("../AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("../ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("../AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("../ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("../EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const InvoiceForm = dynamic(() => import("../InvoiceForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TimetableForm = dynamic(() => import("../TimetableForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AcademicYearForm = dynamic(() => import("../AcademicYearForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TermForm = dynamic(() => import("../TermForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PayrollProfileForm = dynamic(() => import("../PayrollProfileForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PayrollInitializer = dynamic(() => import("../PayrollInitializer"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassAssignmentForm = dynamic(() => import("../ClassAssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any,
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} />
  ),
  term: (setOpen, type, data) => (
    <TermForm type={type} data={data} setOpen={setOpen} />
  ),
  "academic-year": (setOpen, type, data) => (
    <AcademicYearForm type={type} data={data} setOpen={setOpen} />
  ),
  grade: (setOpen, type, data) => (
    <GradeForm type={type} data={data} setOpen={setOpen} />
  ),
  program: (setOpen, type, data) => (
    <ProgramForm type={type} data={data} setOpen={setOpen} />
  ),
  timetable: (setOpen, type, data) => (
    <TimetableForm type={type} data={data} setOpen={setOpen} />
  ),
  class: (setOpen, type, data) => (
    <ClassForm type={type} data={data} setOpen={setOpen} />
  ),
  staff: (setOpen, type, data) => (
    <StaffForm type={type} data={data} setOpen={setOpen} />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data) => (
    <ExamForm type={type} data={data} setOpen={setOpen} />
  ),
  assignment: (setOpen, type, data) => (
    <AssignmentForm type={type} data={data} setOpen={setOpen} />
  ),
  "assessment-result": (setOpen, type, data) => (
    <ResultForm type={type} data={data} setOpen={setOpen} />
  ),
  "exam-result": (setOpen, type, data) => (
    <ResultForm type={type} data={data} setOpen={setOpen} />
  ),
  parent: (setOpen, type, data) => (
    <ParentForm type={type} data={data} setOpen={setOpen} />
  ),
  event: (setOpen, type, data) => (
    <EventForm type={type} data={data} setOpen={setOpen} />
  ),
  announcement: (setOpen, type, data) => (
    <AnnouncementForm type={type} data={data} setOpen={setOpen} />
  ),
  invoice: (setOpen, type, data) => (
    <InvoiceForm type={type} data={data} setOpen={setOpen} />
  ),
  "payroll-profile": (setOpen, type, data) => (
    <PayrollProfileForm type={type} data={data} setOpen={setOpen} />
  ),
  "payroll-transaction": (setOpen, type, data) => (
    <PayrollInitializer type={type} data={data} setOpen={setOpen} />
  ),
  "class-assignment": (setOpen, type, data, relatedData) => (
    <ClassAssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  formTitle,
  triggerTitle,
  relatedData,
  children,
}: FormModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            className="flex cursor-pointer items-center gap-1 px-2 text-sm font-normal capitalize"
            aria-describedby={type}
          >
            {triggerTitle || type}
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="custom-scrollbar max-h-[90vh] overflow-y-scroll sm:max-w-3xl">
        <AlertDialogCancel className="absolute top-5 right-5 h-8 w-8 rounded-full">
          <X />
        </AlertDialogCancel>

        <AlertDialogHeader>
          <AlertDialogTitle className="capitalize">
            {formTitle ? formTitle : `${type} ${table.replace("-", " ")}`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Fill out the form below
          </AlertDialogDescription>
        </AlertDialogHeader>

        {forms[table](setOpen, type, data, relatedData)}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FormModal;
