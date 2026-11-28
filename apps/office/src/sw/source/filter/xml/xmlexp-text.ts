/** @fileoverview Projects native Writer text, tables, sections and marks into the common ODF text exporter. */
import type { XMLRedlineStyleSource } from "../../../../xmloff/source/text/txtparae";
import { SwTextRuby } from "../../core/txtnode/txtatr2";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SwTOXBaseSection } from "../../core/inc/doctxm";
import { exportDocumentIndex } from "./xmlindex";
import { exportParagraphAlignment } from "../../../../xmloff/source/style/adjushdl";
import { SvxHyphenZoneItem } from "../../../../editeng/source/items/paraitem";
import { SwRegisterItem } from "../../core/para/paratr";
import { ExportNumberFormat } from "../../../../xmloff/source/style/xmlnumfe";
import { writeNumberFormatAttributes } from "../../../../xmloff/source/style/numehelp";
import {
  getSwDefaultTextFormat,
  SwTableBoxFormula,
  SwTableBoxNumFormat,
  SwTableBoxValue,
} from "../../core/attr/cellatr";
import type { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import * as ParaItems from "../../../../editeng/source/items/paraitem.controls";
import {
  getTextFrameExportParagraphs,
  sectionParagraphs,
  type XMLBoundWriterFrames,
} from "./xmltextframe";
import { projectParagraphMarkers, projectStructuralRedline } from "./xmlexp-markers";
import type { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { CollectGraphicFlyFrames, CollectTextFlyFrames } from "../../core/layout/flycnt";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import { getFillProperties, XMLBitmapStyleExport, XML_FILL_WHICH_IDS } from "./xmlexp-fill";
import { RES_CHRATR_BOX, RES_CHRATR_ESCAPEMENT, RES_CHRATR_KERNING } from "../../../inc/hintids";
import { RES_CHRATR_WORDLINEMODE, RES_CHRATR_AUTOKERN } from "../../../inc/hintids";
import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import {
  getCharacterProperties,
  projectXmlTextRuns,
  XML_CHARACTER_EFFECT_WHICH_IDS,
} from "./xmlexp-character";
import { sw_GetTableBoxColStr } from "../../core/table/swtable";
import { SwXMLTableLines } from "./xmltble";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import {
  exportBoxProperties,
  exportParagraphBorders,
  exportFrameVisualProperties,
  exportParagraphLineSpacing,
  exportParagraphLineNumbering,
  exportParagraphTabStops,
  exportParagraphVerticalMargins,
  exportParagraphAdjustment,
  exportParagraphDirectionAndGrid,
  exportParagraphAsianTypographyItems,
  XML_ASIAN_TYPOGRAPHY_WHICH_IDS,
} from "./xmlexpit";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize, type SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
  type SvxLRSpaceItem,
  SvxBoxItem,
} from "../../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SwNumRule } from "../../core/doc/number";
import { encodeStyleName } from "../../../../xmloff/source/core/xmluconv";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import {
  escapeXml,
  exportTextParagraphs,
  type OdfTextExport,
  type OdfCharacterProperties,
  type OdfParagraphAlignment,
  type OdfParagraphProperties,
  type XMLTextParagraphSource,
  type XMLTextListRuleSource,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_BREAK,
  RES_PAGEDESC,
  RES_CHRATR_COLOR,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_GRABBAG,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_REGISTER,
  RES_PARATR_HYPHENZONE,
  RES_PARATR_WIDOWS,
  RES_PARATR_VERTALIGN,
  RES_FRAMEDIR,
  RES_PARATR_AUTOFRAMEDIR,
  RES_PARATR_SNAPTOGRID,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_PARATR_CONNECT_BORDER,
  RES_SHADOW,
  RES_PARATR_OUTLINELEVEL,
  RES_UL_SPACE,
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_HORI_ORIENT,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
  RES_ROW_SPLIT,
  RES_BOX,
  RES_BOXATR_FORMAT,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_PROTECT,
  RES_VERT_ORIENT,
  RES_KEEP,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import type { SwFormatVertOrient, SwFormatHoriOrient } from "../../../inc/fmtornt";
import type { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import type { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode, type SwStartNode } from "../../core/docnode/node";
import { SwSectionNode } from "../../core/docnode/ndsect";
import type { SwSectionBlock } from "../../core/docnode/nodes";
import { exportTextSection } from "./xmlsection";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { RES_PARATR_LIST_AUTOFMT } from "../../../inc/hintids";
import { getCharacterOdfStyleName, getParagraphOdfStyleName } from "./xmlexp-style-names";
import { exportVariableDeclarations } from "../../../../xmloff/source/text/txtflde";
import { SwGetSetExpType } from "../../core/fields/expfld";
import { FontPitch } from "../../../../tools/inc/fontenum";

/** Projects the original document-owned masters, optionally limited to one text story. @param document - Writer model. @param used - Named masters used by a story. @returns ODF declarations. */
export function exportWriterVariableDeclarations(document: SwDoc, used?: ReadonlySet<string>) {
  const fields = document.getIDocumentFieldsAccess();
  const variables = [];
  const users = [];
  for (const type of fields.GetSetExpFieldTypes()) {
    const subtype = type.GetType();
    const name = type.GetName();
    if (subtype !== SwGetSetExpType.Sequence && (!used || used.has("variable\0" + name)))
      variables.push({ name, string: subtype === SwGetSetExpType.String });
  }
  for (const type of fields.GetUserFieldTypes())
    if (!used || used.has("user\0" + type.name))
      users.push({ name: type.name, value: type.expression ? type.value : type.content });
  return exportVariableDeclarations(variables, users, escapeXml);
}

/** Projects the same model source for both package streams. @param document - Writer model. @param isCancelled - Cancellation probe. @param fontFaceName - Font registry. @param existingFontFaceName - Existing face lookup. @param sections - Master-page text owners in the styles stream. @param graphicHelper - Optional package graphic owner. @param bitmapStyles - Package bitmap catalogue. @param redlineStyles - Previous formatting submitted to the same style pass. @returns Style/body fragments. */
export function exportWriterText(
  document: SwDoc,
  isCancelled: () => boolean,
  fontFaceName: (
    family: string,
    generic?: string,
    styleName?: string,
    pitch?: FontPitch,
    charSet?: number,
  ) => string,
  existingFontFaceName: (family: string) => string | undefined,
  sections?: readonly SwStartNode[],
  graphicHelper?: SvXMLGraphicHelper,
  bitmapStyles?: XMLBitmapStyleExport,
  redlineStyles?: readonly XMLRedlineStyleSource[],
): OdfTextExport {
  const dataStyles = new Map<string, { name: string; xml: string } | null>();
  /** Registers a native automatic number style, including its system language policy. @param key - Formatter identity. @param systemLanguage - Whether locale is automatic. @returns ODF number style name. */
  function exportNumberStyle(key: number, systemLanguage = false): string | undefined {
    const identity = `${key}:${systemLanguage}`;
    if (!dataStyles.has(identity)) {
      const name = `N${dataStyles.size + 1}`;
      const xml = ExportNumberFormat(document.GetNumberFormatter(), key, name, systemLanguage);
      dataStyles.set(identity, xml ? { name, xml } : null);
    }
    return dataStyles.get(identity)?.name;
  }
  const anchored: XMLBoundWriterFrames = {
    text: CollectTextFlyFrames(document),
    exportNumberStyle,
    ...(bitmapStyles ? { bitmapStyles } : {}),
    ...(graphicHelper ? { graphicHelper, graphics: CollectGraphicFlyFrames(document, true) } : {}),
  };
  const sectionDeclarations: string[] = [];
  const exported = exportTextParagraphs(
    {
      exportNumberStyle,
      commonCharacterStyleNames: document.GetCharFormats().slice(1).map(getCharacterOdfStyleName),
      ...(redlineStyles === undefined ? {} : { redlineStyles }),
      /** Iterates live Writer nodes without retaining a projection. @returns Paragraph source iterator. */
      *paragraphs(): Iterable<XMLTextParagraphSource> {
        for (const node of getTextFrameExportParagraphs(document, anchored.text))
          yield projectParagraph(node);
        for (const section of sections ?? [])
          for (const node of sectionParagraphs(document.nodes.GetSectionContent(section)))
            yield projectParagraph(node);
      },
      /** Iterates ordered direct body blocks and projects table cells through the same text exporter. @returns Body blocks. */
      *blocks() {
        const nodes = document.nodes;
        for (const block of nodes.GetSectionBlocks(nodes.GetEndOfContent().StartOfSectionNode()))
          yield projectBlock(block, anchored);
      },
      ...(sections === undefined
        ? {}
        : {
            /** Projects all master-page text under the shared automatic style owner. @returns Ordered sections. */
            sections() {
              return sections.map(
                /** Projects one direct native text section. @param start - Section. @param index - Position in the document section list. @returns First-level XML blocks. */
                (start, index) => {
                  const used = new Set<string>();
                  const currentStory: XMLBoundWriterFrames = {
                    ...anchored,
                    /** Collects the actual dependent master of this story, including tables and anchored text. @param family - Native master family. @param name - Master name. @returns Nothing. */
                    collectFieldMaster: (family, name) => {
                      used.add(family + "\0" + name);
                    },
                  };
                  const blocks = document.nodes.GetSectionBlocks(start).map(
                    /** Connects paragraphs and tables to the existing exporter. @param block - Direct section block. @returns XML block source. */
                    (block) => projectBlock(block, currentStory),
                  );
                  const { variables, users } = exportWriterVariableDeclarations(document, used);
                  sectionDeclarations[index] = variables + users;
                  return blocks;
                },
              );
            },
          }),
    },
    isCancelled,
    fontFaceName,
    existingFontFaceName,
    graphicHelper,
  );
  let automaticStyles = "";
  for (const style of dataStyles.values()) if (style) automaticStyles += style.xml;
  return {
    ...exported,
    automaticStyles: automaticStyles + exported.automaticStyles,
    ...(exported.sections === undefined
      ? {}
      : {
          sections: exported.sections.map(
            /** Places field declarations at the start of the original page story. @param section - Serialized story. @param index - Story position. @returns ODF story contents. */
            (section, index) => (sectionDeclarations[index] ?? "") + section,
          ),
        }),
  };
}

/** Projects one original text or table node, including interleaved cell sections. @param block - Native node. @param anchored - Actual bound frame sets. @returns Neutral ODF body block. */
function projectBlock(block: SwSectionBlock, anchored: XMLBoundWriterFrames): XMLTextExportBlock {
  if (!(block instanceof SwSectionNode) && !(block instanceof SwTableNode))
    return { kind: "paragraph", paragraph: projectParagraph(block, anchored) };
  const redlineStart = projectStructuralRedline(block);
  const redlineEnd = projectStructuralRedline(block.EndOfSectionNode());
  const redlines = {
    ...(redlineStart ? { redlineStart } : {}),
    ...(redlineEnd ? { redlineEnd } : {}),
  };
  if (block instanceof SwSectionNode) {
    const content = block
      .GetNodes()
      .GetSectionBlocks(block)
      .map(
        /** Projects a structural child of the named section. @param child - Native node. @returns ODF block. */
        (child) => projectBlock(child, anchored),
      );
    const section = block.GetSection();
    const properties = exportTextSection(block, content);
    return {
      kind: "section",
      ...redlines,
      section:
        section instanceof SwTOXBaseSection
          ? { ...properties, index: exportDocumentIndex(section.tox, block.GetDoc()) }
          : properties,
    };
  }
  const table = block.GetTable(),
    grid = new SwXMLTableLines(table);
  const items = table.GetFrameFormat().GetAttrSet();
  const size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined;
  const orientation = items.GetItemIfSet(RES_HORI_ORIENT, false) as SwFormatHoriOrient | undefined;
  const orient = orientation?.GetHoriOrient();
  // Normal items require direct SET state; the native LR special handler searches parents for its orientation guard.
  const marginOrient = (
    items.GetItemIfSet(RES_HORI_ORIENT) as SwFormatHoriOrient | undefined
  )?.GetHoriOrient();
  const lr = items.GetItemIfSet(RES_LR_SPACE, false) as SvxLRSpaceItem | undefined;
  const ul = items.GetItemIfSet(RES_UL_SPACE, false) as SvxULSpaceItem | undefined;
  const split = items.GetItemIfSet(RES_LAYOUT_SPLIT, false) as SwFormatLayoutSplit | undefined;
  const borders = items.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem | undefined;
  return {
    kind: "table" as const,
    ...redlines,
    table: {
      name: table.GetName(),
      columnName: sw_GetTableBoxColStr,
      format: {
        ...exportFrameVisualProperties(items),
        width: size?.GetWidthPercent() ? undefined : size?.GetWidth(),
        relativeWidth: size?.GetWidthPercent() || undefined,
        marginTop: ul?.GetUpper(),
        marginBottom: ul?.GetLower(),
        layoutSplit: split?.GetValue(),
        borderModel:
          borders === undefined ? undefined : borders.GetValue() ? "collapsing" : "separating",
        headerRows: table.GetRowsToRepeat(),
        repeatHeaderRows: table.GetRowsToRepeat() !== 0,
        align:
          orient === HoriOrientation.LEFT || orient === HoriOrientation.LEFT_AND_WIDTH
            ? "left"
            : orient === HoriOrientation.RIGHT
              ? "right"
              : orient === HoriOrientation.CENTER
                ? "center"
                : orient === HoriOrientation.FULL || orient === HoriOrientation.NONE
                  ? "margins"
                  : orient === undefined
                    ? undefined
                    : "",
        marginLeft:
          marginOrient === HoriOrientation.NONE || marginOrient === HoriOrientation.LEFT_AND_WIDTH
            ? lr?.ResolveLeft()
            : undefined,
        marginRight: marginOrient === HoriOrientation.NONE ? lr?.ResolveRight() : undefined,
      },
      columnWidths: grid.GetColumnWidths(),
      softPageBreakRows: table.GetSoftPageBreakRows(),
      rows: table.GetTabLines().map(
        /** Exports direct original row items. @param row - Original table line. @returns Filter-only row values. */ (
          row,
        ) => {
          const items = row.GetFrameFormat().GetAttrSet();
          const size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined;
          const split = items.GetItemIfSet(RES_ROW_SPLIT, false) as SwFormatRowSplit | undefined;
          return {
            format: {
              background: exportFrameVisualProperties(items).background,
              keepTogether: split === undefined ? undefined : !split.GetValue(),
              ...(size?.GetHeightSizeType() === SwFrameSize.Minimum
                ? { minHeight: size.GetHeight() }
                : size?.GetHeightSizeType() === SwFrameSize.Fixed
                  ? { height: size.GetHeight() }
                  : {}),
            },
            cells: row.GetTabBoxes().map(
              /** Exports direct original box items. @param cell - Original table box. @returns Filter-only cell values. */ (
                cell,
              ) => {
                const items = cell.GetFrameFormat().GetAttrSet();
                const box = items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined;
                const orientation = items.GetItemIfSet(RES_VERT_ORIENT, false) as
                  SwFormatVertOrient | undefined;
                const orient = orientation?.GetVertOrient();
                const format = items.GetItemIfSet(RES_BOXATR_FORMAT, false) as
                  SwTableBoxNumFormat | undefined;
                const formula = items.GetItemIfSet(RES_BOXATR_FORMULA) as
                  SwTableBoxFormula | undefined;
                const value = items.GetItemIfSet(RES_BOXATR_VALUE) as SwTableBoxValue | undefined;
                const protect = items.GetItemIfSet(RES_PROTECT) as SvxProtectItem | undefined;
                const formatKey = format?.GetValue() ?? getSwDefaultTextFormat();
                const cellText = cell.GetParagraphs().some(
                  /** Checks the represented cell's text. @param paragraph - Cell text node. @returns Whether nonempty. */
                  (paragraph) => paragraph.GetText().length > 0,
                );
                let valueAttributes =
                  formatKey === getSwDefaultTextFormat() ? ' office:value-type="string"' : "";
                if (formatKey !== getSwDefaultTextFormat() && value && cellText) {
                  const formatter = cell.GetFrameFormat().GetDoc().GetNumberFormatter();
                  if (formatter.GetEntry(formatKey))
                    valueAttributes = writeNumberFormatAttributes(
                      formatter,
                      formatKey,
                      value.GetValue(),
                      formatter.GetNullDate(),
                    );
                }
                return {
                  valueAttributes,
                  formula: formula?.GetFormula(),
                  protected: protect?.IsContentProtected(),
                  columnSpan: grid.GetColumnSpan(cell),
                  rowSpan: cell.getRowSpan(),
                  format: {
                    ...exportBoxProperties(box),
                    ...exportFrameVisualProperties(items),
                    numberFormat: format?.GetValue(),
                    verticalAlign:
                      orient === undefined
                        ? undefined
                        : orient === VertOrientation.CENTER
                          ? "middle"
                          : orient === VertOrientation.BOTTOM
                            ? "bottom"
                            : orient === VertOrientation.TOP
                              ? "top"
                              : "",
                  },
                  content: cell
                    .GetStartNode()
                    .GetNodes()
                    .GetSectionBlocks(cell.GetStartNode())
                    .map(
                      /** Projects one actual cell text or table block. @param child - Native block. @returns ODF block. */
                      (child) => projectBlock(child, anchored),
                    ),
                };
              },
            ),
          };
        },
      ),
    },
  };
}

/** Projects one canonical text node without leaking Writer ownership into xmloff. @param node - Source text node. @param anchored - Actual frame sets during body export. @returns Neutral paragraph. */
function projectParagraph(
  node: SwTextNode,
  anchored?: XMLBoundWriterFrames,
): XMLTextParagraphSource {
  const directItems = node.GetpSwAttrSet()?.entries() ?? [];
  assertSupportedItems(directItems, `paragraph at node ${node.GetIndex()}`, true);
  const ruleName = node.GetNumRuleName();
  const rule = node.GetNumRule();
  if (ruleName.length > 0 && rule === undefined)
    throw new Error(`ODT export cannot resolve SwNumRule ${ruleName} on node ${node.GetIndex()}.`);
  const outline = rule?.IsOutlineRule() === true;
  const listId = node.GetListId();
  const level = node.GetAttrListLevel();
  if (
    rule === undefined &&
    (listId.length > 0 ||
      (level !== 0 && !node.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle()))
  )
    throw new Error(
      `ODT export found list id or level without SwNumRule on node ${node.GetIndex()}.`,
    );
  const alignment = getDirectAlignment(
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_ADJUST, false),
  );
  const hasDirectLeftMargin =
    node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined;
  const paragraphProperties = getParagraphProperties(node.GetpSwAttrSet());
  const markers = projectParagraphMarkers(node, anchored, projectBlock);
  const ruby = [];
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    if (!(hint instanceof SwTextRuby) || hint.GetStart() === hint.GetEnd()) continue;
    const item = hint.GetAttr();
    const name = item.GetCharFormatName();
    ruby.push({
      start: hint.GetStart(),
      end: hint.GetEnd(),
      reading: text(item.GetText()),
      readingStyleName: name
        ? encodeStyleName(SwStyleNameMapper.FillProgName(name, SwGetPoolIdFromName.ChrFmt))
        : "",
      adjustment: item.GetAdjustment(),
      position: item.GetPosition(),
    });
  }
  const directCharacterProperties = getCharacterProperties(node.GetpSwAttrSet(), false);
  const marker = node.GetSwAttrSet().GetItemIfSet(RES_PARATR_LIST_AUTOFMT, true);
  const markerProperties =
    marker instanceof SwFormatAutoFormat
      ? getCharacterProperties(marker.GetStyleHandle(), false)
      : undefined;
  return {
    ...(alignment === undefined ? {} : { alignment }),
    ...(hasDirectLeftMargin ? { leftMargin: node.GetParagraphTextLeftMargin() } : {}),
    ...(paragraphProperties === undefined ? {} : { paragraphProperties }),
    ...(markers.length === 0 ? {} : { markers }),
    ...(ruby.length === 0 ? {} : { ruby }),
    ...(markerProperties === undefined ? {} : { markerProperties }),
    ...(rule !== undefined &&
    !outline &&
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined
      ? { directListRule: rule.GetName() }
      : {}),
    inheritedProperties: getCharacterProperties(
      node.GetSwAttrSet(),
      true,
    ) as OdfCharacterProperties,
    ...(rule === undefined || outline
      ? {}
      : {
          list: {
            listId,
            level,
            counted: node.IsCountedInList(),
            restart: node.IsListRestart(),
            ...(node.IsListRestart() && node.HasAttrListRestartValue()
              ? { startValue: node.GetAttrListRestartValue() }
              : {}),
            rule: projectNumberingRule(rule),
          },
        }),
    ...(directCharacterProperties === undefined ? {} : { properties: directCharacterProperties }),
    outlineLevel: node.GetAttrOutlineLevel(),
    ...(outline && !node.IsCountedInList() ? { outlineListHeader: true } : {}),
    ...(node.IsListRestart() ? { outlineRestart: true } : {}),
    ...(node.IsListRestart() && node.HasAttrListRestartValue()
      ? { outlineStartValue: node.GetAttrListRestartValue() }
      : {}),
    runs: projectXmlTextRuns(node),
    style: node.GetParagraphStyle(),
    styleName: getParagraphOdfStyleName(node.GetDoc(), node.GetParagraphStyle()),
  };
}

/** Projects an owned numbering rule for common and automatic ODF definitions. @param rule - Native rule. @returns Neutral per-level properties. */
export function projectNumberingRule(rule: SwNumRule): XMLTextListRuleSource {
  const properties = new SwXNumberingRules(rule);
  return {
    levels: Array.from(
      { length: WRITER_MAX_LIST_LEVEL + 1 },
      /** Reads the represented native numbering properties from their actual service owner. @param _unused - Array slot. @param index - Writer list level. @returns Level properties. */
      (_unused, index) => properties.GetPropertiesByIndex(index),
    ),
    name: rule.GetName(),
    isAutomatic: rule.IsAutoRule(),
  };
}

/** Rejects paragraph items outside this ODT slice. @param items - Direct items. @param owner - Error identity. @param allowListItems - Whether paragraph list items are valid. @param allowStyleNumbering - Whether named numbering style items are emitted. @returns Nothing. */
export function assertSupportedItems(
  items: readonly { Which(): number }[],
  owner: string,
  allowListItems: boolean,
  allowStyleNumbering = false,
): void {
  const supported = new Set<number>([
    ...XML_FILL_WHICH_IDS,
    RES_PARATR_GRABBAG,
    RES_CHRATR_POSTURE,
    RES_CHRATR_COLOR,
    RES_CHRATR_GRABBAG,
    RES_CHRATR_FONT,
    RES_CHRATR_FONTSIZE,
    RES_CHRATR_UNDERLINE,
    RES_CHRATR_ESCAPEMENT,
    ...XML_CHARACTER_EFFECT_WHICH_IDS,
    RES_CHRATR_WEIGHT,
    RES_CHRATR_WORDLINEMODE,
    RES_CHRATR_AUTOKERN,
    RES_CHRATR_KERNING,
    RES_CHRATR_BOX,
    RES_CHRATR_CJK_POSTURE,
    RES_CHRATR_CJK_FONT,
    RES_CHRATR_CJK_FONTSIZE,
    RES_CHRATR_CJK_WEIGHT,
    RES_CHRATR_CTL_POSTURE,
    RES_CHRATR_CTL_FONT,
    RES_CHRATR_CTL_FONTSIZE,
    RES_CHRATR_CTL_WEIGHT,
    RES_CHRATR_BACKGROUND,
    RES_CHRATR_HIGHLIGHT,
    RES_CHRATR_LANGUAGE,
    RES_CHRATR_CJK_LANGUAGE,
    RES_CHRATR_CTL_LANGUAGE,
    RES_PARATR_ADJUST,
    RES_PARATR_SPLIT,
    RES_PARATR_ORPHANS,
    RES_PARATR_WIDOWS,
    RES_PARATR_REGISTER,
    RES_PARATR_HYPHENZONE,
    RES_PARATR_VERTALIGN,
    RES_FRAMEDIR,
    RES_PARATR_AUTOFRAMEDIR,
    RES_PARATR_SNAPTOGRID,
    ...XML_ASIAN_TYPOGRAPHY_WHICH_IDS,
    RES_BREAK,
    RES_PAGEDESC,
    RES_PARATR_LINESPACING,
    RES_PARATR_TABSTOP,
    RES_MARGIN_FIRSTLINE,
    RES_MARGIN_RIGHT,
    RES_MARGIN_TEXTLEFT,
    RES_UL_SPACE,
    RES_KEEP,
    RES_LINENUMBER,
    RES_PARATR_CONNECT_BORDER,
    RES_SHADOW,
    RES_BOX,
  ]);
  if (allowListItems)
    for (const which of [
      RES_PARATR_LIST_ISCOUNTED,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_RESTARTVALUE,
      RES_PARATR_LIST_AUTOFMT,
      RES_PARATR_NUMRULE,
    ])
      supported.add(which);
  if (allowStyleNumbering) supported.add(RES_PARATR_NUMRULE);
  if (allowListItems || allowStyleNumbering) supported.add(RES_PARATR_OUTLINELEVEL);
  const unsupported = items.find(
    /** Finds a non-alignment item. @param item - Direct pool item. @returns Whether unsupported. */
    (item) => !supported.has(item.Which()),
  );
  if (unsupported !== undefined)
    throw new Error(`ODT export does not support WhichId ${unsupported.Which()} on ${owner}.`);
}

/** Projects direct paragraph items to ODF properties. @param set - Optional item set. @returns Properties when present. */
export function getParagraphProperties(
  set: SfxItemSet | undefined,
): OdfParagraphProperties | undefined {
  if (set === undefined) return undefined;
  const firstLine = set.GetItemIfSet(RES_MARGIN_FIRSTLINE, false);
  const right = set.GetItemIfSet(RES_MARGIN_RIGHT, false);
  const spacing = set.GetItemIfSet(RES_UL_SPACE, false);
  const lineSpacing = set.GetItemIfSet(RES_PARATR_LINESPACING, false);
  const tabStop = set.GetItemIfSet(RES_PARATR_TABSTOP, false);
  const keep = set.GetItemIfSet(RES_KEEP, false);
  const register = set.GetItemIfSet(RES_PARATR_REGISTER, false);
  const hyphenation = set.GetItemIfSet(RES_PARATR_HYPHENZONE, false);
  const adjust = set.GetItemIfSet(RES_PARATR_ADJUST, false);
  const split = set.GetItemIfSet(RES_PARATR_SPLIT, false);
  const orphans = set.GetItemIfSet(RES_PARATR_ORPHANS, false);
  const widows = set.GetItemIfSet(RES_PARATR_WIDOWS, false);
  const verticalAlign = set.GetItemIfSet(RES_PARATR_VERTALIGN, false);
  const paragraphBreak = set.GetItemIfSet(RES_BREAK, false);
  const pageDesc = set.GetItemIfSet(RES_PAGEDESC, false);
  if (
    (firstLine !== undefined && !(firstLine instanceof SvxFirstLineIndentItem)) ||
    (right !== undefined && !(right instanceof SvxRightMarginItem)) ||
    (spacing !== undefined && !(spacing instanceof SvxULSpaceItem)) ||
    (lineSpacing !== undefined && !(lineSpacing instanceof SvxLineSpacingItem)) ||
    (tabStop !== undefined && !(tabStop instanceof SvxTabStopItem)) ||
    (keep !== undefined && !(keep instanceof SfxBoolItem)) ||
    (split !== undefined && !(split instanceof ParaItems.SvxFormatSplitItem)) ||
    (orphans !== undefined && !(orphans instanceof ParaItems.SvxOrphansItem)) ||
    (widows !== undefined && !(widows instanceof ParaItems.SvxWidowsItem)) ||
    (verticalAlign !== undefined && !(verticalAlign instanceof ParaItems.SvxParaVertAlignItem)) ||
    (paragraphBreak !== undefined && !(paragraphBreak instanceof SfxInt16Item)) ||
    (pageDesc !== undefined && !(pageDesc instanceof SwFormatPageDesc))
  )
    throw new Error("ODT paragraph item is invalid.");
  const properties: OdfParagraphProperties = {
    ...getFillProperties(set),
    ...(firstLine instanceof SvxFirstLineIndentItem
      ? {
          firstLineIndent: firstLine.ResolveTextFirstLineOffset(),
          autoTextIndent: firstLine.IsAutoFirst(),
        }
      : {}),
    ...(right instanceof SvxRightMarginItem ? { rightMargin: right.ResolveRight() } : {}),
    ...(spacing instanceof SvxULSpaceItem ? exportParagraphVerticalMargins(spacing) : {}),
    ...(lineSpacing instanceof SvxLineSpacingItem ? exportParagraphLineSpacing(lineSpacing) : {}),
    ...(tabStop instanceof SvxTabStopItem
      ? {
          tabStopDetails: exportParagraphTabStops(tabStop),
        }
      : {}),
    ...exportParagraphDirectionAndGrid(set),
    ...exportParagraphAsianTypographyItems(set),
    ...(adjust instanceof SvxAdjustItem
      ? { justification: exportParagraphAdjustment(adjust) }
      : {}),
    ...(hyphenation instanceof SvxHyphenZoneItem ? { hyphenation: hyphenation.QueryValue() } : {}),
    ...(register instanceof SwRegisterItem ? { registerModeActive: register.GetValue() } : {}),
    ...(keep instanceof SfxBoolItem ? { keepWithNext: keep.GetValue() } : {}),
    ...(split instanceof ParaItems.SvxFormatSplitItem ? { keepTogether: !split.GetValue() } : {}),
    ...(orphans instanceof ParaItems.SvxOrphansItem ? { orphans: orphans.GetValue() } : {}),
    ...(widows instanceof ParaItems.SvxWidowsItem ? { widows: widows.GetValue() } : {}),
    ...(verticalAlign instanceof ParaItems.SvxParaVertAlignItem
      ? { verticalAlign: verticalAlign.GetValue() }
      : {}),
    ...(paragraphBreak instanceof SfxInt16Item
      ? {
          breakBefore:
            paragraphBreak.GetValue() === 4 || paragraphBreak.GetValue() === 6
              ? ("page" as const)
              : ("auto" as const),
          breakAfter:
            paragraphBreak.GetValue() === 5 || paragraphBreak.GetValue() === 6
              ? ("page" as const)
              : ("auto" as const),
        }
      : {}),
    ...(pageDesc instanceof SwFormatPageDesc
      ? {
          pageStyleName: pageDesc.GetPageDescName(),
          pageNumber: pageDesc.GetNumOffset() ?? ("auto" as const),
        }
      : {}),
    ...exportParagraphLineNumbering(set),
    ...exportParagraphBorders(set),
  };
  return Object.keys(properties).length === 0 ? undefined : properties;
}

/** Projects a direct text-left margin. @param set - Item set. @returns Twips when directly set. */
export function getDirectLeftMargin(set: SfxItemSet): number | undefined {
  const item = set.GetItemIfSet(RES_MARGIN_TEXTLEFT, false);
  if (item === undefined) return undefined;
  if (!(item instanceof SvxTextLeftMarginItem)) throw new Error("ODT left-margin item is invalid.");
  return item.ResolveTextLeft();
}

/** Serializes twips as a bounded ODF centimetre length. @param twips - Length. @returns ODF length. */
export function exportOdfLength(twips: number): string {
  return `${Number(((twips * 2.54) / 1440).toFixed(4))}cm`;
}

/** Converts a direct adjustment item to model alignment. @param item - Optional pool item. @returns Alignment when directly set. */
export function getDirectAlignment(item: unknown): OdfParagraphAlignment | undefined {
  if (item === undefined) return undefined;
  if (!(item instanceof SvxAdjustItem))
    throw new Error("ODT paragraph adjustment item is invalid.");
  return exportParagraphAlignment(item.GetAdjust());
}
