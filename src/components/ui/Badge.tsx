import type { ReactNode } from "react";
import { badgeToneClass, type BadgeTone } from "./badgeTones";

export type { BadgeTone };

type Props = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

function Badge({ tone = "accent", children, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeToneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
