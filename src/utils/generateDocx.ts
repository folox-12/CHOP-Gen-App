import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { writeFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";

function buildParser() {
  return (tag: string) => {
    const splitted = tag.split(".");
    return {
      get(scope: any, context: any) {
        if (tag === ".") return scope;
        const chain = [scope, ...(context?.scopeList ?? [])];
        for (const root of chain) {
          let s = root;
          let ok = true;
          for (const key of splitted) {
            if (s == null || !(key in s)) {
              ok = false;
              break;
            }
            s = s[key];
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
): Promise<void> {
  const arrayBuffer = await fetch(templateUrl).then((r) => r.arrayBuffer());

  const doc = new Docxtemplater(new PizZip(arrayBuffer), {
    paragraphLoop: true,
    linebreaks: true,
    parser: buildParser(),
  });

  doc.render(data);

  const buffer = doc.toBlob();
  await writeFile(
    `${await path.desktopDir()}/${outputFileName}.docx`,
    new Uint8Array(await buffer.arrayBuffer()),
  );
}
