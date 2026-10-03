/** @fileoverview Supplies Writer text-node policy to the source-owned hierarchical and continuous number tree. */

import type { SwDoc } from "../doc/doc";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";
import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Registered list item, root or phantom retaining the owning numbering rule. */
export class SwNodeNum extends SwNumberTreeNode {
  private readonly textNode: SwTextNode | undefined;
  private mpNumRule: SwNumRule | undefined;
  private m_isHiddenRedlines: boolean;
  /** Creates an initially unbound text record. @param textNode - Nullable canonical text node. @param isHiddenRedlines - Required hidden redline mode. @returns Node. */
  public constructor(textNode: SwTextNode | undefined, isHiddenRedlines: boolean);
  /** Creates a root or phantom retaining its rule. @param rule - Nullable rule pointer. @returns Node. */
  public constructor(rule: SwNumRule | undefined);
  /** Initializes the selected native constructor family. @param owner - Text or rule pointer. @param isHiddenRedlines - Present only for text construction. @returns Node. */
  public constructor(owner: SwTextNode | SwNumRule | undefined, isHiddenRedlines?: boolean) {
    super();
    if (isHiddenRedlines !== undefined) {
      this.textNode = owner as SwTextNode | undefined;
      this.mpNumRule = undefined;
      this.m_isHiddenRedlines = isHiddenRedlines;
    } else {
      this.textNode = undefined;
      this.mpNumRule = owner as SwNumRule | undefined;
      this.m_isHiddenRedlines = false;
    }
  }
  /** Returns the canonical list item. @returns Text node, absent for a root. */
  public GetTextNode(): SwTextNode | undefined {
    return this.textNode;
  }
  /** Returns the rule bound by registration, absent after removal. @returns Bound rule. */
  public GetNumRule(): SwNumRule | undefined {
    return this.mpNumRule;
  }
  /** Rebinds a record while transferring rule membership. @param rule - New rule. @returns Nothing. */
  public ChangeNumRule(rule: SwNumRule): void {
    if (this.GetNumRule() !== undefined && this.GetTextNode() !== undefined)
      (this.GetNumRule() as SwNumRule).RemoveTextNode(this.GetTextNode() as SwTextNode);
    this.mpNumRule = rule;
    if (this.GetNumRule() !== undefined && this.GetTextNode() !== undefined)
      (this.GetNumRule() as SwNumRule).AddTextNode(this.GetTextNode() as SwTextNode);
  }
  /** Binds the rule and registers shown document items before insertion. @returns Nothing. */
  protected PreAdd(): void {
    if (this.GetNumRule() === undefined && this.GetTextNode() !== undefined)
      this.mpNumRule = (this.GetTextNode() as SwTextNode).GetNumRule();
    if (
      !this.m_isHiddenRedlines &&
      this.GetNumRule() !== undefined &&
      this.GetTextNode() !== undefined
    ) {
      (this.GetNumRule() as SwNumRule).AddTextNode(this.GetTextNode() as SwTextNode);
    }
    if (!this.m_isHiddenRedlines) {
      if (
        this.GetTextNode() !== undefined &&
        (this.GetTextNode() as SwTextNode).GetNodes().IsDocNodes()
      )
        (this.GetTextNode() as SwTextNode).getIDocumentListItems().addListItem(this);
    }
  }
  /** Removes document and rule membership and clears the bound rule. @returns Nothing. */
  protected PostRemove(): void {
    if (!this.m_isHiddenRedlines && this.GetTextNode() !== undefined) {
      (this.GetTextNode() as SwTextNode).getIDocumentListItems().removeListItem(this);
    }
    if (this.GetNumRule() !== undefined) {
      if (!this.m_isHiddenRedlines && this.GetTextNode() !== undefined)
        (this.GetNumRule() as SwNumRule).RemoveTextNode(this.GetTextNode() as SwTextNode);
      this.mpNumRule = undefined;
    }
  }
  /** Reads the text-owned blocker policy or no-text global policy. @param document - Native operation context. @returns Whether the record can be notified. */
  protected IsNotifiable(document: SwDoc): boolean {
    const textNode = this.GetTextNode();
    return textNode === undefined ? this.IsNotificationEnabled(document) : textNode.IsNotifiable();
  }
  /** Delegates real records to text policy and checks the operation document for no-text records. @param document - Required native operation context for no-text records. @returns Whether enabled. */
  public override IsNotificationEnabled(document: SwDoc): boolean {
    const textNode = this.GetTextNode();
    if (textNode !== undefined) return textNode.IsNotificationEnabled();
    return !document.IsInReading() && !document.IsInDtor();
  }
  /** Validates the prefix before notifying the paragraph. @returns Nothing. */
  protected NotifyNode(): void {
    this.ValidateMe();
    this.textNode?.NumRuleChgd();
  }
  /** Creates a no-text record retaining the current rule. @returns Root/phantom factory record. */
  protected Create(): SwNodeNum {
    return new SwNodeNum(this.GetNumRule());
  }
  /** Reads bound-rule continuous policy or inherits it from a parent. @returns Continuous flag, false for an unbound orphan. */
  public IsContinuous(): boolean {
    let result = false;
    if (this.GetNumRule() !== undefined) result = (this.mpNumRule as SwNumRule).IsContinusNum();
    else if (this.GetParent() !== undefined)
      result = (this.GetParent() as SwNumberTreeNode).IsContinuous();
    return result;
  }
  /** Reads native phantom policy independently of parent inheritance. @returns Whether phantoms count, true without a bound rule. */
  protected override IsCountPhantoms(): boolean {
    let result = true;
    if (this.mpNumRule !== undefined)
      result = !this.mpNumRule.IsContinusNum() && this.mpNumRule.IsCountPhantoms();
    return result;
  }
  /** Compares phantom/root records before real text records, then document indexes. @param node - Compared record. @returns Native ordering. */
  public LessThan(node: SwNumberTreeNode): boolean {
    let result = false;
    const other = node as SwNodeNum;
    if (this.textNode === undefined && other.textNode !== undefined) result = true;
    else if (this.textNode !== undefined && other.textNode !== undefined)
      result = this.textNode.GetIndex() < other.textNode.GetIndex();
    return result;
  }
  /** Reads native SwTextNode counted policy. @returns Counted flag including native phantom policy. */
  public override IsCounted(): boolean {
    let result: boolean;
    if (this.GetTextNode() !== undefined)
      result = (this.GetTextNode() as SwTextNode).IsCountedInList();
    else result = super.IsCounted();
    return result;
  }
  /** Finds counted descendants with the Writer numbering-present policy. @returns Whether a descendant contributes numbering. */
  protected override HasCountedChildren(): boolean {
    for (const child of this.mChildren)
      if (
        child instanceof SwNodeNum &&
        (child.IsCountedForNumbering() || child.HasCountedChildren())
      )
        return true;
    return false;
  }
  /** Reads numbered/bullet presence for the supported rule families. @returns Counted numbering policy. */
  protected override IsCountedForNumbering(): boolean {
    return (
      this.IsCounted() &&
      (this.IsPhantom() ||
        this.GetTextNode() === undefined ||
        (this.GetTextNode() as SwTextNode).HasNumber() ||
        (this.GetTextNode() as SwTextNode).HasBullet())
    );
  }
  /** Reads native SwTextNode restart policy. @returns Restart flag, false for a root. */
  public IsRestart(): boolean {
    let result = false;
    if (this.GetTextNode() !== undefined)
      result = (this.GetTextNode() as SwTextNode).IsListRestart();
    return result;
  }
  /** Reads explicit restart or the bounded owned level format start. @returns Start value, defaulting to one without a rule, valid level or owned format. */
  public GetStartValue(): number {
    let result = 1;
    if (this.IsRestart() && this.GetTextNode() !== undefined) {
      result = (this.GetTextNode() as SwTextNode).GetActualListStartValue();
    } else {
      const rule = this.GetNumRule();
      if (rule !== undefined) {
        const level = this.GetParent() === undefined ? 0 : this.GetLevelInListTree();
        if (level >= 0 && level <= WRITER_MAX_LIST_LEVEL) {
          const format = rule.GetNumFormat(level);
          if (format !== undefined) result = format.GetStart();
        }
      }
    }
    return result;
  }
}
