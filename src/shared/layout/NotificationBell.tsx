import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { alertApi, type Alert } from "@/api/alertApi";
import { useAlertStore } from "@/shared/store/useAlertStore";

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const alerts = useAlertStore((state) => state.alerts);
  const clearAlerts = useAlertStore((state) => state.clearAlerts);

  const latestAlerts = useMemo(() => alerts.slice(0, 50), [alerts]);

  const unreadCount = latestAlerts.filter((alert) => !alert.isRead).length;

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDeleteAll = async () => {
    try {
      await alertApi.deleteAllAlerts();
      clearAlerts();
    } catch (error) {
      console.error("Failed to delete all alerts:", error);
    }
  };

  const handleAlertClick = (alert: Alert) => {
    // 서버룸으로 이동
    if (alert.serverRoomId) {
      navigate(`/server-room/${alert.serverRoomId}/view`);
      setIsOpen(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "text-red-500";
      case "WARNING":
        return "text-yellow-500";
      case "INFO":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 아이콘 버튼 */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen ? " text-yellow-400" : "text-white hover:text-amber-200"
        }`}
      >
        <IoNotificationsOutline className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-slate-300/40 z-1000 overflow-hidden">

          <div className="max-h-96 overflow-y-auto">
            {latestAlerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">
                새로운 알림이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {latestAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    onClick={() => handleAlertClick(alert)}
                    className={`px-4 py-3 hover:bg-gray-750 transition-colors cursor-pointer ${
                      !alert.isRead ? "bg-gray-750/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${getLevelColor(alert.level)}`}>
                              {alert.level}
                            </span>
                            <h4 className="text-gray-50 font-medium text-sm">
                              {alert.targetName}
                            </h4>
                          </div>
                          {!alert.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-200 text-sm mb-1">
                          {alert.message}
                        </p>
                        <span className="text-gray-50 text-xs">
                          {formatTimestamp(alert.triggeredAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {latestAlerts.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-700">
              <button 
                onClick={handleDeleteAll}
                className="text-gray-50 hover:text-red-300 text-sm font-medium w-full text-center"
              >
                모두 지우기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
