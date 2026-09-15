import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getToken() {
  const cookieStore = await cookies();

  return cookieStore.get(
    "auth_token"
  )?.value;
}

export async function PATCH(
  request: Request,
  { params }: Props
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

  const { id } = await params;
  const token = await getToken();

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

    const response = await fetch(
      `${API_URL}/addresses/${id}`,
      {
        method: "PATCH",
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
        status: response.status,
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
          "Could not connect to address server",
      },
      {
        status: 502,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Props
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

  const { id } = await params;
  const token = await getToken();

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
    const response = await fetch(
      `${API_URL}/addresses/${id}`,
      {
        method: "DELETE",
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
          "Could not connect to address server",
      },
      {
        status: 502,
      }
    );
  }
}