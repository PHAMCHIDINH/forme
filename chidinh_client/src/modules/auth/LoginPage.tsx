import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { loginSchema, type LoginFormValues } from "./loginSchema";
import { useLogin } from "./useSession";

import { Button } from "../../shared/ui/Button";

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
        productLabel="Hệ Thống Đăng Nhập"
        contextLabel="Yêu Cầu Xác Thực"
        indicators={["ACCESS_CONTROL"]}
      />

      <div className="flex flex-1 items-center justify-center">
        <WindowFrame
          title="Cổng Truy Cập Server"
          subtitle="Cung Cấp Thông Tin Định Danh"
          className="w-full max-w-lg"
        >
          <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="font-head block text-sm uppercase text-foreground" htmlFor="username">Tài Khoản</label>
              <input 
                id="username" 
                className="w-full p-3 font-sans border-2 border-border shadow-sm text-lg" 
                autoComplete="username" 
                {...register("username")} 
              />
              {errors.username ? (
                <p className="font-bold text-sm text-destructive">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-head block text-sm uppercase text-foreground" htmlFor="password">Mật Khẩu</label>
              <input
                id="password"
                type="password"
                className="w-full p-3 font-sans border-2 border-border shadow-sm text-lg"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="font-bold text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {loginMutation.isError ? (
              <div className="p-3 bg-destructive text-destructive-foreground border-2 border-border font-bold">
                TỪ CHỐI TRUY CẬP. VUI LÒNG THỬ LẠI.
              </div>
            ) : null}

            <div className="pt-4 flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full text-base py-4"
              >
                {loginMutation.isPending ? "Đang Xác Nhận..." : "Khởi Tạo Phiên"}
              </Button>

              <Link
                className="inline-flex justify-center text-sm font-bold uppercase text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                to="/"
              >
                Huỷ và Trở Lại
              </Link>
            </div>
          </form>
        </WindowFrame>
      </div>
    </main>
  );
}
