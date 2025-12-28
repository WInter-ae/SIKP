import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
}

function BackButton({ 
  to = "/mentor", 
  label = "Kembali ke Dashboard" 
}: BackButtonProps) {
  return (
    <div className="flex justify-start">
      <Button variant="secondary" asChild>
        <Link to={to}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    </div>
  );
}

export default BackButton;
