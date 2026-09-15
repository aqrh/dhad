export type Address = {
  id: number;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressInput = {
  label?: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
};

export type UpdateAddressInput = {
  label?: string;
  fullName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  address?: string;
  notes?: string;
};


export async function getAddresses(): Promise<
  Address[]
> {
  const response = await fetch(
    "/api/addresses",
    {
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not load addresses"
      )
    );
  }

  return data;
}

export async function createAddress(
  input: CreateAddressInput
): Promise<Address> {
  const response = await fetch(
    "/api/addresses",
    {
      method: "POST",
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
        "Could not save address"
      )
    );
  }

  return data;
}

export async function deleteAddress(
  id: number
) {
  const response = await fetch(
    `/api/addresses/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not delete address"
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

  if (typeof message === "string") {
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

export async function updateAddress(
  id: number,
  input: UpdateAddressInput
): Promise<Address> {
  const response = await fetch(
    `/api/addresses/${id}`,
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
        "Could not update address"
      )
    );
  }

  return data;
}