import {
  cookies,
} from "next/headers";

const API_URL =
  process.env.API_URL;


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

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "auth_token"
    )?.value;

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
      `${API_URL}/orders`,
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

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "content-type"
          ) ??
          "application/json",
      },
    });
  } catch {
    return Response.json(
      {
        message:
          "Could not connect to the order server",
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

  try {
    const body =
      await request.text();

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "auth_token"
      )?.value;

    const headers:
      Record<string, string> = {
        "Content-Type":
          "application/json",
      };

    /*
     * Signed-in checkout:
     * forward JWT to Nest.
     *
     * Guest checkout:
     * no Authorization header.
     */
    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response =
      await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",
          headers,
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
          "Could not connect to the order server",
      },
      {
        status: 502,
      }
    );
  }
}