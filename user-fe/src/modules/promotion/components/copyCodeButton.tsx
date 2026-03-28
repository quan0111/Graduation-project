// CopyCodeButton.tsx

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyCodeButtonProps = {
  code: string;
  copied: string | null;
  onCopy: (code: string) => void;
};

export const CopyCodeButton: React.FC<CopyCodeButtonProps> = ({
  code,
  copied,
  onCopy,
}) => {
  return (
    <Button variant="outline" size="sm" onClick={() => onCopy(code)}>
      {copied === code ? (
        <Check className="text-green-500" />
      ) : (
        <Copy />
      )}
    </Button>
  );
};