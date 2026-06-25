import { createBrowserRouter, redirect, Navigate } from "react-router";
import Login from "../pages/Login";
import StaffDashboard from "../pages/StaffDashboard";
import ApproverDashboard from "../pages/ApproverDashboard";
import RagSearch from "../pages/RagSearch";
import DocumentSummary from "../pages/DocumentSummary";
import DraftCreation from "../pages/DraftCreation";
import DraftView from "../pages/DraftView";
import DraftList from "../pages/DraftList";
import DocumentDetail from "../pages/DocumentDetail";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUserPage from "../pages/AdminUserPage";
import AdminDocuments from "../pages/AdminDocuments";
import UserCreate from "../pages/UserCreate";
import UserActivity from "../pages/UserActivity";
import MyPage from "../pages/MyPage";
import api from "../../lib/api";

const authLoader = async () => {
  try {
    const res = await api.get("/auth/me");
    const user = res.data;

    //    if (!user || !Array.isArray(user.roles)) {
    //      return redirect("/");
    //    }
    return null; // Auth successful, continue
  } catch (error) {
    return redirect("/"); // Auth failed, redirect to login
  }
};

const adminLoader = async () => {
  try {
    const res = await api.get("/auth/me");
    const user = res.data;

    // Check if user has the admin role
    if (!user.roles.includes("관리자")) {
      return redirect("/"); // Or a custom "403" page
    }
    return user; // Return data if authorized
  } catch (error) {
    return redirect("/"); // Not logged in, go to login
  }
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    loader: authLoader,
    children: [
      {
        path: "staff/dashboard",
        Component: StaffDashboard,
      },
      {
        path: "staff/dashboard/approver",
        element: <StaffDashboard userRole="결재권자 · 실무 담당자" showApproverMenu={true} showAdminMenu={true} />,
      },
      {
        path: "approver/dashboard",
        Component: ApproverDashboard,
      },
      {
        path: "rag-search",
        Component: RagSearch,
      },
      {
        path: "document-summary",
        Component: DocumentSummary,
      },
      {
        path: "draft/list",
        Component: DraftList,
      },
      {
        path: "draft/new",
        Component: DraftCreation,
      },
      {
        path: "draft/:id",
        Component: DraftCreation,
      },
      {
        path: "draft/view/:id",
        Component: DraftView,
      },
      {
        path: "document/:id",
        Component: DocumentDetail,
      },
      {
        path: "mypage",
        Component: MyPage,
      },
      {
        path: "/admin",
        loader: adminLoader,
        children: [
          {
            index: true,
            Component: AdminDashboard,
          },
          {
            path: "dashboard",
            Component: AdminDashboard,
          },
          {
            path: "users",
            Component: AdminUserPage,
          },
          {
            path: "users/create",
            Component: UserCreate,
          },
          {
            path: "users/:userId/activity",
            Component: UserActivity,
          },
          {
            path: "documents",
            Component: AdminDocuments,
          },
          {
            path: "activity",
            Component: UserActivity,
          }
        ]
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      }
    ]
  }
]);
