/**
 * @author 최산하
 */
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { X } from "lucide-react";
import { useUpdateServerRoom } from "../hooks/useServerRoomQueries";
import type { UpdateServerRoomRequest } from "../api/serverRoomApi";
import type { ServerRoom } from "../types";
import { useEffect } from "react";

// 공통 스타일
const labelStyle = "block text-sm font-medium text-white mb-1";
const errorTextStyle = "text-xs text-red-400 mt-1";

interface ServerRoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverRoom: ServerRoom | null;
}

type FormValues = {
  name: string;
  code: string;
  rows: number;
  columns: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  description?: string;
};

function ServerRoomEditModal({
  isOpen,
  onClose,
  serverRoom,
}: ServerRoomEditModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: serverRoom?.name || "",
      code: serverRoom?.code || "",
      rows: serverRoom?.rows || 10,
      columns: serverRoom?.columns || 10,
      status: serverRoom?.status || "ACTIVE",
      description: serverRoom?.description || "",
    },
  });

  const updateServerRoomMutation = useUpdateServerRoom();
  const isLoading = updateServerRoomMutation.isPending;

  // serverRoom이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (serverRoom) {
      reset({
        name: serverRoom.name,
        code: serverRoom.code,
        rows: serverRoom.rows ,
        columns: serverRoom.columns,
        status: serverRoom.status,
        description: serverRoom.description || "",
      });
    }
  }, [serverRoom, reset]);

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!serverRoom) return;

    const serverRoomData: UpdateServerRoomRequest = {
      name: data.name,
      code: data.code,
      description: data.description || "",
      rows: data.rows,
      columns: data.columns,
      status: data.status,
    };

    updateServerRoomMutation.mutate(
      { id: serverRoom.id, data: serverRoomData },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  if (!isOpen || !serverRoom) return null;

  return (
    <div className="modal-bg animate-fadeIn" onClick={handleClose}>
      <div className="modal animate-modalFadeIn max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 md:p-8">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">서버실 수정</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 서버실명 */}
                <div>
                  <label className={labelStyle}>
                    서버실명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "서버실명은 필수 입력 항목입니다.",
                    })}
                    className={`modal-input ${errors.name ? "border-red-500" : ""}`}
                    placeholder="국방부 서버실"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className={errorTextStyle}>{errors.name.message}</p>
                  )}
                </div>

                {/* 코드 */}
                <div>
                  <label className={labelStyle}>
                    코드 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("code", {
                      required: "코드는 필수 입력 항목입니다.",
                    })}
                    className={`modal-input ${errors.code ? "border-red-500" : ""}`}
                    placeholder="DC-BSN-001"
                    disabled={isLoading}
                  />
                  {errors.code && (
                    <p className={errorTextStyle}>{errors.code.message}</p>
                  )}
                </div>

                {/* 행 수 */}
                <div>
                  <label className={labelStyle}>
                    행 수 (Rows) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("rows", {
                      required: "행 수는 필수 입력 항목입니다.",
                      valueAsNumber: true,
                      min: { value: 1, message: "행 수는 1 이상이어야 합니다." },
                    })}
                    className={`modal-input ${errors.rows ? "border-red-500" : ""}`}
                    placeholder="10"
                    disabled={isLoading}
                  />
                  {errors.rows && (
                    <p className={errorTextStyle}>{errors.rows.message}</p>
                  )}
                </div>

                {/* 열 수 */}
                <div>
                  <label className={labelStyle}>
                    열 수 (Columns) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("columns", {
                      required: "열 수는 필수 입력 항목입니다.",
                      valueAsNumber: true,
                      min: { value: 1, message: "열 수는 1 이상이어야 합니다." },
                    })}
                    className={`modal-input ${errors.columns ? "border-red-500" : ""}`}
                    placeholder="10"
                    disabled={isLoading}
                  />
                  {errors.columns && (
                    <p className={errorTextStyle}>{errors.columns.message}</p>
                  )}
                </div>

                {/* 상태 */}
                <div className="md:col-span-2">
                  <label className={labelStyle}>
                    상태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("status", {
                      required: "상태는 필수 입력 항목입니다.",
                    })}
                    className={`modal-input ${errors.status ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="INACTIVE">비활성</option>
                    <option value="MAINTENANCE">점검중</option>
                  </select>
                  {errors.status && (
                    <p className={errorTextStyle}>{errors.status.message}</p>
                  )}
                </div>

                {/* 설명 */}
                <div className="md:col-span-2">
                  <label className={labelStyle}>설명</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="modal-input"
                    placeholder="서버실 설명을 입력하세요"
                    disabled={isLoading}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 btn-cancel"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 btn-create"
              >
                {isLoading ? "수정 중..." : "수정"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ServerRoomEditModal;
