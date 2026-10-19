import fs from 'node:fs';
const p='apps/office/src/sc/source/ui/view/formatsh.ts';let s=fs.readFileSync(p,'utf8');
s=s.replace('import { AdjustBlockHeight }',`import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxWeightItem, SvxPostureItem, SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
import { AdjustBlockHeight }`);
s=s.replace('/** Source format owner',`/** Consumed source character slots; browser code carries no attribute values. */
export type CalcCharacterFormat = "bold" | "italic" | "underline";
/** Native three-script Which identities for weight/posture and source shared underline. */
const formatIds = { bold: [102,113,118], italic: [103,114,119], underline: [104] } as const;
/** Source format owner`);
let a=s.indexOf('    ScFormatShell.ValidateFontSize(points);',s.indexOf('  SetFontSize('));let b=s.indexOf('    const doc =',a);
s=s.slice(0,a)+`    ScFormatShell.ValidateFontSize(points);
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT])
      delta.ItemSetPut(new SvxFontHeightItem(points * 20, 100, which));
    return this.ApplySelectionPattern(delta);
  }
  /** Reads actual effective item equality across selected pattern runs and requested scripts. @param ids - Native Which identities. @returns Uniform borrowed item or mixed state. */
  private SelectionItem(ids: readonly number[]): SfxPoolItem | undefined {
    const doc = this.shell.GetDocument(), range = this.AttributeRange(), first: [number] = [0], last: [number] = [0];
    let selected: SfxPoolItem | undefined;
    for (const tab of this.viewData.GetMarkData().GetSelectedTabs()) {
      const table = doc.FetchTable(tab) as ScTable;
      const end = Math.min(range.aEnd.Col(), Math.max(range.aStart.Col(),table.GetAllocatedColumnsCount()));
      for (let col = range.aStart.Col(); col <= end; col++)
        for (let row = range.aStart.Row(); row <= range.aEnd.Row();) {
          const pattern = table.GetColumnData(col).GetPatternRange(first,last,row) as ScPatternAttr;
          for (const which of ids) {
            const item = pattern.GetItem(which);
            if (selected && !selected.equals(item)) return undefined;
            selected = item;
          }
          row = last[0]+1;
        }
    }
    return selected;
  }
  /** Reads source Latin attribute state used by the current plain-cell toolbar; script-aware rich input remains unported. @param format - Character slot. @returns Boolean state or mixed. */
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined {
    const item = this.SelectionItem([formatIds[format][0]]);
    if (!item) return undefined;
    if (format === "bold") return (item as SvxWeightItem).GetBoolValue();
    if (format === "italic") return (item as SvxPostureItem).GetPosture() !== FontItalic.ITALIC_NONE;
    return (item as SvxUnderlineItem).GetLineStyle() !== FontLineStyle.LINESTYLE_NONE;
  }
  /** Executes source whole-cell toggles; weight/posture compare all scripts,underline copies its actual color. @param format - Native character operation. @param enabled - Explicit boolean or native no-argument toggle. @returns Whether changed. */
  SetCharacterFormat(format: CalcCharacterFormat, enabled?: boolean): boolean {
    const doc = this.shell.GetDocument(), delta = new ScPatternAttr(doc.getCellAttributeHelper());
    const ids = formatIds[format], old = this.SelectionItem(ids);
    if (format === "bold") {
      const value = enabled ?? !(old && (old as SvxWeightItem).GetWeight() === FontWeight.WEIGHT_BOLD);
      for (const which of ids) delta.ItemSetPut(new SvxWeightItem(value ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL,which));
    } else if (format === "italic") {
      const value = enabled ?? !(old && (old as SvxPostureItem).GetPosture() === FontItalic.ITALIC_NORMAL);
      for (const which of ids) delta.ItemSetPut(new SvxPostureItem(value ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE,which));
    } else {
      const item = new SvxUnderlineItem((old ?? doc.GetPool().GetPoolDefaultItem(104)) as SvxUnderlineItem);
      const value = enabled ?? (item.GetLineStyle() === FontLineStyle.LINESTYLE_NONE);
      item.SetLineStyle(value ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE);
      delta.ItemSetPut(item);
    }
    return this.ApplySelectionPattern(delta);
  }
  /** Shared native ApplySelectionPattern responsibility with original attribute snapshot/history ownership. @param delta - Owned native pattern. @returns Whether changed. */
  private ApplySelectionPattern(delta: ScPatternAttr): boolean {
`+s.slice(b);
s=s.replace('    const delta = new ScPatternAttr(doc.getCellAttributeHelper());\n    for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT])\n      delta.ItemSetPut(new SvxFontHeightItem(twips, 100, which));\n','');
fs.writeFileSync(p,s);
const c='apps/office/src/sc/browser/controller/calc-view-controller.ts';s=fs.readFileSync(c,'utf8').replace('import { ScFormatShell }','import type { CalcCharacterFormat } from "../../source/ui/view/formatsh";\nimport { ScFormatShell }');s=s.replace('  /** Starts actual transient input',`  /** Reads real selected character state. @param format - Native operation. @returns Uniform state or mixed. */
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined {
    return new ScFormatShell(this.viewData,this.shell).GetCharacterState(format);
  }
  /** Commits input before native whole-cell character formatting. @param format - Native operation. @param enabled - Optional explicit value. @returns Changed. */
  SetCharacterFormat(format: CalcCharacterFormat, enabled?: boolean): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData,this.shell).SetCharacterFormat(format,enabled);
    this.Changed();
    return changed;
  }
  /** Starts actual transient input`);fs.writeFileSync(c,s);
