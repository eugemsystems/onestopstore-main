import { redirect } from "next/navigation";

export default async function LoginRedirect({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(`/auth/login${qs ? `?${qs}` : ""}`);
}
