import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean; // bật hiệu ứng nhấc lên khi hover
};

function Card({ hover = false, className = "", ...rest }: Props) {
  return <div className={`ui-card ${hover ? "ui-card-hover" : ""} ${className}`} {...rest} />;
}

export default Card;
