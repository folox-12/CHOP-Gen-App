import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { writeFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";

function buildParser() {
  return (tag: string) => {
    const splitted = tag.split(".");
    return {
      get(scope: unknown, context?: { scopeList?: unknown[] }) {
        if (tag === ".") return scope;
        const chain = [scope, ...(context?.scopeList ?? [])];
        for (const root of chain) {
          let s: unknown = root;
          let ok = true;
          for (const key of splitted) {
            if (s == null || typeof s !== "object" || !(key in s)) {
              ok = false;
              break;
            }
            s = (s as Record<string, unknown>)[key];
          }
          if (ok) return s;
        }
        return "";
      },
    };
  };
}

export async function generateDocx(
  templateUrl: string,
  data: unknown,
  outputFileName: string,
  outputPath?: string,
): Promise<void> {
  const arrayBuffer = await fetch(templateUrl).then((r) => r.arrayBuffer());

  const doc = new Docxtemplater(new PizZip(arrayBuffer), {
    paragraphLoop: true,
    linebreaks: true,
    parser: buildParser(),
  });

  doc.render(data);

  const buffer = doc.toBlob();
  const dest =
    outputPath ?? `${await path.desktopDir()}/${outputFileName}.docx`;
  await writeFile(dest, new Uint8Array(await buffer.arrayBuffer()));
}
