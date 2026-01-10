import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex-center relative h-[90vh] w-full flex-col gap-5">
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p className="text-xl text-gray-600">Teacher Not Found</p>
      <Button asChild>
        <Link href="/list/staffs" className="bg-lamaYellow text-black">
          Go Back
        </Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
