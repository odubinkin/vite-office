/** @fileoverview Native DOCX run schema order and UTF16 segment output, split from the same upstream docxattributeoutput.cxx at the enforced file-size boundary. */
import { FastSerializerHelper, FSNS } from "../../../../sax/inc/fshelper";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import {
  fontThemeProperties,
  readThemeFontProperty,
} from "../../writerfilter/dmapper/ThemeHandler.fonts";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { Reference as RtlReference } from "../../../../sal/inc/rtl/ref";
import type { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { readTextEffect } from "../../writerfilter/dmapper/TextEffectsHandler";
import type { DrawingTextEffect } from "../../writerfilter/dmapper/TextEffectsHandler.drawing";
const w = token("w");
const w14 = token("w14");
/** Original InitCollectedRunProperties schema order shared by the actual attribute owner. */
export const runOrder = [
  FSNS(token("w"), token("del")),
  FSNS(token("w"), token("ins")),
  FSNS(token("w"), token("moveFrom")),
  FSNS(token("w"), token("moveTo")),
  FSNS(token("w"), token("rStyle")),
  FSNS(token("w"), token("rFonts")),
  FSNS(token("w"), token("b")),
  FSNS(token("w"), token("bCs")),
  FSNS(token("w"), token("i")),
  FSNS(token("w"), token("iCs")),
  FSNS(token("w"), token("caps")),
  FSNS(token("w"), token("smallCaps")),
  FSNS(token("w"), token("strike")),
  FSNS(token("w"), token("dstrike")),
  FSNS(token("w"), token("outline")),
  FSNS(token("w"), token("shadow")),
  FSNS(token("w"), token("emboss")),
  FSNS(token("w"), token("imprint")),
  FSNS(token("w"), token("noProof")),
  FSNS(token("w"), token("snapToGrid")),
  FSNS(token("w"), token("vanish")),
  FSNS(token("w"), token("webHidden")),
  FSNS(token("w"), token("color")),
  FSNS(token("w"), token("spacing")),
  FSNS(token("w"), token("w")),
  FSNS(token("w"), token("kern")),
  FSNS(token("w"), token("position")),
  FSNS(token("w"), token("sz")),
  FSNS(token("w"), token("szCs")),
  FSNS(token("w"), token("highlight")),
  FSNS(token("w"), token("u")),
  FSNS(token("w"), token("effect")),
  FSNS(token("w"), token("bdr")),
  FSNS(token("w"), token("shd")),
  FSNS(token("w"), token("fitText")),
  FSNS(token("w"), token("vertAlign")),
  FSNS(token("w"), token("rtl")),
  FSNS(token("w"), token("cs")),
  FSNS(token("w"), token("em")),
  FSNS(token("w"), token("lang")),
  FSNS(token("w"), token("eastAsianLayout")),
  FSNS(token("w"), token("specVanish")),
  FSNS(token("w"), token("oMath")),
  FSNS(token("w"), token("rPrChange")),
  FSNS(token("w14"), token("glow")),
  FSNS(token("w14"), token("shadow")),
  FSNS(token("w14"), token("reflection")),
  FSNS(token("w14"), token("textOutline")),
  FSNS(token("w14"), token("textFill")),
  FSNS(token("w14"), token("scene3d")),
  FSNS(token("w14"), token("props3d")),
  FSNS(token("w14"), token("ligatures")),
  FSNS(token("w14"), token("numForm")),
  FSNS(token("w14"), token("numSpacing")),
  FSNS(token("w14"), token("stylisticSets")),
  FSNS(token("w14"), token("cntxtAlts")),
];
/** Native file-local UTF16 segment writer; begin is the erased pointer-reference binding. @param serializer - Actual serializer. @param textToken - Native text token. @param text - UTF16 buffer. @param begin - Mutable pointer index. @param end - End pointer index. @param move - Advance past delimiter. @param symbolFont - Original final-segment symbol font. @returns Whether a nonempty segment was written. */
export function impl_WriteRunText(
  serializer: FastSerializerHelper,
  textToken: number,
  text: string,
  begin: [number],
  end: number,
  move = true,
  symbolFont = "",
): boolean {
  const start = begin[0];
  if (move) begin[0] = end + 1;
  if (start >= end) return false;
  if (symbolFont) {
    for (let index = start; index < end; ++index)
      serializer.singleElementNS(
        w,
        token("sym"),
        FSNS(w, token("font")),
        symbolFont,
        FSNS(w, token("char")),
        text.charCodeAt(index).toString(16).padStart(4, "0"),
      );
  } else {
    if (text.charCodeAt(start) === 32 || text.charCodeAt(end - 1) === 32)
      serializer.startElementNS(w, textToken, FSNS(token("xml"), token("space")), "preserve");
    else serializer.startElementNS(w, textToken);
    serializer.writeEscaped(text.slice(start, end));
    serializer.endElementNS(w, textToken);
  }
  return true;
}

/** Original palette-to-Word highlight mapping; the actual owner delegates without changing unsigned8 narrowing. @param index - Native palette index. @returns Literal token or empty text. */
export function TransHighlightColor(index: number): string {
  return (
    [
      "none",
      "black",
      "blue",
      "cyan",
      "green",
      "magenta",
      "red",
      "yellow",
      "white",
      "darkBlue",
      "darkCyan",
      "darkGreen",
      "darkMagenta",
      "darkRed",
      "darkYellow",
      "darkGray",
      "lightGray",
    ][index & 255] ?? ""
  );
}

/** Writes a native drawing text effect element and its ordered children. @param serializer - Active DOCX serializer. @param effect - Original interoperability node. @returns Nothing. */
function writeDrawingTextEffect(serializer: FastSerializerHelper, effect: DrawingTextEffect): void {
  const element = token(effect.name);
  const attributes = effect.attributes.flatMap(
    /** Formats one native attribute. @param pair - Name and value. @returns Serializer pair. */
    ([name, value]) => [FSNS(w14, token(name)), String(value)],
  );
  if (!effect.children.length) {
    serializer.singleElementNS(w14, element, ...attributes);
    return;
  }
  serializer.startElementNS(w14, element, ...attributes);
  for (const child of effect.children) writeDrawingTextEffect(serializer, child);
  serializer.endElementNS(w14, element);
}

/** Writes represented Word text effects inside the collected run property mark. @param serializer - Active DOCX serializer. @param item - Writer character interoperability item. @returns Whether an explicit text fill was written. */
export function CharGrabBag(serializer: FastSerializerHelper, item: SfxGrabBagItem): boolean {
  let explicitTextFill = false;
  for (const [key, value] of item.GetGrabBag()) {
    const effect = readTextEffect(key, value);
    if (!effect) continue;
    const [name, payload] = effect;
    if (payload && typeof payload !== "string" && "attributes" in payload) {
      writeDrawingTextEffect(serializer, payload);
      explicitTextFill ||= name === "textFill";
      continue;
    }
    const element = token(name);
    if (typeof payload === "string" || !payload?.length) {
      serializer.singleElementNS(
        w14,
        element,
        FSNS(w14, token("val")),
        typeof payload === "string" ? payload : null,
      );
      continue;
    }
    serializer.startElementNS(w14, element);
    for (const [child, attributes] of payload) {
      const lexical = attributes.flatMap(
        /** Formats the native int32 or string attribute for serialization. @param pair - Typed attribute. @returns Serializer pair. */
        ([attribute, literal]) => [FSNS(w14, token(attribute)), String(literal)],
      );
      serializer.singleElementNS(w14, token(child), ...lexical);
    }
    serializer.endElementNS(w14, element);
  }
  return explicitTextFill;
}

/** Retains theme references when the effective concrete font still matches the imported font. @param attributes - Existing collected rFonts attributes. @param item - Native character interoperability bag. @param add - Original lazy attribute writer. @returns Nothing. */
export function ExportThemeFonts(
  attributes: RtlReference<FastAttributeList>,
  item: SfxGrabBagItem,
  add: (attributes: RtlReference<FastAttributeList>, token: number, value: string) => void,
): void {
  const fonts = attributes.get();
  const bag = item.GetGrabBag();
  for (const [key, attribute, concrete, originalKey] of fontThemeProperties) {
    const entry = bag.get(key);
    if (!entry) continue;
    const themed = FSNS(w, token(attribute));
    const original = bag.get(originalKey);
    if (fonts && original) {
      const name = fonts.getOptionalValue(FSNS(w, token(concrete)));
      try {
        const expected = readThemeFontProperty(original);
        if (expected !== undefined && (text(name) !== expected || fonts.hasAttribute(themed)))
          continue;
      } finally {
        name.dispose();
      }
    }
    const value = readThemeFontProperty(entry);
    if (value !== undefined) add(attributes, themed, value);
  }
}

/** Original header template creates the intrusive owner once and forwards source arguments. @param attributes - Actual mutable handle. @param args - Original add overload arguments. @returns Nothing. */
export function AddToAttrList(
  attributes: RtlReference<FastAttributeList>,
  ...args: Parameters<FastAttributeList["add"]>
): void {
  if (!attributes.is()) {
    const created = FastSerializerHelper.createAttrList();
    try {
      attributes.moveAssign(created);
    } finally {
      created.dispose();
    }
  }
  attributes.operatorArrow().add(...args);
}
