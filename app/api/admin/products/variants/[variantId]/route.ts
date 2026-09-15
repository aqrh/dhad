import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

type Context = {
  params: Promise<{
    variantId: string;
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
  { params }: Context
) {
  if (!API_URL) {
    return Response.json(
      { message: "API_URL is not configured" },
      { status: 500 }
    );
  }

  const token = await getToken();

  if (!token) {
    return Response.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { variantId } = await params;
  const body = await request.text();

  try {
    const response = await fetch(
      `${API_URL}/admin/products/variants/${variantId}`,
      {
        method: "PATCH",
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
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Context
) {
  if (!API_URL) {
    return Response.json(
      { message: "API_URL is not configured" },
      { status: 500 }
    );
  }

  const token = await getToken();

  if (!token) {
    return Response.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { variantId } = await params;

  try {
    const response = await fetch(
      `${API_URL}/admin/products/variants/${variantId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const responseBody =
      await response.text();

    return new Response(responseBody, {
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
      { status: 502 }
    );
  }
}