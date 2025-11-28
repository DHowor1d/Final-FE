/**
 * @author 김대호
 * @description 라우터 설정 - 애플리케이션의 모든 라우트를 정의하는 파일
 * React Router v6의 createBrowserRouter를 사용하여 라우팅 구조 정의
 * ProtectedRoute로 인증된 사용자만 접근 가능한 경로 보호
 * RoleProtectedRoute로 특정 권한(ADMIN, OPERATOR)이 필요한 페이지 접근 제한
 * 홈 경로("/")는 로그인 페이지로, 인증 후 대시보드로 이동
 */

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
