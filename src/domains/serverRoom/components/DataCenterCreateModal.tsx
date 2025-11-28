/**
 * @author 최산하
 */
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { X } from "lucide-react";
import { useCreateDataCenter } from "../hooks/useServerRoomQueries";

// 공통 스타일
const labelStyle = "block text-sm font-medium text-white mb-1";
const errorTextStyle = "text-xs text-red-400 mt-1";

interface DataCenterCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  code: string;
  name: string;
  address: string;
  description?: string;
};

function DataCenterCreateModal({
  isOpen,
  onClose,
}: DataCenterCreateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      address: "",
      description: "",
    },
  });

  const createDataCenterMutation = useCreateDataCenter();
  const isLoading = createDataCenterMutation.isPending;

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    createDataCenterMutation.mutate(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-bg animate-fadeIn" onClick={handleClose}>
      <div className="modal animate-modalFadeIn max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 md:p-8">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">새 데이터센터 추가</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-300 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 space-y-4">

              {/* 이름 */}
              <div>
                <label className={labelStyle}>
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "이름은 필수 입력 항목입니다.",
                  })}
                  className={`modal-input ${errors.name ? "border-red-500" : ""}`}
                  placeholder="서울 데이터센터"
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
                  placeholder="DC001"
                />
                {errors.code && (
                  <p className={errorTextStyle}>{errors.code.message}</p>
                )}
              </div>

              {/* 주소 */}
              <div>
                <label className={labelStyle}>
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("address", {
                    required: "주소는 필수 입력 항목입니다.",
                  })}
                  className={`modal-input ${errors.address ? "border-red-500" : ""}`}
                  placeholder="서울특별시 강남구 테헤란로 123"
                />
                {errors.address && (
                  <p className={errorTextStyle}>{errors.address.message}</p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label className={labelStyle}>설명</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="modal-input"
                  placeholder="메인 데이터센터"
                ></textarea>
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
                {isLoading ? "생성 중..." : "생성"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DataCenterCreateModal;
