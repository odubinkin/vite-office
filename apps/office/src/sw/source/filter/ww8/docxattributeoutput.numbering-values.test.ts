/** @fileoverview Native DOCX numbering format, section break and page restart emission through genuine Writer/export/XML owners. */
import { expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { lcl_ConvertNumberingType } from "./docxattributeoutput.numbering";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_CHINESE_SIMPLIFIED, LANGUAGE_JAPANESE } from "../../../../i18nlangtag/inc/lang";
import { RES_CHRATR_CJK_LANGUAGE, WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { ConvertNumberingType } from "../../writerfilter/dmapper/ConversionHelper";
import { NS_ooxml as R } from "../../writerfilter/inc/ooxml/resourceids";
/** Emits through real DOCX and shared XML owners without replacing native services. @param write - Actual output calls. @returns Serialized fragment. */
function emit(write: (output: DocxAttributeOutput, document: SwDoc) => void): string {
  const doc = new SwDoc(),
    position = new SwPosition(doc.nodes.GetEndOfContent()),
    range = new SwPaM(position),
    exporter = new DocxExport(new XmlFilterBase(new ZipStorage()), doc, range, range, false, false),
    stream = new ZipFragmentStream("word/document.xml", "application/xml"),
    serializer = new FastSerializerHelper(stream, false),
    output = exporter.DocxAttrOutput();
  try {
    output.SetSerializer(serializer);
    write(output, doc);
    serializer.endDocument();
    return new TextDecoder().decode(stream.getBytes());
  } finally {
    exporter.dispose();
    range.Dispose();
    position.Dispose();
    doc.Dispose();
  }
}

it.each([
  [0, "upperLetter"],
  [1, "lowerLetter"],
  [2, "upperRoman"],
  [3, "lowerRoman"],
  [4, "decimal"],
  [5, "none"],
  [6, "bullet"],
  [8, "bullet"],
  [9, "upperLetter"],
  [10, "lowerLetter"],
  [13, "decimalFullWidth"],
  [14, "decimalEnclosedCircle"],
  [15, "taiwaneseCountingThousand"],
  [16, "chineseLegalSimplified"],
  [17, "ideographLegalTraditional"],
  [18, "ideographTraditional"],
  [19, "ideographZodiac"],
  [20, "japaneseLegal"],
  [21, "aiueoFullWidth"],
  [22, "aiueo"],
  [23, "iroha"],
  [24, "irohaFullWidth"],
  [26, "koreanCounting"],
  [27, "chosung"],
  [28, "ganada"],
  [31, "arabicAlpha"],
  [32, "thaiLetters"],
  [33, "hebrew2"],
  [34, "hindiVowels"],
  [46, "hindiVowels"],
  [42, "russianUpper"],
  [44, "russianUpper"],
  [43, "russianLower"],
  [45, "russianLower"],
  [54, "arabicAbjad"],
  [56, "hebrew1"],
  [60, "ordinal"],
  [61, "cardinalText"],
  [62, "ordinalText"],
  [63, "chicago"],
  [64, "decimalZero"],
  [69, "koreanDigital"],
  [70, "koreanDigital2"],
  [71, "koreanLegal"],
] as const)(
  "emits original page numbering type %s",
  /** Native enum values map to protocol literals, without normalizing source Iroha spelling. @param type - Actual type. @param expected - Source token. @returns Nothing. */ (
    type,
    expected,
  ) => {
    expect(
      emit(
        /** Writes native page numbering. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.SectionPageNumbering(type, undefined),
      ),
    ).toBe(`<w:pgNumType w:fmt="${expected}"/>`);
  },
);
it.each([
  [65, "001, 002, 003, ..."],
  [66, "0001, 0002, 0003, ..."],
  [67, "00001, 00002, 00003, ..."],
] as const)(
  "preserves custom format output reference and suppresses unsupported page formatting %s",
  /** Custom padding is a level-format path and is intentionally omitted from pgNumType. @param type - Original type. @param expected - Custom pattern. @returns Nothing. */ (
    type,
    expected,
  ) => {
    const format: [string] = ["unchanged"];
    expect(lcl_ConvertNumberingType(type, null, format, "fallback")).toBe("custom");
    expect(format[0]).toBe(expected);
    expect(
      emit(
        /** Writes native unsupported page custom formatting. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.SectionPageNumbering(type, 0),
      ),
    ).toBe('<w:pgNumType w:start="0"/>');
  },
);
it.each([7, 11, 12, 25, 29, 30, 35, 36, 37, 38, 55, 57, 58, 59, 68, 72, 75, 32768, 65535])(
  "keeps caller fallback and untouched custom output for unsupported type %s",
  /** Unknown/default types do not acquire fabricated formats. @param type - Original signed16 conversion domain. @returns Nothing. */ (
    type,
  ) => {
    const format: [string] = ["kept"];
    expect(lcl_ConvertNumberingType(type, null, format, "decimal")).toBe("decimal");
    expect(format[0]).toBe("kept");
    expect(
      emit(
        /** Writes native empty page-number attributes. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.SectionPageNumbering(type, undefined),
      ),
    ).toBe("<w:pgNumType/>");
  },
);
it.each([
  [0, "continuous"],
  [1, "nextColumn"],
  [2, "nextPage"],
  [3, "evenPage"],
  [4, "oddPage"],
  [5, "continuous"],
  [257, "nextColumn"],
  [-255, "nextColumn"],
] as const)(
  "narrows source section-break code %s",
  /** Tests actual unsigned8 entry contract. @param code - Input. @param expected - Word token. @returns Nothing. */ (
    code,
    expected,
  ) => {
    expect(
      emit(
        /** Writes actual section type. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.SectionType(code),
      ),
    ).toBe(`<w:type w:val="${expected}"/>`);
  },
);
it("preserves optional restart0 and unsigned16 narrowing independently of numbering type", /** Absent versus present zero remains observable in the actual XML. @returns Nothing. */ () => {
  expect(
    emit(
      /** Writes native narrowed values. @param output - Actual output. @returns Nothing. */ (
        output,
      ) => output.SectionPageNumbering(65540, 65536),
    ),
  ).toBe('<w:pgNumType w:start="0" w:fmt="decimal"/>');
});
it("uses actual CJK language items for Chinese numbering and leaves noncustom output untouched", /** Uses genuine document pool defaults and native item replacement. @returns Nothing. */ () => {
  const document = new SwDoc(),
    set = new SfxItemSet(document.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES),
    format: [string] = ["kept"];
  try {
    set.Put(new SvxLanguageItem(LANGUAGE_CHINESE_SIMPLIFIED, RES_CHRATR_CJK_LANGUAGE));
    expect(lcl_ConvertNumberingType(15, set, format)).toBe("chineseCountingThousand");
    set.Put(new SvxLanguageItem(LANGUAGE_JAPANESE, RES_CHRATR_CJK_LANGUAGE));
    expect(lcl_ConvertNumberingType(15, set, format)).toBe("taiwaneseCountingThousand");
    expect(format[0]).toBe("kept");
  } finally {
    set.Dispose();
    document.Dispose();
  }
});
it("retains the source import/export Iroha width mismatch", /** Actual native conversion owners demonstrate the mismatch without certifying a full imported document. @returns Nothing. */ () => {
  expect(ConvertNumberingType(R.LN_Value_ST_NumberFormat_iroha)).toBe(24);
  expect(ConvertNumberingType(R.LN_Value_ST_NumberFormat_irohaFullWidth)).toBe(23);
  expect(lcl_ConvertNumberingType(24, null, [""])).toBe("irohaFullWidth");
  expect(lcl_ConvertNumberingType(23, null, [""])).toBe("iroha");
});
