import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import ScannerLayout from "@/components/layout/ScannerLayout";

// Pages — lazy loaded
import { lazy, Suspense } from "react";
import { Spin } from "antd";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const MembersPage = lazy(() => import("@/features/members/MembersPage"));
const MemberDetailPage = lazy(
  () => import("@/features/members/MemberDetailPage"),
);
const ClubsPage = lazy(() => import("@/features/clubs/ClubsPage"));
const CompetitionsPage = lazy(
  () => import("@/features/competitions/CompetitionsPage"),
);
const CompetitionDetailPage = lazy(
  () => import("@/features/competitions/CompetitionDetailPage"),
);
const ScannerPage = lazy(() => import("@/features/scanner/ScannerPage"));

// ─── Guards ───────────────────────────────────────────────────────────────────
function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
function Page({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <Page>
          <LoginPage />
        </Page>
      </RedirectIfAuth>
    ),
  },
  {
    path: "/scanner",
    element: (
      <RequireAuth roles={["scanner", "super_admin", "federation_admin"]}>
        <ScannerLayout>
          <Page>
            <ScannerPage />
          </Page>
        </ScannerLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/",
    element: (
      <RequireAuth roles={["super_admin", "federation_admin", "club_manager"]}>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <Page>
            <DashboardPage />
          </Page>
        ),
      },
      {
        path: "members",
        element: (
          <Page>
            <MembersPage />
          </Page>
        ),
      },
      {
        path: "members/:id",
        element: (
          <Page>
            <MemberDetailPage />
          </Page>
        ),
      },
      {
        path: "clubs",
        element: (
          <RequireAuth roles={["super_admin", "federation_admin"]}>
            <Page>
              <ClubsPage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: "competitions",
        element: (
          <Page>
            <CompetitionsPage />
          </Page>
        ),
      },
      {
        path: "competitions/:id",
        element: (
          <Page>
            <CompetitionDetailPage />
          </Page>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
