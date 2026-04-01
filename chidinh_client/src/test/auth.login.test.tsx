import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "../modules/auth/LoginPage";
import { createTestQueryClient, jsonResponse, mockFetchSequence, readJsonBody } from "./test-utils";

function renderLoginRoute() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<p>Private workspace</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  it("renders an access window that bridges into the workspace", () => {
    renderLoginRoute();

    expect(screen.getByRole("heading", { level: 1, name: /hệ thống đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /khởi tạo phiên/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /huỷ và trở lại/i })).toBeInTheDocument();
  });

  it("shows validation messages before submission", async () => {
    const user = userEvent.setup();

    renderLoginRoute();
    await user.click(screen.getByRole("button", { name: /khởi tạo phiên/i }));

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("submits credentials and lands in the private workspace", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    );
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText(/tài khoản/i), "ada");
    await user.type(screen.getByLabelText(/mật khẩu/i), "swordfish");
    await user.click(screen.getByRole("button", { name: /khởi tạo phiên/i }));

    expect(await screen.findByText("Private workspace")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/api/v1/auth/login");
    expect(readJsonBody(fetchMock.mock.calls[0][1])).toEqual({
      username: "ada",
      password: "swordfish",
    });
  });
});
