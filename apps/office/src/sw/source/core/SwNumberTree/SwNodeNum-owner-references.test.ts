/** @fileoverview Verifies direct Writer numbering owner references and complete policy branches without upstream access. */
import { expect, it, vi } from "vitest";
import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Observes the existing protected signature only during typechecking. */
class PolicyContract extends SwNodeNum {
  /** Retains the local protected phantom policy. */
  public readonly phantoms = this.IsCountPhantoms.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<PolicyContract["phantoms"]>, []>,
  Same<ReturnType<PolicyContract["phantoms"]>, boolean>,
  Same<Parameters<SwNodeNum["LessThan"]>, [SwNumberTreeNode]>,
  Same<ReturnType<SwNodeNum["LessThan"]>, boolean>,
  Same<Extract<keyof SwNodeNum, "IsCountPhantoms" | "textNode" | "mpNumRule">, never>,
] = [true, true, true, true, true];
/** Observes protected state solely in owned tests. */
interface Diagnostic {
  readonly mChildren: Iterable<SwNumberTreeNode>;
  readonly mpLastValid?: SwNumberTreeNode;
  /** Finds the actual root. @returns Root. */
  GetRoot(): SwNumberTreeNode | undefined;
  /** Reads phantom policy. @returns Flag. */
  IsCountPhantoms(): boolean;
}
/** Reads test-only diagnostics. @param node - Owner. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires an actual owner. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing direct owner reference fixture");
  return value;
}
/** Creates actual text records and a source-created phantom under reading suppression. @returns Owners. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("DirectReferences", "numbered"),
    texts = [required(document.paragraphs[0]), document.nodes.MakeTextNode()];
  const records = texts.map(
    /** Binds actual paragraph list attributes. @param text - Owner. @returns Record. */ (text) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: 1,
        styleId: "DirectReferences",
        listId: "direct-references",
      });
      return required(text.GetNum());
    },
  );
  const first = required(records[0]),
    second = required(records[1]),
    phantom = required(first.GetParent()) as SwNodeNum,
    root = required(probe(first).GetRoot()) as SwNodeNum;
  return { document, rule, texts, records, first, second, phantom, root };
}
/** Captures identity, membership and unvalidated caches without owner policy lookups. @param owners - Fixture. @returns State. */
function stable(owners: ReturnType<typeof fixture>) {
  const clients: SwTextNode[] = [],
    registered: SwNodeNum[] = [];
  owners.rule.GetTextNodeList(clients);
  owners.document.getIDocumentListItems().getNumItems(registered);
  return {
    clients,
    registered,
    owners: owners.texts.map(
      /** Reads text-owned record identity. @param text - Owner. @returns Record. */ (text) =>
        text.GetNum(),
    ),
    topology: [owners.root, owners.phantom, ...owners.records].map(
      /** Observes raw state without validation. @param node - Record. @returns State. */ (
        node,
      ) => ({
        parent: node.GetParent(),
        cache: node.GetNumber(false),
        valid: probe(node).mpLastValid,
        storage: probe(node).mChildren,
        children: [...probe(node).mChildren],
      }),
    ),
  };
}

it("retains exact comparator and protected phantom contracts with the unbound true default", /** Checks release defaults without claiming native private/final/const equivalence. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true, true]);
  const root = new SwNodeNum(undefined),
    rule = vi.spyOn(root, "GetNumRule"),
    parent = vi.spyOn(root, "GetParent");
  try {
    expect(probe(root).IsCountPhantoms()).toBe(true);
    expect(root.GetNumber(false)).toBe(0);
    expect(root.GetChildCount()).toBe(0);
    expect(rule).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
  }
});

it("reads bound private rules with continuous short circuit for actual roots phantoms and text", /** Checks four actual flag profiles with stable ownership and caches. @returns Nothing. */ () => {
  for (const continuous of [false, true])
    for (const phantoms of [false, true]) {
      const owners = fixture(),
        { document, rule, root, phantom, first } = owners;
      try {
        rule.SetContinusNum(continuous);
        rule.SetCountPhantoms(phantoms);
        const before = stable(owners),
          trace: string[] = [],
          readContinuous = rule.IsContinusNum.bind(rule),
          readPhantoms = rule.IsCountPhantoms.bind(rule);
        vi.spyOn(rule, "IsContinusNum").mockImplementation(
          /** Observes real rule policy. @returns Flag. */ () => {
            trace.push("continuous");
            return readContinuous();
          },
        );
        vi.spyOn(rule, "IsCountPhantoms").mockImplementation(
          /** Observes short-circuited real rule policy. @returns Flag. */ () => {
            trace.push("phantoms");
            return readPhantoms();
          },
        );
        for (const record of [root, phantom, first]) {
          trace.length = 0;
          const lookup = vi.spyOn(record, "GetNumRule"),
            parent = vi.spyOn(record, "GetParent");
          expect(probe(record).IsCountPhantoms()).toBe(!continuous && phantoms);
          expect(trace).toEqual(continuous ? ["continuous"] : ["continuous", "phantoms"]);
          expect(lookup).not.toHaveBeenCalled();
          expect(parent).not.toHaveBeenCalled();
          lookup.mockRestore();
          parent.mockRestore();
        }
        expect(stable(owners)).toEqual(before);
      } finally {
        vi.restoreAllMocks();
        document.Dispose();
      }
    }
});

it("retains the true unbound policy after real detachment without querying text or old rule", /** Covers absent bound ownership while retaining the actual text record. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, rule, first, texts } = owners;
  try {
    first.RemoveMe(document);
    expect(first.GetNumRule()).toBeUndefined();
    expect(required(texts[0]).GetNum()).toBe(first);
    const before = stable(owners),
      lookup = vi.spyOn(first, "GetNumRule"),
      text = vi.spyOn(first, "GetTextNode"),
      continuous = vi.spyOn(rule, "IsContinusNum"),
      phantoms = vi.spyOn(rule, "IsCountPhantoms");
    expect(probe(first).IsCountPhantoms()).toBe(true);
    expect(lookup).not.toHaveBeenCalled();
    expect(text).not.toHaveBeenCalled();
    expect(continuous).not.toHaveBeenCalled();
    expect(phantoms).not.toHaveBeenCalled();
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("compares direct text pointers for every root phantom ordered text and equal-index pair", /** Checks all25 pointer/index profiles and exact index evaluation order using actual owners. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, texts, root, phantom, first, second } = owners,
    duplicate = new SwNodeNum(required(texts[0]), false),
    nodes = [root, phantom, first, second, duplicate],
    expected = [
      [false, false, true, true, true],
      [false, false, true, true, true],
      [false, false, false, true, false],
      [false, false, false, false, false],
      [false, false, false, true, false],
    ],
    textIds = [0, 0, 0, 1, 0];
  try {
    expect(phantom.IsPhantom()).toBe(true);
    expect(required(texts[0]).GetIndex()).toBeLessThan(required(texts[1]).GetIndex());
    expect(duplicate).not.toBe(first);
    const before = stable(owners),
      trace: number[] = [],
      getters = nodes.map(
        /** Observes unused nonvirtual owner helper. @param node - Record. @returns Spy. */ (
          node,
        ) => vi.spyOn(node, "GetTextNode"),
      );
    for (let index = 0; index < texts.length; index++) {
      const text = required(texts[index]),
        read = text.GetIndex.bind(text);
      vi.spyOn(text, "GetIndex").mockImplementation(
        /** Observes index call order. @returns Real position. */ () => {
          trace.push(index);
          return read();
        },
      );
    }
    for (let left = 0; left < nodes.length; left++)
      for (let right = 0; right < nodes.length; right++) {
        trace.length = 0;
        expect(required(nodes[left]).LessThan(required(nodes[right]))).toBe(
          required(expected[left])[right],
        );
        expect(trace).toEqual(left >= 2 && right >= 2 ? [textIds[left], textIds[right]] : []);
      }
    for (const getter of getters) expect(getter).not.toHaveBeenCalled();
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("keeps the first comparator-equivalent identity in the actual sorted container", /** Covers null-text equivalence and distinct equal-index records under real strict ordering. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, texts, root, phantom, first, second } = owners,
    duplicate = new SwNodeNum(required(texts[0]), false),
    storage = new SortedVector<SwNumberTreeNode>(
      /** Uses the actual native-shaped comparator. @param left - Left record. @param right - Right record. @returns Ordering. */
      (left, right) => left.LessThan(right),
    );
  try {
    const before = stable(owners);
    expect(storage.insert(second)).toEqual([0, true]);
    expect(storage.insert(first)).toEqual([0, true]);
    expect(storage.insert(root)).toEqual([0, true]);
    expect(storage.insert(phantom)).toEqual([0, false]);
    expect(storage.insert(duplicate)).toEqual([1, false]);
    expect([...storage]).toEqual([root, first, second]);
    expect(storage.at(0)).toBe(root);
    expect(storage.at(1)).toBe(first);
    expect(storage.find(phantom)).toBe(0);
    expect(storage.find(duplicate)).toBe(1);
    expect(stable(owners)).toEqual(before);
  } finally {
    document.Dispose();
  }
});
