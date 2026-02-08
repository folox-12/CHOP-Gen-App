import React, { FC } from "react";
import { TEXTS } from "@/constants/texts";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
};

export const Button: FC<Props> = ({
  onClick = () => {},
  children,
  disabled = false,
  title = TEXTS.common.defaultAction,
}) => {
  return (
    <button
      className="
        inline-block
        cursor-pointer
        p-1
        text-white
        bg-cyan-500
        rounded-md
        active:scale-95
        disabled:cursor-not-allowed
        disabled:active:scale-100
        disabled:text-gray-500
      "
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
