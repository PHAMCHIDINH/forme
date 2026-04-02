import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../shared/ui/Button";
import { Field, FieldLabel, FieldMessage } from "../../shared/ui/Field";
import { Input } from "../../shared/ui/Input";
import { Panel } from "../../shared/ui/Panel";
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
    } catch (error) {
      // Error is rendered from mutation state below.
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel className="p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Private Hub</p>
          <h1 className="mt-4 font-display text-4xl text-text">Enter Workspace</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Sign in to access the operational side of the hub and manage active workflows.
          </p>
          <Link
            className="mt-6 inline-flex text-sm text-accent underline-offset-4 hover:underline"
            to="/"
          >
            Back to Public Hub
          </Link>
        </Panel>

        <Panel className="p-8 lg:p-10">
          <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" autoComplete="username" {...register("username")} />
              {errors.username ? (
                <FieldMessage tone="error">{errors.username.message}</FieldMessage>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <FieldMessage tone="error">{errors.password.message}</FieldMessage>
              ) : null}
            </Field>

            {loginMutation.isError ? (
              <FieldMessage tone="error">Invalid credentials. Please try again.</FieldMessage>
            ) : null}

            <Button
              className="w-full"
              type="submit"
              disabled={loginMutation.isPending}
              pending={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Opening Workspace..." : "Enter Workspace"}
            </Button>
          </form>
        </Panel>
      </div>
    </main>
  );
}
