/**
 * @fileoverview Implements Writer text nodes plus derived browser text runs at the pinned LibreOffice `sw/source/core/txtnode/ndtxt.cxx` ownership boundary.
 */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import {
  RES_PARATR_ADJUST,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import {
  createDefaultWriterParagraphList,
  normalizeWriterParagraphList,
  WRITER_MAX_LIST_LEVEL,
  type WriterParagraphList,
} from "../doc/list";
import { type SwTextFormatColl, type WriterParagraphStyle } from "../doc/fmtcol";
import {
  DEFAULT_BULLET_RULE_NAME,
  DEFAULT_NUMBERING_RULE_NAME,
  type SwNumRule,
} from "../doc/number";
import { SwContentNode, type SwStartNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import { SwContentIndexUpdateMode } from "../bastyp/contentindex";
import { equalWriterHyperlinks, normalizeWriterHyperlink, type WriterHyperlink } from "./fmtinfmt";

/** Finds the grapheme start immediately before a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Previous grapheme boundary. */
export function getWriterPreviousGraphemeBoundary(text: string, offset: number): number {
  const boundaries = getWriterGraphemeBoundaries(text);
  let previous = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return previous;
    previous = boundary;
  }
  /* v8 ignore next -- Boundary enumeration includes text.length for a valid cursor offset. */
  return previous;
}

/** Finds the grapheme end immediately after a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Next grapheme boundary. */
export function getWriterNextGraphemeBoundary(text: string, offset: number): number {
  for (const boundary of getWriterGraphemeBoundaries(text)) if (boundary > offset) return boundary;
  /* v8 ignore next -- Callers handle the text-end cursor before requesting a boundary. */
  return text.length;
}

/** Exact contiguous text mutation detected between two Writer text states. */
export type WriterTextChange =
  | Readonly<{ kind: "delete"; end: number; start: number; text: string }>
  | Readonly<{ kind: "insert"; offset: number; text: string }>;

/** Detects one contiguous insertion, deletion, or a replacement requiring fallback handling. @param previousText - Canonical text. @param nextText - New text. @returns Exact insertion/deletion when representable. */
export function getWriterTextChange(
  previousText: string,
  nextText: string,
): WriterTextChange | undefined {
  if (nextText === previousText) return undefined;
  let prefixLength = 0;
  while (
    prefixLength < previousText.length &&
    previousText.charAt(prefixLength) === nextText.charAt(prefixLength)
  )
    prefixLength += 1;
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    previousText.charAt(previousText.length - suffixLength - 1) ===
      nextText.charAt(nextText.length - suffixLength - 1)
  )
    suffixLength += 1;
  const previousEnd = previousText.length - suffixLength;
  const removedText = previousText.slice(prefixLength, previousEnd);
  const insertedText = nextText.slice(prefixLength, nextText.length - suffixLength);
  if (removedText.length === 0 && insertedText.length > 0)
    return { kind: "insert", offset: prefixLength, text: insertedText };
  if (insertedText.length === 0 && removedText.length > 0)
    return { kind: "delete", end: previousEnd, start: prefixLength, text: removedText };
  return undefined;
}

/** Enumerates UTF-16 grapheme boundaries with a code-point fallback. @param text - Paragraph text. @returns Ordered boundaries including zero and text length. */
function getWriterGraphemeBoundaries(text: string): readonly number[] {
  const boundaries = [0];
  if (typeof Intl.Segmenter === "function") {
    const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
    for (const segment of segments) boundaries.push(segment.index + segment.segment.length);
    return boundaries;
  }
  let offset = 0;
  for (const character of text) {
    offset += character.length;
    boundaries.push(offset);
  }
  return boundaries;
}
import { SwNumRuleItem } from "../para/paratr";
import { SwpHints } from "./ndhints";
import type { WriterCharacterAttributes } from "./txatbase";
export type { WriterCharacterAttributes } from "./txatbase";

/** Names the bounded direct character attributes currently supported by the browser Writer. */
export const WRITER_CHARACTER_FORMATS = ["bold", "italic", "underline"] as const;

/** Identifies one supported direct Writer character attribute. */
export type WriterCharacterFormat = (typeof WRITER_CHARACTER_FORMATS)[number];

/** Describes one non-empty immutable Writer text fragment and its direct attributes. */
export interface WriterTextRun {
  /** Direct character attributes applied to every code unit in text. */
  readonly attributes: WriterCharacterAttributes;
  /** Optional hyperlink applied to this exact text portion. */
  readonly hyperlink?: WriterHyperlink;
  /** Non-empty UTF-16 text fragment. */
  readonly text: string;
}

/** Stores the empty direct-formatting state used for new Writer text. */
export const DEFAULT_WRITER_CHARACTER_ATTRIBUTES: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/** Enumerates the bounded paragraph alignments represented by RES_PARATR_ADJUST. */
export const WRITER_PARAGRAPH_ALIGNMENTS = ["left", "center", "right", "justify"] as const;

/** Identifies one supported horizontal paragraph alignment. */
export type WriterParagraphAlignment = (typeof WRITER_PARAGRAPH_ALIGNMENTS)[number];

/**
 * Creates one unformatted text-run sequence from plain text.
 *
 * @param text - Complete Writer paragraph text to represent as runs.
 * @returns No runs for empty text, otherwise one default-attribute text run.
 */
export function createWriterTextRuns(text: string): readonly WriterTextRun[] {
  return text.length === 0 ? [] : [{ attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES, text }];
}

/**
 * Converts a normalized or legacy run collection to its exact visible plain text.
 *
 * @param runs - Text runs read from a Writer paragraph or browser boundary.
 * @returns Concatenated visible UTF-16 text with invalid fragments omitted.
 */
export function getWriterTextFromRuns(runs: unknown): string {
  return normalizeWriterTextRuns(runs)
    .map(
      /** Extracts a normalized run body. @param run - Valid normalized text run. @returns Its visible text. */
      function selectRunText(run): string {
        return run.text;
      },
    )
    .join("");
}

/**
 * Normalizes untrusted Writer run data, removing empty fragments and merging adjacent equal attributes.
 *
 * @param candidate - Unknown persisted or caller-supplied run collection.
 * @returns Immutable normalized direct-format text runs.
 */
export function normalizeWriterTextRuns(candidate: unknown): readonly WriterTextRun[] {
  if (!Array.isArray(candidate)) return [];
  const runs: WriterTextRun[] = [];
  candidate.forEach(
    /** Parses and appends one valid non-empty persisted run. @param item - Unknown persisted run. @returns Nothing; valid normalized output is accumulated. */
    function appendNormalizedRun(item): void {
      if (!isRecord(item) || typeof item.text !== "string" || item.text.length === 0) return;
      const attributes = normalizeWriterCharacterAttributes(item.attributes);
      const hyperlink = normalizeWriterHyperlink(item.hyperlink);
      const previous = runs[runs.length - 1];
      if (
        previous !== undefined &&
        areWriterCharacterAttributesEqual(previous.attributes, attributes) &&
        equalWriterHyperlinks(previous.hyperlink, hyperlink)
      ) {
        runs[runs.length - 1] = { ...previous, text: `${previous.text}${item.text}` };
      } else {
        runs.push({
          attributes,
          ...(hyperlink === undefined ? {} : { hyperlink }),
          text: item.text,
        });
      }
    },
  );
  return runs;
}

/**
 * Normalizes unknown direct character attributes to the bounded Writer subset.
 *
 * @param candidate - Unknown attributes read from storage or a command boundary.
 * @returns Immutable attributes with unsupported or absent values treated as false.
 */
export function normalizeWriterCharacterAttributes(candidate: unknown): WriterCharacterAttributes {
  const attributes = isRecord(candidate) ? candidate : {};
  return {
    ...(typeof attributes.fontFamily === "string" && attributes.fontFamily.trim().length > 0
      ? { fontFamily: attributes.fontFamily }
      : {}),
    bold: attributes.bold === true,
    italic: attributes.italic === true,
    underline: attributes.underline === true,
  };
}

/** Applies a font family. @param runs - Source runs. @param start - Range start. @param end - Range end. @param fontFamily - Family. @returns Formatted runs. */
export function applyWriterTextRangeFont(
  runs: readonly WriterTextRun[],
  start: number,
  end: number,
  fontFamily: string,
): readonly WriterTextRun[] {
  if (fontFamily.trim().length === 0) throw new Error("Writer font family must not be blank.");
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end > textLength ||
    start > end
  )
    throw new Error("Writer font range is outside the paragraph.");
  if (start === end) return normalized;
  let offset = 0;
  return normalizeWriterTextRuns(
    normalized.flatMap(
      /** Formats one intersecting run. @param run - Source run. @returns Replacement fragments. */ (
        run,
      ) => {
        const runStart = offset;
        const runEnd = runStart + run.text.length;
        offset = runEnd;
        if (runStart >= end || runEnd <= start) return [run];
        const beforeLength = Math.max(0, start - runStart);
        const afterStart = Math.min(run.text.length, end - runStart);
        return [
          ...(beforeLength === 0
            ? []
            : [
                {
                  ...run,
                  text: run.text.slice(0, beforeLength),
                },
              ]),
          {
            ...run,
            attributes: { ...run.attributes, fontFamily },
            text: run.text.slice(beforeLength, afterStart),
          },
          ...(afterStart === run.text.length
            ? []
            : [
                {
                  ...run,
                  text: run.text.slice(afterStart),
                },
              ]),
        ];
      },
    ),
  );
}

/**
 * Applies one direct format to a non-empty same-paragraph text range, toggling it off only when every selected character already has it.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param start - Inclusive UTF-16 paragraph offset where the selection begins.
 * @param end - Exclusive UTF-16 paragraph offset where the selection ends.
 * @param format - Direct character format selected by the Writer command.
 * @returns Original normalized runs for an empty range, otherwise a normalized formatted replacement.
 * @throws {Error} When range offsets are not integer bounds of the visible run text.
 */
export function toggleWriterTextRangeFormat(
  runs: readonly WriterTextRun[],
  start: number,
  end: number,
  format: WriterCharacterFormat,
): readonly WriterTextRun[] {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end > textLength ||
    start > end
  )
    throw new Error("Writer character-format range is outside the paragraph.");
  if (start === end) return normalized;
  let offset = 0;
  const selectedAlreadyFormatted = normalized
    .filter(
      /** Retains text runs intersected by the requested non-empty range. @param run - Normalized text run. @returns True only for range-intersecting runs. */
      function intersectsRange(run): boolean {
        const runEnd = offset + run.text.length;
        const intersects = offset < end && runEnd > start;
        offset = runEnd;
        return intersects;
      },
    )
    .every(
      /** Checks whether one intersected run already owns the requested format. @param run - Intersected normalized run. @returns True only when the requested format is enabled. */
      function hasFormat(run): boolean {
        return run.attributes[format];
      },
    );
  offset = 0;
  return normalizeWriterTextRuns(
    normalized.flatMap(
      /** Splits one intersected run at range boundaries and updates only its selected fragment. @param run - Normalized source text run. @returns One to three immutable replacement runs. */
      function formatIntersectedRun(run): readonly WriterTextRun[] {
        const runStart = offset;
        const runEnd = runStart + run.text.length;
        offset = runEnd;
        if (runStart >= end || runEnd <= start) return [run];
        const beforeLength = Math.max(0, start - runStart);
        const afterStart = Math.min(run.text.length, end - runStart);
        const before = run.text.slice(0, beforeLength);
        const selected = run.text.slice(beforeLength, afterStart);
        const after = run.text.slice(afterStart);
        const attributes = { ...run.attributes, [format]: !selectedAlreadyFormatted };
        return [
          ...(before.length === 0 ? [] : [{ ...run, text: before }]),
          { ...run, attributes, text: selected },
          ...(after.length === 0 ? [] : [{ ...run, text: after }]),
        ];
      },
    ),
  );
}

/**
 * Inserts text at one UTF-16 offset with the supplied direct attributes.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 insertion offset from zero through visible text length.
 * @param text - Text to insert unchanged.
 * @param attributes - Direct attributes inherited by the inserted text.
 * @param hyperlink - Optional hyperlink inherited by the inserted text.
 * @returns Normalized runs containing the inserted text, or the original normalized runs for empty text.
 * @throws {Error} When offset is outside visible text bounds.
 */
export function insertWriterTextRun(
  runs: readonly WriterTextRun[],
  offset: number,
  text: string,
  attributes: WriterCharacterAttributes,
  hyperlink?: WriterHyperlink,
): readonly WriterTextRun[] {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer text insertion offset is outside the paragraph.");
  if (text.length === 0) return normalized;
  const normalizedHyperlink = normalizeWriterHyperlink(hyperlink);
  const inserted = {
    attributes: normalizeWriterCharacterAttributes(attributes),
    ...(normalizedHyperlink === undefined ? {} : { hyperlink: normalizedHyperlink }),
    text,
  };
  let consumed = 0;
  let insertedRun = false;
  const nextRuns = normalized.flatMap(
    /** Inserts the run before, inside, or after exactly one source fragment. @param run - Normalized source run. @returns One or more replacement runs. */
    function insertIntoRun(run): readonly WriterTextRun[] {
      const runStart = consumed;
      const runEnd = runStart + run.text.length;
      consumed = runEnd;
      if (insertedRun || offset < runStart || offset > runEnd) return [run];
      insertedRun = true;
      const localOffset = offset - runStart;
      return [
        ...(localOffset === 0
          ? []
          : [
              {
                ...run,
                text: run.text.slice(0, localOffset),
              },
            ]),
        inserted,
        ...(localOffset === run.text.length
          ? []
          : [
              {
                ...run,
                text: run.text.slice(localOffset),
              },
            ]),
      ];
    },
  );
  return normalizeWriterTextRuns(insertedRun ? nextRuns : [...nextRuns, inserted]);
}

/**
 * Splits runs at one valid UTF-16 paragraph offset.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 split offset from zero through visible text length.
 * @returns Immutable prefix and suffix run collections preserving direct attributes.
 * @throws {Error} When offset is outside visible text bounds.
 */
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
  normalized.forEach(
    /** Splits one run only when it crosses offset. @param run - Normalized source run. @returns Nothing; prefix and suffix collections are accumulated. */
    function splitRun(run): void {
      const runStart = consumed;
      const runEnd = runStart + run.text.length;
      consumed = runEnd;
      if (runEnd <= offset) prefix.push(run);
      else if (runStart >= offset) suffix.push(run);
      else {
        const localOffset = offset - runStart;
        prefix.push({
          ...run,
          text: run.text.slice(0, localOffset),
        });
        suffix.push({
          ...run,
          text: run.text.slice(localOffset),
        });
      }
    },
  );
  return { prefix: normalizeWriterTextRuns(prefix), suffix: normalizeWriterTextRuns(suffix) };
}

/**
 * Reads direct attributes inherited by a collapsed Writer caret.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 caret offset from zero through visible text length.
 * @returns Attributes of the preceding character when present, otherwise following character, otherwise defaults.
 * @throws {Error} When offset is outside visible text bounds.
 */
export function getWriterTextAttributesAtOffset(
  runs: readonly WriterTextRun[],
  offset: number,
): WriterCharacterAttributes {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer character-format caret is outside the paragraph.");
  let consumed = 0;
  const run = normalized.find(
    /** Finds the run containing the character before the caret, or the following run at a paragraph start. @param candidate - Normalized source run. @returns True only for the inherited caret format run. */
    function containsCaret(candidate): boolean {
      const runStart = consumed;
      consumed += candidate.text.length;
      return (offset > runStart && offset <= consumed) || (offset === 0 && runStart === 0);
    },
  );
  return run?.attributes ?? DEFAULT_WRITER_CHARACTER_ATTRIBUTES;
}

/**
 * Owns one Writer paragraph's canonical text, paragraph items, format collection, and range hints.
 *
 * The `runs` property is intentionally a derived rendering/clipboard projection and is never stored.
 */
export class SwTextNode extends SwContentNode {
  private mText: string;
  private pSwpHints: SwpHints | undefined;

  /** Creates a text node in one Writer content section. @param nodes - Owning node array. @param id - Stable node identity. @param startOfSection - Containing section. @param formatColl - Registered paragraph style. @param text - Initial canonical text. @returns Nothing. */
  public constructor(
    nodes: SwNodes,
    id: string,
    startOfSection: SwStartNode,
    formatColl: SwTextFormatColl = nodes.GetDoc().GetDfltTextFormatColl(),
    text = "",
  ) {
    super(nodes, id, startOfSection, formatColl);
    this.mText = text;
  }

  /** Returns the canonical node text. @returns Canonical text. */
  public GetText(): string {
    return this.mText;
  }

  /** Exposes canonical text to existing read-only Writer view adapters. @returns Canonical text. */
  public get text(): string {
    return this.mText;
  }

  /** Returns text length in UTF-16 code units, matching Writer content indices. @returns UTF-16 length. */
  public Len(): number {
    return this.mText.length;
  }

  /** Returns the optional direct-format hint container. @returns Owned hints, when allocated. */
  public GetpSwpHints(): SwpHints | undefined {
    return this.pSwpHints;
  }

  /** Returns an existing hint container or creates it lazily. @returns Owned hints. */
  public GetOrCreateSwpHints(): SwpHints {
    this.pSwpHints ??= new SwpHints(this.GetDoc().GetAttrPool());
    return this.pSwpHints;
  }

  /** Returns the paragraph adjustment item as a view-friendly value. @returns Paragraph alignment. */
  public get alignment(): WriterParagraphAlignment {
    const adjust = (this.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust();
    return getWriterParagraphAlignment(adjust);
  }

  /** Returns a copy of the bounded numbering/list items. @returns Paragraph list items. */
  public get list(): WriterParagraphList {
    const ruleName = this.GetNumRuleName();
    if (ruleName.length === 0) {
      const listId = (this.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue();
      const level = this.GetAttrListLevel();
      return listId.length === 0
        ? { kind: "none", level }
        : { kind: "none", level, styleId: listId };
    }
    const rule = this.GetNumRule();
    if (rule === undefined) return createDefaultWriterParagraphList();
    const level = this.GetAttrListLevel();
    const builtIn =
      ruleName === DEFAULT_BULLET_RULE_NAME || ruleName === DEFAULT_NUMBERING_RULE_NAME;
    return builtIn
      ? { kind: rule.GetNumFormat(level).GetKind(), level }
      : { kind: rule.GetNumFormat(level).GetKind(), level, styleId: ruleName };
  }

  /** Returns the SwNumRuleItem value applied to this text node. @returns Rule name, or an empty string. */
  public GetNumRuleName(): string {
    return (this.GetAttr(RES_PARATR_NUMRULE) as SwNumRuleItem).GetValue();
  }

  /** Resolves the paragraph's SwNumRuleItem through the owning document table. @returns Document-owned rule, when valid. */
  public GetNumRule(): SwNumRule | undefined {
    const ruleName = this.GetNumRuleName();
    return ruleName.length === 0 ? undefined : this.GetDoc().FindNumRulePtr(ruleName);
  }

  /** Returns the zero-based RES_PARATR_LIST_LEVEL value. @returns List level. */
  public GetAttrListLevel(): number {
    return (this.GetAttr(RES_PARATR_LIST_LEVEL) as SfxInt16Item).GetValue();
  }

  /** Sets the bounded RES_PARATR_LIST_LEVEL value. @param level - Zero-based list level. @returns Nothing. */
  public SetAttrListLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`Writer list level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    if (level === 0) this.ResetAttr(RES_PARATR_LIST_LEVEL);
    else this.SetAttr(new SfxInt16Item(RES_PARATR_LIST_LEVEL, level));
  }

  /** Returns RES_PARATR_LIST_ID, falling back to the rule's default list id like Writer. @returns Effective list identity. */
  public GetListId(): string {
    const direct = (this.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue();
    return direct.length > 0 ? direct : (this.GetNumRule()?.GetDefaultListId() ?? "");
  }

  /** Sets or resets RES_PARATR_LIST_ID. @param listId - Direct list identity. @returns Nothing. */
  public SetListId(listId: string): void {
    if (listId.length === 0) this.ResetAttr(RES_PARATR_LIST_ID);
    else this.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, listId));
  }

  /** Sets or resets RES_PARATR_NUMRULE without changing list id or level. @param ruleName - Document rule name. @returns Nothing. */
  public SetNumRule(ruleName: string): void {
    if (ruleName.length === 0) this.ResetAttr(RES_PARATR_NUMRULE);
    else this.SetAttr(new SwNumRuleItem(ruleName));
  }

  /** Returns the paragraph's text format collection identity. @returns Paragraph style identity. */
  public get style(): WriterParagraphStyle {
    return this.GetTextFormatColl().id;
  }

  /** Derives complete rendering runs from canonical text and range hints. @returns Complete rendering projection. */
  public get runs(): readonly WriterTextRun[] {
    return this.pSwpHints === undefined
      ? new SwpHints(this.GetDoc().GetAttrPool()).toTextRuns(this.mText, this.GetSwAttrSet())
      : this.pSwpHints.toTextRuns(this.mText, this.GetSwAttrSet());
  }

  /** Sets the paragraph adjustment item. @param alignment - New paragraph alignment. @returns Nothing. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): void {
    this.SetAttr(new SvxAdjustItem(getSvxAdjust(alignment), RES_PARATR_ADJUST));
  }

  /** Sets the bounded numbering/list items. @param list - New list items. @returns Nothing. */
  public SetParagraphList(list: WriterParagraphList): void {
    const normalized = normalizeWriterParagraphList(list);
    if (normalized.kind === "none") {
      this.SetNumRule("");
      if (normalized.styleId === undefined) this.ResetAttr(RES_PARATR_LIST_ID);
      else this.SetListId(normalized.styleId);
      this.SetAttrListLevel(normalized.level);
      return;
    }
    let ruleName =
      normalized.styleId ??
      (normalized.kind === "bullet" ? DEFAULT_BULLET_RULE_NAME : DEFAULT_NUMBERING_RULE_NAME);
    const namedRule = this.GetDoc().FindNumRulePtr(ruleName);
    if (
      normalized.styleId !== undefined &&
      namedRule !== undefined &&
      namedRule.GetNumFormat(normalized.level).GetKind() !== normalized.kind
    )
      ruleName =
        normalized.kind === "bullet" ? DEFAULT_BULLET_RULE_NAME : DEFAULT_NUMBERING_RULE_NAME;
    const rule = this.GetDoc().EnsureNumRule(ruleName, normalized.kind, normalized.level);
    this.SetNumRule(rule.GetName());
    this.SetListId(rule.GetDefaultListId());
    this.SetAttrListLevel(normalized.level);
  }

  /** Inserts text and adjusts direct-format hints using effective caret attributes. @param text - Inserted text. @param offset - UTF-16 insertion offset. @param attributes - Direct attributes for inserted text. @param hyperlink - Optional inherited hyperlink. @returns Inserted text. */
  public InsertText(
    text: string,
    offset: number,
    attributes = this.getCharacterAttributesAt(offset),
    hyperlink = this.getHyperlinkAt(offset),
  ): string {
    if (text.length === 0) return text;
    const runs = insertWriterTextRun(this.runs, offset, text, attributes, hyperlink);
    this.mText = `${this.mText.slice(0, offset)}${text}${this.mText.slice(offset)}`;
    this.setHintsFromRuns(runs);
    this.UpdateContentIndices(offset, text.length);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return text;
  }

  /** Erases one bounded text range and adjusts all intersecting hints. @param start - Inclusive erase offset. @param count - Maximum erased length. @returns Nothing. */
  public EraseText(start: number, count = Number.MAX_SAFE_INTEGER): void {
    const end = Math.min(this.mText.length, start + count);
    this.assertRange(start, end);
    const removedLength = end - start;
    if (removedLength === 0) return;
    const prefix = splitWriterTextRuns(this.runs, start).prefix;
    const suffix = splitWriterTextRuns(this.runs, end).suffix;
    this.mText = `${this.mText.slice(0, start)}${this.mText.slice(end)}`;
    this.setHintsFromRuns([...prefix, ...suffix]);
    this.UpdateContentIndices(start, removedLength, SwContentIndexUpdateMode.Negative);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces one text range with caller-normalized direct-format runs. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @param replacementRuns - Replacement content. @returns Nothing. */
  public ReplaceRange(start: number, end: number, replacementRuns: unknown): void {
    this.assertRange(start, end);
    const prefix = splitWriterTextRuns(this.runs, start).prefix;
    const suffix = splitWriterTextRuns(this.runs, end).suffix;
    const replacement = normalizeWriterTextRuns(replacementRuns);
    const replacementText = getWriterTextFromRuns(replacement);
    const removedLength = end - start;
    this.mText = `${this.mText.slice(0, start)}${replacementText}${this.mText.slice(end)}`;
    this.setHintsFromRuns([...prefix, ...replacement, ...suffix]);
    if (removedLength > replacementText.length) {
      this.UpdateContentIndices(
        start + replacementText.length,
        removedLength - replacementText.length,
        SwContentIndexUpdateMode.Negative,
      );
    } else if (replacementText.length > removedLength) {
      this.UpdateContentIndices(
        start + removedLength,
        replacementText.length - removedLength,
        SwContentIndexUpdateMode.Replace,
      );
    }
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces the complete node text and clears direct character hints. @param text - New canonical text. @returns Nothing. */
  public SetText(text: string): void {
    const previousText = this.mText;
    const previousLength = previousText.length;
    this.mText = text;
    this.pSwpHints = undefined;
    if (previousLength > text.length)
      this.UpdateContentIndices(
        text.length,
        previousLength - text.length,
        SwContentIndexUpdateMode.Negative,
      );
    else if (text.length > previousLength)
      this.UpdateContentIndices(
        previousLength,
        text.length - previousLength,
        SwContentIndexUpdateMode.Replace,
      );
    if (previousText !== text)
      this.GetDoc().NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
  }

  /** Applies or removes one direct format over a non-empty range. @param start - Inclusive format start. @param end - Exclusive format end. @param format - Toggled direct property. @returns Nothing. */
  public ToggleTextRangeFormat(start: number, end: number, format: WriterCharacterFormat): void {
    this.assertRange(start, end);
    this.setTextRuns(toggleWriterTextRangeFormat(this.runs, start, end, format));
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Reads direct attributes inherited by a collapsed caret. @param offset - UTF-16 caret offset. @returns Effective direct attributes. */
  public getCharacterAttributesAt(offset: number): WriterCharacterAttributes {
    return this.pSwpHints === undefined
      ? new SwpHints(this.GetDoc().GetAttrPool()).getCharacterAttributes(
          this.mText,
          offset,
          this.GetSwAttrSet(),
        )
      : this.pSwpHints.getCharacterAttributes(this.mText, offset, this.GetSwAttrSet());
  }

  /** Reads the hyperlink inherited by a caret. @param offset - UTF-16 caret offset. @returns Hyperlink metadata or undefined. */
  public getHyperlinkAt(offset: number): WriterHyperlink | undefined {
    return this.pSwpHints?.getHyperlink(this.mText, offset);
  }

  /** Applies, replaces, or removes one hyperlink over a non-empty range. @param start - Inclusive range start. @param end - Exclusive range end. @param hyperlink - Replacement hyperlink or undefined to remove. @returns Nothing. */
  public SetHyperlink(start: number, end: number, hyperlink: WriterHyperlink | undefined): void {
    this.assertRange(start, end);
    if (start === end) return;
    const before = splitWriterTextRuns(this.runs, start);
    const selected = splitWriterTextRuns(before.suffix, end - start);
    const replacement = selected.prefix.map(
      /** Replaces hyperlink metadata without altering direct character formatting. @param run - Selected run. @returns Updated run. */
      (run): WriterTextRun => ({
        attributes: run.attributes,
        ...(hyperlink === undefined ? {} : { hyperlink }),
        text: run.text,
      }),
    );
    this.setTextRuns([...before.prefix, ...replacement, ...selected.suffix]);
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Splits this node at one content offset and returns an uninserted trailing sibling. @param offset - UTF-16 split offset. @param nextId - Trailing node identity. @returns Prepared trailing text node. */
  public SplitContent(offset: number, nextId: string): SwTextNode {
    if (nextId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
    this.assertRange(offset, offset);
    const split = splitWriterTextRuns(this.runs, offset);
    const trailing = new SwTextNode(
      this.GetNodes(),
      nextId,
      this.StartOfSectionNode(),
      this.GetTextFormatColl().GetNextTextFormatColl(),
      getWriterTextFromRuns(split.suffix),
    );
    const directAttributes = this.GetpSwAttrSet();
    if (directAttributes !== undefined) trailing.SetAttr(directAttributes);
    trailing.setHintsFromRuns(split.suffix);
    this.mText = getWriterTextFromRuns(split.prefix);
    this.setHintsFromRuns(split.prefix);
    this.MoveContentIndicesFrom(trailing, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return trailing;
  }

  /** Appends another text node's content while preserving its direct attributes. @param source - Appended text node. @returns Nothing. */
  public AppendTextNode(source: SwTextNode): void {
    if (source === this) throw new Error("SwTextNode cannot append itself.");
    if (source.GetNodes() !== this.GetNodes())
      throw new Error("Joined SwTextNodes belong to different documents.");
    const offset = this.Len();
    this.setTextRuns([...this.runs, ...source.runs]);
    source.MoveAllContentIndicesTo(this, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Creates an independent text node in another document graph. @param nodes - Destination node array. @returns Detached clone. */
  public CloneTo(nodes: SwNodes): SwTextNode {
    const clone = new SwTextNode(
      nodes,
      this.id,
      nodes.GetEndOfContent().StartOfSectionNode(),
      nodes.GetDoc().GetTextFormatColl(this.style),
    );
    const direct = this.GetpSwAttrSet();
    if (direct !== undefined) clone.SetAttr(direct);
    clone.ReplaceRange(0, 0, this.runs);
    return clone;
  }

  /** Replaces canonical text and derives hints from complete boundary runs. @param runs - Complete text runs. @returns Nothing. */
  private setTextRuns(runs: readonly WriterTextRun[]): void {
    const normalized = normalizeWriterTextRuns(runs);
    this.mText = getWriterTextFromRuns(normalized);
    this.setHintsFromRuns(normalized);
  }

  /** Stores only non-default range hints for complete text runs. @param runs - Complete text runs. @returns Nothing. */
  private setHintsFromRuns(runs: readonly WriterTextRun[]): void {
    const hints = new SwpHints(this.GetDoc().GetAttrPool());
    hints.setTextRuns(runs, this.GetSwAttrSet());
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
  }

  /** Validates a same-node UTF-16 range. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
  private assertRange(start: number, end: number): void {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      end > this.mText.length
    )
      throw new Error("Writer text range is outside the text node.");
  }
}

/** Checks a paragraph adjustment item read from storage or UI. @param value - Unknown runtime value. @returns True for a supported alignment. */
export function isWriterParagraphAlignment(value: unknown): value is WriterParagraphAlignment {
  return WRITER_PARAGRAPH_ALIGNMENTS.includes(value as WriterParagraphAlignment);
}

/** Converts a UI alignment to Writer's paragraph adjustment enum. @param alignment - Browser alignment. @returns SvxAdjust value. */
function getSvxAdjust(alignment: WriterParagraphAlignment): SvxAdjust {
  switch (alignment) {
    case "center":
      return SvxAdjust.Center;
    case "right":
      return SvxAdjust.Right;
    case "justify":
      return SvxAdjust.Block;
    default:
      return SvxAdjust.Left;
  }
}

/** Converts Writer's paragraph adjustment enum to the current browser projection. @param adjust - Effective SvxAdjust value. @returns Browser alignment. */
function getWriterParagraphAlignment(adjust: SvxAdjust): WriterParagraphAlignment {
  switch (adjust) {
    case SvxAdjust.Center:
      return "center";
    case SvxAdjust.Right:
    case SvxAdjust.ParaEnd:
    case SvxAdjust.End:
      return "right";
    case SvxAdjust.Block:
    case SvxAdjust.BlockLine:
      return "justify";
    default:
      return "left";
  }
}

/** Checks equality of two bounded Writer character attribute records. @param left - First attributes. @param right - Second attributes. @returns True only when every direct attribute matches. */
function areWriterCharacterAttributesEqual(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold &&
    left.fontFamily === right.fontFamily &&
    left.italic === right.italic &&
    left.underline === right.underline
  );
}

/** Checks whether an unknown value is a non-null record. @param value - Unknown runtime candidate. @returns True only for object records. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
