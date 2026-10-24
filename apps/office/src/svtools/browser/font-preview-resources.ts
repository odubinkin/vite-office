/** @fileoverview Real browser face metadata and private FontFace resources for FontNameBox painting; native FontList owns ordering and browser APIs own shaping/lifetime. */
import { rememberBrowserFontPreviewFace } from "../../vcl/browser/font-preview-registration";
import { Font, type ConstFont } from "../../vcl/source/font/font";
import { FontItalic as I, FontWeight as W } from "../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
} from "../../sal/inc/rtl/textenc";
import { FontList, readBrowserPhysicalFont, type BrowserPhysicalFont } from "./font-list";
import { readSfntFontTable } from "../../vcl/browser/sfnt-font-table";
import {
  collectCmapUnicodes,
  findBestCmapSubtableDetails,
} from "../../external/harfbuzz/src/hb-ot-cmap-table";
import { readFaceGlyphCount } from "../../external/harfbuzz/src/hb-static";
import { makeFontCharMap, readOs2FontCapabilities } from "../../vcl/source/font/PhysicalFontFace";
import type { BrowserFontPreviewFace } from "../../vcl/browser/font-preview-device";

/** Actual acquired preview: original logical metric plus the exact file-backed browser rendering face. */
export interface BrowserFontNamePreview {
  readonly metric: Font;
  readonly face: BrowserFontPreviewFace;
}

/** Browser descriptor projection only; unavailable native family,pitch,named style and local weight/slant remain unknown. CSS descriptors are not parsed as native named styles. @param physical - Actual browser face record. @returns Represented metric values used by native FontList ordering. */
export function getBrowserPreviewMetric(physical: BrowserPhysicalFont): Font {
  const metric = new Font();
  metric.SetFamilyName(physical.family);
  if (physical.kind === "local") {
    metric.SetStyleName(physical.data.style ?? "");
    metric.SetItalic(I.ITALIC_DONTKNOW);
    return metric;
  }
  const style = physical.face.style;
  metric.SetItalic(
    style === "normal"
      ? I.ITALIC_NONE
      : style === "italic"
        ? I.ITALIC_NORMAL
        : style.startsWith("oblique")
          ? I.ITALIC_OBLIQUE
          : I.ITALIC_DONTKNOW,
  );
  const weights = new Map<string, W>([
    ["normal", W.WEIGHT_NORMAL],
    ["bold", W.WEIGHT_BOLD],
    ["100", W.WEIGHT_THIN],
    ["200", W.WEIGHT_ULTRALIGHT],
    ["300", W.WEIGHT_LIGHT],
    ["350", W.WEIGHT_SEMILIGHT],
    ["400", W.WEIGHT_NORMAL],
    ["500", W.WEIGHT_MEDIUM],
    ["600", W.WEIGHT_SEMIBOLD],
    ["700", W.WEIGHT_BOLD],
    ["800", W.WEIGHT_ULTRABOLD],
    ["900", W.WEIGHT_BLACK],
  ]);
  metric.SetWeight(weights.get(physical.face.weight) ?? W.WEIGHT_DONTKNOW);
  return metric;
}

/** Owns browser FontFaceSet registrations for one live font selector. These are ordinary browser resources,not a port of C++ face/refcount/cache machinery. */
export class BrowserFontPreviewResources {
  private readonly pending = new Map<
    BrowserPhysicalFont,
    Promise<BrowserFontNamePreview | undefined>
  >();
  private readonly installed = new Set<FontFace>();
  private active = true;

  /** Binds the actual UTF8 application document's font device. @param document_ - Owning browser document. @returns Resource owner. */
  public constructor(private readonly document_: Document = document) {}

  /** Resolves native metric order before loading only the retained physical file. Document charset is an explicit browser device boundary;other document encodings remain unknown. @param list - Actual family inventory. @param family - Requested family. @returns Acquired preview or unknown. */
  public Get(list: FontList, family: string): Promise<BrowserFontNamePreview | undefined> {
    if (!this.active || this.document_.characterSet !== "UTF-8") return Promise.resolve(undefined);
    const metrics = new Map<BrowserPhysicalFont, Font>();
    for (const physical of list.GetBrowserFaces(family))
      metrics.set(physical, getBrowserPreviewMetric(physical));
    const selected = list.GetBrowserPreviewMetric(family, metrics, RTL_TEXTENCODING_UTF8);
    if (selected === undefined) return Promise.resolve(undefined);
    const existing = this.pending.get(selected.value);
    if (existing !== undefined) return existing;
    const promise = this.acquire(selected.value, selected.metric);
    this.pending.set(selected.value, promise);
    return promise;
  }

  /** Acquires exact standalone bytes and installs a private rendering family so CSS fallback/duplicate family rules cannot silently select another physical file. TTC selection remains unknown without an actual resolved face index. @param physical - Retained actual record. @param metric - Source-selected represented metric snapshot. @returns Actual preview or unknown. */
  private async acquire(
    physical: BrowserPhysicalFont,
    metric: ConstFont,
  ): Promise<BrowserFontNamePreview | undefined> {
    const source = await readBrowserPhysicalFont(physical);
    if (source === undefined || !this.active) return undefined;
    const bytes = new Uint8Array(source);
    if (String.fromCharCode(...bytes.subarray(0, 4)) === "ttcf") return undefined;
    const cmap = readSfntFontTable(bytes, "cmap");
    if (cmap === undefined) return undefined;
    const detail = findBestCmapSubtableDetails(cmap);
    const font = new Font(metric);
    font.SetCharSet(detail?.symbol === true ? RTL_TEXTENCODING_SYMBOL : RTL_TEXTENCODING_UNICODE);
    const glyphs = readFaceGlyphCount(
      readSfntFontTable(bytes, "maxp"),
      readSfntFontTable(bytes, "head"),
      readSfntFontTable(bytes, "loca"),
    );
    const characterMap = makeFontCharMap(
      collectCmapUnicodes(cmap, glyphs),
      detail?.symbol === true,
    );
    const os2 = readSfntFontTable(bytes, "OS/2");
    const capabilities = os2 === undefined ? undefined : readOs2FontCapabilities(os2);
    const renderingFamily = `office-font-preview-${Array.from(
      crypto.getRandomValues(new Uint32Array(4)),
      /** Encodes native random words for a private CSS identity; no secure-context-only UUID API is required. @param word - Random uint32. @returns Fixed hexadecimal component. */ (
        word,
      ) => word.toString(16).padStart(8, "0"),
    ).join("")}`;
    // The acquired file supplies its actual outlines. Normal CSS descriptors avoid synthesizing
    // a second bold/slant on an already bold/italic physical file,including opaque local metadata.
    const face = new FontFace(renderingFamily, source);
    rememberBrowserFontPreviewFace(face);
    await face.load();
    if (!this.active) return undefined;
    this.document_.fonts.add(face);
    this.installed.add(face);
    return {
      metric: font,
      face: { characterMap, capabilities, renderingFamily, style: "normal", weight: "400" },
    };
  }

  /** Releases only private FontFace registrations owned by this selector; original bundled/document/system faces are untouched. Pending loads cannot publish after disposal. @returns Nothing. */
  public dispose(): void {
    this.active = false;
    for (const face of this.installed) this.document_.fonts.delete(face);
    this.installed.clear();
    this.pending.clear();
  }
}
