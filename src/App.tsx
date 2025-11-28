/**
 * @author 김대호
 * @description 메인 앱 컴포넌트 - React Router의 최상위 라우팅 컴포넌트
 * 공통 레이아웃(Layout)을 적용하고 중첩된 라우트를 렌더링하는 기본 컴포넌트
 * Outlet을 통해 자식 라우트 컴포넌트들을 렌더링하여 페이지별 콘텐츠 표시
 */

import { Outlet } from 'react-router-dom';
import Layout from './shared/layout/Layout';

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App;
