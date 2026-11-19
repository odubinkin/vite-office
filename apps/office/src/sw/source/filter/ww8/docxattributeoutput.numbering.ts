/** @fileoverview Original DOCX list levels, instances, restarts and section numbering from docxattributeoutput.cxx. */
import * as N from "../../../../offapi/com/sun/star/style/NumberingType";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_CHINESE_SIMPLIFIED } from "../../../../i18nlangtag/inc/lang";
import { RES_CHRATR_CJK_LANGUAGE } from "../../../inc/hintids";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { FSNS } from "../../../../sax/inc/fshelper";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { SvxAdjust, SvxNumType } from "../../../../editeng/inc/svxenum";
import type { SwNumRule } from "../../core/doc/number";
import type { DocxExport } from "./docxexport";
import type { wwFont } from "./wrtw8sty";
import { AreListLevelsDifferentForExport } from "./ww8par";
import { NumberingLevel } from "./wrtw8num";
import { OutputItem } from "./docxexport.text";

const w = token("w");
const val = FSNS(w, token("val"));
const mc = token("mc");

/** DOCX numbering callbacks for the shared native Word numbering traversal. */
export class DocxNumberingOutput {
  private exportingOutline = false;

  /** Binds numbering to the same context and active serializer as paragraph and run output. @param owner - Actual DOCX exporter. @param attributes - DOCX attribute output. @returns Numbering callbacks. */
  constructor(
    private readonly owner: DocxExport,
    private readonly attributes: DocxAttributeOutput,
  ) {}

  /** Begins an abstract definition using its one-based export-table identity. @param id - Definition ID. @returns Nothing. */
  StartAbstractNumbering(id: number): void {
    this.exportingOutline = this.owner.m_pUsedNumTable?.[id - 1]?.IsOutlineRule() ?? false;
    this.attributes
      .GetSerializer()
      .startElementNS(w, token("abstractNum"), FSNS(w, token("abstractNumId")), String(id));
  }

  /** Closes the current abstract definition. @returns Nothing. */
  EndAbstractNumbering(): void {
    this.attributes.GetSerializer().endElementNS(w, token("abstractNum"));
    this.exportingOutline = false;
  }

  /** Emits the original one-to-one numbering instance. @param id - Instance and abstract ID. @param _rule - Actual numbering rule. @returns Nothing. */
  NumberingDefinition(id: number, _rule: SwNumRule): void {
    void _rule;
    const serializer = this.attributes.GetSerializer();
    serializer.startElementNS(w, token("num"), FSNS(w, token("numId")), String(id));
    serializer.singleElementNS(w, token("abstractNumId"), val, String(id));
    serializer.endElementNS(w, token("num"));
  }

  /** Writes geometry overrides, restart values and the explicit preceding levels required by Word. @param rule - Actual numbering rule. @param id - Instance ID. @param abstract - Abstract ID. @param levels - Explicit restart values. @returns Nothing. */
  OverrideNumberingDefinition(
    rule: SwNumRule,
    id: number,
    abstract: number,
    levels: ReadonlyMap<number, number>,
  ): void {
    const serializer = this.attributes.GetSerializer();
    const abstractRule = this.owner.m_pUsedNumTable?.[abstract - 1];
    if (!abstractRule) throw new Error("assert(abstract numbering rule)");
    serializer.startElementNS(w, token("num"), FSNS(w, token("numId")), String(id));
    serializer.singleElementNS(w, token("abstractNumId"), val, String(abstract));
    const override = token("lvlOverride");
    const levelAttribute = FSNS(w, token("ilvl"));
    let previous = 0;
    for (let level = 0; level < (rule.IsContinusNum() ? 1 : 9); ++level) {
      const start = levels.get(level);
      const different = AreListLevelsDifferentForExport(rule.Get(level), abstractRule.Get(level));
      if (!different && start === undefined) continue;
      while (previous < level) {
        serializer.startElementNS(w, override, levelAttribute, String(previous));
        serializer.singleElementNS(
          w,
          token("startOverride"),
          val,
          String(rule.Get(previous).GetStart()),
        );
        serializer.endElementNS(w, override);
        ++previous;
      }
      serializer.startElementNS(w, override, levelAttribute, String(level));
      if (start !== undefined)
        serializer.singleElementNS(w, token("startOverride"), val, String(start));
      if (different) NumberingLevel(this.owner, rule, level);
      serializer.endElementNS(w, override);
    }
    serializer.endElementNS(w, token("num"));
  }

  /** Writes a native Word level including label text, layout and run attributes. @param level - Word list level. @param start - Start value. @param type - Native numbering type. @param adjust - Label justification. @param _positions - Binary-export substitution offsets. @param follow - Native suffix code. @param font - Prepared bullet font. @param items - Character attributes. @param indent - Left indent in twips. @param firstLine - First-line indent in twips. @param tab - List tab or negative sentinel. @param text - Native level text with encoded references. @param legal - Legal numbering flag. @returns Nothing. */
  NumberingLevel(
    level: number,
    start: number,
    type: number,
    adjust: SvxAdjust,
    _positions: Uint8Array,
    follow: number,
    font: wwFont | undefined,
    items: SfxItemSet | undefined,
    indent: number,
    firstLine: number,
    tab: number,
    text: string,
    legal: boolean,
  ): void {
    const serializer = this.attributes.GetSerializer();
    serializer.startElementNS(w, token("lvl"), FSNS(w, token("ilvl")), String(level));
    if (level !== 0 || start !== 0)
      serializer.singleElementNS(w, token("start"), val, String(start));
    const custom: [string] = [""];
    const format = lcl_ConvertNumberingType(type, items ?? null, custom, "decimal");
    if (!custom[0]) serializer.singleElementNS(w, token("numFmt"), val, format);
    const styles = this.owner.m_pStyles;
    if (this.exportingOutline && styles) {
      const id = styles.GetHeadingParagraphStyleId(level);
      if (id !== 0xffff) serializer.singleElementNS(w, token("pStyle"), val, styles.GetStyleId(id));
    }
    if (legal) serializer.singleElementNS(w, token("isLgl"));
    if (custom[0]) {
      serializer.startElementNS(mc, token("AlternateContent"));
      serializer.startElementNS(mc, token("Choice"), token("Requires"), "w14");
      serializer.singleElementNS(
        w,
        token("numFmt"),
        val,
        format,
        FSNS(w, token("format")),
        custom[0],
      );
      serializer.endElementNS(mc, token("Choice"));
      serializer.startElementNS(mc, token("Fallback"));
      serializer.singleElementNS(w, token("numFmt"), val, "decimal");
      serializer.endElementNS(mc, token("Fallback"));
      serializer.endElementNS(mc, token("AlternateContent"));
    }
    if (follow === 1 || follow === 2)
      serializer.singleElementNS(w, token("suff"), val, follow === 1 ? "space" : "nothing");
    let label = "";
    if (text !== "\u200b" && !(text === "\0" && type === SvxNumType.SVX_NUM_CHAR_SPECIAL)) {
      for (const character of text) {
        const code = character.charCodeAt(0);
        label += code < 9 ? "%" + String(code + 1) : character;
      }
    }
    serializer.singleElementNS(w, token("lvlText"), val, label);
    const justification =
      adjust === SvxAdjust.Center ? "center" : adjust === SvxAdjust.Right ? "right" : "left";
    serializer.singleElementNS(w, token("lvlJc"), val, justification);
    serializer.startElementNS(w, token("pPr"));
    if (tab >= 0) {
      serializer.startElementNS(w, token("tabs"));
      serializer.singleElementNS(w, token("tab"), val, "num", FSNS(w, token("pos")), String(tab));
      serializer.endElementNS(w, token("tabs"));
    }
    serializer.singleElementNS(
      w,
      token("ind"),
      FSNS(w, token("left")),
      String(indent),
      FSNS(w, token(firstLine > 0 ? "firstLine" : "hanging")),
      String(Math.abs(firstLine)),
    );
    serializer.endElementNS(w, token("pPr"));
    if (items) {
      serializer.startElementNS(w, token("rPr"));
      this.attributes.InitCollectedRunProperties();
      if (font) {
        this.owner.GetId(font);
        const family = font.msFamilyNm;
        serializer.singleElementNS(
          w,
          token("rFonts"),
          FSNS(w, token("ascii")),
          family,
          FSNS(w, token("hAnsi")),
          family,
          FSNS(w, token("cs")),
          family,
          FSNS(w, token("hint")),
          "default",
        );
      }
      for (const item of items.entries()) OutputItem(this.attributes, item);
      this.attributes.WriteCollectedRunProperties();
      serializer.mergeTopMarks(11);
      serializer.endElementNS(w, token("rPr"));
    }
    serializer.endElementNS(w, token("lvl"));
  }
}
/** Original immutable byte-literal result and mutable output-reference binding; only custom formats overwrite format. @param type - Signed16 numbering type. @param items - Actual language item set or native null. @param format - Original output reference. @param fallback - Original caller default. @returns Word numbering token. */
export function lcl_ConvertNumberingType(
  type: number,
  items: SfxItemSet | null,
  format: [string],
  fallback = "",
): string {
  switch ((type << 16) >> 16) {
    case N.CHARS_UPPER_LETTER:
    case N.CHARS_UPPER_LETTER_N:
      return "upperLetter";
    case N.CHARS_LOWER_LETTER:
    case N.CHARS_LOWER_LETTER_N:
      return "lowerLetter";
    case N.ROMAN_UPPER:
      return "upperRoman";
    case N.ROMAN_LOWER:
      return "lowerRoman";
    case N.ARABIC:
      return "decimal";
    case N.BITMAP:
    case N.CHAR_SPECIAL:
      return "bullet";
    case N.CHARS_HEBREW:
      return "hebrew2";
    case N.NUMBER_HEBREW:
      return "hebrew1";
    case N.NUMBER_NONE:
      return "none";
    case N.FULLWIDTH_ARABIC:
      return "decimalFullWidth";
    case N.TIAN_GAN_ZH:
      return "ideographTraditional";
    case N.DI_ZI_ZH:
      return "ideographZodiac";
    case N.NUMBER_UPPER_ZH_TW:
      return "ideographLegalTraditional";
    case N.NUMBER_UPPER_ZH:
      return "chineseLegalSimplified";
    case N.NUMBER_TRADITIONAL_JA:
      return "japaneseLegal";
    case N.AIU_FULLWIDTH_JA:
      return "aiueoFullWidth";
    case N.AIU_HALFWIDTH_JA:
      return "aiueo";
    case N.IROHA_FULLWIDTH_JA:
      return "iroha";
    case N.IROHA_HALFWIDTH_JA:
      return "irohaFullWidth";
    case N.HANGUL_SYLLABLE_KO:
      return "ganada";
    case N.HANGUL_JAMO_KO:
      return "chosung";
    case N.NUMBER_HANGUL_KO:
      return "koreanCounting";
    case N.NUMBER_LEGAL_KO:
      return "koreanLegal";
    case N.NUMBER_DIGITAL_KO:
      return "koreanDigital";
    case N.NUMBER_DIGITAL2_KO:
      return "koreanDigital2";
    case N.CIRCLE_NUMBER:
      return "decimalEnclosedCircle";
    case N.CHARS_ARABIC:
      return "arabicAlpha";
    case N.CHARS_ARABIC_ABJAD:
      return "arabicAbjad";
    case N.CHARS_THAI:
      return "thaiLetters";
    case N.CHARS_PERSIAN:
    case N.CHARS_NEPALI:
      return "hindiVowels";
    case N.CHARS_CYRILLIC_UPPER_LETTER_RU:
    case N.CHARS_CYRILLIC_UPPER_LETTER_N_RU:
      return "russianUpper";
    case N.CHARS_CYRILLIC_LOWER_LETTER_RU:
    case N.CHARS_CYRILLIC_LOWER_LETTER_N_RU:
      return "russianLower";
    case N.TEXT_NUMBER:
      return "ordinal";
    case N.TEXT_CARDINAL:
      return "cardinalText";
    case N.TEXT_ORDINAL:
      return "ordinalText";
    case N.SYMBOL_CHICAGO:
      return "chicago";
    case N.ARABIC_ZERO:
      return "decimalZero";

    case N.NUMBER_LOWER_ZH:
      return items !== null &&
        (items.Get(RES_CHRATR_CJK_LANGUAGE) as SvxLanguageItem).GetLanguage() ===
          LANGUAGE_CHINESE_SIMPLIFIED
        ? "chineseCountingThousand"
        : "taiwaneseCountingThousand";
    case N.ARABIC_ZERO3:
      format[0] = "001, 002, 003, ...";
      return "custom";
    case N.ARABIC_ZERO4:
      format[0] = "0001, 0002, 0003, ...";
      return "custom";
    case N.ARABIC_ZERO5:
      format[0] = "00001, 00002, 00003, ...";
      return "custom";
    default:
      return fallback;
  }
}
/** Original page numbering omits unsupported/custom formats, preserves optional restart0 and always writes pgNumType. @param output - Actual DOCX owner. @param type - Unsigned16 original type. @param restart - Optional unsigned16 restart. @returns Nothing. */
export function SectionPageNumbering(
  output: DocxAttributeOutput,
  type: number,
  restart: number | undefined,
): void {
  const list = FastSerializerHelper.createAttrList();
  try {
    if (restart !== undefined)
      list.operatorArrow().add(FSNS(token("w"), token("start")), String(restart & 0xffff));
    const custom: [string] = [""],
      format = lcl_ConvertNumberingType(type & 0xffff, null, custom);
    if (format !== "" && custom[0] === "")
      list.operatorArrow().add(FSNS(token("w"), token("fmt")), format);
    output.GetSerializer().singleElementNS(token("w"), token("pgNumType"), list);
  } finally {
    list.dispose();
  }
}
/** Original section-break mapping narrows the argument to unsigned8 before dispatch. @param output - Actual DOCX owner. @param code - Original break code. @returns Nothing. */
export function SectionType(output: DocxAttributeOutput, code: number): void {
  let type: string;
  switch (code & 255) {
    case 1:
      type = "nextColumn";
      break;
    case 2:
      type = "nextPage";
      break;
    case 3:
      type = "evenPage";
      break;
    case 4:
      type = "oddPage";
      break;
    default:
      type = "continuous";
      break;
  }
  output
    .GetSerializer()
    .singleElementNS(token("w"), token("type"), FSNS(token("w"), token("val")), type);
}
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
