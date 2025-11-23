export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type GetAcademicYearsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAcademicYearsQuery = { __typename?: 'Query', academicYears?: Array<{ __typename?: 'AcademicYear', id: string, year: string, startDate: any, endDate?: any | null, isCurrent: boolean }> | null };

export type GetAssignmentsQueryVariables = Exact<{
  filter?: InputMaybe<AssignmentFilter>;
}>;


export type GetAssignmentsQuery = { __typename?: 'Query', assignments?: Array<{ __typename?: 'Assignment', id: string, startDate: any, dueDate: any, maxScore: number, term: { __typename?: 'Term', id: string, term: number }, class: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string } }, subject: { __typename?: 'Subject', id: string, name: string } }> | null };

export type GetClassAttendanceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  attendanceFilter: AttendanceFilter;
}>;


export type GetClassAttendanceQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, attendances: Array<{ __typename?: 'StudentAttendance', id: string, present: boolean, studentId: string, updatedAt: any }>, students: Array<{ __typename?: 'Student', id: string, name: string, surname: string, sex: Sex }> } | null };

export type GetClassesAttendanceQueryVariables = Exact<{
  attendanceFilter: AttendanceFilter;
}>;


export type GetClassesAttendanceQuery = { __typename?: 'Query', classes?: Array<{ __typename?: 'Class', id: string, name: string, studentCount: number, attendancePresentCount: number }> | null };

export type GetStaffsAttendanceQueryVariables = Exact<{
  filter?: InputMaybe<StaffFilterInput>;
  attendanceFilter: AttendanceFilter;
}>;


export type GetStaffsAttendanceQuery = { __typename?: 'Query', staffs?: Array<{ __typename?: 'Staff', id: string, name: string, surname: string, attendances: Array<{ __typename?: 'StaffAttendance', id: string, clockInTime?: any | null, reasonForAbsence?: string | null }> }> | null };

export type GetClassQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  attendanceFilter: AttendanceFilter;
}>;


export type GetClassQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, capacity: number, studentCount: number, grade: { __typename?: 'Grade', id: string, name: string, program: { __typename?: 'Program', id: string } }, supervisors: Array<{ __typename?: 'Staff', id: string, name: string, surname: string, img?: string | null }>, students: Array<{ __typename?: 'Student', id: string, name: string, surname: string, sex: Sex, registrationNumber: string, img?: string | null, activeState: string }>, attendances: Array<{ __typename?: 'StudentAttendance', date: any, present: boolean }> } | null };

export type GetClassesQueryVariables = Exact<{
  where?: InputMaybe<ClassFilterInput>;
}>;


export type GetClassesQuery = { __typename?: 'Query', classes?: Array<{ __typename?: 'Class', id: string, name: string, studentCount: number, capacity: number, supervisors: Array<{ __typename?: 'Staff', id: string, name: string, surname: string }>, grade: { __typename?: 'Grade', id: string, name: string } }> | null };

export type GetClubsQueryVariables = Exact<{
  filter?: InputMaybe<ClubFilter>;
}>;


export type GetClubsQuery = { __typename?: 'Query', clubs?: Array<{ __typename?: 'Club', id: string, name: string, description?: string | null, foundedAt?: any | null }> | null };

export type GetExamsQueryVariables = Exact<{
  filter?: InputMaybe<ExamFilter>;
}>;


export type GetExamsQuery = { __typename?: 'Query', exams?: Array<{ __typename?: 'Exam', id: string, date: any, startTime: string, endTime?: string | null, type: ExamType, maxScore: number, term: { __typename?: 'Term', id: string, term: number }, grade: { __typename?: 'Grade', id: string, name: string }, subject: { __typename?: 'Subject', id: string, name: string } }> | null };

export type GetInvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInvoicesQuery = { __typename?: 'Query', invoices?: Array<{ __typename?: 'Invoice', id: string, number: string, title: string, amount: number, dueDate?: any | null, term: { __typename?: 'Term', term: number, academicYear: { __typename?: 'AcademicYear', year: string } }, grades: Array<{ __typename?: 'Grade', id: string, name: string }> }> | null };

export type GetGradeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGradeQuery = { __typename?: 'Query', grade?: { __typename?: 'Grade', id: string, name: string, classes: Array<{ __typename?: 'Class', id: string, name: string, studentCount: number, supervisors: Array<{ __typename?: 'Staff', id: string, name: string, surname: string, img?: string | null }> }> } | null };

export type GetGradesQueryVariables = Exact<{
  where?: InputMaybe<GradeFilterInput>;
}>;


export type GetGradesQuery = { __typename?: 'Query', grades?: Array<{ __typename?: 'Grade', id: string, name: string, classes: Array<{ __typename?: 'Class', id: string, name: string, studentCount: number }> }> | null };

export type GetParentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetParentsQuery = { __typename?: 'Query', parents?: Array<{ __typename?: 'Parent', id: string, name: string, surname: string, phone: string, primaryId?: string | null, email?: any | null, address: string, childrenCount: number }> | null };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { __typename?: 'Query', programs?: Array<{ __typename?: 'Program', id: string, name: ProgramName, grades: Array<{ __typename?: 'Grade', name: string, studentCount: number }> }> | null };

export type GetResultsQueryVariables = Exact<{
  filter: ResultFilter;
}>;


export type GetResultsQuery = { __typename?: 'Query', results?: Array<{ __typename?: 'Result', id: string, uploadedAt: any }> | null };

export type GetStaffQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetStaffQuery = { __typename?: 'Query', staff?: { __typename?: 'Staff', id: string, name: string, surname: string, role: string, phone: string, email?: any | null, address: string, img?: string | null, employeeId: string, accessLevel: string, class?: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string, program: { __typename?: 'Program', id: string } } } | null } | null };

export type GetStaffsQueryVariables = Exact<{
  filter?: InputMaybe<StaffFilterInput>;
}>;


export type GetStaffsQuery = { __typename?: 'Query', staffs?: Array<{ __typename?: 'Staff', id: string, name: string, surname: string, employeeId: string, phone: string, email?: any | null, address: string, img?: string | null, class?: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string } } | null }> | null };

export type GetStudentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  attendanceFilter: AttendanceFilter;
}>;


export type GetStudentQuery = { __typename?: 'Query', student?: { __typename?: 'Student', id: string, name: string, surname: string, registrationNumber: string, activeState: string, sex: Sex, address: string, birthday: any, img?: string | null, class: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string, programId: string } }, guardians?: Array<{ __typename?: 'ParentStudent', isPrimary: boolean, relation: string, parent: { __typename?: 'Parent', id: string, name: string, surname: string, email?: any | null, phone: string, address: string } }> | null, attendances?: Array<{ __typename?: 'StudentAttendance', date: any, present: boolean }> | null } | null };

export type GetStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStudentsQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', id: string, name: string, surname: string, registrationNumber: string, address: string, sex: Sex, img?: string | null, class: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string } } }> | null };

export type GetSubjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubjectsQuery = { __typename?: 'Query', subjects?: Array<{ __typename?: 'Subject', id: string, name: string, teachers: Array<{ __typename?: 'TeacherSubjectAssignment', id: string, teacher: { __typename?: 'Staff', id: string, name: string, surname: string } }> }> | null };

export type GetTermsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTermsQuery = { __typename?: 'Query', terms?: Array<{ __typename?: 'Term', id: string, term: number, startDate: any, endDate?: any | null, isCurrent: boolean }> | null };

export type GetTransactionsQueryVariables = Exact<{
  filter: InvoicePaymentFilter;
}>;


export type GetTransactionsQuery = { __typename?: 'Query', invoicePayments?: Array<{ __typename?: 'InvoicePayment', id: string, amountPaid: number, createdAt: any, paidAt?: any | null, method?: string | null, payerEmail?: string | null, reference: string, status: PaymentStatus, students: Array<{ __typename?: 'Student', name: string, surname: string }>, invoice: { __typename?: 'Invoice', id: string, number: string } }> | null };

export type GetSchoolDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  attendanceFilter: AttendanceFilter;
}>;


export type GetSchoolDetailsQuery = { __typename?: 'Query', school?: { __typename?: 'School', id: string, activeStaffCount: number, activeStudentsCount: number, studentSexDistribution: Array<{ __typename?: 'StudentSexCount', sex?: Sex | null, _count?: number | null }>, studentAttendances?: Array<{ __typename?: 'StudentAttendance', date: any, present: boolean }> | null } | null };

export type GetParentQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  clerkUserId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetParentQuery = { __typename?: 'Query', parent?: { __typename?: 'Parent', id: string, name: string, surname: string, children: Array<{ __typename?: 'ParentStudent', student: { __typename?: 'Student', id: string, name: string, surname: string, class: { __typename?: 'Class', id: string, name: string, grade: { __typename?: 'Grade', id: string, name: string } } } }> } | null };

export type GetStudentPerformanceDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  attendanceFilter: AttendanceFilter;
  skip: Scalars['Boolean']['input'];
}>;


export type GetStudentPerformanceDetailsQuery = { __typename?: 'Query', student?: { __typename?: 'Student', id: string, name: string, surname: string, registrationNumber: string, img?: string | null, birthday: any, attendances?: Array<{ __typename?: 'StudentAttendance', date: any, present: boolean }> | null } | null };

export type GetStaffDetailsQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetStaffDetailsQuery = { __typename?: 'Query', staff?: { __typename?: 'Staff', id: string, class?: { __typename?: 'Class', id: string, name: string } | null } | null };

export type GetInvoiceSummaryQueryVariables = Exact<{
  filter: InvoiceFilter;
}>;


export type GetInvoiceSummaryQuery = { __typename?: 'Query', invoices?: Array<{ __typename?: 'Invoice', id: string, title: string, paymentCount: number, studentCount?: number | null }> | null };

export type GetTransactionsSummaryQueryVariables = Exact<{
  filter: InvoicePaymentFilter;
}>;


export type GetTransactionsSummaryQuery = { __typename?: 'Query', invoicePayments?: Array<{ __typename?: 'InvoicePayment', id: string, amountPaid: number, paidAt?: any | null }> | null };

export type GetAnnouncementsCountQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  rangeFrom: Scalars['DateTime']['input'];
}>;


export type GetAnnouncementsCountQuery = { __typename?: 'Query', school?: { __typename?: 'School', id: string, announcementsCount: number } | null };

export type GetResultsForPerformanceQueryVariables = Exact<{
  filter: ResultFilter;
  termId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetResultsForPerformanceQuery = { __typename?: 'Query', results?: Array<{ __typename?: 'Result', id: string, score: number, exam?: { __typename?: 'Exam', id: string, maxScore: number } | null, assignment?: { __typename?: 'Assignment', id: string, maxScore: number } | null }> | null };

export type GetTimetableQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type GetTimetableQuery = { __typename?: 'Query', timetable?: Array<{ __typename?: 'TimetablePeriod', id: string, startTime: string, endTime: string, periodSlots: Array<{ __typename?: 'PeriodSlot', id: string, dayOfWeek: number, timetableAssignments: Array<{ __typename?: 'TimetableAssignment', id: string, teacher?: { __typename?: 'Staff', id: string, name: string, surname: string } | null, subject?: { __typename?: 'Subject', id: string, name: string } | null }> }> }> | null };

export type GetSchoolQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSchoolQuery = { __typename?: 'Query', school?: { __typename?: 'School', id: string, slug: string, name: string, logo?: string | null, motto?: string | null, currentTerm?: Array<{ __typename?: 'Term', id: string }> | null } | null };

export type GetAnnouncementsQueryVariables = Exact<{
  filter: AnnouncementFilter;
  skipGrade: Scalars['Boolean']['input'];
}>;


export type GetAnnouncementsQuery = { __typename?: 'Query', announcements?: Array<{ __typename?: 'Announcement', id: string, content: string, title: string, publishedAt: any, grade?: { __typename?: 'Grade', id: string, name: string } | null }> | null };

export type GetEventsQueryVariables = Exact<{
  filter: EventFilter;
  skipGrade: Scalars['Boolean']['input'];
}>;


export type GetEventsQuery = { __typename?: 'Query', events?: Array<{ __typename?: 'Event', id: string, title: string, description: string, startTime: any, endTime: any, updatedAt?: any | null, grade?: { __typename?: 'Grade', id: string, name: string } | null }> | null };
