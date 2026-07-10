import {
  mkdir,
  writeFile,
  readFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { saveFileDialog } from "./saveLocation";

export const isDocx = (path: string): boolean =>
  path.toLowerCase().endsWith(".docx");

export const isPdf = (path: string): boolean =>
  path.toLowerCase().endsWith(".pdf");

export const isPreviewable = (path: string): boolean =>
  isDocx(path) || isPdf(path);

const sanitize = (name: string): string =>
  name
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .replace(/\s+/g, " ");

export async function saveSupervisoryFile(
  file: File,
  ...segments: string[]
): Promise<string> {
  const dir = ["supervisory_case", ...segments.map(sanitize)].join("/");
  await mkdir(dir, { baseDir: BaseDirectory.AppData, recursive: true });

  const path = `${dir}/${sanitize(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path, bytes, { baseDir: BaseDirectory.AppData });

  return path;
}

export async function downloadSupervisoryFile(
  relativePath: string,
): Promise<string | null> {
  const fileName = sanitize(relativePath.split("/").pop() ?? "document");
  const dest = await saveFileDialog(fileName);
  if (!dest) return null;
  const bytes = await readFile(relativePath, {
    baseDir: BaseDirectory.AppData,
  });
  await writeFile(dest, bytes);
  return dest;
}
