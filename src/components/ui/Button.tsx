import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

// Button chuẩn theme Neumorphism — dùng thay vì viết class neu-btn lặp lại.
function Button({ variant = "secondary", className = "", ...rest }: Props) {
  const base = variant === "primary" ? "neu-btn-primary" : "neu-btn";
  return <button className={`${base} ${className}`} {...rest} />;
}

export default Button;
