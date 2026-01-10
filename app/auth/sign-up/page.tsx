import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import AuthForm from "@/components/form/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up - Eduvia",
  description: "Sign in to access your school records",
};

const SignupPage = () => {
  return (
    <div className="hide-scrollbar relative flex w-full pb-10">
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
            Free School Management Application
            <br />
          </p>

          <p className="text-sm text-gray-400">
            Manage and grow your school without stress
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
            Register Your Account
          </h1>
        </div>

        <AuthForm type="sign-up" />
      </div>
    </div>
  );
};

export default SignupPage;
