/** @fileoverview Implements the bounded list manager from pinned LibreOffice `sw/source/core/doc/DocumentListsManager.cxx`. */

import type { DocumentStateManager } from "./DocumentStateManager";
import { SwNumRule } from "./number";

/** Owns the numbering-rule table required by the supported Writer slice. */
export class DocumentListsManager {
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
