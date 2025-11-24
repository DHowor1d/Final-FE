import { useState, useEffect } from "react";

interface ThresholdMetricProps {
  label: string;
  icon: string;
  warningValue: number;
  criticalValue: number;
  editMode: boolean;
  onWarningChange: (value: number) => void;
  onCriticalChange: (value: number) => void;
}

function ThresholdMetricInput({
  label,
  icon,
  warningValue,
  criticalValue,
  editMode,
  onWarningChange,
  onCriticalChange,
}: ThresholdMetricProps) {
  const [editingWarning, setEditingWarning] = useState(false);
  const [editingCritical, setEditingCritical] = useState(false);
  const [tempWarning, setTempWarning] = useState<number | null>(warningValue);
  const [tempCritical, setTempCritical] = useState<number | null>(
    criticalValue
  );

  const [warningChanged, setWarningChanged] = useState(false);
  const [criticalChanged, setCriticalChanged] = useState(false);

  useEffect(() => {
    if (!editingWarning) {
      setTempWarning(warningValue);
      setWarningChanged(false);
    }
  }, [warningValue, editingWarning, label, tempWarning, warningChanged]);

  useEffect(() => {
    if (!editingCritical) {
      setTempCritical(criticalValue);
      setCriticalChanged(false);
    }
  }, [criticalValue, editingCritical]);

  const handleWarningClick = () => {
    if (!editMode) return;
    setEditingWarning(true);
    setTempWarning(warningValue);
    setWarningChanged(false); // 클릭 시 리셋
  };

  const handleCriticalClick = () => {
    if (!editMode) return;
    setEditingCritical(true);
    setTempCritical(criticalValue);
    setCriticalChanged(false); // 클릭 시 리셋
  };

  const saveWarning = () => {
    if (!warningChanged) {
      setEditingWarning(false);
      return;
    }

    let value =
      tempWarning === null || tempWarning === undefined || isNaN(tempWarning)
        ? 0
        : Math.max(0, Math.min(100, tempWarning));

    if (criticalValue > 0 && value > criticalValue) {
      value = criticalValue;
    }

    onWarningChange(value);
    setEditingWarning(false);
    setWarningChanged(false);
  };

  const saveCritical = () => {
    if (!criticalChanged) {
      setEditingCritical(false);
      return;
    }

    let value =
      tempCritical === null || tempCritical === undefined || isNaN(tempCritical)
        ? 0
        : Math.max(0, Math.min(100, tempCritical));

    if (warningValue > 0 && value < warningValue) {
      value = warningValue;
    }

    onCriticalChange(value);
    setEditingCritical(false);
    setCriticalChanged(false);
  };

  const handleWarningChange = (val: string) => {
    setWarningChanged(true);
    if (val === "") {
      setTempWarning(null);
    } else {
      const numVal = parseInt(val);
      if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
        setTempWarning(numVal);
      }
    }
  };

  const handleCriticalChange = (val: string) => {
    setCriticalChanged(true);
    if (val === "") {
      setTempCritical(null);
    } else {
      const numVal = parseInt(val);
      if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
        setTempCritical(numVal);
      }
    }
  };

  const handleWarningKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveWarning();
    } else if (e.key === "Escape") {
      setEditingWarning(false);
      setTempWarning(warningValue);
    }
  };

  const handleCriticalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveCritical();
    } else if (e.key === "Escape") {
      setEditingCritical(false);
      setTempCritical(criticalValue);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 bg-[#2A2D34]/50 border rounded-lg transition-all ${
        editMode
          ? "border-slate-300/40"
          : "border-slate-300/40 hover:border-white/30"
      }`}
    >
      {/* Icon */}
      <div className={`w-5 h-5 rounded flex items-center justify-center`}>
        {typeof icon === "string" ? (
          <img src={icon} alt={label} className="w-3.5 h-3.5" />
        ) : (
          icon
        )}
      </div>

      {/* Label */}
      <span className="text-white text-xs font-medium min-w-[2.5rem]">
        {label}
      </span>

      {/* Warning Value */}
      <div className="flex items-center gap-1">
        {editingWarning ? (
          <input
            type="number"
            value={tempWarning ?? ""}
            onChange={(e) => handleWarningChange(e.target.value)}
            onBlur={saveWarning}
            onKeyDown={handleWarningKeyDown}
            onWheel={(e) => e.currentTarget.blur()}
            style={{
              backgroundColor: "#1e2230",
              color: "rgb(251, 191, 36)",
            }}
            className="w-10 px-2 py-1 border-2 border-white rounded text-sm font-semibold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoFocus
            onFocus={(e) => e.target.select()}
            min={0}
            max={100}
          />
        ) : (
          <span
            onClick={handleWarningClick}
            className={`px-2 py-1 bg-[#2A2D34]/80 border border-transparent rounded text-yellow-400 text-sm font-semibold text-center min-w-[2.5rem] transition-all ${
              editMode
                ? "cursor-pointer hover:border-white hover:bg-[#2A2D34]"
                : ""
            }`}
          >
            {warningValue}
          </span>
        )}
      </div>

      {/* Separator */}
      <span className="text-white text-sm">/</span>

      {/* Critical Value */}
      <div className="flex items-center gap-1">
        {editingCritical ? (
          <input
            type="number"
            value={tempCritical ?? ""}
            onChange={(e) => handleCriticalChange(e.target.value)}
            onBlur={saveCritical}
            onKeyDown={handleCriticalKeyDown}
            onWheel={(e) => e.currentTarget.blur()}
            style={{
              backgroundColor: "#1e2230",
              color: "rgb(248, 113, 113)",
            }}
            className="w-10 px-2 py-1 border-2 border-white rounded text-sm font-semibold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoFocus
            onFocus={(e) => e.target.select()}
            min={0}
            max={100}
          />
        ) : (
          <span
            onClick={handleCriticalClick}
            className={`px-2 py-1 bg-[#2A2D34]/80 border border-transparent rounded text-red-400 text-sm font-semibold text-center min-w-[2.5rem] transition-all ${
              editMode ? "cursor-pointer" : ""
            }`}
          >
            {criticalValue}
          </span>
        )}
      </div>

      {/* Unit */}
      <span className="text-white text-xs">%</span>
    </div>
  );
}

export default ThresholdMetricInput;
