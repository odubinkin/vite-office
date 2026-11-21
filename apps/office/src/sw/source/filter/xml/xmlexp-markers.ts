/** @fileoverview Projects Writer bookmark and annotation portions for ODF paragraph export. */
import type { XMLTextParagraphMarker } from "../../../../xmloff/source/text/txtparae";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import { Converter } from "../../../../sax/source/tools/converter";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { SwTextField } from "../../../inc/txtfld";
import { AnnotationMark } from "../../core/crsr/annotationmark";
import { SwBookmark } from "../../core/doc/docbm";
import type { SwTableNode } from "../../core/docnode/node";
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
  projectBlock: (
    node: SwTextNode | SwTableNode,
    anchored: XMLBoundWriterFrames,
  ) => XMLTextExportBlock,
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
  const value = hint.GetAttr().GetField().GetData();
  let date = "";
  if (value.dateTime.GetDay() !== 0) {
    const buffer = new OUStringBuffer();
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
  };
}
