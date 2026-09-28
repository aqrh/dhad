import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (!API_URL) {
    return Response.json(
      {
        message: "API_URL is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get("auth_token")?.value;

  if (!token) {
    return Response.json(
      {
        message: "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/admin/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

    const body = await response.text();

    return new Response(body, {
      status: response.status,

      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "application/json",
      },
    });
  } catch {
    return Response.json(
      {
        message:
          "Could not connect to admin server",
      },
      {
        status: 502,
      }
    );
  }
}