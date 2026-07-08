import { mkdir, writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";

const sanitize = (name: string): string =>
  name
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .replace(/\s+/g, " ");

export async function saveSupervisoryFile(
  orgName: string,
  customerName: string,
  file: File,
): Promise<string> {
  const dir = `supervisory_case/${sanitize(orgName)}/${sanitize(customerName)}`;
  await mkdir(dir, { baseDir: BaseDirectory.AppData, recursive: true });

  const path = `${dir}/${sanitize(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path, bytes, { baseDir: BaseDirectory.AppData });

  return path;
}
