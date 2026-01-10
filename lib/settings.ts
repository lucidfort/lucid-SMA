export const ITEMS_PER_PAGE = 20;

type RouteAccessMap = {
  [key: string]: string[];
};

export const defaultHome: { [key: string]: string } = {
  finance: "/finance/overview",
  academics: "/academics/overview",
  manager: "/admin",
  teacher: "/teacher",
  parent: "/parent",
};

export const routeAccessMap: RouteAccessMap = {
  "/finance/invoice(.*)": ["parent", "finance", "manager"],
  "/finance(.*)": ["finance", "manager"],

  "/admin(.*)": ["manager"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],

  "/list/staffs(.*)": ["manager"],
  "/list/students(.*)": ["manager", "finance"],
  "/list/parents": ["manager"],
  "/list/subjects": ["manager"],
  "/list/programs": ["manager"],
  "/list/academic-years": ["manager"],
  "/list/terms": ["manager"],
  "/list/grades": ["manager"],
  "/list/classes": ["manager"],
  "/list/exams": ["teachers", "manager", "parent"],
  "/list/assignments": ["teacher", "manager", "parent"],
  "/list/results": ["manager", "parent"],
  "/list/attendance(.*)": ["manager"],
  "/list/events": ["manager", "finance", "parent", "teacher"],
  "/list/announcements": ["manager", "finance", "parent", "teacher"],
  "/account/profile": ["manager", "parent"],
  "/account/settings": ["manager", "parent"],
};

export const listCreationAccess: { [key: string]: string[] } = {
  manager: [
    "assignment",
    "event",
    "announcement",
    "exam",
    "subject",
    "class",
    "staff",
    "student",
    "parent",
    "grade",
    "result",
    "club",
    "program",
    "term",
    "academic-year",
    "invoice",
    "payroll-profile",
  ],
  finance: ["invoice", "payroll-profile"],
  teacher: ["assignment", "exam", "exam-result", "assessment-result"],
  parent: [],
};

export const resourceDeletionAccess: { [key: string]: string[] } = {
  manager: [
    "assignment",
    "event",
    "announcement",
    "exam",
    "subject",
    "class",
    "staff",
    "student",
    "parent",
    "grade",
    "result",
    "club",
    "program",
    "term",
    "academic-year",
    "invoice",
    "payroll-profile",
  ],
  finance: [],
  teacher: [],
  parent: [],
};
