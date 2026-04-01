import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("RequireAuth", () => {
  it("redirects unauthenticated users to the login access window", async () => {
    mockFetchSequence(jsonResponse({ user: null }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: /hệ thống đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /khởi tạo phiên/i })).toBeInTheDocument();
  });
});
