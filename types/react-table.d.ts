import "@tanstack/react-table";
import { RoleAccessLevel } from "@/types/index";

declare module "@tanstack/react-table" {
  interface ColumnMeta<_TData, TValue> {
    roles?: RoleAccessLevel[];
  }
}
