/**
 * @fileoverview Defines the browser projection and command-boundary normalization for Writer list state at LibreOffice's `sw/source/core/doc/list.cxx` ownership boundary.
 */

import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwNumRuleItem } from "../para/paratr";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Enumerates list variants currently mapped to LibreOffice Writer's default bullet and numbering commands. */
export const WRITER_PARAGRAPH_LIST_KINDS = ["none", "bullet", "numbered"] as const;

/** Defines the deepest bounded list nesting level currently supported by the browser Writer document model. */
export const WRITER_MAX_LIST_LEVEL = 9;

/** WhichIds captured by Writer numbering undo actions. */
export const WRITER_LIST_WHICH_RANGES = [
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_ID, RES_PARATR_LIST_ISCOUNTED],
] as const;

/** Document-owned list with the supported single document-range counter tree. */
export class SwList {
  private invalid = true;
  private readonly nodes = new Map<SwTextNode, SwNodeNum>();

  /** Creates a list. @param listId - Unique list identity. @param defaultListStyleName - Owning numbering rule. @returns Nothing. */
  public constructor(
    private readonly listId: string,
    private defaultListStyleName: string,
  ) {}

  /** Returns the persistent list identity. @returns List identity. */
  public GetListId(): string {
    return this.listId;
  }
  /** Returns the associated list-style name. @returns Rule name. */
  public GetDefaultListStyleName(): string {
    return this.defaultListStyleName;
  }
  /** Renames the associated list-style reference. @param name - New rule name. @returns Nothing. */
  public SetDefaultListStyleName(name: string): void {
    this.defaultListStyleName = name;
  }
  /** Registers or updates one item. @param nodeId - Text-node id. @param level - Bounded level. @returns Nothing. */
  public InsertListItem(node: SwTextNode, level = node.GetAttrListLevel()): void {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`SwList level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    this.nodes.set(node, new SwNodeNum(node, level));
    this.invalid = true;
  }
  /** Removes one item. @param nodeId - Text-node id. @returns Nothing. */
  public RemoveListItem(node: SwTextNode): void {
    if (this.nodes.delete(node)) this.invalid = true;
  }
  /** Invalidates counters after document ordering or level changes. @returns Nothing. */
  public InvalidateListTree(): void {
    this.invalid = true;
  }
  /** Recalculates the bounded tree in canonical document order. @param orderedNodeIds - Body-node order. @returns Nothing. */
  public ValidateListTree(orderedNodes: readonly SwTextNode[]): void {
    if (!this.invalid) return;
    const counters = Array.from(
      { length: WRITER_MAX_LIST_LEVEL + 1 },
      /** Creates one zeroed level counter. @returns Initial counter. */ () => 0,
    );
    const levelNodes: Array<SwNodeNum | undefined> = Array.from({
      length: WRITER_MAX_LIST_LEVEL + 1,
    });
    for (const node of this.nodes.values()) node.ResetTree();
    for (const textNode of orderedNodes) {
      const node = this.nodes.get(textNode);
      if (node === undefined) continue;
      const level = node.level;
      node.SetParent(level === 0 ? undefined : levelNodes[level - 1]);
      levelNodes[level] = node;
      for (let child = level + 1; child <= WRITER_MAX_LIST_LEVEL; child += 1)
        levelNodes[child] = undefined;
      const start = textNode.IsListRestart()
        ? textNode.GetActualListStartValue()
        : (textNode.GetNumRule()?.GetNumFormat(level).GetStart() ?? 1);
      counters[level] =
        textNode.IsListRestart() || counters[level] === 0 ? start : (counters[level] as number) + 1;
      for (let child = level + 1; child <= WRITER_MAX_LIST_LEVEL; child += 1) counters[child] = 0;
      node.SetNumber(counters[level] as number);
    }
    this.invalid = false;
  }
  /** Gets a calculated node counter. @param nodeId - Text-node id. @returns Counter when registered. */
  public GetListItemNumber(node: SwTextNode): number | undefined {
    return this.nodes.get(node)?.GetNumber();
  }
  /** Returns the validated root-to-item number vector. @param node - Canonical text node. @returns Number vector when registered. */
  public GetListItemNumberVector(node: SwTextNode): readonly number[] | undefined {
    return this.nodes.get(node)?.GetNumberVector();
  }
  /** Returns the validated number-tree node. @param node - Canonical text node. @returns Tree record. */
  public GetListItem(node: SwTextNode): SwNodeNum | undefined {
    return this.nodes.get(node);
  }
  /** Reports whether this list has registered items. @returns True when non-empty. */
  public HasNodes(): boolean {
    return this.nodes.size > 0;
  }
}

/** Identifies the list presentation currently applied to one Writer paragraph. */
export type WriterParagraphListKind = (typeof WRITER_PARAGRAPH_LIST_KINDS)[number];

/** Describes a list-capable paragraph subset consumed by marker calculation without importing the complete Writer document model. */
/** Describes serializable list metadata that can grow toward Writer levels and named list styles. */
export interface WriterParagraphList {
  /** Default list presentation applied by the current Writer command slice. */
  readonly kind: WriterParagraphListKind;
  /** Zero-based nesting level bounded by WRITER_MAX_LIST_LEVEL. */
  readonly level: number;
  /** SwNumRule name projected from the paragraph item set, when one is retained or applied. */
  readonly styleId?: string;
  /** Internal automatic rule identity retained by undo without exposing it as a named style. */
  readonly ruleName?: string;
  /** Internal list identity retained by undo and continuation. */
  readonly listId?: string;
  /** Whether numbering restarts at this paragraph. */
  readonly restart?: boolean;
  /** Explicit restart value; otherwise the level format start is used. */
  readonly startValue?: number;
}

/**
 * Creates the ordinary non-list state assigned to new Writer paragraphs.
 *
 * @returns Immutable default list metadata with no marker and the root list level.
 */
export function createDefaultWriterParagraphList(): WriterParagraphList {
  return { kind: "none", level: 0 };
}

/**
 * Checks whether an unknown runtime value is one of the currently supported Writer paragraph list variants.
 *
 * @param value - Runtime candidate supplied by storage or a UI boundary.
 * @returns True only when value exactly matches a supported list kind.
 */
export function isWriterParagraphListKind(value: unknown): value is WriterParagraphListKind {
  return WRITER_PARAGRAPH_LIST_KINDS.some(
    /** Compares one supported list kind with the runtime candidate. @param kind - Supported list kind. @returns True when kind matches value. */
    function matchesListKind(kind): boolean {
      return kind === value;
    },
  );
}

/**
 * Normalizes an unknown stored list value without changing valid current list metadata.
 *
 * @param value - Runtime candidate supplied by a browser command boundary.
 * @returns Valid current list metadata, defaulting malformed data to a non-list root state.
 */
export function normalizeWriterParagraphList(value: unknown): WriterParagraphList {
  if (typeof value !== "object" || value === null) return createDefaultWriterParagraphList();
  const candidate = value as Partial<WriterParagraphList>;
  const kind = isWriterParagraphListKind(candidate.kind) ? candidate.kind : "none";
  const level =
    Number.isInteger(candidate.level) && (candidate.level as number) >= 0
      ? Math.min(candidate.level as number, WRITER_MAX_LIST_LEVEL)
      : 0;
  const styleId =
    typeof candidate.styleId === "string" && candidate.styleId.trim().length > 0
      ? candidate.styleId
      : undefined;
  const ruleName =
    typeof candidate.ruleName === "string" && candidate.ruleName.trim().length > 0
      ? candidate.ruleName
      : undefined;
  const listId =
    typeof candidate.listId === "string" && candidate.listId.trim().length > 0
      ? candidate.listId
      : undefined;
  const restart = candidate.restart === true;
  const startValue =
    Number.isInteger(candidate.startValue) && (candidate.startValue as number) >= 0
      ? candidate.startValue
      : undefined;
  return {
    kind,
    level,
    ...(styleId === undefined ? {} : { styleId }),
    ...(ruleName === undefined ? {} : { ruleName }),
    ...(listId === undefined ? {} : { listId }),
    ...(restart ? { restart: true } : {}),
    ...(startValue === undefined ? {} : { startValue }),
  };
}

/** Projects canonical numbering items for browser, clipboard, and filter boundaries. @param node - Canonical paragraph. @returns Immutable list projection. */
export function projectWriterParagraphList(node: SwTextNode): WriterParagraphList {
  const ruleName = node.GetNumRuleName();
  const level = node.GetAttrListLevel();
  if (ruleName.length === 0) {
    const listId = (node.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue();
    return listId.length === 0 ? { kind: "none", level } : { kind: "none", level, styleId: listId };
  }
  const rule = node.GetNumRule();
  if (rule === undefined) return createDefaultWriterParagraphList();
  const restart = node.IsListRestart();
  const startValue = node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : undefined;
  return {
    kind: rule.GetNumFormat(level).GetKind(),
    level,
    ...(rule.IsAutoRule() ? {} : { styleId: ruleName }),
    ...(restart ? { restart: true } : {}),
    ...(startValue === undefined ? {} : { startValue }),
  };
}

/** Converts a boundary list projection to canonical paragraph items and document-owned rule/list identities. @param node - Target paragraph. @param value - Boundary value. @returns Captured list item set. */
export function createWriterListItemSet(node: SwTextNode, value: unknown): SfxItemSet {
  const normalized = normalizeWriterParagraphList(value);
  const items = new SfxItemSet(node.GetDoc().GetAttrPool(), WRITER_LIST_WHICH_RANGES);
  if (normalized.kind === "none") {
    if (normalized.styleId !== undefined)
      items.Put(new SfxStringItem(RES_PARATR_LIST_ID, normalized.styleId));
    if (normalized.level > 0) items.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, normalized.level));
    return items;
  }
  let ruleName = normalized.styleId ?? normalized.ruleName ?? "";
  if (ruleName.length === 0) {
    const index = node.GetDoc().paragraphs.indexOf(node);
    const previous = index > 0 ? node.GetDoc().paragraphs[index - 1] : undefined;
    const previousRule = previous?.GetNumRule();
    ruleName =
      previousRule?.IsAutoRule() === true &&
      previous !== undefined &&
      previousRule.GetNumFormat(previous.GetAttrListLevel()).GetKind() === normalized.kind
        ? previousRule.GetName()
        : node.GetDoc().GetDocumentListsManager().CreateAutomaticNumRule(normalized.kind).GetName();
  }
  const namedRule = node.GetDoc().FindNumRulePtr(ruleName);
  if (
    normalized.styleId !== undefined &&
    namedRule !== undefined &&
    namedRule.GetNumFormat(normalized.level).GetKind() !== normalized.kind
  )
    ruleName = node
      .GetDoc()
      .GetDocumentListsManager()
      .CreateAutomaticNumRule(normalized.kind)
      .GetName();
  const rule = node.GetDoc().EnsureNumRule(ruleName, normalized.kind, normalized.level);
  const documentLists = node.GetDoc().GetDocumentListsManager();
  const index = node.GetDoc().paragraphs.indexOf(node);
  const previous = index > 0 ? node.GetDoc().paragraphs[index - 1] : undefined;
  const continuedListId =
    normalized.listId ??
    (previous?.GetNumRuleName() === rule.GetName() ? previous.GetListId() : undefined);
  const list =
    continuedListId === undefined
      ? documentLists.GetListForListStyle(rule.GetName())
      : documentLists.CreateList(rule.GetName(), continuedListId);
  items.Put(new SwNumRuleItem(rule.GetName()));
  items.Put(new SfxStringItem(RES_PARATR_LIST_ID, list.GetListId()));
  if (normalized.level > 0) items.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, normalized.level));
  if (normalized.restart === true) items.Put(new SfxBoolItem(RES_PARATR_LIST_ISRESTART, true));
  if (normalized.startValue !== undefined)
    items.Put(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, normalized.startValue));
  return items;
}

/** Converts and applies a list boundary value while keeping SwTextNode mutation item-set based. @param node - Target paragraph. @param value - Boundary projection. @returns Nothing. */
export function applyWriterParagraphList(node: SwTextNode, value: unknown): void {
  node.SetListItems(createWriterListItemSet(node, value));
}
