export const menuItems = [
  {
    title: "GENERAL",
    items: [
      {
        icon: "/home.svg",
        label: "Home",
        href: "/",
        visible: ["manager", "teacher", "student"],
      },
      {
        grouped: true,
        icon: "/teacher.svg",
        label: "Staff",
        links: [
          { label: "All Staff", href: "/list/staffs" },
          { label: "Teachers", href: "/list/staffs?role=teacher" },
          { label: "Finance Execs", href: "/list/staffs?role=finance" },
          { label: "Non-Academic", href: "/list/staffs?role=academics" },
        ],
        visible: ["manager", "teacher"],
      },
      {
        grouped: true,
        icon: "/student.svg",
        label: "Students",
        links: [
          {
            label: "Currently Enrolled",
            href: "/list/students?display=enrolled",
          },
          {
            label: "Formerly Enrolled",
            href: "/list/students?display=formerly-enrolled",
          },
        ],
        visible: ["academics", "teacher", "manager", "finance"],
      },
      {
        icon: "/parent.svg",
        label: "Parents",
        href: "/list/parents",
        visible: ["manager", "teacher"],
      },
      {
        icon: "/class.svg",
        label: "Academic Years",
        href: "/list/academic-years",
        visible: ["manager"],
      },
      {
        icon: "/class.svg",
        label: "Terms",
        href: "/list/terms",
        visible: ["manager"],
      },
      {
        icon: "/class.svg",
        label: "Programs",
        href: "/list/programs",
        visible: ["manager"],
      },
      {
        icon: "/class.svg",
        label: "Grades",
        href: "/list/grades",
        visible: ["manager"],
      },
      {
        icon: "/class.svg",
        label: "Classes",
        href: "/list/classes",
        visible: ["manager", "teacher"],
      },
      {
        icon: "/subject.svg",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["manager"],
      },
      {
        icon: "/lesson.svg",
        label: "Clubs",
        href: "/list/clubs",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/exam.svg",
        label: "Exams",
        href: "/list/exams",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/assignment.svg",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/result.svg",
        label: "Results",
        href: "/list/results",
        visible: ["manager", "teacher", "student"],
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
        visible: ["academics", "manager"],
      },
      {
        icon: "/calendar.svg",
        label: "Events",
        href: "/list/events",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/message.svg",
        label: "Messages",
        href: "/list/messages",
        visible: ["manager", "teacher", "student"],
      },
      {
        icon: "/announcement.svg",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["manager", "teacher", "student"],
      },
    ],
    visible: ["manager", "administration", "teacher", "academics", "finance"],
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
      {
        icon: "/fee.svg",
        label: "Fees",
        href: "/list/fees",
        visible: ["finance", "manager"],
      },
      {
        icon: "/receipt.svg",
        label: "Transactions",
        href: "/list/transactions",
        visible: ["finance", "manager"],
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
    visible: ["manager", "administration"],
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
