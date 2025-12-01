/* eslint-disable */
import type { Prisma, AuditLog, School, Program, AcademicYear, Term, Grade, Class, Subject, TimetablePeriod, PeriodSlot, TimetableAssignment, Manager, Student, Staff, Parent, ParentStudent, Club, Exam, Assignment, StudentAttendance, StaffAttendance, Result, TermlyResult, Invoice, InvoicePayment, StaffPayrollProfile, PayrollTransactions, PayrollTransactionLine, Event, Announcement, StudentClassHistory, TeacherSubjectAssignment } from "./prisma/client.js";
export default interface PrismaTypes {
    AuditLog: {
        Name: "AuditLog";
        Shape: AuditLog;
        Include: Prisma.AuditLogInclude;
        Select: Prisma.AuditLogSelect;
        OrderBy: Prisma.AuditLogOrderByWithRelationInput;
        WhereUnique: Prisma.AuditLogWhereUniqueInput;
        Where: Prisma.AuditLogWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "staff";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            staff: {
                Shape: Staff;
                Name: "Staff";
                Nullable: false;
            };
        };
    };
    School: {
        Name: "School";
        Shape: School;
        Include: Prisma.SchoolInclude;
        Select: Prisma.SchoolSelect;
        OrderBy: Prisma.SchoolOrderByWithRelationInput;
        WhereUnique: Prisma.SchoolWhereUniqueInput;
        Where: Prisma.SchoolWhereInput;
        Create: {};
        Update: {};
        RelationName: "auditLogs" | "programs" | "academicYears" | "terms" | "students" | "managers" | "staffs" | "parents" | "grades" | "classes" | "subjects" | "timetablePeriods" | "periodSlots" | "timetableAssignments" | "exams" | "clubs" | "assignments" | "results" | "termlyResults" | "events" | "studentAttendances" | "staffAttendances" | "announcements" | "invoices" | "salaryPayments" | "payments" | "teacherSubjectAssignments" | "studentClassHistory" | "staffsBankAccounts";
        ListRelations: "auditLogs" | "programs" | "academicYears" | "terms" | "students" | "managers" | "staffs" | "parents" | "grades" | "classes" | "subjects" | "timetablePeriods" | "periodSlots" | "timetableAssignments" | "exams" | "clubs" | "assignments" | "results" | "termlyResults" | "events" | "studentAttendances" | "staffAttendances" | "announcements" | "invoices" | "salaryPayments" | "payments" | "teacherSubjectAssignments" | "studentClassHistory" | "staffsBankAccounts";
        Relations: {
            auditLogs: {
                Shape: AuditLog[];
                Name: "AuditLog";
                Nullable: false;
            };
            programs: {
                Shape: Program[];
                Name: "Program";
                Nullable: false;
            };
            academicYears: {
                Shape: AcademicYear[];
                Name: "AcademicYear";
                Nullable: false;
            };
            terms: {
                Shape: Term[];
                Name: "Term";
                Nullable: false;
            };
            students: {
                Shape: Student[];
                Name: "Student";
                Nullable: false;
            };
            managers: {
                Shape: Manager[];
                Name: "Manager";
                Nullable: false;
            };
            staffs: {
                Shape: Staff[];
                Name: "Staff";
                Nullable: false;
            };
            parents: {
                Shape: Parent[];
                Name: "Parent";
                Nullable: false;
            };
            grades: {
                Shape: Grade[];
                Name: "Grade";
                Nullable: false;
            };
            classes: {
                Shape: Class[];
                Name: "Class";
                Nullable: false;
            };
            subjects: {
                Shape: Subject[];
                Name: "Subject";
                Nullable: false;
            };
            timetablePeriods: {
                Shape: TimetablePeriod[];
                Name: "TimetablePeriod";
                Nullable: false;
            };
            periodSlots: {
                Shape: PeriodSlot[];
                Name: "PeriodSlot";
                Nullable: false;
            };
            timetableAssignments: {
                Shape: TimetableAssignment[];
                Name: "TimetableAssignment";
                Nullable: false;
            };
            exams: {
                Shape: Exam[];
                Name: "Exam";
                Nullable: false;
            };
            clubs: {
                Shape: Club[];
                Name: "Club";
                Nullable: false;
            };
            assignments: {
                Shape: Assignment[];
                Name: "Assignment";
                Nullable: false;
            };
            results: {
                Shape: Result[];
                Name: "Result";
                Nullable: false;
            };
            termlyResults: {
                Shape: TermlyResult[];
                Name: "TermlyResult";
                Nullable: false;
            };
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            studentAttendances: {
                Shape: StudentAttendance[];
                Name: "StudentAttendance";
                Nullable: false;
            };
            staffAttendances: {
                Shape: StaffAttendance[];
                Name: "StaffAttendance";
                Nullable: false;
            };
            announcements: {
                Shape: Announcement[];
                Name: "Announcement";
                Nullable: false;
            };
            invoices: {
                Shape: Invoice[];
                Name: "Invoice";
                Nullable: false;
            };
            salaryPayments: {
                Shape: PayrollTransactions[];
                Name: "PayrollTransactions";
                Nullable: false;
            };
            payments: {
                Shape: InvoicePayment[];
                Name: "InvoicePayment";
                Nullable: false;
            };
            teacherSubjectAssignments: {
                Shape: TeacherSubjectAssignment[];
                Name: "TeacherSubjectAssignment";
                Nullable: false;
            };
            studentClassHistory: {
                Shape: StudentClassHistory[];
                Name: "StudentClassHistory";
                Nullable: false;
            };
            staffsBankAccounts: {
                Shape: StaffPayrollProfile[];
                Name: "StaffPayrollProfile";
                Nullable: false;
            };
        };
    };
    Program: {
        Name: "Program";
        Shape: Program;
        Include: Prisma.ProgramInclude;
        Select: Prisma.ProgramSelect;
        OrderBy: Prisma.ProgramOrderByWithRelationInput;
        WhereUnique: Prisma.ProgramWhereUniqueInput;
        Where: Prisma.ProgramWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "grades";
        ListRelations: "grades";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            grades: {
                Shape: Grade[];
                Name: "Grade";
                Nullable: false;
            };
        };
    };
    AcademicYear: {
        Name: "AcademicYear";
        Shape: AcademicYear;
        Include: Prisma.AcademicYearInclude;
        Select: Prisma.AcademicYearSelect;
        OrderBy: Prisma.AcademicYearOrderByWithRelationInput;
        WhereUnique: Prisma.AcademicYearWhereUniqueInput;
        Where: Prisma.AcademicYearWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "terms";
        ListRelations: "terms";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            terms: {
                Shape: Term[];
                Name: "Term";
                Nullable: false;
            };
        };
    };
    Term: {
        Name: "Term";
        Shape: Term;
        Include: Prisma.TermInclude;
        Select: Prisma.TermSelect;
        OrderBy: Prisma.TermOrderByWithRelationInput;
        WhereUnique: Prisma.TermWhereUniqueInput;
        Where: Prisma.TermWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "academicYear" | "exams" | "assignments" | "events" | "studentAttendances" | "staffAttendances" | "announcements" | "invoices" | "termlyResults";
        ListRelations: "exams" | "assignments" | "events" | "studentAttendances" | "staffAttendances" | "announcements" | "invoices" | "termlyResults";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            academicYear: {
                Shape: AcademicYear;
                Name: "AcademicYear";
                Nullable: false;
            };
            exams: {
                Shape: Exam[];
                Name: "Exam";
                Nullable: false;
            };
            assignments: {
                Shape: Assignment[];
                Name: "Assignment";
                Nullable: false;
            };
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            studentAttendances: {
                Shape: StudentAttendance[];
                Name: "StudentAttendance";
                Nullable: false;
            };
            staffAttendances: {
                Shape: StaffAttendance[];
                Name: "StaffAttendance";
                Nullable: false;
            };
            announcements: {
                Shape: Announcement[];
                Name: "Announcement";
                Nullable: false;
            };
            invoices: {
                Shape: Invoice[];
                Name: "Invoice";
                Nullable: false;
            };
            termlyResults: {
                Shape: TermlyResult[];
                Name: "TermlyResult";
                Nullable: false;
            };
        };
    };
    Grade: {
        Name: "Grade";
        Shape: Grade;
        Include: Prisma.GradeInclude;
        Select: Prisma.GradeSelect;
        OrderBy: Prisma.GradeOrderByWithRelationInput;
        WhereUnique: Prisma.GradeWhereUniqueInput;
        Where: Prisma.GradeWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "program" | "classes" | "exams" | "invoices" | "events" | "announcements";
        ListRelations: "classes" | "exams" | "invoices" | "events" | "announcements";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            program: {
                Shape: Program;
                Name: "Program";
                Nullable: false;
            };
            classes: {
                Shape: Class[];
                Name: "Class";
                Nullable: false;
            };
            exams: {
                Shape: Exam[];
                Name: "Exam";
                Nullable: false;
            };
            invoices: {
                Shape: Invoice[];
                Name: "Invoice";
                Nullable: false;
            };
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            announcements: {
                Shape: Announcement[];
                Name: "Announcement";
                Nullable: false;
            };
        };
    };
    Class: {
        Name: "Class";
        Shape: Class;
        Include: Prisma.ClassInclude;
        Select: Prisma.ClassSelect;
        OrderBy: Prisma.ClassOrderByWithRelationInput;
        WhereUnique: Prisma.ClassWhereUniqueInput;
        Where: Prisma.ClassWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "grade" | "students" | "supervisors" | "assignments" | "attendances" | "timetableAssignments" | "studentClassHistory" | "timetablePeriods";
        ListRelations: "students" | "supervisors" | "assignments" | "attendances" | "timetableAssignments" | "studentClassHistory" | "timetablePeriods";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            grade: {
                Shape: Grade;
                Name: "Grade";
                Nullable: false;
            };
            students: {
                Shape: Student[];
                Name: "Student";
                Nullable: false;
            };
            supervisors: {
                Shape: Staff[];
                Name: "Staff";
                Nullable: false;
            };
            assignments: {
                Shape: Assignment[];
                Name: "Assignment";
                Nullable: false;
            };
            attendances: {
                Shape: StudentAttendance[];
                Name: "StudentAttendance";
                Nullable: false;
            };
            timetableAssignments: {
                Shape: TimetableAssignment[];
                Name: "TimetableAssignment";
                Nullable: false;
            };
            studentClassHistory: {
                Shape: StudentClassHistory[];
                Name: "StudentClassHistory";
                Nullable: false;
            };
            timetablePeriods: {
                Shape: TimetablePeriod[];
                Name: "TimetablePeriod";
                Nullable: false;
            };
        };
    };
    Subject: {
        Name: "Subject";
        Shape: Subject;
        Include: Prisma.SubjectInclude;
        Select: Prisma.SubjectSelect;
        OrderBy: Prisma.SubjectOrderByWithRelationInput;
        WhereUnique: Prisma.SubjectWhereUniqueInput;
        Where: Prisma.SubjectWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "exams" | "assignments" | "timetableAssignments" | "teacherSubjectAssignments";
        ListRelations: "exams" | "assignments" | "timetableAssignments" | "teacherSubjectAssignments";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            exams: {
                Shape: Exam[];
                Name: "Exam";
                Nullable: false;
            };
            assignments: {
                Shape: Assignment[];
                Name: "Assignment";
                Nullable: false;
            };
            timetableAssignments: {
                Shape: TimetableAssignment[];
                Name: "TimetableAssignment";
                Nullable: false;
            };
            teacherSubjectAssignments: {
                Shape: TeacherSubjectAssignment[];
                Name: "TeacherSubjectAssignment";
                Nullable: false;
            };
        };
    };
    TimetablePeriod: {
        Name: "TimetablePeriod";
        Shape: TimetablePeriod;
        Include: Prisma.TimetablePeriodInclude;
        Select: Prisma.TimetablePeriodSelect;
        OrderBy: Prisma.TimetablePeriodOrderByWithRelationInput;
        WhereUnique: Prisma.TimetablePeriodWhereUniqueInput;
        Where: Prisma.TimetablePeriodWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "class" | "periodSlots";
        ListRelations: "periodSlots";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            class: {
                Shape: Class | null;
                Name: "Class";
                Nullable: true;
            };
            periodSlots: {
                Shape: PeriodSlot[];
                Name: "PeriodSlot";
                Nullable: false;
            };
        };
    };
    PeriodSlot: {
        Name: "PeriodSlot";
        Shape: PeriodSlot;
        Include: Prisma.PeriodSlotInclude;
        Select: Prisma.PeriodSlotSelect;
        OrderBy: Prisma.PeriodSlotOrderByWithRelationInput;
        WhereUnique: Prisma.PeriodSlotWhereUniqueInput;
        Where: Prisma.PeriodSlotWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "period" | "timetableAssignments";
        ListRelations: "timetableAssignments";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            period: {
                Shape: TimetablePeriod;
                Name: "TimetablePeriod";
                Nullable: false;
            };
            timetableAssignments: {
                Shape: TimetableAssignment[];
                Name: "TimetableAssignment";
                Nullable: false;
            };
        };
    };
    TimetableAssignment: {
        Name: "TimetableAssignment";
        Shape: TimetableAssignment;
        Include: Prisma.TimetableAssignmentInclude;
        Select: Prisma.TimetableAssignmentSelect;
        OrderBy: Prisma.TimetableAssignmentOrderByWithRelationInput;
        WhereUnique: Prisma.TimetableAssignmentWhereUniqueInput;
        Where: Prisma.TimetableAssignmentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "periodSlot" | "class" | "teacher" | "subject";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            periodSlot: {
                Shape: PeriodSlot;
                Name: "PeriodSlot";
                Nullable: false;
            };
            class: {
                Shape: Class;
                Name: "Class";
                Nullable: false;
            };
            teacher: {
                Shape: Staff | null;
                Name: "Staff";
                Nullable: true;
            };
            subject: {
                Shape: Subject | null;
                Name: "Subject";
                Nullable: true;
            };
        };
    };
    Manager: {
        Name: "Manager";
        Shape: Manager;
        Include: Prisma.ManagerInclude;
        Select: Prisma.ManagerSelect;
        OrderBy: Prisma.ManagerOrderByWithRelationInput;
        WhereUnique: Prisma.ManagerWhereUniqueInput;
        Where: Prisma.ManagerWhereInput;
        Create: {};
        Update: {};
        RelationName: "school";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
        };
    };
    Student: {
        Name: "Student";
        Shape: Student;
        Include: Prisma.StudentInclude;
        Select: Prisma.StudentSelect;
        OrderBy: Prisma.StudentOrderByWithRelationInput;
        WhereUnique: Prisma.StudentWhereUniqueInput;
        Where: Prisma.StudentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "class" | "club" | "parentStudents" | "results" | "attendances" | "invoicePayments" | "studentClassHistory" | "termlyResults";
        ListRelations: "parentStudents" | "results" | "attendances" | "invoicePayments" | "studentClassHistory" | "termlyResults";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            class: {
                Shape: Class;
                Name: "Class";
                Nullable: false;
            };
            club: {
                Shape: Club | null;
                Name: "Club";
                Nullable: true;
            };
            parentStudents: {
                Shape: ParentStudent[];
                Name: "ParentStudent";
                Nullable: false;
            };
            results: {
                Shape: Result[];
                Name: "Result";
                Nullable: false;
            };
            attendances: {
                Shape: StudentAttendance[];
                Name: "StudentAttendance";
                Nullable: false;
            };
            invoicePayments: {
                Shape: InvoicePayment[];
                Name: "InvoicePayment";
                Nullable: false;
            };
            studentClassHistory: {
                Shape: StudentClassHistory[];
                Name: "StudentClassHistory";
                Nullable: false;
            };
            termlyResults: {
                Shape: TermlyResult[];
                Name: "TermlyResult";
                Nullable: false;
            };
        };
    };
    Staff: {
        Name: "Staff";
        Shape: Staff;
        Include: Prisma.StaffInclude;
        Select: Prisma.StaffSelect;
        OrderBy: Prisma.StaffOrderByWithRelationInput;
        WhereUnique: Prisma.StaffWhereUniqueInput;
        Where: Prisma.StaffWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "auditLogs" | "class" | "club" | "salaryInfo" | "timetableAssignments" | "attendances" | "salaries" | "teacherSubjectAssignments";
        ListRelations: "auditLogs" | "timetableAssignments" | "attendances" | "salaries" | "teacherSubjectAssignments";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            auditLogs: {
                Shape: AuditLog[];
                Name: "AuditLog";
                Nullable: false;
            };
            class: {
                Shape: Class | null;
                Name: "Class";
                Nullable: true;
            };
            club: {
                Shape: Club | null;
                Name: "Club";
                Nullable: true;
            };
            salaryInfo: {
                Shape: StaffPayrollProfile | null;
                Name: "StaffPayrollProfile";
                Nullable: true;
            };
            timetableAssignments: {
                Shape: TimetableAssignment[];
                Name: "TimetableAssignment";
                Nullable: false;
            };
            attendances: {
                Shape: StaffAttendance[];
                Name: "StaffAttendance";
                Nullable: false;
            };
            salaries: {
                Shape: PayrollTransactions[];
                Name: "PayrollTransactions";
                Nullable: false;
            };
            teacherSubjectAssignments: {
                Shape: TeacherSubjectAssignment[];
                Name: "TeacherSubjectAssignment";
                Nullable: false;
            };
        };
    };
    Parent: {
        Name: "Parent";
        Shape: Parent;
        Include: Prisma.ParentInclude;
        Select: Prisma.ParentSelect;
        OrderBy: Prisma.ParentOrderByWithRelationInput;
        WhereUnique: Prisma.ParentWhereUniqueInput;
        Where: Prisma.ParentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "parentStudents";
        ListRelations: "parentStudents";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            parentStudents: {
                Shape: ParentStudent[];
                Name: "ParentStudent";
                Nullable: false;
            };
        };
    };
    ParentStudent: {
        Name: "ParentStudent";
        Shape: ParentStudent;
        Include: Prisma.ParentStudentInclude;
        Select: Prisma.ParentStudentSelect;
        OrderBy: Prisma.ParentStudentOrderByWithRelationInput;
        WhereUnique: Prisma.ParentStudentWhereUniqueInput;
        Where: Prisma.ParentStudentWhereInput;
        Create: {};
        Update: {};
        RelationName: "parent" | "student";
        ListRelations: never;
        Relations: {
            parent: {
                Shape: Parent;
                Name: "Parent";
                Nullable: false;
            };
            student: {
                Shape: Student;
                Name: "Student";
                Nullable: false;
            };
        };
    };
    Club: {
        Name: "Club";
        Shape: Club;
        Include: Prisma.ClubInclude;
        Select: Prisma.ClubSelect;
        OrderBy: Prisma.ClubOrderByWithRelationInput;
        WhereUnique: Prisma.ClubWhereUniqueInput;
        Where: Prisma.ClubWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "supervisors" | "members";
        ListRelations: "supervisors" | "members";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            supervisors: {
                Shape: Staff[];
                Name: "Staff";
                Nullable: false;
            };
            members: {
                Shape: Student[];
                Name: "Student";
                Nullable: false;
            };
        };
    };
    Exam: {
        Name: "Exam";
        Shape: Exam;
        Include: Prisma.ExamInclude;
        Select: Prisma.ExamSelect;
        OrderBy: Prisma.ExamOrderByWithRelationInput;
        WhereUnique: Prisma.ExamWhereUniqueInput;
        Where: Prisma.ExamWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "subject" | "grade" | "term" | "results";
        ListRelations: "results";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            subject: {
                Shape: Subject;
                Name: "Subject";
                Nullable: false;
            };
            grade: {
                Shape: Grade;
                Name: "Grade";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            results: {
                Shape: Result[];
                Name: "Result";
                Nullable: false;
            };
        };
    };
    Assignment: {
        Name: "Assignment";
        Shape: Assignment;
        Include: Prisma.AssignmentInclude;
        Select: Prisma.AssignmentSelect;
        OrderBy: Prisma.AssignmentOrderByWithRelationInput;
        WhereUnique: Prisma.AssignmentWhereUniqueInput;
        Where: Prisma.AssignmentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "subject" | "class" | "term" | "results";
        ListRelations: "results";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            subject: {
                Shape: Subject;
                Name: "Subject";
                Nullable: false;
            };
            class: {
                Shape: Class;
                Name: "Class";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            results: {
                Shape: Result[];
                Name: "Result";
                Nullable: false;
            };
        };
    };
    StudentAttendance: {
        Name: "StudentAttendance";
        Shape: StudentAttendance;
        Include: Prisma.StudentAttendanceInclude;
        Select: Prisma.StudentAttendanceSelect;
        OrderBy: Prisma.StudentAttendanceOrderByWithRelationInput;
        WhereUnique: Prisma.StudentAttendanceWhereUniqueInput;
        Where: Prisma.StudentAttendanceWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "student" | "class";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            student: {
                Shape: Student;
                Name: "Student";
                Nullable: false;
            };
            class: {
                Shape: Class;
                Name: "Class";
                Nullable: false;
            };
        };
    };
    StaffAttendance: {
        Name: "StaffAttendance";
        Shape: StaffAttendance;
        Include: Prisma.StaffAttendanceInclude;
        Select: Prisma.StaffAttendanceSelect;
        OrderBy: Prisma.StaffAttendanceOrderByWithRelationInput;
        WhereUnique: Prisma.StaffAttendanceWhereUniqueInput;
        Where: Prisma.StaffAttendanceWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "staff";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            staff: {
                Shape: Staff;
                Name: "Staff";
                Nullable: false;
            };
        };
    };
    Result: {
        Name: "Result";
        Shape: Result;
        Include: Prisma.ResultInclude;
        Select: Prisma.ResultSelect;
        OrderBy: Prisma.ResultOrderByWithRelationInput;
        WhereUnique: Prisma.ResultWhereUniqueInput;
        Where: Prisma.ResultWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "student" | "exam" | "assignment";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            student: {
                Shape: Student;
                Name: "Student";
                Nullable: false;
            };
            exam: {
                Shape: Exam | null;
                Name: "Exam";
                Nullable: true;
            };
            assignment: {
                Shape: Assignment | null;
                Name: "Assignment";
                Nullable: true;
            };
        };
    };
    TermlyResult: {
        Name: "TermlyResult";
        Shape: TermlyResult;
        Include: Prisma.TermlyResultInclude;
        Select: Prisma.TermlyResultSelect;
        OrderBy: Prisma.TermlyResultOrderByWithRelationInput;
        WhereUnique: Prisma.TermlyResultWhereUniqueInput;
        Where: Prisma.TermlyResultWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "student";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            student: {
                Shape: Student;
                Name: "Student";
                Nullable: false;
            };
        };
    };
    Invoice: {
        Name: "Invoice";
        Shape: Invoice;
        Include: Prisma.InvoiceInclude;
        Select: Prisma.InvoiceSelect;
        OrderBy: Prisma.InvoiceOrderByWithRelationInput;
        WhereUnique: Prisma.InvoiceWhereUniqueInput;
        Where: Prisma.InvoiceWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "grades" | "payments";
        ListRelations: "grades" | "payments";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            grades: {
                Shape: Grade[];
                Name: "Grade";
                Nullable: false;
            };
            payments: {
                Shape: InvoicePayment[];
                Name: "InvoicePayment";
                Nullable: false;
            };
        };
    };
    InvoicePayment: {
        Name: "InvoicePayment";
        Shape: InvoicePayment;
        Include: Prisma.InvoicePaymentInclude;
        Select: Prisma.InvoicePaymentSelect;
        OrderBy: Prisma.InvoicePaymentOrderByWithRelationInput;
        WhereUnique: Prisma.InvoicePaymentWhereUniqueInput;
        Where: Prisma.InvoicePaymentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "invoice" | "students";
        ListRelations: "students";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            invoice: {
                Shape: Invoice;
                Name: "Invoice";
                Nullable: false;
            };
            students: {
                Shape: Student[];
                Name: "Student";
                Nullable: false;
            };
        };
    };
    StaffPayrollProfile: {
        Name: "StaffPayrollProfile";
        Shape: StaffPayrollProfile;
        Include: Prisma.StaffPayrollProfileInclude;
        Select: Prisma.StaffPayrollProfileSelect;
        OrderBy: Prisma.StaffPayrollProfileOrderByWithRelationInput;
        WhereUnique: Prisma.StaffPayrollProfileWhereUniqueInput;
        Where: Prisma.StaffPayrollProfileWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "staff";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            staff: {
                Shape: Staff;
                Name: "Staff";
                Nullable: false;
            };
        };
    };
    PayrollTransactions: {
        Name: "PayrollTransactions";
        Shape: PayrollTransactions;
        Include: Prisma.PayrollTransactionsInclude;
        Select: Prisma.PayrollTransactionsSelect;
        OrderBy: Prisma.PayrollTransactionsOrderByWithRelationInput;
        WhereUnique: Prisma.PayrollTransactionsWhereUniqueInput;
        Where: Prisma.PayrollTransactionsWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "staff" | "lineItems";
        ListRelations: "lineItems";
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            staff: {
                Shape: Staff;
                Name: "Staff";
                Nullable: false;
            };
            lineItems: {
                Shape: PayrollTransactionLine[];
                Name: "PayrollTransactionLine";
                Nullable: false;
            };
        };
    };
    PayrollTransactionLine: {
        Name: "PayrollTransactionLine";
        Shape: PayrollTransactionLine;
        Include: Prisma.PayrollTransactionLineInclude;
        Select: Prisma.PayrollTransactionLineSelect;
        OrderBy: Prisma.PayrollTransactionLineOrderByWithRelationInput;
        WhereUnique: Prisma.PayrollTransactionLineWhereUniqueInput;
        Where: Prisma.PayrollTransactionLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "salaryPayment";
        ListRelations: never;
        Relations: {
            salaryPayment: {
                Shape: PayrollTransactions;
                Name: "PayrollTransactions";
                Nullable: false;
            };
        };
    };
    Event: {
        Name: "Event";
        Shape: Event;
        Include: Prisma.EventInclude;
        Select: Prisma.EventSelect;
        OrderBy: Prisma.EventOrderByWithRelationInput;
        WhereUnique: Prisma.EventWhereUniqueInput;
        Where: Prisma.EventWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "grade";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            grade: {
                Shape: Grade | null;
                Name: "Grade";
                Nullable: true;
            };
        };
    };
    Announcement: {
        Name: "Announcement";
        Shape: Announcement;
        Include: Prisma.AnnouncementInclude;
        Select: Prisma.AnnouncementSelect;
        OrderBy: Prisma.AnnouncementOrderByWithRelationInput;
        WhereUnique: Prisma.AnnouncementWhereUniqueInput;
        Where: Prisma.AnnouncementWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "term" | "grade";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            term: {
                Shape: Term;
                Name: "Term";
                Nullable: false;
            };
            grade: {
                Shape: Grade | null;
                Name: "Grade";
                Nullable: true;
            };
        };
    };
    StudentClassHistory: {
        Name: "StudentClassHistory";
        Shape: StudentClassHistory;
        Include: Prisma.StudentClassHistoryInclude;
        Select: Prisma.StudentClassHistorySelect;
        OrderBy: Prisma.StudentClassHistoryOrderByWithRelationInput;
        WhereUnique: Prisma.StudentClassHistoryWhereUniqueInput;
        Where: Prisma.StudentClassHistoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "student" | "class";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            student: {
                Shape: Student;
                Name: "Student";
                Nullable: false;
            };
            class: {
                Shape: Class;
                Name: "Class";
                Nullable: false;
            };
        };
    };
    TeacherSubjectAssignment: {
        Name: "TeacherSubjectAssignment";
        Shape: TeacherSubjectAssignment;
        Include: Prisma.TeacherSubjectAssignmentInclude;
        Select: Prisma.TeacherSubjectAssignmentSelect;
        OrderBy: Prisma.TeacherSubjectAssignmentOrderByWithRelationInput;
        WhereUnique: Prisma.TeacherSubjectAssignmentWhereUniqueInput;
        Where: Prisma.TeacherSubjectAssignmentWhereInput;
        Create: {};
        Update: {};
        RelationName: "school" | "teacher" | "subject";
        ListRelations: never;
        Relations: {
            school: {
                Shape: School;
                Name: "School";
                Nullable: false;
            };
            teacher: {
                Shape: Staff;
                Name: "Staff";
                Nullable: false;
            };
            subject: {
                Shape: Subject;
                Name: "Subject";
                Nullable: false;
            };
        };
    };
}