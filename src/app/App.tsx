import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </NotificationProvider>
  );
}