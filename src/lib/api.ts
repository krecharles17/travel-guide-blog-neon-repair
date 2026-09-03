export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Thin fetch wrapper for the server-side API. Errors carry HTTP status and Postgres code. */
export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(path, {
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
  } catch {
    throw new ApiError("Network error — the API is unreachable", 0);
  }
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let code: string | undefined;
    try {
      const data = (await res.json()) as { error?: string; code?: string };
      if (data?.error) message = data.error;
      code = data?.code;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new ApiError(message, res.status, code);
  }
  return (await res.json()) as T;
};
