/**
 * @author 구희원
 * @description 서버 대시보드 헤더 컴포넌트
 */

import DoubleArrow from "../assets/doubleArrow.svg";

/**
 * 서버 대시보드 헤더 props
 */
interface ServerDashboardHeaderProps {
  deviceName: string;
  onClose: () => void;
}

/**
 * 서버 대시보드 헤더
 * @param {ServerDashboardHeaderProps} props - 헤더 속성
 * @param {string} props.deviceName - 장비 이름
 * @param {() => void} props.onClose - 닫기 핸들러
 * @returns 대시보드 헤더 컴포넌트
 */
function ServerDashboardHeader({
  deviceName,
  onClose,
}: ServerDashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center h-14 w-full">
      <h2 className="text-xl font-semibold text-white">{deviceName}</h2>
      <button
        onClick={onClose}
        className="text-white hover:text-slate-300 transition-colors p-2 hover:bg-white/10 rounded"
      >
        <img src={DoubleArrow} alt="닫기" className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ServerDashboardHeader;
