import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { loginSchema, type LoginFormValues } from "./loginSchema";
import { useLogin } from "./useSession";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate("/app");
    } catch {
      // Error is rendered from mutation state below.
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Workspace Access"
        indicators={["Private System", "Warm macOS"]}
      />

      <div className="flex flex-1 items-center justify-center">
        <WindowFrame
          title="Workspace Access"
          subtitle="Bridge into the private machine"
          className="w-full max-w-2xl"
        >
          <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              <input id="username" autoComplete="username" {...register("username")} />
              {errors.username ? (
                <p className="text-sm text-red-700">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-red-700">{errors.password.message}</p>
              ) : null}
            </div>

            {loginMutation.isError ? (
              <p className="text-sm text-red-700">Invalid credentials. Please try again.</p>
            ) : null}

            <button
              className="desktop-submit inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Opening Workspace..." : "Enter Workspace"}
            </button>

            <Link
              className="inline-flex text-sm text-muted underline-offset-4 hover:underline"
              to="/"
            >
              Back to Public Desktop
            </Link>
          </form>
        </WindowFrame>
      </div>
    </main>
  );
}
