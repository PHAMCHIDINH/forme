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
          <Route path="/app" element={<p>Private dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  it("shows validation messages before submission", async () => {
    const user = userEvent.setup();

    renderLoginRoute();
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveAttribute(
      "aria-describedby",
      "login-username-error",
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "aria-describedby",
      "login-password-error",
    );
  });

  it("submits credentials and navigates to the private app", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    );
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText(/username/i), "ada");
    await user.type(screen.getByLabelText(/password/i), "swordfish");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/api/v1/auth/login");
    expect(readJsonBody(fetchMock.mock.calls[0][1])).toEqual({
      username: "ada",
      password: "swordfish",
    });
  });

  it("shows a pending submit state while login is in flight", async () => {
    let resolveLogin: ((response: Response) => void) | undefined;
    mockFetchSequence(
      () =>
        new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        }),
    );
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText(/username/i), "ada");
    await user.type(screen.getByLabelText(/password/i), "swordfish");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByRole("button", { name: /opening workspace/i })).toBeDisabled();

    resolveLogin?.(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    );

    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
  });

  it("shows invalid credential feedback as an alert", async () => {
    mockFetchSequence(
      jsonResponse(
        null,
        {
          error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
          status: 401,
        },
      ),
    );
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText(/username/i), "ada");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(/invalid credentials/i);
  });
});
