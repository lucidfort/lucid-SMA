import SchoolOnboardingForm from "@/components/forms/SchoolOnboadingForm";
import Link from "next/link";
import Image from "next/image";

const OnboardPage = () => {
  return (
    <div className="hide-scrollbar relative flex h-screen w-full overflow-hidden">
      <div className="hidden h-full w-1/2 flex-col rounded-l-xl bg-primary xl:flex">
        <div className="m-auto flex h-full max-w-xl flex-col items-start justify-center gap-5 pl-7 text-white">
          <h1 className="text-lg">Learnix</h1>
          <p className="mt-6 max-w-[440px] text-5xl leading-snug font-bold">
            Let&apos;s get you started!
          </p>

          <p className="max-w-md text-base leading-snug text-gray-300">
            Please fill in appropriate details to get started. If you have any
            questions, please contact us hello@learnix.com
          </p>

          <div className="mt-14 flex items-center gap-1 text-sm">
            <p className="text-gray-400">Already have an account?</p>
            <Link href="/sign-in" className="text-lamaPurple">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-col gap-7 xl:w-1/2 px-10 xl:px-24 custom-scrollbar overflow-y-scroll py-12">
        <div className="flex-center flex-col gap-3 xl:hidden">
          <Image
            src="/logo.svg"
            alt="logo"
            width={100}
            height={100}
            quality={300}
          />

          <h1 className="text-primary text-2xl font-semibold">Create Your School Profile</h1>
        </div>

        <SchoolOnboardingForm />
      </div>
    </div>
  );
};

export default OnboardPage;
