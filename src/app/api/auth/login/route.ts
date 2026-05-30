import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl =
      process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl)
      return NextResponse.json(
        { error: "BACKEND_URL not configured" },
        { status: 500 },
      );

    const response = await fetch(`${backendUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data?.accessToken) {
      return NextResponse.json(
        { error: data?.message ?? "Invalid credentials" },
        { status: 401 },
      );
    }

    // set httpOnly cookie
    (await cookies()).set({
      name: "mf_token",
      value: data.accessToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
