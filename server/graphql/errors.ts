import { builder } from "./builder";

const ErrorInterface = builder.interfaceRef<Error>("Error").implement({
  fields: (t) => ({
    message: t.exposeString("message"),
  }),
});

builder.objectType(Error, {
  name: "BaseError",
  interfaces: [ErrorInterface],
});

export class AppError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

const AppErrorInterface = builder.interfaceType(AppError, {
  name: "AppError",
  interfaces: [ErrorInterface],
  fields: (t) => ({
    message: t.exposeString("message"),
    code: t.exposeString("code"),
  }),
});

builder.objectType(AppError, {
  name: "BaseAppError",
  interfaces: [AppErrorInterface, ErrorInterface],
  fields: (t) => ({
    message: t.exposeString("message"),
    code: t.exposeString("code"),
  }),
});

const registerError = <T extends new (...args: any[]) => AppError>(
  cls: T,
  name?: string,
) => {
  builder.objectType(cls as any, {
    name: name ?? cls.name,
    interfaces: [AppErrorInterface, ErrorInterface],
    fields: (t) => ({
      message: t.exposeString("message"),
      code: t.exposeString("code"),
    }),
  });
};

export class PasswordPwnedError extends AppError {
  constructor() {
    super("Password was found in a data breach.", "PASSWORD_PWNED");
  }
}

registerError(PasswordPwnedError);

export class PasswordTooShortError extends AppError {
  constructor() {
    super("Password is too short.", "PASSWORD_TOO_SHORT");
  }
}

registerError(PasswordTooShortError);

export class IdentifierExistsError extends AppError {
  constructor() {
    super("Account already exists.", "IDENTIFIER_EXISTS");
  }
}

registerError(IdentifierExistsError);

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, "NOT_FOUND");
  }
}

registerError(NotFoundError);

export class UniqueConstraintError extends AppError {
  constructor(field?: string) {
    super(`${field ?? "Resource"} already exists.`, "UNIQUE_CONSTRAINT");
  }
}

registerError(UniqueConstraintError);

export class AuthenticationError extends AppError {
  constructor(message?: string) {
    super(message || "Log in to perform action", "AUTH_ERROR");
  }
}

registerError(AuthenticationError);

export class ForeignKeyError extends AppError {
  constructor() {
    super("Cannot delete resource due to related records.", "FOREIGN_KEY");
  }
}

registerError(ForeignKeyError);

export class ServerBusyError extends AppError {
  constructor() {
    super("The server is busy at the moment. Try again soon.", "SERVER_BUSY");
  }
}

registerError(ServerBusyError);

export class RateLimitError extends AppError {
  constructor() {
    super(
      "You are making too many requests. Try again later",
      "RATE_LIMIT_EXCEEDED",
    );
  }
}

registerError(RateLimitError);
