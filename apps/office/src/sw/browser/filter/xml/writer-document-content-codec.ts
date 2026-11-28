/** @fileoverview Writer browser graph transport for text nodes and the native table section hierarchy. */
import {
  decodeIndexMarks,
  encodeIndexMarks,
  type WriterIndexMarkRecord,
} from "./writer-index-mark-codec";
import {
  decodeReferenceMarks,
  encodeReferenceMarks,
  type WriterReferenceMarkRecord,
} from "./writer-reference-mark-codec";
import {
  decodeReferenceFields,
  encodeReferenceFields,
  type WriterReferenceFieldRecord,
} from "./writer-reference-field-codec";
import {
  decodeDocInfoFields,
  encodeDocInfoFields,
  type WriterDocInfoFieldRecord,
} from "./writer-doc-info-field-codec";
import {
  decodeSequenceFields,
  encodeSequenceFields,
  type WriterSequenceFieldRecord,
} from "./writer-sequence-field-codec";
import {
  decodeVariableFields,
  encodeVariableFields,
  type WriterVariableFieldRecord,
} from "./writer-variable-field-codec";
import {
  decodeChoiceFields,
  encodeChoiceFields,
  type WriterChoiceFieldRecord,
} from "./writer-choice-field-codec";
import {
  decodeChapterFields,
  encodeChapterFields,
  type WriterChapterFieldRecord,
} from "./writer-chapter-field-codec";
import {
  decodePageNumberFields,
  encodePageNumberFields,
  type WriterPageNumberFieldRecord,
} from "./writer-page-number-field-codec";
import {
  decodeDocStatFields,
  encodeDocStatFields,
  type WriterDocStatFieldRecord,
} from "./writer-doc-stat-field-codec";
import {
  decodeDateTimeFields,
  encodeDateTimeFields,
  type WriterDateTimeFieldRecord,
} from "./writer-date-time-field-codec";
import {
  decodeLegacyAnnotations,
  type LegacyWriterAnnotationRecord,
} from "./writer-annotation-codec";
import {
  encodeCellInterop,
  restoreCellInterop,
  encodeTableInterop,
  restoreTableInterop,
  type WriterInteropProperty,
} from "./writer-table-interop-codec";
import {
  encodeTextHint,
  decodeTextHint,
  type WriterTextHintRecord,
} from "./writer-text-hint-codec";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { encodeNativeBoxItem, decodeNativeBoxItem } from "./writer-box-item-codec";
import type { BorderLineRecord } from "../../../../editeng/source/items/borderline";
import { importBoxProperties } from "../../../source/filter/xml/xmlimpit";

import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPosition } from "../../../source/core/crsr/pam";
import type { SwDoc } from "../../../source/core/doc/doc";
import { SwTableNode, type SwNode, type SwStartNode } from "../../../source/core/docnode/node";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import { SwSectionNode } from "../../../source/core/docnode/ndsect";
import { decodeSection, encodeSection, type WriterSectionRecord } from "./writer-section-codec";
import type { SwTable, SwTableBox, SwTableBoxFormat } from "../../../source/core/table/swtable";
import {
  encodeTableFormat,
  restoreTableGeometry,
  restoreTableSpacing,
  restoreTableFlow,
  encodeFrameDirection,
  encodeFrameBackground,
  restoreFrameBackground,
  decodeFrameDirection,
  type WriterTableFormatRecord,
  encodeRowFormat,
  decodeRowFormat,
  encodeFrameSize,
  decodeFrameSize,
  type WriterRowFormatRecord,
  type WriterFrameSizeRecord,
} from "./writer-table-item-codec";
import { isWriterParagraphStyle, type WriterParagraphStyle } from "../../../source/core/doc/fmtcol";
import { RES_BOX, WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwpHints } from "../../../source/core/txtnode/ndhints";
import { decodeSfxPoolItem, encodeSfxItemSet } from "./item-codec";
import {
  decodeBoxValue,
  encodeBoxValue,
  type WriterBoxValueRecord,
} from "./writer-table-value-codec";

/** Primitive graph record for one ordered text node. */
export interface WriterTextNodeRecord {
  readonly autoAttributes: readonly SfxPoolItemSnapshot[];
  readonly annotations?: readonly LegacyWriterAnnotationRecord[];
  readonly formatCollId: WriterParagraphStyle;
  readonly hints: readonly WriterTextHintRecord[];
  readonly indexMarks?: readonly WriterIndexMarkRecord[];
  readonly referenceMarks?: readonly WriterReferenceMarkRecord[];
  readonly referenceFields?: readonly WriterReferenceFieldRecord[];
  readonly docInfoFields?: readonly WriterDocInfoFieldRecord[];
  readonly sequenceFields?: readonly WriterSequenceFieldRecord[];
  readonly variableFields?: readonly WriterVariableFieldRecord[];
  readonly choiceFields?: readonly WriterChoiceFieldRecord[];
  readonly chapterFields?: readonly WriterChapterFieldRecord[];
  readonly pageNumberFields?: readonly WriterPageNumberFieldRecord[];
  readonly docStatFields?: readonly WriterDocStatFieldRecord[];
  readonly dateTimeFields?: readonly WriterDateTimeFieldRecord[];
  readonly listGeometryWins?: boolean;
  /** True only for the model's synthesized empty numbering item; absence keeps legacy explicit items distinct. */
  readonly emptyListStyle?: true;
  readonly softPageBreaks?: readonly number[];
  readonly text: string;
}

/** Table sections retain their own text nodes in body order. */
export interface WriterTableRecord {
  readonly name: string;
  readonly format: WriterTableFormatRecord;
  readonly interop?: readonly WriterInteropProperty[];
  readonly columnWidths: readonly number[];
  readonly softPageBreakRows: readonly number[];
  readonly rows: readonly Readonly<{
    format: WriterRowFormatRecord;
    background?: SfxPoolItemSnapshot | undefined;
    cells: readonly Readonly<{
      format: WriterBoxFormatRecord;
      paragraphs: readonly WriterTextNodeRecord[];
      tables?: readonly WriterTableRecord[];
      contentOrder?: readonly ("text" | "table")[];
      contentBlocks?: readonly WriterSectionBlock[];
      rowSpan?: number;
    }>[];
  }>[];
}

/** Direct block in an owned native text section. */
export type WriterSectionBlock =
  | { readonly text: WriterTextNodeRecord }
  | { readonly table: WriterTableRecord }
  | { readonly section: WriterSectionRecord; readonly content: readonly WriterSectionBlock[] };

/** Encodes a native text section in block order. @param document - Actual document. @param start - Existing section. @param owners - Ordered bookmark and anchor owners. @returns Cloneable section blocks. */
export function* encodeSectionBlocks(
  document: SwDoc,
  start: SwStartNode,
  owners?: SwTextNode[],
): Generator<void, WriterSectionBlock[]> {
  const blocks: WriterSectionBlock[] = [];
  for (const block of document.nodes.GetSectionBlocks(start)) {
    if (block instanceof SwSectionNode)
      blocks.push({
        section: encodeSection(block),
        content: yield* encodeSectionBlocks(document, block),
      });
    else if (block instanceof SwTableNode)
      blocks.push({ table: yield* encodeWriterTableSteps(document, block.GetTable()) });
    else blocks.push({ text: encodeTextNode(document, block) });
    yield;
  }
  if (owners)
    for (const owner of sectionTextNodes(document.nodes.GetSectionContent(start)))
      owners.push(owner);
  return blocks;
}

/** Restores blocks into an existing section with an initial native paragraph. @param document - Destination. @param start - Existing section. @param blocks - Browser record. @param owners - Ordered bookmark and anchor owners. @returns Completion. */
export function* decodeSectionBlocks(
  document: SwDoc,
  start: SwStartNode,
  blocks: readonly WriterSectionBlock[],
  owners?: SwTextNode[],
): Generator<void, void> {
  if (!Array.isArray(blocks)) throw new Error("Stored Writer section content is invalid.");
  const end = start.EndOfSectionNode();
  let first = document.nodes.at(start.GetIndex() + 1).GetTextNode();
  for (const block of blocks) {
    if (!block || typeof block !== "object")
      throw new Error("Stored Writer section block is invalid.");
    if ("text" in block) {
      decodeTextNode(
        document,
        first ?? document.nodes.MakeTextNode(end, document.GetDfltTextFormatColl()),
        block.text,
      );
      first = null;
    } else if ("table" in block) yield* decodeWriterTableSteps(document, block.table, first ?? end);
    else if ("section" in block) {
      const section = decodeSection(document, first ?? end, block.section);
      yield* decodeSectionBlocks(document, section, block.content);
    } else throw new Error("Stored Writer section block is invalid.");
    yield;
  }
  if (first !== null) document.nodes.RemoveNode(first.GetIndex(), 1, true);
  if (owners)
    for (const owner of sectionTextNodes(document.nodes.GetSectionContent(start)))
      owners.push(owner);
}

/** Primitive complete box item; legacy scalar alignment is accepted only at storage ingress. */
type WriterBoxFormatRecord = WriterBoxValueRecord & {
  readonly interop?: readonly WriterInteropProperty[];
  readonly frameDirection?: SfxPoolItemSnapshot | undefined;
  readonly background?: SfxPoolItemSnapshot | undefined;
  readonly frameSize?: WriterFrameSizeRecord | undefined;
  readonly box?:
    | Readonly<{
        which: number;
        lines: readonly (BorderLineRecord | null)[];
        distances: readonly number[];
        removeAdjacent: boolean;
      }>
    | undefined;
  readonly padding?: number | undefined;
  readonly border?: string | undefined;
  readonly vertOrient?:
    Readonly<{ position: number; orientation: number; relation: number }> | undefined;
  readonly verticalAlign?: "top" | "middle" | "bottom" | undefined;
};
/** Encodes the original cell format items at the browser boundary. @param cell - Actual cell. @returns Primitive format. */
function encodeBoxFormat(cell: SwTableBox): WriterBoxFormatRecord {
  const { vertOrient, box, frameSize } = cell.GetFormat();
  const interop = encodeCellInterop(cell.GetFrameFormat());
  return {
    ...(interop === undefined ? {} : { interop }),
    ...encodeBoxValue(cell),
    frameSize: encodeFrameSize(frameSize),
    frameDirection: encodeFrameDirection(cell.GetFrameFormat()),
    background: encodeFrameBackground(cell.GetFrameFormat()),
    box: box === undefined ? undefined : encodeNativeBoxItem(box),
    vertOrient:
      vertOrient === undefined
        ? undefined
        : {
            position: vertOrient.GetPos(),
            orientation: vertOrient.GetVertOrient(),
            relation: vertOrient.GetRelationOrient(),
          },
  };
}
/** Restores native item ownership from primitive or prior scalar storage. @param value - Primitive box record. @returns Native box format. */
function decodeBoxFormat(value: WriterBoxFormatRecord): SwTableBoxFormat {
  const { vertOrient, verticalAlign } = value;
  const format: SwTableBoxFormat = {
    box: decodeBoxItem(value),
    ...(value.frameSize === undefined ? {} : { frameSize: decodeFrameSize(value.frameSize) }),
  };
  if (vertOrient === undefined)
    return {
      ...format,
      ...(verticalAlign === undefined
        ? {}
        : {
            vertOrient: new SwFormatVertOrient(
              0,
              verticalAlign === "middle"
                ? VertOrientation.CENTER
                : verticalAlign === "bottom"
                  ? VertOrientation.BOTTOM
                  : VertOrientation.NONE,
            ),
          }),
    };
  if (
    !isRecord(vertOrient) ||
    [vertOrient.position, vertOrient.orientation, vertOrient.relation].some(
      /** Rejects malformed native fields at the untrusted graph boundary. @param field - Primitive value. @returns Whether invalid. */
      (field) => typeof field !== "number" || !Number.isFinite(field),
    ) ||
    !Number.isSafeInteger(vertOrient.position) ||
    !Number.isInteger(vertOrient.orientation) ||
    vertOrient.orientation < -32768 ||
    vertOrient.orientation > 32767 ||
    !Number.isInteger(vertOrient.relation) ||
    vertOrient.relation < -32768 ||
    vertOrient.relation > 32767
  )
    throw new Error("Stored Writer box orientation is invalid.");
  return {
    ...format,
    vertOrient: new SwFormatVertOrient(
      vertOrient.position,
      vertOrient.orientation,
      vertOrient.relation,
    ),
  };
}

/** Validates and restores primitive native box state; legacy CSS enters only here. @param value - Untrusted stored format. @returns Owned native box or absent. */
function decodeBoxItem(value: WriterBoxFormatRecord): SvxBoxItem | undefined {
  const record = value.box;
  if (record === undefined) {
    if (
      (value.padding !== undefined && !Number.isSafeInteger(value.padding)) ||
      (value.border !== undefined && typeof value.border !== "string")
    )
      throw new Error("Stored Writer legacy box is invalid.");
    return importBoxProperties({ padding: value.padding, border: value.border }, RES_BOX);
  }
  return decodeNativeBoxItem(record);
}

/** Encodes the actual table graph in native cell-content order. @param document - Native Writer document. @param table - Connected table. @returns Primitive table record. */
export function* encodeWriterTableSteps(
  document: SwDoc,
  table: SwTable,
): Generator<void, WriterTableRecord> {
  const rows: WriterTableRecord["rows"][number][] = [];
  for (const row of table.GetTabLines()) {
    const cells: WriterTableRecord["rows"][number]["cells"][number][] = [];
    for (const cell of row.GetTabBoxes()) {
      const start = cell.GetStartNode();
      const rowSpan = cell.getRowSpan();
      if (
        document.nodes.GetSectionBlocks(start).some(
          /** Detects a real named section inside the cell. @param block - Direct cell child. @returns Whether structural transport is needed. */
          (block) => block instanceof SwSectionNode,
        )
      ) {
        cells.push({
          format: encodeBoxFormat(cell),
          paragraphs: [],
          contentBlocks: yield* encodeSectionBlocks(document, start),
          ...(rowSpan === 1 ? {} : { rowSpan }),
        });
        yield;
        continue;
      }
      const paragraphs: WriterTextNodeRecord[] = [];
      const tables: WriterTableRecord[] = [];
      const contentOrder: ("text" | "table")[] = [];
      for (const node of cell.GetContentNodes()) {
        if (node instanceof SwTableNode) {
          tables.push(yield* encodeWriterTableSteps(document, node.GetTable()));
          contentOrder.push("table");
        } else {
          paragraphs.push(encodeTextNode(document, node));
          contentOrder.push("text");
        }
        yield;
      }
      cells.push({
        format: encodeBoxFormat(cell),
        paragraphs,
        ...(tables.length ? { tables, contentOrder } : {}),
        ...(rowSpan === 1 ? {} : { rowSpan }),
      });
      yield;
    }
    rows.push({
      format: encodeRowFormat(row.GetFormat()),
      background: encodeFrameBackground(row.GetFrameFormat()),
      cells,
    });
    yield;
  }
  const interop = encodeTableInterop(table.GetFrameFormat());
  return {
    name: table.GetName(),
    ...(interop === undefined ? {} : { interop }),
    format: encodeTableFormat(table),
    columnWidths: table.GetColumnWidths(),
    softPageBreakRows: table.GetSoftPageBreakRows(),
    rows,
  };
}

/** Encodes a canonical text node and its soft page hints. @param document - Native document. @param node - Actual paragraph. @returns Text graph record. */
export function encodeTextNode(document: SwDoc, node: SwTextNode): WriterTextNodeRecord {
  const direct = node.GetpSwAttrSet();
  const indexMarks = encodeIndexMarks(node);
  const referenceMarks = encodeReferenceMarks(node);
  const referenceFields = encodeReferenceFields(node);
  const docInfoFields = encodeDocInfoFields(node);
  const dateTimeFields = encodeDateTimeFields(node);
  const docStatFields = encodeDocStatFields(node);
  const sequenceFields = encodeSequenceFields(node);
  const variableFields = encodeVariableFields(node);
  const choiceFields = encodeChoiceFields(node);
  const chapterFields = encodeChapterFields(node);
  const pageNumberFields = encodePageNumberFields(node);
  return {
    ...(indexMarks.length ? { indexMarks } : {}),
    ...(referenceMarks.length ? { referenceMarks } : {}),
    ...(referenceFields.length ? { referenceFields } : {}),
    ...(docInfoFields.length ? { docInfoFields } : {}),
    ...(dateTimeFields.length ? { dateTimeFields } : {}),
    ...(docStatFields.length ? { docStatFields } : {}),
    ...(sequenceFields.length ? { sequenceFields } : {}),
    ...(variableFields.length ? { variableFields } : {}),
    ...(choiceFields.length ? { choiceFields } : {}),
    ...(chapterFields.length ? { chapterFields } : {}),
    ...(pageNumberFields.length ? { pageNumberFields } : {}),
    autoAttributes: direct === undefined ? [] : encodeSfxItemSet(direct),
    formatCollId: node.GetTextFormatColl().id,
    ...(node.DoesListGeometryWin() ? { listGeometryWins: true } : {}),
    ...(node.IsEmptyListStyleDueToSetOutlineLevelAttr() ? { emptyListStyle: true as const } : {}),
    ...(document
      .GetIDocumentMarkAccess()
      .GetSoftPageBreaks()
      .some(
        /** Selects hints on this node. @param position - Soft boundary. @returns Whether owned. */
        (position) => position.GetNode() === node,
      )
      ? {
          softPageBreaks: document
            .GetIDocumentMarkAccess()
            .GetSoftPageBreaks()
            .filter(
              /** Selects hints on this node. @param position - Soft boundary. @returns Whether owned. */
              (position) => position.GetNode() === node,
            )
            .map(
              /** Encodes a UTF-16 offset. @param position - Soft boundary. @returns Offset. */
              (position) => position.GetContentIndex(),
            ),
        }
      : {}),
    hints:
      node
        .GetpSwpHints()
        ?.entries()
        .map(
          /** Encodes one canonical ranged text attribute. @param hint - Writer hint. @returns Primitive hint record. */ (
            hint,
          ): WriterTextHintRecord => encodeTextHint(document, hint),
        ) ?? [],
    text: node.GetText(),
  };
}

/** Restores a text node already placed in its actual section. @param document - Native document. @param node - Connected paragraph. @param nodeRecord - Serialized attributes and text. @returns Nothing. */
export function decodeTextNode(
  document: SwDoc,
  node: SwTextNode,
  nodeRecord: WriterTextNodeRecord,
): void {
  if (
    !isWriterParagraphStyle(nodeRecord.formatCollId) &&
    document.FindTextFormatColl(nodeRecord.formatCollId) === undefined
  )
    throw new Error("Stored Writer paragraph style is invalid.");
  node.ChgFormatColl(document.GetTextFormatColl(nodeRecord.formatCollId), false);
  node.ResetAllAttr();
  node.SetListGeometryWins(nodeRecord.listGeometryWins === true);
  const direct = new SfxItemSet(document.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
  for (const item of nodeRecord.autoAttributes)
    direct.Put(decodeSfxPoolItem(document.GetAttrPool(), item));
  node.SetAttr(direct);
  if (nodeRecord.emptyListStyle === true) node.SetEmptyListStyleDueToSetOutlineLevelAttr();
  const hints = nodeRecord.hints.map(
    /** Restores one canonical text attribute. @param hint - Primitive hint record. @returns Writer hint. */ (
      hint,
    ) => {
      return decodeTextHint(document, hint);
    },
  );
  const position = new SwPosition(node, 0, "redline");
  try {
    document.GetDocumentContentOperationsManager().InsertTextFragment(position, {
      hints: new SwpHints(document.GetAttrPool(), hints),
      text: nodeRecord.text,
    });
  } finally {
    position.Dispose();
  }
  decodeIndexMarks(node, nodeRecord.indexMarks);
  decodeReferenceMarks(node, nodeRecord.referenceMarks);
  decodeReferenceFields(node, nodeRecord.referenceFields);
  decodeDocInfoFields(node, nodeRecord.docInfoFields);
  decodeDateTimeFields(node, nodeRecord.dateTimeFields);
  decodeDocStatFields(node, nodeRecord.docStatFields);
  decodeSequenceFields(node, nodeRecord.sequenceFields);
  decodeVariableFields(node, nodeRecord.variableFields);
  decodeChoiceFields(node, nodeRecord.choiceFields);
  decodeChapterFields(node, nodeRecord.chapterFields);
  decodePageNumberFields(node, nodeRecord.pageNumberFields);
  if (nodeRecord.annotations) decodeLegacyAnnotations(node, nodeRecord.annotations);
  node.AddToList();
  for (const offset of nodeRecord.softPageBreaks ?? [])
    document.GetIDocumentMarkAccess().AddSoftPageBreak(node, offset);
}

/** Decodes a table into its actual enclosing section. @param document - Native Writer document. @param tableRecord - Primitive table record. @param where - Optional direct section insertion boundary. @returns Completion. */
export function* decodeWriterTableSteps(
  document: SwDoc,
  tableRecord: WriterTableRecord,
  where?: SwNode,
): Generator<void, void> {
  const { nativeGeometry, nativeSpacing, nativeFlow, ...legacyFormat } = tableRecord.format;
  const table =
    where === undefined
      ? document.nodes.MakeTableNode(tableRecord.name, legacyFormat)
      : document.nodes.MakeTableNodeBefore(where, tableRecord.name, legacyFormat);
  restoreTableGeometry(table.GetFrameFormat(), nativeGeometry);
  restoreTableSpacing(table.GetFrameFormat(), nativeSpacing);
  restoreTableFlow(table.GetFrameFormat(), nativeFlow);
  if (tableRecord.interop !== undefined)
    restoreTableInterop(table.GetFrameFormat(), tableRecord.interop);
  for (const width of tableRecord.columnWidths) table.AddColumnWidth(width);
  for (const [rowIndex, rowRecord] of tableRecord.rows.entries()) {
    if (tableRecord.softPageBreakRows.includes(rowIndex)) table.AddSoftPageBreak();
    const row = document.nodes.AppendTableRow(
      table,
      rowRecord.cells.length,
      decodeRowFormat(rowRecord.format),
      rowRecord.cells.map(
        /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
          cell,
        ) => decodeBoxFormat(cell.format),
      ),
    );
    restoreFrameBackground(row.GetFrameFormat(), rowRecord.background);
    for (const [cellIndex, cellRecord] of rowRecord.cells.entries()) {
      const cell = row.GetTabBoxes()[cellIndex];
      if (
        cell === undefined ||
        (cellRecord.contentBlocks === undefined && cellRecord.paragraphs.length === 0)
      )
        throw new Error("Stored Writer table cell is invalid.");
      if (cellRecord.rowSpan !== undefined) {
        const span = cellRecord.rowSpan;
        if (!Number.isInteger(span) || span < -0x80000000 || span > 0x7fffffff)
          throw new Error("Stored Writer table cell row span is invalid.");
        cell.setRowSpan(span);
      }
      const frame = cell.GetFrameFormat(),
        direction = decodeFrameDirection(frame, cellRecord.format.frameDirection);
      if (direction !== undefined) frame.SetFormatAttr(direction);
      restoreFrameBackground(frame, cellRecord.format.background);
      if (cellRecord.format.interop !== undefined)
        restoreCellInterop(frame, cellRecord.format.interop);
      if (cellRecord.contentBlocks !== undefined) {
        yield* decodeSectionBlocks(document, cell.GetStartNode(), cellRecord.contentBlocks);
        decodeBoxValue(cell, cellRecord.format);
        continue;
      }
      const order =
        cellRecord.contentOrder ??
        cellRecord.paragraphs.map(
          /** Legacy flat cells contain text in paragraph order. @returns Text block kind. */ () =>
            "text" as const,
        );
      const end = cell.GetStartNode().EndOfSectionNode();
      let available = cell.GetParagraphs()[0];
      let textIndex = 0;
      let tableIndex = 0;
      for (const kind of order) {
        if (kind === "text") {
          const paragraph = cellRecord.paragraphs[textIndex++];
          if (!paragraph) throw new Error("Stored Writer table cell order is invalid.");
          decodeTextNode(
            document,
            available ?? document.nodes.AppendTableCellParagraph(cell),
            paragraph,
          );
          available = undefined;
        } else if (kind === "table") {
          const nested = cellRecord.tables?.[tableIndex++];
          if (!nested) throw new Error("Stored Writer table cell order is invalid.");
          yield* decodeWriterTableSteps(document, nested, available ?? end);
        } else throw new Error("Stored Writer table cell order is invalid.");
        yield;
      }
      if (
        textIndex !== cellRecord.paragraphs.length ||
        tableIndex !== (cellRecord.tables?.length ?? 0)
      )
        throw new Error("Stored Writer table cell order is invalid.");
      decodeBoxValue(cell, cellRecord.format);
    }
  }
  if (tableRecord.softPageBreakRows.includes(tableRecord.rows.length)) table.AddSoftPageBreak();
}

/** Lists canonical text nodes including table cell paragraphs in the section's native order. @param blocks - Direct section blocks. @returns Actual text node owners. */
export function sectionTextNodes(blocks: readonly (SwTextNode | SwTableNode)[]): SwTextNode[] {
  return blocks.flatMap(
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      block,
    ) =>
      block instanceof SwTableNode
        ? block
            .GetTable()
            .GetTabLines()
            .flatMap(
              /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                row,
              ) =>
                row
                  .GetTabBoxes()
                  .flatMap(
                    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                      cell,
                    ) => cell.GetParagraphs(),
                  ),
            )
        : [block],
  );
}

/** Checks for a non-array object. @param value - Candidate. @returns Whether a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
