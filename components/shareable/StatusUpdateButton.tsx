import { ActivateAcademicYearMutation, ActivateTermMutation, useActivateAcademicYearMutation, useActivateTermMutation } from "@/lib/generated/graphql/client";
import { handleGraphqlClientErrors } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
    type: "activate" | "deactivate";
    field: "term" | "academic-year"
    id: string;
    academicYearId?: string;
}
const StatusUpdateButton = ({ type, field, id, academicYearId }: Props) => {
    const [, updateTerm] = useActivateTermMutation()
    const [, updateAcademicYear] = useActivateAcademicYearMutation()

    const handleClick = async () => {
        const response = field === "term"
            ? await updateTerm({ termId: id, academicYearId: academicYearId! })
            : await updateAcademicYear({ academicYearId: id })

        const mutationResult = field === "term"
            ? (response.data as ActivateTermMutation)?.activateTerm
            : (response.data as ActivateAcademicYearMutation)?.activateAcademicYear

        if (!mutationResult) {
            toast.error("Failed to activate ", { richColors: true });
            return;
        }

        if (mutationResult.__typename === "MutationActivateAcademicYearSuccess" || mutationResult.__typename === "MutationActivateTermSuccess") {
            toast.success(`${field} ${type}d successfully!`);
        } else {
            const error = handleGraphqlClientErrors(mutationResult);
            toast.error(error ?? "Something went wrong");
        }
    }

    return (
        <button
            className="bg-transparent px-2 border-none"
            onClick={handleClick}
        >Set to Current</button>
    )
}

export default StatusUpdateButton