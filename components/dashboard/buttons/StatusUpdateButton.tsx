import {
  ActivateAcademicYearMutation,
  ActivateTermMutation,
  useActivateAcademicYearMutation,
  useActivateTermMutation,
  useUpdateGradeStatusMutation,
  useUpdateProgramStatusMutation,
} from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils/client.utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  type: "activate" | "deactivate";
  table: "term" | "academic-year" | "grade" | "program";
  id: string;
  academicYearId?: string;
}
const StatusUpdateButton = ({ type, table, id, academicYearId }: Props) => {
  const router = useRouter();

  const [{ fetching: activatingTerm }, updateTerm] = useActivateTermMutation();
  const [{ fetching: activatingYear }, updateAcademicYear] =
    useActivateAcademicYearMutation();
  const [{ fetching: updatingProgram }, updateProgram] =
    useUpdateProgramStatusMutation();
  const [{ fetching: updatingGrade }, updateGrade] =
    useUpdateGradeStatusMutation();

  const handleClick = async () => {
    const response =
      table === "term"
        ? await updateTerm({ termId: id, academicYearId: academicYearId! })
        : table === "academic-year"
          ? await updateAcademicYear({ academicYearId: id })
          : table === "grade"
            ? await updateGrade({ id, isActive: type === "activate" })
            : await updateProgram({ id, isActive: type === "activate" });

    const mutationResult =
      table === "term"
        ? (response.data as ActivateTermMutation)?.activateTerm
        : (response.data as ActivateAcademicYearMutation)?.activateAcademicYear;

    if (!mutationResult) {
      toast.error("Failed to activate ", { richColors: true });
      return;
    }

    if (
      mutationResult.__typename === "MutationActivateAcademicYearSuccess" ||
      mutationResult.__typename === "MutationActivateTermSuccess"
    ) {
      toast.success(`${table} ${type}d successfully!`);
      router.refresh();
    } else {
      const error = handleGraphqlClientErrors(mutationResult);
      toast.error(error ?? "Something went wrong");
    }
  };

  const isLoading =
    activatingTerm || activatingYear || updatingProgram || updatingGrade;

  return (
    <button
      className="cursor-pointer border-none bg-transparent pb-1 pl-2 text-sm"
      onClick={handleClick}
    >
      {isLoading ? "Updating..." : "Set to Current"}
    </button>
  );
};

export default StatusUpdateButton;
