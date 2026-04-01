import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchSession, login, logout } from "./api";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session"] });
    },
  });
}
