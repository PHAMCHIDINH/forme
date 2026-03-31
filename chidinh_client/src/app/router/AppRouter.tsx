import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import { LoginPage } from "../../modules/auth/LoginPage";
import { RequireAuth } from "../../modules/auth/RequireAuth";
import { DashboardHomePage } from "../../modules/dashboard/DashboardHomePage";
import { DashboardLayout } from "../../modules/dashboard/DashboardLayout";
import { PortfolioPage } from "../../modules/portfolio/PortfolioPage";
import { TodoPage } from "../../modules/todo/TodoPage";

function NotFoundPage() {
  return (
    <main>
      <h1>Page Not Found</h1>
      <NavLink to="/">Back to Portfolio</NavLink>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<DashboardLayout />}>
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
