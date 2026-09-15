import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

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

  try {
    const formData =
      await request.formData();

    const response = await fetch(
      `${API_URL}/admin/products/${id}/images/upload`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,

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
  } catch (error) {
    console.error(
      "Admin image upload proxy failed:",
      error
    );

    return Response.json(
      {
        message:
          "Could not upload image",
      },
      {
        status: 502,
      }
    );
  }
}