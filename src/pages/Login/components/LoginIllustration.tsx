import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";
import landscape from "../../../assets/login-landscape.png";

/** Panel trái Login — ảnh landscape phủ vừa khít ô tím, parallax nhẹ */
function LoginIllustration() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: nx * 8, y: ny * 6 });
  }, []);

  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-full min-h-[420px] w-full overflow-hidden bg-[#DDE2FF]"
    >
      <img
        src={landscape}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center select-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(1.06)`,
        }}
      />
    </div>
  );
}

export default LoginIllustration;
