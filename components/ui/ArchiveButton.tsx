import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ArchiveButtonProps {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-2 text-[0.65rem]",
  md: "px-5 py-3 text-[0.72rem]",
  lg: "px-7 py-3.5 text-[0.78rem]",
};

export default function ArchiveButton({
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
}: ArchiveButtonProps) {
  const cls = cn(
    variant === "primary" ? "btn-archive" : "btn-outline",
    sizeClasses[size],
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}