export const ITEMS_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const defaultHome: { [key: string]: string } = {
  finance: "/finance/overview",
  academics: "/academics/overview",
  manager: "/manager",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["administration"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/finance(.*)": ["finance", "manager"],
  "/list/staffs(.*)": ["administration", "manager"],
  "/list/students(.*)": ["administration", "manager", "finance"],
  "/list/parents": ["administration", "manager"],
  "/list/subjects": ["administration", "manager"],
  "/list/programs": ["manager"],
  "/list/academic-years": ["manager"],
  "/list/terms": ["manager"],
  "/list/grades": ["manager"],
  "/list/classes": ["administration", "manager"],
  "/list/exams": ["teachers", "manager", "parent"],
  "/list/clubs": ["teacher", "manager", "parent"],
  "/list/assignments": ["teacher", "manager", "parent"],
  "/list/results": ["administration", "manager", "parent"],
  "/list/attendance(.*)": ["administration", "manager"],
  "/list/fees": ["administration", "manager", "finance", "student", "parent"],
  "/list/transactions": ["administration", "manager", "finance"],
  "/list/events": [
    "administration",
    "manager",
    "academics",
    "finance",
    "student",
    "parent",
    "teacher",
  ],
  "/list/announcements": [
    "administration",
    "manager",
    "finance",
    "academics",
    "student",
    "parent",
    "teacher",
  ],
  "/account/profile": ["administration", "manager", "student", "parent"],
  "/account/settings": ["administration", "manager", "student", "parent"],
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
    "invoice",
    "program",
    "term",
    "academic-year",
  ],
  finance: ["invoice"],
  teacher: ["assignment", "exam", "result"],
  student: [],
  parent: [],
};
