from pathlib import Path
import re
root=Path('apps/office/src')
# Test-local explicit edits never mutate a const reference.
for p in root.rglob('*.test.ts'):
 s=p.read_text()
 calls=list(re.finditer(r'([\w.]+(?:\([^;\n]*?\))?)\??\.Get\(([^\n]*?)\)\.SetStart\(([^;\n]+)\)',s))
 if calls:
  for m in reversed(calls):
   s=s[:m.start()]+f'updateRuleStart({m[1]}, {m[2]}, {m[3]})'+s[m.end():]
  numberImport=next(x for x in re.findall(r'import[^;]+from [^;]+;',s,re.S) if re.search(r'from ["\'][^"\']*/number["\']',x)) if 'from "' in s and re.search(r'from ["\'][^"\']*/number["\']',s) else None
  if not numberImport:
   import os
   path=os.path.relpath(root/'sw/source/core/doc/number',p.parent)
   s=f'import type {{ SwNumRule }} from "{path}";\n'+s
  elif 'SwNumRule' not in numberImport:
   s=s.replace(numberImport,numberImport.replace('{','{ type SwNumRule,',1))
  s+='''
/** Changes an independent level and applies it through native Set ownership. @param rule - Rule. @param level - Native level. @param start - Starting value. @returns Nothing. */
function updateRuleStart(rule: SwNumRule | undefined, level: number, start: number): void {
  if (rule === undefined) return;
  const format = rule.Get(level).clone();
  format.SetStart(start);
  rule.Set(level, format);
}
'''
  # Most helpers always have a rule: remove optionality/no-op branch unless caller genuinely optional.
  if not any(x in s for x in ['const rule = document.FindNumRulePtr','const rule = doc.FindNumRulePtr','const rule = node.GetNumRule','const rule = writer.FindNumRulePtr']):
   # Keep genuine optional sites detected by original source only; inspect and tighten after typecheck.
   pass
  p.write_text(s)
# Multiline vector pattern needs explicit copy.
p=root/'sw/source/core/SwNumberTree/SwNumberTree.test.ts';s=p.read_text();s=s.replace('    rule.Get(level).SetListFormat(', '    const format = rule.Get(level).clone();\n    format.SetListFormat(').replace('    );\n  }\n  const nodes = items.map(', '    );\n    rule.Set(level, format);\n  }\n  const nodes = items.map(');p.write_text(s)
p=root/'sw/source/core/doc/number-list-format.test.ts';s=p.read_text().replace('const format = rule.Get(', 'const format = rule.Get(')
s=re.sub(r'const format = rule.Get\((\d)\);',r'const format = rule.Get(\1).clone();',s)
s=s.replace('  rule.Get(9).SetListFormat("%10%:%1%");','  const tenth = rule.Get(9).clone();\n  tenth.SetListFormat("%10%:%1%");\n  rule.Set(9, tenth);')
lines=s.splitlines();level='2';out=[]
for line in lines:
 if 'const format = rule.Get(0)' in line:level='0'
 out.append(line)
 if re.match(r'  format.Set\w+\(.*\);$',line):out.append(f'  rule.Set({level}, format);')
s='\n'.join(out)+'\n';p.write_text(s)
# Worker v16 optional metadata keeps legacy complete explicit levels.
p=root/'sw/browser/filter/xml/writer-document-codec.ts';s=p.read_text()
s=s.replace('import { createWriterNumRule } from "../../../source/core/doc/DocumentListsManager";\n','')
s=s.replace('  readonly bulletFont: string;','  readonly bulletFont: string;\n  readonly numberingType?: "arabic" | "char-special" | "none";',1)
s=s.replace('  readonly ruleType?: SwNumRuleType;','  readonly ruleType?: SwNumRuleType;\n  readonly ownedLevels?: readonly boolean[];\n  readonly defaultPositionAndSpaceMode?: "label-alignment" | "label-width-and-position";',1)
s=s.replace('        automatic: rule.IsAutoRule(),','        automatic: rule.IsAutoRule(),\n        defaultPositionAndSpaceMode: rule.GetDefaultNumberFormatPositionAndSpaceMode(),\n        ownedLevels: Array.from({ length: 10 },\n          /** Retains native optional level ownership. @param _unused - Placeholder. @param level - Level. @returns Presence. */\n          (_unused, level) => rule.GetNumFormat(level) !== undefined),')
s=s.replace('              bulletFont: format.GetBulletFont(),','              bulletFont: format.GetBulletFont(),\n              numberingType: format.GetNumberingType(),')
a=s.index('    const restoredRule = createWriterNumRule(');b=s.index('    document.AddNumRule(restoredRule);',a)
s=s[:a]+'''    if (rule.formats.length !== 10 || (rule.ownedLevels !== undefined &&
      (rule.ownedLevels.length !== 10 || rule.ownedLevels.some(
        /** Rejects malformed presence bits. @param owned - Candidate. @returns Invalidity. */
        owned => typeof owned !== "boolean")))) throw new Error("Stored Writer numbering ownership is invalid.");
    const mode = rule.defaultPositionAndSpaceMode ?? "label-alignment";
    if (mode !== "label-alignment" && mode !== "label-width-and-position") throw new Error("Stored Writer numbering default mode is invalid.");
    const restoredRule = new SwNumRule(rule.name, mode, rule.ruleType ?? SwNumRuleType.NUM_RULE);
    restoredRule.SetDefaultListId(rule.listId);
    restoredRule.SetAutoRule(rule.automatic);
    for (let level = 0; level < 10; level++) {
      const format = rule.formats[level] as WriterNumberFormatRecord;
      if (format.numberingType !== undefined && !["arabic", "char-special", "none"].includes(format.numberingType))
        throw new Error("Stored Writer numbering format type is invalid.");
      const decoded = new SwNumFormat(format.kind, format.bulletChar, {
        absLSpace: format.absLSpace ?? 0, firstLineOffset: format.firstLineOffset ?? 0, charTextDistance: format.charTextDistance ?? 0,
        bulletFont: format.bulletFont, numberingType: format.numberingType,
        firstLineIndent: format.firstLineIndent, indentAt: format.indentAt, includeUpperLevels: format.includeUpperLevels,
        labelFollowedBy: format.labelFollowedBy, listTabPosition: format.listTabPosition, positionAndSpaceMode: format.positionAndSpaceMode,
        ...(format.listFormat === undefined ? {} : { listFormat: format.listFormat }),
        prefix: format.prefix, start: format.start, suffix: format.suffix,
      });
      if (rule.ownedLevels === undefined || rule.ownedLevels[level]) restoredRule.Set(level, decoded);
    }
'''+s[b:];p.write_text(s)
# Remove unused class imports after legacy constructor assembly migration (types left for helpers).
for p in root.rglob('*.ts'):
 s=p.read_text()
 if s.count('SwNumRule')==1:
  s=s.replace('SwNumRule, ','').replace(', SwNumRule','').replace('import { SwNumRule }', 'import {}')
  s=re.sub(r'import \{\} from [^;]+;\n','',s)
  p.write_text(s)
