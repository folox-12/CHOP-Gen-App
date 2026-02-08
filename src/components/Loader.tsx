import { useState, useEffect } from "react";

const REVEAL_MS = 2000;
const PAUSE_MS = 400;
const MOVE_MS = 700;
const LOGO_SIZE = 300;
const OFFSET_X = 8;

type Phase = "reveal" | "moving";

type Props = {
  onDone: () => void;
  targetRect: DOMRect | null;
};

export const Loader = ({ onDone, targetRect }: Props) => {
  const [phase, setPhase] = useState<Phase>("reveal");

  useEffect(() => {
    const moveTimer = setTimeout(
      () => setPhase("moving"),
      REVEAL_MS + PAUSE_MS,
    );
    const doneTimer = setTimeout(onDone, REVEAL_MS + PAUSE_MS + MOVE_MS + 100);
    return () => {
      clearTimeout(moveTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const getLogoTransform = () => {
    if (phase === "reveal" || !targetRect) return "translate(0, 0) scale(1)";
    const cx =
      targetRect.left + targetRect.width / 2 - window.innerWidth / 2 + OFFSET_X;
    const cy = targetRect.top + targetRect.height / 2 - window.innerHeight / 2;
    const scale = targetRect.width / LOGO_SIZE;
    return `translate(${cx}px, ${cy}px) scale(${scale})`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-[#f6f6f6]"
        style={{
          opacity: phase === "moving" ? 0 : 1,
          transition: `opacity ${MOVE_MS}ms ease`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          willChange: "transform",
          transform: getLogoTransform(),
          transition:
            phase === "moving"
              ? `transform ${MOVE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : undefined,
        }}
      >
        <img
          src="/iceberg.svg"
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            filter: "grayscale(1) opacity(0.15)",
          }}
          alt=""
        />
        <img
          src="/iceberg.svg"
          style={{
            position: "absolute",
            inset: 0,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            clipPath: phase === "moving" ? "inset(0 0 0% 0)" : undefined,
            animation:
              phase === "reveal"
                ? `iceberg-reveal ${REVEAL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`
                : undefined,
          }}
          alt=""
        />
      </div>
    </div>
  );
};
