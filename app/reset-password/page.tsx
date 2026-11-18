import { AdminAuthForm } from "@/components/admin/AdminAuthForm";

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  return <AdminAuthForm mode="reset" token={token} />;
}
