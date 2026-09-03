import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api";

const mockFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })),
    ),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch(200, { articles: [] });
    await expect(apiFetch("/api/articles?filter=featured")).resolves.toEqual({ articles: [] });
  });

  it("maps error bodies onto ApiError with status and code", async () => {
    mockFetch(409, { error: "Already subscribed", code: "23505" });
    const err = await apiFetch("/api/newsletter", { method: "POST", body: "{}" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).code).toBe("23505");
  });

  it("falls back to a generic message for non-JSON errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("boom", { status: 500 }))),
    );
    const err = await apiFetch("/api/health").catch((e) => e);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).message).toContain("500");
  });

  it("sends JSON content type when a body is present", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })),
    );
    vi.stubGlobal("fetch", fetchMock);
    await apiFetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email: "a@b.co" }) });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } }),
    );
  });
});
