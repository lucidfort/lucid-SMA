import { type ClassValue, clsx } from "clsx";
import { getYear, set, subYears } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[],
): { title: string; start: Date; end: Date }[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds(),
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds(),
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

export const toDatetimeLocal = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1); // Months are 0-indexed
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const handleServerErrors = (error: any) => {
  // CLERK ERRORS
  if (error?.errors && Array.isArray(error.errors)) {
    const primaryError = error.errors[0];

    switch (primaryError.code) {
      case "form_password_pwned":
        return {
          success: false,
          error:
            "Password was found in a data breach. Use a more secure password.",
        };

      case "form_password_length_too_short":
        return {
          success: false,
          error: "Password is too short. Please make it longer.",
        };

      case "form_identifier_exists":
        return {
          success: false,
          error: "An account with this username or email already exists.",
        };

      case "unexpected_error":
        return {
          success: false,
          error: "Something went wrong. Please try again later.",
        };

      case "resource_not_found":
        return {
          success: false,
          error: "User with ID does not exist",
        };

      default:
        return {
          success: false,
          error:
            primaryError.message ||
            "An unknown error occurred. Please try again.",
        };
    }
  }

  // // PRISMA ERRORS
  if (error?.code) {
    const errorCode = error.code;
    const meta = error?.meta;

    console.log({ meta });

    switch (errorCode) {
      case "P2002":
        return {
          success: false,
          error: `${meta?.target[meta?.target.length - 1]} already exists. Please use another`,
        };

      case "P2003":
        return { success: false, error: "Cannot delete resource" };

      default:
        break;
    }
  }
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

export function generateUuid(length = 5) {
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
