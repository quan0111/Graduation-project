// ProgressBar.tsx

import React from "react";

type ProgressBarProps = {
  value: number;       // % (0 → 100)
  isDanger?: boolean;  // optional
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  isDanger = false,
}) => {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${
          isDanger ? "bg-orange-500" : "bg-primary"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};