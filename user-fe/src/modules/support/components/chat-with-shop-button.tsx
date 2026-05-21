import type { ComponentProps, ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getStoredStorefrontUser } from "@/lib/auth-storage";

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;
type ButtonSize = NonNullable<ComponentProps<typeof Button>["size"]>;

interface ChatWithShopButtonProps {
  shopId?: number | null;
  shopName?: string | null;
  productName?: string | null;
  orderId?: number | null;
  subject?: string;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

export function ChatWithShopButton({
  shopId,
  shopName,
  productName,
  orderId,
  subject,
  className,
  variant = "outline",
  size = "default",
  children,
}: ChatWithShopButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const currentPath = `${location.pathname}${location.search}`;
    const targetPath = (() => {
      if (!shopId) {
        return "/messages";
      }

      const params = new URLSearchParams({ shopId: String(shopId) });
      if (shopName) params.set("shopName", shopName);
      if (productName) params.set("productName", productName);
      if (orderId) params.set("orderId", String(orderId));
      if (subject) params.set("subject", subject);
      return `/messages?${params.toString()}`;
    })();

    if (!getStoredStorefrontUser()) {
      navigate("/login", { state: { redirect: targetPath, from: currentPath } });
      return;
    }

    navigate(targetPath);
  };

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleClick}>
      <MessageCircle className="size-4" />
      {children ?? "Chat với shop"}
    </Button>
  );
}
