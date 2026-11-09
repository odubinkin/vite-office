/** @fileoverview RtfDocumentImpl document implementation, called with the original native owner as this. */
import { MakeTextAttr } from "../../core/txtnode/thints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  RES_BREAK,
  RES_BOX,
  RES_PARATR_CONNECT_BORDER,
  RES_KEEP,
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
import { SwpHints } from "../../core/txtnode/ndhints";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { getSvxAdjust } from "../../core/txtnode/ndtxt-hints";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import { StyleSheetTable } from "../dmapper/StyleSheetTable";
import {
  createRtfLineSpacing,
  createRtfTabStops,
  type RtfDocumentImplContext,
  type RtfParagraph,
  type RtfParagraphState,
} from "./rtfdocumentimpl.context";
import { RtfSyntaxError } from "./rtftokenizer";
import { createRtfBorderLine, getRtfBorderDistance } from "./rtfdocumentimpl.border";
import { ConvertFloatingRtfTable } from "../dmapper/DomainMapperTableHandler";
import { MaterializeRtfTable, type PendingRtfTableFrame } from "./rtfdocumentimpl.table";
import type { Color } from "../../../../tools/inc/color";

/** Applies source border ordering and the prior-paragraph between-border adjustment. @param inherited - Effective native box. @param paragraph - Parsed paragraph. @param colors - RTF palette. @param previous - Prior paragraph in this native text section. @returns Authored box when an edge is written. */
function paragraphBorderBox(
  inherited: SvxBoxItem,
  paragraph: RtfParagraphState,
  colors: readonly Readonly<Color>[],
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
    !this["terminatedParagraph"]
  )
    this["CommitParagraph"]();
  this["FlushTable"]();
  const document = new SwDoc(options);
  const model = new SwXTextDocument(document),
    mapper = new DomainMapper(model, SourceDocumentType.RTF);
  this["m_pMapperStream"] = mapper;
  const pendingTableFrames: PendingRtfTableFrame[] = [];
  let complete = false;
  let nativeStyles: Map<number, ReferencePointer<Properties>> | undefined;
  try {
    nativeStyles = deduplicateRtfStyleTable(this["m_pStyleTableEntries"]);
    const settings = this["m_pSettingsTable"].get();
    if (settings) mapper.table(N.LN_settings_settings, settings);
    const sectionStyles = new Map<
      number,
      { name: string; numOffset?: number; continuous: boolean }
    >();
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
    for (const [index, definition] of [...this["styles"]].sort(
      /** Original reference table uses numeric ID order. @param a - First entry. @param b - Second entry. @returns Order. */ (
        a,
        b,
      ) => a[0] - b[0],
    )) {
      const [name] = StyleSheetTable.ConvertStyleName(definition.name);
      if (definition.styleType === "character") {
        const family = model.getStyleFamilies().GetCharacterStyles();
        const key = unicode(name);
        try {
          if (family.hasByName(key)) {
            const style = family.getStyleByName(key);
            try {
              StyleSheetTable.SetPropertiesToDefault(style);
            } finally {
              style.dispose();
            }
          } else {
            const descriptor = model.createCharacterStyle();
            try {
              family.insertStyleByName(key, descriptor);
            } finally {
              descriptor.dispose();
            }
          }
          const collection =
            name === "Standard"
              ? document.GetDfltCharFormat()
              : document.FindCharFormatByName(
                  SwStyleNameMapper.FillUIName(name, SwGetPoolIdFromName.ChrFmt),
                );
          if (collection === undefined) throw new Error("assert(inserted character style)");
          this["importedCharacterStyles"].set(index, collection);
        } finally {
          key.dispose();
        }
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
    for (const [index, definition] of [...this["styles"]].sort(
      /** Original reference table uses numeric ID order. @param a - First entry. @param b - Second entry. @returns Order. */ (
        a,
        b,
      ) => a[0] - b[0],
    )) {
      const collection =
        definition.styleType === "character"
          ? this["importedCharacterStyles"].get(index)
          : this["importedStyles"].get(index);
      const parent =
        definition.basedOnStyleName === undefined
          ? undefined
          : collection instanceof SwTextFormatColl
            ? document.FindTextFormatCollByName(
                StyleSheetTable.ConvertStyleName(definition.basedOnStyleName || "0")[0],
              )
            : document.FindCharFormatByName(
                SwStyleNameMapper.FillUIName(
                  StyleSheetTable.ConvertStyleName(definition.basedOnStyleName || "0")[0],
                  SwGetPoolIdFromName.ChrFmt,
                ),
              );
      if (collection !== undefined && parent !== undefined && parent !== collection)
        collection.SetDerivedFrom(parent);
      if (collection instanceof SwTextFormatColl) {
        const next =
          definition.nextStyleName === undefined
            ? undefined
            : document.FindTextFormatCollByName(
                StyleSheetTable.ConvertStyleName(definition.nextStyleName || "0")[0],
              );
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
        const definition = this["styles"].get(current);
        const parentName = definition?.basedOnStyleName;
        current =
          parentName === undefined
            ? undefined
            : [...this["styles"]].find(
                /** Selects source-resolved parent identity. @param entry - Parsed definition. @returns Named parent. */ (
                  entry,
                ) =>
                  entry[1].name === (parentName || "0") &&
                  entry[1].styleType === definition?.styleType,
              )?.[0];
      }
      for (const slot of ancestry.reverse()) {
        const definition = this["styles"].get(slot);
        const collection =
          definition?.styleType === "character"
            ? this["importedCharacterStyles"].get(slot)
            : this["importedStyles"].get(slot);
        if (definition !== undefined && collection !== undefined)
          this["ApplyStyleDefinition"](
            collection,
            definition,
            nativeStyles.get(slot) as ReferencePointer<Properties>,
          );
        appliedStyles.add(slot);
      }
    }
    PrepareListNumbering.call(this);
    for (const [id, section] of this["m_aSectionSprms"]) {
      sectionStyles.set(id, ApplyRtfSectionProperties(mapper, section));
    }
    let firstParagraph = true;
    const startedSections = new Set<number>();
    for (const block of this["blocks"]) {
      const sectionStyle = sectionStyles.get(block.section);
      const startsSection = !startedSections.has(block.section);
      startedSections.add(block.section);
      if (block.kind === "paragraph") {
        // A fresh SwDoc owns its initial text node; later nodes are returned by the native constructor.
        const node = firstParagraph
          ? (document.paragraphs[0] as SwTextNode)
          : document.nodes.MakeTextNode();
        this["ApplyParagraph"](node, block.paragraph);
        if (
          startsSection &&
          sectionStyle !== undefined &&
          (sectionStyle.continuous
            ? block.section === 0
            : block.section > 0 ||
              sectionStyle.name !== "Standard" ||
              sectionStyle.numOffset !== undefined)
        )
          node.SetAttr(
            new SwFormatPageDesc(
              sectionStyle.name,
              sectionStyle.continuous ? undefined : sectionStyle.numOffset,
            ),
          );
        firstParagraph = false;
      } else {
        const table = firstParagraph
          ? document.nodes.MakeTableNodeBefore(
              document.paragraphs[0] as SwTextNode,
              "RTF Table",
              {},
            )
          : document.nodes.MakeTableNode("RTF Table");
        if (
          startsSection &&
          sectionStyle !== undefined &&
          (sectionStyle.continuous
            ? block.section === 0
            : block.section > 0 ||
              sectionStyle.name !== "Standard" ||
              sectionStyle.numOffset !== undefined)
        )
          table
            .GetFrameFormat()
            .SetFormatAttr(
              new SwFormatPageDesc(
                sectionStyle.name,
                sectionStyle.continuous ? undefined : sectionStyle.numOffset,
              ),
            );
        if (block.pageBreakBefore)
          table.GetFrameFormat().SetFormatAttr(new SfxInt16Item(RES_BREAK, 4));
        MaterializeRtfTable.call(this, document, table, block.rows, pendingTableFrames);
      }
    }
    for (const pending of pendingTableFrames)
      ConvertFloatingRtfTable(pending.table, pending.position);
    complete = true;
    return document;
  } finally {
    for (const pending of pendingTableFrames) pending.position.dispose();
    for (const pointer of nativeStyles?.values() ?? []) pointer.clear();
    this["m_pMapperStream"] = undefined;
    mapper.dispose();
    model.dispose();
    if (!complete) document.Dispose();
  }
}

/** Installs represented RTF stylesheet properties on the document-owned collection.  @param collection - Collection. @param definition - Definition. @param properties - Original deduplicated native style properties. @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function ApplyStyleDefinition(
  this: RtfDocumentImplContext,
  collection: SwTextFormatColl | SwCharFormat,
  definition: {
    character: WriterCharacterAttributes;
    autoKerning?: boolean;

    paragraph: RtfParagraphState;
    controls: ReadonlySet<string>;
    basedOnStyleIndex?: number;
  },
  properties: ReferencePointer<Properties>,
): void {
  ApplyRtfCharacterStyleProperties(this["Mapper"](), collection, properties);
  const controls = definition.controls;
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
  const propertyPointers: ReferencePointer<Properties>[] = [];
  try {
    const runs = paragraph.runs.map(
      /** Resolves actual paragraph/character style inheritance before applying direct controls. @param run - Parsed run. @returns Resolved native owners and formatting values. */ (
        run,
      ) => {
        const characterStyle =
          run.characterStyleIndex === undefined
            ? undefined
            : this["importedCharacterStyles"].get(run.characterStyleIndex);
        const properties = getRtfCharacterProperties(run, this["m_pStyleTableEntries"]);
        propertyPointers.push(properties);
        return {
          text: run.text,
          characterStyle,
          properties,
          ...(run.hyperlink === undefined ? {} : { hyperlink: run.hyperlink }),
        };
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
    if (paragraph.paragraphSprms)
      ApplyRtfParagraphProperties(this["Mapper"](), node, paragraph.paragraphSprms);
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
      if (run.hyperlink !== undefined)
        hints.Insert(new SwTextINetFormat(new SwFormatINetFormat(run.hyperlink), start, offset));
    }
    node.SetTextHints(hints);
    let nativeOffset = 0;
    for (const run of runs) {
      const start = nativeOffset;
      nativeOffset += run.text.length;
      if (nativeOffset > start)
        ApplyRtfCharacterProperties(this["Mapper"](), node, start, nativeOffset, run.properties);
    }
    if (paragraph.marker)
      ApplyRtfParagraphMarker(
        this["Mapper"](),
        node,
        paragraph.marker,
        this["m_pStyleTableEntries"],
      );
  } finally {
    for (const pointer of propertyPointers) pointer.clear();
  }
  for (const mark of paragraph.marks)
    node.GetDoc().GetIDocumentMarkAccess().MakeMark(node, mark.offset, mark.name);
  if (paragraph.state.alignmentSet) {
    const adjust = new SvxAdjustItem(getSvxAdjust(paragraph.state.alignment), RES_PARATR_ADJUST);
    if (paragraph.state.distributeLastLine) adjust.SetLastBlock(SvxAdjust.Block);
    node.SetAttr(adjust);
  }
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
}

import type { SwCharFormat } from "../../../inc/charfmt";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";

import {
  getRtfCharacterProperties,
  ApplyRtfCharacterProperties,
  ApplyRtfParagraphProperties,
  ApplyRtfParagraphMarker,
} from "./rtfdocumentimpl.character";

import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "../dmapper/DomainMapper";
import type { ReferencePointer, Properties } from "../inc/dmapper/resourcemodel";

import {
  ApplyRtfCharacterStyleProperties,
  deduplicateRtfStyleTable,
} from "./rtfdocumentimpl.character";

import { unicode } from "../../core/unocore/unocrsrhelper";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";

import { PrepareListNumbering } from "./rtfdocumentimpl.numbering";

import { ApplyRtfSectionProperties } from "./rtfdocumentimpl.section";

import { NS_ooxml as N } from "../inc/ooxml/resourceids";
