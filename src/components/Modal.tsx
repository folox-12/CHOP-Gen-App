import { FC, ReactNode, useEffect, useRef, useState } from "react";
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

// Длительность анимации сминания при закрытии (должна совпадать с CSS ниже).
const CLOSE_ANIMATION_MS = 600;

export const Modal: FC<Props> = ({
  isOpen = false,
  title = TEXTS.common.defaultTitle,
  children,
  size,
  closeModal,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Пока окно открыто — запоминаем контент, чтобы он не пропадал во время
  // анимации закрытия (родитель может обнулить данные сразу при закрытии).
  const lastContent = useRef<{ title: string; children: ReactNode }>({
    title,
    children,
  });
  if (isOpen) {
    lastContent.current = { title, children };
  }
  const displayTitle = isOpen ? title : lastContent.current.title;
  const displayChildren = isOpen ? children : lastContent.current.children;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      return;
    }
    if (!isRendered) return;
    setIsClosing(true);
    const timer = setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [isOpen, isRendered]);

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

  if (!isRendered) return null;

  return (
    <div
      onClick={closeModal}
      className={`backdrop-blur-xs cursor-pointer fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 ${
        isClosing
          ? "animate-[backdrop-fade-out_0.6s_ease-in_forwards]"
          : "animate-[backdrop-fade-in_0.3s_ease-out]"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${size === "small" ? "h-2/6" : "min-h-[80%]"} cursor-default  min-w-[80%] bg-white p-4! rounded-xl shadow-xl relative origin-bottom ${
          isClosing
            ? "animate-[genie-close_0.6s_ease-in_forwards]"
            : "animate-[genie-open_0.5s_ease-out]"
        }`}
      >
        <div className="text-2xl text-center font-bold first-letter:uppercase mb-3.5">
          {displayTitle}
        </div>
        <div className="inline-block absolute top-2 right-2">
          <Button title={TEXTS.common.closeModal} onClick={closeModal}>
            <Icon path={mdiClose} size={1} />
          </Button>
        </div>
        {displayChildren}
      </div>
    </div>
  );
};
