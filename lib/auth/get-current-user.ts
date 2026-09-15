import { cookies } from "next/headers";

export type CurrentUser = {
  id: number;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: string;
};

const API_URL = process.env.API_URL;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to get current user: ${response.status}`
    );
  }

  return response.json();
}