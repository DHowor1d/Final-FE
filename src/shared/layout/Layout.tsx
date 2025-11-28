/**
 * @author dhowor1d
 * @description 공통 레이아웃 컴포넌트 - 전체 페이지에 공통으로 적용되는 기본 레이아웃
 * 헤더와 메인 콘텐츠 영역으로 구성되어 일관된 UI 구조 제공
 * 화면 전체를 채우는 flex 레이아웃으로 overflow 처리
 * Header에는 네비게이션 메뉴와 로그아웃 기능 포함
 */

import { type ReactNode } from 'react';
import Header from './Header';
import MainContent from './MainContent';

interface LayoutProps {
  children: ReactNode;
}

/**
 * @function Layout
 * @description 공통 레이아웃 컴포넌트 - 헤더와 메인 콘텐츠 영역 구성
 * @param {LayoutProps} props - 자식 컴포넌트
 * @returns {JSX.Element} 레이아웃 UI
 */
function Layout({ children }: LayoutProps) {
  return (
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </div>
  );
}

export default Layout;
