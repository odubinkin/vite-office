/** @fileoverview Verifies the protected native vector validation flag against project-owned document caches without upstream access. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes only method types through a test subclass. */
class VectorContract extends SwNodeNum {
  /** Retains the exact protected argument tuple for compile-time checks. */
  public readonly vector = this.GetNumberVector_.bind(this);
}
/** Reports exact argument type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  "GetNumberVector_" extends keyof SwNumberTreeNode ? false : true,
  Same<Parameters<VectorContract["vector"]>, [numbers: number[], validate?: boolean | undefined]>,
] = [true, true];

/** Test-only diagnostic access preserves production protected visibility. */
interface VectorDiagnostic {
  /** Appends ancestral counters under the chosen native policy. @param output - Existing output. @param validate - Validation flag, true by default. @returns Nothing. */
  GetNumberVector_(output: number[], validate?: boolean): void;
}
/** Requires a fixture record. @param value - Candidate. @returns Present record. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing vector fixture record");
  return value;
}
/** Calls the protected diagnostic with omitted or explicit arguments. @param node - Record. @param output - Existing vector. @param validate - Optional policy. @returns Nothing. */
function append(node: SwNumberTreeNode, output: number[], validate?: boolean): void {
  const diagnostic = node as unknown as VectorDiagnostic;
  if (validate === undefined) diagnostic.GetNumberVector_(output);
  else diagnostic.GetNumberVector_(output, validate);
}
/** Literal raw cache observation including all recursive child prefixes. */
type Cache = [number, number | null, boolean, Cache[]];
/** Captures raw values and prefix identities without validating. @param node - Root or record. @param texts - Canonical paragraph identities. @returns Complete cache snapshot. */
function cache(node: SwNumberTreeNode, texts: SwTextNode[]): Cache {
  const valid = (node as unknown as { lastValid?: SwNodeNum }).lastValid;
  return [
    node.GetNumber(false),
    valid === undefined
      ? null
      : valid.GetTextNode() === undefined
        ? -100 - valid.GetLevelInListTree()
        : texts.indexOf(required(valid.GetTextNode())),
    node.IsContinueingPreviousSubTree(),
    getNumberTreeChildren(node).map(
      /** Captures one descendant. @param child - Child. @returns Raw snapshot. */
      (child) => cache(child, texts),
    ),
  ];
}

const profiles = [
  {
    continuous: false,
    levels: [0, 1, 2, 0],
    target: 2,
    raw: [0, 0, 0],
    initial: [7, 5, 3],
    restarted: [11, 5, 3],
  },
  {
    continuous: true,
    levels: [0, 1, 2, 0],
    target: 2,
    raw: [0, 0, 0],
    initial: [7, 8, 9],
    restarted: [11, 12, 13],
  },
  {
    continuous: false,
    levels: [0, 9, 0],
    target: 1,
    raw: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    initial: [7, 5, 3, 2, 2, 2, 2, 2, 2, 2],
    restarted: [11, 5, 3, 2, 2, 2, 2, 2, 2, 2],
  },
  {
    continuous: true,
    levels: [0, 9, 0],
    target: 1,
    raw: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    initial: [7, 7, 7, 7, 7, 7, 7, 7, 7, 8],
    restarted: [11, 11, 11, 11, 11, 11, 11, 11, 11, 12],
  },
] as const;

it("keeps the vector helper protected with a true-default optional boolean", /** Typechecking rejects the preceding output-only contract. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true]);
});

it.each(profiles)(
  "preserves ancestor caches for continuous=$continuous levels=$levels",
  /** Verifies raw reads, append ownership and validating defaults before and after restart invalidation. @param profile - Literal vector profile. @returns Nothing. */
  (profile) => {
    const document = createWriterDocument();
    document.SetInReading(true);
    const rule = document.EnsureNumRule("Vectors", "numbered");
    rule.SetContinusNum(profile.continuous);
    for (let level = 0; level < 10; level++) {
      const format = rule.Get(level).clone();
      format.SetStart([7, 5, 3][level] ?? 2);
      rule.Set(level, format);
    }
    const texts = profile.levels.map(
      /** Inserts an actual owned list record under reading suppression. @param level - Native level. @param index - Document ordinal. @returns Paragraph. */
      (level, index) => {
        const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
        applyWriterParagraphList(text, {
          kind: "numbered",
          level,
          styleId: "Vectors",
          listId: "vectors",
        });
        return text;
      },
    );
    const target = required(required(texts[profile.target]).GetNum());
    const root = required(getNumberTreeRoot(target));
    const fresh = cache(root, texts);
    const raw = [99];
    append(target, raw, false);
    expect(raw).toEqual([99, ...profile.raw]);
    expect(cache(root, texts)).toEqual(fresh);
    const validated = [99];
    append(target, validated);
    expect(validated).toEqual([99, ...profile.initial]);
    expect(target.GetNumberVector()).toEqual(profile.initial);
    const retained = cache(root, texts);
    const repeated = [99];
    append(target, repeated, false);
    expect(repeated).toEqual(validated);
    expect(cache(root, texts)).toEqual(retained);
    required(texts[0]).SetListRestart(true);
    required(texts[0]).SetAttrListRestartValue(11);
    const invalidated = cache(root, texts);
    expect(invalidated).not.toEqual(retained);
    const stale = [99];
    append(target, stale, false);
    expect(stale).toEqual([99, ...profile.initial]);
    expect(cache(root, texts)).toEqual(invalidated);
    const restarted = [99];
    append(target, restarted, true);
    expect(restarted).toEqual([99, ...profile.restarted]);
    expect(target.GetNumberVector()).toEqual(profile.restarted);
    const explicitUndefined = [99];
    (target as unknown as VectorDiagnostic).GetNumberVector_(explicitUndefined, undefined);
    expect(explicitUndefined).toEqual(restarted);
    const rootOutput = [99];
    append(root, rootOutput, false);
    append(root, rootOutput, true);
    expect(rootOutput).toEqual([99]);
    document.Dispose();
  },
);

it("preserves prefilled output and raw state for an unattached record", /** An orphan has no ancestor path regardless of validation selection. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const orphan = new SwNodeNum(document.paragraphs[0]);
  const output = [99];
  append(orphan, output, false);
  append(orphan, output, true);
  append(orphan, output);
  expect(output).toEqual([99]);
  expect(orphan.GetNumber(false)).toBe(0);
  expect(orphan.GetNumberVector()).toEqual([]);
  document.Dispose();
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
  return [...(node as unknown as { mChildren: Iterable<SwNumberTreeNode> }).mChildren];
}
