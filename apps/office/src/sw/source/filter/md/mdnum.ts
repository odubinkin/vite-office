/** @fileoverview Markdown list-rule state corresponding to sw/source/filter/md/mdnum.hxx and swmd.cxx. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { applyWriterParagraphList } from "../../core/doc/list";
import { getWriterNumFormatKind, SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

// Pinned MD_NUMBER_BULLET_MARGINLEFT and MD_NUMBER_BULLET_INDENT, converted to twips.
const MD_NUMBER_BULLET_MARGINLEFT = Math.round((125 * 1440) / 254);
const MD_NUMBER_BULLET_INDENT = -Math.round((5 * 1440) / 25.4);

/** One md4c list item whose rule remains shared across nested list types. */
export interface MarkdownListItem {
  readonly kind: "bullet" | "numbered";
  readonly level: number;
  readonly id: string;
}

/** Owns per-list numbering rules and the levels initialized by md4c list callbacks. */
export class SwMdNumRuleInfo {
  private readonly rules = new Map<string, SwNumRule>();

  /** Binds a list item to its document-owned rule and native level format. @param node - Current text node. @param item - Parsed list callback. @returns Nothing. */
  public Apply(node: SwTextNode, item: MarkdownListItem): void {
    let rule = this.rules.get(item.id);
    if (rule === undefined) {
      const manager = node.GetDoc().GetDocumentListsManager();
      const created = new SwNumRule(item.id, "label-alignment");
      created.SetDefaultListId(manager.CreateUniqueListId());
      created.SetAutoRule(false);
      rule = manager.AddNumRule(created);
      this.rules.set(item.id, rule);
    }
    if (rule.GetNumFormat(item.level) === undefined) {
      const format = rule.Get(item.level).clone();
      format.SetNumberingType(
        item.kind === "bullet" ? SvxNumType.SVX_NUM_CHAR_SPECIAL : SvxNumType.SVX_NUM_ARABIC,
      );
      if (item.kind === "bullet") format.SetBulletChar(0x2022);
      const previous = item.level > 0 ? rule.Get(item.level - 1) : undefined;
      format.SetAbsLSpace(MD_NUMBER_BULLET_MARGINLEFT + (previous?.GetAbsLSpace() ?? 0));
      format.SetFirstLineOffset(previous?.GetFirstLineOffset() ?? MD_NUMBER_BULLET_INDENT);
      rule.Set(item.level, format);
    }
    applyWriterParagraphList(node, {
      kind: getWriterNumFormatKind(rule.Get(item.level)),
      level: item.level,
      ruleName: rule.GetName(),
      listId: rule.GetDefaultListId(),
    });
    node.SetCountedInList(true);
  }

  /** Fills untouched levels using the last actual format after the outer list closes. @returns Nothing. */
  public Finish(): void {
    for (const rule of this.rules.values()) {
      let previousLevel: number | undefined;
      for (let level = 0; level < 10; level++) {
        if (rule.GetNumFormat(level) !== undefined) {
          previousLevel = level;
          continue;
        }
        if (previousLevel === undefined) continue;
        const previous = rule.Get(previousLevel);
        const format = rule.Get(level).clone();
        format.SetNumberingType(previous.GetNumberingType());
        if (previous.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL)
          format.SetBulletChar(0x2022);
        format.SetAbsLSpace((level + 1) * MD_NUMBER_BULLET_MARGINLEFT);
        format.SetFirstLineOffset(MD_NUMBER_BULLET_INDENT);
        rule.Set(level, format);
      }
    }
  }
}
