import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Context = {
  params: Promise<{
    imageId: string;
  }>;
};

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

  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value;

  if (!token) {
    return Response.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { imageId } = await params;

  try {
    const response = await fetch(
      `${API_URL}/admin/products/images/${imageId}`,
      {
        method: "DELETE",
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
  } catch (error) {
    console.error(
      "Admin image delete proxy failed:",
      error
    );

    return Response.json(
      { message: "Could not delete image" },
      { status: 502 }
    );
  }
}