import NextAuth from "next-auth";
import { getDynamicAuthOptions } from "@lib/next-auth-options";

export async function auth(req, res) {
  const options = await getDynamicAuthOptions();
  // console.log("options", options);
  return NextAuth(req, res, options);
}

export const handler = auth;

export { handler as GET, handler as POST };
