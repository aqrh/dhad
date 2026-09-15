import {
  NextResponse,
} from "next/server";

const API_URL = process.env.API_URL;

type VerifyResponse = {
  accessToken?: unknown;

  user?: {
    id: number;
    phone: string | null;
    name: string | null;
    email: string | null;
  };
};

export async function POST(
  request: Request
) {
  if (!API_URL) {
    return NextResponse.json(
      {
        message:
          "API_URL is not configured",
      },
      {
        status: 500,
      }
    );
  }

  try {
    const body =
      await request.text();

    const backendResponse =
      await fetch(
        `${API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body,
          cache: "no-store",
        }
      );

    const data: VerifyResponse =
      await backendResponse
        .json()
        .catch(() => ({}));

    if (!backendResponse.ok) {
      return NextResponse.json(
        data,
        {
          status:
            backendResponse.status,
        }
      );
    }

    if (
      typeof data.accessToken !==
      "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Authentication server did not return a token",
        },
        {
          status: 502,
        }
      );
    }

    const response =
      NextResponse.json({
        user: data.user,
      });

    response.cookies.set({
      name: "auth_token",
      value: data.accessToken,

      httpOnly: true,
      sameSite: "lax",

      secure:
        process.env.NODE_ENV ===
        "production",

      path: "/",

      maxAge:
        60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Could not connect to authentication server",
      },
      {
        status: 502,
      }
    );
  }
}