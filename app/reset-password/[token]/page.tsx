import { AdminAuthForm } from "@/components/admin/AdminAuthForm";

export default async function ResetPasswordTokenPage({ params }: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  return <AdminAuthForm mode="reset" token={token} />;
}
