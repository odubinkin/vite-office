/** @fileoverview Resolves unambiguous same-origin CSS font sources from actual CSSOM declarations and registered face descriptors. */
import { lower } from "../../i18nlangtag/source/isolang/isolang.tables";
import { decodeBrowserFontFamily } from "./font-family";

/** Extracts one CSSOM-serialized URL, optionally qualified by a supported single format; fallback lists and local/technology alternatives remain unknown. @param source - CSSOM src serialization. @param base - Actual stylesheet URL or document base. @returns Resolved source URL or undefined. */
export function getSingleCssFontUrl(source: string, base: string): URL | undefined {
  const string = String.raw`("(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*')`;
  const match = new RegExp(
    `^url\\(\\s*${string}\\s*\\)(?:\\s+format\\(\\s*${string}\\s*\\))?$`,
    "i",
  ).exec(source.trim());
  if (match === null) return undefined;
  const format = match[2] === undefined ? undefined : decodeBrowserFontFamily(match[2]);
  if (format !== undefined && format !== "truetype" && format !== "opentype") return undefined;
  try {
    return new URL(decodeBrowserFontFamily(match[1] as string), base);
  } catch {
    return undefined;
  }
}

/** Actual matching descriptors rather than a guessed font-name registry. */
interface Descriptors {
  readonly family: string;
  readonly style: string;
  readonly weight: string;
  readonly stretch: string;
  readonly unicodeRange: string;
}

/** Normalizes only descriptor spelling equivalences, retaining variable ranges and exact source faces. @param face - Actual CSS descriptors. @returns Stable matching key. */
function key(face: Descriptors): string {
  const weight = face.weight === "normal" ? "400" : face.weight === "bold" ? "700" : face.weight;
  return JSON.stringify([
    lower(decodeBrowserFontFamily(face.family)),
    face.style,
    weight,
    face.stretch,
    face.unicodeRange.replace(/\s/g, "").toUpperCase(),
  ]);
}

/** Finds only one-to-one declarations; opaque sheets, inactive conditions, ambiguous faces and source alternatives never acquire fabricated byte metadata. @param document - Active document. @param faces - Actual registered faces. @returns Known source URLs keyed by actual registered identity. */
export function getCssFontFaceSources(
  document: Document,
  faces: readonly FontFace[],
): ReadonlyMap<FontFace, string> {
  const declarations = new Map<string, string[]>();
  const visited = new Set<CSSStyleSheet>();
  const view = document.defaultView;
  /** Checks actual browser media state; absent conditional APIs cannot establish an active source. @param media - Actual media text. @returns Whether active. */
  function matches(media: string): boolean {
    return media === "" || media === "all" || view?.matchMedia?.(media).matches === true;
  }
  /** Traverses connected CSSOM without reading inaccessible cross-origin sheets. @param sheet - Actual stylesheet. @returns Nothing. */
  function sheetRules(sheet: CSSStyleSheet): void {
    if (visited.has(sheet) || sheet.disabled || !matches(sheet.media?.mediaText ?? "")) return;
    visited.add(sheet);
    let list: CSSRuleList;
    try {
      list = sheet.cssRules;
    } catch {
      return; // Opaque stylesheets do not expose CSSOM sources.
    }
    rules(list, sheet.href ?? document.baseURI);
  }
  /** Reads actual declarations and active grouping rules. @param list - Actual rule list. @param base - Current stylesheet URL. @returns Nothing. */
  function rules(list: CSSRuleList, base: string): void {
    for (const rule of list) {
      if (rule.type === 5) {
        const style = (rule as CSSFontFaceRule).style;
        const descriptor = {
          family: style.getPropertyValue("font-family"),
          style: style.getPropertyValue("font-style") || "normal",
          weight: style.getPropertyValue("font-weight") || "normal",
          stretch: style.getPropertyValue("font-stretch") || "normal",
          unicodeRange: style.getPropertyValue("unicode-range") || "U+0-10FFFF",
        };
        const id = key(descriptor);
        const urls = declarations.get(id) ?? [];
        const url = getSingleCssFontUrl(style.getPropertyValue("src"), base);
        // Count opaque/unsupported declarations as ambiguous as well: a supported
        // sibling must not silently become the source of the opaque registered face.
        urls.push(url?.origin === new URL(document.baseURI).origin ? url.href : "");
        declarations.set(id, urls);
      } else if (rule.type === 3) {
        const imported = rule as CSSImportRule;
        if (imported.styleSheet !== null && matches(imported.media.mediaText))
          sheetRules(imported.styleSheet);
      } else if ("cssRules" in rule) {
        if (rule.type === 4 && !matches((rule as CSSMediaRule).conditionText)) continue;
        if (rule.type === 12 && !view?.CSS?.supports?.((rule as CSSSupportsRule).conditionText))
          continue;
        rules((rule as CSSGroupingRule).cssRules, base);
      }
    }
  }
  for (const sheet of document.styleSheets) sheetRules(sheet);
  for (const sheet of document.adoptedStyleSheets ?? []) sheetRules(sheet);
  const grouped = new Map<string, FontFace[]>();
  for (const face of faces) {
    const id = key(face);
    const group = grouped.get(id) ?? [];
    group.push(face);
    grouped.set(id, group);
  }
  const result = new Map<FontFace, string>();
  for (const [id, group] of grouped) {
    const urls = declarations.get(id);
    if (group.length === 1 && urls?.length === 1 && urls[0] !== "")
      result.set(group[0] as FontFace, urls[0] as string);
  }
  return result;
}
