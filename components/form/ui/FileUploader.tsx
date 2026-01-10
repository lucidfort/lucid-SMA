"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Controller, Path } from "react-hook-form";
import { cn } from "@/lib/utils/client.utils";

interface FileUploaderProps<T> {
  folder: string;
  control: any;
  name: Path<T>;
  label: string;
  containerClassname?: string;
}

function FileUploader<T>({
  folder,
  control,
  name,
  label,
  containerClassname,
}: FileUploaderProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const img: any = field.value;

        return (
          <CldUploadWidget
            uploadPreset="school-manager"
            options={{
              folder: `schools/${folder}`,
            }}
            onSuccess={(result, { widget }) => {
              if (typeof result.info !== "string") {
                field.onChange(result.info?.secure_url);
              } else {
                field.onChange(result.info);
              }

              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div
                  className={cn(
                    "flex w-full flex-col gap-4",
                    containerClassname,
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                >
                  <div className="text-sm font-medium text-gray-700">
                    {label}
                  </div>

                  {img ? (
                    <div className="flex-center w-fit cursor-pointer rounded-md border-2 border-dashed border-gray-300">
                      <CldImage
                        width="200"
                        height="300"
                        src={img}
                        alt="profile photo"
                        className="max-h-64 w-auto rounded-md object-center"
                      />
                    </div>
                  ) : (
                    <div className="flex-center w-full cursor-pointer gap-2 rounded-md border-2 border-dashed border-gray-300 py-8 text-xs text-gray-500">
                      <Image
                        src="/upload.svg"
                        alt="upload"
                        width={28}
                        height={28}
                      />
                      <span>Upload a photo</span>
                    </div>
                  )}
                </div>
              );
            }}
          </CldUploadWidget>
        );
      }}
    />
  );
}
export default FileUploader;
