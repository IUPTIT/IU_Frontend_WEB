import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "icon" | "danger-icon";
export type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "neu-btn-primary",
  secondary: "neu-btn",
  soft: "inline-flex items-center justify-center gap-2 rounded-full font-bold bg-accent/15 text-accent shadow-extruded-sm transition-all duration-300 ease-out hover:-translate-y-px hover:bg-accent/20 hover:shadow-extruded active:translate-y-[0.5px] active:shadow-inset-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-accent/15 disabled:hover:shadow-extruded-sm",
  ghost: "inline-flex items-center justify-center gap-2 rounded-2xl font-medium text-muted transition-all duration-300 ease-out hover:text-foreground hover:shadow-extruded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:shadow-none",
  icon: "neu-btn !px-0 rounded-full text-accent",
  "danger-icon": "neu-btn !px-0 rounded-full text-red-500",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const iconSizeClass: Record<ButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

function Button({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  const isIcon = variant === "icon" || variant === "danger-icon";
  const sizing = isIcon ? iconSizeClass[size] : sizeClass[size];

  return (
    <button
      type={type}
      className={`${variantClass[variant]} ${sizing} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export default Button;
