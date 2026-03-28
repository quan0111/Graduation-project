// CTASection.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CTASection = () => (
  <div className="text-center mt-10">
    <Link to="/products">
      <Button>Đi mua ngay</Button>
    </Link>
  </div>
);