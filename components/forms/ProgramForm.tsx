import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import InputField, { FormFieldType } from "@/components/InputField";
import { gradeMap } from "@/constants";
import { FormProps } from "@/types";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  ProgramName,
  useCreateProgramMutation,
  useGetProgramsQuery,
} from "@/lib/generated/graphql/client";
import { useEffect } from "react";
import { programSchema, ProgramSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ProgramForm = ({ type, setOpen }: FormProps) => {
  const router = useRouter();
  const form = useForm<ProgramSchema>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      grades: [],
    },
  });
  const [programsQueryResult] = useGetProgramsQuery();
  const [programsMutationResult, createProgram] = useCreateProgramMutation();

  const selectedProgram = form.watch("name");

  useEffect(() => {
    const selectedProgram = form.getValues("name");
    const selectedGrades = form.getValues("grades");

    const allowedGrades = gradeMap[selectedProgram];

    const filteredGrades = selectedGrades.filter((grade) =>
      allowedGrades.includes(grade),
    );

    if (filteredGrades.length !== selectedGrades.length) {
      form.setValue("grades", filteredGrades, { shouldValidate: true });
    }
  }, [selectedProgram, form]);

  const allPossiblePrograms = Object.keys(gradeMap);
  const registeredPrograms = programsQueryResult.data?.programs?.map(
    (program) => program.name,
  );

  const availableGrades = gradeMap[selectedProgram]?.map((grade) => ({
    id: grade,
    name: grade,
  }));

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await createProgram({ input: values });

    const typeName = response.data?.createProgram?.__typename;
    if (typeName === "MutationCreateProgramSuccess") {
      toast.success(`Program created successfully!`);
      setOpen(false);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(typeName);
      toast.error(error ?? "Something went wrong");
    }
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            label="Program"
            name="name"
            placeholder="Choose the program"
            containerClassName={"md:w-full"}
          >
            <SelectContent>
              {allPossiblePrograms.map((program) => (
                <SelectItem
                  key={program}
                  value={program}
                  disabled={registeredPrograms?.includes(
                    program as ProgramName,
                  )}
                >
                  {program}
                </SelectItem>
              ))}
            </SelectContent>
          </InputField>

          <InputField
            control={form.control}
            fieldType={FormFieldType.MULTI_SELECT}
            label="Grade"
            name="grades"
            placeholder="Select a grade"
            containerClassName={"md:w-full"}
            options={availableGrades}
          />
        </div>

        <button
          type="submit"
          disabled={programsMutationResult.fetching}
          className="form-submit_btn"
        >
          {!programsMutationResult.fetching ? (
            type
          ) : (
            <Loader2 className="animate-spin text-lamaYellow" />
          )}
        </button>
      </form>
    </Form>
  );
};
export default ProgramForm;
