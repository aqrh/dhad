export type AuthUser = {
  id: number;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: string;
};

export type RequestOtpResult = {
  success: boolean;
  expiresInSeconds: number;

  // Development only.
  devCode?: string;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
};

export async function updateProfile(
  input: UpdateProfileInput
): Promise<AuthUser> {
  const response = await fetch(
    "/api/auth/me",
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not update profile"
      )
    );
  }

  return data;
}

export async function requestOtp(
  phone: string
): Promise<RequestOtpResult> {
  const response = await fetch(
    "/api/auth/request-otp",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        phone,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not send verification code"
      )
    );
  }

  return data;
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{
  user: AuthUser;
}> {
  const response = await fetch(
    "/api/auth/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        phone,
        code,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Invalid verification code"
      )
    );
  }

  return data;
}

function getErrorMessage(
  data: unknown,
  fallback: string
) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("message" in data)
  ) {
    return fallback;
  }

  const message = (
    data as {
      message?: unknown;
    }
  ).message;

  if (
    typeof message === "string"
  ) {
    return message;
  }

  if (Array.isArray(message)) {
    return message
      .filter(
        (value): value is string =>
          typeof value === "string"
      )
      .join(", ");
  }

  return fallback;
}