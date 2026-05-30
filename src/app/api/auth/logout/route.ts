import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
     (await cookies()).set({ name: "mf_token", value: "", maxAge: 0, path: "/" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
