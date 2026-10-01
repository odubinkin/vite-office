from pathlib import Path
import re
root=Path('apps/office/src');p=root/'sw/source/core/doc/number.ts';s=p.read_text()
s=s.replace('  type NumberingMarkerProperties,','  type NumberingMarkerProperties,\n  type SvxNumPositionAndSpaceMode,')
s=s.replace('Readonly<{ bulletFont?: string }>','Readonly<{ bulletFont?: string; numberingType?: "arabic" | "char-special" | "none" }>')
s=s.replace('  private readonly bulletFont: string;','  private readonly bulletFont: string;\n  private readonly numberingType: "arabic" | "char-special" | "none";')
s=s.replace('    this.bulletFont = options.bulletFont', '    this.numberingType = options.numberingType ?? (kind === "bullet" ? "char-special" : "arabic");\n    this.bulletFont = options.bulletFont')
s=s.replace('public GetNumberingType(): "arabic" | "char-special" {\n    return this.kind === "bullet" ? "char-special" : "arabic";', 'public GetNumberingType(): "arabic" | "char-special" | "none" {\n    return this.numberingType;')
s=s.replace('      bulletFont: this.bulletFont,','      bulletFont: this.bulletFont,\n      numberingType: this.numberingType,')
needle='  /** Creates an independent format record.'
s=s.replace(needle,'''  /** Compares every implemented native format field, including inactive geometry and optional patterns. @param other - Const format. @returns Whether the implemented values are equal. */
  public Equals(other: ConstSwNumFormat): boolean {
    const position = this.GetPositionProperties(), otherPosition = other.GetPositionProperties();
    const marker = this.GetMarkerProperties(), otherMarker = other.GetMarkerProperties();
    return this.GetNumberingType() === other.GetNumberingType() &&
      this.bulletChar === other.GetBulletChar() && this.bulletFont === other.GetBulletFont() &&
      (Object.keys(position) as (keyof typeof position)[]).every(key => position[key] === otherPosition[key]) &&
      marker.includeUpperLevels === otherMarker.includeUpperLevels && marker.start === otherMarker.start &&
      marker.prefix === otherMarker.prefix && marker.suffix === otherMarker.suffix && marker.listFormat === otherMarker.listFormat;
  }
''' +needle)
pos=s.index('/** Native numbering-rule classification')
s=s[:pos]+'''/** Const format reference: callers clone before changing an owned or shared level. */
export type ConstSwNumFormat = Omit<SwNumFormat, `Set${string}`>;

'''+s[pos:]
a=s.index('  /** Creates one bounded numbering rule.');b=s.index('  private readonly textNodes:',a)
s=s[:a]+'''  /** Initializes optional owned levels and native shared defaults. @param name - Rule name. @param defaultMode - Native base-table selection. @param type - Native rule classification. @returns Nothing. */
  public constructor(
    private readonly name: string,
    private readonly defaultMode: SvxNumPositionAndSpaceMode,
    private meRuleType = SwNumRuleType.NUM_RULE,
  ) {
    if (name.trim().length === 0) throw new Error("SwNumRule name must not be blank.");
  }

  private defaultListId = "";
  private automatic = true;
  private readonly formats: (ConstSwNumFormat | undefined)[] = Array.from({ length: 10 });
'''+s[b:]
s=s.replace('  private meRuleType = SwNumRuleType.NUM_RULE;\n','')
a=s.index('  /** Returns the numbering format at');b=s.index('  /** Returns the default list identity.',a)
s=s[:a]+'''  /** Returns the effective const format, selecting the shared table when no owned level exists. @param level - Native level. @returns Effective format. */
  public Get(level: number): ConstSwNumFormat {
    return this.GetNumFormat(level) ?? baseFormats[this.meRuleType][this.defaultMode][level] as ConstSwNumFormat;
  }
  /** Returns only an explicitly owned const format. @param level - Native level. @returns Owned format or undefined for the native null pointer. */
  public GetNumFormat(level: number): ConstSwNumFormat | undefined {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`SwNumRule level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    return this.formats[level];
  }
  /** Copies a changed reference format; equal owned values preserve identity and validity. @param level - Native level. @param format - Const source format. @returns Nothing. */
  public Set(level: number, format: ConstSwNumFormat): void {
    const owned = this.GetNumFormat(level);
    if (owned === undefined || !owned.Equals(format)) {
      this.formats[level] = Object.freeze(format.clone());
      this.invalidRuleFlag = true;
    }
  }
  /** Returns the native default-table selector. @returns Mode. */
  public GetDefaultNumberFormatPositionAndSpaceMode(): SvxNumPositionAndSpaceMode {
    return this.defaultMode;
  }
  /** Assigns the list identity at the document assembly boundary. @param id - Identity. @returns Nothing. */
  public SetDefaultListId(id: string): void { this.defaultListId = id; }
  /** Assigns the automatic-rule flag. @param automatic - Flag. @returns Nothing. */
  public SetAutoRule(automatic: boolean): void { this.automatic = automatic; }

'''+s[b:]
s=s.replace('this.GetNumFormat(', 'this.Get(')
# Restore raw access precisely in Get and Set and raw accessor declaration.
s=s.replace('return this.Get(level) ?? baseFormats','return this.GetNumFormat(level) ?? baseFormats').replace('const owned = this.Get(level);','const owned = this.GetNumFormat(level);')
s=s.replace('    if (format.HasListFormat()) {','    if (format.GetNumberingType() === "none") return format.GetPrefix() + format.GetSuffix();\n    if (format.HasListFormat()) {')
s=s.replace('this.Get(replaceLevel).GetNumberingType() === "char-special"','this.Get(replaceLevel).GetNumberingType() !== "arabic"').replace('this.Get(index).GetNumberingType() === "char-special"','this.Get(index).GetNumberingType() !== "arabic"')
a=s.index('    const clone = new SwNumRule(');b=s.index('\n    return clone;',a)
s=s[:a]+'''    const clone = new SwNumRule(this.name, this.defaultMode, this.meRuleType);
    clone.SetDefaultListId(this.defaultListId);
    clone.SetAutoRule(this.automatic);
    for (let level = 0; level < 10; level++) {
      const format = this.formats[level];
      if (format !== undefined) clone.Set(level, format);
    }'''+s[b:]
a=s.index('/** Creates the modern NUM_RULE');b=s.index('/** Describes the list subset',a)
s=s[:a]+'''/** Initializes the four immutable tables shared by all rules, with native Twip defaults. @param outline - Outline classification. @param mode - Geometry group. @returns Shared levels. */
function createBaseFormats(outline: boolean, mode: SvxNumPositionAndSpaceMode): readonly ConstSwNumFormat[] {
  return Array.from({ length: 10 },
    /** Initializes one complete implemented base level. @param _unused - Placeholder. @param level - Native level. @returns Const format. */
    (_unused, level) => {
      const indent = 720 + level * 360;
      return Object.freeze(new SwNumFormat("numbered", ["•", "◦", "▪"][level % 3], {
        bulletFont: "", numberingType: outline ? "none" : "arabic", includeUpperLevels: outline ? 10 : 1,
        positionAndSpaceMode: mode,
        ...(outline ? { charTextDistance: mode === "label-width-and-position" ? 216 : 0,
          labelFollowedBy: mode === "label-alignment" ? "nothing" : "listtab" } : {
          ...(mode === "label-alignment" ? { firstLineIndent: -360, indentAt: indent, listTabPosition: indent } : {
            absLSpace: indent, firstLineOffset: -360 }), suffix: ".", listFormat: `%${level + 1}%.`,
        }),
      }));
    });
}
const baseFormats = [true, false].map(
  /** Shares both geometry families for a native rule type. @param outline - Classification. @returns Tables. */
  outline => ({ "label-width-and-position": createBaseFormats(outline, "label-width-and-position"),
    "label-alignment": createBaseFormats(outline, "label-alignment") }),
);

'''+s[b:]
s=s.replace('?.GetNumFormat(level)', '?.Get(level)')
p.write_text(s)
# All historical constructors become explicit document assembly, outside the native constructor.
for p in root.rglob('*.ts'):
 if p.name=='number.ts':continue
 s=p.read_text()
 if 'new SwNumRule(' in s:
  s=s.replace('new SwNumRule(', 'createWriterNumRule(')
  imports=re.findall(r'import[^;]+from [^;]+;',s,re.S)
  numberImport=next((x for x in imports if re.search(r'from ["\'][^"\']*/number["\']',x)),None)
  if numberImport:
   path=re.search(r'from (["\'])([^"\']+)\1',numberImport)[2]
   s=s.replace(numberImport,numberImport+'\nimport { createWriterNumRule } from "'+path.rsplit('/',1)[0]+'/DocumentListsManager";')
  else:raise Exception(str(p))
  p.write_text(s)
# Effective reads: raw GetNumFormat remains only in native optional restart read and encoding ownership metadata.
for p in root.rglob('*.ts'):
 if p.name=='number.ts':continue
 s=p.read_text()
 if 'GetNumFormat' in s:
  s=s.replace('GetNumFormat(', 'Get(')
  if p.name=='ndtxt.ts':
   a=s.index('  public GetActualListStartValue()');b=s.index('\n  }',a)
   frag=s[a:b].replace('?.Get(this.GetAttrListLevel()).GetStart()', '?.GetNumFormat(this.GetAttrListLevel())?.GetStart()')
   s=s[:a]+frag+s[b:]
  p.write_text(s)
p=root/'sw/source/core/doc/DocumentListsManager.ts';s=p.read_text().replace('import { SwNumRule }','import { SwNumRule, SwNumFormat }');s=s.replace('import { createWriterNumRule } from "./DocumentListsManager";\n','')
s+='''
/** Assembles the browser's existing list command/import records using native rule ownership. @param name - Rule name. @param format - Command family or complete explicit levels. @param defaultListId - Document identity. @param automatic - Reuse flag. @returns Rule. */
export function createWriterNumRule(name: string, format?: "bullet" | "numbered" | readonly SwNumFormat[], defaultListId = name, automatic = false): SwNumRule {
  if (defaultListId.trim().length === 0) throw new Error("SwNumRule list id must not be blank.");
  const rule = new SwNumRule(name, "label-alignment");
  rule.SetDefaultListId(defaultListId);
  rule.SetAutoRule(automatic);
  if (format === undefined) return rule;
  if (Array.isArray(format)) {
    if (format.length !== 10) throw new Error("SwNumRule must define every supported list level.");
    for (let level = 0; level < 10; level++) rule.Set(level, format[level] as SwNumFormat);
  } else {
    if (format !== "bullet" && format !== "numbered") throw new Error("SwNumRule kind must be bullet or numbered.");
    for (let level = 0; level < 10; level++) rule.Set(level, new SwNumFormat(format, format === "bullet" ? rule.Get(level).GetBulletChar() : "", {
      ...rule.Get(level).GetPositionProperties(), bulletFont: format === "bullet" ? "OpenSymbol" : "", suffix: format === "numbered" ? "." : "",
    }));
  }
  return rule;
}
''';p.write_text(s)
