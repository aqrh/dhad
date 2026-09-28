import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    "auth_token"
  )?.value;
}

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Context
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

  const { id } =
    await params;

  const body =
    await request.text();

  try {
    const response =
      await fetch(
        `${API_URL}/admin/products/${id}`,
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

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } = await params;

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "auth_token",
    )?.value;

  if (!token) {
    return NextResponse.json(
      {
        message:
          "Not authenticated",
      },
      {
        status: 401,
      },
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      cache: "no-store",
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  return NextResponse.json(
    data ?? {},
    {
      status: response.status,
    },
  );
}