import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  Email: { input: any; output: any; }
};

export type AcademicYear = {
  __typename?: 'AcademicYear';
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  startDate: Scalars['DateTime']['output'];
  terms: Array<Term>;
  year: Scalars['String']['output'];
};

export type AcademicYearInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isCurrent: Scalars['Boolean']['input'];
  startDate: Scalars['DateTime']['input'];
  year: Scalars['String']['input'];
};

export enum AccessLevel {
  Academics = 'ACADEMICS',
  Administration = 'ADMINISTRATION',
  Finance = 'FINANCE',
  Restricted = 'RESTRICTED',
  Teacher = 'TEACHER'
}

export type Announcement = {
  __typename?: 'Announcement';
  content: Scalars['String']['output'];
  grade?: Maybe<Grade>;
  gradeId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  publishedAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type AnnouncementFilter = {
  gradeId?: InputMaybe<Scalars['ID']['input']>;
  rangeFrom?: InputMaybe<Scalars['DateTime']['input']>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type AnnouncementInput = {
  content: Scalars['String']['input'];
  gradeId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  staffOnly: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
};

export type AppError = {
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Assignment = {
  __typename?: 'Assignment';
  class: Class;
  dueDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxScore: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
  subject: Subject;
  term: Term;
};

export type AssignmentFilter = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  teacherId?: InputMaybe<Scalars['ID']['input']>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type AssignmentInput = {
  classId: Scalars['String']['input'];
  dueDate: Scalars['DateTime']['input'];
  files?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  maxScore: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  subjectId: Scalars['String']['input'];
  termId: Scalars['String']['input'];
};

export type AttendanceFilter = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate: Scalars['DateTime']['input'];
  studentId?: InputMaybe<Scalars['ID']['input']>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type AttendanceRecords = {
  present: Scalars['Boolean']['input'];
  studentId: Scalars['ID']['input'];
};

export type BaseAppError = AppError & Error & {
  __typename?: 'BaseAppError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type BaseError = Error & {
  __typename?: 'BaseError';
  message?: Maybe<Scalars['String']['output']>;
};

export type Class = {
  __typename?: 'Class';
  attendancePresentCount: Scalars['Int']['output'];
  attendances: Array<StudentAttendance>;
  capacity: Scalars['Int']['output'];
  grade: Grade;
  gradeId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  studentCount: Scalars['Int']['output'];
  students: Array<Student>;
  supervisors: Array<Staff>;
};


export type ClassAttendancePresentCountArgs = {
  attendanceFilter: AttendanceFilter;
};


export type ClassAttendancesArgs = {
  attendanceFilter: AttendanceFilter;
};

export type ClassFilterInput = {
  gradeId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  programId?: InputMaybe<Scalars['ID']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
};

export type ClassInput = {
  capacity: Scalars['Int']['input'];
  gradeId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  supervisors?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Club = {
  __typename?: 'Club';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  foundedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  members: Array<Student>;
  name: Scalars['String']['output'];
  supervisors: Array<Staff>;
};

export type ClubFilter = {
  staffId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};

export type ClubInput = {
  description: Scalars['String']['input'];
  foundedAt?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export enum ContractType {
  Contract = 'CONTRACT',
  PartTime = 'PART_TIME',
  Permanent = 'PERMANENT'
}

export type Error = {
  message?: Maybe<Scalars['String']['output']>;
};

export type Event = {
  __typename?: 'Event';
  description: Scalars['String']['output'];
  endTime: Scalars['DateTime']['output'];
  grade?: Maybe<Grade>;
  group: EventGroupEnum;
  id: Scalars['ID']['output'];
  startTime: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type EventFilter = {
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  gradeId?: InputMaybe<Scalars['ID']['input']>;
  startTime: Scalars['DateTime']['input'];
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export enum EventGroupEnum {
  Public = 'PUBLIC',
  Staff = 'STAFF'
}

export type EventInput = {
  description: Scalars['String']['input'];
  endTime: Scalars['DateTime']['input'];
  gradeId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  startTime: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
};

export type Exam = {
  __typename?: 'Exam';
  date: Scalars['DateTime']['output'];
  endTime?: Maybe<Scalars['String']['output']>;
  grade: Grade;
  id: Scalars['ID']['output'];
  maxScore: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
  subject: Subject;
  term: Term;
  type: ExamType;
};

export type ExamFilter = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  gradeId?: InputMaybe<Scalars['ID']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  teacherId?: InputMaybe<Scalars['ID']['input']>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type ExamInput = {
  date: Scalars['DateTime']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  files?: InputMaybe<Array<Scalars['String']['input']>>;
  gradeId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  maxScore: Scalars['Int']['input'];
  startTime: Scalars['String']['input'];
  subjectId: Scalars['String']['input'];
  termId: Scalars['String']['input'];
  type: ExamType;
};

export enum ExamType {
  Final = 'FINAL',
  Midterm = 'MIDTERM',
  Practical = 'PRACTICAL',
  Quiz = 'QUIZ',
  Test = 'TEST'
}

export type FeePaymentInput = {
  amount: Scalars['Int']['input'];
  email: Scalars['Email']['input'];
  invoiceId: Scalars['ID']['input'];
  studentId: Scalars['String']['input'];
};

export type FeePaymentResponse = {
  __typename?: 'FeePaymentResponse';
  access_code: Scalars['String']['output'];
  authorization_url: Scalars['String']['output'];
  reference: Scalars['String']['output'];
};

export type ForeignKeyError = AppError & Error & {
  __typename?: 'ForeignKeyError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Grade = {
  __typename?: 'Grade';
  classes: Array<Class>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  program: Program;
  programId: Scalars['String']['output'];
  studentCount: Scalars['Int']['output'];
};


export type GradeEventsArgs = {
  eventsFilter: EventFilter;
};

export type GradeFilterInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  programId?: InputMaybe<Scalars['ID']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
};

export type GradeInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  programId: Scalars['String']['input'];
};

export type GuardianInput = {
  id: Scalars['ID']['input'];
  relation: ParentStudentRelationship;
};

export type IdentifierExistsError = AppError & Error & {
  __typename?: 'IdentifierExistsError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Invoice = {
  __typename?: 'Invoice';
  amount: Scalars['Int']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  grades: Array<Grade>;
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
  paymentCount: Scalars['Int']['output'];
  payments: Array<InvoicePayment>;
  studentCount?: Maybe<Scalars['Int']['output']>;
  term: Term;
  termId: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type InvoiceFilter = {
  classId?: InputMaybe<Scalars['String']['input']>;
  gradeId?: InputMaybe<Scalars['String']['input']>;
  invoiceId?: InputMaybe<Scalars['ID']['input']>;
  termId?: InputMaybe<Scalars['String']['input']>;
};

export type InvoiceInput = {
  amount: Scalars['Int']['input'];
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  grades?: InputMaybe<Array<Scalars['ID']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  number: Scalars['String']['input'];
  termId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type InvoicePayment = {
  __typename?: 'InvoicePayment';
  amountPaid: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invoice: Invoice;
  method?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  payerEmail?: Maybe<Scalars['String']['output']>;
  reference: Scalars['String']['output'];
  status: PaymentStatus;
  students: Array<Student>;
};

export type InvoicePaymentFilter = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  reference?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<PaymentStatus>;
  studentName?: InputMaybe<Scalars['String']['input']>;
};

export type ManagerInput = {
  birthday: Scalars['DateTime']['input'];
  email: Scalars['String']['input'];
  img?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  surname: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAnnouncement?: Maybe<MutationCreateAnnouncementResult>;
  createAssignment?: Maybe<MutationCreateAssignmentResult>;
  createClass?: Maybe<MutationCreateClassResult>;
  createClub?: Maybe<MutationCreateClubResult>;
  createEvent?: Maybe<MutationCreateEventResult>;
  createExam?: Maybe<MutationCreateExamResult>;
  createGrade?: Maybe<MutationCreateGradeResult>;
  createInvoice?: Maybe<MutationCreateInvoiceResult>;
  createParent?: Maybe<MutationCreateParentResult>;
  createProgram?: Maybe<MutationCreateProgramResult>;
  createResult?: Maybe<MutationCreateResultResult>;
  createSchool?: Maybe<MutationCreateSchoolResult>;
  createStaff?: Maybe<MutationCreateStaffResult>;
  createStudent?: Maybe<MutationCreateStudentResult>;
  createSubject?: Maybe<MutationCreateSubjectResult>;
  initiateFeePayment?: Maybe<MutationInitiateFeePaymentResult>;
  markStaffAttendance?: Maybe<MutationMarkStaffAttendanceResult>;
  markStudentAttendance?: Maybe<MutationMarkStudentAttendanceResult>;
  mutateAcademicYear?: Maybe<MutationMutateAcademicYearResult>;
  mutateTerm?: Maybe<MutationMutateTermResult>;
  updateAnnouncement?: Maybe<MutationUpdateAnnouncementResult>;
  updateAssignment?: Maybe<MutationUpdateAssignmentResult>;
  updateClass?: Maybe<MutationUpdateClassResult>;
  updateClub?: Maybe<MutationUpdateClubResult>;
  updateEvent?: Maybe<MutationUpdateEventResult>;
  updateExam?: Maybe<MutationUpdateExamResult>;
  updateGrade?: Maybe<MutationUpdateGradeResult>;
  updateInvoice?: Maybe<MutationUpdateInvoiceResult>;
  updateParent?: Maybe<MutationUpdateParentResult>;
  updatePeriodSlot?: Maybe<MutationUpdatePeriodSlotResult>;
  updateResult?: Maybe<MutationUpdateResultResult>;
  updateStaff?: Maybe<MutationUpdateStaffResult>;
  updateStudent?: Maybe<MutationUpdateStudentResult>;
  updateSubject?: Maybe<MutationUpdateSubjectResult>;
  updateTimetableAssignment?: Maybe<MutationUpdateTimetableAssignmentResult>;
  verifyPaymentStatus?: Maybe<MutationVerifyPaymentStatusResult>;
};


export type MutationCreateAnnouncementArgs = {
  input: AnnouncementInput;
};


export type MutationCreateAssignmentArgs = {
  input: AssignmentInput;
};


export type MutationCreateClassArgs = {
  input: ClassInput;
};


export type MutationCreateClubArgs = {
  input: ClubInput;
};


export type MutationCreateEventArgs = {
  input: EventInput;
};


export type MutationCreateExamArgs = {
  input: ExamInput;
};


export type MutationCreateGradeArgs = {
  input: GradeInput;
};


export type MutationCreateInvoiceArgs = {
  input: InvoiceInput;
};


export type MutationCreateParentArgs = {
  input: ParentInput;
};


export type MutationCreateProgramArgs = {
  input: ProgramInput;
};


export type MutationCreateResultArgs = {
  input: ResultInput;
};


export type MutationCreateSchoolArgs = {
  input: SchoolInput;
};


export type MutationCreateStaffArgs = {
  input: StaffInput;
};


export type MutationCreateStudentArgs = {
  input: StudentInput;
};


export type MutationCreateSubjectArgs = {
  input: SubjectInput;
};


export type MutationInitiateFeePaymentArgs = {
  input: FeePaymentInput;
};


export type MutationMarkStaffAttendanceArgs = {
  input: StaffAttendanceInput;
};


export type MutationMarkStudentAttendanceArgs = {
  input: StudentAttendanceInput;
};


export type MutationMutateAcademicYearArgs = {
  input: AcademicYearInput;
};


export type MutationMutateTermArgs = {
  input: TermInput;
};


export type MutationUpdateAnnouncementArgs = {
  input: AnnouncementInput;
};


export type MutationUpdateAssignmentArgs = {
  input: AssignmentInput;
};


export type MutationUpdateClassArgs = {
  input: ClassInput;
};


export type MutationUpdateClubArgs = {
  input: ClubInput;
};


export type MutationUpdateEventArgs = {
  input: EventInput;
};


export type MutationUpdateExamArgs = {
  input: ExamInput;
};


export type MutationUpdateGradeArgs = {
  input: GradeInput;
};


export type MutationUpdateInvoiceArgs = {
  input: InvoiceInput;
};


export type MutationUpdateParentArgs = {
  input: ParentInput;
};


export type MutationUpdatePeriodSlotArgs = {
  input: TimetablePeriodInput;
};


export type MutationUpdateResultArgs = {
  input: ResultInput;
};


export type MutationUpdateStaffArgs = {
  input: StaffInput;
};


export type MutationUpdateStudentArgs = {
  input: StudentInput;
};


export type MutationUpdateSubjectArgs = {
  input: SubjectInput;
};


export type MutationUpdateTimetableAssignmentArgs = {
  input: TimetableAssignmentInput;
};


export type MutationVerifyPaymentStatusArgs = {
  reference: Scalars['String']['input'];
};

export type MutationCreateAnnouncementResult = BaseAppError | BaseError | MutationCreateAnnouncementSuccess | UniqueConstraintError;

export type MutationCreateAnnouncementSuccess = {
  __typename?: 'MutationCreateAnnouncementSuccess';
  data: Announcement;
};

export type MutationCreateAssignmentResult = BaseAppError | BaseError | MutationCreateAssignmentSuccess | UniqueConstraintError;

export type MutationCreateAssignmentSuccess = {
  __typename?: 'MutationCreateAssignmentSuccess';
  data: Assignment;
};

export type MutationCreateClassResult = BaseAppError | BaseError | MutationCreateClassSuccess | UniqueConstraintError;

export type MutationCreateClassSuccess = {
  __typename?: 'MutationCreateClassSuccess';
  data: Class;
};

export type MutationCreateClubResult = BaseAppError | BaseError | MutationCreateClubSuccess | UniqueConstraintError;

export type MutationCreateClubSuccess = {
  __typename?: 'MutationCreateClubSuccess';
  data: Club;
};

export type MutationCreateEventResult = BaseAppError | BaseError | MutationCreateEventSuccess | UniqueConstraintError;

export type MutationCreateEventSuccess = {
  __typename?: 'MutationCreateEventSuccess';
  data: Event;
};

export type MutationCreateExamResult = BaseAppError | BaseError | MutationCreateExamSuccess | UniqueConstraintError;

export type MutationCreateExamSuccess = {
  __typename?: 'MutationCreateExamSuccess';
  data: Exam;
};

export type MutationCreateGradeResult = BaseAppError | BaseError | MutationCreateGradeSuccess | UniqueConstraintError;

export type MutationCreateGradeSuccess = {
  __typename?: 'MutationCreateGradeSuccess';
  data: Grade;
};

export type MutationCreateInvoiceResult = BaseAppError | BaseError | MutationCreateInvoiceSuccess | UniqueConstraintError;

export type MutationCreateInvoiceSuccess = {
  __typename?: 'MutationCreateInvoiceSuccess';
  data: Invoice;
};

export type MutationCreateParentResult = BaseAppError | BaseError | ForeignKeyError | MutationCreateParentSuccess | UniqueConstraintError;

export type MutationCreateParentSuccess = {
  __typename?: 'MutationCreateParentSuccess';
  data: Parent;
};

export type MutationCreateProgramResult = BaseAppError | BaseError | MutationCreateProgramSuccess;

export type MutationCreateProgramSuccess = {
  __typename?: 'MutationCreateProgramSuccess';
  data: Program;
};

export type MutationCreateResultResult = BaseAppError | BaseError | MutationCreateResultSuccess | UniqueConstraintError;

export type MutationCreateResultSuccess = {
  __typename?: 'MutationCreateResultSuccess';
  data: Result;
};

export type MutationCreateSchoolResult = BaseAppError | BaseError | MutationCreateSchoolSuccess | UniqueConstraintError;

export type MutationCreateSchoolSuccess = {
  __typename?: 'MutationCreateSchoolSuccess';
  data: School;
};

export type MutationCreateStaffResult = BaseAppError | BaseError | MutationCreateStaffSuccess | UniqueConstraintError;

export type MutationCreateStaffSuccess = {
  __typename?: 'MutationCreateStaffSuccess';
  data: Staff;
};

export type MutationCreateStudentResult = BaseAppError | BaseError | ForeignKeyError | MutationCreateStudentSuccess | UniqueConstraintError;

export type MutationCreateStudentSuccess = {
  __typename?: 'MutationCreateStudentSuccess';
  data: Student;
};

export type MutationCreateSubjectResult = BaseAppError | BaseError | MutationCreateSubjectSuccess | UniqueConstraintError;

export type MutationCreateSubjectSuccess = {
  __typename?: 'MutationCreateSubjectSuccess';
  data: Subject;
};

export type MutationInitiateFeePaymentResult = BaseAppError | BaseError | MutationInitiateFeePaymentSuccess;

export type MutationInitiateFeePaymentSuccess = {
  __typename?: 'MutationInitiateFeePaymentSuccess';
  data: FeePaymentResponse;
};

export type MutationMarkStaffAttendanceResult = BaseAppError | BaseError | MutationMarkStaffAttendanceSuccess;

export type MutationMarkStaffAttendanceSuccess = {
  __typename?: 'MutationMarkStaffAttendanceSuccess';
  data: StaffAttendance;
};

export type MutationMarkStudentAttendanceResult = BaseAppError | BaseError | MutationMarkStudentAttendanceSuccess;

export type MutationMarkStudentAttendanceSuccess = {
  __typename?: 'MutationMarkStudentAttendanceSuccess';
  data: Array<StudentAttendance>;
};

export type MutationMutateAcademicYearResult = BaseAppError | BaseError | MutationMutateAcademicYearSuccess | UniqueConstraintError;

export type MutationMutateAcademicYearSuccess = {
  __typename?: 'MutationMutateAcademicYearSuccess';
  data: AcademicYear;
};

export type MutationMutateTermResult = BaseAppError | BaseError | MutationMutateTermSuccess | UniqueConstraintError;

export type MutationMutateTermSuccess = {
  __typename?: 'MutationMutateTermSuccess';
  data: Term;
};

export type MutationUpdateAnnouncementResult = BaseAppError | BaseError | MutationUpdateAnnouncementSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateAnnouncementSuccess = {
  __typename?: 'MutationUpdateAnnouncementSuccess';
  data: Announcement;
};

export type MutationUpdateAssignmentResult = BaseAppError | BaseError | MutationUpdateAssignmentSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateAssignmentSuccess = {
  __typename?: 'MutationUpdateAssignmentSuccess';
  data: Assignment;
};

export type MutationUpdateClassResult = BaseAppError | BaseError | ForeignKeyError | MutationUpdateClassSuccess | UniqueConstraintError;

export type MutationUpdateClassSuccess = {
  __typename?: 'MutationUpdateClassSuccess';
  data: Class;
};

export type MutationUpdateClubResult = BaseAppError | BaseError | MutationUpdateClubSuccess | UniqueConstraintError;

export type MutationUpdateClubSuccess = {
  __typename?: 'MutationUpdateClubSuccess';
  data: Club;
};

export type MutationUpdateEventResult = BaseAppError | BaseError | MutationUpdateEventSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateEventSuccess = {
  __typename?: 'MutationUpdateEventSuccess';
  data: Event;
};

export type MutationUpdateExamResult = BaseAppError | BaseError | MutationUpdateExamSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateExamSuccess = {
  __typename?: 'MutationUpdateExamSuccess';
  data: Exam;
};

export type MutationUpdateGradeResult = BaseAppError | BaseError | MutationUpdateGradeSuccess | UniqueConstraintError;

export type MutationUpdateGradeSuccess = {
  __typename?: 'MutationUpdateGradeSuccess';
  data: Grade;
};

export type MutationUpdateInvoiceResult = BaseAppError | BaseError | MutationUpdateInvoiceSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateInvoiceSuccess = {
  __typename?: 'MutationUpdateInvoiceSuccess';
  data: Invoice;
};

export type MutationUpdateParentResult = BaseAppError | BaseError | ForeignKeyError | MutationUpdateParentSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateParentSuccess = {
  __typename?: 'MutationUpdateParentSuccess';
  data: Parent;
};

export type MutationUpdatePeriodSlotResult = BaseAppError | BaseError | MutationUpdatePeriodSlotSuccess | UniqueConstraintError;

export type MutationUpdatePeriodSlotSuccess = {
  __typename?: 'MutationUpdatePeriodSlotSuccess';
  data: TimetablePeriod;
};

export type MutationUpdateResultResult = BaseAppError | BaseError | MutationUpdateResultSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateResultSuccess = {
  __typename?: 'MutationUpdateResultSuccess';
  data: Result;
};

export type MutationUpdateStaffResult = BaseAppError | BaseError | MutationUpdateStaffSuccess | UniqueConstraintError;

export type MutationUpdateStaffSuccess = {
  __typename?: 'MutationUpdateStaffSuccess';
  data: Staff;
};

export type MutationUpdateStudentResult = BaseAppError | BaseError | ForeignKeyError | MutationUpdateStudentSuccess | NotFoundError | UniqueConstraintError;

export type MutationUpdateStudentSuccess = {
  __typename?: 'MutationUpdateStudentSuccess';
  data: Student;
};

export type MutationUpdateSubjectResult = BaseAppError | BaseError | MutationUpdateSubjectSuccess | UniqueConstraintError;

export type MutationUpdateSubjectSuccess = {
  __typename?: 'MutationUpdateSubjectSuccess';
  data: Subject;
};

export type MutationUpdateTimetableAssignmentResult = BaseAppError | BaseError | MutationUpdateTimetableAssignmentSuccess | UniqueConstraintError;

export type MutationUpdateTimetableAssignmentSuccess = {
  __typename?: 'MutationUpdateTimetableAssignmentSuccess';
  data: TimetableAssignment;
};

export type MutationVerifyPaymentStatusResult = BaseAppError | BaseError | MutationVerifyPaymentStatusSuccess;

export type MutationVerifyPaymentStatusSuccess = {
  __typename?: 'MutationVerifyPaymentStatusSuccess';
  data: InvoicePayment;
};

export type NotFoundError = AppError & Error & {
  __typename?: 'NotFoundError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Parent = {
  __typename?: 'Parent';
  address: Scalars['String']['output'];
  children: Array<ParentStudent>;
  childrenCount: Scalars['Int']['output'];
  clerkUserId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['Email']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  primaryId?: Maybe<Scalars['String']['output']>;
  surname: Scalars['String']['output'];
};

export type ParentInput = {
  address: Scalars['String']['input'];
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['Email']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  primaryId?: InputMaybe<Scalars['String']['input']>;
  surname: Scalars['String']['input'];
};

export type ParentStudent = {
  __typename?: 'ParentStudent';
  isPrimary: Scalars['Boolean']['output'];
  parent: Parent;
  relation: Scalars['String']['output'];
  student: Student;
};

export enum ParentStudentRelationship {
  Father = 'FATHER',
  Grandparent = 'GRANDPARENT',
  Guardian = 'GUARDIAN',
  Mother = 'MOTHER',
  Other = 'OTHER',
  Sibling = 'SIBLING'
}

export type PasswordPwnedError = AppError & Error & {
  __typename?: 'PasswordPwnedError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type PasswordTooShortError = AppError & Error & {
  __typename?: 'PasswordTooShortError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export enum PaymentStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED',
  Success = 'SUCCESS'
}

export type PeriodSlot = {
  __typename?: 'PeriodSlot';
  dayOfWeek: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  timetableAssignments: Array<TimetableAssignment>;
};


export type PeriodSlotTimetableAssignmentsArgs = {
  classId: Scalars['ID']['input'];
};

export type Program = {
  __typename?: 'Program';
  grades: Array<Grade>;
  id: Scalars['ID']['output'];
  name: ProgramName;
};

export type ProgramInput = {
  grades: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export enum ProgramName {
  Creche = 'CRECHE',
  Nursery = 'NURSERY',
  Primary = 'PRIMARY',
  Secondary = 'SECONDARY'
}

export type Query = {
  __typename?: 'Query';
  academicYears?: Maybe<Array<AcademicYear>>;
  announcements?: Maybe<Array<Announcement>>;
  assignments?: Maybe<Array<Assignment>>;
  class?: Maybe<Class>;
  classes?: Maybe<Array<Class>>;
  clubs?: Maybe<Array<Club>>;
  events?: Maybe<Array<Event>>;
  exams?: Maybe<Array<Exam>>;
  grade?: Maybe<Grade>;
  grades?: Maybe<Array<Grade>>;
  invoice?: Maybe<Invoice>;
  invoicePayments?: Maybe<Array<InvoicePayment>>;
  invoices?: Maybe<Array<Invoice>>;
  parent?: Maybe<Parent>;
  parents?: Maybe<Array<Parent>>;
  programs?: Maybe<Array<Program>>;
  results?: Maybe<Array<Result>>;
  school?: Maybe<School>;
  schools?: Maybe<Array<School>>;
  staff?: Maybe<Staff>;
  staffs?: Maybe<Array<Staff>>;
  student?: Maybe<Student>;
  studentAttendances?: Maybe<Array<StudentAttendance>>;
  students?: Maybe<Array<Student>>;
  subjects?: Maybe<Array<Subject>>;
  terms?: Maybe<Array<Term>>;
  timetable?: Maybe<Array<TimetablePeriod>>;
};


export type QueryAnnouncementsArgs = {
  filter: AnnouncementFilter;
};


export type QueryAssignmentsArgs = {
  filter?: InputMaybe<AssignmentFilter>;
};


export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassesArgs = {
  filter?: InputMaybe<ClassFilterInput>;
};


export type QueryClubsArgs = {
  filter?: InputMaybe<ClubFilter>;
};


export type QueryEventsArgs = {
  filter: EventFilter;
};


export type QueryExamsArgs = {
  filter?: InputMaybe<ExamFilter>;
};


export type QueryGradeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGradesArgs = {
  filter?: InputMaybe<GradeFilterInput>;
};


export type QueryInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvoicePaymentsArgs = {
  filter: InvoicePaymentFilter;
};


export type QueryInvoicesArgs = {
  filter?: InputMaybe<InvoiceFilter>;
};


export type QueryParentArgs = {
  clerkUserId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryParentsArgs = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryResultsArgs = {
  filter: ResultFilter;
  termId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySchoolArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStaffArgs = {
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryStaffsArgs = {
  filter?: InputMaybe<StaffFilterInput>;
};


export type QueryStudentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStudentAttendancesArgs = {
  filter: AttendanceFilter;
};


export type QueryStudentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<StudentFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubjectsArgs = {
  teacherId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTermsArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTimetableArgs = {
  classId: Scalars['ID']['input'];
};

export type RateLimitError = AppError & Error & {
  __typename?: 'RateLimitError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Result = {
  __typename?: 'Result';
  assignment?: Maybe<Assignment>;
  exam?: Maybe<Exam>;
  grade?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
  student: Student;
  uploadedAt: Scalars['DateTime']['output'];
};


export type ResultAssignmentArgs = {
  termId?: InputMaybe<Scalars['ID']['input']>;
};


export type ResultExamArgs = {
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type ResultFilter = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
  testId?: InputMaybe<Scalars['ID']['input']>;
};

export type ResultInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  score: Scalars['Int']['input'];
  studentId: Scalars['ID']['input'];
  testId: Scalars['ID']['input'];
  type: ResultType;
};

export enum ResultType {
  Assignment = 'ASSIGNMENT',
  Exam = 'EXAM'
}

export type School = {
  __typename?: 'School';
  activeStaffCount: Scalars['Int']['output'];
  activeStudentsCount: Scalars['Int']['output'];
  announcementsCount: Scalars['Int']['output'];
  classes?: Maybe<Array<Class>>;
  currentTerm?: Maybe<Array<Term>>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  motto?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  programs?: Maybe<Array<Program>>;
  slug: Scalars['String']['output'];
  studentAttendances?: Maybe<Array<StudentAttendance>>;
  studentSexDistribution: Array<StudentSexCount>;
};


export type SchoolAnnouncementsCountArgs = {
  rangeFrom: Scalars['DateTime']['input'];
};


export type SchoolStudentAttendancesArgs = {
  attendanceFilter: AttendanceFilter;
};

export type SchoolGradeInput = {
  gradeName: Scalars['String']['input'];
  programName: Scalars['String']['input'];
};

export type SchoolInput = {
  address: Scalars['String']['input'];
  email: Scalars['String']['input'];
  grades: Array<SchoolGradeInput>;
  logo?: InputMaybe<Scalars['String']['input']>;
  manager: ManagerInput;
  motto?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  programs: Array<ProgramName>;
  slug: Scalars['String']['input'];
};

export type ServerBusyError = AppError & Error & {
  __typename?: 'ServerBusyError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export enum Sex {
  Female = 'FEMALE',
  Male = 'MALE'
}

export type Staff = {
  __typename?: 'Staff';
  accessLevel: Scalars['String']['output'];
  address: Scalars['String']['output'];
  attendances: Array<StaffAttendance>;
  class?: Maybe<Class>;
  clerkUserId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['Email']['output']>;
  employeeId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  img?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  role: Scalars['String']['output'];
  sex: Sex;
  subjects?: Maybe<Array<TeacherSubjectAssignment>>;
  surname: Scalars['String']['output'];
};


export type StaffAttendancesArgs = {
  attendanceFilter: AttendanceFilter;
};

export type StaffAttendance = {
  __typename?: 'StaffAttendance';
  clockInTime?: Maybe<Scalars['DateTime']['output']>;
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  reasonForAbsence?: Maybe<Scalars['String']['output']>;
  staffId: Scalars['ID']['output'];
  term: Term;
};

export type StaffAttendanceInput = {
  clockInTime?: InputMaybe<Scalars['DateTime']['input']>;
  date: Scalars['DateTime']['input'];
  reasonForAbsence?: InputMaybe<Scalars['String']['input']>;
  staffId: Scalars['ID']['input'];
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type StaffFilterInput = {
  accessLevel?: InputMaybe<AccessLevel>;
  classId?: InputMaybe<Scalars['String']['input']>;
  isActive: Scalars['Boolean']['input'];
  isFormTeacher?: InputMaybe<Scalars['Boolean']['input']>;
};

export type StaffInput = {
  accessLevel: AccessLevel;
  address: Scalars['String']['input'];
  assignments?: InputMaybe<SubjectGradesInput>;
  birthday: Scalars['DateTime']['input'];
  classId?: InputMaybe<Scalars['String']['input']>;
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
  contractType: ContractType;
  email?: InputMaybe<Scalars['Email']['input']>;
  employeeId: Scalars['String']['input'];
  hireDate?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  img?: InputMaybe<Scalars['String']['input']>;
  isActive?: Scalars['Boolean']['input'];
  isFormTeacher?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  oldImg?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  role: Scalars['String']['input'];
  sex: Sex;
  surname: Scalars['String']['input'];
};

export type Student = {
  __typename?: 'Student';
  activeState: Scalars['String']['output'];
  address: Scalars['String']['output'];
  admissionDate?: Maybe<Scalars['DateTime']['output']>;
  attendances?: Maybe<Array<StudentAttendance>>;
  birthday: Scalars['DateTime']['output'];
  class: Class;
  club?: Maybe<Club>;
  guardians?: Maybe<Array<ParentStudent>>;
  id: Scalars['ID']['output'];
  img?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  registrationNumber: Scalars['String']['output'];
  sex: Sex;
  surname: Scalars['String']['output'];
};


export type StudentAttendancesArgs = {
  attendanceFilter: AttendanceFilter;
};

export type StudentAttendance = {
  __typename?: 'StudentAttendance';
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  present: Scalars['Boolean']['output'];
  studentId: Scalars['ID']['output'];
  term: Term;
  updatedAt: Scalars['DateTime']['output'];
};

export type StudentAttendanceInput = {
  classId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
  records: Array<AttendanceRecords>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type StudentFilter = {
  grades?: InputMaybe<Array<Scalars['ID']['input']>>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

export type StudentInput = {
  address: Scalars['String']['input'];
  birthday: Scalars['DateTime']['input'];
  classId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  img?: InputMaybe<Scalars['String']['input']>;
  medicalCondition?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  oldImg?: InputMaybe<Scalars['String']['input']>;
  primaryGuardian: GuardianInput;
  registrationNumber: Scalars['String']['input'];
  secondaryGuardian?: InputMaybe<GuardianInput>;
  sex: Sex;
  surname: Scalars['String']['input'];
};

export type StudentSexCount = {
  __typename?: 'StudentSexCount';
  _count?: Maybe<Scalars['Int']['output']>;
  sex?: Maybe<Sex>;
};

export type Subject = {
  __typename?: 'Subject';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  teachers: Array<TeacherSubjectAssignment>;
};

export type SubjectGradesInput = {
  gradeIds: Array<Scalars['String']['input']>;
  subjectId: Scalars['String']['input'];
};

export type SubjectInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  teachers: Array<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  announcementCreated: Announcement;
  announcementUpdated: Announcement;
};

export type TeacherSubjectAssignment = {
  __typename?: 'TeacherSubjectAssignment';
  id: Scalars['ID']['output'];
  subject: Subject;
  teacher: Staff;
};

export type Term = {
  __typename?: 'Term';
  academicYear: AcademicYear;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  startDate: Scalars['DateTime']['output'];
  term: Scalars['Int']['output'];
};

export type TermInput = {
  academicYearId: Scalars['ID']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isCurrent: Scalars['Boolean']['input'];
  startDate: Scalars['DateTime']['input'];
  term: Scalars['String']['input'];
};

export type TimetableAssignment = {
  __typename?: 'TimetableAssignment';
  class: Class;
  id: Scalars['ID']['output'];
  periodSlot: PeriodSlot;
  subject?: Maybe<Subject>;
  teacher?: Maybe<Staff>;
};

export type TimetableAssignmentInput = {
  classId: Scalars['ID']['input'];
  periodSlotId: Scalars['ID']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  teacherId?: InputMaybe<Scalars['ID']['input']>;
};

export type TimetablePeriod = {
  __typename?: 'TimetablePeriod';
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  periodSlots: Array<PeriodSlot>;
  startTime: Scalars['String']['output'];
};

export type TimetablePeriodInput = {
  daysOfWeek: Array<Scalars['String']['input']>;
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

export type UniqueConstraintError = AppError & Error & {
  __typename?: 'UniqueConstraintError';
  code?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type CreateAnnouncementMutationVariables = Exact<{
  input: AnnouncementInput;
}>;


export type CreateAnnouncementMutation = { __typename?: 'Mutation', createAnnouncement?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateAnnouncementSuccess', data: { __typename?: 'Announcement', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateAnnouncementMutationVariables = Exact<{
  input: AnnouncementInput;
}>;


export type UpdateAnnouncementMutation = { __typename?: 'Mutation', updateAnnouncement?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateAnnouncementSuccess', data: { __typename?: 'Announcement', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type AnnouncementSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AnnouncementSubscription = { __typename?: 'Subscription', announcementCreated: { __typename?: 'Announcement', id: string, title: string, content: string } };

export type GetAssignmentsQueryVariables = Exact<{
  filter: AssignmentFilter;
}>;


export type GetAssignmentsQuery = { __typename?: 'Query', assignments?: Array<{ __typename?: 'Assignment', id: string, maxScore: number, subject: { __typename?: 'Subject', name: string } }> | null };

export type CreateAssignmentMutationVariables = Exact<{
  input: AssignmentInput;
}>;


export type CreateAssignmentMutation = { __typename?: 'Mutation', createAssignment?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateAssignmentSuccess', data: { __typename?: 'Assignment', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateAssignmentMutationVariables = Exact<{
  input: AssignmentInput;
}>;


export type UpdateAssignmentMutation = { __typename?: 'Mutation', updateAssignment?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateAssignmentSuccess', data: { __typename?: 'Assignment', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type MarkStudentAttendanceMutationVariables = Exact<{
  input: StudentAttendanceInput;
}>;


export type MarkStudentAttendanceMutation = { __typename?: 'Mutation', markStudentAttendance?:
    | { __typename: 'BaseAppError', message?: string | null, code?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationMarkStudentAttendanceSuccess', data: Array<{ __typename?: 'StudentAttendance', id: string }> }
   | null };

export type MarkStaffAttendanceMutationVariables = Exact<{
  input: StaffAttendanceInput;
}>;


export type MarkStaffAttendanceMutation = { __typename?: 'Mutation', markStaffAttendance?:
    | { __typename: 'BaseAppError', message?: string | null, code?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationMarkStaffAttendanceSuccess', data: { __typename?: 'StaffAttendance', id: string } }
   | null };

export type GetClassesQueryVariables = Exact<{
  filter?: InputMaybe<ClassFilterInput>;
}>;


export type GetClassesQuery = { __typename?: 'Query', classes?: Array<{ __typename?: 'Class', id: string, name: string }> | null };

export type CreateClassMutationVariables = Exact<{
  input: ClassInput;
}>;


export type CreateClassMutation = { __typename?: 'Mutation', createClass?:
    | { __typename: 'BaseAppError' }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateClassSuccess', data: { __typename?: 'Class', id: string, name: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateClassMutationVariables = Exact<{
  input: ClassInput;
}>;


export type UpdateClassMutation = { __typename?: 'Mutation', updateClass?:
    | { __typename: 'BaseAppError', message?: string | null, code?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'ForeignKeyError', message?: string | null, code?: string | null }
    | { __typename: 'MutationUpdateClassSuccess', data: { __typename?: 'Class', id: string, name: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null, code?: string | null }
   | null };

export type CreateClubMutationVariables = Exact<{
  input: ClubInput;
}>;


export type CreateClubMutation = { __typename?: 'Mutation', createClub?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateClubSuccess', data: { __typename?: 'Club', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateClubMutationVariables = Exact<{
  input: ClubInput;
}>;


export type UpdateClubMutation = { __typename?: 'Mutation', updateClub?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateClubSuccess', data: { __typename?: 'Club', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetExamsQueryVariables = Exact<{
  filter: ExamFilter;
}>;


export type GetExamsQuery = { __typename?: 'Query', exams?: Array<{ __typename?: 'Exam', id: string, maxScore: number, subject: { __typename?: 'Subject', name: string } }> | null };

export type CreateExamMutationVariables = Exact<{
  input: ExamInput;
}>;


export type CreateExamMutation = { __typename?: 'Mutation', createExam?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateExamSuccess', data: { __typename?: 'Exam', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateExamMutationVariables = Exact<{
  input: ExamInput;
}>;


export type UpdateExamMutation = { __typename?: 'Mutation', updateExam?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateExamSuccess', data: { __typename?: 'Exam', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateSchoolMutationVariables = Exact<{
  input: SchoolInput;
}>;


export type CreateSchoolMutation = { __typename?: 'Mutation', createSchool?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateSchoolSuccess', data: { __typename?: 'School', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateProgramMutationVariables = Exact<{
  input: ProgramInput;
}>;


export type CreateProgramMutation = { __typename?: 'Mutation', createProgram?:
    | { __typename: 'BaseAppError', message?: string | null, code?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateProgramSuccess', data: { __typename?: 'Program', id: string } }
   | null };

export type CreateSubjectMutationVariables = Exact<{
  input: SubjectInput;
}>;


export type CreateSubjectMutation = { __typename?: 'Mutation', createSubject?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateSubjectSuccess', data: { __typename?: 'Subject', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateSubjectMutationVariables = Exact<{
  input: SubjectInput;
}>;


export type UpdateSubjectMutation = { __typename?: 'Mutation', updateSubject?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateSubjectSuccess', data: { __typename?: 'Subject', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateGradeMutationVariables = Exact<{
  input: GradeInput;
}>;


export type CreateGradeMutation = { __typename?: 'Mutation', createGrade?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateGradeSuccess', data: { __typename?: 'Grade', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateGradeMutationVariables = Exact<{
  input: GradeInput;
}>;


export type UpdateGradeMutation = { __typename?: 'Mutation', updateGrade?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateGradeSuccess', data: { __typename?: 'Grade', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateTimetableAssignmentMutationVariables = Exact<{
  input: TimetableAssignmentInput;
}>;


export type UpdateTimetableAssignmentMutation = { __typename?: 'Mutation', updateTimetableAssignment?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateTimetableAssignmentSuccess', data: { __typename?: 'TimetableAssignment', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type AssignTimetablePeriodMutationVariables = Exact<{
  input: TimetablePeriodInput;
}>;


export type AssignTimetablePeriodMutation = { __typename?: 'Mutation', updatePeriodSlot?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdatePeriodSlotSuccess', data: { __typename?: 'TimetablePeriod', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateEventMutationVariables = Exact<{
  input: EventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateEventSuccess', data: { __typename?: 'Event', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateEventMutationVariables = Exact<{
  input: EventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateEventSuccess', data: { __typename?: 'Event', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateAcademicYearMutationVariables = Exact<{
  input: AcademicYearInput;
}>;


export type CreateAcademicYearMutation = { __typename?: 'Mutation', mutateAcademicYear?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationMutateAcademicYearSuccess', data: { __typename?: 'AcademicYear', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type CreateTermMutationVariables = Exact<{
  input: TermInput;
}>;


export type CreateTermMutation = { __typename?: 'Mutation', mutateTerm?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationMutateTermSuccess', data: { __typename?: 'Term', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetParentsQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetParentsQuery = { __typename?: 'Query', parents?: Array<{ __typename?: 'Parent', id: string, name: string, surname: string }> | null };

export type CreateParentMutationVariables = Exact<{
  input: ParentInput;
}>;


export type CreateParentMutation = { __typename?: 'Mutation', createParent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'ForeignKeyError', message?: string | null }
    | { __typename: 'MutationCreateParentSuccess', data: { __typename?: 'Parent', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateParentMutationVariables = Exact<{
  input: ParentInput;
}>;


export type UpdateParentMutation = { __typename?: 'Mutation', updateParent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'ForeignKeyError', message?: string | null }
    | { __typename: 'MutationUpdateParentSuccess', data: { __typename?: 'Parent', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetSchoolQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSchoolQuery = { __typename?: 'Query', school?: { __typename?: 'School', slug: string } | null };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { __typename?: 'Query', programs?: Array<{ __typename?: 'Program', id: string, name: ProgramName }> | null };

export type GetGradesQueryVariables = Exact<{
  where?: InputMaybe<GradeFilterInput>;
}>;


export type GetGradesQuery = { __typename?: 'Query', grades?: Array<{ __typename?: 'Grade', id: string, name: string }> | null };

export type GetSubjectsQueryVariables = Exact<{
  teacherId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetSubjectsQuery = { __typename?: 'Query', subjects?: Array<{ __typename?: 'Subject', id: string, name: string }> | null };

export type GetAcademicYearsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAcademicYearsQuery = { __typename?: 'Query', academicYears?: Array<{ __typename?: 'AcademicYear', id: string, year: string, isCurrent: boolean, terms: Array<{ __typename?: 'Term', term: number }> }> | null };

export type GetTermsQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTermsQuery = { __typename?: 'Query', terms?: Array<{ __typename?: 'Term', id: string, term: number, isCurrent: boolean, academicYear: { __typename?: 'AcademicYear', year: string } }> | null };

export type CreateResultMutationVariables = Exact<{
  input: ResultInput;
}>;


export type CreateResultMutation = { __typename?: 'Mutation', createResult?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateResultSuccess', data: { __typename?: 'Result', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateResultMutationVariables = Exact<{
  input: ResultInput;
}>;


export type UpdateResultMutation = { __typename?: 'Mutation', updateResult?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateResultSuccess', data: { __typename?: 'Result', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetStaffsQueryVariables = Exact<{
  filter: StaffFilterInput;
}>;


export type GetStaffsQuery = { __typename?: 'Query', staffs?: Array<{ __typename?: 'Staff', id: string, name: string, surname: string }> | null };

export type CreateStaffMutationVariables = Exact<{
  input: StaffInput;
}>;


export type CreateStaffMutation = { __typename?: 'Mutation', createStaff?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateStaffSuccess', data: { __typename?: 'Staff', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateStaffMutationVariables = Exact<{
  input: StaffInput;
}>;


export type UpdateStaffMutation = { __typename?: 'Mutation', updateStaff?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateStaffSuccess', data: { __typename?: 'Staff', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetStudentsQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<StudentFilter>;
}>;


export type GetStudentsQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', id: string, name: string, surname: string }> | null };

export type CreateStudentMutationVariables = Exact<{
  input: StudentInput;
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'ForeignKeyError', message?: string | null }
    | { __typename: 'MutationCreateStudentSuccess', data: { __typename?: 'Student', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateStudentMutationVariables = Exact<{
  input: StudentInput;
}>;


export type UpdateStudentMutation = { __typename?: 'Mutation', updateStudent?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'ForeignKeyError', message?: string | null }
    | { __typename: 'MutationUpdateStudentSuccess', data: { __typename?: 'Student', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type GetInvoicesQueryVariables = Exact<{
  filter?: InputMaybe<InvoiceFilter>;
}>;


export type GetInvoicesQuery = { __typename?: 'Query', invoices?: Array<{ __typename?: 'Invoice', id: string, number: string, title: string, amount: number, grades: Array<{ __typename?: 'Grade', id: string }> }> | null };

export type CreateInvoiceMutationVariables = Exact<{
  input: InvoiceInput;
}>;


export type CreateInvoiceMutation = { __typename?: 'Mutation', createInvoice?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationCreateInvoiceSuccess', data: { __typename?: 'Invoice', id: string } }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type UpdateInvoiceMutationVariables = Exact<{
  input: InvoiceInput;
}>;


export type UpdateInvoiceMutation = { __typename?: 'Mutation', updateInvoice?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationUpdateInvoiceSuccess', data: { __typename?: 'Invoice', id: string } }
    | { __typename: 'NotFoundError', message?: string | null }
    | { __typename: 'UniqueConstraintError', message?: string | null }
   | null };

export type InitializeFeePaymentMutationVariables = Exact<{
  input: FeePaymentInput;
}>;


export type InitializeFeePaymentMutation = { __typename?: 'Mutation', initiateFeePayment?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationInitiateFeePaymentSuccess', data: { __typename?: 'FeePaymentResponse', authorization_url: string, access_code: string, reference: string } }
   | null };

export type VerifyPaymentStatusMutationVariables = Exact<{
  reference: Scalars['String']['input'];
}>;


export type VerifyPaymentStatusMutation = { __typename?: 'Mutation', verifyPaymentStatus?:
    | { __typename: 'BaseAppError', message?: string | null }
    | { __typename: 'BaseError' }
    | { __typename: 'MutationVerifyPaymentStatusSuccess', data: { __typename?: 'InvoicePayment', id: string, reference: string, amountPaid: number, payerEmail?: string | null, paidAt?: any | null, students: Array<{ __typename?: 'Student', id: string, name: string, surname: string }> } }
   | null };


export const CreateAnnouncementDocument = gql`
    mutation CreateAnnouncement($input: AnnouncementInput!) {
  createAnnouncement(input: $input) {
    __typename
    ... on MutationCreateAnnouncementSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateAnnouncementMutation() {
  return Urql.useMutation<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>(CreateAnnouncementDocument);
};
export const UpdateAnnouncementDocument = gql`
    mutation UpdateAnnouncement($input: AnnouncementInput!) {
  updateAnnouncement(input: $input) {
    __typename
    ... on MutationUpdateAnnouncementSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateAnnouncementMutation() {
  return Urql.useMutation<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>(UpdateAnnouncementDocument);
};
export const AnnouncementDocument = gql`
    subscription Announcement {
  announcementCreated {
    id
    title
    content
  }
}
    `;

export function useAnnouncementSubscription<TData = AnnouncementSubscription>(options?: Omit<Urql.UseSubscriptionArgs<AnnouncementSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<AnnouncementSubscription, TData>) {
  return Urql.useSubscription<AnnouncementSubscription, TData, AnnouncementSubscriptionVariables>({ query: AnnouncementDocument, ...options }, handler);
};
export const GetAssignmentsDocument = gql`
    query GetAssignments($filter: AssignmentFilter!) {
  assignments(filter: $filter) {
    id
    maxScore
    subject {
      name
    }
  }
}
    `;

export function useGetAssignmentsQuery(options: Omit<Urql.UseQueryArgs<GetAssignmentsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetAssignmentsQuery, GetAssignmentsQueryVariables>({ query: GetAssignmentsDocument, ...options });
};
export const CreateAssignmentDocument = gql`
    mutation CreateAssignment($input: AssignmentInput!) {
  createAssignment(input: $input) {
    __typename
    ... on MutationCreateAssignmentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateAssignmentMutation() {
  return Urql.useMutation<CreateAssignmentMutation, CreateAssignmentMutationVariables>(CreateAssignmentDocument);
};
export const UpdateAssignmentDocument = gql`
    mutation UpdateAssignment($input: AssignmentInput!) {
  updateAssignment(input: $input) {
    __typename
    ... on MutationUpdateAssignmentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateAssignmentMutation() {
  return Urql.useMutation<UpdateAssignmentMutation, UpdateAssignmentMutationVariables>(UpdateAssignmentDocument);
};
export const MarkStudentAttendanceDocument = gql`
    mutation MarkStudentAttendance($input: StudentAttendanceInput!) {
  markStudentAttendance(input: $input) {
    __typename
    ... on MutationMarkStudentAttendanceSuccess {
      data {
        id
      }
    }
    ... on AppError {
      message
      code
    }
  }
}
    `;

export function useMarkStudentAttendanceMutation() {
  return Urql.useMutation<MarkStudentAttendanceMutation, MarkStudentAttendanceMutationVariables>(MarkStudentAttendanceDocument);
};
export const MarkStaffAttendanceDocument = gql`
    mutation MarkStaffAttendance($input: StaffAttendanceInput!) {
  markStaffAttendance(input: $input) {
    __typename
    ... on MutationMarkStaffAttendanceSuccess {
      data {
        id
      }
    }
    ... on AppError {
      message
      code
    }
  }
}
    `;

export function useMarkStaffAttendanceMutation() {
  return Urql.useMutation<MarkStaffAttendanceMutation, MarkStaffAttendanceMutationVariables>(MarkStaffAttendanceDocument);
};
export const GetClassesDocument = gql`
    query GetClasses($filter: ClassFilterInput) {
  classes(filter: $filter) {
    id
    name
  }
}
    `;

export function useGetClassesQuery(options?: Omit<Urql.UseQueryArgs<GetClassesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetClassesQuery, GetClassesQueryVariables>({ query: GetClassesDocument, ...options });
};
export const CreateClassDocument = gql`
    mutation CreateClass($input: ClassInput!) {
  createClass(input: $input) {
    __typename
    ... on MutationCreateClassSuccess {
      data {
        id
        name
      }
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useCreateClassMutation() {
  return Urql.useMutation<CreateClassMutation, CreateClassMutationVariables>(CreateClassDocument);
};
export const UpdateClassDocument = gql`
    mutation UpdateClass($input: ClassInput!) {
  updateClass(input: $input) {
    __typename
    ... on MutationUpdateClassSuccess {
      data {
        id
        name
      }
    }
    ... on AppError {
      __typename
      message
      code
    }
  }
}
    `;

export function useUpdateClassMutation() {
  return Urql.useMutation<UpdateClassMutation, UpdateClassMutationVariables>(UpdateClassDocument);
};
export const CreateClubDocument = gql`
    mutation CreateClub($input: ClubInput!) {
  createClub(input: $input) {
    __typename
    ... on MutationCreateClubSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateClubMutation() {
  return Urql.useMutation<CreateClubMutation, CreateClubMutationVariables>(CreateClubDocument);
};
export const UpdateClubDocument = gql`
    mutation UpdateClub($input: ClubInput!) {
  updateClub(input: $input) {
    __typename
    ... on MutationUpdateClubSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateClubMutation() {
  return Urql.useMutation<UpdateClubMutation, UpdateClubMutationVariables>(UpdateClubDocument);
};
export const GetExamsDocument = gql`
    query GetExams($filter: ExamFilter!) {
  exams(filter: $filter) {
    id
    maxScore
    subject {
      name
    }
  }
}
    `;

export function useGetExamsQuery(options: Omit<Urql.UseQueryArgs<GetExamsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetExamsQuery, GetExamsQueryVariables>({ query: GetExamsDocument, ...options });
};
export const CreateExamDocument = gql`
    mutation CreateExam($input: ExamInput!) {
  createExam(input: $input) {
    __typename
    ... on MutationCreateExamSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateExamMutation() {
  return Urql.useMutation<CreateExamMutation, CreateExamMutationVariables>(CreateExamDocument);
};
export const UpdateExamDocument = gql`
    mutation UpdateExam($input: ExamInput!) {
  updateExam(input: $input) {
    __typename
    ... on MutationUpdateExamSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateExamMutation() {
  return Urql.useMutation<UpdateExamMutation, UpdateExamMutationVariables>(UpdateExamDocument);
};
export const CreateSchoolDocument = gql`
    mutation CreateSchool($input: SchoolInput!) {
  createSchool(input: $input) {
    __typename
    ... on UniqueConstraintError {
      __typename
      message
    }
    ... on MutationCreateSchoolSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateSchoolMutation() {
  return Urql.useMutation<CreateSchoolMutation, CreateSchoolMutationVariables>(CreateSchoolDocument);
};
export const CreateProgramDocument = gql`
    mutation CreateProgram($input: ProgramInput!) {
  createProgram(input: $input) {
    __typename
    ... on MutationCreateProgramSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
      code
    }
  }
}
    `;

export function useCreateProgramMutation() {
  return Urql.useMutation<CreateProgramMutation, CreateProgramMutationVariables>(CreateProgramDocument);
};
export const CreateSubjectDocument = gql`
    mutation CreateSubject($input: SubjectInput!) {
  createSubject(input: $input) {
    __typename
    ... on MutationCreateSubjectSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useCreateSubjectMutation() {
  return Urql.useMutation<CreateSubjectMutation, CreateSubjectMutationVariables>(CreateSubjectDocument);
};
export const UpdateSubjectDocument = gql`
    mutation UpdateSubject($input: SubjectInput!) {
  updateSubject(input: $input) {
    __typename
    ... on MutationUpdateSubjectSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateSubjectMutation() {
  return Urql.useMutation<UpdateSubjectMutation, UpdateSubjectMutationVariables>(UpdateSubjectDocument);
};
export const CreateGradeDocument = gql`
    mutation CreateGrade($input: GradeInput!) {
  createGrade(input: $input) {
    __typename
    ... on MutationCreateGradeSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useCreateGradeMutation() {
  return Urql.useMutation<CreateGradeMutation, CreateGradeMutationVariables>(CreateGradeDocument);
};
export const UpdateGradeDocument = gql`
    mutation UpdateGrade($input: GradeInput!) {
  updateGrade(input: $input) {
    __typename
    ... on MutationUpdateGradeSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateGradeMutation() {
  return Urql.useMutation<UpdateGradeMutation, UpdateGradeMutationVariables>(UpdateGradeDocument);
};
export const UpdateTimetableAssignmentDocument = gql`
    mutation UpdateTimetableAssignment($input: TimetableAssignmentInput!) {
  updateTimetableAssignment(input: $input) {
    __typename
    ... on MutationUpdateTimetableAssignmentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateTimetableAssignmentMutation() {
  return Urql.useMutation<UpdateTimetableAssignmentMutation, UpdateTimetableAssignmentMutationVariables>(UpdateTimetableAssignmentDocument);
};
export const AssignTimetablePeriodDocument = gql`
    mutation AssignTimetablePeriod($input: TimetablePeriodInput!) {
  updatePeriodSlot(input: $input) {
    __typename
    ... on MutationUpdatePeriodSlotSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useAssignTimetablePeriodMutation() {
  return Urql.useMutation<AssignTimetablePeriodMutation, AssignTimetablePeriodMutationVariables>(AssignTimetablePeriodDocument);
};
export const CreateEventDocument = gql`
    mutation CreateEvent($input: EventInput!) {
  createEvent(input: $input) {
    __typename
    ... on MutationCreateEventSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateEventMutation() {
  return Urql.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument);
};
export const UpdateEventDocument = gql`
    mutation UpdateEvent($input: EventInput!) {
  updateEvent(input: $input) {
    __typename
    ... on MutationUpdateEventSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateEventMutation() {
  return Urql.useMutation<UpdateEventMutation, UpdateEventMutationVariables>(UpdateEventDocument);
};
export const CreateAcademicYearDocument = gql`
    mutation CreateAcademicYear($input: AcademicYearInput!) {
  mutateAcademicYear(input: $input) {
    __typename
    ... on MutationMutateAcademicYearSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateAcademicYearMutation() {
  return Urql.useMutation<CreateAcademicYearMutation, CreateAcademicYearMutationVariables>(CreateAcademicYearDocument);
};
export const CreateTermDocument = gql`
    mutation CreateTerm($input: TermInput!) {
  mutateTerm(input: $input) {
    __typename
    ... on MutationMutateTermSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateTermMutation() {
  return Urql.useMutation<CreateTermMutation, CreateTermMutationVariables>(CreateTermDocument);
};
export const GetParentsDocument = gql`
    query GetParents($searchTerm: String) {
  parents(searchTerm: $searchTerm) {
    id
    name
    surname
  }
}
    `;

export function useGetParentsQuery(options?: Omit<Urql.UseQueryArgs<GetParentsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetParentsQuery, GetParentsQueryVariables>({ query: GetParentsDocument, ...options });
};
export const CreateParentDocument = gql`
    mutation CreateParent($input: ParentInput!) {
  createParent(input: $input) {
    __typename
    ... on MutationCreateParentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useCreateParentMutation() {
  return Urql.useMutation<CreateParentMutation, CreateParentMutationVariables>(CreateParentDocument);
};
export const UpdateParentDocument = gql`
    mutation UpdateParent($input: ParentInput!) {
  updateParent(input: $input) {
    __typename
    ... on MutationUpdateParentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateParentMutation() {
  return Urql.useMutation<UpdateParentMutation, UpdateParentMutationVariables>(UpdateParentDocument);
};
export const GetSchoolDocument = gql`
    query GetSchool($id: ID!) {
  school(id: $id) {
    slug
  }
}
    `;

export function useGetSchoolQuery(options: Omit<Urql.UseQueryArgs<GetSchoolQueryVariables>, 'query'>) {
  return Urql.useQuery<GetSchoolQuery, GetSchoolQueryVariables>({ query: GetSchoolDocument, ...options });
};
export const GetProgramsDocument = gql`
    query GetPrograms {
  programs {
    id
    name
  }
}
    `;

export function useGetProgramsQuery(options?: Omit<Urql.UseQueryArgs<GetProgramsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetProgramsQuery, GetProgramsQueryVariables>({ query: GetProgramsDocument, ...options });
};
export const GetGradesDocument = gql`
    query GetGrades($where: GradeFilterInput) {
  grades(filter: $where) {
    id
    name
  }
}
    `;

export function useGetGradesQuery(options?: Omit<Urql.UseQueryArgs<GetGradesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetGradesQuery, GetGradesQueryVariables>({ query: GetGradesDocument, ...options });
};
export const GetSubjectsDocument = gql`
    query GetSubjects($teacherId: ID) {
  subjects(teacherId: $teacherId) {
    id
    name
  }
}
    `;

export function useGetSubjectsQuery(options?: Omit<Urql.UseQueryArgs<GetSubjectsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetSubjectsQuery, GetSubjectsQueryVariables>({ query: GetSubjectsDocument, ...options });
};
export const GetAcademicYearsDocument = gql`
    query GetAcademicYears {
  academicYears {
    id
    year
    isCurrent
    terms {
      term
    }
  }
}
    `;

export function useGetAcademicYearsQuery(options?: Omit<Urql.UseQueryArgs<GetAcademicYearsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetAcademicYearsQuery, GetAcademicYearsQueryVariables>({ query: GetAcademicYearsDocument, ...options });
};
export const GetTermsDocument = gql`
    query GetTerms($take: Int) {
  terms(take: $take) {
    id
    term
    isCurrent
    academicYear {
      year
    }
  }
}
    `;

export function useGetTermsQuery(options?: Omit<Urql.UseQueryArgs<GetTermsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetTermsQuery, GetTermsQueryVariables>({ query: GetTermsDocument, ...options });
};
export const CreateResultDocument = gql`
    mutation CreateResult($input: ResultInput!) {
  createResult(input: $input) {
    __typename
    ... on MutationCreateResultSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateResultMutation() {
  return Urql.useMutation<CreateResultMutation, CreateResultMutationVariables>(CreateResultDocument);
};
export const UpdateResultDocument = gql`
    mutation UpdateResult($input: ResultInput!) {
  updateResult(input: $input) {
    __typename
    ... on MutationUpdateResultSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateResultMutation() {
  return Urql.useMutation<UpdateResultMutation, UpdateResultMutationVariables>(UpdateResultDocument);
};
export const GetStaffsDocument = gql`
    query GetStaffs($filter: StaffFilterInput!) {
  staffs(filter: $filter) {
    id
    name
    surname
  }
}
    `;

export function useGetStaffsQuery(options: Omit<Urql.UseQueryArgs<GetStaffsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetStaffsQuery, GetStaffsQueryVariables>({ query: GetStaffsDocument, ...options });
};
export const CreateStaffDocument = gql`
    mutation CreateStaff($input: StaffInput!) {
  createStaff(input: $input) {
    __typename
    ... on MutationCreateStaffSuccess {
      data {
        id
      }
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateStaffMutation() {
  return Urql.useMutation<CreateStaffMutation, CreateStaffMutationVariables>(CreateStaffDocument);
};
export const UpdateStaffDocument = gql`
    mutation UpdateStaff($input: StaffInput!) {
  updateStaff(input: $input) {
    __typename
    ... on MutationUpdateStaffSuccess {
      data {
        id
      }
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateStaffMutation() {
  return Urql.useMutation<UpdateStaffMutation, UpdateStaffMutationVariables>(UpdateStaffDocument);
};
export const GetStudentsDocument = gql`
    query GetStudents($searchTerm: String, $filter: StudentFilter) {
  students(searchTerm: $searchTerm, filter: $filter) {
    id
    name
    surname
  }
}
    `;

export function useGetStudentsQuery(options?: Omit<Urql.UseQueryArgs<GetStudentsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetStudentsQuery, GetStudentsQueryVariables>({ query: GetStudentsDocument, ...options });
};
export const CreateStudentDocument = gql`
    mutation CreateStudent($input: StudentInput!) {
  createStudent(input: $input) {
    __typename
    ... on MutationCreateStudentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
  }
}
    `;

export function useCreateStudentMutation() {
  return Urql.useMutation<CreateStudentMutation, CreateStudentMutationVariables>(CreateStudentDocument);
};
export const UpdateStudentDocument = gql`
    mutation UpdateStudent($input: StudentInput!) {
  updateStudent(input: $input) {
    __typename
    ... on MutationUpdateStudentSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on UniqueConstraintError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateStudentMutation() {
  return Urql.useMutation<UpdateStudentMutation, UpdateStudentMutationVariables>(UpdateStudentDocument);
};
export const GetInvoicesDocument = gql`
    query GetInvoices($filter: InvoiceFilter) {
  invoices(filter: $filter) {
    id
    number
    title
    amount
    grades {
      id
    }
  }
}
    `;

export function useGetInvoicesQuery(options?: Omit<Urql.UseQueryArgs<GetInvoicesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInvoicesQuery, GetInvoicesQueryVariables>({ query: GetInvoicesDocument, ...options });
};
export const CreateInvoiceDocument = gql`
    mutation CreateInvoice($input: InvoiceInput!) {
  createInvoice(input: $input) {
    __typename
    ... on MutationCreateInvoiceSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useCreateInvoiceMutation() {
  return Urql.useMutation<CreateInvoiceMutation, CreateInvoiceMutationVariables>(CreateInvoiceDocument);
};
export const UpdateInvoiceDocument = gql`
    mutation UpdateInvoice($input: InvoiceInput!) {
  updateInvoice(input: $input) {
    __typename
    ... on MutationUpdateInvoiceSuccess {
      data {
        id
      }
    }
    ... on AppError {
      __typename
      message
    }
    ... on NotFoundError {
      __typename
      message
    }
  }
}
    `;

export function useUpdateInvoiceMutation() {
  return Urql.useMutation<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>(UpdateInvoiceDocument);
};
export const InitializeFeePaymentDocument = gql`
    mutation InitializeFeePayment($input: FeePaymentInput!) {
  initiateFeePayment(input: $input) {
    __typename
    ... on MutationInitiateFeePaymentSuccess {
      data {
        authorization_url
        access_code
        reference
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useInitializeFeePaymentMutation() {
  return Urql.useMutation<InitializeFeePaymentMutation, InitializeFeePaymentMutationVariables>(InitializeFeePaymentDocument);
};
export const VerifyPaymentStatusDocument = gql`
    mutation VerifyPaymentStatus($reference: String!) {
  verifyPaymentStatus(reference: $reference) {
    __typename
    ... on MutationVerifyPaymentStatusSuccess {
      data {
        id
        reference
        amountPaid
        payerEmail
        paidAt
        students {
          id
          name
          surname
        }
      }
    }
    ... on AppError {
      __typename
      message
    }
  }
}
    `;

export function useVerifyPaymentStatusMutation() {
  return Urql.useMutation<VerifyPaymentStatusMutation, VerifyPaymentStatusMutationVariables>(VerifyPaymentStatusDocument);
};