/**
 * @author dhowor1d
 * @description 보호된 라우트 컴포넌트 - 인증된 사용자만 접근 가능한 경로를 보호
 * Zustand 인증 스토어의 authenticated 상태를 확인하여 접근 제어
 * 인증되지 않은 사용자는 로그인 페이지("/")로 리다이렉트
 * React Router의 Outlet을 통해 인증된 사용자에게만 자식 라우트 표시
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/domains/login/store/useAuthStore";

/**
 * @function ProtectedRoute
 * @description 인증 확인 라우트 가드 - 로그인 상태 검사로 보안 경로 보호
 * @returns {JSX.Element} 인증 성공 시 Outlet, 실패 시 로그인 페이지로 리다이렉트
 */
function ProtectedRoute() {
  const authenticated = useAuthStore((state) => state.authenticated);

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
