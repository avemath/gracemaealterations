/**
 * A page's scripts are split into files fetched as they are needed. If one
 * fails to arrive (a weak phone signal, or a page left open while a new
 * version of the site went live, so the file it asks for no longer exists),
 * React shows the error screen. A fresh load fixes both, so the error screens
 * reload the page once instead. The timestamp stops a loop if the file is
 * genuinely missing: a second failure within a minute shows the error screen.
 */
const KEY = "gm-chunk-reload";

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Loading (CSS )?chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message)
  );
}

/** Reloads the page and returns true, unless it already did so in the last minute. */
export function reloadOnceForChunkError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 60_000) return false;
    window.sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: reloading without a guard could loop, so don't.
    return false;
  }
  window.location.reload();
  return true;
}
