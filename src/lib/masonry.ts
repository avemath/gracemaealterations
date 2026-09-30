import type { SanityImage } from "./sanity.queries";

/** Height of a photo per unit of width, after any crop set in the Studio. */
function heightPerWidth(image?: SanityImage | null): number {
  const d = image?.asset?.metadata?.dimensions;
  if (!d?.width || !d?.height) return 1.25;
  const c = image?.crop;
  const w = d.width * (1 - (c?.left ?? 0) - (c?.right ?? 0));
  const h = d.height * (1 - (c?.top ?? 0) - (c?.bottom ?? 0));
  return w > 0 && h > 0 ? h / w : 1.25;
}

/**
 * Splits photos into columns that end level.
 *
 * CSS columns fill top to bottom, one column after another, and can only
 * split the list where it falls, so a few tall photos in a row left one
 * column far shorter than the others. The first row keeps the list's order,
 * each photo after it goes to whichever column is shortest so far, and the
 * last few are placed by trying every arrangement and keeping the levelest.
 */
export function balanceColumns<T extends { image?: SanityImage | null }>(items: T[], columns = 3, gap = 0.03): T[][] {
  const sizes = items.map((item) => heightPerWidth(item.image) + gap);
  const assign = new Array<number>(items.length).fill(0);
  const heights = new Array<number>(columns).fill(0);

  const tailStart = Math.max(Math.min(columns, items.length), items.length - 8);
  for (let i = 0; i < tailStart; i++) {
    let c = 0;
    if (i < columns) c = i;
    else for (let k = 1; k < columns; k++) if (heights[k] < heights[c] - 1e-9) c = k;
    assign[i] = c;
    heights[c] += sizes[i];
  }

  // 3^8 = 6,561 arrangements at most, so this is instant.
  const tail = items.length - tailStart;
  let best = Infinity;
  let bestCode = 0;
  for (let code = 0; code < columns ** tail; code++) {
    const h = heights.slice();
    for (let t = 0, rest = code; t < tail; t++, rest = Math.floor(rest / columns)) h[rest % columns] += sizes[tailStart + t];
    const spread = Math.max(...h) - Math.min(...h);
    if (spread < best - 1e-9) {
      best = spread;
      bestCode = code;
    }
  }
  for (let t = 0, rest = bestCode; t < tail; t++, rest = Math.floor(rest / columns)) assign[tailStart + t] = rest % columns;

  const cols: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => cols[assign[i]].push(item));
  return cols;
}
