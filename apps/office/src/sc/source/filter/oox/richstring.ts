/** @fileoverview Original rich-string text ownership, XString decoding and Calc edit text conversion. */
import type { EditTextObject } from "../../../../editeng/inc/editobj";
import { ESelection } from "../../../../editeng/inc/ESelection";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { AttributeConversion, AttributeList } from "../../../../oox/source/helper/attributelist";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
import type { DocumentEditEngine } from "../../core/tool/editutil";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { Font } from "./stylesbuffer";
import type { ExcelGraphicHelper } from "./stylesbuffer.color";
/** Original portion owns decoded text and its optional explicit font. */
export class RichStringPortion {
  private readonly maText = new OUString();
  private mxFont: Font | undefined;
  /** Original decoder assignment releases the temporary after actual COW assignment. @param value - Input text. @returns Nothing. */
  setText(value: OUStringConstReference): void {
    const decoded = AttributeConversion.decodeXString(value);
    try {
      this.maText.assign(decoded);
    } finally {
      decoded.dispose();
    }
  }
  /** Borrows actual text owner. @returns Native const reference. */
  getText(): OUStringConstReference {
    return this.maText;
  }
  /** Creates a represented explicit run font. @param graphicHelper - Workbook color resolver. @returns Run font. */
  createFont(graphicHelper?: ExcelGraphicHelper): Font {
    return (this.mxFont = new Font(graphicHelper));
  }
  /** Detects a run with its own font. @returns Whether a font was imported. */
  hasFont(): boolean {
    return this.mxFont !== undefined;
  }
  /** Advances the original run selection and applies its native text items. @param engine - Actual Calc editor. @param selection - Run cursor. @param firstFont - Optional source cell font for the first run. @returns Nothing. */
  convert(engine: DocumentEditEngine, selection: ESelection, firstFont?: Font): void {
    selection.CollapseToEnd();
    let lastBreak = -1;
    for (
      let index = this.maText.indexOf(10);
      index !== -1;
      index = this.maText.indexOf(10, index + 1)
    ) {
      ++selection.end.nPara;
      lastBreak = index;
    }
    selection.end.nIndex =
      lastBreak < 0
        ? selection.start.nIndex + this.maText.getLength()
        : this.maText.getLength() - lastBreak - 1;
    const items = new SfxItemSet(engine.GetEmptyItemSet());
    try {
      const font = this.mxFont ?? (firstFont?.needsRichTextFormat() ? firstFont : undefined);
      font?.fillToItemSet(items);
      engine.QuickSetAttribs(items, selection);
    } finally {
      items.Dispose();
    }
  }
  /** Explicit binding of the native Unicode member destructor. @returns Nothing. */
  dispose(): void {
    this.maText.dispose();
  }
}
/** Original ordered text portion vector and sticky xml:space flag. */
export class RichString {
  private readonly maTextPortions: RichStringPortion[] = [];
  private mbPreserveSpace = false;
  /** Original text element sets attributes then appends a distinct portion. @param attributes - Actual native wrapper. @returns Portion index. */
  importText(attributes: AttributeList): number {
    this.setAttributes(attributes);
    return this.createPortion();
  }
  /** Original run always creates a distinct portion. @returns Index. */
  importRun(): number {
    return this.createPortion();
  }
  /** Original preserveSpace is monotone; absent/default values do not reset it. @param attributes - Actual native attributes. @returns Nothing. */
  setAttributes(attributes: AttributeList): void {
    const space = attributes.getString(
      (namespaceTokens.get("xml") as number) | getTokenFromUtf8("space"),
    );
    try {
      if (space !== undefined && text(space) === "preserve") this.mbPreserveSpace ||= true;
    } finally {
      space?.dispose();
    }
  }
  /** Original unchecked valid-index borrowed portion. @param index - Signed32 valid portion index. @returns Same portion. */
  getPortion(index: number): RichStringPortion {
    return this.maTextPortions[index | 0] as RichStringPortion;
  }
  /** Original concatenation preserves every portion, including whitespace, NUL and line breaks. @returns Owned string. */
  getStringContent(): OUString {
    const result = new OUStringBuffer();
    try {
      for (const portion of this.maTextPortions) result.append(portion.getText());
      return result.makeStringAndClear();
    } finally {
      result.dispose();
    }
  }
  /** Keeps empty and single unformatted one-line strings in the scalar cell path. @param result - Destination string. @param firstFont - Optional source cell font. @returns Whether the represented text portions can use scalar storage. */
  extractPlainString(result: OUString, firstFont?: Font): boolean {
    if (this.maTextPortions.length === 0) {
      result.clear();
      return true;
    }
    if (this.maTextPortions.length !== 1) return false;
    const portion = this.maTextPortions[0] as RichStringPortion;
    if (portion.hasFont() || firstFont?.needsRichTextFormat()) return false;
    result.assign(portion.getText());
    return result.indexOf(10) < 0;
  }
  /** Converts the supported text portions with the native Calc edit engine. @param engine - Document-owned edit engine. @param firstFont - Optional source cell font. @returns Owned edit text. */
  convert(engine: DocumentEditEngine, firstFont?: Font): EditTextObject {
    const value = this.getStringContent();
    try {
      engine.SetTextCurrentDefaults(value);
      const selection = new ESelection();
      for (const portion of this.maTextPortions) {
        portion.convert(engine, selection, firstFont);
        firstFont = undefined;
      }
      return engine.CreateTextObject();
    } finally {
      value.dispose();
    }
  }
  /** Original emplace_back and size-minus-one. @returns Index. */
  private createPortion(): number {
    this.maTextPortions.push(new RichStringPortion());
    return this.maTextPortions.length - 1;
  }
  /** Explicit binding of native vector/member destruction. @returns Nothing. */
  dispose(): void {
    for (const portion of this.maTextPortions) portion.dispose();
    this.maTextPortions.length = 0;
  }
}
