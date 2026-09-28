import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NEXT_PUBLIC_ENABLE_DEV_OTP ===
      "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}