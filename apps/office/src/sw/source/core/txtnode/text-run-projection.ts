/** @fileoverview Derives immutable browser/transfer text runs from canonical SwTextNode text and hints. */

import { equalWriterHyperlinks, normalizeWriterHyperlink } from "./fmtinfmt";
import { SwpHints, type WriterTextRunLike } from "./ndhints";
import type { SwTextFragment, SwTextNode } from "./ndtxt";
import type { WriterCharacterAttributes } from "./txatbase";

/** Derived immutable projection; canonical state remains text plus SwpHints. */
export type WriterTextRun = WriterTextRunLike;

/** Empty direct-format state used when projecting new plain text. */
export const DEFAULT_WRITER_CHARACTER_ATTRIBUTES: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/** Creates one unformatted run sequence from plain text. @param text - Visible text. @returns Derived runs. */
export function createWriterTextRuns(text: string): readonly WriterTextRun[] {
  return text.length === 0 ? [] : [{ attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES, text }];
}

/** Converts a run collection to visible text. @param runs - Boundary run input. @returns Concatenated text. */
export function getWriterTextFromRuns(runs: unknown): string {
  return normalizeWriterTextRuns(runs)
    .map(
      /** Extracts one normalized run body. @param run - Normalized run. @returns Visible text. */ (
        run,
      ) => run.text,
    )
    .join("");
}

/** Projects one native node range to immutable runs. @param node - Source node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Derived runs. */
export function copyWriterTextRangeRuns(
  node: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRun[] {
  const fragment = node.CaptureTextFragment(start, end);
  return fragment.hints.toTextRuns(fragment.text, node.GetSwAttrSet());
}

/** Projects a complete node without storing run state in SwTextNode. @param node - Canonical node. @returns Derived runs. */
export function projectWriterTextRuns(node: SwTextNode | undefined): readonly WriterTextRun[] {
  if (node === undefined) return [];
  return (node.GetpSwpHints() ?? new SwpHints(node.GetDoc().GetAttrPool())).toTextRuns(
    node.GetText(),
    node.GetSwAttrSet(),
  );
}

/** Converts one boundary run payload into a native text-plus-hints fragment. @param node - Node supplying the document pool and inherited attributes. @param runs - Boundary run payload. @returns Native fragment accepted by Writer operations. */
export function createWriterTextFragment(node: SwTextNode, runs: unknown): SwTextFragment {
  const normalized = normalizeWriterTextRuns(runs);
  const hints = new SwpHints(node.GetDoc().GetAttrPool());
  hints.setTextRuns(normalized, node.GetSwAttrSet());
  return { text: getWriterTextFromRuns(normalized), hints };
}

/** Normalizes untrusted run data and merges adjacent equivalent runs. @param candidate - Boundary value. @returns Normalized runs. */
export function normalizeWriterTextRuns(candidate: unknown): readonly WriterTextRun[] {
  if (!Array.isArray(candidate)) return [];
  const runs: WriterTextRun[] = [];
  candidate.forEach(
    /** Parses one candidate run. @param item - Unknown item. @returns Nothing. */ (item): void => {
      if (!isRecord(item) || typeof item.text !== "string" || item.text.length === 0) return;
      const attributes = normalizeWriterCharacterAttributes(item.attributes);
      const hyperlink = normalizeWriterHyperlink(item.hyperlink);
      const previous = runs[runs.length - 1];
      if (
        previous !== undefined &&
        areWriterCharacterAttributesEqual(previous.attributes, attributes) &&
        equalWriterHyperlinks(previous.hyperlink, hyperlink)
      )
        runs[runs.length - 1] = { ...previous, text: `${previous.text}${item.text}` };
      else
        runs.push({
          attributes,
          ...(hyperlink === undefined ? {} : { hyperlink }),
          text: item.text,
        });
    },
  );
  return runs;
}

/** Normalizes the bounded direct-character subset. @param candidate - Boundary value. @returns Attributes. */
export function normalizeWriterCharacterAttributes(candidate: unknown): WriterCharacterAttributes {
  const attributes = isRecord(candidate) ? candidate : {};
  return {
    ...(isWriterColor(attributes.color, "auto") ? { color: attributes.color } : {}),
    ...(typeof attributes.fontFamily === "string" && attributes.fontFamily.trim().length > 0
      ? { fontFamily: attributes.fontFamily }
      : {}),
    ...(Number.isInteger(attributes.fontSizeTwips) && Number(attributes.fontSizeTwips) > 0
      ? { fontSizeTwips: Number(attributes.fontSizeTwips) }
      : {}),
    ...(isWriterColor(attributes.highlight, "transparent")
      ? { highlight: attributes.highlight }
      : {}),
    bold: attributes.bold === true,
    italic: attributes.italic === true,
    underline: attributes.underline === true,
  };
}

/** Splits projected runs at one UTF-16 offset. @param runs - Source runs. @param offset - Split offset. @returns Prefix and suffix. */
export function splitWriterTextRuns(
  runs: readonly WriterTextRun[],
  offset: number,
): Readonly<{ prefix: readonly WriterTextRun[]; suffix: readonly WriterTextRun[] }> {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer text split offset is outside the paragraph.");
  let consumed = 0;
  const prefix: WriterTextRun[] = [];
  const suffix: WriterTextRun[] = [];
  for (const run of normalized) {
    const runStart = consumed;
    const runEnd = runStart + run.text.length;
    consumed = runEnd;
    if (runEnd <= offset) prefix.push(run);
    else if (runStart >= offset) suffix.push(run);
    else {
      const localOffset = offset - runStart;
      prefix.push({ ...run, text: run.text.slice(0, localOffset) });
      suffix.push({ ...run, text: run.text.slice(localOffset) });
    }
  }
  return { prefix: normalizeWriterTextRuns(prefix), suffix: normalizeWriterTextRuns(suffix) };
}

/** Compares the bounded direct-character attributes. @param left - First attributes. @param right - Second attributes. @returns Equality. */
function areWriterCharacterAttributesEqual(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold &&
    left.color === right.color &&
    left.italic === right.italic &&
    left.underline === right.underline &&
    left.fontFamily === right.fontFamily &&
    left.fontSizeTwips === right.fontSizeTwips &&
    left.highlight === right.highlight
  );
}

/** Validates one bounded Writer color value. @param value - Candidate. @param special - Allowed Writer special value. @returns Whether supported. */
function isWriterColor(value: unknown, special: "auto" | "transparent"): value is string {
  return typeof value === "string" && (/^#[0-9a-f]{6}$/iu.test(value) || value === special);
}

/** Checks for a non-array object. @param value - Candidate. @returns Whether record-like. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
