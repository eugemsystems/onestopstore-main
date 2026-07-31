import { redirect } from "next/navigation";

export default async function RegisterRedirect({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(`/auth/signup${qs ? `?${qs}` : ""}`);
}
