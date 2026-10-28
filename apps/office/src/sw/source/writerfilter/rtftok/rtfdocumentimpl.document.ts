/** @fileoverview RtfDocumentImpl document implementation, called with the original native owner as this. */
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { DFLT_ESC_AUTO_SUPER, DFLT_ESC_PROP } from "../../../../editeng/inc/escapementitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { MakeTextAttr } from "../../core/txtnode/thints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import {
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_AUTOKERN,
  RES_BREAK,
  RES_BOX,
  RES_PARATR_CONNECT_BORDER,
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import {
  getWriterMaterializedParagraphStyleDefinition,
  getWriterParagraphStyleId,
} from "../../../inc/poolfmt";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SwpHints } from "../../core/txtnode/ndhints";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { getSvxAdjust } from "../../core/txtnode/ndtxt-hints";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { StyleSheetTable } from "../dmapper/StyleSheetTable";
import {
  createRtfLineSpacing,
  createRtfTabStops,
  hasRtfUnderlineControl,
  resolveRtfRunAttributes,
  resolveRtfBaseline,
  type RtfDocumentImplContext,
  type RtfParagraph,
  type RtfParagraphState,
} from "./rtfdocumentimpl.context";
import { RtfSyntaxError } from "./rtftokenizer";
import { createRtfBorderLine, getRtfBorderDistance } from "./rtfdocumentimpl.border";

/** Applies source border ordering and the prior-paragraph between-border adjustment. @param inherited - Effective native box. @param paragraph - Parsed paragraph. @param colors - RTF palette. @param previous - Prior paragraph in this native text section. @returns Authored box when an edge is written. */
function paragraphBorderBox(
  inherited: SvxBoxItem,
  paragraph: RtfParagraphState,
  colors: readonly string[],
  previous?: SwTextNode,
): SvxBoxItem | undefined {
  let box: SvxBoxItem | undefined;
  for (const [side, border] of paragraph.borders ?? []) {
    let edge = side;
    if (edge === "between") {
      if (
        previous === undefined ||
        (previous.GetAttr(RES_PARATR_CONNECT_BORDER) as SfxBoolItem).GetValue()
      )
        continue;
      const priorBox = (previous.GetAttr(RES_BOX) as SvxBoxItem).Clone();
      priorBox.SetLine(undefined, SvxBoxItemLine.BOTTOM);
      previous.SetAttr(priorBox);
      edge = SvxBoxItemLine.TOP;
    }
    box ??= inherited.Clone();
    box.SetLine(createRtfBorderLine(border, colors), edge);
    box.SetDistance(getRtfBorderDistance(border), edge);
  }
  return box;
}

/** Materializes the parsed blocks only after the complete stream is valid.  @param options - Options. @returns The SwDoc result.  @param this - Original native owner shared by its implementation fragments. */
export function Finish(this: RtfDocumentImplContext, options: SwDocOptions): SwDoc {
  if (!this["sawHeader"]) throw new RtfSyntaxError("RTF version control is missing.");
  if (
    this["runs"].length > 0 ||
    (this["blocks"].length === 0 && this["tableRows"].length === 0) ||
    !this["terminatedParagraph"] ||
    (this["pendingPageBreak"] && this["tableRows"].length === 0)
  )
    this["CommitParagraph"]();
  this["FlushTable"]();
  const document = new SwDoc(options);
  const defaultPage = { ...document.GetPageDesc().GetValue(), ...this["defaultSectionPage"] };
  document.ChgPageDesc({ ...defaultPage, ...this["sectionPages"][0] });
  // DomainMapper sets this for a newly imported Word/RTF document: \tx is absolute.
  document.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", false);
  const defaultTabs = (
    document.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem
  ).Clone();
  if (defaultTabs.Count() > 0 && this["defaultTabStop"] > 0) {
    const first = defaultTabs.At(0);
    const replacement = new SvxTabStop(
      this["defaultTabStop"],
      first.GetAdjustment(),
      first.GetDecimal(),
      first.GetFill(),
    );
    defaultTabs.Remove(0);
    defaultTabs.Insert(replacement);
    document.GetAttrPool().SetUserDefaultItem(defaultTabs);
  }
  this["importedStyles"].clear();
  this["importedCharacterStyles"].clear();
  this["importedStyles"].set(0, document.GetDfltTextFormatColl());
  for (const [index, definition] of this["styles"]) {
    const [name] = StyleSheetTable.ConvertStyleName(definition.name);
    if (definition.styleType === "character") {
      this["importedCharacterStyles"].set(
        index,
        document.FindCharFormatByName(name) ??
          document.MakeCharFormat(name, document.GetDfltCharFormat()),
      );
      continue;
    }
    const id = getWriterParagraphStyleId(name);
    let identity = id || name;
    let suffix = 1;
    while (document.FindTextFormatColl(identity) !== undefined)
      identity = `${id || name}:${index}:${suffix++}`;
    const collection =
      document.FindTextFormatCollByName(name) ??
      (getWriterMaterializedParagraphStyleDefinition(id)?.name === name
        ? document.GetTextFormatColl(id)
        : document.MakeTextFormatColl(name, document.GetTextFormatColl("default"), identity));
    this["importedStyles"].set(index, collection);
  }
  for (const [index, definition] of this["styles"]) {
    const collection =
      this["importedStyles"].get(index) ?? this["importedCharacterStyles"].get(index);
    const parent =
      collection instanceof SwTextFormatColl
        ? this["importedStyles"].get(definition.basedOnStyleIndex ?? -1)
        : this["importedCharacterStyles"].get(definition.basedOnStyleIndex ?? -1);
    if (collection !== undefined && parent !== undefined && parent !== collection)
      collection.SetDerivedFrom(parent);
    if (collection instanceof SwTextFormatColl) {
      const next = this["importedStyles"].get(definition.nextStyleIndex ?? -1);
      if (next !== undefined) collection.SetNextTextFormatColl(next);
    }
  }
  const appliedStyles = new Set<number>();
  for (const index of this["styles"].keys()) {
    const ancestry: number[] = [];
    const pending = new Set<number>();
    let current: number | undefined = index;
    while (current !== undefined && !appliedStyles.has(current) && !pending.has(current)) {
      ancestry.push(current);
      pending.add(current);
      current = this["styles"].get(current)?.basedOnStyleIndex;
    }
    for (const slot of ancestry.reverse()) {
      const definition = this["styles"].get(slot);
      const collection =
        this["importedStyles"].get(slot) ?? this["importedCharacterStyles"].get(slot);
      if (definition !== undefined && collection !== undefined)
        this["ApplyStyleDefinition"](collection, definition);
      appliedStyles.add(slot);
    }
  }
  let firstParagraph = true;
  const sectionStyles = new Map<number, string>();
  for (const block of this["blocks"]) {
    let sectionStyle = sectionStyles.get(block.section);
    const startsSection = block.section > 0 && sectionStyle === undefined;
    if (block.section > 0 && sectionStyle === undefined) {
      // This fresh document receives one generated page descriptor per unique parsed section ID.
      sectionStyle = `Converted${block.section}`;
      const page = document.MakePageDesc(sectionStyle);
      document.ChgPageDesc(
        { ...defaultPage, ...this["sectionPages"][block.section], name: sectionStyle },
        sectionStyle,
      );
      sectionStyles.set(block.section, page.GetName());
    }
    if (block.kind === "paragraph") {
      // A fresh SwDoc owns its initial text node; later nodes are returned by the native constructor.
      const node = firstParagraph
        ? (document.paragraphs[0] as SwTextNode)
        : document.nodes.MakeTextNode();
      this["ApplyParagraph"](node, block.paragraph);
      if (startsSection && sectionStyle !== undefined)
        node.SetAttr(
          new SwFormatPageDesc(
            sectionStyle,
            this["sectionPageRestarts"].has(block.section) ? 1 : undefined,
          ),
        );
      firstParagraph = false;
    } else {
      const table = firstParagraph
        ? document.nodes.InsertTable(document.paragraphs[0] as SwTextNode, "RTF Table", {})
        : document.nodes.MakeTableNode("RTF Table");
      if (startsSection && sectionStyle !== undefined)
        table
          .GetFrameFormat()
          .SetFormatAttr(
            new SwFormatPageDesc(
              sectionStyle,
              this["sectionPageRestarts"].has(block.section) ? 1 : undefined,
            ),
          );
      if (block.pageBreakBefore)
        table.GetFrameFormat().SetFormatAttr(new SfxInt16Item(RES_BREAK, 4));
      const firstRow = block.rows[0];
      if (firstRow !== undefined) {
        const format = table.GetFrameFormat();
        const orient = format.GetHoriOrient().Clone();
        orient.SetHoriOrient(
          firstRow.alignment === "center"
            ? HoriOrientation.CENTER
            : firstRow.alignment === "right"
              ? HoriOrientation.RIGHT
              : firstRow.left !== 0
                ? HoriOrientation.NONE
                : HoriOrientation.LEFT,
        );
        format.SetFormatAttr(orient);
        if (firstRow.left !== 0) {
          const lr = format.GetLRSpace().Clone();
          lr.SetLeft(SvxIndentValue.twips(firstRow.left));
          format.SetFormatAttr(lr);
        }
        if (firstRow.defaultPaddings.size > 0) {
          const item = format.GetBox().Clone();
          for (const [edge, value] of firstRow.defaultPaddings) item.SetDistance(value, edge);
          format.SetFormatAttr(item);
        }
      }
      const rightEdge = block.rows.reduce(
        /** Computes the maximum result. @param maximum - Maximum. @param row - Row. @returns The computed result. */ (
          maximum,
          row,
        ) => Math.max(maximum, (row.boundaries.at(-1) ?? 0) - row.left),
        0,
      );
      if (rightEdge > 0) {
        const size = table.GetFrameFormat().GetFrameSize().Clone();
        size.SetWidth(rightEdge);
        table.GetFrameFormat().SetFormatAttr(size);
      }
      for (const row of block.rows) {
        const line = document.nodes.AppendTableRow(table, row.cells.length);
        if (row.height !== 0) {
          const size = line.GetFrameFormat().GetFrameSize().Clone();
          size.SetHeight(Math.abs(row.height));
          size.SetHeightSizeType(row.height < 0 ? SwFrameSize.Fixed : SwFrameSize.Minimum);
          line.GetFrameFormat().SetFormatAttr(size);
        }
        if (!row.split) line.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(false));
        for (const [index, cell] of row.cells.entries()) {
          // AppendTableRow created exactly row.cells.length boxes before this bounded iteration.
          const box = line.GetTabBoxes()[index] as ReturnType<typeof line.GetTabBoxes>[number];
          const vertical = row.verticals[index];
          if (vertical !== undefined) {
            const item = box.GetVertOrient();
            item.SetVertOrient(vertical);
            box.ClaimFrameFormat().SetFormatAttr(item);
          }
          const borders = row.borders[index];
          if (borders !== undefined && borders.size > 0) {
            const item = box.GetBox();
            for (const [edge, border] of borders)
              item.SetLine(createRtfBorderLine(border, this["colors"]), edge);
            box.ClaimFrameFormat().SetFormatAttr(item);
          }
          const paddings = row.paddings[index];
          if (row.defaultPaddings.size > 0 || (paddings !== undefined && paddings.size > 0)) {
            const item = box.GetBox();
            for (const [edge, value] of row.defaultPaddings) item.SetDistance(value, edge);
            for (const [edge, value] of paddings ?? []) item.SetDistance(value, edge);
            box.ClaimFrameFormat().SetFormatAttr(item);
          }
          const right = row.boundaries[index];
          const left = index === 0 ? row.left : row.boundaries[index - 1];
          if (right !== undefined && left !== undefined && right > left) {
            const size = box.GetFrameSize();
            size.SetWidth(right - left);
            box.SetFrameSize(size);
          }
          for (const [paragraphIndex, paragraph] of cell.entries()) {
            const node =
              paragraphIndex === 0
                ? (box.GetParagraphs()[0] as SwTextNode)
                : document.nodes.AppendTableCellParagraph(box);
            this["ApplyParagraph"](node, paragraph);
          }
        }
      }
      let repeatedRows = 0;
      for (const row of block.rows) {
        if (!row.header) break;
        if (repeatedRows === 10) {
          repeatedRows = 0;
          break;
        }
        repeatedRows++;
      }
      table.SetRowsToRepeat(repeatedRows);
    }
  }
  return document;
}

/** Installs represented RTF stylesheet properties on the document-owned collection.  @param collection - Collection. @param definition - Definition. @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function ApplyStyleDefinition(
  this: RtfDocumentImplContext,
  collection: SwTextFormatColl | SwCharFormat,
  definition: {
    character: WriterCharacterAttributes;
    autoKerning?: boolean;
    baselineHalfPoints?: number;
    paragraph: RtfParagraphState;
    controls: ReadonlySet<string>;
    basedOnStyleIndex?: number;
  },
): void {
  const controls = definition.controls;
  const current = projectWriterCharacterAttributes(collection.GetAttrSet());
  let target: WriterCharacterAttributes = {
    ...current,
    ...(controls.has("b") ? { bold: definition.character.bold } : {}),
    ...(controls.has("i") ? { italic: definition.character.italic } : {}),
    ...(hasRtfUnderlineControl(controls)
      ? {
          underline: definition.character.underline,
          underlineStyle: definition.character.underlineStyle,
          underlineWordMode: definition.character.underlineWordMode ?? current.underlineWordMode,
        }
      : {}),
    ...(controls.has("ulc") ? { underlineColor: definition.character.underlineColor } : {}),
    ...(controls.has("strike") || controls.has("striked")
      ? { strikeout: definition.character.strikeout }
      : {}),
    ...(controls.has("super") || controls.has("sub") || controls.has("up") || controls.has("dn")
      ? { escapement: definition.character.escapement }
      : {}),
    ...(controls.has("f") ? { fontFamily: definition.character.fontFamily } : {}),
    ...(controls.has("fs") ? { fontSizeTwips: definition.character.fontSizeTwips } : {}),
    ...(controls.has("cf") ? { color: definition.character.color } : {}),
    ...(controls.has("highlight") ? { highlight: definition.character.highlight } : {}),
  };
  if (definition.baselineHalfPoints !== undefined) {
    const position = definition.baselineHalfPoints;
    // DomainMapper deliberately substitutes automatic superscript for positive paragraph-style positions (WRITER142).
    target = {
      ...target,
      escapement:
        position > 0 && collection instanceof SwTextFormatColl
          ? { offset: DFLT_ESC_AUTO_SUPER, height: DFLT_ESC_PROP }
          : {
              offset: resolveRtfBaseline(
                position,
                target.fontSizeTwips ??
                  (
                    collection.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
                  ).GetHeight(),
              ),
              height: target.escapement?.height ?? 100,
            },
    };
  }
  const characterFormat = createSwFormatAutoFormat(
    collection.GetAttrSet().GetDoc().GetAttrPool(),
    target,
    current,
  );
  try {
    for (const item of characterFormat.GetStyleHandle().entries()) collection.SetFormatAttr(item);
  } finally {
    characterFormat.Dispose();
  }
  if (definition.autoKerning !== undefined)
    collection.SetFormatAttr(new SvxAutoKernItem(definition.autoKerning, RES_CHRATR_AUTOKERN));
  if (!(collection instanceof SwTextFormatColl)) return;
  const paragraph = definition.paragraph;
  if (
    ["ql", "qc", "qr", "qj", "qd"].some(
      /** Computes the name result. @param name - Name. @returns The computed result. */ (name) =>
        controls.has(name),
    )
  ) {
    const adjust = new SvxAdjustItem(getSvxAdjust(paragraph.alignment), RES_PARATR_ADJUST);
    if (paragraph.distributeLastLine) adjust.SetLastBlock(SvxAdjust.Block);
    collection.SetFormatAttr(adjust);
  }
  // createStyleProperties removes zero indents only when no basedOn exists.
  const hasBase = definition.basedOnStyleIndex !== undefined;
  if ((controls.has("li") || controls.has("lin")) && (hasBase || paragraph.left !== 0))
    collection.SetFormatAttr(
      new SvxTextLeftMarginItem(SvxIndentValue.twips(paragraph.left), RES_MARGIN_TEXTLEFT),
    );
  if ((controls.has("ri") || controls.has("rin")) && (hasBase || paragraph.right !== 0))
    collection.SetFormatAttr(
      new SvxRightMarginItem(SvxIndentValue.twips(paragraph.right), RES_MARGIN_RIGHT),
    );
  if ((controls.has("fi") || controls.has("li")) && (hasBase || paragraph.firstLine !== 0))
    collection.SetFormatAttr(
      new SvxFirstLineIndentItem(SvxIndentValue.twips(paragraph.firstLine), RES_MARGIN_FIRSTLINE),
    );
  if (controls.has("sb") || controls.has("sa") || controls.has("contextualspace")) {
    const spacing = (collection.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).Clone();
    if (controls.has("sb")) spacing.SetUpper(paragraph.before);
    if (controls.has("sa")) spacing.SetLower(paragraph.after);
    if (controls.has("contextualspace")) spacing.SetContextValue(paragraph.contextual);
    collection.SetFormatAttr(spacing);
  }
  if (controls.has("keepn"))
    collection.SetFormatAttr(new SfxBoolItem(RES_KEEP, paragraph.keepNext));
  if (controls.has("keep"))
    collection.SetFormatAttr(new SfxBoolItem(RES_PARATR_SPLIT, !paragraph.keepTogether));
  if (controls.has("widctlpar") || controls.has("nowidctlpar"))
    collection.SetFormatAttr(new SfxInt16Item(RES_PARATR_WIDOWS, paragraph.widowControl ? 2 : 0));
  if (controls.has("tx")) collection.SetFormatAttr(createRtfTabStops(paragraph.tabStops));
  if (controls.has("sl") || controls.has("slmult"))
    collection.SetFormatAttr(createRtfLineSpacing(paragraph));
  const borders = paragraphBorderBox(
    collection.GetAttrSet().Get(RES_BOX) as SvxBoxItem,
    paragraph,
    this["colors"],
  );
  if (borders !== undefined) collection.SetFormatAttr(borders);
  if (paragraph.borders?.has("between"))
    collection.SetFormatAttr(new SfxBoolItem(RES_PARATR_CONNECT_BORDER, false));
}

/** Applies parsed values through native text and item-set owners. @param node - Target paragraph. @param paragraph - Parsed values.  @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function ApplyParagraph(
  this: RtfDocumentImplContext,
  node: SwTextNode,
  paragraph: RtfParagraph,
): void {
  const style =
    paragraph.state.styleIndex === undefined
      ? undefined
      : this["importedStyles"].get(paragraph.state.styleIndex);
  if (style !== undefined) node.ChgFormatColl(style);
  const section = node.StartOfSectionNode();
  const borders = paragraphBorderBox(
    node.GetAttr(RES_BOX) as SvxBoxItem,
    paragraph.state,
    this["colors"],
    this["previousParagraphs"].get(section),
  );
  if (borders !== undefined) node.SetAttr(borders);
  if (paragraph.state.borders?.has("between"))
    node.SetAttr(new SfxBoolItem(RES_PARATR_CONNECT_BORDER, false));
  this["previousParagraphs"].set(section, node);
  const runs = paragraph.runs.map(
    /** Resolves actual paragraph/character style inheritance before applying direct controls. @param run - Parsed run. @returns Resolved native owners and formatting values. */ (
      run,
    ) => {
      const characterStyle =
        run.characterStyleIndex === undefined
          ? undefined
          : this["importedCharacterStyles"].get(run.characterStyleIndex);
      const inheritedItems = new SfxItemSet(
        node.GetDoc().GetAttrPool(),
        WRITER_CHARACTER_WHICH_RANGES,
      );
      inheritedItems.SetParent(node.GetSwAttrSet());
      try {
        if (characterStyle !== undefined) {
          for (const [first, last] of WRITER_CHARACTER_WHICH_RANGES)
            for (let which = first; which <= last; ++which) {
              const item = characterStyle.GetAttrSet().GetItemIfSet(which, true);
              if (item !== undefined) inheritedItems.Put(item);
            }
        }
        const effective = projectWriterCharacterAttributes(inheritedItems, node.GetSwAttrSet());
        return {
          text: run.text,
          characterStyle,
          inherited: effective,
          ...(run.autoKerning === undefined ? {} : { autoKerning: run.autoKerning }),
          ...(run.hyperlink === undefined ? {} : { hyperlink: run.hyperlink }),
          attributes: resolveRtfRunAttributes(
            run,
            resolveRtfCharacterStyleDefaults(
              run,
              run.currentCharacterStyleIndex === run.characterStyleIndex
                ? inheritedItems
                : node.GetSwAttrSet(),
              effective,
            ),
          ),
        };
      } finally {
        inheritedItems.Dispose();
      }
    },
  );
  node.SetText(
    runs
      .map(
        /** Computes the run result. @param run - Run. @returns The computed result. */ (run) =>
          run.text,
      )
      .join(""),
  );
  const hints = new SwpHints(node.GetDoc().GetAttrPool());
  let offset = 0;
  for (const run of runs) {
    const start = offset;
    offset += run.text.length;
    if (offset === start) continue;
    if (run.characterStyle !== undefined) {
      const item = new SwFormatCharFormat(run.characterStyle);
      try {
        hints.Insert(MakeTextAttr(node.GetDoc(), item, start, offset));
      } finally {
        item.Dispose();
      }
    }
    const format = createSwFormatAutoFormat(
      node.GetDoc().GetAttrPool(),
      run.attributes,
      run.inherited,
    );
    const items = format.GetStyleHandle().Clone();
    if (run.autoKerning !== undefined)
      items.Put(new SvxAutoKernItem(run.autoKerning, RES_CHRATR_AUTOKERN));
    try {
      if (items.Count() > 0) hints.Insert(MakeTextAttr(node.GetDoc(), items, start, offset));
    } finally {
      items.Dispose();
      format.Dispose();
    }
    if (run.hyperlink !== undefined)
      hints.Insert(new SwTextINetFormat(new SwFormatINetFormat(run.hyperlink), start, offset));
  }
  node.SetTextHints(hints);
  for (const mark of paragraph.marks)
    node.GetDoc().GetIDocumentMarkAccess().MakeMark(node, mark.offset, mark.name);
  if (paragraph.state.alignmentSet) {
    const adjust = new SvxAdjustItem(getSvxAdjust(paragraph.state.alignment), RES_PARATR_ADJUST);
    if (paragraph.state.distributeLastLine) adjust.SetLastBlock(SvxAdjust.Block);
    node.SetAttr(adjust);
  }
  if (paragraph.state.leftSet) node.SetParagraphTextLeftMargin(paragraph.state.left);
  if (paragraph.state.firstLineSet) node.SetParagraphFirstLineIndent(paragraph.state.firstLine);
  if (paragraph.state.rightSet) node.SetParagraphRightMargin(paragraph.state.right);
  if (paragraph.state.beforeSet || paragraph.state.afterSet || paragraph.state.contextualSet) {
    const spacing = (node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).Clone();
    if (paragraph.state.beforeSet) spacing.SetUpper(paragraph.state.before);
    if (paragraph.state.afterSet) spacing.SetLower(paragraph.state.after);
    if (paragraph.state.contextualSet) spacing.SetContextValue(paragraph.state.contextual);
    node.SetAttr(spacing);
  }
  if (paragraph.state.keepNextSet)
    node.SetAttr(new SfxBoolItem(RES_KEEP, paragraph.state.keepNext));
  if (paragraph.state.keepTogetherSet)
    node.SetAttr(new SfxBoolItem(RES_PARATR_SPLIT, !paragraph.state.keepTogether));
  if (paragraph.state.widowControlSet)
    node.SetAttr(new SfxInt16Item(RES_PARATR_WIDOWS, paragraph.state.widowControl ? 2 : 0));
  if (paragraph.state.tabStopsSet) node.SetAttr(createRtfTabStops(paragraph.state.tabStops));
  if (paragraph.state.pageBreakBeforeSet)
    node.SetAttr(new SfxInt16Item(RES_BREAK, paragraph.state.pageBreakBefore ? 4 : 0));
  if (paragraph.state.lineSpacingSet) node.SetAttr(createRtfLineSpacing(paragraph.state));
  const override = paragraph.state.listOverride;
  if (override !== undefined) {
    const sourceList = this["listOverrides"].get(override),
      format =
        sourceList === undefined
          ? undefined
          : this["listFormats"].get(sourceList)?.[paragraph.state.listLevel];
    if (format !== undefined) {
      applyWriterParagraphList(node, {
        kind: format.kind,
        level: paragraph.state.listLevel,
        listId: `RTF-list-${override}`,
      });
      const rule = node.GetNumRule();
      if (rule !== undefined) {
        const native = new SwNumFormat(rule.Get(paragraph.state.listLevel));
        native.SetNumberingType(format.numberingType);
        native.SetStart(format.start);
        if (format.kind === "bullet" && format.bullet !== undefined)
          native.SetBulletChar(format.bullet);
        rule.Set(paragraph.state.listLevel, native);
        node.GetDoc().GetDocumentListsManager().InvalidateAllLists();
      }
    }
  }
}

import type { SwCharFormat } from "../../../inc/charfmt";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";

import { resolveRtfCharacterStyleDefaults } from "./rtfdocumentimpl.character";
