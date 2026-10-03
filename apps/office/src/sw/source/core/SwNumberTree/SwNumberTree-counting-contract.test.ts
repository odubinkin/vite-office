/** @fileoverview Verifies protected mandatory counting policies, virtual dispatch and raw Writer defaults without upstream access. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Binds protected policies solely for test type inspection. */
class CountingContract extends SwNodeNum {
  /** Exposes the descendant policy in this test subclass. */
  public readonly descendants = this.HasCountedChildren.bind(this);
  /** Exposes the numbering policy in this test subclass. */
  public readonly numbering = this.IsCountedForNumbering.bind(this);
  /** Exposes the phantom policy in this test subclass. */
  public readonly phantoms = this.IsCountPhantoms.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Native policies hidden from public callers. */
type Policies = "HasCountedChildren" | "IsCountedForNumbering" | "IsCountPhantoms";
const contract: [
  Same<Extract<keyof SwNumberTreeNode, Policies>, never>,
  Same<Extract<keyof SwNodeNum, Policies>, never>,
  Same<Parameters<CountingContract["descendants"]>, []>,
  Same<ReturnType<CountingContract["descendants"]>, boolean>,
  Same<Parameters<CountingContract["numbering"]>, []>,
  Same<ReturnType<CountingContract["numbering"]>, boolean>,
  Same<Parameters<CountingContract["phantoms"]>, []>,
  Same<ReturnType<CountingContract["phantoms"]>, boolean>,
] = [true, true, true, true, true, true, true, true];

/** Implements the other base policies while leaving the numbered policy mandatory. */
abstract class OtherPolicies extends SwNumberTreeNode {
  /** Enables phantom counting. @returns Policy. */
  protected IsCountPhantoms(): boolean {
    return true;
  }
  /** Uses hierarchical counting. @returns Policy. */
  public IsContinuous(): boolean {
    return false;
  }
  /** Creates a complete policy record. @returns Record. */
  protected Create(): SwNumberTreeNode {
    return new CompletePolicy();
  }
  /** Registers no Writer owner. @returns Nothing. */
  protected PreAdd(): void {}
  /** Unregisters no Writer owner. @returns Nothing. */
  protected PostRemove(): void {}
  /** Supplies single-record ordering. @returns Ordering. */
  public LessThan(): boolean {
    return false;
  }
  /** Does not restart. @returns Policy. */
  public IsRestart(): boolean {
    return false;
  }
  /** Supplies native start one. @returns Start. */
  public GetStartValue(): number {
    return 1;
  }
  /** Has no counted descendants. @returns Policy. */
  protected HasCountedChildren(): boolean {
    return false;
  }
  /** Suppresses notifications. @returns Policy. */
  protected IsNotifiable(): boolean {
    return false;
  }
  /** Suppresses insertion notifications. @returns Policy. */
  protected IsNotificationEnabled(): boolean {
    return false;
  }
  /** Notifies no Writer owner. @returns Nothing. */
  protected NotifyNode(): void {}
}
/** Models a deliberately incomplete subtype for the mandatory abstract-policy check. */
// @ts-expect-error Native base requires every concrete subtype to implement IsCountedForNumbering.
class MissingNumberingPolicy extends OtherPolicies {}
/** Fulfills the base virtual contract for an unrelated number-tree subtype. */
class CompletePolicy extends OtherPolicies {
  /** Counts this subtype for its own numbering. @returns Policy. */
  protected IsCountedForNumbering(): boolean {
    return true;
  }
  /** Exposes virtual dispatch only inside the test subtype. @returns Policy. */
  public readNumberingPolicy(): boolean {
    return this.IsCountedForNumbering();
  }
}
/** Requires a fixture owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing counting fixture owner");
  return value;
}
/** Observes protected policies without reading or validating number caches. @param node - Record. @returns Numbering, descendants and phantom flags. */
function observe(node: SwNumberTreeNode): [boolean, boolean, boolean] {
  const policy = node as unknown as {
    /** Reads numbering. @returns Flag. */
    IsCountedForNumbering(): boolean;
    /** Reads descendants. @returns Flag. */
    HasCountedChildren(): boolean;
    /** Reads phantom policy. @returns Flag. */
    IsCountPhantoms(): boolean;
  };
  return [policy.IsCountedForNumbering(), policy.HasCountedChildren(), policy.IsCountPhantoms()];
}

it("requires protected zero-argument boolean counting policies without public exports", /** Checks exact types and native root defaults. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true, true, true, true, true]);
  const root = new CountingContract(undefined);
  expect([root.numbering(), root.descendants(), root.phantoms()]).toEqual([true, false, true]);
  expect(root.GetNumber(false)).toBe(0);
});

it("requires a numbered-policy override for concrete base subtypes and retains guarded Writer dispatch", /** Checks complete unrelated subtypes with their own counted policy. @returns Nothing. */ () => {
  const operationDocument = createWriterDocument();
  expect(MissingNumberingPolicy.name).toBe("MissingNumberingPolicy");
  const foreign = new CompletePolicy();
  expect(foreign.readNumberingPolicy()).toBe(true);
  const writer = new SwNodeNum(undefined);
  writer.AddChild(foreign, 0, operationDocument);
  expect(observe(writer)).toEqual([true, false, true]);
  expect(writer.GetChildCount()).toBe(1);
  writer.RemoveChild(foreign, operationDocument);
  expect(foreign.GetParent()).toBeUndefined();

  operationDocument.Dispose();
});

it("preserves connected counted-descendant phantom and orphan policies without validating raw caches", /** Checks actual text owners through flags, count changes and removal. @returns Nothing. */ () => {
  const document = createWriterDocument();
  document.SetInReading(true);
  const first = required(document.paragraphs[0]);
  const nested = document.nodes.MakeTextNode();
  const rule = document.EnsureNumRule("Counting policies", "numbered");
  rule.SetCountPhantoms(true);
  rule.SetContinusNum(false);
  for (const [text, level] of [
    [first, 0],
    [nested, 2],
  ] as const)
    applyWriterParagraphList(text, {
      kind: "numbered",
      level,
      styleId: rule.GetName(),
      listId: "policies",
    });
  const firstRecord = required(first.GetNum());
  const nestedRecord = required(nested.GetNum());
  const phantom = required(nestedRecord.GetParent());
  const root = required(firstRecord.GetParent());
  expect(phantom.IsPhantom()).toBe(true);
  expect(observe(root)).toEqual([true, true, true]);
  expect(observe(firstRecord)).toEqual([true, true, true]);
  expect(observe(phantom)).toEqual([true, true, true]);
  expect(observe(nestedRecord)).toEqual([true, false, true]);
  rule.SetCountPhantoms(false);
  expect(observe(phantom)).toEqual([false, true, false]);
  first.SetCountedInList(false);
  nested.SetCountedInList(false);
  expect(observe(root)).toEqual([true, false, false]);
  nested.SetCountedInList(true);
  expect(observe(root)).toEqual([true, true, false]);
  expect(observe(firstRecord)).toEqual([false, true, false]);
  expect(observe(phantom)).toEqual([false, true, false]);
  rule.SetContinusNum(true);
  expect(observe(phantom)).toEqual([false, true, false]);
  expect([
    firstRecord.GetNumber(false),
    nestedRecord.GetNumber(false),
    phantom.GetNumber(false),
  ]).toEqual([0, 0, 0]);
  nested.RemoveFromList();
  expect(observe(nestedRecord)).toEqual([false, false, true]);
  expect(observe(root)).toEqual([true, false, false]);
  document.Dispose();
});
