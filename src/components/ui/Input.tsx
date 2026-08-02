import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

function Input({ className = "", ...rest }: Props) {
  return <input className={`neu-input ${className}`} {...rest} />;
}

export default Input;
