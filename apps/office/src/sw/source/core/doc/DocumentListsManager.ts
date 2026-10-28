/** @fileoverview Implements the bounded list manager from pinned LibreOffice `sw/source/core/doc/DocumentListsManager.cxx`. */
import {
  createWriterNumFormat,
  getWriterNumFormatKind,
  getWriterNumFormatBullet,
  SwNumRule,
  SwNumFormat,
} from "./number";

import type { DocumentStateManager } from "./DocumentStateManager";
import { SwList } from "./list";

/** Owns the numbering-rule table required by the supported Writer slice. */
export class DocumentListsManager {
  private nextListId = 1;
  private nextNumRuleId = 1;
  private readonly lists = new Map<string, SwList>();
  private readonly listStyleLists = new Map<string, SwList>();
  private readonly numRules: SwNumRule[] = [];
  private readonly numRuleMap = new Map<string, SwNumRule>();

  /** Creates the list manager. @param stateManager - Document mutation publisher. @returns Nothing. */
  public constructor(private readonly stateManager: DocumentStateManager) {}

  /** Retains the actual transferred rule in native table order and updates the name index; the browser return value borrows that owner. @param rule - Transferred native owner. @returns Stored identity. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    if (this.numRules.length >= 65534) throw new Error("SwDoc::AddNumRule: table full.");
    this.numRules.push(rule);
    this.numRuleMap.set(rule.GetName(), rule);
    this.CreateListForListStyle(rule.GetName());
    this.stateManager.NotifyModelChange({ kind: "numbering-changed", ruleName: rule.GetName() });
    return rule;
  }

  /** Finds a rule by its Writer name. @param name - Rule name. @returns Matching rule. */
  public FindNumRulePtr(name: string): SwNumRule | undefined {
    return this.numRuleMap.get(name);
  }

  /** Returns the document rule table. @returns Rules in insertion order. */
  public GetNumRuleTable(): readonly SwNumRule[] {
    return this.numRules;
  }

  /** Creates or returns a document-owned list for a numbering rule. @param ruleName - Default list-style name. @param listId - Optional persistent identity. @returns List. */
  public CreateList(ruleName: string, listId = ""): SwList {
    const rule = this.FindNumRulePtr(ruleName);
    if (rule === undefined) throw new Error(`Unknown SwNumRule: ${ruleName}`);
    const identity = listId.length === 0 ? this.CreateUniqueListId() : listId;
    const existing = this.lists.get(identity);
    if (existing !== undefined) return existing;
    const list = new SwList(identity, rule);
    this.lists.set(identity, list);
    return list;
  }

  /** Returns a list by identity. @param listId - Persistent identity. @returns Existing list. */
  public GetListByName(listId: string): SwList | undefined {
    return this.lists.get(listId);
  }

  /** Source createListForListStyle owns default-list creation, resolves an already used ID to a fresh identity, and leaves existing style mappings untouched. @param ruleName - Original rule name. @returns Nothing. */
  public CreateListForListStyle(ruleName: string): void {
    if (ruleName.length === 0 || this.listStyleLists.has(ruleName)) return;
    const rule = this.FindNumRulePtr(ruleName);
    if (rule === undefined) return;
    const id =
      this.GetListByName(rule.GetDefaultListId()) === undefined ? rule.GetDefaultListId() : "";
    const list = this.CreateList(ruleName, id);
    this.listStyleLists.set(ruleName, list);
    rule.SetDefaultListId(list.GetListId());
  }

  /** Existing browser access materializes the native default list when required, then borrows its stable owner. @param ruleName - Numbering rule. @returns Default list. */
  public GetListForListStyle(ruleName: string): SwList {
    this.CreateListForListStyle(ruleName);
    const list = this.listStyleLists.get(ruleName);
    if (list === undefined) throw new Error(`Unknown SwNumRule: ${ruleName}`);
    return list;
  }

  /** Creates a deterministic unique list id, the browser equivalent of CreateUniqueListId. @returns Unique identity. */
  public CreateUniqueListId(): string {
    let id: string;
    do id = `list${this.nextListId++}`;
    while (this.lists.has(id));
    return id;
  }

  /** Invalidates every list after canonical node ordering changes. @returns Nothing. */
  public InvalidateAllLists(): void {
    for (const list of this.lists.values()) list.InvalidateListTree();
  }

  /** Creates a unique automatic rule for Writer's NumOrBulletOn path. @param kind - Marker family. @returns Stored rule. */
  public CreateAutomaticNumRule(kind: "bullet" | "numbered"): SwNumRule {
    let name: string;
    do name = `List ${this.nextNumRuleId++}`;
    while (this.numRuleMap.has(name));
    const listId = this.CreateUniqueListId();
    return this.AddNumRule(createWriterNumRule(name, kind, listId, true));
  }

  /** Finds or creates a compatible bounded rule. @param name - Rule name. @param kind - Rule family. @param level - Checked level. @returns Document-owned rule. */
  public EnsureNumRule(name: string, kind: "bullet" | "numbered", level = 0): SwNumRule {
    const existing = this.FindNumRulePtr(name);
    if (existing !== undefined) {
      if (getWriterNumFormatKind(existing.Get(level)) !== kind)
        throw new Error(`SwNumRule ${name} has a different format at level ${level}.`);
      return existing;
    }
    return this.AddNumRule(createWriterNumRule(name, kind));
  }
}

/** Assembles the browser's existing list command/import records using native rule ownership. @param name - Rule name. @param format - Command family or complete explicit levels. @param defaultListId - Document identity. @param automatic - Reuse flag. @returns Rule. */
export function createWriterNumRule(
  name: string,
  format?: "bullet" | "numbered" | readonly SwNumFormat[],
  defaultListId = name,
  automatic = false,
): SwNumRule {
  if (defaultListId.trim().length === 0) throw new Error("SwNumRule list id must not be blank.");
  const rule = new SwNumRule(name, "label-alignment");
  rule.SetDefaultListId(defaultListId);
  rule.SetAutoRule(automatic);
  if (format === undefined) return rule;
  if (Array.isArray(format)) {
    if (format.length !== 10) throw new Error("SwNumRule must define every supported list level.");
    for (let level = 0; level < 10; level++) rule.Set(level, format[level] as SwNumFormat);
  } else {
    if (format !== "bullet" && format !== "numbered")
      throw new Error("SwNumRule kind must be bullet or numbered.");
    for (let level = 0; level < 10; level++)
      rule.Set(
        level,
        createWriterNumFormat(
          format,
          format === "bullet" ? getWriterNumFormatBullet(rule.Get(level)) : "",
          {
            ...rule.Get(level).GetPositionProperties(),
            bulletFont: format === "bullet" ? "OpenSymbol" : "",
            suffix: format === "numbered" ? "." : "",
            ...(format === "numbered" ? { listFormat: `%${level + 1}%.` } : {}),
          },
        ),
      );
  }
  return rule;
}
