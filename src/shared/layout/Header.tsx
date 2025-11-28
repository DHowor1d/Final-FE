/**
 * @author 김대호
 * @description 공통 헤더 컴포넌트 - 네비게이션 메뉴와 로그아웃 기능을 제공하는 헤더
 * 로고, 네비게이션 메뉴(대시보드, 서버실, 자원관리, 회원관리), 알림, 사용자 정보 표시
 * 사용자 권한에 따라 회원관리 메뉴 표시 여부 결정 (ADMIN, OPERATOR만 접궼 가능)
 * NavLink로 현재 활성 페이지를 시각적으로 구분하여 표시
 * 로그아웃 기능으로 인증 상태 초기화 및 로그인 페이지로 리다이렉트
 */

import { useNavigate, NavLink } from "react-router-dom";
import { LiaCubesSolid } from "react-icons/lia";
import { GrResources } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlinePeopleAlt, MdLogout } from "react-icons/md";
import { useAuthStore } from "@domains/login/store/useAuthStore";
import NotificationBell from "./NotificationBell";

/**
 * @function Header
 * @description 공통 헤더 컴포넌트 - 반응형 네비게이션과 사용자 메뉴 제공
 * @returns {JSX.Element} 헤더 UI
 */
function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "대시보드",
      path: "/dashboard",
      icon: <LuLayoutDashboard className="text-2xl text-sky-500" />,
    },
    {
      id: "serverRoom",
      label: "서버실",
      path: "/server-room-dashboard",
      icon: <LiaCubesSolid className="text-2xl text-amber-500" />,
    },
    {
      id: "assets",
      label: "자원관리",
      path: "/assets",
      icon: <GrResources className="text-2xl text-green-500" />,
    },
    // ADMIN 또는 OPERATOR만 회원관리 메뉴 표시
    ...(user?.role === "ADMIN" || user?.role === "OPERATOR"
      ? [{
          id: "humanResource",
          label: "회원관리",
          path: "/hr",
          icon: <MdOutlinePeopleAlt className="text-2xl text-emerald-600" />,
        }]
      : []),
  ];

  return (
    <header className="px-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">
          {/* 로고 */}
          <div className="flex items-center gap-2 mr-8">
            <img src="/logo.svg" alt="SERVERWAY" className="w-8 h-8" />
            <span className="hidden sm:block text-xl font-bold text-gray-50">SERVERWAY</span>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex items-center gap-x-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-4 transition-all duration-300 ${
                    isActive
                      ? "text-gray-50 border-b border-gray-100"
                      : "text-gray-500 hover:text-gray-200"
                  }`
                }
              >
                <span className="text-lg font-semibold flex items-center gap-2">
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          {/* 사용자 메뉴 */}
          <div className="flex text-white rounded-xl space-x-2">
            <div className="flex flex-row text-lg font-bold">
              <span>{user?.name || '사용자'} | {user?.companyName || ''}</span>
            </div>
          </div>

          {/* 알림 버튼 */}
          <NotificationBell />

          {/* 로그아웃 버튼 */}
          <button 
            onClick={handleLogout}
            className="p-2 text-white hover:bg-white/30 rounded-lg transition-colors"
            title="로그아웃"
          >
            <MdLogout className="text-2xl" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
