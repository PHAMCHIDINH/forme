import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

type JsonEnvelope = {
  data: unknown;
  error: { code: string; message: string } | null;
};

type JsonResponseOptions = {
  error?: JsonEnvelope["error"];
  status?: number;
};

type FetchReply = Response | ((request: Request) => Response | Promise<Response>);

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(ui: ReactElement, route = "/") {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

export function jsonResponse(data: unknown, { error = null, status = 200 }: JsonResponseOptions = {}) {
  return new Response(JSON.stringify({ data, error }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function mockFetchSequence(...responses: FetchReply[]) {
  const queue = [...responses];

  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    const next = queue.shift();

    if (!next) {
      throw new Error(`Unexpected fetch: ${request.method} ${new URL(request.url).pathname}`);
    }

    return typeof next === "function" ? next(request) : next;
  });
}

export function readJsonBody(init?: RequestInit) {
  if (!init?.body) {
    return undefined;
  }

  return JSON.parse(String(init.body)) as Record<string, unknown>;
}

export function renderWithQueryClient(ui: ReactNode) {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
}

export function setDocumentTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
}

export function clearDocumentTheme() {
  delete document.documentElement.dataset.theme;
}
