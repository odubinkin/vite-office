/** @fileoverview Verifies native protected explicit-target contracts and literal prefix/cache observations without upstream access. */
import { expect, it } from "vitest";
import { isDeepStrictEqual } from "node:util";
import { gunzipSync } from "node:zlib";
import data from "./SwNumberTree-contract-native.json";
import { SwNumberTreeNode } from "./SwNumberTree";
import { SwNodeNum } from "./SwNodeNum";
import { SwDoc } from "../doc/doc";
import { SwNumRule, SvxNumType } from "../doc/number";
import { SwTextFormatColl } from "../doc/fmtcol";
import { SwNumRuleItem } from "../para/paratr";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../../svl/source/items/stritem";

/** Exposes method types through a test-only subclass, preserving production visibility. */
class ValidationProbe extends SwNodeNum {
  /** Binds the native hierarchical target contract for compile-time inspection. */
  public readonly hierarchical = this.ValidateHierarchical.bind(this);
  /** Binds the native continuous target contract for compile-time inspection. */
  public readonly continuous = this.ValidateContinuous.bind(this);
}
/** Reports exact type equality, including required rather than optional tuple arguments. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Compile-time source contracts; the preceding implementation fails these assignments. */
const contracts: [
  "ValidateHierarchical" extends keyof SwNumberTreeNode ? false : true,
  "ValidateContinuous" extends keyof SwNumberTreeNode ? false : true,
  Same<Parameters<ValidationProbe["hierarchical"]>, [target: SwNumberTreeNode | undefined]>,
  Same<Parameters<ValidationProbe["continuous"]>, [target: SwNumberTreeNode | undefined]>,
] = [true, true, true, true];

/** Diagnostic access to the native protected method; absent target is explicit. */
interface HierarchicalDiagnostic {
  /** Validates one native child prefix. @param target - Child pointer or explicit null equivalent. @returns Nothing. */
  ValidateHierarchical(target: SwNumberTreeNode | undefined): void;
}
/** Literal native tree state: identity, raw counter, last-valid identity, continuation, phantom, children. */
type State = [number, number, number | null, boolean, boolean, State[]];
/** Literal native nonvalidating observation after one requested operation. */
interface Observation {
  tree: State;
  raw: number[];
  events: number[];
  read: number[] | null;
}
/** Authored policy inputs with independently produced native expectations. */
interface Profile {
  levels: number[];
  phantoms: boolean;
  start: number;
  mask: number;
  restart: boolean;
  expected: Observation[];
}
/** Decodes only stored literal data; no reference source or compiler is consulted. */
const profiles = JSON.parse(
  gunzipSync(Buffer.from(data.data, "base64")).toString("utf8"),
) as Profile[];

/** Requires a real test-owned record. @param value - Candidate. @returns Present record. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing contract fixture record");
  return value;
}
/** Invokes a protected method solely through the test observer. @param parent - Native parent. @param target - Explicit child pointer. @returns Nothing. */
function hierarchical(parent: SwNumberTreeNode, target: SwNumberTreeNode | undefined): void {
  (parent as unknown as HierarchicalDiagnostic).ValidateHierarchical(target);
}
/** Maps document ordinals and phantom/root depths without reading counters. @param node - Native record. @param texts - Connected paragraphs. @returns Identity. */
function identity(node: SwNumberTreeNode, texts: SwTextNode[]): number {
  const text = (node as SwNodeNum).GetTextNode();
  return text === undefined ? -100 - node.GetLevelInListTree() : texts.indexOf(text);
}
/** Observes all raw child prefixes without causing validation. @param node - Native record. @param texts - Connected paragraphs. @returns Tree state. */
function state(node: SwNumberTreeNode, texts: SwTextNode[]): State {
  const valid = (node as unknown as { lastValid?: SwNumberTreeNode }).lastValid;
  return [
    identity(node, texts),
    node.GetNumber(false),
    valid === undefined ? null : identity(valid, texts),
    node.IsContinueingPreviousSubTree(),
    node.IsPhantom(),
    getNumberTreeChildren(node).map(
      /** Observes one child recursively without validating it. @param child - Child. @returns State. */
      (child) => state(child, texts),
    ),
  ];
}

it("keeps both validators protected and requires explicit nullable child arguments", /** Typechecking enforces the four exact native access/argument contracts. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true]);
});

it("matches native null foreign owned-prefix and deferred descendant cache observations", /** Compares128 actual document profiles,1792 snapshots and7168 raw record states to independent native output. @returns Nothing. */ () => {
  let observations = 0;
  for (const [profileIndex, profile] of profiles.entries()) {
    const doc = new SwDoc(false),
      rule = doc.AddNumRule(new SwNumRule("Contract", "label-alignment"));
    rule.SetAutoRule(false);
    rule.SetContinusNum(false);
    rule.SetCountPhantoms(profile.phantoms);
    for (let level = 0; level < 10; level++) {
      const format = rule.Get(level).clone();
      format.SetStart(profile.start + level);
      format.SetNumberingType(SvxNumType.SVX_NUM_ARABIC);
      rule.Set(level, format);
    }
    const style = new SwTextFormatColl(doc.GetAttrPool(), "contract", "Contract"),
      texts = profile.levels.map(
        /** Creates connected paragraphs with an empty source-style list state. @returns Paragraph. */ () => {
          const text = doc.nodes.MakeTextNode();
          text.ChgFormatColl(style);
          return text;
        },
      );
    doc.SetInReading(true);
    texts.forEach(
      /** Inserts each source-owned list record with explicit policy inputs. @param text - Paragraph. @param index - Native ordinal. @returns Nothing. */
      (text, index) => {
        const items = new SfxItemSet(doc.GetAttrPool(), [[1, 87]]);
        items.Put(new SwNumRuleItem("Contract"));
        items.Put(new SfxStringItem(83, "contract"));
        items.Put(new SfxInt16Item(84, required(profile.levels[index])));
        items.Put(new SfxBoolItem(87, Boolean(profile.mask & (1 << index))));
        if (index === 0 && profile.restart) {
          items.Put(new SfxBoolItem(85, true));
          items.Put(new SfxInt16Item(86, 11));
        }
        text.SetAttr(items);
      },
    );
    const records = texts.map(
        /** Retains actual registered records. @param text - Paragraph. @returns Record. */ (
          text,
        ) => required(text.GetNum()),
      ),
      root = required(getNumberTreeRoot(required(records[0]))),
      foreign = new SwNodeNum(doc.nodes.MakeTextNode(), rule),
      events: number[] = [],
      notify = doc.NotifyModelChange.bind(doc);
    doc.NotifyModelChange =
      /** Captures numbering events without forcing counters. @param hint - Model hint. @returns Nothing. */ (
        hint,
      ) => {
        if (hint.kind === "numbering-changed")
          events.push(
            texts.findIndex(
              /** Maps the actual notified paragraph. @param text - Paragraph. @returns Match. */ (
                text,
              ) => text.GetIndex() === hint.nodeIndex,
            ),
          );
        notify(hint);
      };
    for (let step = 0; step < 14; step++) {
      events.splice(0);
      let read: number[] | null = null;
      if (step === 1 || step === 12) hierarchical(root, undefined);
      if (step === 2 || step === 13) hierarchical(root, foreign);
      if (step === 3)
        hierarchical(
          root,
          new SwNodeNum(
            (required(getNumberTreeChildren(root)[0]) as SwNodeNum).GetTextNode(),
            rule,
          ),
        );
      if (step === 4) hierarchical(root, required(getNumberTreeChildren(root)[0]));
      if (step === 5) hierarchical(root, required(getNumberTreeChildren(root).at(-1)));
      if (step === 6)
        for (const record of records) {
          const child = getNumberTreeChildren(record).at(-1);
          if (child !== undefined) hierarchical(record, child);
        }
      if (step === 7 || step === 8)
        read = [...required(records[step === 7 ? 0 : 3]).GetNumberVector()];
      if (step === 9) root.InvalidateTree();
      if (step === 10) root.NotifyInvalidChildren(doc);
      if (step === 11) {
        doc.SetInReading(false);
        root.NotifyInvalidChildren(doc);
      }
      const actual: Observation = {
        tree: state(root, texts),
        raw: records.map(
          /** Reads the stored counter without validating a prefix. @param record - Record. @returns Counter. */
          (record) => record.GetNumber(false),
        ),
        events: [...events],
        read,
      };
      const expected = required(profile.expected[step]);
      if (!isDeepStrictEqual(actual, expected))
        expect(actual, `profile${profileIndex} step${step}`).toEqual(expected);
      observations++;
    }
    doc.Dispose();
  }
  expect(observations).toBe(1792);
});

/** Observes native protected root identity only in tests. @param node - Diagnostic record, absent for an empty fixture. @returns Root pointer or null equivalent. */
function getNumberTreeRoot(node: SwNumberTreeNode | undefined): SwNumberTreeNode | undefined {
  return (
    node as unknown as
      | {
          /** Reads the protected root. @returns Root pointer or null equivalent. */
          GetRoot(): SwNumberTreeNode | undefined;
        }
      | undefined
  )?.GetRoot();
}

/** Observes protected child storage solely for diagnostics. @param node - Owned tree record. @returns Direct children in native order. */
function getNumberTreeChildren(node: SwNumberTreeNode): readonly SwNumberTreeNode[] {
  return (node as unknown as { mChildren: SwNumberTreeNode[] }).mChildren;
}
