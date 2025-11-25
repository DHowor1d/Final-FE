import { useState, useRef, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { alertApi, type Alert } from "@/api/alertApi";
import { createAlertSSE } from "@/api/sseClient";

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  // SSE 연결 및 초기 데이터 로드
  useEffect(() => {
    // 초기 알림 데이터 가져오기
    const fetchInitialAlerts = async () => {
      try {
        const response = await alertApi.getAlerts({ page: 0, size: 20, days: 7 });
        setAlerts(response.content);
      } catch (error) {
        console.error("Failed to fetch initial alerts:", error);
      }
    };

    fetchInitialAlerts();

    // SSE 연결 생성
    const sseConnection = createAlertSSE<Alert>({
      onMessage: (newAlert) => {
        console.log("New alert received:", newAlert);
        // 새 알림을 맨 앞에 추가
        setAlerts((prev) => [newAlert, ...prev]);
      },
      onError: (error) => {
        console.error("Alert SSE error:", error);
      },
      onOpen: () => {
        console.log("Alert SSE connection established");
      },
    });

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      sseConnection.close();
    };
  }, []);

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
      setAlerts([]);
    } catch (error) {
      console.error("Failed to delete all alerts:", error);
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
        <div className="absolute right-0 mt-2 w-80 bg-gray-50/20 backdrop-blur-sm rounded-lg shadow-xl border border-slate-300/40 z-1000 overflow-hidden">

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">
                새로운 알림이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {alerts.map((alert) => (
                  <div
                    key={alert.alertId}
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

          {alerts.length > 0 && (
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
