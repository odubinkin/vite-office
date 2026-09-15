/** @fileoverview Implements the bounded list manager from pinned LibreOffice `sw/source/core/doc/DocumentListsManager.cxx`. */

import type { DocumentStateManager } from "./DocumentStateManager";
import { SwNumRule } from "./number";
import { SwList } from "./list";

/** Owns the numbering-rule table required by the supported Writer slice. */
export class DocumentListsManager {
  private nextListId = 1;
  private nextNumRuleId = 1;
  private readonly lists = new Map<string, SwList>();
  private readonly listStyleLists = new Map<string, SwList>();
  private readonly numRules = new Map<string, SwNumRule>();

  /** Creates the list manager. @param stateManager - Document mutation publisher. @returns Nothing. */
  public constructor(private readonly stateManager: DocumentStateManager) {}

  /** Adds a cloned document-owned numbering rule. @param rule - Source rule. @returns Stored rule. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    if (this.numRules.has(rule.GetName()))
      throw new Error(`Duplicate SwNumRule: ${rule.GetName()}`);
    const stored = rule.clone();
    this.numRules.set(stored.GetName(), stored);
    this.stateManager.NotifyModelChange({ kind: "numbering-changed", ruleName: stored.GetName() });
    return stored;
  }

  /** Finds a rule by its Writer name. @param name - Rule name. @returns Matching rule. */
  public FindNumRulePtr(name: string): SwNumRule | undefined {
    return this.numRules.get(name);
  }

  /** Returns the document rule table. @returns Rules in insertion order. */
  public GetNumRuleTable(): readonly SwNumRule[] {
    return [...this.numRules.values()];
  }

  /** Creates or returns a document-owned list for a numbering rule. @param ruleName - Default list-style name. @param listId - Optional persistent identity. @returns List. */
  public CreateList(ruleName: string, listId = ""): SwList {
    if (this.FindNumRulePtr(ruleName) === undefined)
      throw new Error(`Unknown SwNumRule: ${ruleName}`);
    const identity = listId.length === 0 ? this.CreateUniqueListId() : listId;
    const existing = this.lists.get(identity);
    if (existing !== undefined) return existing;
    const list = new SwList(identity, ruleName);
    this.lists.set(identity, list);
    return list;
  }

  /** Returns a list by identity. @param listId - Persistent identity. @returns Existing list. */
  public GetListByName(listId: string): SwList | undefined {
    return this.lists.get(listId);
  }

  /** Returns the stable default list associated with a style, creating it on demand. @param ruleName - Numbering rule. @returns List. */
  public GetListForListStyle(ruleName: string): SwList {
    const existing = this.listStyleLists.get(ruleName);
    if (existing !== undefined) return existing;
    const rule = this.FindNumRulePtr(ruleName);
    if (rule === undefined) throw new Error(`Unknown SwNumRule: ${ruleName}`);
    const list = this.CreateList(ruleName, rule.GetDefaultListId());
    this.listStyleLists.set(ruleName, list);
    return list;
  }

  /** Creates a deterministic unique list id, the browser equivalent of CreateUniqueListId. @returns Unique identity. */
  public CreateUniqueListId(): string {
    let id: string;
    do id = `list${this.nextListId++}`;
    while (this.lists.has(id));
    return id;
  }

  /** Registers a text node after an ODF/persistence item-set restore. @param node - List-capable canonical node. @returns Nothing. */
  public RegisterListItem(node: {
    readonly id: string;
    GetAttrListLevel(): number;
    GetListId(): string;
    GetNumRuleName(): string;
  }): void {
    const ruleName = node.GetNumRuleName();
    const listId = node.GetListId();
    if (ruleName.length === 0 || listId.length === 0) return;
    this.CreateList(ruleName, listId).InsertListItem(node.id, node.GetAttrListLevel());
  }

  /** Removes a text node from its current document list. @param nodeId - Canonical text-node id. @param listId - Current list identity. @returns Nothing. */
  public UnregisterListItem(nodeId: string, listId: string): void {
    if (listId.length > 0) this.GetListByName(listId)?.RemoveListItem(nodeId);
  }

  /** Invalidates every list after canonical node ordering changes. @returns Nothing. */
  public InvalidateAllLists(): void {
    for (const list of this.lists.values()) list.InvalidateListTree();
  }

  /** Creates a unique automatic rule for Writer's NumOrBulletOn path. @param kind - Marker family. @returns Stored rule. */
  public CreateAutomaticNumRule(kind: "bullet" | "numbered"): SwNumRule {
    let name: string;
    do name = `List ${this.nextNumRuleId++}`;
    while (this.numRules.has(name));
    const listId = this.CreateUniqueListId();
    return this.AddNumRule(new SwNumRule(name, kind, listId, true));
  }

  /** Finds or creates a compatible bounded rule. @param name - Rule name. @param kind - Rule family. @param level - Checked level. @returns Document-owned rule. */
  public EnsureNumRule(name: string, kind: "bullet" | "numbered", level = 0): SwNumRule {
    const existing = this.FindNumRulePtr(name);
    if (existing !== undefined) {
      if (existing.GetNumFormat(level).GetKind() !== kind)
        throw new Error(`SwNumRule ${name} has a different format at level ${level}.`);
      return existing;
    }
    return this.AddNumRule(new SwNumRule(name, kind));
  }
}
