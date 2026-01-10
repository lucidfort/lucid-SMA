import SchoolOnboardingForm from "@/components/form/SchoolOnboardingForm";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your School - Eduvia",
  description:
    "Create and start managing your school with ease in just two steps",
};

const OnboardPage = () => {
  return (
    <div className="hide-scrollbar relative flex min-h-screen w-full">
      <div className="flex-center min-h-screen w-full flex-col gap-8 px-10 py-12 xl:w-1/2 xl:px-24">
        <div className="flex flex-col space-y-3 xl:hidden">
          <Image
            src="/logo.webp"
            alt="logo"
            width={200}
            height={200}
            quality={300}
          />

          <h1 className="text-primary text-2xl font-semibold">
            Create Your School Profile
          </h1>
        </div>

        <SchoolOnboardingForm />
      </div>

      <div className="bg-primary fixed top-0 right-0 hidden h-screen w-1/2 flex-col overflow-hidden rounded-r-xl xl:flex">
        <div className="m-auto flex h-full max-w-xl flex-col items-start justify-center gap-5 pl-7 text-white">
          <h1 className="text-lg">Eduvia</h1>
          <p className="mt-6 max-w-[440px] text-5xl leading-snug font-bold">
            Let&apos;s get you started!
          </p>

          <p className="max-w-md text-base leading-snug text-gray-300">
            Please fill in appropriate details to get started. If you have any
            questions, please contact us hello@eduvia.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardPage;
