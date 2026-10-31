/** @fileoverview Original ImpEditEngine::CreateTextObject pool/flags member body from impedit4.cxx. It operates the actual engine and existing owners, without a second state object, provider or layout implementation. */
import type { ImpEditEngine } from "./impedit.lifecycle";
import { EditSelection } from "../../inc/EditSelection";
import type { ContentNode } from "../../inc/ContentNode";
import { GetAttrib } from "../../inc/editdoc";
import { DEF_METRIC } from "../../inc/editattr";
import { EditTextObjectImpl } from "./editobj.owner";
import { XParaPortion, XParaPortionList } from "./editobj";
import { TextPortion } from "../../inc/TextPortion";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
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
