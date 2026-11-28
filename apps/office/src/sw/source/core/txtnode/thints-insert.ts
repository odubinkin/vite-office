/** @fileoverview Original InsertHint/TryInsertHint decisions for the registered ranged and inline fly attributes from thints.cxx. */
import type { SwFormatRuby } from "./fmtatr2";
import type { SwTextNode } from "./ndtxt";
import type { SwpHints, TextNodeAttribute } from "./ndhints";
import { SwSetExpField } from "../fields/expfld";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { SwTextField, type SwTextOrdinaryField } from "../../../inc/txtfld";
import { SwTextTOXMark } from "./atrtox";
import { SwTextRefMark } from "./atrref";
import {
  CH_TXTATR_BREAKWORD,
  CH_TXTATR_INWORD,
  RES_TXTATR_ANNOTATION,
  RES_TXTATR_FIELD,
  RES_TXTATR_REFMARK,
  RES_TXTATR_TOXMARK,
} from "../../../inc/hintids";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwFlyFrameFormat } from "../layout/atrfrm";
import { SwTextCharFormat, SwTextINetFormat, SwTextRuby } from "./txtatr2";
import { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";
import type { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
import { BuildTextHintPortions, CheckCharacterHintSortNumber } from "./thints-portions";
import { MAX_HINTS } from "./thints-nesting";
import { SwUpdateAttr, UpdateAttrHint } from "../../../inc/hints";
/** Actual native ranged families represented by the kernel. */
type Hint = SwTextAttrEnd<
  SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat | SwFormatRuby
>;
/** Original hint destruction's represented SwClient-base cleanup. The owned pool item releases its shared automatic-style handle. @param hint - Unowned attribute. @returns Nothing. */
export function DestroyTextNodeAttribute(hint: TextNodeAttribute): void {
  if (hint instanceof SwTextINetFormat || hint instanceof SwTextRuby) hint.EndListeningAll();
  if (hint instanceof SwTextFlyCnt) {
    const format = hint.GetAttr().GetFrameFormat();
    hint.GetAttr().SetFlyFormat();
    if (format instanceof SwFlyFrameFormat)
      format.GetDoc().getIDocumentLayoutAccess().DelLayoutFormat(format);
  }
  if (hint instanceof SwTextTOXMark) hint.GetAttr().SetTextTOXMark(undefined);
  if (hint instanceof SwTextRefMark) hint.GetAttr().SetTextRefMark(undefined);
  hint.GetAttr().Dispose();
}
/** Original TryInsertHint branches; RSID/hidden fields, dummy/content hints and unrepresented nesting families are not fabricated. @param hints - Actual maps. @param hint - New owned-on-success attribute. @param node - Native node. @param mode - Original flags. @returns Native success, independently of whether merging retains the incoming identity. */
export function TryInsertTextNodeHint(
  hints: SwpHints,
  hint: Hint,
  node: SwTextNode,
  mode: SetAttrMode,
): boolean {
  if (MAX_HINTS <= BigInt(hints.Count())) {
    DestroyTextNodeAttribute(hint);
    return false;
  }
  if (hint instanceof SwTextCharFormat) hint.ChgTextNode(node);
  else if (hint instanceof SwTextINetFormat) hint.InitINetFormat(node);
  else if (hint instanceof SwTextRuby) hint.InitRuby(node);
  const families =
    hint.format instanceof SwFormatAutoFormat
      ? hint.format
          .GetStyleHandle()
          .entries()
          .map(
            /** Native CollectHasItems values. @param item - Direct value. @returns Which. */ (
              item,
            ) => item.Which(),
          )
      : [];
  if (mode & SetAttrMode.DONTEXPAND) hint.SetDontExpand(true);
  let start = hint.GetStart();
  if (hint.GetEnd() < start) {
    hint.SetStart(hint.GetEnd());
    hint.SetEnd(start);
    start = hint.GetStart();
  }
  const which = hint.Which();
  const end = hint.GetEnd(),
    noAdjust = (mode & SetAttrMode.NOHINTADJUST) !== 0;
  if (hint.IsNesting()) {
    if (!(hint instanceof SwTextINetFormat) && !(hint instanceof SwTextRuby))
      throw new Error("Writer structured nesting is not implemented.");
    if (!hints.TryInsertNesting(node, hint)) return false;
  } else if (!noAdjust && !hint.IsOverlapAllowedAttr() && !node.GetDoc().IsInXMLImport()) {
    BuildTextHintPortions(hints, node, hint, mode);
    if (start < end) hints.MergePortions(node);
  } else if (
    !noAdjust &&
    (hint instanceof SwTextCharFormat ||
      (hint.format instanceof SwFormatAutoFormat && node.GetDoc().IsInXMLImport()))
  ) {
    BuildTextHintPortions(hints, node, hint, mode);
  } else {
    if (hint instanceof SwTextCharFormat) CheckCharacterHintSortNumber(hints, hint);
    hints.Insert(hint);
    hints.NoteInHistory(hint, true);
  }
  if (node.HasWriterListeners()) {
    const update = new SwUpdateAttr(start, end, which, families);
    node.TriggerNodeUpdate(new UpdateAttrHint(update, update));
  } else
    node.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: node.GetNodes().indexOfOrUndefined(node),
    });
  return true;
}
/** Original node entrypoint for ranged attributes and inline fly points. @param node - Actual node. @param hint - Ownership transfers to insertion. @param mode - Original insertion flags. @returns Success. */
export function InsertTextNodeHint(
  node: SwTextNode,
  hint: TextNodeAttribute,
  mode: SetAttrMode,
): boolean {
  if (hint.GetStart() < 0 || hint.GetAnyEnd() > node.Len() || hint.GetStart() > node.Len())
    throw new Error("assert: Writer hint endpoint exceeds text length");
  if (hint instanceof SwTextRefMark || hint instanceof SwTextTOXMark) {
    if (hint instanceof SwTextRefMark && mode & SetAttrMode.DONTEXPAND) hint.SetDontExpand(true);
    if (hint.HasDummyChar()) return InsertPointHint(node, hint, mode);
    const hints = node.GetOrCreateSwpHints();
    if (MAX_HINTS <= BigInt(hints.Count())) {
      DestroyTextNodeAttribute(hint);
      return false;
    }
    if (hint instanceof SwTextRefMark && node.GetNodes().IsDocNodes()) {
      for (const previous of hints.GetReferenceMarks()) {
        const previousEnd = previous.GetEnd();
        if (
          previousEnd === undefined ||
          !hint.GetAttr().equals(previous.GetAttr()) ||
          previousEnd < hint.GetStart() ||
          hint.GetAnyEnd() < previous.GetStart()
        )
          continue;
        hint.SetStart(Math.min(hint.GetStart(), previous.GetStart()));
        hint.SetEnd(Math.max(hint.GetAnyEnd(), previousEnd));
        hints.DeleteAtPos(hints.GetIndexOf(previous));
        DestroyTextNodeAttribute(previous);
      }
    }
    hints.Insert(hint);
    node.TriggerNodeUpdate(
      new UpdateAttrHint(
        undefined,
        new SwUpdateAttr(hint.GetStart(), hint.GetAnyEnd(), hint.Which()),
      ),
    );
    return true;
  }
  if (!(hint instanceof SwTextAttrEnd)) return InsertPointHint(node, hint, mode);
  if (hint.HasDummyChar() || hint.HasContent())
    throw new Error("Writer structured InsertHint is not implemented.");
  return node.GetOrCreateSwpHints().TryInsertHint(hint, node, mode);
}

/** Applies the native point-hint insertion order, inserting its dummy before binding the owned point. @param node - Owning text node. @param hint - Detached point. @param mode - Native insertion flags. @returns Whether inserted. */
function InsertPointHint(
  node: SwTextNode,
  hint: SwTextFlyCnt | SwTextField | SwTextOrdinaryField | SwTextTOXMark | SwTextRefMark,
  mode: SetAttrMode,
): boolean {
  const format = hint instanceof SwTextFlyCnt ? hint.GetAttr().GetFrameFormat() : undefined;
  const owner =
    hint instanceof SwTextField
      ? hint.GetAttr().GetField().GetTyp().GetDoc()
      : hint instanceof SwTextTOXMark || hint instanceof SwTextRefMark
        ? node.GetDoc()
        : format?.GetDoc();
  if (
    hint.m_pHints ||
    owner !== node.GetDoc() ||
    (hint instanceof SwTextFlyCnt && !(format instanceof SwFlyFrameFormat))
  )
    throw new Error(
      hint instanceof SwTextFlyCnt
        ? "Writer inline hint requires a detached point and an owned fly format."
        : "Writer text hint requires a detached point in its owning document.",
    );
  const marker =
    hint instanceof SwTextFlyCnt || hint.Which() === RES_TXTATR_FIELD
      ? CH_TXTATR_BREAKWORD
      : CH_TXTATR_INWORD;
  const start = hint.GetStart();
  const existing = node.GetpSwpHints();
  const hasMarker = (mode & SetAttrMode.NOTXTATRCHR) !== 0;
  if (
    hasMarker &&
    (node.GetText().charAt(start) !== marker ||
      existing?.GetTextAttrForCharAt(start) ||
      existing?.GetTextAttrForCharAt(start, RES_TXTATR_FIELD) ||
      existing?.GetTextAttrForCharAt(start, RES_TXTATR_ANNOTATION) ||
      existing?.GetTextAttrForCharAt(start, RES_TXTATR_REFMARK) ||
      existing?.GetTextAttrForCharAt(start, RES_TXTATR_TOXMARK))
  )
    throw new Error("Writer inline hint requires an unclaimed dummy character.");
  if (MAX_HINTS <= BigInt(existing?.Count() ?? 0) || (!hasMarker && !node.GetSpaceLeft())) {
    if (hasMarker) node.EraseText(start, 1);
    DestroyTextNodeAttribute(hint);
    return false;
  }
  if (!hasMarker) {
    const flags =
      mode & SetAttrMode.NOHINTEXPAND
        ? SwInsertFlags.NOHINTEXPAND
        : mode & SetAttrMode.FORCEHINTEXPAND
          ? SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.EMPTYEXPAND
          : SwInsertFlags.EMPTYEXPAND;
    node.InsertText(marker, start, flags);
  }
  if (hint instanceof SwTextFlyCnt) hint.SetAnchor(node);
  node.GetOrCreateSwpHints().Insert(hint);
  if (hint instanceof SwTextField) {
    const field = hint.GetAttr().GetField();
    if (field instanceof SwSetExpField && field.IsSequenceField())
      field.GetTyp().SetSeqRefNo(field);
  }
  node.TriggerNodeUpdate(
    new UpdateAttrHint(undefined, new SwUpdateAttr(start, start, hint.Which())),
  );
  return true;
}
