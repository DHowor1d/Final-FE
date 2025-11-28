/**
 * @author 구희원
 * @description 임계치 설정 헤더 컴포넌트
 */

import { useState, useEffect } from "react";
import CpuIcon from "../assets/cpu.svg";
import MemoryIcon from "../assets/memory.svg";
import DiskIcon from "../assets/disk.svg";
import ThresholdMetricInput from "./ThresholdmetricInput";
import ButtonPlaceholder from "./ButtonPlaceholder";

/**
 * 임계치 값
 */
export interface ThresholdValues {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  disk: { warning: number; critical: number };
}

/**
 * 임계치 헤더 props
 */
interface ThresholdHeaderProps {
  initialValues?: ThresholdValues;
  onSave?: (values: ThresholdValues) => void;
  isOpen?: boolean;
  isLoading?: boolean;
}

/**
 * 임계치 설정 헤더
 * @param {ThresholdHeaderProps} props - 헤더 속성
 * @param {ThresholdValues} props.initialValues - 초기 임계치 값
 * @param {(values: ThresholdValues) => void} props.onSave - 저장 핸들러
 * @param {boolean} props.isOpen - 대시보드 열림 상태
 * @param {boolean} props.isLoading - 저장 중 로딩 상태
 * @returns 임계치 설정 헤더 컴포넌트
 */
function ThresholdHeader({
  initialValues = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 75, critical: 90 },
    disk: { warning: 80, critical: 95 },
  },
  onSave,
  isOpen,
  isLoading = false,
}: ThresholdHeaderProps) {
  const [editMode, setEditMode] = useState(false);
  const [values, setValues] = useState<ThresholdValues>(initialValues);

  // 대시보드가 닫히면 편집 모드 해제
  useEffect(() => {
    if (!isOpen) {
      setEditMode(false);
    }
  }, [isOpen]);

  /**
   * 임계치 값 변경 핸들러
   */
  const handleValueChange = (
    metric: keyof ThresholdValues,
    type: "warning" | "critical",
    value: number
  ) => {
    setValues((prev) => {
      const newValues = {
        ...prev,
        [metric]: {
          ...prev[metric],
          [type]: value,
        },
      };
      return newValues;
    });
  };

  /**
   * 저장 핸들러
   */
  const handleSave = () => {
    onSave?.(values);
    if (!isLoading) {
      setEditMode(false);
    }
  };

  /**
   * 초기화 핸들러
   */
  const handleReset = () => {
    setValues(initialValues);
    setEditMode(false);
  };

  /**
   * 편집 모드 토글 핸들러
   */
  const handleToggleEdit = () => {
    if (editMode) {
      setValues(initialValues);
    }
    setEditMode(!editMode);
  };

  return (
    <div className="bg-white/5 border border-slate-300/40 rounded-xl p-4">
      <div className="flex items-center gap-7">
        {/* 제목 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-white text-sm font-semibold">임계치 설정</span>
        </div>

        {/* 메트릭 입력 필드 */}
        <div className="flex items-center gap-3 flex-1">
          {/* CPU */}
          <ThresholdMetricInput
            label="CPU"
            icon={CpuIcon}
            warningValue={values.cpu.warning}
            criticalValue={values.cpu.critical}
            editMode={editMode}
            onWarningChange={(value) =>
              handleValueChange("cpu", "warning", value)
            }
            onCriticalChange={(value) =>
              handleValueChange("cpu", "critical", value)
            }
          />

          {/* Memory */}
          <ThresholdMetricInput
            label="MEM"
            icon={MemoryIcon}
            warningValue={values.memory.warning}
            criticalValue={values.memory.critical}
            editMode={editMode}
            onWarningChange={(value) =>
              handleValueChange("memory", "warning", value)
            }
            onCriticalChange={(value) =>
              handleValueChange("memory", "critical", value)
            }
          />

          {/* Disk */}
          <ThresholdMetricInput
            label="DISK"
            icon={DiskIcon}
            warningValue={values.disk.warning}
            criticalValue={values.disk.critical}
            editMode={editMode}
            onWarningChange={(value) =>
              handleValueChange("disk", "warning", value)
            }
            onCriticalChange={(value) =>
              handleValueChange("disk", "critical", value)
            }
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3">
          <ButtonPlaceholder
            editMode={editMode}
            onReset={handleReset}
            onSave={handleSave}
            onToggleEdit={handleToggleEdit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default ThresholdHeader;
