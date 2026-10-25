/** @fileoverview Browser physical-font records and actual source-byte/capability acquisition; svtools owns FontList grouping and lookup. */
import { text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { readSfntFontTable } from "./sfnt-font-table";
import { readOs2FontCapabilities } from "../source/font/PhysicalFontFace";
import type { FontCapabilities } from "../inc/fontcapabilities";
import { readBrowserFontFaceSource } from "./font-face-source";
import { Font } from "../source/font/font";
import { GetEnglishSearchFontName } from "../../unotools/source/misc/fontdefs";
import { RTL_TEXTENCODING_SYMBOL } from "../../sal/inc/rtl/textenc";

/** Original aStarSymbolRecodeTable input names; only converter availability is needed by makeMissing. */
const symbolRecodeNames = new Set([
  "starbats",
  "starmath",
  "symbol",
  "standardsymbols",
  "standardsymbolsl",
  "monotypesorts",
  "zapfdingbats",
  "itczapfdingbats",
  "dingbats",
  "webdings",
  "wingdings",
  "wingdings2",
  "wingdings3",
  "mtextra",
]);

/** Browser font-list metadata boundary matching FontList::Get's missing-metric branch. Local Font Access exposes names,not native family/pitch metrics,so their native unknown values are retained. @param name - Selected original family spelling. @returns Complete represented VCL font value. */
export function getBrowserFont(name: string): Font {
  const font = new Font();
  font.SetFamilyName(name);
  const units = new Uint16Array(name.length);
  for (let i = 0; i < name.length; ++i) units[i] = name.charCodeAt(i);
  const searchName = GetEnglishSearchFontName(units);
  try {
    if (symbolRecodeNames.has(text(searchName))) font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
  } finally {
    searchName.dispose();
  }
  return font;
}

/** Browser local-font query result used by FontList. */
export interface BrowserLocalFontData {
  readonly family: string;
  readonly fullName?: string;
  readonly postscriptName?: string;
  readonly style?: string;
  readonly blob?: () => Promise<Blob>;
}
/** Actual registered face or approved local-font record; browser metadata is retained without inventing native physical metrics. */
export type BrowserPhysicalFont =
  | Readonly<{ kind: "registered"; family: string; face: FontFace; sourceUrl?: string }>
  | Readonly<{ kind: "local"; family: string; data: BrowserLocalFontData }>;

/** Reads bytes only from an actual source: an owned FontFace constructor buffer or approved Local Font Access blob. @param font - Real physical record. @returns Source bytes or undefined when the platform exposes names only. */
export async function readBrowserPhysicalFont(
  font: BrowserPhysicalFont,
): Promise<ArrayBuffer | undefined> {
  if (font.kind === "registered") {
    const owned = readBrowserFontFaceSource(font.face);
    if (owned !== undefined || font.sourceUrl === undefined) return owned;
    await font.face.load();
    const response = await fetch(font.sourceUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Font source read failed: ${response.status}`);
    return response.arrayBuffer();
  }
  const blob = await font.data.blob?.();
  return blob?.arrayBuffer();
}
/** Reads actual advertised capabilities using the source PhysicalFontFace OS/2 algorithm. A collection requires an explicitly resolved face index; family names never select its first face implicitly. @param font - Real physical source. @param faceIndex - Actual resolved collection index, optional for standalone fonts. @returns Source capability bitsets or unknown. */
export async function readBrowserFontCapabilities(
  font: BrowserPhysicalFont,
  faceIndex?: number,
): Promise<FontCapabilities | undefined> {
  const source = await readBrowserPhysicalFont(font);
  if (source === undefined) return undefined;
  const bytes = new Uint8Array(source);
  if (faceIndex === undefined && String.fromCharCode(...bytes.subarray(0, 4)) === "ttcf")
    return undefined;
  const table = readSfntFontTable(bytes, "OS/2", faceIndex ?? 0);
  return table === undefined ? undefined : readOs2FontCapabilities(table);
}
