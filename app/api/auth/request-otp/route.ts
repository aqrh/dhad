const API_URL = process.env.API_URL;

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

    const response = await fetch(
      `${API_URL}/auth/request-otp`,
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

    const data =
      await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          "application/json",
      },
    });
  } catch {
    return Response.json(
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