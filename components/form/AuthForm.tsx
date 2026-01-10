"use client";

import { Form } from "@/components/ui/form";
import { authSchema, AuthSchema } from "@/lib/validation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "./ui/InputField";
import Link from "next/link";

type AuthType = "sign-in" | "sign-up";

interface Props {
  type: AuthType;
}

const AuthForm = ({ type }: Props) => {
  const router = useRouter();
  const { setActive } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AuthSchema>({
    resolver: zodResolver(authSchema(type)),
    defaultValues: {
      email: null,
      username: "",
      password: "",
      confirmPassword: null,
    },
  });

  const isClerkReady = useMemo(() => {
    return type === "sign-in" ? signInLoaded : signUpLoaded;
  }, [type, signInLoaded, signUpLoaded]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isClerkReady) return;

    setIsLoading(true);
    setError(null);

    try {
      if (type === "sign-in") {
        if (!signIn) throw new Error("Sign-in unavailable");

        const result = await signIn.create({
          identifier: values.username,
          password: values.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.refresh();
        }
      }

      if (type === "sign-up") {
        if (!signUp) throw new Error("Sign-up unavailable");

        const result = await signUp.create({
          emailAddress: values.email!,
          username: values.username,
          password: values.password,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        if (result.status === "complete") {
          router.push("/auth/sign-up/verify-account");
        }
      }
    } catch (err: any) {
      const clerkMessage =
        err?.errors?.[0]?.message ?? err?.message ?? "Authentication failed";

      setError(clerkMessage);
    } finally {
      setIsLoading(false);
    }
  });

  const buttonLabel = type === "sign-in" ? "Sign In" : "Sign Up";

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex w-full flex-col gap-4">
          {type === "sign-up" && (
            <InputField
              label="Email"
              name="email"
              type="email"
              control={form.control}
              fieldType={FormFieldType.INPUT}
            />
          )}

          <InputField
            label="Username"
            name="username"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            control={form.control}
            fieldType={FormFieldType.INPUT}
          />

          {type === "sign-up" && (
            <>
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                control={form.control}
                fieldType={FormFieldType.INPUT}
              />

              <div className="flex-center mx-auto w-full">
                <div id="clerk-captcha" />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={!form.formState.isDirty || isLoading}
          className="form-submit_btn mt-5"
        >
          {isLoading ? (
            <Loader2 className="text-lamaYellow animate-spin" />
          ) : (
            <span>{buttonLabel}</span>
          )}
        </button>

        <Link
          href={type === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}
          className="flex-center gap-1 text-sm"
        >
          {type === "sign-in" ? (
            <>
              <Info className="size-3" /> I don&apos;t have an yet account
            </>
          ) : (
            <>Already have an account? Log In</>
          )}
        </Link>
      </form>
    </Form>
  );
};

export default AuthForm;
