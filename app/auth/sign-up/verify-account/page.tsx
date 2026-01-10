import OTPForm from "@/components/form/ui/OTPForm";
import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const VerifySignupPage = async () => {
  const user = await currentUser();

  // Not logged in -> kick them out
  if (!user) {
    redirect("/auth/sign-in");
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  );

  // Already verified -> they have no business being here
  if (primaryEmail?.verification?.status === "verified") {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col items-center gap-7 px-5">
      <Link href="/">
        <Image
          src="/logo.webp"
          alt="logo"
          width={200}
          height={200}
          quality={300}
        />
      </Link>

      <h1 className="text-primary text-2xl font-semibold">
        Enter your verification code
      </h1>

      <OTPForm />
    </div>
  );
};
export default VerifySignupPage;
