/**
 * @fileoverview Implements canonical Writer text nodes at the pinned LibreOffice `sw/source/core/txtnode/ndtxt.cxx` ownership boundary.
 */
import { InsertTextNodeHint } from "./thints-insert";
import type { SwFormatCharFormat } from "./fmtatr2";
import { UpdateTextNodeReplacementIndices } from "./ndtxt-hints";
import { TriggerTextNodeUpdate } from "./ndtxt-format-change";
import type { UpdateAttrHint } from "../../../inc/hints";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
} from "../../../inc/hintids";
import type { tNumberVector } from "../../../inc/SwNumberTreeTypes";
import { GetTextAttrMode, SetAttrMode } from "../../../inc/swtypes";
import { SwContentIndexUpdateMode, type SwContentIndex } from "../bastyp/index";
import type { SwPosition } from "../crsr/pam";
import type { DocumentListItemsManager } from "../doc/DocumentListItemsManager";
import { SwTextFormatColl, type SwFormatColl, type WriterParagraphStyle } from "../doc/fmtcol";
import { SwList, WRITER_MAX_LIST_LEVEL, type WriterParagraphListKind } from "../doc/list";
import { getWriterNumFormatKind, SwNumRule } from "../doc/number";
import { SwContentNode, type SwStartNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { resolveSwTextFirstLineIndent } from "../text/itrcrsr";
import type { WriterHyperlink } from "./fmtatr2";
import {
  HandleResetAttrAtTextNode,
  HandleSetAttrAtTextNode,
  IsOutlineAtTextNode,
} from "./ndtxt-attribute-handlers";
import { GetTextAttrAt, type RangedTextAttribute } from "./ndtxt-attribute-query";
import {
  HandleModifyAtTextNodeFormatChange,
  PrepareSplitTextNodeFormat,
} from "./ndtxt-format-change";
import {
  type SwTextFragment,
  type WriterCharacterFormat,
  type WriterParagraphAlignment,
} from "./ndtxt.attributes";

import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwNumRuleItem, type ListLevelIndents } from "../para/paratr";
import type { SwFormatINetFormat } from "./fmtatr2";
import { SwpHints } from "./ndhints";
import {
  AppendTextNodeHints,
  AssertTextNodeRange,
  CopyTextNodeHints,
  CreateTextNodeColorFragment,
  CreateTextNodeFontFamilyFragment,
  CreateTextNodeFontSizeFragment,
  CreateTextNodeFragment,
  CreateTextNodeHyperlinkFragment,
  CreateTextNodeToggledFragment,
  getSvxAdjust,
  GetTextNodeCharacterItems,
  GetTextNodeRangeFormatState,
  getWriterParagraphAlignment,
  InsertTextNodeHints,
  MoveTextAttrToAttrSet,
  ReplaceTextNodeHints,
  SplitTextNodeEndHints,
} from "./ndtxt-hints";
import {
  CaptureSwTextNodeListItems,
  NotifyTextNodeNumRuleChanged,
  GetSwTextNodeListLabel,
  GetSwTextNodeNumString,
  HasSwTextNodeVisibleNumbering,
  resolveSwLeftMarginForTabCalculation,
  resolveSwLeftMarginWithNum,
  resolveSwListLevelIndents,
} from "./ndtxt-list-indent";
import * as thints from "./thints";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";
export { copyWriterTextRangeRuns, projectWriterTextRuns } from "./ndtxt-hints";

/**
 * Owns one Writer paragraph's canonical text, paragraph items, format collection, and range hints.
 *
 * The compatibility `runs` accessor delegates to the separate immutable projection boundary.
 */
export class SwTextNode extends SwContentNode {
  private mText: string;
  private m_pSwpHints: SwpHints | undefined;
  /** Reads the native hint container. @returns Current owned container. */
  private get pSwpHints(): SwpHints | undefined {
    return this.m_pSwpHints;
  }
  /** Applies node ownership to every existing hint assignment. @param hints - Replacement container. @returns Nothing. */
  private set pSwpHints(hints: SwpHints | undefined) {
    this.m_pSwpHints = ReplaceTextNodeHints(this, this.m_pSwpHints, hints);
  }
  private listGeometryWins = false;
  private mpNodeNum: SwNodeNum | undefined;
  private mbEmptyListStyleSetDueToSetOutlineLevelAttr = false;
  private mbInSetOrResetAttr = false;
  private m_bLastOutlineState = false;
  private m_bNotifiable = true;
  /** Creates a text node in one Writer content section. @param nodes - Owning node array. @param startOfSection - Containing section. @param formatColl - Registered paragraph style. @param text - Initial canonical text. @returns Nothing. */
  public constructor(
    nodes: SwNodes,
    startOfSection: SwStartNode,
    formatColl: SwTextFormatColl = nodes.GetDoc().GetDfltTextFormatColl(),
    text = "",
  ) {
    super(nodes, startOfSection, formatColl);
    this.mText = text;
  }
  /** Returns the canonical node text. @returns Canonical text. */
  public GetText(): string {
    return this.mText;
  }

  /** Reports whether a list style overrides paragraph indentation inherited from an ancestor style. @returns List precedence. */
  public DoesListGeometryWin(): boolean {
    return this.listGeometryWins;
  }

  /** Resolves native independent list-indent applicability from live items and styles. @returns Native flags. */
  public AreListLevelIndentsApplicable(): ListLevelIndents {
    return resolveSwListLevelIndents(this);
  }

  /** Stores the imported style cascade's list indentation precedence. @param value - List precedence. @returns Nothing. */
  public SetListGeometryWins(value: boolean): void {
    this.listGeometryWins = value;
  }

  /** Returns text length in UTF-16 code units, matching Writer content indices. @returns UTF-16 length. */
  public Len(): number {
    return this.mText.length;
  }

  /** Returns the optional direct-format hint container. @returns Owned hints, when allocated. */
  public GetpSwpHints(): SwpHints | undefined {
    return this.pSwpHints;
  }

  /** Returns an existing hint container or creates it lazily. @returns Owned hints. */
  public GetOrCreateSwpHints(): SwpHints {
    this.pSwpHints ??= new SwpHints(this.GetDoc().GetAttrPool());
    return this.pSwpHints;
  }

  /** Replaces canonical ranged attributes without accepting a browser run projection. @param hints - Writer text attributes. @returns Nothing. */
  public SetTextHints(hints: SwpHints): void {
    const replacement = CopyTextNodeHints(this, hints);
    this.pSwpHints = replacement.CanBeDeleted() ? undefined : replacement;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Publishes the native generic range update to original node clients and the existing document projection, then refreshes outline membership outside destruction. @param hint - Borrowed native range hint. @returns Nothing. */
  public TriggerNodeUpdate(hint: UpdateAttrHint): void {
    TriggerTextNodeUpdate(this, hint);
  }

  /** Inserts a supported native item through the undo NOHINTADJUST path. @param attr - Ranged item. @param start - Start offset. @param end - End offset. @param mode - Native insertion flags. @returns Original surviving attribute or undefined after native portion replacement. */
  public InsertItem(
    attr: SfxPoolItem,
    start: number,
    end: number,
    mode = SetAttrMode.DEFAULT,
  ): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat> | undefined {
    return thints.InsertTextNodeItem(this, attr, start, end, mode);
  }

  /** Original ownership-transfer insertion for represented native ranged families. @param hint - Actual detached attribute. @param mode - Native insertion flags. @returns Success independent of identity retention after merging. */
  public InsertHint(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
    mode = SetAttrMode.DEFAULT,
  ): boolean {
    return InsertTextNodeHint(this, hint, mode);
  }

  /** Deletes represented same-family attributes with exact start/end, retaining the native forward-loop behavior. @param which - Native family. @param start - Exact start. @param end - Exact end. @returns Nothing. */
  public DeleteAttributes(which: number, start: number, end: number): void {
    thints.DeleteTextNodeAttributes(this, which, start, end);
  }
  /** Releases an empty native map when CanBeDeleted allows it. @returns Nothing. */
  public TryDeleteSwpHints(): void {
    if (this.pSwpHints?.CanBeDeleted()) this.pSwpHints = undefined;
  }

  /** Clears implemented text attributes while retaining the allocated map. @param deleteFields - Native field policy;no field hints are currently implemented. @returns Nothing. */
  public ClearSwpHintsArr(deleteFields: boolean): void {
    thints.ClearTextNodeHints(this, deleteFields);
  }

  /** Converts direct character items into native ranged automatic styles before joining. @param node - Surviving paragraph. @returns Nothing. */
  public FormatToTextAttr(node: SwTextNode): void {
    thints.FormatTextNodeToTextAttr(this, node);
    if (node.GetOrCreateSwpHints().CanBeDeleted()) node.pSwpHints = undefined;
  }

  /** Moves eligible full-span hints into this paragraph's native direct item set. @returns Nothing. */
  public MoveTextAttr_To_AttrSet(): void {
    MoveTextAttrToAttrSet(this);
    if (this.pSwpHints?.CanBeDeleted()) this.pSwpHints = undefined;
  }

  /** Returns the paragraph adjustment item as a view-friendly value. @returns Paragraph alignment. */
  public GetParagraphAlignment(): WriterParagraphAlignment {
    const adjust = (this.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust();
    return getWriterParagraphAlignment(adjust);
  }

  /** Returns the effective direct text-left margin in twips. @returns Text-left margin. */
  public GetParagraphTextLeftMargin(): number {
    return (this.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft();
  }
  /** Returns the effective first-line indent in twips. @returns First-line indent. */
  public GetParagraphFirstLineIndent(): number {
    return resolveSwTextFirstLineIndent(this);
  }
  /** Returns the effective right paragraph margin in twips. @returns Right margin. */
  public GetParagraphRightMargin(): number {
    return (this.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight();
  }

  /** Returns the effective list family from the paragraph's SwNumRule. @returns List kind. */
  public GetListKind(): WriterParagraphListKind {
    const rule = this.GetNumRule();
    return rule === undefined ? "none" : getWriterNumFormatKind(rule.Get(this.GetAttrListLevel()));
  }

  /** Returns the SwNumRuleItem value applied to this text node. @returns Rule name, or an empty string. */
  public GetNumRuleName(): string {
    return (this.GetAttr(RES_PARATR_NUMRULE) as SwNumRuleItem).GetValue();
  }

  /** Resolves the numbering rule with Writer's inherited-outline exclusion. @param inParent - Whether parent attributes participate. @returns Document-owned rule, when valid. */
  public GetNumRule(inParent = true): SwNumRule | undefined {
    const ruleName = (this.GetAttr(RES_PARATR_NUMRULE, inParent) as SwNumRuleItem).GetValue();
    const rule = ruleName.length === 0 ? undefined : this.GetDoc().FindNumRulePtr(ruleName);
    if (
      rule !== undefined &&
      rule.GetName() === SwNumRule.GetOutlineRuleName() &&
      this.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) === undefined &&
      this.GetTextFormatColl().GetNumRule(false).GetValue().length === 0
    )
      return undefined;
    return rule;
  }

  /** Changes collection and reconciles numbering before applying assigned heading levels. @param collection - New paragraph collection. @param setListLevel - Whether to apply the assigned heading level. @returns Previous collection. */
  public override ChgFormatColl(collection: SwFormatColl, setListLevel = true): SwTextFormatColl {
    if (!(collection instanceof SwTextFormatColl))
      throw new Error("Writer text node requires a text format collection.");
    const previous = this.GetTextFormatColl();
    if (collection !== previous) {
      super.ChgFormatColl(collection);
      if (!this.mbInSetOrResetAttr) HandleModifyAtTextNodeFormatChange(this);
    }
    if (this.GetNodes().IsDocNodes()) this.ChgTextCollUpdateNum(previous, collection, setListLevel);
    return previous;
  }

  /** Applies the existing collection assignment in the bounded outline slice. @param _oldCollection - Former collection retained at the native helper contract. @param collection - New paragraph collection. @param setListLevel - Whether to set the level. @returns Nothing. */
  private ChgTextCollUpdateNum(
    _oldCollection: SwTextFormatColl,
    collection: SwTextFormatColl,
    setListLevel: boolean,
  ): void {
    const level = collection.IsAssignedToListLevelOfOutlineStyle()
      ? collection.GetAssignedOutlineStyleLevel()
      : 10;
    if (level !== 10 && level !== -1 && setListLevel) this.SetAttrListLevel(level);
    this.GetNodes().UpdateOutlineNode(this);
  }

  /** Reads the pooled paragraph outline attribute without inline-frame resolution. @returns Outline level. */
  public GetAttrOutlineLevel(): number {
    return (this.GetAttr(RES_PARATR_OUTLINELEVEL) as SfxUInt16Item).GetValue();
  }

  /** Stores a bounded outline attribute. @param level - Level from zero through ten. @returns Nothing. */
  public SetAttrOutlineLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > 10)
      throw new Error("Writer outline level is outside 0-10.");
    this.SetAttr(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, level));
  }

  /** Reports the source's synthesized empty-list-style marker. @returns Marker state. */
  public IsEmptyListStyleDueToSetOutlineLevelAttr(): boolean {
    return this.mbEmptyListStyleSetDueToSetOutlineLevelAttr;
  }

  /** Suppresses inherited numbering for a directly outlined paragraph. @returns Nothing. */
  public SetEmptyListStyleDueToSetOutlineLevelAttr(): void {
    if (!this.mbEmptyListStyleSetDueToSetOutlineLevelAttr) {
      this.SetAttr(new SwNumRuleItem());
      this.mbEmptyListStyleSetDueToSetOutlineLevelAttr = true;
    }
  }

  /** Clears only a synthesized empty-list-style attribute. @returns Nothing. */
  public ResetEmptyListStyleDueToResetOutlineLevelAttr(): void {
    if (this.mbEmptyListStyleSetDueToSetOutlineLevelAttr) {
      this.ResetAttr(RES_PARATR_NUMRULE);
      this.mbEmptyListStyleSetDueToSetOutlineLevelAttr = false;
    }
  }

  /** Returns the zero-based RES_PARATR_LIST_LEVEL value. @returns List level. */
  public GetAttrListLevel(): number {
    return (this.GetAttr(RES_PARATR_LIST_LEVEL) as SfxInt16Item).GetValue();
  }

  /** Sets the bounded RES_PARATR_LIST_LEVEL value. @param level - Zero-based list level. @returns Nothing. */
  public SetAttrListLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`Writer list level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    this.SetAttr(new SfxInt16Item(RES_PARATR_LIST_LEVEL, level));
  }

  /** Changes only the restart flag. @param restart - Whether this item restarts. @returns Nothing. */
  public SetListRestart(restart: boolean): void {
    if (!restart) this.ResetAttr(RES_PARATR_LIST_ISRESTART);
    else this.SetAttr(new SfxBoolItem(RES_PARATR_LIST_ISRESTART, true));
  }

  /** Sets the signed restart value or clears USHRT_MAX. @param number - Native integer input. @returns Nothing. */
  public SetAttrListRestartValue(number: number): void {
    const changed = this.HasAttrListRestartValue()
      ? this.GetAttrListRestartValue() !== number
      : number !== 65_535;
    if (!changed && this.HasAttrListRestartValue()) return;
    if (number === 65_535) this.ResetAttr(RES_PARATR_LIST_RESTARTVALUE);
    else this.SetAttr(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, (number << 16) >> 16));
  }

  /** Applies Writer's RES_PARATR_LIST_ISCOUNTED flag. @param counted - Whether this list item advances numbering. @returns Nothing. */
  public SetCountedInList(counted: boolean): void {
    if (counted) this.ResetAttr(RES_PARATR_LIST_ISCOUNTED);
    else this.SetAttr(new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, false));
  }

  /** Reports the effective list-counted flag. @returns Whether numbering advances. */
  public IsCountedInList(): boolean {
    return (this.GetAttr(RES_PARATR_LIST_ISCOUNTED) as SfxBoolItem).GetValue();
  }

  /** Reports Writer's list restart flag. @returns Restart state. */
  public IsListRestart(): boolean {
    return (this.GetAttr(RES_PARATR_LIST_ISRESTART) as SfxBoolItem).GetValue();
  }

  /** Reports whether an explicit restart value is directly set. @returns Direct-value state. */
  public HasAttrListRestartValue(): boolean {
    return this.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_RESTARTVALUE, false) !== undefined;
  }
  /** Reads the effective restart item after a nonfatal absent-direct diagnostic. @returns Signed restart value. */
  public GetAttrListRestartValue(): number {
    if (!this.HasAttrListRestartValue())
      console.warn(
        "<SwTextNode::GetAttrListRestartValue()> - only ask for list restart value, if attribute is set at text node.",
      );
    return (this.GetAttr(RES_PARATR_LIST_RESTARTVALUE) as SfxInt16Item).GetValue();
  }

  /** Returns the explicit or format-defined list start value. @returns Effective start. */
  public GetActualListStartValue(): number {
    if (this.IsListRestart() && this.HasAttrListRestartValue())
      return this.GetAttrListRestartValue();
    return this.GetNumRule()?.GetNumFormat(this.GetAttrListLevel())?.GetStart() ?? 1;
  }

  /** Returns RES_PARATR_LIST_ID, falling back to the rule's default list id like Writer. @returns Effective list identity. */
  public GetListId(): string {
    const direct = (this.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue();
    return direct.length > 0 ? direct : (this.GetNumRule()?.GetDefaultListId() ?? "");
  }

  /** Sets or resets RES_PARATR_LIST_ID. @param listId - Direct list identity. @returns Nothing. */
  public SetListId(listId: string): void {
    if (listId.length === 0) this.ResetAttr(RES_PARATR_LIST_ID);
    else this.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, listId));
  }

  /** Sets or resets RES_PARATR_NUMRULE without changing list id or level. @param ruleName - Document rule name. @returns Nothing. */
  public SetNumRule(ruleName: string): void {
    if (ruleName.length === 0) this.ResetAttr(RES_PARATR_NUMRULE);
    else this.SetAttr(new SwNumRuleItem(ruleName));
  }

  /** Applies direct items through the native pre/post lifecycle. @param itemOrSet - Direct item or batch. @returns Whether raw items changed. */
  public override SetAttr(itemOrSet: SfxPoolItem | SfxItemSet): boolean {
    const old = this.mbInSetOrResetAttr;
    this.mbInSetOrResetAttr = true;
    let handler: HandleSetAttrAtTextNode;
    let changed: boolean;
    try {
      handler = new HandleSetAttrAtTextNode(this, itemOrSet);
      changed = super.SetAttr(itemOrSet);
      if (changed) this.GetNodes().UpdateOutlineNode(this);
    } finally {
      this.mbInSetOrResetAttr = old;
    }
    handler.finish();
    return changed;
  }
  /** Clears direct items through the native range/vector lifecycle. @param which - Range start or ordered WhichIds. @param end - Inclusive end. @returns Whether raw items changed. */
  public override ResetAttr(which: number | readonly number[], end = 0): boolean {
    const old = this.mbInSetOrResetAttr;
    this.mbInSetOrResetAttr = true;
    let handler: HandleResetAttrAtTextNode;
    let changed: boolean;
    try {
      handler = new HandleResetAttrAtTextNode(this, which, end);
      changed = super.ResetAttr(which, end);
      if (changed) this.GetNodes().UpdateOutlineNode(this);
    } finally {
      this.mbInSetOrResetAttr = old;
    }
    handler.finish();
    return changed;
  }
  /** Clears all direct items with native suppression/remembership ordering. @returns Raw removed count. */
  public override ResetAllAttr(): number {
    const old = this.mbInSetOrResetAttr;
    this.mbInSetOrResetAttr = true;
    let handler: HandleResetAttrAtTextNode;
    let removed: number;
    try {
      handler = new HandleResetAttrAtTextNode(this);
      removed = super.ResetAllAttr();
      if (removed > 0) this.GetNodes().UpdateOutlineNode(this);
    } finally {
      this.mbInSetOrResetAttr = old;
    }
    handler.finish();
    return removed;
  }
  /** Checks the text-owned temporary blocker before global notification policy. @returns Whether the paragraph can be notified. */
  public IsNotifiable(): boolean {
    return this.m_bNotifiable && this.IsNotificationEnabled();
  }
  /** Checks the owning document reading and destruction phases. @returns Whether notifications are globally enabled. */
  public IsNotificationEnabled(): boolean {
    const document = this.GetDoc();
    return !document.IsInReading() && !document.IsInDtor();
  }
  /** Reports direct list-level ownership. @returns Whether a direct item exists. */
  public HasAttrListLevel(): boolean {
    return this.GetpSwAttrSet()?.GetItemState(RES_PARATR_LIST_LEVEL, false) === SfxItemState.SET;
  }
  /** Applies one native operation to the existing shown record. @param operation - Record operation. @returns Nothing. */
  public DoNum(operation: (record: SwNodeNum) => void): void {
    if (this.mpNodeNum === undefined)
      throw new Error("SwTextNode DoNum requires an owned number record.");
    operation(this.mpNodeNum);
  }
  /** Rebinds numbering clients and emits the existing model invalidation adapter. @returns Nothing. */
  public NumRuleChgd(): void {
    NotifyTextNodeNumRuleChanged(this);
  }

  /** Reads outline membership independent of rule name. @returns Outline state for connected normal-document paragraphs. */
  public IsOutline(): boolean {
    return IsOutlineAtTextNode(this);
  }
  /** Detects a native outline membership transition. @returns Whether last state differs. */
  public IsOutlineStateChanged(): boolean {
    return this.IsOutline() !== this.m_bLastOutlineState;
  }
  /** Retains the current outline state after index reconciliation. @returns Nothing. */
  public UpdateOutlineState(): void {
    this.m_bLastOutlineState = this.IsOutline();
  }

  /** Returns the shown number record owned by this paragraph. @returns Owned record. */
  public GetNum(): SwNodeNum | undefined {
    return this.mpNodeNum;
  }
  /** Returns the shown record's validating number vector by value. @returns Mutable caller-owned counters or an independent empty vector. */
  public GetNumberVector(): tNumberVector {
    return this.GetNum()?.GetNumberVector() ?? [];
  }
  /** Reports membership through the owned record's parent. @returns Whether attached to a list. */
  public IsInList(): boolean {
    return this.mpNodeNum?.GetParent() !== undefined;
  }
  /** Returns the derived tree level. @returns Tree level, or minus one without a record. */
  public GetActualListLevel(): number {
    return this.mpNodeNum?.GetLevelInListTree() ?? -1;
  }
  /** Reports native counted numbering from the actual owned rule. @returns Whether numbered, including counted bullets. */
  public IsNumbered(): boolean {
    return this.GetNum()?.GetNumRule() !== undefined && this.IsCountedInList();
  }
  /** Queries marked-label state through the existing list and derived tree depth. @returns Whether this member's label is marked. */
  public HasMarkedLabel(): boolean {
    if (!this.IsInList()) return false;
    const list = this.GetDoc().GetDocumentListsManager().GetListByName(this.GetListId());
    return list?.IsListLevelMarked(this.GetActualListLevel()) ?? false;
  }
  /** Reports enumeration using the bound rule and actual level. @returns Number presence. */
  public HasNumber(): boolean {
    return this.GetActualNumFormat()?.IsEnumeration() ?? false;
  }
  /** Reports native itemization using the bound rule. @returns Bullet presence. */
  public HasBullet(): boolean {
    return this.GetActualNumFormat()?.IsItemize() ?? false;
  }
  /** Returns native default formatted numbering, excluding bullet formats and uncounted nodes. @returns Number string or empty. */
  public GetNumString(): string {
    return GetSwTextNodeNumString(this);
  }
  /** Reports visible native numbering with the pinned default follow-by compatibility behavior. @returns Native label visibility. */
  public HasVisibleNumberingOrBullet(): boolean {
    return HasSwTextNodeVisibleNumbering(this);
  }
  /** Reads the native numbering margin delta. @param textLeft - Whether to use text-left rather than outer-left. @returns Margin delta in twips. */
  public GetLeftMarginWithNum(textLeft = false): number {
    return resolveSwLeftMarginWithNum(this, textLeft);
  }
  /** Reads the native tab-calculation margin. @returns Left margin in twips. */
  public GetLeftMarginForTabCalculation(): number {
    return resolveSwLeftMarginForTabCalculation(this);
  }
  /** Reads the actual level's effective const format through the bound optional rule. @returns Format or undefined. */
  private GetActualNumFormat(): ReturnType<SwNumRule["Get"]> | undefined {
    const level = Math.max(0, Math.min(WRITER_MAX_LIST_LEVEL, this.GetActualListLevel()));
    return this.mpNodeNum?.GetNumRule()?.Get(level);
  }
  /** Returns the document's shown numbered-item registry. @returns Registry. */
  public getIDocumentListItems(): DocumentListItemsManager {
    return this.GetDoc().getIDocumentListItems();
  }
  /** Finds or creates the effective document list. @returns List when a rule and identity exist. */
  private FindList(): SwList | undefined {
    const id = this.GetListId();
    if (id.length === 0) return undefined;
    const lists = this.GetDoc().GetDocumentListsManager();
    const existing = lists.GetListByName(id);
    if (existing !== undefined) return existing;
    const rule = this.GetNumRule();
    return rule === undefined ? undefined : lists.CreateList(rule.GetName(), id);
  }
  /** Allocates and inserts the shown record for a connected document node. @returns Nothing. */
  public AddToList(): void {
    if (this.IsInList()) return;
    const list = this.FindList();
    if (
      list === undefined ||
      !this.GetNodes().IsDocNodes() ||
      this.GetNodes().indexOfOrUndefined(this) === undefined
    )
      return;
    if (this.mpNodeNum !== undefined)
      throw new Error("SwTextNode already owns an orphan number record.");
    this.mpNodeNum = new SwNodeNum(this, false);
    list.InsertListItem(this.mpNodeNum, this.GetAttrListLevel(), this.GetDoc());
  }
  /** Detaches and releases an attached shown record. @returns Nothing. */
  public RemoveFromList(): void {
    if (!this.IsInList()) return;
    SwList.RemoveListItem(this.mpNodeNum as SwNodeNum, this.GetDoc());
    this.mpNodeNum = undefined;
  }

  /** Returns the paragraph's text format collection identity. @returns Paragraph style identity. */
  public GetParagraphStyle(): WriterParagraphStyle {
    return this.GetTextFormatColl().id;
  }

  /** Sets the paragraph adjustment item. @param alignment - New paragraph alignment. @returns Nothing. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): void {
    this.SetAttr(new SvxAdjustItem(getSvxAdjust(alignment), RES_PARATR_ADJUST));
  }

  /** Sets the direct text-left margin in twips. @param margin - Non-negative margin. @returns Nothing. */
  public SetParagraphTextLeftMargin(margin: number): void {
    this.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(margin), RES_MARGIN_TEXTLEFT));
  }
  /** Sets the native first-line paragraph indent item. @param indent - Signed offset in twips. @returns Nothing. */
  public SetParagraphFirstLineIndent(indent: number): void {
    this.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(indent), RES_MARGIN_FIRSTLINE));
  }
  /** Sets the direct right paragraph margin in twips. @param margin - Non-negative right margin. @returns Nothing. */
  public SetParagraphRightMargin(margin: number): void {
    this.SetAttr(new SvxRightMarginItem(SvxIndentValue.twips(margin), RES_MARGIN_RIGHT));
  }

  /** Replaces the canonical numbering/list item subset captured by Writer undo. @param items - Direct list items. @returns Nothing. */
  public SetListItems(items: SfxItemSet): void {
    for (const which of [
      RES_PARATR_NUMRULE,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_RESTARTVALUE,
      RES_PARATR_LIST_ISCOUNTED,
    ])
      this.ResetAttr(which);
    this.SetAttr(items);
  }

  /** Captures direct numbering/list items for exact undo/redo. @returns Independent item set. */
  public CaptureListItems(): SfxItemSet {
    return CaptureSwTextNodeListItems(this);
  }

  /** Returns the document-owned list counter after validation. @returns One-based value for numbered list items. */
  public GetListItemNumber(): number | undefined {
    return this.mpNodeNum?.GetNumber();
  }

  /** Returns the model-owned visible list label after validating the number tree. @returns Bullet or formatted numeric label. */
  public GetListLabel(): string | undefined {
    return GetSwTextNodeListLabel(this);
  }

  /** Inserts text and adjusts direct-format hints using effective caret attributes. @param text - Inserted text. @param offset - UTF-16 insertion offset. @param mode - Native insertion flags. @param attributes - Optional explicit character items. @param hyperlink - Optional explicit hyperlink. @returns Inserted text. */
  public InsertText(
    text: string,
    offset: number,
    mode = SwInsertFlags.DEFAULT,
    attributes?: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): string {
    if (text.length === 0) return text;
    AssertTextNodeRange(this, offset, offset);
    const hints = InsertTextNodeHints(this, text, offset, mode, attributes, hyperlink);
    this.mText = `${this.mText.slice(0, offset)}${text}${this.mText.slice(offset)}`;
    this.pSwpHints = hints.CanBeDeleted() ? undefined : hints;
    this.UpdateContentIndices(offset, text.length);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return text;
  }

  /** Erases one bounded text range and adjusts all intersecting hints. @param start - Inclusive erase offset. @param count - Maximum erased length. @returns Nothing. */
  public EraseText(start: number, count = Number.MAX_SAFE_INTEGER): void {
    const end = Math.min(this.mText.length, start + count);
    AssertTextNodeRange(this, start, end);
    const removedLength = end - start;
    if (removedLength === 0) {
      if (this.pSwpHints?.CanBeDeleted()) this.pSwpHints = undefined;
      return;
    }
    this.ReplaceRange(start, end, { text: "", hints: new SwpHints(this.GetDoc().GetAttrPool()) });
  }

  /** Cuts text and transfers its owned hints without turning them into historical snapshots. @param start - Inclusive cut offset. @param end - Exclusive cut offset. @returns Consumable native fragment. */
  public CutTextFragment(start: number, end: number): SwTextFragment {
    AssertTextNodeRange(this, start, end);
    if (start === end) return this.CaptureTextFragment(start, end);
    const text = this.mText.slice(start, end);
    const remaining = this.pSwpHints ?? new SwpHints(this.GetDoc().GetAttrPool());
    const hints = remaining.Cut(start, end);
    this.mText = `${this.mText.slice(0, start)}${this.mText.slice(end)}`;
    this.pSwpHints = remaining.CanBeDeleted() ? undefined : remaining;
    this.UpdateContentIndices(start, end - start, SwContentIndexUpdateMode.Negative);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return { text, hints };
  }

  /** Native capacity reserves two signed32 positions beyond the final text character. @returns Remaining native text units. */
  public GetSpaceLeft(): number {
    return 0x7ffffffd - this.mText.length;
  }
  /** Native ReplaceText retains actual hints and applies differential Update modes; the supplied start index advances over inserted text. Dummy-character deletion remains unported. @param rStart - Actual registered content index or native position. @param nDelLen - Deleted UTF-16 count. @param rStr - Replacement string. @returns Nothing. */
  public ReplaceText(rStart: SwContentIndex | SwPosition, nDelLen: number, rStr: string): void {
    const index = "nContent" in rStart ? rStart.nContent : rStart;
    const start = index.GetIndex(),
      oldLength = this.mText.length;
    if (index.GetContentNode() !== this || start >= oldLength)
      throw new Error("Writer ReplaceText needs an index inside its own node.");
    AssertTextNodeRange(this, start, start + nDelLen);
    const inserted = rStr.slice(0, Math.max(0, this.GetSpaceLeft() + nDelLen));
    if (inserted.length === 0 && nDelLen === 0) return;
    const hints = this.pSwpHints;
    for (const hint of hints?.entries() ?? [])
      if (hint.HasDummyChar() && hint.GetStart() >= start && hint.GetStart() < start + nDelLen)
        throw new Error("Writer dummy-character replacement is not implemented.");
    const oldIgnore = this.IsIgnoreDontExpand();
    this.SetIgnoreDontExpand(true);
    try {
      this.mText = this.mText.slice(0, start) + inserted + this.mText.slice(start + nDelLen);
      if (nDelLen !== 0 && inserted.length !== 0) {
        const difference = inserted.length - nDelLen;
        if (difference !== 0) {
          const offset = start + Math.min(nDelLen, inserted.length);
          hints?.Update(oldLength, offset, Math.abs(difference), difference < 0);
          this.UpdateContentIndices(
            offset,
            Math.abs(difference),
            difference < 0 ? SwContentIndexUpdateMode.Negative : SwContentIndexUpdateMode.Replace,
          );
        }
        index.Assign(this, index.GetIndex() + inserted.length);
      } else {
        hints?.Update(oldLength, start, nDelLen, true);
        this.UpdateContentIndices(start, nDelLen, SwContentIndexUpdateMode.Negative);
        hints?.Update(oldLength - nDelLen, start, inserted.length);
        this.UpdateContentIndices(start, inserted.length, SwContentIndexUpdateMode.Replace);
      }
      if (hints?.CanBeDeleted()) this.pSwpHints = undefined;
    } finally {
      this.SetIgnoreDontExpand(oldIgnore);
    }
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces one text range with a native fragment. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @param replacement - Replacement content. @param transferHints - Whether to consume same-pool owned hints instead of copying snapshots. @returns Nothing. */
  public ReplaceRange(
    start: number,
    end: number,
    replacement: SwTextFragment,
    transferHints = false,
  ): void {
    AssertTextNodeRange(this, start, end);
    const replacementText = replacement.text;
    const removedLength = end - start;
    const existing = this.pSwpHints ?? new SwpHints(this.GetDoc().GetAttrPool());
    const hints =
      !transferHints &&
      replacement.hints.Count() === 0 &&
      removedLength > 0 &&
      replacementText.length === 0
        ? existing.EraseText(this.mText.length, start, removedLength)
        : existing.replaceRange(
            this.mText.length,
            start,
            end,
            replacement.hints,
            replacementText.length,
            transferHints,
          );
    this.mText = `${this.mText.slice(0, start)}${replacementText}${this.mText.slice(end)}`;
    this.pSwpHints = hints.CanBeDeleted() ? undefined : hints;
    UpdateTextNodeReplacementIndices(this, start, removedLength, replacementText.length);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces the complete node text and clears direct character hints. @param text - New canonical text. @returns Nothing. */
  public SetText(text: string): void {
    const previousText = this.mText;
    const previousLength = previousText.length;
    this.mText = text;
    this.pSwpHints = undefined;
    UpdateTextNodeReplacementIndices(this, 0, previousLength, text.length);
    if (previousText !== text)
      this.GetDoc().NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
  }

  /** Applies or removes one direct format over a non-empty range. @param start - Inclusive format start. @param end - Exclusive format end. @param format - Toggled direct property. @returns Nothing. */
  public ToggleTextRangeFormat(start: number, end: number, format: WriterCharacterFormat): void {
    AssertTextNodeRange(this, start, end);
    const hints = this.GetTextHints().toggleCharacterFormat(
      this.mText.length,
      start,
      end,
      format,
      this.GetSwAttrSet(),
    );
    this.pSwpHints = hints.CanBeDeleted() ? undefined : hints;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Collects represented automatic character state using native GetParaAttr boundaries. @param set - Empty caller-owned character set. @param start - Inclusive position. @param end - Exclusive position. @param onlyText - Ignore paragraph/style items. @returns Whether any state was collected. */
  public GetParaAttr(
    set: SfxItemSet,
    start: number,
    end: number,
    onlyText = false,
    fromCharacterFormat = true,
  ): boolean {
    return thints.GetTextNodeParaAttr(this, set, start, end, onlyText, fromCharacterFormat);
  }
  /** Reads direct attributes inherited by a collapsed caret. @param offset - UTF-16 caret offset. @returns Effective direct attributes. */
  public GetCharacterItemsAt(offset: number): SfxItemSet {
    return GetTextNodeCharacterItems(this, offset);
  }

  /** Queries one direct character item over a native text range. @param start - Inclusive range start. @param end - Exclusive range end. @param format - Queried item group. @returns Uniform or mixed state. */
  public GetTextRangeFormatState(
    start: number,
    end: number,
    format: WriterCharacterFormat,
  ): "mixed" | "off" | "on" {
    return GetTextNodeRangeFormatState(this, start, end, format);
  }

  /** Reads the hyperlink inherited by a caret. @param offset - UTF-16 caret offset. @returns Hyperlink metadata or undefined. */
  public getHyperlinkAt(offset: number): WriterHyperlink | undefined {
    return this.pSwpHints?.getHyperlink(this.mText, offset);
  }

  /** Queries an existing ranged family without allocating hints. @param index - Native offset. @param which - Attribute family. @param mode - Native containment mode. @returns Actual owned attribute. */
  public GetTextAttrAt(
    index: number,
    which: number,
    mode: GetTextAttrMode = GetTextAttrMode.Default,
  ): RangedTextAttribute | undefined {
    return GetTextAttrAt(this.pSwpHints, index, which, mode);
  }

  /** Applies, replaces, or removes one hyperlink over a non-empty range. @param start - Inclusive range start. @param end - Exclusive range end. @param hyperlink - Replacement hyperlink or undefined to remove. @returns Nothing. */
  public SetHyperlink(start: number, end: number, hyperlink: WriterHyperlink | undefined): void {
    AssertTextNodeRange(this, start, end);
    if (start === end) return;
    const hints = this.GetTextHints().setHyperlink(this.mText.length, start, end, hyperlink);
    this.pSwpHints = hints.CanBeDeleted() ? undefined : hints;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Splits this node at one content offset and returns an uninserted trailing sibling. @param offset - UTF-16 split offset. @returns Prepared trailing text node. */
  public SplitContent(offset: number): SwTextNode {
    AssertTextNodeRange(this, offset, offset);
    const prefix = this.CaptureTextFragment(0, offset);
    const suffix = this.CaptureTextFragment(offset, this.Len());
    const trailing = new SwTextNode(
      this.GetNodes(),
      this.StartOfSectionNode(),
      this.GetTextFormatColl(),
      suffix.text,
    );
    const directAttributes = this.GetpSwAttrSet();
    if (directAttributes !== undefined) trailing.SetAttr(directAttributes);
    PrepareSplitTextNodeFormat(this, trailing, offset === this.Len());
    trailing.pSwpHints = SplitTextNodeEndHints(this, offset, suffix.hints);
    this.mText = prefix.text;
    this.pSwpHints = prefix.hints.CanBeDeleted() ? undefined : prefix.hints;
    this.MoveTextAttr_To_AttrSet();
    trailing.MoveTextAttr_To_AttrSet();
    this.MoveContentIndicesFrom(trailing, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return trailing;
  }
  /** Appends another text node's content while preserving its direct attributes. @param source - Appended text node. @returns Nothing. */
  public AppendTextNode(source: SwTextNode): void {
    if (source === this) throw new Error("SwTextNode cannot append itself.");
    if (source.GetNodes() !== this.GetNodes())
      throw new Error("Joined SwTextNodes belong to different documents.");
    const offset = this.Len();
    const joinedHints = AppendTextNodeHints(this, source, offset);
    this.mText += source.mText;
    this.pSwpHints = joinedHints.CanBeDeleted() ? undefined : joinedHints;
    source.MoveAllContentIndicesTo(this, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Creates an independent text node in another document graph. @param nodes - Destination node array. @returns Detached clone. */
  public CloneTo(nodes: SwNodes): SwTextNode {
    const clone = new SwTextNode(
      nodes,
      nodes.GetEndOfContent().StartOfSectionNode(),
      nodes.GetDoc().CopyTextColl(this.GetTextFormatColl()),
    );
    const direct = this.GetpSwAttrSet();
    if (direct !== undefined) clone.SetAttr(direct);
    clone.SetText(this.mText);
    if (this.pSwpHints !== undefined)
      clone.SetTextHints(this.pSwpHints.CopyTo(nodes.GetDoc().GetAttrPool()));
    clone.SetListGeometryWins(this.listGeometryWins);
    clone.mbEmptyListStyleSetDueToSetOutlineLevelAttr =
      this.mbEmptyListStyleSetDueToSetOutlineLevelAttr;
    return clone;
  }

  /** Captures text and direct hints without projecting through browser runs. @param start - Inclusive offset. @param end - Exclusive offset. @returns Native fragment. */
  public CaptureTextFragment(start: number, end: number): SwTextFragment {
    AssertTextNodeRange(this, start, end);
    return { text: this.mText.slice(start, end), hints: this.GetTextHints().slice(start, end) };
  }

  /** Creates a native insertion fragment from text and effective character items. @param text - Inserted text. @param attributes - Effective direct character state. @param hyperlink - Optional inserted hyperlink. @returns Native text/hint fragment. */
  public CreateTextFragmentFromText(
    text: string,
    attributes: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwTextFragment {
    return CreateTextNodeFragment(this, text, attributes, hyperlink);
  }

  /** Creates a native fragment with one toggled character item. @param start - Inclusive source offset. @param end - Exclusive source offset. @param format - Toggled item group. @returns Native formatted fragment. */
  public CreateToggledTextFragment(
    start: number,
    end: number,
    format: WriterCharacterFormat,
  ): SwTextFragment {
    return CreateTextNodeToggledFragment(this, start, end, format);
  }

  /** Creates a native fragment with a requested font family. @param start - Inclusive source offset. @param end - Exclusive source offset. @param family - Requested serialized family. @returns Native formatted fragment. */
  public CreateFontTextFragment(
    start: number,
    end: number,
    family: string | SvxFontItem,
  ): SwTextFragment {
    return CreateTextNodeFontFamilyFragment(this, start, end, family);
  }

  /** Creates a native fragment with a requested font height. @param start - Inclusive source offset. @param end - Exclusive source offset. @param fontSizeTwips - Requested height in twips. @returns Native formatted fragment. */
  public CreateFontSizeTextFragment(
    start: number,
    end: number,
    fontSizeTwips: number,
  ): SwTextFragment {
    return CreateTextNodeFontSizeFragment(this, start, end, fontSizeTwips);
  }

  /** Creates a native fragment with a requested foreground or highlight color. */
  /** Handles Writer formatting state. @param start - Input value. @param end - Input value. @param property - Input value. @param value - Input value. @returns Callback result. */ public CreateColorTextFragment(
    start: number,
    end: number,
    property: "color" | "highlight",
    value: string,
  ): SwTextFragment {
    return CreateTextNodeColorFragment(this, start, end, property, value);
  }

  /** Creates a native fragment with replacement hyperlink metadata. @param start - Inclusive source offset. @param end - Exclusive source offset. @param hyperlink - Replacement hyperlink or undefined. @returns Native formatted fragment. */
  public CreateHyperlinkTextFragment(
    start: number,
    end: number,
    hyperlink: WriterHyperlink | undefined,
  ): SwTextFragment {
    return CreateTextNodeHyperlinkFragment(this, start, end, hyperlink);
  }

  /** Returns an independent native hint container, including the empty case. @returns Independent hints. */
  private GetTextHints(): SwpHints {
    return this.pSwpHints?.clone() ?? new SwpHints(this.GetDoc().GetAttrPool());
  }
}

export {
  isWriterParagraphAlignment,
  WRITER_CHARACTER_FORMATS,
  WRITER_PARAGRAPH_ALIGNMENTS,
} from "./ndtxt.attributes";
export type {
  SwTextFragment,
  WriterCharacterFormat,
  WriterParagraphAlignment,
} from "./ndtxt.attributes";
