"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="from-background to-background relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-blue-50/30">
      {/* Ambient floating shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute top-[20%] left-[10%] h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-float-delayed bg-primary/10 absolute top-[40%] right-[15%] h-40 w-40 rounded-full blur-3xl" />
        <div className="animate-float-slow absolute bottom-[30%] left-[20%] h-36 w-36 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="animate-float bg-primary/15 absolute right-[25%] bottom-[20%] h-28 w-28 rounded-full blur-3xl" />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 px-4">
        <div className="absolute inset-0 flex h-64 w-64 items-center justify-center">
          <Image
            src={"/logo.webp"}
            alt="Eduvia"
            width={700}
            height={300}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.15);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
