import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HistoricalCardProps {
  children: ReactNode;
  className?: string;
  deckle?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export default function HistoricalCard({
  children,
  className,
  deckle = false,
  interactive = false,
  onClick,
}: HistoricalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "parchment",
        deckle && "parchment-deckle",
        interactive &&
          "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-paper-lg",
        className
      )}
    >
      {children}
    </div>
  );
}