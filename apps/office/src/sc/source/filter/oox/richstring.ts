/** @fileoverview Original rich-string text-portion ownership and XString content import from richstring.cxx/hxx. Font/phonetic/binary/finalization/UNO/edit-engine conversion owners remain unported. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { AttributeConversion, AttributeList } from "../../../../oox/source/helper/attributelist";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
/** Original portion owns decoded text; formatting members are not replaced by false/null font providers. */
export class RichStringPortion {
  private readonly maText = new OUString();
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
