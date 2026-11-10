/** @fileoverview Original ImpEditEngine::CreateTextObject pool/flags member body from impedit4.cxx. It operates the actual engine and existing owners, without a second state object, provider or layout implementation. */
import type { ImpEditEngine } from "./impedit.lifecycle";
import { EditSelection } from "../../inc/EditSelection";
import type { ContentNode } from "../../inc/ContentNode";
import { GetAttrib, MakeCharAttrib } from "../../inc/editdoc";
import { DEF_METRIC } from "../../inc/editattr";
import { EditTextObjectImpl } from "./editobj.owner";
import { XParaPortion, XParaPortionList, type EditTextObject } from "./editobj";
import { TextPortion } from "../../inc/TextPortion";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { EE_FEATURE_FIELD } from "../../inc/eeitem";
import { EditPaM } from "../../inc/EditPaM";
import type { ParaPortion } from "../../inc/ParagraphPortion";
import { ConvertAndPutItems, ConvertItem } from "./editdoc.metric";
import type { DocumentImpEditEngine } from "./impedit2.document";
import { ImpFastInsertParagraph, ImpFastInsertText } from "./impedit2.text";
/** Original private member-body extraction using the same actual source owner. All source conditions, copies, narrowing and exception cleanup are preserved. @param engine - Actual source engine receiver. @param source - Source by-value selection. @param pool - Actual destination pool or null. @param allowBig - Original default false. @param threshold - Original default zero. @returns Actual owned implementation, returned through the native base contract by the owner. */
export function CreateTextObject(
  engine: ImpEditEngine,
  source: EditSelection,
  pool: SfxItemPool | null,
  allowBig = false,
  threshold = 0,
): EditTextObjectImpl {
  const selection = new EditSelection(source);
  selection.Adjust(engine.GetEditDoc());
  const first = engine.GetEditDoc().GetPos(selection.Min().GetNode()),
    last = engine.GetEditDoc().GetPos(selection.Max().GetNode()),
    full = !(
      selection.Min().GetIndex() ||
      selection.Max().GetIndex() < (selection.Max().GetNode() as ContentNode).Len()
    ),
    metric = engine.GetEditDoc().GetItemPool().GetMetric(DEF_METRIC),
    result = new EditTextObjectImpl(
      pool,
      metric,
      engine.GetVertical(),
      engine.GetRotation(),
      engine.GetItemScriptType(selection),
    );
  let textPortions = 0;
  try {
    for (let paragraph = first; paragraph <= last; paragraph++) {
      const node = engine.GetEditDoc().GetObject(paragraph) as ContentNode;
      if (full)
        textPortions += engine.GetParaPortions().getRef(paragraph).GetTextPortions().Count();
      let start = 0,
        end = node.Len();
      const empty = end === 0;
      if (paragraph === first && !full) start = selection.Min().GetIndex();
      if (paragraph === last && !full) end = selection.Max().GetIndex();
      const content = result.CreateAndInsertContent();
      content.GetParaAttribs().Set(node.GetContentAttribs().GetItems());
      const style = node.GetStyleSheet();
      if (style) {
        content.SetStyle(style.GetName());
        content.SetFamily(style.GetFamily());
      }
      const value = node.Copy(start, end - start);
      try {
        content.SetText(value);
      } finally {
        value.dispose();
      }
      const output = content.GetCharAttribs(),
        attributes = node.GetCharAttribs().GetAttribs();
      let index = 0,
        attribute = GetAttrib(attributes, index);
      while (attribute) {
        if (empty || (attribute.GetEnd() > start && attribute.GetStart() < end)) {
          const copied = result.CreateAttrib(
            attribute.GetItem() as SfxPoolItem,
            attribute.GetStart(),
            attribute.GetEnd(),
          );
          if (paragraph === first && start !== 0) {
            copied.GetStart(true)[0] = copied.GetStart() > start ? copied.GetStart() - start : 0;
            copied.GetEnd(true)[0] = copied.GetEnd() - start;
          }
          if (paragraph === last && copied.GetEnd() > end - start)
            copied.GetEnd(true)[0] = end - start;
          if (copied.GetLen() || empty) output.push(copied);
        }
        attribute = GetAttrib(attributes, ++index);
      }
      const wrongs = node.GetWrongList();
      if (allowBig && full && wrongs) content.SetWrongList(wrongs.Clone());
    }
    if (
      allowBig &&
      full &&
      engine.IsFormatted() &&
      engine.IsUpdateLayout() &&
      textPortions >= threshold
    ) {
      const scales = engine.getScalingParameters(),
        cache = new XParaPortionList(
          engine.GetRefDevice(),
          engine.GetColumnWidth(engine.GetPaperSize()),
          scales.fFontX,
          scales.fFontY,
          scales.fSpacingX,
          scales.fSpacingY,
        );
      result.SetPortionInfo(cache);
      for (let paragraph = first; paragraph <= last; paragraph++) {
        const portion = engine.GetParaPortions().getRef(paragraph),
          copy = new XParaPortion();
        cache.push_back(copy);
        copy.nHeight = portion.GetHeight();
        copy.nFirstLineOffset = portion.GetFirstLineOffset();
        let count = portion.GetTextPortions().Count() & 0xffff;
        for (let index = 0; index < count; index++)
          copy.aTextPortions.Append(new TextPortion(portion.GetTextPortions().at(index)));
        count = portion.GetLines().Count() & 0xffff;
        for (let index = 0; index < count; index++)
          copy.aLines.Append(portion.GetLines().at(index).Clone());
      }
    }
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}

/** Original non-undoable replacement with an existing rich-text object in the document engine. @param engine - Actual owner. @param object - Borrowed original rich text. @returns Nothing. */
export function SetTextObject(engine: DocumentImpEditEngine, object: EditTextObject): void {
  engine.ResetUndoManager();
  const update = engine.IsUpdateLayout();
  const undo = engine.IsUndoEnabled();
  const empty = new OUString();
  try {
    engine.SetText(empty);
  } finally {
    empty.dispose();
  }
  const doc = engine.GetEditDoc();
  const start = doc.GetStartPaM();
  engine.SetUpdateLayout(false);
  engine.EnableUndo(false);
  InsertTextObject(engine, object as EditTextObjectImpl, start);
  const vertical = object.GetVertical();
  if (doc.IsEffectivelyVertical() !== vertical) {
    doc.SetVertical(vertical);
    doc.CreateDefFont(engine.GetStatus().UseCharAttribs());
  }
  const rotation = object.GetRotation();
  if (doc.GetRotation() !== rotation) {
    doc.SetRotation(rotation);
    doc.CreateDefFont(engine.GetStatus().UseCharAttribs());
  }
  engine.SetUpdateLayout(update);
  engine.EnableUndo(undo);
}

/** Original text-object insertion loop for a document editor without style pool or formatted portion cache. @param engine - Actual document editor. @param object - Concrete text object. @param start - Native insertion position. @returns Source inserted range. */
function InsertTextObject(
  engine: DocumentImpEditEngine,
  object: EditTextObjectImpl,
  start: EditPaM,
): EditSelection {
  const doc = engine.GetEditDoc();
  const pool = doc.GetItemPool();
  const contents = object.GetContents();
  const sourceUnit = object.GetMetric();
  const destinationUnit = pool.GetMetric(DEF_METRIC);
  const convert = object.HasMetric() && sourceUnit !== destinationUnit;
  const selection = new EditSelection(start);
  let position = new EditPaM(start);
  let paragraph = doc.GetPos(start.GetNode());
  for (const [index, content] of contents.entries()) {
    const newContent = (position.GetNode() as ContentNode).Len() === 0;
    const startPos = position.GetIndex();
    const value = content.GetText();
    try {
      position = ImpFastInsertText(engine, position, value);
      const node = position.GetNode() as ContentNode;
      const portion = engine.FindParaPortion(node) as ParaPortion;
      portion.MarkInvalid(startPos, value.getLength());

      const attributes = node.GetCharAttribs();
      const existing = attributes.GetAttribs().length !== 0;
      const source = content.GetCharAttribs();
      if (source.length !== 0) {
        let updateFields = false;
        for (const attribute of source) {
          if (attribute.GetEnd() > node.Len()) continue;
          const item = attribute.GetItem() as SfxPoolItem;
          const from = attribute.GetStart() + startPos;
          const to = attribute.GetEnd() + startPos;
          if (!existing || attribute.IsFeature()) {
            const actual = convert
              ? ConvertItem(item.Clone() as SfxPoolItem, sourceUnit, destinationUnit)
              : item;
            try {
              const next = MakeCharAttrib(pool, actual, from, to);
              if (!next) throw new Error("EditEngine requires a character attribute");
              attributes.InsertAttrib(next);
              if (next.Which() === EE_FEATURE_FIELD) updateFields = true;
            } finally {
              if (actual !== item) actual.Dispose();
            }
          } else doc.InsertAttrib(node, from, to, item);
        }
        if (updateFields) engine.UpdateFields();
        portion.MarkSelectionInvalid(startPos);
      }

      let hasParaAttributes = false;
      if (newContent || (index > 0 && index < contents.length - 1)) {
        const items = content.GetParaAttribs();
        hasParaAttributes = items.Count() !== 0;
        if (!convert) engine.SetParaAttribs(doc.GetPos(node), items);
        else {
          const local = new SfxItemSet(engine.GetEmptyItemSet());
          try {
            ConvertAndPutItems(local, items, sourceUnit, destinationUnit);
            engine.SetParaAttribs(doc.GetPos(node), local);
          } finally {
            local.Dispose();
          }
        }
      }
      if (!hasParaAttributes) {
        attributes.GetDefFont().assign(doc.GetDefFont());
        if (engine.GetStatus().UseCharAttribs()) node.CreateDefFont();
      }
      const wrongs = content.GetWrongList();
      if (newContent && engine.GetStatus().DoOnlineSpelling() && wrongs)
        node.SetWrongList(wrongs.Clone());
    } finally {
      value.dispose();
    }

    if (index < contents.length - 1)
      position = newContent
        ? ImpFastInsertParagraph(engine, paragraph + 1)
        : engine.ImpInsertParaBreak(position, false);
    paragraph++;
  }
  selection.Max().assign(position);
  return selection;
}
