import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { readFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { renderAsync } from "docx-preview";
import { Modal } from "./Modal";
import { TEXTS } from "@/constants/texts";
import { isPdf } from "@/utils/supervisoryFiles";

type Props = {
  path: string | null;
  title?: string;
  onClose: () => void;
};

export const FilePreviewModal = ({ path, title, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setPdfUrl(null);
    if (containerRef.current) containerRef.current.innerHTML = "";

    (async () => {
      try {
        const bytes = await readFile(path, { baseDir: BaseDirectory.AppData });
        if (cancelled) return;
        if (isPdf(path)) {
          objectUrl = URL.createObjectURL(
            new Blob([bytes], { type: "application/pdf" }),
          );
          setPdfUrl(objectUrl);
        } else if (containerRef.current) {
          await renderAsync(new Blob([bytes]), containerRef.current);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(TEXTS.supervisory.previewError + error.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return (
    <Modal
      isOpen={!!path}
      closeModal={onClose}
      title={title ?? TEXTS.supervisory.preview}
    >
      <div
        className={`rounded-md bg-gray-100 p-2 ${
          pdfUrl ? "" : "max-h-[70vh] overflow-auto"
        }`}
      >
        {loading && (
          <p className="text-gray-500">{TEXTS.supervisory.previewLoading}</p>
        )}
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={title ?? TEXTS.supervisory.preview}
            className="h-[70vh] w-full rounded-md bg-white"
          />
        ) : (
          <div ref={containerRef} />
        )}
      </div>
    </Modal>
  );
};
