"use server";

import {
  AppError,
  ForeignKeyError,
  IdentifierExistsError,
  NotFoundError,
  PasswordPwnedError,
  PasswordTooShortError,
  RateLimitError,
  ServerBusyError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import { RoleAccessLevel } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth();

  const metadata = sessionClaims?.metadata as
    | {
        accessLevel?: RoleAccessLevel;
        schoolId?: string;
      }
    | undefined;

  return {
    schoolId: metadata?.schoolId,
    currentUserId: userId,
    accessLevel: metadata?.accessLevel,
  };
}

export const handleGraphqlServerErrors = async (error: any) => {
  console.log(error);

  // CLERK ERRORS
  if (error?.errors && Array.isArray(error.errors)) {
    const primaryError = error.errors[0];

    switch (primaryError.code) {
      case "form_password_pwned":
        throw new PasswordPwnedError();

      case "form_password_length_too_short":
        throw new PasswordTooShortError();

      case "form_identifier_exists":
        throw new IdentifierExistsError();

      case "unexpected_error":
        throw new AppError("Something went wrong. Please try again later.", "");

      case "resource_not_found":
        throw new NotFoundError();

      default:
        break;
    }
  }

  // PRISMA ERRORS
  if (error?.code) {
    const errorCode = error.code;
    const meta = error?.meta;

    console.log({ meta });

    switch (errorCode) {
      case "P2002":
        throw new UniqueConstraintError(meta?.target[meta?.target.length - 1]);

      case "P2003":
        throw new ForeignKeyError();

      case "P2034":
        throw new ServerBusyError();

      default:
        break;
    }
  }

  if (error.message?.includes("Too many requests")) {
    throw new RateLimitError();
  }

  throw new AppError("Something went wrong. Please try again later.", "");
};
