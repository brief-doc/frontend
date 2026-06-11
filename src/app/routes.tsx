import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import ApproverDashboard from "./pages/ApproverDashboard";
import RagSearch from "./pages/RagSearch";
import DocumentSummary from "./pages/DocumentSummary";
import DraftCreation from "./pages/DraftCreation";
import DraftView from "./pages/DraftView";
import DocumentDetail from "./pages/DocumentDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserCreate from "./pages/UserCreate";
import UserActivity from "./pages/UserActivity";
import MyPage from "./pages/MyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/staff/dashboard",
    element: <StaffDashboard />,
  },
  {
    path: "/staff/dashboard/approver",
    element: <StaffDashboard userRole="결재권자 · 실무 담당자" showApproverMenu={true} showAdminMenu={true} />,
  },
  {
    path: "/approver/dashboard",
    Component: ApproverDashboard,
  },
  {
    path: "/rag-search",
    Component: RagSearch,
  },
  {
    path: "/document-summary",
    Component: DocumentSummary,
  },
  {
    path: "/draft/new",
    Component: DraftCreation,
  },
  {
    path: "/draft/:id",
    Component: DraftCreation,
  },
  {
    path: "/draft/view/:id",
    Component: DraftView,
  },
  {
    path: "/document/:id",
    Component: DocumentDetail,
  },
  {
    path: "/mypage",
    Component: MyPage,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/admin/users",
    Component: AdminDashboard,
  },
  {
    path: "/admin/users/create",
    Component: UserCreate,
  },
  {
    path: "/admin/users/:userId/activity",
    Component: UserActivity,
  },
  {
    path: "/admin/documents",
    Component: AdminDashboard,
  },
  {
    path: "/admin/queries",
    Component: AdminDashboard,
  },
  {
    path: "/user/activity",
    Component: UserActivity,
  },
]);
