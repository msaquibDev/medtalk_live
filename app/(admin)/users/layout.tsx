import type { ReactNode } from "react";
import { RegisteredUsersProvider } from "@/components/admin/RegisteredUsersProvider";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <RegisteredUsersProvider>{children}</RegisteredUsersProvider>;
}
