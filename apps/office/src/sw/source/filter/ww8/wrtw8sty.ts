/** @fileoverview Native wwFont FFN identity and wwFontHelper registration/vector owners. Native initialization consumes the real shared export context; binary output, full document orchestration and DOCX embedding remain separate obligations. */
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
  public m_bLoadAllFonts = false;
  /** Original seed/global/user-default, three-script document traversal and used-list bullet-font registration order. @param owner - Actual Word exporter. @returns Nothing. */
  InitFontTable(owner: MSWordExportBase): void {
    this.GetId(
      new wwFont(
        "Times New Roman",
        FontPitch.PITCH_VARIABLE,
        FontFamily.FAMILY_ROMAN,
        RTL_TEXTENCODING_MS_1252,
      ),
    );
    this.GetId(
      new wwFont(
        "Symbol",
        FontPitch.PITCH_VARIABLE,
        FontFamily.FAMILY_ROMAN,
        RTL_TEXTENCODING_SYMBOL,
      ),
    );
    this.GetId(
      new wwFont(
        "Arial",
        FontPitch.PITCH_VARIABLE,
        FontFamily.FAMILY_SWISS,
        RTL_TEXTENCODING_MS_1252,
      ),
    );
    this.GetId(GetDfltAttr(RES_CHRATR_FONT) as SvxFontItem);
    const userFont = owner.m_rDoc.GetAttrPool().GetUserDefaultItem(RES_CHRATR_FONT);
    if (userFont instanceof SvxFontItem) this.GetId(userFont);
    if (!this.m_bLoadAllFonts) return;
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
      owner.m_rDoc.ForEachCharacterFontItem(
        which,
        false,
        /** Borrows one actual native item and continues traversal. @param font - Original item. @returns Continue. */ (
          font,
        ) => {
          this.GetId(font);
          return true;
        },
      );
    }
    owner.EnsureUsedNumberingTable();
    for (const rule of owner.m_pUsedNumTable as SwNumRule[]) {
      // Original WW8ListManager limits are 1 and 9, even though Writer admits ten levels.
      const count = rule.IsContinusNum() ? 1 : 9;
      for (let level = 0; level < count; ++level) {
        const format = rule.Get(level);
        if (
          format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL ||
          format.GetNumberingType() === SvxNumType.SVX_NUM_BITMAP
        ) {
          const [, font] = owner.GetNumberingLevelBulletStringAndFont(format);
          this.GetId(font);
        }
      }
    }
  }
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

/** Consumed MSWordStyles named-format ownership from pinned wrtw8sty.cxx. */
import { SwPoolFormatId } from "../../../inc/poolfmt";

/** Word reserves slots 0-14 before document character and paragraph styles. */
const WW8_RESERVED_SLOTS = 15;
const MSWORD_MAX_STYLES_LIMIT = 4091;
/** Source OUString::toAsciiLowerCase leaves non-ASCII letters unchanged. @param value - Style name. @returns ASCII-folded key. */
function asciiLowerCase(value: string): string {
  return value.replace(
    /[A-Z]/g,
    /** Folds one ASCII uppercase letter. @param character - Matched letter. @returns Lowercase ASCII. */ (
      character,
    ) => character.toLowerCase(),
  );
}

/** Source named character/paragraph slots and Word names for the represented format graph. */
export class MSWordStyles {
  private readonly m_rExport: MSWordExportBase;
  private readonly styles: (SwFormat | undefined)[] = Array(WW8_RESERVED_SLOTS).fill(undefined);
  private readonly names = new Map<SwFormat, string>();

  /** Collects actual named formats through the native export context; this core has Standard at paragraph index0. @param owner - Actual exporter. @returns Nothing. */
  public constructor(owner: MSWordExportBase) {
    this.m_rExport = owner;
    const document = this.m_rExport.m_rDoc;
    const characters = document.GetCharFormats();
    for (
      let index = 1;
      index < characters.length && this.styles.length < MSWORD_MAX_STYLES_LIMIT;
      ++index
    ) {
      const format = characters[index] as SwFormat;
      if (
        this.m_rExport.GetExportFormat() === MSWordExportFormat.DOCX &&
        format.GetName().startsWith("ListLabel")
      )
        continue;
      this.styles.push(format);
    }
    for (const collection of document.GetTextFormatColls()) {
      const reserved = BuildGetSlot(collection);
      if (reserved === 0x0fff && this.styles.length >= MSWORD_MAX_STYLES_LIMIT) continue;
      const slot = reserved === 0x0fff ? this.styles.length : reserved;
      this.styles[slot] = collection;
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
      const builtin = GetEnglishNameFromSti(MSWordStyles.GetWWId(collection));
      if (builtin !== undefined) this.names.set(collection, uniqueName(builtin));
    }
    for (const collection of this.styles) {
      if (collection === undefined || this.names.has(collection)) continue;
      this.names.set(collection, uniqueName(collection.GetName().replace(/ \(WW\)$/, "")));
    }
  }

  /** Original pool identity mapping for every builtin format family. @param rFormat - Actual format. @returns Word sti identity. */
  public static GetWWId(rFormat: SwFormat): number {
    let nRet: number = sti.stiUser; // user style as default
    const nPoolId = rFormat.GetPoolFormatId();
    if (nPoolId == SwPoolFormatId.COLL_STANDARD) nRet = sti.stiNormal;
    else if (nPoolId >= SwPoolFormatId.COLL_HEADLINE1 && nPoolId <= SwPoolFormatId.COLL_HEADLINE9)
      nRet = nPoolId + sti.stiLevFirst - SwPoolFormatId.COLL_HEADLINE1;
    else if (nPoolId >= SwPoolFormatId.COLL_TOX_IDX1 && nPoolId <= SwPoolFormatId.COLL_TOX_IDX3)
      nRet = nPoolId + sti.stiIndexFirst - SwPoolFormatId.COLL_TOX_IDX1;
    else if (nPoolId >= SwPoolFormatId.COLL_TOX_CNTNT1 && nPoolId <= SwPoolFormatId.COLL_TOX_CNTNT5)
      nRet = nPoolId + sti.stiToc1 - SwPoolFormatId.COLL_TOX_CNTNT1;
    else if (nPoolId >= SwPoolFormatId.COLL_TOX_CNTNT6 && nPoolId <= SwPoolFormatId.COLL_TOX_CNTNT9)
      nRet = nPoolId + sti.stiToc6 - SwPoolFormatId.COLL_TOX_CNTNT6;
    else
      switch (nPoolId) {
        case SwPoolFormatId.COLL_FOOTNOTE:
          nRet = sti.stiFootnoteText;
          break;
        case SwPoolFormatId.COLL_MARGINAL:
          nRet = sti.stiAtnText;
          break;
        case SwPoolFormatId.COLL_HEADER:
          nRet = sti.stiHeader;
          break;
        case SwPoolFormatId.COLL_FOOTER:
          nRet = sti.stiFooter;
          break;
        case SwPoolFormatId.COLL_TOX_IDXH:
          nRet = sti.stiIndexHeading;
          break;
        case SwPoolFormatId.COLL_LABEL:
          nRet = sti.stiCaption;
          break;
        case SwPoolFormatId.COLL_TOX_ILLUS1:
          nRet = sti.stiToCaption;
          break;
        case SwPoolFormatId.COLL_ENVELOPE_ADDRESS:
          nRet = sti.stiEnvAddr;
          break;
        case SwPoolFormatId.COLL_SEND_ADDRESS:
          nRet = sti.stiEnvRet;
          break;
        case SwPoolFormatId.CHR_FOOTNOTE_ANCHOR:
          nRet = sti.stiFootnoteRef;
          break;
        case SwPoolFormatId.CHR_LINENUM:
          nRet = sti.stiLnn;
          break;
        case SwPoolFormatId.CHR_PAGENO:
          nRet = sti.stiPgn;
          break;
        case SwPoolFormatId.CHR_ENDNOTE_ANCHOR:
          nRet = sti.stiEdnRef;
          break;
        case SwPoolFormatId.COLL_ENDNOTE:
          nRet = sti.stiEdnText;
          break;
        case SwPoolFormatId.COLL_TOX_AUTHORITIESH:
          nRet = sti.stiToa;
          break;
        case SwPoolFormatId.COLL_TOX_CNTNTH:
          nRet = sti.stiToaHeading;
          break;
        case SwPoolFormatId.COLL_LISTS_BEGIN:
          nRet = sti.stiList;
          break;
        case SwPoolFormatId.COLL_BULLET_LEVEL1:
          nRet = sti.stiListBullet;
          break;
        case SwPoolFormatId.COLL_NUM_LEVEL1:
          nRet = sti.stiListNumber;
          break;
        case SwPoolFormatId.COLL_BULLET_LEVEL2:
          nRet = sti.stiListBullet2;
          break;
        case SwPoolFormatId.COLL_BULLET_LEVEL3:
          nRet = sti.stiListBullet3;
          break;
        case SwPoolFormatId.COLL_BULLET_LEVEL4:
          nRet = sti.stiListBullet4;
          break;
        case SwPoolFormatId.COLL_BULLET_LEVEL5:
          nRet = sti.stiListBullet5;
          break;
        case SwPoolFormatId.COLL_NUM_LEVEL2:
          nRet = sti.stiListNumber2;
          break;
        case SwPoolFormatId.COLL_NUM_LEVEL3:
          nRet = sti.stiListNumber3;
          break;
        case SwPoolFormatId.COLL_NUM_LEVEL4:
          nRet = sti.stiListNumber4;
          break;
        case SwPoolFormatId.COLL_NUM_LEVEL5:
          nRet = sti.stiListNumber5;
          break;
        case SwPoolFormatId.COLL_DOC_TITLE:
          nRet = sti.stiTitle;
          break;
        case SwPoolFormatId.COLL_DOC_APPENDIX:
          nRet = sti.stiClosing;
          break;
        case SwPoolFormatId.COLL_SIGNATURE:
          nRet = sti.stiSignature;
          break;
        case SwPoolFormatId.COLL_TEXT:
          nRet = sti.stiBodyText;
          break;
        case SwPoolFormatId.COLL_TEXT_MOVE:
          nRet = sti.stiBodyTextInd1;
          break;
        case SwPoolFormatId.COLL_BULLET_NONUM1:
          nRet = sti.stiListCont;
          break;
        case SwPoolFormatId.COLL_BULLET_NONUM2:
          nRet = sti.stiListCont2;
          break;
        case SwPoolFormatId.COLL_BULLET_NONUM3:
          nRet = sti.stiListCont3;
          break;
        case SwPoolFormatId.COLL_BULLET_NONUM4:
          nRet = sti.stiListCont4;
          break;
        case SwPoolFormatId.COLL_BULLET_NONUM5:
          nRet = sti.stiListCont5;
          break;
        case SwPoolFormatId.COLL_DOC_SUBTITLE:
          nRet = sti.stiSubtitle;
          break;
        case SwPoolFormatId.COLL_GREETING:
          nRet = sti.stiSalutation;
          break;
        case SwPoolFormatId.COLL_TEXT_IDENT:
          nRet = sti.stiBodyText1I;
          break;
        case SwPoolFormatId.CHR_INET_NORMAL:
          nRet = sti.stiHyperlink;
          break;
        case SwPoolFormatId.CHR_INET_VISIT:
          nRet = sti.stiHyperlinkFollowed;
          break;
        case SwPoolFormatId.CHR_HTML_STRONG:
          nRet = sti.stiStrong;
          break;
        case SwPoolFormatId.CHR_HTML_EMPHASIS:
          nRet = sti.stiEmphasis;
          break;
        default:
          break;
      }
    return nRet;
  }
  /** Returns the source Word slot, or its missing-style sentinel. @param collection - Native collection. @returns Slot or 0x0fff. */
  public GetSlot(collection: SwFormat | undefined): number {
    const slot = this.styles.indexOf(collection);
    return slot === -1 ? 0x0fff : slot;
  }

  /** Returns source slot order, including reserved empty slots. @returns Native style slots. */
  public GetStyles(): readonly (SwFormat | undefined)[] {
    return this.styles;
  }

  /** Returns BuildWwNames output for an exported style. @param collection - Native collection. @returns Word style name. */
  public GetWWName(collection: SwFormat): string {
    return this.names.get(collection) ?? collection.GetName();
  }
}

import type { MSWordExportBase } from "./wrtww8";
import type { SwNumRule } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { GetDfltAttr } from "../../core/attr/hints";
import { RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import { RTL_TEXTENCODING_MS_1252, RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";

import type { SwFormat } from "../../core/attr/format";
import { sti, GetEnglishNameFromSti } from "../inc/wwstyles";
import { MSWordExportFormat } from "./wrtww8";

/** Original reserved-slot mapping uses pool IDs, not user-visible names. @param format - Actual format. @returns Reserved slot or native missing sentinel. */
export function BuildGetSlot(format: SwFormat): number {
  const id = format.GetPoolFormatId();
  if (id === SwPoolFormatId.COLL_STANDARD) return 0;
  if (id >= SwPoolFormatId.COLL_HEADLINE1 && id <= SwPoolFormatId.COLL_HEADLINE9)
    return id - SwPoolFormatId.COLL_HEADLINE1 + 1;
  return 0x0fff;
}
