/** @fileoverview Projects Writer bookmark and annotation portions for ODF paragraph export. */
import {
  EE_FEATURE_LINEBR,
  EE_FEATURE_START,
  EE_FEATURE_TAB,
  EE_PARA_JUST,
  EE_PARA_SBL,
  EE_PARA_TABS,
  EE_PARA_ULSPACE,
} from "../../../../editeng/inc/eeitem";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { Section } from "../../../../editeng/inc/section";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type {
  XMLTextParagraphMarker,
  XMLTextParagraphSource,
  XMLTextRunSource,
} from "../../../../xmloff/source/text/txtparae";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import { Converter } from "../../../../sax/source/tools/converter";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { RES_TXTATR_ANNOTATION, WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SwTextField } from "../../../inc/txtfld";
import { putAnnotationCharacterItems } from "../../core/fields/textapi";
import type { SwDoc } from "../../core/doc/doc";
import { getCharacterProperties } from "./xmlexp-character";
import {
  exportParagraphLineSpacing,
  exportParagraphTabStops,
  exportParagraphVerticalMargins,
} from "./xmlexpit";
import { getParagraphOdfStyleName } from "./xmlexp-style-names";
import { AnnotationMark } from "../../core/crsr/annotationmark";
import { SwBookmark } from "../../core/doc/docbm";
import type { SwSectionBlock } from "../../core/docnode/nodes";
import { getUserIndexProgrammaticName } from "../../core/unocore/unoidx";
import { TOXTypes } from "../../core/tox/tox";
import type { XMLIndexMarkProperties } from "../../../../xmloff/source/text/XMLIndexMarkImportContext";
import type { XMLIndexMarkExportMarker } from "../../../../xmloff/source/text/XMLIndexMarkExport";
import { compareHintsByEnd } from "../../core/txtnode/ndhints-range";
import type { SwTextTOXMark } from "../../core/txtnode/atrtox";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  compareParagraphMarkers,
  projectAnchoredTextFrames,
  type XMLBoundWriterFrames,
} from "./xmltextframe";

/** Projects all native paragraph markers in export order. @param node - Source node. @param anchored - Anchored frame projection. @param projectBlock - Frame body export callback. @returns ODF markers. */
export function projectParagraphMarkers(
  node: SwTextNode,
  anchored: XMLBoundWriterFrames | undefined,
  projectBlock: (node: SwSectionBlock, anchored: XMLBoundWriterFrames) => XMLTextExportBlock,
): XMLTextParagraphMarker[] {
  const marks = node.GetDoc().GetIDocumentMarkAccess();
  const frames = projectAnchoredTextFrames(node, anchored, projectBlock);
  const floatingOffsets = new Set<number>();
  for (const marker of frames)
    if (marker.kind === "frame" && marker.frame.anchor !== "as-char")
      floatingOffsets.add(marker.offset);
  const markers: XMLTextParagraphMarker[] = [
    ...frames,
    ...projectAnnotationMarkers(node),
    ...projectIndexMarks(node),
    ...node
      .GetDoc()
      .GetIDocumentRedlineAccess()
      .GetRedlineTable()
      .entries()
      .flatMap(
        /** Projects registered change boundaries in this text node. @param range - Native redline. @returns Local portions. */
        (range): XMLTextParagraphMarker[] => {
          const start = range.Start();
          const end = range.End();
          const id = `ct${range.GetId()}`;
          const expanded = start.compare(end) !== 0;
          const portions: XMLTextParagraphMarker[] = [];
          if (start.GetNode() === node)
            portions.push({
              kind: expanded ? "change-start" : "change",
              id,
              offset: start.GetContentIndex(),
            });
          if (expanded && end.GetNode() === node)
            portions.push({ kind: "change-end", id, offset: end.GetContentIndex() });
          return portions;
        },
      ),
    ...marks.GetAllMarks().flatMap(
      /** Projects bookmark endpoints on this paragraph. @param mark - Native bookmark. @returns Local ODF markers. */
      (mark): XMLTextParagraphMarker[] => {
        if (!(mark instanceof SwBookmark)) return [];
        const [start, end] = mark.GetMarkStartEnd();
        const name = mark.GetName();
        const offset = start.GetContentIndex();
        const collapsed = start.compare(end) === 0;
        const collapsedAroundFrame = collapsed && floatingOffsets.has(offset);
        const local: XMLTextParagraphMarker[] = [];
        if (start.GetNode() === node)
          local.push({
            kind: collapsed && !collapsedAroundFrame ? "bookmark" : "bookmark-start",
            name,
            offset,
            hidden: mark.IsHidden(),
            condition: mark.GetHideCondition(),
            collapsedAroundFrame,
          });
        if (end.GetNode() === node && (!collapsed || collapsedAroundFrame))
          local.push({
            kind: "bookmark-end",
            name,
            offset: end.GetContentIndex(),
            collapsedAroundFrame,
          });
        return local;
      },
    ),
    ...marks
      .GetSoftPageBreaks()
      .filter(
        /** Selects soft hints on this paragraph. @param position - Hint. @returns Whether owned. */
        (position) => position.GetNode() === node,
      )
      .map(
        /** Projects one soft hint. @param position - Hint. @returns Neutral marker. */
        (position) => ({
          kind: "soft-page-break" as const,
          offset: position.GetContentIndex(),
        }),
      ),
  ].sort(
    /** Orders portions in the source export phases. @param left - First portion. @param right - Second portion. @returns Portion order. */
    (left, right) => compareParagraphMarkers(left, right, floatingOffsets),
  );
  return markers;
}

/** Projects native index mark holds before character dummy consumption. @param node - Original paragraph. @returns Point and paired TOX portions. */
function projectIndexMarks(node: SwTextNode): XMLIndexMarkExportMarker[] {
  const hints = node.GetpSwpHints()?.GetIndexMarks();
  if (!hints?.length) return [];
  const document = node.GetDoc();
  const markers: XMLIndexMarkExportMarker[] = [];
  const ends = new Map<SwTextTOXMark, XMLIndexMarkExportMarker>();
  for (const [index, hint] of hints.entries()) {
    const item = hint.GetAttr();
    const type = item.type;
    if (!type) throw new Error("Writer index mark is missing its type.");
    const kind =
      type.type === TOXTypes.Index
        ? "alphabetical-index"
        : type.type === TOXTypes.User
          ? "user-index"
          : "toc";
    const mark: XMLIndexMarkProperties = {
      kind,
      alternativeText: item.alternativeText,
      indexName: kind === "user-index" ? getUserIndexProgrammaticName(document, type.name) : "",
      level: item.level,
      key1: item.primaryKey,
      key2: item.secondaryKey,
      key1Reading: item.primaryKeyReading,
      key2Reading: item.secondaryKeyReading,
      textReading: item.textReading,
      mainEntry: item.mainEntry,
    };
    const offset = hint.GetStart();
    const end = hint.GetEnd();
    if (end === undefined) markers.push({ kind: "index-mark", offset, mark });
    else {
      const id = `IMark${node.GetIndex()}_${index}`;
      markers.push({ kind: "index-mark-start", offset, id, mark });
      ends.set(hint, { kind: "index-mark-end", offset: end, id, family: kind });
    }
  }
  for (const hint of [...ends.keys()].sort(compareHintsByEnd)) {
    const end = ends.get(hint);
    if (end) markers.push(end);
  }
  return markers;
}

/** Projects comment starts and ends independently, including ranges spanning paragraphs. @param node - Current paragraph. @returns Annotation markers. */
function projectAnnotationMarkers(node: SwTextNode): XMLTextParagraphMarker[] {
  const access = node.GetDoc().GetIDocumentMarkAccess();
  const markers: XMLTextParagraphMarker[] = [];
  const hints = node.GetpSwpHints();
  if (hints)
    for (
      let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
      index < hints.Count();
      index++
    ) {
      const hint = hints.GetSortedByWhichAndStart(index);
      if (!(hint instanceof SwTextField)) break;
      const field = hint.GetAttr();
      if (access.GetAnnotationMark(field))
        markers.push({
          kind: "annotation-end",
          name: field.GetField().GetName(),
          offset: hint.GetStart(),
        });
      else markers.push(makeAnnotationStart(hint, hint.GetStart(), true));
    }
  for (const mark of access.GetAllMarks()) {
    if (!(mark instanceof AnnotationMark) || mark.GetMarkStart().GetNode() !== node) continue;
    const hint = mark.GetAnnotationFormatField().GetTextField();
    if (hint) markers.push(makeAnnotationStart(hint, mark.GetMarkStart().GetContentIndex(), false));
  }
  return markers;
}

/** Projects the original annotation value at its opening position. @param hint - Live field. @param offset - Paragraph coordinate. @param consumesMarker - Whether this is a point annotation. @returns ODF annotation portion. */
function makeAnnotationStart(
  hint: SwTextField,
  offset: number,
  consumesMarker: boolean,
): XMLTextParagraphMarker {
  const field = hint.GetAttr().GetField();
  const value = field.GetData();
  const paragraphs = projectAnnotationText(field.GetTextObject(), field.GetTyp().GetDoc());
  const buffer = new OUStringBuffer();
  let date: string;
  try {
    Converter.convertDateTime(buffer, value.dateTime.GetUNODateTime(), null, true);
    const lexical = buffer.makeStringAndClear();
    try {
      date = text(lexical);
    } finally {
      lexical.dispose();
    }
  } finally {
    buffer.dispose();
  }
  return {
    kind: "annotation",
    offset,
    consumesMarker,
    date,
    author: value.author,
    initials: value.initials,
    name: value.name,
    parentName: value.parentName ?? "",
    resolved: value.resolved ?? false,
    text: value.text,
    ...(paragraphs === undefined ? {} : { paragraphs }),
  };
}

/** Projects native EditEngine annotation paragraphs through the Writer text auto-style exporter. @param edit - Borrowed annotation snapshot. @param document - Writer style and item owner. @returns Annotation paragraphs when their native features are represented. */
function projectAnnotationText(
  edit: EditTextObject | undefined,
  document: SwDoc,
): XMLTextParagraphSource[] | undefined {
  if (!edit || edit.GetParagraphCount() === 0) return undefined;
  const sections: Section[] = [];
  edit.GetAllSections(sections);
  if (sections.length === 0) return undefined;
  const result: XMLTextParagraphSource[] = [];
  let sectionIndex = 0;
  for (let index = 0; index < edit.GetParagraphCount(); ++index) {
    const raw = edit.GetText(index);
    const nativeStyle = new OUString();
    let value: string;
    let style: string;
    try {
      value = text(raw);
      edit.GetStyleSheet(index, nativeStyle, [SfxStyleFamily.Para]);
      style = text(nativeStyle);
    } finally {
      raw.dispose();
      nativeStyle.dispose();
    }
    const paragraph = edit.GetParaAttribs(index);
    const runs: XMLTextRunSource[] = [];
    const base = new SfxItemSet(document.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    try {
      putAnnotationCharacterItems(base, paragraph.entries());
      const properties = getCharacterProperties(base, false);
      while (sections[sectionIndex]?.mnParagraph === index) {
        const section = sections[sectionIndex++] as Section;
        if (section.mnStart === section.mnEnd) continue;
        let content = value.slice(section.mnStart, section.mnEnd);
        for (const item of section.maAttributes) {
          const which = item.Which();
          if (which === EE_FEATURE_TAB) content = "\t";
          else if (which === EE_FEATURE_LINEBR) content = "\n";
          else if (which >= EE_FEATURE_START) return undefined;
        }
        const direct = new SfxItemSet(base);
        try {
          putAnnotationCharacterItems(direct, section.maAttributes);
          runs.push({ text: content, properties: getCharacterProperties(direct, false) ?? {} });
        } finally {
          direct.Dispose();
        }
      }
      const justify = paragraph.GetItemIfSet(EE_PARA_JUST, false);
      const native = justify instanceof SvxAdjustItem ? justify.GetAdjust() : undefined;
      const alignment = native === undefined ? undefined : annotationAlignment.get(native);
      const spacing = paragraph.GetItemIfSet(EE_PARA_ULSPACE, false);
      const line = paragraph.GetItemIfSet(EE_PARA_SBL, false);
      const tabs = paragraph.GetItemIfSet(EE_PARA_TABS, false);
      const paragraphProperties = {
        ...(spacing instanceof SvxULSpaceItem ? exportParagraphVerticalMargins(spacing) : {}),
        ...(line instanceof SvxLineSpacingItem ? exportParagraphLineSpacing(line) : {}),
        ...(tabs instanceof SvxTabStopItem
          ? { tabStopDetails: exportParagraphTabStops(tabs) }
          : {}),
      };
      const collection = style ? document.FindTextFormatColl(style) : undefined;
      result.push({
        style: collection ? style : "default",
        styleName: collection ? getParagraphOdfStyleName(document, style) : "",
        runs,
        ...(alignment === undefined ? {} : { alignment }),
        ...(Object.keys(paragraphProperties).length ? { paragraphProperties } : {}),
        ...(properties ? { properties, inheritedProperties: properties } : {}),
      });
    } finally {
      base.Dispose();
    }
  }
  return result;
}

/** Maps native edit paragraph alignment to the ODF paragraph style property. */
const annotationAlignment = new Map<SvxAdjust, NonNullable<XMLTextParagraphSource["alignment"]>>([
  [SvxAdjust.Left, "left"],
  [SvxAdjust.ParaStart, "left"],
  [SvxAdjust.Right, "right"],
  [SvxAdjust.ParaEnd, "right"],
  [SvxAdjust.Center, "center"],
  [SvxAdjust.Block, "justify"],
  [SvxAdjust.BlockLine, "justify"],
]);
