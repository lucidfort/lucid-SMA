"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { ExamType } from "@/lib/generated/graphql/client";

interface ExamResult {
  studentName: string;
  studentRegNo: string;
  studentScore: number;
}

interface Props {
  results: ExamResult[];
  context: {
    subject: string;
    grade: string;
    maxScore: number;
    term: number;
    academicYear: string;
    date: Date;
    examType?: ExamType;
  };
  passMarkPercentage?: number; // defaults to 50%
}

const ExportExamResultsButton = ({
  results,
  context,
  passMarkPercentage = 50,
}: Props) => {
  const handleExport = () => {
    if (!results.length) {
      toast.error("No results to export");
      return;
    }

    const headerRows = [
      ["Subject:", context.subject],
      ["Type:", context.examType],
      ["Grade:", context.grade],
      ["Academic Year:", context.academicYear],
      ["Term:", context.term],
      ["Exam Date:", context.date],
      ["Max Score:", context.maxScore],
      [], // empty row for spacing
    ];

    // Build rows with derived data
    const data = results.map((r, index) => {
      const percentage = (r.studentScore / context.maxScore) * 100;
      const status = percentage >= passMarkPercentage ? "Pass" : "Fail";

      return {
        "#": index + 1,
        Name: r.studentName,
        "Registration No": r.studentRegNo,
        Score: r.studentScore,
        "Percentage (%)": percentage.toFixed(2),
        Status: status,
      };
    });

    // Convert header rows to a sheet
    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    // Append the main table below the header
    XLSX.utils.sheet_add_json(ws, data, { origin: headerRows.length });

    // Create the workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    // Write file
    const fileName = `${context?.examType ? `$context.examType}_` : ""}${context.subject}_Exam_Results_${context.grade}.xlsx`;

    XLSX.writeFile(wb, fileName);

    toast.success("Exam results exported!");
  };

  return (
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
};

export default ExportExamResultsButton;
