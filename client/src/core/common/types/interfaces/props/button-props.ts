import type { ReactNode } from "react";

export default interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?:
    | "primary"
    | "outline"
    | "secondary"
    | "success"
    | "danger"
    | "warning";
  type?: "button" | "submit" | "reset";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
