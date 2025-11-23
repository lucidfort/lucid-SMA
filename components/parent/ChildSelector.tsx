"use client"

import { Student } from "@/lib/generated/graphql/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { UserAvatar } from "../shareable"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"

const ChildSelector = ({ students, selectedChild }: { students: Student[]; selectedChild?: string; }) => {
    const [selectedStudent, setSelectedStudent] = useState<string | undefined>(selectedChild || students?.[0].id)

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (selectedStudent) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("childId", selectedStudent);

            router.push(`?${params.toString()}`);
        }
    }, [router, selectedStudent, searchParams])

    const selected = students?.find(child => child.id === selectedStudent)

    return (
        <Select
            value={selectedStudent}
            onValueChange={(value) => {
                setSelectedStudent(value)
            }}
        >
            <SelectTrigger className="w-full rounded-md p-2 text-sm ring-[1.5px] ring-gray-300">
                <div>
                    {selected?.name} {selected?.surname} - {selected?.class.grade.name}
                </div>
            </SelectTrigger>
            <SelectContent>
                {students.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                img={child?.img}
                                name={child.name}
                            />
                            {child.name} - {child.class.grade.name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default ChildSelector