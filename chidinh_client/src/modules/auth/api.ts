import { apiRequest } from "../../shared/api/client";

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
};

export async function login(username: string, password: string) {
  return apiRequest<{ user: SessionUser }>("/api/v1/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function logout() {
  return apiRequest<{ success: boolean }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function fetchSession() {
  return apiRequest<{ user: SessionUser }>("/api/v1/auth/me");
}
