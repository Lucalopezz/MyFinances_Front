import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("mf_token")?.value ?? null;
    if (!token) return NextResponse.json(null, { status: 401 });
    return NextResponse.json({ jwt: token });
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}
