import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Context
) {
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

  const { id } = await params;
  const body = await request.text();

  try {
    const response = await fetch(
      `${API_URL}/admin/products/${id}/images`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body,
        cache: "no-store",
      }
    );

    const responseBody =
      await response.text();

    return new Response(responseBody, {
      status: response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "content-type"
          ) ?? "application/json",
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