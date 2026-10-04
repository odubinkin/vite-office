/** @fileoverview Internal canonical Writer graph codec used behind boundary-specific envelopes. */

import {
  SvxNumType,
  createWriterNumFormat,
  getWriterNumFormatBullet,
  getWriterNumFormatKind,
  SwNumRule,
  SwNumRuleType,
} from "../../../source/core/doc/number";
import { Font } from "../../../../vcl/source/font/font";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPosition } from "../../../source/core/crsr/pam";
import { SwDoc, type WriterEmbeddedFont } from "../../../source/core/doc/doc";
import { SwTableNode } from "../../../source/core/docnode/node";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import type {
  SwTableBoxFormat,
  SwTableFormat,
  SwTableLineFormat,
} from "../../../source/core/table/swtable";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type { DefaultFontDevice } from "../../../source/core/doc/default-font";
import {
  isWriterParagraphStyle,
  SwTextFormatColl,
  type WriterParagraphStyle,
} from "../../../source/core/doc/fmtcol";
import type { WriterParagraphStyleGroup } from "../../../inc/poolfmt";
import type { WriterParagraphListKind } from "../../../source/core/doc/list";
import {
  RES_PARATR_OUTLINELEVEL,
  WRITER_CHARACTER_WHICH_RANGES,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwpHints } from "../../../source/core/txtnode/ndhints";
import { SwFormatINetFormat } from "../../../source/core/txtnode/fmtatr2";
import { SwFormatAutoFormat, SwTextAttr } from "../../../source/core/txtnode/txatbase";
import type { WriterPageDescriptorValue } from "../../../source/core/layout/pagedesc";
import type { DocumentSettingId } from "../../../source/core/doc/DocumentSettingManager";
import { decodeSfxItemSet, encodeSfxItemSet } from "./item-codec";

/** Primitive graph record for one numbering level. */
interface WriterNumberFormatRecord {
  readonly bulletFont: string;
  readonly bulletFontPresent?: boolean;
  readonly bulletGlyph?: number;
  readonly showSymbol?: boolean;
  readonly numberingType?: "arabic" | "char-special" | "none";
  readonly bulletChar?: string;
  readonly firstLineIndent: number;
  readonly indentAt: number;
  readonly includeUpperLevels: number;
  readonly kind: Exclude<WriterParagraphListKind, "none">;
  readonly labelFollowedBy: "listtab" | "nothing" | "space";
  readonly listTabPosition: number;
  readonly positionAndSpaceMode: "label-alignment" | "label-width-and-position";
  readonly absLSpace?: number;
  readonly firstLineOffset?: number;
  readonly charTextDistance?: number;
  readonly listFormat?: string;
  readonly prefix: string;
  readonly start: number;
  readonly suffix: string;
}

/** Native scalar rule state transported independently of copy-constructor policy. */
interface WriterNumberRuleScalarState {
  readonly continusNum: boolean;
  readonly absSpaces: boolean;
  readonly hidden: boolean;
  readonly countPhantoms: boolean;
  readonly usedByRedline: boolean;
  readonly poolFormatId: number;
  readonly poolHelpId: number;
  readonly poolHlpFileId: number;
}

/** Primitive graph record for one document numbering rule. */
interface WriterNumberRuleRecord {
  readonly scalarState?: WriterNumberRuleScalarState;
  readonly ruleType?: SwNumRuleType;
  readonly ownedLevels?: readonly boolean[];
  readonly defaultPositionAndSpaceMode?: "label-alignment" | "label-width-and-position";
  readonly automatic: boolean;
  readonly formats: readonly WriterNumberFormatRecord[];
  readonly listId: string;
  readonly name: string;
}

/** Primitive graph record for one paragraph-style collection. */
interface WriterStyleRecord {
  /** Actual collection assignment, distinct from its direct outline-level item; absent only in legacy graph v16 records. */
  readonly outlineAssignment?: boolean;
  readonly followId: WriterParagraphStyle;
  readonly group: WriterParagraphStyleGroup;
  readonly id: WriterParagraphStyle;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly name: string;
  readonly parentId?: WriterParagraphStyle;
  readonly poolId: number;
}

/** Primitive graph record for one ordered text node. */
interface WriterTextNodeRecord {
  readonly autoAttributes: readonly SfxPoolItemSnapshot[];
  readonly formatCollId: WriterParagraphStyle;
  readonly hints: readonly WriterTextHintRecord[];
  readonly listGeometryWins?: boolean;
  /** True only for the model's synthesized empty numbering item; absence keeps legacy explicit items distinct. */
  readonly emptyListStyle?: true;
  readonly softPageBreaks?: readonly number[];
  readonly text: string;
}

/** Table sections retain their own text nodes in body order. */
interface WriterTableRecord {
  readonly name: string;
  readonly format: SwTableFormat;
  readonly columnWidths: readonly number[];
  readonly softPageBreakRows: readonly number[];
  readonly rows: readonly Readonly<{
    format: SwTableLineFormat;
    cells: readonly Readonly<{
      format: SwTableBoxFormat;
      paragraphs: readonly WriterTextNodeRecord[];
    }>[];
  }>[];
}

/** Canonical ranged Writer attribute record; browser run projections never cross a boundary. */
type WriterTextHintRecord =
  | Readonly<{
      end: number;
      items: readonly SfxPoolItemSnapshot[];
      kind: "auto-format";
      start: number;
    }>
  | Readonly<{
      end: number;
      hyperlink: ReturnType<SwFormatINetFormat["GetHyperlink"]>;
      kind: "hyperlink";
      start: number;
    }>;

/** Internal graph record. Paragraph identity is array order, never a stored UI key. */
export interface WriterDocumentRecord {
  readonly bodyOrder?: readonly ("text" | "table")[];
  readonly tables?: readonly WriterTableRecord[];
  readonly bookmarks?: readonly Readonly<{ name: string; nodeIndex: number; offset: number }>[];
  readonly embeddedFonts?: readonly WriterEmbeddedFont[];
  readonly documentSettings: Readonly<Record<DocumentSettingId, boolean>>;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
  readonly locale: string;
  readonly numRules: readonly WriterNumberRuleRecord[];
  readonly pageDescriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
  }>[];
  readonly swModelVersion: 16;
  readonly textFormatCollections: readonly WriterStyleRecord[];
  readonly textNodes: readonly WriterTextNodeRecord[];
}

/** Encodes the model at the browser boundary. @param document - Canonical graph. @returns Current record. */
export function encodeWriterDocument(document: SwDoc): WriterDocumentRecord {
  return {
    embeddedFonts: document.GetEmbeddedFonts(),
    bookmarks: document
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .map(
        /** Encodes one live collapsed Writer mark. @param mark - Mark. @returns Primitive position. */
        (mark) => ({
          name: mark.GetName(),
          nodeIndex: allTextNodes(document).indexOf(mark.GetPosition().GetNode() as SwTextNode),
          offset: mark.GetPosition().GetContentIndex(),
        }),
      ),
    documentSettings: document.GetDocumentSettingManager().GetValues(),
    lineNumberInfo: document.GetLineNumberInfo().QueryValue(),
    locale: document.GetLocale(),
    numRules: document.GetNumRuleTable().map(
      /** Encodes one document rule. @param rule - Model rule. @returns Primitive rule record. */ (
        rule,
      ) => ({
        scalarState: {
          continusNum: rule.IsContinusNum(),
          absSpaces: rule.IsAbsSpaces(),
          hidden: rule.IsHidden(),
          countPhantoms: rule.IsCountPhantoms(),
          usedByRedline: rule.IsUsedByRedline(),
          poolFormatId: rule.GetPoolFormatId(),
          poolHelpId: rule.GetPoolHelpId(),
          poolHlpFileId: rule.GetPoolHlpFileId(),
        },
        automatic: rule.IsAutoRule(),
        defaultPositionAndSpaceMode: rule.GetDefaultNumberFormatPositionAndSpaceMode(),
        ownedLevels: Array.from(
          { length: 10 },
          /** Retains native optional level ownership. @param _unused - Placeholder. @param level - Level. @returns Presence. */
          (_unused, level) => rule.GetNumFormat(level) !== undefined,
        ),
        ...(rule.GetRuleType() === SwNumRuleType.NUM_RULE ? {} : { ruleType: rule.GetRuleType() }),
        formats: Array.from(
          { length: 10 },
          /** Encodes one rule level. @param _unused - Array placeholder. @param level - Numbering level. @returns Primitive level record. */ (
            _,
            level,
          ) => {
            const format = rule.Get(level);
            return {
              ...format.GetPositionProperties(),
              bulletFont: format.GetBulletFont()?.GetFamilyName() ?? "",
              numberingType:
                format.GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE
                  ? "none"
                  : format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL
                    ? "char-special"
                    : "arabic",
              bulletFontPresent: format.GetBulletFont() !== undefined,
              bulletGlyph: format.GetBulletChar(),
              showSymbol: format.IsShowSymbol(),
              bulletChar:
                format.GetBulletChar() <= 0x10ffff ? getWriterNumFormatBullet(format) : "",
              firstLineIndent: format.GetFirstLineIndent(),
              indentAt: format.GetIndentAt(),
              includeUpperLevels: format.GetIncludeUpperLevels(),
              ...(format.HasListFormat() ? { listFormat: format.GetListFormat() } : {}),
              kind: getWriterNumFormatKind(format),
              labelFollowedBy: format.GetLabelFollowedBy(),
              listTabPosition: format.GetListtabPos(),
              positionAndSpaceMode: format.GetPositionAndSpaceMode(),
              prefix: format.GetPrefix(),
              start: format.GetStart(),
              suffix: format.GetSuffix(),
            };
          },
        ),
        listId: rule.GetDefaultListId(),
        name: rule.GetName(),
      }),
    ),
    pageDescriptors: Array.from(
      { length: document.GetPageDescCnt() },
      /** Encodes one stable descriptor identity and its follow link. @param _unused - Array placeholder. @param index - Collection position. @returns Descriptor record. */ (
        _,
        index,
      ) => {
        const descriptor = document.GetPageDesc(index);
        return {
          followName: descriptor.GetFollow().GetName(),
          value: descriptor.GetValue(),
        };
      },
    ),
    swModelVersion: 16,
    textFormatCollections: document.GetTextFormatColls().map(
      /** Encodes one paragraph collection. @param collection - Model collection. @returns Primitive style record. */ (
        collection,
      ) => {
        const parent = collection.DerivedFrom();
        return {
          followId: collection.GetNextTextFormatColl().id,
          group: collection.group,
          id: collection.id,
          items: encodeSfxItemSet(collection.GetAttrSet()),
          outlineAssignment: collection.IsAssignedToListLevelOfOutlineStyle(),
          name: collection.GetName(),
          ...(parent instanceof SwTextFormatColl ? { parentId: parent.id } : {}),
          poolId: collection.poolId,
        };
      },
    ),
    bodyOrder: document.nodes
      .getBodyContent()
      .map(
        /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
          node,
        ) => (node instanceof SwTableNode ? "table" : "text"),
      ),
    tables: document.GetTables().map(
      /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
        table,
      ) => ({
        name: table.GetName(),
        format: table.GetFormat(),
        columnWidths: table.GetColumnWidths(),
        softPageBreakRows: table.GetSoftPageBreakRows(),
        rows: table.GetTabLines().map(
          /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
            row,
          ) => ({
            format: row.GetFormat(),
            cells: row.GetTabBoxes().map(
              /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                cell,
              ) => ({
                format: cell.GetFormat(),
                paragraphs: cell
                  .GetParagraphs()
                  .map(
                    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                      node,
                    ) => encodeTextNode(document, node),
                  ),
              }),
            ),
          }),
        ),
      }),
    ),
    textNodes: document.paragraphs.map(
      /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
        node,
      ) => encodeTextNode(document, node),
    ),
  };
}

/** Encodes one canonical text node, including its own soft page hints. */
/** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ function encodeTextNode(
  document: SwDoc,
  node: SwTextNode,
): WriterTextNodeRecord {
  const direct = node.GetpSwAttrSet();
  return {
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
          ): WriterTextHintRecord =>
            hint.format instanceof SwFormatAutoFormat
              ? {
                  end: hint.end,
                  items: encodeSfxItemSet(hint.format.GetStyleHandle()),
                  kind: "auto-format",
                  start: hint.start,
                }
              : {
                  end: hint.end,
                  hyperlink: hint.format.GetHyperlink(),
                  kind: "hyperlink",
                  start: hint.start,
                },
        ) ?? [],
    text: node.GetText(),
  };
}

/** Decodes only the current schema; legacy records are intentionally unsupported. @param candidate - Stored value. @param defaultFontDevice - Current output device. @returns Canonical graph. */
export function decodeWriterDocument(
  candidate: unknown,
  defaultFontDevice?: DefaultFontDevice,
): SwDoc {
  if (
    !isRecord(candidate) ||
    candidate.swModelVersion !== 16 ||
    !isRecord(candidate.documentSettings) ||
    typeof candidate.locale !== "string" ||
    candidate.locale.length === 0 ||
    !Array.isArray(candidate.numRules) ||
    !Array.isArray(candidate.pageDescriptors) ||
    candidate.pageDescriptors.length === 0 ||
    !Array.isArray(candidate.textFormatCollections) ||
    !Array.isArray(candidate.textNodes)
  )
    throw new Error("Stored Writer document schema is unsupported.");
  const record = candidate as unknown as WriterDocumentRecord;
  const document = new SwDoc({
    createInitialTextNode: false,
    ...(defaultFontDevice === undefined ? {} : { defaultFontDevice }),
    locale: record.locale,
  });
  for (const font of record.embeddedFonts ?? []) {
    if (
      typeof font.path !== "string" ||
      typeof font.faceName !== "string" ||
      typeof font.familyName !== "string" ||
      typeof font.format !== "string" ||
      (font.bytes !== undefined && !(font.bytes instanceof Uint8Array))
    )
      throw new Error("Stored Writer embedded font is invalid.");
    document.RegisterEmbeddedFont(font);
    if (font.bytes !== undefined)
      document.SetEmbeddedFontBytes(font.path, font.bytes, font.canLoad === true);
  }
  if (record.lineNumberInfo !== undefined)
    document.SetLineNumberInfo(SwLineNumberInfo.FromValue(record.lineNumberInfo));
  const firstPageDescriptor = record.pageDescriptors[0];
  if (
    firstPageDescriptor === undefined ||
    !isRecord(firstPageDescriptor) ||
    !isRecord(firstPageDescriptor.value) ||
    typeof firstPageDescriptor.followName !== "string" ||
    firstPageDescriptor.value.name !== "Standard"
  )
    throw new Error("Stored Writer page descriptor collection is invalid.");
  document.ChgPageDesc(firstPageDescriptor.value);
  for (const descriptorRecord of record.pageDescriptors.slice(1)) {
    if (
      !isRecord(descriptorRecord) ||
      !isRecord(descriptorRecord.value) ||
      typeof descriptorRecord.followName !== "string"
    )
      throw new Error("Stored Writer page descriptor collection is invalid.");
    document.MakePageDesc(descriptorRecord.value.name);
    document.ChgPageDesc(descriptorRecord.value, descriptorRecord.value.name);
  }
  for (const descriptorRecord of record.pageDescriptors) {
    const descriptor = document.FindPageDesc(descriptorRecord.value.name);
    const follow = document.FindPageDesc(descriptorRecord.followName);
    if (descriptor === undefined || follow === undefined)
      throw new Error("Stored Writer page descriptor follow link is invalid.");
    descriptor.SetFollow(follow);
  }
  document.GetDocumentSettingManager().SetValues(record.documentSettings);
  if (record.textFormatCollections[0]?.id !== "default")
    throw new Error("Stored Writer style is invalid.");
  for (const style of record.textFormatCollections) {
    if (typeof style.id !== "string" || style.id.length === 0)
      throw new Error("Stored Writer style is invalid.");
    if (!isWriterParagraphStyle(style.id))
      document.MakeTextFormatColl(style.name, undefined, style.id);
  }
  for (const style of record.textFormatCollections) {
    const collection = document.GetTextFormatColl(style.id);
    const factoryOutlineLevel = collection.GetAttrOutlineLevel();
    const factoryAssignment = collection.IsAssignedToListLevelOfOutlineStyle();
    if (style.outlineAssignment !== undefined && typeof style.outlineAssignment !== "boolean")
      throw new Error("Stored Writer outline assignment is invalid.");
    if (style.outlineAssignment === false) collection.DeleteAssignmentToListLevelOfOutlineStyle();
    else if (style.outlineAssignment === true && !factoryAssignment)
      collection.AssignToListLevelOfOutlineStyle(0);
    collection.SetFormatName(style.name);
    collection.ResetAllFormatAttr();
    decodeSfxItemSet(collection.GetAttrSet(), style.items);
    if (
      style.outlineAssignment === undefined &&
      factoryAssignment &&
      !style.items.some(
        /** Detects the source-owned outline item already retained by the legacy graph. @param item - Stored item. @returns Whether outline. */
        (item) => item.which === RES_PARATR_OUTLINELEVEL,
      )
    )
      collection.SetAttrOutlineLevel(factoryOutlineLevel);
  }
  for (const style of record.textFormatCollections) {
    const collection = document.GetTextFormatColl(style.id);
    collection.SetNextTextFormatColl(document.GetTextFormatColl(style.followId));
    collection.SetDerivedFrom(
      style.parentId === undefined ? undefined : document.GetTextFormatColl(style.parentId),
    );
  }
  for (const rule of record.numRules) {
    if (
      rule.ruleType !== undefined &&
      rule.ruleType !== SwNumRuleType.NUM_RULE &&
      rule.ruleType !== SwNumRuleType.OUTLINE_RULE
    )
      throw new Error("Stored Writer numbering rule type is invalid.");
    if (
      rule.formats.length !== 10 ||
      (rule.ownedLevels !== undefined &&
        (rule.ownedLevels.length !== 10 ||
          rule.ownedLevels.some(
            /** Rejects malformed presence bits. @param owned - Candidate. @returns Invalidity. */
            (owned) => typeof owned !== "boolean",
          )))
    )
      throw new Error("Stored Writer numbering ownership is invalid.");
    const mode = rule.defaultPositionAndSpaceMode ?? "label-alignment";
    if (mode !== "label-alignment" && mode !== "label-width-and-position")
      throw new Error("Stored Writer numbering default mode is invalid.");
    const restoredRule = new SwNumRule(rule.name, mode, rule.ruleType ?? SwNumRuleType.NUM_RULE);
    restoredRule.SetDefaultListId(rule.listId);
    restoredRule.SetAutoRule(rule.automatic);
    for (let level = 0; level < 10; level++) {
      const format = rule.formats[level] as WriterNumberFormatRecord;
      if (
        format.numberingType !== undefined &&
        !["arabic", "char-special", "none"].includes(format.numberingType)
      )
        throw new Error("Stored Writer numbering format type is invalid.");
      if (
        (format.bulletFontPresent !== undefined && typeof format.bulletFontPresent !== "boolean") ||
        (format.showSymbol !== undefined && typeof format.showSymbol !== "boolean") ||
        (format.bulletGlyph !== undefined &&
          (!Number.isInteger(format.bulletGlyph) ||
            format.bulletGlyph < 0 ||
            format.bulletGlyph > 0xffffffff))
      )
        throw new Error("Stored Writer numbering marker ownership is invalid.");
      const decoded = createWriterNumFormat(format.kind, format.bulletChar, {
        absLSpace: format.absLSpace ?? 0,
        firstLineOffset: format.firstLineOffset ?? 0,
        charTextDistance: format.charTextDistance ?? 0,
        bulletFont: format.bulletFont,
        ...(format.numberingType === undefined ? {} : { numberingType: format.numberingType }),
        firstLineIndent: format.firstLineIndent,
        indentAt: format.indentAt,
        includeUpperLevels: format.includeUpperLevels,
        labelFollowedBy: format.labelFollowedBy,
        listTabPosition: format.listTabPosition,
        positionAndSpaceMode: format.positionAndSpaceMode,
        ...(format.listFormat === undefined ? {} : { listFormat: format.listFormat }),
        prefix: format.prefix,
        start: format.start,
        suffix: format.suffix,
      });
      if (format.bulletGlyph !== undefined) decoded.SetBulletChar(format.bulletGlyph);
      if (format.showSymbol !== undefined) decoded.SetShowSymbol(format.showSymbol);
      if (format.bulletFontPresent === true) {
        const font = new Font();
        font.SetFamilyName(format.bulletFont);
        decoded.SetBulletFont(font);
      } else if (format.bulletFontPresent === false) decoded.SetBulletFont(undefined);
      if (rule.ownedLevels === undefined || rule.ownedLevels[level])
        restoredRule.Set(level, decoded);
    }
    const owner = document.AddNumRule(restoredRule);
    const scalar = rule.scalarState;
    if (scalar !== undefined) {
      if (
        scalar === null ||
        typeof scalar !== "object" ||
        [
          scalar.continusNum,
          scalar.absSpaces,
          scalar.hidden,
          scalar.countPhantoms,
          scalar.usedByRedline,
        ].some(
          /** Rejects malformed native boolean state. @param value - Candidate. @returns Invalidity. */
          (value) => typeof value !== "boolean",
        ) ||
        [scalar.poolFormatId, scalar.poolHelpId, scalar.poolHlpFileId].some(
          /** Enforces native unsigned fields before restoring their narrowed setters. @param value - Candidate. @param index - Field. @returns Invalidity. */
          (value, index) =>
            !Number.isInteger(value) || value < 0 || value > (index === 2 ? 255 : 65535),
        )
      )
        throw new Error("Stored Writer numbering scalar state is invalid.");
      owner.SetContinusNum(scalar.continusNum);
      owner.SetAbsSpaces(scalar.absSpaces);
      owner.SetHidden(scalar.hidden);
      owner.SetCountPhantoms(scalar.countPhantoms);
      owner.SetUsedByRedline(scalar.usedByRedline);
      owner.SetPoolFormatId(scalar.poolFormatId);
      owner.SetPoolHelpId(scalar.poolHelpId);
      owner.SetPoolHlpFileId(scalar.poolHlpFileId);
    }
  }
  if (record.textNodes.length === 0)
    throw new Error("Stored Writer document has no body text node.");
  const order =
    record.bodyOrder ??
    record.textNodes.map(
      /** Handles the browser table interaction.  @returns Callback result. */ () =>
        "text" as const,
    );
  let textIndex = 0;
  let tableIndex = 0;
  for (const kind of order) {
    if (kind === "text") {
      const nodeRecord = record.textNodes[textIndex++];
      if (nodeRecord === undefined) throw new Error("Stored Writer body order is invalid.");
      decodeTextNode(document, document.nodes.MakeTextNode(), nodeRecord);
      continue;
    }
    const tableRecord = record.tables?.[tableIndex++];
    if (tableRecord === undefined) throw new Error("Stored Writer table order is invalid.");
    const table = document.nodes.MakeTableNode(tableRecord.name, tableRecord.format);
    for (const width of tableRecord.columnWidths) table.AddColumnWidth(width);
    for (const [rowIndex, rowRecord] of tableRecord.rows.entries()) {
      if (tableRecord.softPageBreakRows.includes(rowIndex)) table.AddSoftPageBreak();
      const row = document.nodes.AppendTableRow(
        table,
        rowRecord.cells.length,
        rowRecord.format,
        rowRecord.cells.map(
          /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
            cell,
          ) => cell.format,
        ),
      );
      for (const [cellIndex, cellRecord] of rowRecord.cells.entries()) {
        const cell = row.GetTabBoxes()[cellIndex];
        if (cell === undefined || cellRecord.paragraphs.length === 0)
          throw new Error("Stored Writer table cell is invalid.");
        for (const [paragraphIndex, paragraphRecord] of cellRecord.paragraphs.entries()) {
          const node =
            paragraphIndex === 0
              ? cell.GetParagraphs()[0]
              : document.nodes.AppendTableCellParagraph(cell);
          decodeTextNode(document, node as SwTextNode, paragraphRecord);
        }
      }
    }
    if (tableRecord.softPageBreakRows.includes(tableRecord.rows.length)) table.AddSoftPageBreak();
  }
  if (textIndex !== record.textNodes.length || tableIndex !== (record.tables?.length ?? 0))
    throw new Error("Stored Writer body order is invalid.");
  if (record.bookmarks !== undefined) {
    if (!Array.isArray(record.bookmarks)) throw new Error("Stored Writer bookmarks are invalid.");
    for (const mark of record.bookmarks) {
      const node = allTextNodes(document)[mark.nodeIndex];
      if (node === undefined) throw new Error("Stored Writer bookmark position is invalid.");
      document.GetIDocumentMarkAccess().MakeMark(node, mark.offset, mark.name);
    }
  }
  return document;
}

/** Restores one text node already placed in the correct body or table section. */
/** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ function decodeTextNode(
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
  for (const item of nodeRecord.autoAttributes) direct.Put(document.GetAttrPool().CreateItem(item));
  node.SetAttr(direct);
  if (nodeRecord.emptyListStyle === true) node.SetEmptyListStyleDueToSetOutlineLevelAttr();
  const hints = nodeRecord.hints.map(
    /** Restores one canonical text attribute. @param hint - Primitive hint record. @returns Writer hint. */ (
      hint,
    ) => {
      if (hint.kind === "hyperlink")
        return new SwTextAttr(new SwFormatINetFormat(hint.hyperlink), hint.start, hint.end);
      const items = new SfxItemSet(document.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
      decodeSfxItemSet(items, hint.items);
      return new SwTextAttr(new SwFormatAutoFormat(items), hint.start, hint.end);
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
  node.AddToList();
  for (const offset of nodeRecord.softPageBreaks ?? [])
    document.GetIDocumentMarkAccess().AddSoftPageBreak(node, offset);
}

/** Lists all canonical text nodes including table cell paragraphs in body order. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ function allTextNodes(
  document: SwDoc,
): SwTextNode[] {
  return document.nodes.getBodyContent().flatMap(
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
