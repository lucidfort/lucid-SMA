import AuthForm from "@/components/form/AuthForm";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Eduvia",
  description: "Sign in to access your school records",
};

const SignInPage = () => {
  return (
    <div className="hide-scrollbar relative flex h-screen w-full overflow-hidden">
      <div className="bg-primary hidden h-full w-1/2 flex-col rounded-l-xl lg:flex">
        <div className="m-auto flex h-full max-w-xl flex-col items-start justify-center gap-6 pl-7 text-white">
          <Image
            src="/logo.webp"
            alt="logo"
            width={200}
            height={200}
            quality={300}
          />

          <p className="mt-4 max-w-[480px] text-5xl leading-tight font-bold">
            Welcome back.
            <br />
            Your school, in one place.
          </p>

          <p className="text-sm text-gray-400">
            Sign in to continue where you left off.
          </p>
        </div>
      </div>

      <div className="flex h-full w-full flex-col justify-center gap-7 px-10 xl:w-1/2 xl:px-24">
        <div className="flex-center flex-col gap-3">
          <Link href="/" className="flex lg:hidden">
            <Image
              src="/logo.webp"
              alt="logo"
              width={200}
              height={200}
              quality={300}
            />
          </Link>

          <h1 className="text-primary text-2xl font-semibold">
            Log In Your Account
          </h1>
        </div>

        <AuthForm type="sign-in" />
      </div>
    </div>
  );
};

export default SignInPage;
