import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { ActionArea, FormSection } from "../../shared/form-system/patterns";
import { ErrorText, HelperText, Label } from "../../shared/form-system/primitives";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Panel } from "../../shared/ui/Panel";
import { loginSchema, type LoginFormValues } from "./loginSchema";
import { useLogin } from "./useSession";

export function LoginPage() {
  const usernameErrorId = "login-username-error";
  const usernameHelperId = "login-username-helper";
  const passwordErrorId = "login-password-error";
  const passwordHelperId = "login-password-helper";
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

  const activeTheme = typeof document === "undefined" ? "light" : document.documentElement.dataset.theme ?? "light";

  return (
    <main
      className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10"
      data-slot="login-page"
      data-theme={activeTheme}
    >
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]" data-testid="login-shell-grid">
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
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormSection
              className="space-y-0 border-0 bg-transparent p-0 shadow-none"
              body={
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      autoComplete="username"
                      aria-describedby={errors.username ? `${usernameHelperId} ${usernameErrorId}` : usernameHelperId}
                      aria-invalid={errors.username ? "true" : undefined}
                      {...register("username")}
                    />
                    <HelperText id={usernameHelperId}>
                      Use your workspace handle, not your public display name, so access stays tied to
                      the correct workspace.
                    </HelperText>
                    {errors.username ? (
                      <ErrorText id={usernameErrorId}>
                        {errors.username.message}
                      </ErrorText>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      aria-describedby={errors.password ? `${passwordHelperId} ${passwordErrorId}` : passwordHelperId}
                      aria-invalid={errors.password ? "true" : undefined}
                      {...register("password")}
                    />
                    <HelperText id={passwordHelperId}>
                      Use the same password you configured for the private workspace.
                    </HelperText>
                    {errors.password ? (
                      <ErrorText id={passwordErrorId}>
                        {errors.password.message}
                      </ErrorText>
                    ) : null}
                  </div>

                  {loginMutation.isError ? (
                    <ErrorText>Invalid credentials. Please try again.</ErrorText>
                  ) : null}
                </div>
              }
              actions={
                <ActionArea
                  className="[&>[data-slot=action-area-primary]]:w-full"
                  data-testid="form-action-area"
                  primary={
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={loginMutation.isPending}
                      pending={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Opening Workspace..." : "Enter Workspace"}
                    </Button>
                  }
                />
              }
            />
          </form>
        </Panel>
      </div>
    </main>
  );
}
