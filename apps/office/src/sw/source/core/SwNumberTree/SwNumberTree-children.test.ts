/** @fileoverview Verifies native child-container visibility, direct counts and guarded Writer descendants without upstream access. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes protected storage solely within a test subclass. */
class ChildContract extends SwNodeNum {
  /** Binds the native count method for exact type inspection. */
  public readonly count = this.GetChildCount.bind(this);
  /** Observes the subclass-owned container without a production accessor. @returns Children. */
  public get owned(): readonly SwNumberTreeNode[] {
    return [...this.mChildren];
  }
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  "GetChildren" extends keyof SwNumberTreeNode ? false : true,
  "GetChildren" extends keyof SwNodeNum ? false : true,
  "mChildren" extends keyof SwNumberTreeNode ? false : true,
  Same<Parameters<ChildContract["count"]>, []>,
  Same<ReturnType<ChildContract["count"]>, number>,
] = [true, true, true, true, true];

/** Models a non-Writer native base node for the dynamic child-type guard. */
class ForeignNode extends SwNumberTreeNode {
  /** Enables phantom counting. @returns Policy. */
  protected IsCountPhantoms(): boolean {
    return true;
  }
  /** Uses hierarchical numbering. @returns Policy. */
  public IsContinuous(): boolean {
    return false;
  }
  /** Creates a native base child. @returns Child. */
  protected Create(): SwNumberTreeNode {
    return new ForeignNode();
  }
  /** Registers no Writer owner. @returns Nothing. */
  protected PreAdd(): void {}
  /** Unregisters no Writer owner. @returns Nothing. */
  protected PostRemove(): void {}
  /** Supplies the single foreign child's ordering. @returns Ordering. */
  public LessThan(): boolean {
    return false;
  }
  /** Does not restart. @returns Policy. */
  public IsRestart(): boolean {
    return false;
  }
  /** Supplies the native default start. @returns Start. */
  public GetStartValue(): number {
    return 1;
  }
  /** Has no counted descendants. @returns Policy. */
  protected HasCountedChildren(): boolean {
    return false;
  }
  /** Supplies this non-Writer subtype's mandatory numbered policy. @returns Counted flag. */
  protected IsCountedForNumbering(): boolean {
    return true;
  }
  /** Suppresses fixture notifications. @returns Policy. */
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
/** Requires a fixture owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing child fixture owner");
  return value;
}

it("keeps child storage protected and exposes only the native direct count contract", /** Checks the compile-time contract and an empty subclass container. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true, true]);
  const root = new ChildContract(undefined);
  expect(root.owned).toEqual([]);
  expect(root.GetChildCount()).toBe(0);
});

it("counts direct owned children including skipped phantoms through removal without validating counters", /** Checks actual document owners and phantom relocation. @returns Nothing. */ () => {
  const document = createWriterDocument();
  document.SetInReading(true);
  const first = required(document.paragraphs[0]);
  const nested = document.nodes.MakeTextNode();
  const tail = document.nodes.MakeTextNode();
  for (const [text, level] of [
    [first, 0],
    [nested, 9],
    [tail, 0],
  ] as const)
    applyWriterParagraphList(text, {
      kind: "numbered",
      level,
      styleId: "Child counts",
      listId: "counts",
    });
  const firstRecord = required(first.GetNum());
  const nestedRecord = required(nested.GetNum());
  const tailRecord = required(tail.GetNum());
  const root = required(firstRecord.GetParent());
  const list = required(document.GetDocumentListsManager().GetListByName("counts"));
  expect(root.GetChildCount()).toBe(2);
  expect(firstRecord.GetChildCount()).toBe(1);
  expect(nestedRecord.GetChildCount()).toBe(0);
  expect(tailRecord.GetChildCount()).toBe(0);
  let ancestor = nestedRecord.GetParent();
  let phantoms = 0;
  while (ancestor !== firstRecord) {
    const phantom = required(ancestor);
    expect(phantom.IsPhantom()).toBe(true);
    expect(phantom.GetChildCount()).toBe(1);
    phantoms++;
    ancestor = phantom.GetParent();
  }
  expect(phantoms).toBe(8);
  expect(list.HasNodes()).toBe(true);
  expect([
    firstRecord.GetNumber(false),
    nestedRecord.GetNumber(false),
    tailRecord.GetNumber(false),
  ]).toEqual([0, 0, 0]);
  first.RemoveFromList();
  expect(firstRecord.GetChildCount()).toBe(0);
  expect(root.GetChildCount()).toBe(2);
  nested.RemoveFromList();
  expect(nestedRecord.GetChildCount()).toBe(0);
  expect(root.GetChildCount()).toBe(1);
  tail.RemoveFromList();
  expect(root.GetChildCount()).toBe(0);
  expect(list.HasNodes()).toBe(false);
  document.Dispose();
});

it("ignores non-Writer children under the native counted-descendant type guard", /** Checks the native dynamic-cast failure boundary. @returns Nothing. */ () => {
  const root = new SwNodeNum(undefined);
  const foreign = new ForeignNode();
  root.AddChild(foreign, 0);
  expect(observeCountedChildren(root)).toBe(false);
  root.RemoveChild(foreign);
  expect(foreign.GetParent()).toBeUndefined();
});

/** Observes the protected HasCountedChildren policy solely in tests. @param node - Owned record. @returns Native policy flag. */
function observeCountedChildren(node: SwNumberTreeNode): boolean {
  return (
    node as unknown as {
      /** Reads the native protected policy. @returns Flag. */ HasCountedChildren(): boolean;
    }
  ).HasCountedChildren();
}
