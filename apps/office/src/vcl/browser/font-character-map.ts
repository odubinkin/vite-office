/** @fileoverview Actual browser source bytes bound to HarfBuzz cmap collection and native PhysicalFontFace character-map projection. */
import { collectCmapUnicodes } from "../../external/harfbuzz/src/hb-ot-cmap-table";
import { readFaceGlyphCount } from "../../external/harfbuzz/src/hb-static";
import { makeFontCharMap } from "../source/font/PhysicalFontFace";
import type { FontCharMap } from "../source/font/fontcharmap";
import { readBrowserPhysicalFont, type BrowserPhysicalFont } from "./font-list";
import { readSfntFontTable } from "./sfnt-font-table";

/** Reads a source face's real character map without fallback-width probes or implicit TTC face selection. @param font - Real physical record. @param microsoftSymbolEncoded - Actual backend encoding flag, explicitly supplied rather than guessed from the family name. @param faceIndex - Resolved collection index; standalone defaults to zero. @returns Source character map or unknown when bytes/collection identity are unavailable. */
export async function readBrowserFontCharMap(
  font: BrowserPhysicalFont,
  microsoftSymbolEncoded: boolean,
  faceIndex?: number,
): Promise<FontCharMap | undefined> {
  const source = await readBrowserPhysicalFont(font);
  if (source === undefined) return undefined;
  const bytes = new Uint8Array(source);
  if (faceIndex === undefined && String.fromCharCode(...bytes.subarray(0, 4)) === "ttcf")
    return undefined;
  const table = readSfntFontTable(bytes, "cmap", faceIndex ?? 0);
  const glyphs = readFaceGlyphCount(
    readSfntFontTable(bytes, "maxp", faceIndex ?? 0),
    readSfntFontTable(bytes, "head", faceIndex ?? 0),
    readSfntFontTable(bytes, "loca", faceIndex ?? 0),
  );
  return makeFontCharMap(
    table === undefined ? new Set() : collectCmapUnicodes(table, glyphs),
    microsoftSymbolEncoded,
  );
}
