import type { ReactNode } from "react";

export default interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}
