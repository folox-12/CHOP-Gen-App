import { save, open, type DialogFilter } from "@tauri-apps/plugin-dialog";
import { join, dirname } from "@tauri-apps/api/path";
import { useLastDirStore } from "@/entity/settings/useLastDirStore";

// Диалог «Сохранить как» с памятью последней папки.
// Возвращает выбранный путь либо null, если диалог отменён.
export async function saveFileDialog(
  fileName: string,
  filters?: DialogFilter[],
): Promise<string | null> {
  const { lastDir, setLastDir } = useLastDirStore.getState();
  const defaultPath = lastDir ? await join(lastDir, fileName) : fileName;
  const dest = await save({ defaultPath, filters });
  if (dest) setLastDir(await dirname(dest));
  return dest;
}

// Выбор папки с памятью последнего выбора.
// Возвращает путь к папке либо null, если диалог отменён.
export async function pickDirectory(): Promise<string | null> {
  const { lastDir, setLastDir } = useLastDirStore.getState();
  const dir = await open({
    directory: true,
    multiple: false,
    defaultPath: lastDir ?? undefined,
  });
  if (typeof dir === "string") setLastDir(dir);
  return dir;
}
