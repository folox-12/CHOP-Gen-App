const OWNER = "folox-12";
const REPO = "CHOP-Gen-App";
const LATEST_RELEASE_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

export type UpdateInfo = {
  version: string;
  url: string;
};

// Спрашивает у GitHub коммит последнего релиза и сравнивает с текущей сборкой.
// Коммит зашит в тело релиза в CI как скрытый маркер `<!-- commit: <sha> -->`.
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  // В dev-сборке коммит неизвестен — проверку не выполняем.
  if (__APP_COMMIT__ === "dev") return null;

  // Нет сети — не проверяем обновления.
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;

  try {
    const res = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const body: string = data.body ?? "";
    const latestCommit = body
      .match(/commit:\s*([0-9a-f]{7,40})/i)?.[1]
      ?.slice(0, 7);

    if (!latestCommit) return null;
    if (latestCommit === __APP_COMMIT__) return null; // уже актуальная версия

    return {
      version: data.tag_name ?? "latest",
      url: data.html_url as string,
    };
  } catch {
    return null;
  }
}
