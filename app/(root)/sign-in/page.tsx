import SigninForm from '@/components/forms/SigninForm'
import Image from 'next/image'

const SignInPage = () => {
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
        </div>
      </div>

      <div className="flex h-full w-full flex-col gap-7 justify-center xl:w-1/2 px-10 xl:px-24">
        <div className="flex-center flex-col gap-3">
          <Image
            src="/logo.svg"
            alt="logo"
            width={100}
            height={100}
            quality={300}
          />

          <h1 className="text-primary text-2xl font-semibold">Log In Your Account</h1>
        </div>

        <SigninForm />
      </div>
    </div>
  )
}

export default SignInPage