from pathlib import Path
root=Path('apps/office/src')
p=root/'editeng/source/items/numitem.ts';s=p.read_text();s=s.replace('/** Native position-and-space selection. */','''import { SvxNumType } from "../../inc/svxenum";
import { Font, type ConstFont } from "../../../../vcl/source/font/font";
/** Native initial glyph, independent of configured list-rule bullets. */
export const SVX_DEF_BULLET = 0xF000 + 149;
/** Native type and show-symbol ownership; formatting is bounded to the existing decimal/bullet/disabled families. */
export class SvxNumberType {
  private nNumType: SvxNumType;
  private bShowSymbol: boolean;
  /** Initializes or copies native type state. @param type - Native type or const source. @returns Nothing. */
  public constructor(type: SvxNumType | Pick<SvxNumberType, "GetNumberingType" | "IsShowSymbol"> = SvxNumType.SVX_NUM_ARABIC) {
    this.nNumType = typeof type === "number" ? type : type.GetNumberingType();
    this.bShowSymbol = typeof type === "number" ? true : type.IsShowSymbol();
  }
  /** Assigns the native type without changing the glyph. @param type - Type. @returns Nothing. */
  public SetNumberingType(type: SvxNumType): void { this.nNumType = type; }
  /** Returns the native numbering identifier. @returns Type. */
  public GetNumberingType(): SvxNumType { return this.nNumType; }
  /** Changes native symbol visibility. @param show - Flag. @returns Nothing. */
  public SetShowSymbol(show: boolean): void { this.bShowSymbol = show; }
  /** Reads native symbol visibility. @returns Flag. */
  public IsShowSymbol(): boolean { return this.bShowSymbol; }
  /** Classifies native text numbering independently of visibility. @returns Text-format flag. */
  public IsTextFormat(): boolean {
    return this.nNumType !== SvxNumType.SVX_NUM_NUMBER_NONE && this.nNumType !== SvxNumType.SVX_NUM_CHAR_SPECIAL && this.nNumType !== SvxNumType.SVX_NUM_BITMAP;
  }
  /** Formats the existing numbering families through the browser's bounded native-provider adapter. @param number - Native signed32 value. @param _locale - Locale, irrelevant to decimal provider output. @param legal - Legal-numbering coercion. @returns Number string. */
  public GetNumStr(number: number, _locale = "en-US", legal = false): string {
    const value = number | 0;
    if (!this.bShowSymbol || this.nNumType === SvxNumType.SVX_NUM_CHAR_SPECIAL || this.nNumType === SvxNumType.SVX_NUM_BITMAP) return "";
    if (this.nNumType === SvxNumType.SVX_NUM_ARABIC && value === 0) return "0";
    if (value <= 0) return ""; // Native provider rejects nonpositive values; GetNumStr catches the exception.
    const type = !legal || this.nNumType === SvxNumType.SVX_NUM_ARABIC ? this.nNumType : SvxNumType.SVX_NUM_ARABIC;
    return type === SvxNumType.SVX_NUM_ARABIC ? String(value) : "";
  }
}

/** Native position-and-space selection. */''',1)
s=s.replace('export class SvxNumberFormat {', 'export class SvxNumberFormat extends SvxNumberType {')
s=s.replace('  private position:', '  private cBullet = SVX_DEF_BULLET;\n  private pBulletFont: ConstFont | undefined;\n  private position:',1)
a=s.index('  /** Initializes the native zero geometry');b=s.index('  /** Compares all implemented base-format',a)
old=s[a:b];aCtor=old.index('    this.includeUpperLevels');init=old[aCtor:old.rindex('\n  }')]
# Restore raw-state construction only at the explicit adapter, keeping native core constructors type/copy-shaped.
s=s[:a]+'''  /** Initializes or copies the implemented native format fields. @param format - Native type or const source. @returns Nothing. */
  public constructor(format: SvxNumType | ConstSvxNumberFormat = SvxNumType.SVX_NUM_ARABIC) {
    super(format);
    const properties = typeof format === "number" ? {} : { ...format.GetPositionProperties(), ...format.GetMarkerProperties() };
'''+init+'''
    if (typeof format !== "number") {
      this.cBullet = format.GetBulletChar();
      const font = format.GetBulletFont();
      this.pBulletFont = font === undefined ? undefined : Object.freeze(new Font(font));
    }
  }
  /** Decodes the existing raw position/marker record without re-deriving inactive fields or ListFormat compatibility state. This is a browser transfer/assembly adapter, not a native constructor. @param properties - Raw fields. @param type - Native type. @returns Format. */
  public static FromProperties(properties: NumberingPositionProperties & NumberingMarkerProperties, type = SvxNumType.SVX_NUM_ARABIC): SvxNumberFormat {
    const format = new SvxNumberFormat(type);
'''+init.replace('    this.', '    format.')+'''
    return format;
  }
  /** Reads the raw unsigned32 marker. @returns Code point. */
  public GetBulletChar(): number { return this.cBullet; }
  /** Stores the native unsigned32 marker independently of numbering type. @param glyph - Code point. @returns Nothing. */
  public SetBulletChar(glyph: number): void { this.cBullet = glyph >>> 0; }
  /** Reads the optional const font value. @returns Font or native null as undefined. */
  public GetBulletFont(): ConstFont | undefined { return this.pBulletFont; }
  /** Copies the supplied font or resets optional ownership. @param font - Optional source font. @returns Nothing. */
  public SetBulletFont(font: ConstFont | undefined): void { this.pBulletFont = font === undefined ? undefined : Object.freeze(new Font(font)); }
'''+s[b:]
s=s.replace('other: Pick<SvxNumberFormat, "GetPositionProperties" | "GetMarkerProperties">','other: ConstSvxNumberFormat')
s=s.replace('    return (\n      (Object.keys(position)', '''    const font = this.pBulletFont, otherFont = other.GetBulletFont();
    return (
      this.GetNumberingType() === other.GetNumberingType() && this.IsShowSymbol() === other.IsShowSymbol() &&
      this.cBullet === other.GetBulletChar() &&
      (font === undefined ? otherFont === undefined : otherFont !== undefined && font.Equals(otherFont)) &&
      (Object.keys(position)''',1)
s+='\n/** Const reference to implemented base format fields. */\nexport type ConstSvxNumberFormat = Omit<SvxNumberFormat, `Set${string}`>;\n';p.write_text(s)
p=root/'sw/source/core/doc/number.ts';s=p.read_text();a=s.index('/** Numbering format owned');b=s.index('/** Const format reference:',a)
s=s[:a]+'''/** Numbering format owned by one level of a SwNumRule, with native base defaults and null client registration. */
export class SwNumFormat extends SvxNumberFormat {
  private readonly client = new SwClient();
  /** Initializes native defaults or copies a const base format. @param format - Optional source format. @returns Nothing. */
  public constructor(format?: ConstSvxNumberFormat) { super(format ?? SvxNumType.SVX_NUM_ARABIC); }
  /** Reads the composed native SwClient registration; JS has one base class. @returns Registered source, initially undefined. */
  public GetRegisteredIn(): SwModify | undefined { return this.client.GetRegisteredIn(); }
  /** Compares implemented base fields and native client registration. @param other - Const Writer format. @returns Equality. */
  public override Equals(other: ConstSwNumFormat): boolean { return super.Equals(other) && this.GetRegisteredIn() === other.GetRegisteredIn(); }
  /** Copies a format independently while preserving optional font and raw marker fields. @returns Format. */
  public clone(): SwNumFormat { return new SwNumFormat(this); }
}

/** Assembles the browser's existing supported format properties using the source-shaped base copy constructor. @param kind - Browser marker family. @param bulletChar - Optional glyph. @param options - Raw transfer/command fields. @returns Native format. */
export function createWriterNumFormat(kind: Exclude<WriterParagraphListKind, "none">, bulletChar = kind === "bullet" ? "•" : "", options: NumberingPositionProperties & NumberingMarkerProperties & Readonly<{ bulletFont?: string; numberingType?: "arabic" | "char-special" | "none" }> = {}): SwNumFormat {
  if (kind !== "bullet" && kind !== "numbered") throw new Error("SwNumFormat kind must be bullet or numbered.");
  if ([...bulletChar].length > 1) throw new Error("SwNumFormat bullet character must contain at most one Unicode code point.");
  if (options.start !== undefined && (!Number.isInteger(options.start) || options.start < 0 || options.start > 65535)) throw new Error("SwNumFormat start value is invalid.");
  if (options.includeUpperLevels !== undefined && (!Number.isInteger(options.includeUpperLevels) || options.includeUpperLevels < 0 || options.includeUpperLevels > 255)) throw new Error("SwNumFormat included upper-level count is invalid.");
  if (options.listFormat !== undefined && typeof options.listFormat !== "string") throw new Error("SwNumFormat ListFormat is invalid.");
  const type = options.numberingType === "none" ? SvxNumType.SVX_NUM_NUMBER_NONE :
    options.numberingType === "char-special" || (options.numberingType === undefined && kind === "bullet") ? SvxNumType.SVX_NUM_CHAR_SPECIAL : SvxNumType.SVX_NUM_ARABIC;
  const base = SvxNumberFormat.FromProperties(options, type);
  base.SetBulletChar(bulletChar.codePointAt(0) ?? 0);
  const family = options.bulletFont ?? (kind === "bullet" ? "OpenSymbol" : "");
  if (family !== "") { const font = new Font(); font.SetFamilyName(family); base.SetBulletFont(font); }
  return new SwNumFormat(base);
}
/** Projects the existing browser marker family from native type state. @param format - Const format. @returns Browser family. */
export function getWriterNumFormatKind(format: ConstSwNumFormat): "bullet" | "numbered" { return format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL ? "bullet" : "numbered"; }
/** Converts supported Unicode glyphs at the browser/XML boundary, retaining the historical empty inactive marker. @param format - Const format. @returns Marker string. */
export function getWriterNumFormatBullet(format: ConstSwNumFormat): string { const glyph = format.GetBulletChar(); return glyph === 0 ? "" : String.fromCodePoint(glyph); }

'''+s[b:]
s=s.replace('  type SvxNumPositionAndSpaceMode,','  type SvxNumPositionAndSpaceMode,\n  type ConstSvxNumberFormat,')
s=s.replace('import type { SwTextNode }', 'import { SvxNumType } from "../../../../editeng/inc/svxenum";\nimport { Font } from "../../../../vcl/source/font/font";\nimport { SwClient, type SwModify } from "../../../inc/calbck";\n\nimport type { SwTextNode }')
s=s.replace('return this.Get(0).GetKind();','return getWriterNumFormatKind(this.Get(0));')
s=s.replace('new SwNumFormat("numbered",', 'createWriterNumFormat("numbered",')
s=s.replace('?.Get(level).GetBulletChar()', '?.Get(level) === undefined ? undefined : undefined') if False else s
# Numeric owner formatting moves to SvxNumberType; Writer retains its native explicit zero handling.
s=s.replace('this.Get(replaceLevel).GetNumberingType() === "char-special"\n              ? ""\n              : String(value)', 'false\n              ? ""\n              : this.Get(replaceLevel).GetNumStr(value)')
s=s.replace('this.Get(index).GetNumberingType() === "char-special"\n            ? ""\n            : String(value)', 'false\n            ? ""\n            : this.Get(index).GetNumStr(value)')
s=s.replace(': false\n              ? ""\n              :', ':').replace(': false\n            ? ""\n            :', ':')
s=s.replace('paragraph.GetNumRule?.()?.Get(level).GetBulletChar()', 'paragraph.GetNumRule?.() === undefined ? undefined : undefined') if False else s
p.write_text(s)
# Adopt native module import, preserving every other dependency prohibition.
p=Path('scripts/check-module-boundaries.mjs');s=p.read_text().replace('["editeng", new Set(["svl"])]','["editeng", new Set(["svl", "vcl"])]');p.write_text(s)
