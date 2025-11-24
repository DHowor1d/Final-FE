import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ServerRoomDashboard from "@domains/serverRoom/pages/ServerRoomDashboard";
import ServerViewPage from "@domains/serverView/pages/ServerViewPage";
import ResourceManagePage from "@domains/resourceManage/pages/ResourceManagePage";
import LoginPage from "@domains/login/LoginPage";
import HumanResource from "@domains/humanResource/pages/HumanResource";
import ProtectedRoute from "@shared/ProtectedRoute";
import RoleProtectedRoute from "@shared/RoleProtectedRoute";
import MainDashboard from "@domains/mainDashboard/pages/MainDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          {
            path: "dashboard",
            element: <MainDashboard />,
          },
          {
            path: "server-room-dashboard",
            element: <ServerRoomDashboard />,
          },
          {
            path: "server-room-dashboard/:datacenterId",
            element: <ServerRoomDashboard />,
          },
          {
            path: "server-room/:id/view",
            element: <ServerViewPage />,
          },
          {
            path: "assets",
            element: <ResourceManagePage />,
          },
          {
            path: "hr",
            element: (
              <RoleProtectedRoute requiredRole={["ADMIN", "OPERATOR"]}>
                <HumanResource />
              </RoleProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
