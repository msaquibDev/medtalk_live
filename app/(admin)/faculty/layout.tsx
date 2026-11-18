import type { ReactNode } from "react";
import { FacultyManagementProvider } from "@/components/admin/FacultyManagementProvider";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return <FacultyManagementProvider>{children}</FacultyManagementProvider>;
}
