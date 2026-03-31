import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLogin } from "./useSession";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
      navigate("/app");
    } catch (error) {
      // Error is rendered from mutation state below.
    }
  };

  return (
    <main>
      <h1>Sign In</h1>
      <p>Sign in to access your private workspace.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>
      {loginMutation.isError ? <p>Invalid credentials. Please try again.</p> : null}
      <Link to="/">Back to Portfolio</Link>
    </main>
  );
}
