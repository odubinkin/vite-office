/** @fileoverview Native wwFont FFN identity and wwFontHelper registration/vector owners. Font-table initialization/export association, binary output and DOCX embedding remain in their respective unported responsibilities. */
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import type { RtfAttributeOutput } from "./rtfattributeoutput";
import {
  FontMapExport,
  rtl_TextEncodingToWinCharsetRTF,
  rtl_TextEncodingToWinCharset,
} from "./writerwordglue";
/** Native FFN identity and original font properties. */
export class wwFont {
  readonly maWW8_FFN = new Uint8Array(6);
  readonly msFamilyNm: string;
  readonly msAltNm: string;
  readonly mbAlt: boolean;
  readonly mePitch: FontPitch;
  readonly meFamily: FontFamily;
  readonly meChrSet: rtl_TextEncoding;
  /** Original value and implicit-copy constructors. @param args - Selected native arguments. @returns Font value. */
  constructor(
    ...args:
      | [familyName: string, pitch: FontPitch, family: FontFamily, encoding: rtl_TextEncoding]
      | [source: wwFont]
  ) {
    const first = args[0];
    if (typeof first !== "string") {
      this.msFamilyNm = first.msFamilyNm;
      this.msAltNm = first.msAltNm;
      this.mbAlt = first.mbAlt;
      this.mePitch = first.mePitch;
      this.meFamily = first.meFamily;
      this.meChrSet = first.meChrSet;
      this.maWW8_FFN.set(first.maWW8_FFN);
      return;
    }
    const [familyName, mePitch, meFamily, meChrSet] = args as [
      string,
      FontPitch,
      FontFamily,
      rtl_TextEncoding,
    ];
    this.mePitch = mePitch;
    this.meFamily = meFamily;
    this.meChrSet = meChrSet & 0xffff;
    const mapped = new FontMapExport(familyName);
    this.msFamilyNm = mapped.msPrimary;
    this.msAltNm = mapped.msSecondary;
    this.mbAlt =
      !!this.msAltNm &&
      this.msAltNm !== this.msFamilyNm &&
      this.msFamilyNm.length + this.msAltNm.length + 2 <= 65;
    this.maWW8_FFN[0] = 5 + 0x22 + 2 * (1 + this.msFamilyNm.length);
    if (this.mbAlt)
      this.maWW8_FFN[0] = (this.maWW8_FFN[0] as number) + 2 * (1 + this.msAltNm.length);
    let flags = 0;
    switch (mePitch) {
      case FontPitch.PITCH_VARIABLE:
        flags |= 2;
        break;
      case FontPitch.PITCH_FIXED:
        flags |= 1;
        break;
    }
    flags |= 4;
    switch (meFamily) {
      case FontFamily.FAMILY_ROMAN:
        flags |= 1 << 4;
        break;
      case FontFamily.FAMILY_SWISS:
        flags |= 2 << 4;
        break;
      case FontFamily.FAMILY_MODERN:
        flags |= 3 << 4;
        break;
      case FontFamily.FAMILY_SCRIPT:
        flags |= 4 << 4;
        break;
      case FontFamily.FAMILY_DECORATIVE:
        flags |= 5 << 4;
        break;
    }
    this.maWW8_FFN[1] = flags;
    this.maWW8_FFN[2] = 0x90;
    this.maWW8_FFN[3] = 1;
    this.maWW8_FFN[4] = rtl_TextEncodingToWinCharset(meChrSet);
    if (this.mbAlt) this.maWW8_FFN[5] = this.msFamilyNm.length + 1;
  }
  /** Native font metadata path for the current kernel without font embedding. EmbedFont responsibility is unported, not replaced by a dummy service. @param output - Actual DOCX owner. @returns Nothing. */
  WriteDocx(output: DocxAttributeOutput): void {
    if (!this.msFamilyNm) return;
    output.StartFont(this.msFamilyNm);
    if (this.mbAlt) output.FontAlternateName(this.msAltNm);
    output.FontCharset(rtl_TextEncodingToWinCharset(this.meChrSet));
    output.FontFamilyType(this.meFamily);
    output.FontPitchType(this.mePitch);
    output.EndFont();
  }
  /** Original font-table emission uses complete metadata and the shared RTF font charset predicate. @param output - Actual RTF attribute sink. @returns Nothing. */
  WriteRtf(output: RtfAttributeOutput): void {
    output.FontFamilyType(this.meFamily, this);
    output.FontPitchType(this.mePitch);
    output.FontCharset(
      rtl_TextEncodingToWinCharsetRTF(this.msFamilyNm, this.msAltNm, this.meChrSet),
    );
    output.StartFont(this.msFamilyNm);
    if (this.mbAlt) output.FontAlternateName(this.msAltNm);
    output.EndFont();
  }
}
/** Original memcmp-then-Unicode ordering defines map identity. @param left - Left font. @param right - Right font. @returns Strict ordering. */
export function wwFontLess(left: wwFont, right: wwFont): boolean {
  let result = 0;
  for (let index = 0; index < 6; ++index) {
    result = (left.maWW8_FFN[index] as number) - (right.maWW8_FFN[index] as number);
    if (result) break;
  }
  if (!result) {
    result = left.msFamilyNm < right.msFamilyNm ? -1 : left.msFamilyNm > right.msFamilyNm ? 1 : 0;
    if (!result) result = left.msAltNm < right.msAltNm ? -1 : left.msAltNm > right.msAltNm ? 1 : 0;
  }
  return result < 0;
}
/** Native ordered font map retains insertion IDs independently of map order. */
export class wwFontHelper {
  private readonly maFonts: { font: wwFont; id: number }[] = [];
  /** Native font/item overload preserves original equivalence and sal_uInt16 ID narrowing. @param item - Actual font or shared font item. @returns Font ID. */
  GetId(item: wwFont | SvxFontItem): number {
    const font =
      item instanceof SvxFontItem
        ? new wwFont(item.GetFamilyName(), item.GetPitch(), item.GetFamily(), item.GetCharSet())
        : item;
    let index = 0;
    while (
      index < this.maFonts.length &&
      wwFontLess((this.maFonts[index] as { font: wwFont }).font, font)
    )
      ++index;
    const existing = this.maFonts[index];
    if (existing && !wwFontLess(font, existing.font)) return existing.id;
    const id = this.maFonts.length & 0xffff;
    this.maFonts.splice(index, 0, { font: new wwFont(font), id });
    return id;
  }
  /** Original font-table writer visits the ID-indexed vector. @param output - Actual RTF attribute sink. @returns Nothing. */
  WriteFontTable(output: RtfAttributeOutput | DocxAttributeOutput): void {
    for (const font of this.AsVector()) {
      if ("GetSerializer" in output) (font as wwFont).WriteDocx(output);
      else (font as wwFont).WriteRtf(output);
    }
  }
  /** Original vector is indexed by assigned ID, not sorted map position. @returns Borrowed registered fonts in ID order. */
  AsVector(): readonly (wwFont | null)[] {
    const fonts: (wwFont | null)[] = new Array<wwFont | null>(this.maFonts.length).fill(null);
    for (const { font, id } of this.maFonts) fonts[id] = font;
    return fonts;
  }
}

/** @fileoverview Builds the represented paragraph-style slots of pinned MSWordStyles. */
import { getWriterParagraphStyleDefinition } from "../../../inc/poolfmt";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";

/** Word reserves slots 0-14 before document character and paragraph styles. */
const WW8_RESERVED_SLOTS = 15;
const MSWORD_MAX_STYLES_LIMIT = 4091;
const STANDARD = getWriterParagraphStyleDefinition("default")?.poolId;
const HEADLINE1 = getWriterParagraphStyleDefinition("heading-1")?.poolId;
const HEADLINE9 = getWriterParagraphStyleDefinition("heading-9")?.poolId;

/** Current pool subset of GetWWId plus ww::GetEnglishNameFromSti. */
const WORD_PARAGRAPH_STYLE_NAMES: ReadonlyMap<string, string> = new Map([
  ["default", "Normal"],
  ...Array.from(
    { length: 9 },
    /** Maps source heading names. @param _unused - Empty slot. @param index - Zero-based heading level. @returns Native ID and Word name. */ (
      _,
      index,
    ): [string, string] => [`heading-${index + 1}`, `heading ${index + 1}`],
  ),
  ["footnote", "footnote text"],
  ["marginalia", "annotation text"],
  ["caption", "caption"],
  ["endnote", "endnote text"],
  ["title", "Title"],
  ["appendix", "Closing"],
  ["text-body", "Body Text"],
  ["text-body-indent", "Body Text Indent"],
  ["subtitle", "Subtitle"],
  ["first-line-indent", "Body Text First Indent"],
]);

/** Source OUString::toAsciiLowerCase leaves non-ASCII letters unchanged. @param value - Style name. @returns ASCII-folded key. */
function asciiLowerCase(value: string): string {
  return value.replace(
    /[A-Z]/g,
    /** Folds one ASCII uppercase letter. @param character - Matched letter. @returns Lowercase ASCII. */ (
      character,
    ) => character.toLowerCase(),
  );
}

/** Source MSWordStyles::BuildStylesTable and GetSlot for the current paragraph-style graph. */
export class MSWordStyles {
  private readonly styles: (SwTextFormatColl | undefined)[] =
    Array(WW8_RESERVED_SLOTS).fill(undefined);
  private readonly slots = new Map<SwTextFormatColl, number>();
  private readonly names = new Map<SwTextFormatColl, string>();

  /** Collects materialized named collections; this core's first collection is Standard. @param document - Owning Writer document. @returns Nothing. */
  public constructor(document: SwDoc) {
    for (const collection of document.GetTextFormatColls()) {
      const poolId = collection.poolId;
      const reserved =
        poolId === STANDARD
          ? 0
          : HEADLINE1 !== undefined &&
              HEADLINE9 !== undefined &&
              poolId >= HEADLINE1 &&
              poolId <= HEADLINE9
            ? poolId - HEADLINE1 + 1
            : undefined;
      if (reserved === undefined && this.styles.length >= MSWORD_MAX_STYLES_LIMIT) continue;
      const slot = reserved ?? this.styles.length;
      this.styles[slot] = collection;
      this.slots.set(collection, slot);
    }
    const used = new Set<string>(["normal"]);
    const normal = this.styles[0];
    if (normal !== undefined) this.names.set(normal, "Normal");
    /** Applies source case-insensitive ASCII suffix allocation. @param name - Candidate name. @returns Unique Word name. */
    const uniqueName =
      /** Implements unique Name. @param name - Name. @returns The string result. */ (
        name: string,
      ): string => {
        const key = asciiLowerCase(name);
        if (!used.has(key)) {
          used.add(key);
          return name;
        }
        let suffix = 1;
        while (used.has(`${key}${suffix}`)) suffix++;
        used.add(`${key}${suffix}`);
        return `${name}${suffix}`;
      };
    // BuildWwNames gives built-in Word names priority over user names.
    for (const collection of this.styles) {
      if (collection === undefined || this.names.has(collection)) continue;
      const builtin = [...WORD_PARAGRAPH_STYLE_NAMES].find(
        /** Matches a native builtin pool identity. @param entry - Style ID and Word name. @returns Whether the collection has this pool ID. */ ([
          id,
        ]) => getWriterParagraphStyleDefinition(id)?.poolId === collection.poolId,
      )?.[1];
      if (builtin !== undefined) this.names.set(collection, uniqueName(builtin));
    }
    for (const collection of this.styles) {
      if (collection === undefined || this.names.has(collection)) continue;
      this.names.set(collection, uniqueName(collection.GetName().replace(/ \(WW\)$/, "")));
    }
  }

  /** Returns the source Word slot, or its missing-style sentinel. @param collection - Native collection. @returns Slot or 0x0fff. */
  public GetSlot(collection: SwTextFormatColl | undefined): number {
    return collection === undefined ? 0x0fff : (this.slots.get(collection) ?? 0x0fff);
  }

  /** Returns source slot order, including reserved empty slots. @returns Native style slots. */
  public GetStyles(): readonly (SwTextFormatColl | undefined)[] {
    return this.styles;
  }

  /** Returns BuildWwNames output for an exported style. @param collection - Native collection. @returns Word style name. */
  public GetWWName(collection: SwTextFormatColl): string {
    return this.names.get(collection) ?? collection.GetName();
  }
}
