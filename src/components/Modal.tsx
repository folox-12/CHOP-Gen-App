import { FC, ReactNode, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";
import { Button } from "./ui/Button";
import { TEXTS } from "@/constants/texts";

type Props = {
  isOpen?: boolean;
  children?: ReactNode;
  title?: string;
  size?: string;
  closeModal: () => void;
};

export const Modal: FC<Props> = ({
  isOpen = false,
  title = TEXTS.common.defaultTitle,
  children,
  size,
  closeModal,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (isOpen) {
      window.addEventListener("keyup", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div
      onClick={closeModal}
      className="backdrop-blur-xs cursor-pointer fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${size === "small" ? "h-2/6" : "min-h-[80%]"} cursor-default  min-w-[80%] bg-white p-4! rounded-xl shadow-xl relative`}
      >
        <div className="text-2xl text-center font-bold first-letter:uppercase mb-3.5">
          {title}
        </div>
        <div className="inline-block absolute top-2 right-2">
          <Button title={TEXTS.common.closeModal} onClick={closeModal}>
            <Icon path={mdiClose} size={1} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
