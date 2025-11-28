/**
 * @author 최산하
 */
import { useState, useEffect, useRef } from "react";
import { MdHistory, MdClose, MdFilterList } from "react-icons/md";
import { FiGitCommit } from "react-icons/fi";
import { BiPlus, BiMinus, BiEdit } from "react-icons/bi";
import { historyApi, type HistoryRecord } from "../api/historyApi";

interface ServerRoomHistoryPanelProps {
  serverRoomId: number;
}

function ServerRoomHistoryPanel({ serverRoomId }: ServerRoomHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allHistory, setAllHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 클라이언트 사이드 필터링
  const filteredHistory = allHistory.filter((record) => {
    if (selectedAction !== "ALL" && record.action !== selectedAction) {
      return false;
    }
    if (selectedEntityType !== "ALL" && record.entityType !== selectedEntityType) {
      return false;
    }
    return true;
  });

  // 패널 열릴 때만 초기 로드
  useEffect(() => {
    if (!isOpen) return;
    
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setPage(0);
        
        const response = await historyApi.getServerRoomHistory(serverRoomId, {
          page: 0,
          size: 20,
        });
        setAllHistory(response.result.content);
        setHasMore(!response.result.last);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, serverRoomId]);

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page === 0 || !isOpen) return;
    
    const loadMore = async () => {
      try {
        setIsLoading(true);
        
        const response = await historyApi.getServerRoomHistory(serverRoomId, {
          page,
          size: 20,
        });
        setAllHistory((prev) => [...prev, ...response.result.content]);
        setHasMore(!response.result.last);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMore();
  }, [page, isOpen, serverRoomId]);

  // 무한 스크롤
  const handleScroll = () => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setPage((prev) => prev + 1);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <BiPlus className="text-green-400" />;
      case "DELETE":
        return <BiMinus className="text-red-400" />;
      case "UPDATE":
        return <BiEdit className="text-cyan-400" />;
      default:
        return <FiGitCommit className="text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-400 bg-green-500/20 border-green-500/40";
      case "DELETE":
        return "text-red-400 bg-red-500/20 border-red-500/40";
      case "UPDATE":
        return "text-cyan-400 bg-cyan-500/20 border-cyan-500/40";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/40";
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
    if (days < 30) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const renderChangedFields = (record: HistoryRecord) => {
    if (record.action === "CREATE" || record.action === "DELETE") {
      return null;
    }

    return (
      <div className="mt-2 text-xs">
        <span className="text-gray-400">변경된 필드: </span>
        <span className="text-cyan-400">
          {record.changedFields.join(", ")}
        </span>
      </div>
    );
  };

  const renderValueDiff = (record: HistoryRecord) => {
    if (record.action === "CREATE" && record.afterValue) {
      return (
        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs">
          <div className="text-green-400 font-semibold mb-1">+ 생성됨</div>
          <pre className="text-gray-300 overflow-x-auto">
            {JSON.stringify(record.afterValue, null, 2)}
          </pre>
        </div>
      );
    }

    if (record.action === "DELETE" && record.beforeValue) {
      return (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
          <div className="text-red-400 font-semibold mb-1">- 삭제됨</div>
          <pre className="text-gray-300 overflow-x-auto">
            {JSON.stringify(record.beforeValue, null, 2)}
          </pre>
        </div>
      );
    }

    if (record.action === "UPDATE" && record.beforeValue && record.afterValue) {
      const changedFieldsData: Record<string, { before: unknown; after: unknown }> = {};
      
      record.changedFields.forEach((field) => {
        if (field !== "ALL") {
          changedFieldsData[field] = {
            before: record.beforeValue?.[field],
            after: record.afterValue?.[field],
          };
        }
      });

      return (
        <div className="mt-2 space-y-1">
          {Object.entries(changedFieldsData).map(([field, values]) => (
            <div
              key={field}
              className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs"
            >
              <div className="font-semibold text-cyan-400 mb-1">{field}</div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">
                  {String(values.before ?? "null")}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-green-400">
                  {String(values.after ?? "null")}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* 히스토리 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
      >
        <MdHistory className="text-xl" />
        <span className="text-sm font-medium">히스토리</span>
      </button>

      {/* 히스토리 패널 */}
      {isOpen && (
        <div className="absolute top-0 right-0 w-96 h-full bg-neutral-900/70 backdrop-blur-sm border-l border-neutral-700 z-20 flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdHistory className="text-2xl text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-100">변경 히스토리</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded transition-colors"
            >
              <MdClose className="text-xl text-gray-400" />
            </button>
          </div>

          {/* 필터 */}
          <div className="p-4 border-b border-neutral-700 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MdFilterList className="text-gray-400" />
              <span className="text-gray-400">필터</span>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-800 text-gray-100 text-sm rounded border border-neutral-700 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ALL">모든 액션</option>
                <option value="CREATE">생성</option>
                <option value="UPDATE">수정</option>
                <option value="DELETE">삭제</option>
              </select>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-800 text-gray-100 text-sm rounded border border-neutral-700 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ALL">모든 타입</option>
                <option value="DEVICE">장비</option>
                <option value="RACK">랙</option>
                <option value="EQUIPMENT">설비</option>
              </select>
            </div>
          </div>

          {/* 히스토리 목록 */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {filteredHistory.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 py-8">
                {allHistory.length === 0 ? "히스토리가 없습니다." : "필터 조건에 맞는 히스토리가 없습니다."}
              </div>
            ) : (
              filteredHistory.map((record, index) => (
                <div
                  key={`${record.id}-${index}`}
                  className="relative pl-6 pb-4"
                >
                  {/* 타임라인 라인 */}
                  {index < filteredHistory.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-neutral-700" />
                  )}

                  {/* 타임라인 아이콘 */}
                  <div
                    className={`absolute left-0 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getActionColor(
                      record.action
                    )}`}
                  >
                    {getActionIcon(record.action)}
                  </div>

                  {/* 커밋 내용 */}
                  <div className="bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800/70 transition-colors border border-neutral-700/50">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${getActionColor(
                              record.action
                            )}`}
                          >
                            {record.action}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {record.entityType}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">
                          {record.entityName}
                        </h3>
                      </div>
                    </div>

                    {/* 작성자 및 시간 */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <span className="font-medium text-cyan-400">
                        {record.changedByName}
                      </span>
                      <span>({record.changedByRole})</span>
                      <span>•</span>
                      <span>{formatTimestamp(record.changedAt)}</span>
                    </div>

                    {/* 변경된 필드 */}
                    {renderChangedFields(record)}

                    {/* 값 변경 상세 */}
                    {renderValueDiff(record)}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ServerRoomHistoryPanel;
