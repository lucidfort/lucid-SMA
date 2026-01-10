"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { useClerk, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const OtpForm = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, isLoaded } = useSignUp();
  const { setActive } = useClerk();

  useEffect(() => {
    if (code.length < 6) return;

    verifyEmail();
  }, [code]);

  const verifyEmail = async () => {
    if (!isLoaded) return;

    setError(null);
    setIsLoading(true);

    try {
      const complete = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (complete.status === "complete") {
        await setActive({ session: complete.createdSessionId });
        router.push("auth/onboard");
      }
    } catch (err: any) {
      const clerkMessage =
        err?.errors?.[0]?.message ?? err?.message ?? "Authentication failed";

      setError(clerkMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (err: any) {
      const clerkMessage =
        err?.errors?.[0]?.message ?? err?.message ?? "Verification failed";

      setError(clerkMessage);
    }
  };

  return (
    <div className="max-w-[480px] space-y-3">
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={code}
        onChange={(value) => setCode(value)}
      >
        <InputOTPGroup className="space-x-3">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <div className="text-destructive flex-center w-full gap-4 text-center text-sm capitalize">
          <span>{error}</span>

          <Separator
            orientation="horizontal"
            className="bg-primary data-[orientation=horizontal]:w-4"
          />

          <Button
            onClick={resendCode}
            className="text-primary cursor-pointer border-none bg-transparent p-0 shadow-none transition-all duration-300 ease-in-out hover:scale-105 hover:bg-transparent"
          >
            Resend Code?
          </Button>
        </div>
      )}
    </div>
  );
};
export default OtpForm;
