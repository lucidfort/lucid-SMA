"use client";

import React, { useState } from "react";

import InputField, { FormFieldType } from "@/components/form/ui/InputField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AccessLevel,
  useGetParentsQuery,
  useGetStaffsQuery,
  useGetStudentsQuery,
} from "@/lib/generated/graphql/client";
import { cn } from "@/lib/utils/client.utils";
import { Loader2, Search, X } from "lucide-react";
import { useController } from "react-hook-form";
import { Label } from "../ui/label";

type UserSearchProps = {
  type: "parent" | "student" | "staff";
  label: string;
  control: any;
  name: string;
  containerClassname?: string;
  filters?: {
    classId?: string;
    grades?: string[];
    accessLevel?: AccessLevel;
  };
};

const UserSearchForm = ({
  type,
  label,
  name,
  control,
  containerClassname,
  filters,
}: UserSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { classId, grades, accessLevel } = filters ?? {};

  const [students, rerunStudentsQuery] = useGetStudentsQuery({
    pause: true,
    variables: {
      filter: {
        searchTerm,
        classId,
        ...(grades && grades.length > 0 && { grades }),
      },
    },
  });

  const [parents, rerunParentsQuery] = useGetParentsQuery({
    pause: true,
    variables: { filter: { searchTerm } },
  });

  const [staffs, rerunStaffsQuery] = useGetStaffsQuery({
    pause: true,
    variables: {
      filter: {
        searchTerm,
        isActive: true,
        accessLevel,
      },
    },
  });

  const isFetching = students.fetching || parents.fetching || staffs.fetching;
  const results =
    students.data?.students ||
    parents.data?.parents ||
    staffs.data?.staffs ||
    [];

  const {
    field: { value, onChange },
  } = useController({ name, control });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!searchTerm) return;

    if (type === "student") {
      rerunStudentsQuery();
    } else if (type === "parent") {
      rerunParentsQuery();
    } else {
      rerunStaffsQuery();
    }
  };

  const handleUserSelect = (user: { id: string; name: string }) => {
    onChange(user);
    setOpen(false);
  };

  const handleRemoveUser = (e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger
        className={cn(
          "relative flex w-full items-center gap-2",
          containerClassname,
        )}
      >
        <InputField
          control={control}
          fieldType={FormFieldType.INPUT}
          label={label}
          name={name}
          inputProps={{ readOnly: true }}
          containerClassName={cn("!w-full", containerClassname)}
        />

        {value && value?.id !== "" && (
          <X
            className="absolute top-3/4 right-2 h-5 w-5 -translate-y-3/4 cursor-pointer rounded-full bg-gray-200 p-1 hover:bg-gray-300"
            onClick={handleRemoveUser}
          />
        )}
      </DialogTrigger>
      <DialogContent
        overlayClassName="bg-black/50"
        className="z-[9999] border border-gray-600 px-2 sm:max-w-lg"
        forceMount
      >
        <DialogHeader>
          <DialogTitle className="capitalize">Find {type}</DialogTitle>
          <DialogDescription className="sr-only">
            Search for a {type} by entering a name
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="searchTerm" className="sr-only">
              Search
            </Label>
            <Input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>

          <Button type="submit" disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <DialogFooter
          className={cn(
            "custom-scrollbar mt-4 max-h-[10rem] overflow-y-scroll rounded-md bg-transparent p-2",
            {
              "bg-lamaSkyLight shadow-sm shadow-gray-300": results?.length > 0,
            },
          )}
        >
          {results?.length === 0 ? (
            <p className="text-center">No result</p>
          ) : (
            results?.map(({ id, name, surname }, index: number) => (
              <div
                key={id}
                className={cn(
                  "hover:bg-lamaSky/35 w-full cursor-pointer rounded-sm p-1",
                  {
                    "border-b border-black":
                      index % 2 === 0 && results?.length > 1,
                  },
                )}
                onClick={() =>
                  handleUserSelect({
                    id: id!,
                    name: `${name} ${surname}`,
                  })
                }
              >
                {name} {surname}
              </div>
            ))
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(UserSearchForm);
