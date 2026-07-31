import { NextResponse } from "next/server";
import { getAuthToken } from "@lib/auth-server";
import { baseURL } from "@services/CommonService";

export async function GET() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Laravel's notifications endpoint (confirmed contract: GET /notifications
    // -> { data: [{ id, data: { message }, read_at, created_at }] }).
    const response = await fetch(`${baseURL}/notifications`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const payload = await response.json();
    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];
    const unreadCount = list.filter((n) => !n.read_at).length;

    return NextResponse.json({ unreadCount });
  } catch {
    return NextResponse.json({ unreadCount: 0 });
  }
}
