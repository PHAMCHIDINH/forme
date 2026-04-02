import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import { LoginPage } from "../../modules/auth/LoginPage";
import { RequireAuth } from "../../modules/auth/RequireAuth";
import { DashboardHomePage } from "../../modules/dashboard/DashboardHomePage";
import { DashboardLayout } from "../../modules/dashboard/DashboardLayout";
import { PortfolioPage } from "../../modules/portfolio/PortfolioPage";
import { TodoPage } from "../../modules/todo/TodoPage";
import { APP_ROUTES } from "./routes";

export { APP_ROUTES } from "./routes";

function NotFoundPage() {
  return (
    <main>
      <h1>Page Not Found</h1>
      <NavLink to={APP_ROUTES.publicHome}>Back to Portfolio</NavLink>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={APP_ROUTES.publicHome} element={<PortfolioPage />} />
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path={APP_ROUTES.appRoot} element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="todo" element={<TodoPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
