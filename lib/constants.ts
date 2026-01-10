export const menuItems = [
  {
    title: "GENERAL",
    items: [
      {
        icon: "/home.svg",
        label: "Home",
        href: "/",
        visible: ["manager", "teacher", "parent"],
      },
      {
        grouped: true,
        icon: "/class.svg",
        label: "Session",
        links: [
          { label: "Academic Year", href: "/list/academic-years" },
          { label: "Term", href: "/list/terms" },
        ],
        visible: ["manager"],
      },
      {
        grouped: true,
        label: "Academic Structure",
        icon: "/subject.svg",
        links: [
          { label: "Programs", href: "/list/programs" },
          { label: "Grades", href: "/list/grades" },
          { label: "Classes", href: "/list/classes" },
          { label: "Subjects", href: "/list/subjects" },
        ],
        visible: ["manager"],
      },
      {
        icon: "/teacher.svg",
        label: "Staff",
        href: "/list/staffs",
        visible: ["manager"],
      },
      {
        icon: "/student.svg",
        label: "Students",
        href: "/list/students",
        visible: ["manager", "teacher", "finance"],
      },
      {
        icon: "/parent.svg",
        label: "Parents",
        href: "/list/parents",
        visible: ["manager", "teacher"],
      },
      {
        grouped: true,
        icon: "/result.svg",
        label: "Assessment",
        links: [
          { label: "Assignments", href: "/list/assignments" },
          { label: "Exams", href: "/list/exams" },
          { label: "Results", href: "/list/results" },
        ],
        visible: ["manager", "teacher", "parent"],
      },
      {
        grouped: true,
        icon: "/receipt.svg",
        label: "Fees",
        links: [
          { label: "Invoices", href: "/finance/invoice" },
          { label: "Transactions", href: "/finance/invoice/transactions" },
        ],
        visible: ["parent"],
      },
      {
        grouped: true,
        icon: "/attendance.svg",
        label: "Attendance",
        links: [
          {
            label: "Class",
            href: "/list/attendance/class",
          },
          {
            label: "Staff",
            href: "/list/attendance/staff",
          },
        ],
        visible: ["manager", "teacher"],
      },
      {
        icon: "/calendar.svg",
        label: "Events",
        href: "/list/events",
        visible: ["manager", "teacher", "parent"],
      },
      {
        icon: "/message.svg",
        label: "Messages",
        href: "/list/messages",
        visible: ["manager", "teacher", "parent"],
      },
      {
        icon: "/announcement.svg",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["manager", "teacher", "parent"],
      },
    ],
    visible: ["manager", "teacher", "finance", "parent"],
  },
  {
    title: "FINANCE",
    items: [
      {
        icon: "/fee.svg",
        label: "Overview",
        href: "/finance/overview",
        visible: ["finance", "manager"],
      },
      {
        grouped: true,
        icon: "/receipt.svg",
        label: "Fees",
        links: [
          { label: "Invoices", href: "/finance/invoice" },
          { label: "Transactions", href: "/finance/invoice/transactions" },
        ],
        visible: ["finance", "manager"],
      },
      {
        grouped: true,
        icon: "/fee.svg",
        label: "Payroll",
        links: [
          {
            label: "Account Details",
            href: "/finance/payroll/account-details",
          },
          { label: "Transactions", href: "/finance/payroll/transactions" },
        ],
        visible: ["manager", "finance"],
      },
    ],
    visible: ["finance", "manager"],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        icon: "/profile.svg",
        label: "Profile",
        href: "/account/profile",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/setting.svg",
        label: "Settings",
        href: "/account/settings",
        visible: ["manager", "teacher", "student", "parent"],
      },
    ],
    visible: ["manager"],
  },
];

export const gradeMap: { [key: string]: string[] } = {
  CRECHE: ["Creche"],
  NURSERY: ["Nursery 1", "Nursery 2", "Nursery 3"],
  PRIMARY: [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
  ],
  SECONDARY: ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"],
} as const;

export const relationships = [
  "FATHER",
  "MOTHER",
  "SIBLING",
  "GRANDPARENT",
  "GUARDIAN",
  "OTHER",
];

export const userSex = ["Male", "Female"];

export const dayOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const examTypes = ["Quiz", "Test", "Midterm", "Final", "Practical"];

export const schoolTerms = [
  { id: 1, name: "First" },
  { id: 2, name: "Second" },
  { id: 3, name: "Third" },
];
