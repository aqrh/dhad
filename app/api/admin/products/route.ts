import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

async function getToken() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    "auth_token"
  )?.value;
}

export async function GET() {
  if (!API_URL) {
    return Response.json(
      {
        message:
          "API_URL is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const token =
    await getToken();

  if (!token) {
    return Response.json(
      {
        message:
          "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const response =
      await fetch(
        `${API_URL}/admin/products`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

    const body =
      await response.text();

    return new Response(
      body,
      {
        status:
          response.status,

        headers: {
          "Content-Type":
            response.headers.get(
              "content-type"
            ) ??
            "application/json",
        },
      }
    );
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

export async function POST(
  request: Request
) {
  if (!API_URL) {
    return Response.json(
      {
        message:
          "API_URL is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const token =
    await getToken();

  if (!token) {
    return Response.json(
      {
        message:
          "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.text();

    const response =
      await fetch(
        `${API_URL}/admin/products`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body,

          cache: "no-store",
        }
      );

    const responseBody =
      await response.text();

    return new Response(
      responseBody,
      {
        status:
          response.status,

        headers: {
          "Content-Type":
            response.headers.get(
              "content-type"
            ) ??
            "application/json",
        },
      }
    );
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