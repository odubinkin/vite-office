/** @fileoverview Verifies native protected state names, defaults and shared Writer storage using owned records only. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Native parent, counter, continuation, phantom and prefix-boundary state. */
type NativeState = [
  SwNumberTreeNode | undefined,
  number,
  boolean,
  boolean,
  SwNumberTreeNode | undefined,
];
/** Reads and writes inherited storage only inside a test subclass. */
class StateContract extends SwNodeNum {
  /** Reads the exact inherited field types. @returns Stored state. */
  public readNativeState(): NativeState {
    return [
      this.mpParent,
      this.mnNumber,
      this.mbContinueingPreviousSubTree,
      this.mbPhantom,
      this.mpLastValid,
    ];
  }
  /** Reassigns mutable inherited fields without adding shadow storage. @param state - Native state. @returns Nothing. */
  public assignNativeState(state: NativeState): void {
    [
      this.mpParent,
      this.mnNumber,
      this.mbContinueingPreviousSubTree,
      this.mbPhantom,
      this.mpLastValid,
    ] = state;
  }
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Protected state names absent from the public contract. */
type Fields =
  "mpParent" | "mnNumber" | "mbContinueingPreviousSubTree" | "mbPhantom" | "mpLastValid";
const contract: [
  Same<Extract<keyof SwNumberTreeNode, Fields>, never>,
  Same<Extract<keyof SwNodeNum, Fields>, never>,
  Same<ReturnType<StateContract["readNativeState"]>, NativeState>,
] = [true, true, true];
/** Observes native protected storage exclusively in tests. */
interface StateDiagnostic {
  readonly mpParent: SwNumberTreeNode | undefined;
  readonly mnNumber: number;
  readonly mbContinueingPreviousSubTree: boolean;
  readonly mbPhantom: boolean;
  readonly mpLastValid: SwNumberTreeNode | undefined;
}
/** Reads test-only field diagnostics. @param node - Actual owner. @returns Native storage view. */
function probe(node: SwNumberTreeNode): StateDiagnostic {
  return node as unknown as StateDiagnostic;
}
/** Requires a fixture value. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native-state fixture owner");
  return value;
}
/** Creates actual list records under reading suppression. @param levels - List depths. @param continuous - Policy. @returns Owners. */
function fixture(levels: number[], continuous = false) {
  const document = createWriterDocument();
  document.SetInReading(true);
  document.EnsureNumRule("NativeState", "numbered").SetContinusNum(continuous);
  const texts = levels.map(
    /** Allocates the canonical paragraphs before registration. @param _level - Depth. @param index - Ordinal. @returns Owner. */
    (_level, index) =>
      index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode(),
  );
  const records = texts.map(
    /** Registers actual text-owned records. @param text - Owner. @param index - Depth index. @returns Record. */
    (text, index) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: required(levels[index]),
        styleId: "NativeState",
        listId: "native-state",
      });
      return required(text.GetNum());
    },
  );
  return { document, texts, records, root: required(required(records[0]).GetParent()) };
}
/** Produces nonvalidating literal identity/counter/flag/prefix rows. @param nodes - Owned graph order. @returns State rows. */
function rows(nodes: SwNumberTreeNode[]) {
  return nodes.map(
    /** Reads native storage without invoking validation. @param node - Record. @returns Literal state. */
    (node) => {
      const state = probe(node);
      return [
        state.mpParent === undefined ? null : nodes.indexOf(state.mpParent),
        state.mnNumber,
        state.mbContinueingPreviousSubTree,
        state.mbPhantom,
        state.mpLastValid === undefined ? null : nodes.indexOf(state.mpLastValid),
      ];
    },
  );
}

it("retains protected mutable native field types, declaration order and constructor defaults without aliases", /** Checks subclass storage identity and native raw defaults. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true]);
  const node = new StateContract(undefined);
  const names = [
    "mpParent",
    "mnNumber",
    "mbContinueingPreviousSubTree",
    "mbPhantom",
    "mpLastValid",
  ];
  expect(
    Object.keys(node).filter(
      /** Selects the source state declarations. @param name - Runtime field. @returns Whether native state. */
      (name) => names.includes(name),
    ),
  ).toEqual(names);
  expect(
    ["parent", "value", "continuingPreviousSubTree", "phantom", "lastValid"].map(
      /** Rejects the preceding compatibility field names. @param name - Legacy field. @returns Presence. */
      (name) => name in node,
    ),
  ).toEqual([false, false, false, false, false]);
  const initial = node.readNativeState();
  expect(initial).toEqual([undefined, 0, false, false, undefined]);
  node.assignNativeState([undefined, 7, true, true, undefined]);
  expect([
    node.GetParent(),
    node.GetNumber(false),
    node.IsContinueingPreviousSubTree(),
    node.IsPhantom(),
  ]).toEqual([undefined, 7, true, true]);
  node.assignNativeState(initial);
  expect(node.readNativeState()).toEqual([undefined, 0, false, false, undefined]);
});

it("shares native parent counter phantom and prefix fields through actual hierarchical and continuous list lifecycles", /** Checks owned storage before/after validation and suppressed removal. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const { document, records, root } = fixture([0, 2, 0], continuous);
    const first = required(records[0]),
      nested = required(records[1]),
      tail = required(records[2]);
    const phantom = required(nested.GetParent());
    const nodes = [root, first, phantom, nested, tail];
    try {
      expect(rows(nodes)).toEqual([
        [null, 0, false, false, null],
        [0, 0, false, false, null],
        [1, 0, false, true, null],
        [2, 0, false, false, null],
        [0, 0, false, false, null],
      ]);
      expect(nested.GetNumberVector()).toEqual(continuous ? [1, 1, 2] : [1, 1, 1]);
      const validated = [
        [null, 0, false, false, 1],
        [0, 1, false, false, 2],
        [1, 1, false, true, 3],
        [2, continuous ? 2 : 1, false, false, null],
        [0, 0, false, false, null],
      ];
      expect(rows(nodes)).toEqual(validated);
      document.SetInReading(false);
      expect(rows(nodes)).toEqual(validated);
      root.InvalidateTree();
      expect(rows(nodes)).toEqual([
        [null, 0, false, false, null],
        [0, 1, false, false, null],
        [1, 1, false, true, null],
        [2, continuous ? 2 : 1, false, false, null],
        [0, 0, false, false, null],
      ]);
      expect(nested.GetNumberVector()).toEqual(continuous ? [1, 1, 2] : [1, 1, 1]);
      expect(rows(nodes)).toEqual(validated);
      document.SetInReading(true);
      nested.RemoveMe(document);
      expect([probe(nested).mpParent, probe(nested).mnNumber, probe(root).mpLastValid]).toEqual([
        undefined,
        continuous ? 2 : 1,
        undefined,
      ]);
      expect([root.GetChildCount(), first.GetChildCount()]).toEqual([2, 0]);
    } finally {
      document.Dispose();
    }
  }
});

it("retains the native continuation flag through invalidation and clears it for an explicit restart", /** Checks the true flag in actual uncounted-parent continuation state. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture([0, 1, 0, 1]);
  const parent = required(records[2]),
    child = required(records[3]);
  try {
    required(texts[2]).SetCountedInList(false);
    expect(child.GetNumberVector()).toEqual([1, 2]);
    expect([
      probe(child).mpParent === parent,
      probe(child).mnNumber,
      probe(child).mbContinueingPreviousSubTree,
      child.IsContinueingPreviousSubTree(),
      probe(parent).mpLastValid === child,
    ]).toEqual([true, 2, true, true, true]);
    root.InvalidateTree();
    expect([
      probe(child).mnNumber,
      probe(child).mbContinueingPreviousSubTree,
      probe(parent).mpLastValid,
    ]).toEqual([2, true, undefined]);
    expect(child.GetNumberVector()).toEqual([1, 2]);
    required(texts[3]).SetListRestart(true);
    required(texts[3]).SetAttrListRestartValue(7);
    expect(child.GetNumberVector()).toEqual([1, 7]);
    expect([
      probe(child).mnNumber,
      probe(child).mbContinueingPreviousSubTree,
      child.IsContinueingPreviousSubTree(),
      probe(parent).mpLastValid === child,
    ]).toEqual([7, false, false, true]);
  } finally {
    document.Dispose();
  }
});
