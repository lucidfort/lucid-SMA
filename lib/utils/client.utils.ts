import { type ClassValue, clsx } from "clsx";
import { format, getDay, getYear, set, subYears } from "date-fns";
import { twMerge } from "tailwind-merge";
import { GraphQLError } from "graphql";
import { AttendanceStatus } from "@/lib/generated/graphql/client";
import { AttendanceRange } from "@/types";

type AttendanceRecord = {
  date: string;
  status: AttendanceStatus;
};

type AttendancePoint = {
  name: string;
  present: number;
  absent: number;
};

type ExtractedGraphqlError = {
  message: string;
  code?: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractGraphqlErrors = (
  errors?: readonly GraphQLError[],
): ExtractedGraphqlError | null => {
  if (!errors || errors.length === 0) return null;

  // Prefer the first error (GraphQL spec allows multiple, UX does not)
  const error = errors[0];

  return {
    message: error.message || "Something went wrong.",
    code:
      typeof error.extensions?.code === "string"
        ? error.extensions.code
        : undefined,
  };
};

export const handleGraphqlClientErrors = (error: any) => {
  let message = "";

  switch (error?.__typename) {
    case "BaseError":
    case "BaseAppError":
    case "AppError":
    case "UniqueConstraintError":
    case "ForeignKeyError":
    case "NotFoundError":
    case "IdentifierExistsError":
    case "PasswordTooShortError":
    case "PasswordPwnedError":
      message = error?.message;
      break;
    default:
      message = "Something went wrong";
  }

  return message;
};

export const extractImageId = (url: string) => {
  const publicId = url.split("/").pop()?.split(".")[0];

  return { id: publicId };
};

export const calculateAge = (dateString: Date | string) => {
  const today = new Date();
  const birth = new Date(dateString);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export function generateAcademicYears(yearsBack = 3) {
  const now = new Date();
  const month = now.getMonth();
  const currentStartYear = month >= 8 ? getYear(now) : getYear(now) - 1;

  return Array.from({ length: yearsBack + 1 }, (_, i) => {
    const from = getYear(subYears(new Date(currentStartYear, 0), i));
    return `${from}/${from + 1}`;
  });
}

export function getCurrentSession() {
  const now = new Date();
  const month = now.getMonth();
  const currentStartYear = month >= 8 ? getYear(now) : getYear(now) - 1;

  const academicYear = `${currentStartYear}/${currentStartYear + 1}`;

  const academicYearStartDate = set(new Date(), {
    year: currentStartYear,
    month: 8,
    date: 13,
    hours: 0,
  });

  let currentTerm: string;
  let termStartDate: Date;

  if (month >= 8 && month <= 11) {
    currentTerm = "1";
    termStartDate = academicYearStartDate;
  } else if (month >= 0 && month <= 3) {
    currentTerm = "2";
    termStartDate = set(new Date(), {
      year: getYear(now),
      month: 0,
      date: 13,
      hours: 0,
    });
  } else {
    currentTerm = "3";
    termStartDate = set(new Date(), {
      year: getYear(now),
      month: 3,
      date: 22,
      hours: 0,
    });
  }

  return { academicYear, currentTerm, academicYearStartDate, termStartDate };
}

export function generateUuid(length = 8) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let id = "";

  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }

  return id;
}

export function getFirstCharacters(str: string, count?: number) {
  const words = str.trim().toLowerCase().split(" ");
  return words
    .map((w) => w.charAt(0))
    .slice(0, count || words.length)
    .join("");
}

export function isRateLimitError(error: any) {
  return error?.graphQLErrors?.some(
    (err: GraphQLError) => err.extensions?.code === "RATE_LIMIT_EXCEEDED",
  );
}

export function getRetryAfterSeconds(error: any): number | null {
  const msg = error?.graphQLErrors?.[0]?.message;
  if (!msg) return null;

  const match = msg.match(/(\d+)\s*seconds/);
  return match ? Number(match[1]) : null;
}

const emptyCount = () => ({ PRESENT: 0, ABSENT: 0 });

export function aggregateAttendance(
  data: AttendanceRecord[],
  range: AttendanceRange,
): AttendancePoint[] {
  const map: Record<string, ReturnType<typeof emptyCount>> = {};

  data.forEach(({ date, status }) => {
    const d = new Date(date);

    let key: string;

    switch (range) {
      case "WEEKLY":
        const dayIndex = getDay(d);
        if (dayIndex === 0 || dayIndex === 6) return;
        key = format(d, "EEE"); // Mon, Tue
        break;

      case "MONTHLY":
        key = format(d, "MMM d"); // Jan 12
        break;

      case "YEARLY":
        key = format(d, "MMM"); // Jan, Feb
        break;

      default:
        return;
    }

    if (!map[key]) map[key] = emptyCount();
    if (status === "PRESENT" || status === "ABSENT") {
      map[key][status]++;
    }
  });

  return Object.entries(map).map(([name, counts]) => ({
    name,
    present: counts.PRESENT,
    absent: counts.ABSENT,
  }));
}
