/** @fileoverview Maps RTF tokenizer events into native Writer nodes following rtftok/rtfdocumentimpl.cxx. */
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { SwStartNode } from "../../core/docnode/node";
import { equalWriterHyperlinks } from "../../core/txtnode/fmtatr2";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import { RTF_FONT_SUFFIX_CODEPAGE } from "./rtfcharsets";
import {
  DEFAULT_PARAGRAPH,
  equalCharacter,
  equalControls,
  type RtfBlock,
  type RtfCellBorder,
  type RtfParagraph,
  type RtfParagraphState,
  type RtfRun,
  type RtfState,
  type RtfTableRow,
} from "./rtfdocumentimpl.context";
import { DecodeBytes } from "./rtfdocumentimpl.decode";
import { Dispatch, DispatchBodyControl } from "./rtfdocumentimpl.dispatch";
import { ApplyParagraph, ApplyStyleDefinition, Finish } from "./rtfdocumentimpl.document";
import { RtfTokenizer, type RtfToken } from "./rtftokenizer";

/** Imports a represented RTF body without coupling the tokenizer to browser I/O. */
export class RtfDocumentImpl {
  protected m_pMapperStream: DomainMapper | undefined;
  /** Original stream accessor for the actual current mapper. @returns Borrowed mapper. */
  protected Mapper(): DomainMapper {
    if (this.m_pMapperStream === undefined) throw new Error("assert(mapper stream initialized)");
    return this.m_pMapperStream;
  }
  protected readonly states: RtfState[] = [];
  protected m_bNeedPap = true;
  protected m_aParagraphSprms = new RTFSprms();
  protected readonly m_aDefaultCharacterSprms = new RTFSprms();
  /** Original first-run initialization supplies the requested default ASCII font only where a group has none. Settings/section callbacks remain on their existing owners. @returns Nothing. */
  protected checkFirstRun(): void {
    if (!this.firstRun) return;
    this.firstRun = false;
    const font = getNestedAttribute(
      this.m_aDefaultCharacterSprms,
      N.LN_EG_RPrBase_rFonts,
      N.LN_CT_Fonts_ascii,
    );
    try {
      if (!font.is()) return;
      for (const state of this.states) {
        const current = getNestedAttribute(
          state.characterSprms,
          N.LN_EG_RPrBase_rFonts,
          N.LN_CT_Fonts_ascii,
        );
        try {
          if (!current.is())
            putNestedAttribute(
              state.characterSprms,
              N.LN_EG_RPrBase_rFonts,
              N.LN_CT_Fonts_ascii,
              font,
            );
        } finally {
          current.dispose();
        }
      }
    } finally {
      font.dispose();
    }
  }
  /** Captures source paragraph properties when the stream first needs them. The atomic reader retains this emitted value until materialization. @param state - Actual current group. @returns Nothing. */
  protected checkNeedPap(state: RtfState): void {
    if (!this.m_bNeedPap) return;
    this.m_bNeedPap = false;
    this.m_aParagraphSprms.dispose();
    this.m_aParagraphSprms = GetNumberingProperties.call(this, state.paragraphSprms);
  }
  protected readonly blocks: RtfBlock[] = [];
  protected readonly runs: RtfRun[] = [];
  protected readonly marks: { name: string; offset: number }[] = [];
  protected readonly fonts = new Map<number, string>();
  protected readonly fontCodepages = new Map<number, number>();
  protected defaultCodepage = 1252;
  protected defaultFontIndex = -1;
  protected readonly colors: string[] = [];
  protected readonly m_aListTableSprms = new RTFSprms();
  protected readonly m_aListTable = new Map<number, SvRef<RTFValue>>();
  protected readonly m_aListOverrideTable = new Map<number, number>();
  protected readonly m_aInvalidListLevelFirstIndents = new Map<number, number>();
  protected readonly m_aInvalidListTableFirstIndents = new Map<
    number,
    ReadonlyMap<number, number>
  >();
  protected m_nListLevel = -1;
  protected readonly m_aListTables: import("./rtfreferencetable").RTFReferenceTable[] = [];
  protected readonly styles = new Map<number, RtfStyleDefinition>();
  protected readonly m_pStyleTableEntries = new Map<number, ReferencePointer<Properties>>();
  protected readonly m_aStyleNames = new Map<number, string>();
  /** Releases original raw style reference members at the existing atomic import boundary. @returns Nothing. */
  protected ClearStyleTable(): void {
    for (const pointer of this.m_pStyleTableEntries.values()) pointer.clear();
    this.m_pStyleTableEntries.clear();
  }
  /** Releases actual run snapshots at the atomic reader lifetime boundary, including incomplete table buffers on parse failure. A temporary identity set follows shared references to the same parsed run, not a second resource registry. @returns Nothing. */
  protected ClearCharacterProperties(): void {
    const lists = new Set<RTFSprms>();
    const paragraph =
      /** Visits actual parsed paragraph owners. @param value - Paragraph. @returns Nothing. */ (
        value: RtfParagraph,
      ) => {
        for (const run of value.runs) lists.add(run.characterSprms);
        if (value.paragraphSprms) lists.add(value.paragraphSprms);
        if (value.marker) lists.add(value.marker.characterSprms);
      };
    const rows = /** Visits original parsed table rows. @param values - Rows. @returns Nothing. */ (
      values: readonly RtfTableRow[],
    ) => {
      for (const row of values)
        for (const cell of row.cells) for (const value of cell) paragraph(value);
    };
    for (const state of this.states) {
      state.destinationText.dispose();
      lists.add(state.characterSprms);
      lists.add(state.paragraphSprms);
      lists.add(state.sectionSprms);
      lists.add(state.tableSprms);
      lists.add(state.tableAttributes);
      lists.add(state.listLevelEntries);
    }
    lists.add(this.m_aDefaultSectionSprms);
    for (const section of this.m_aSectionSprms.values()) lists.add(section);
    this.m_aSectionSprms.clear();
    lists.add(this.m_aParagraphSprms);
    lists.add(this.m_aDefaultCharacterSprms);
    for (const run of this.runs) lists.add(run.characterSprms);
    for (const block of this.blocks)
      if (block.kind === "paragraph") paragraph(block.paragraph);
      else rows(block.rows);
    rows(this.tableRows);
    for (const cell of this.tableRow) for (const value of cell) paragraph(value);
    for (const value of this.tableCell) paragraph(value);
    lists.add(this.m_aListTableSprms);
    for (const table of this.m_aListTables) table.dispose();
    this.m_aListTables.length = 0;
    for (const value of this.m_aListTable.values()) value.clear();
    this.m_aListTable.clear();
    this.m_aListOverrideTable.clear();
    this.m_aInvalidListLevelFirstIndents.clear();
    this.m_aInvalidListTableFirstIndents.clear();
    this.m_nListLevel = -1;
    for (const list of lists) list.dispose();
    this.states.length = 0;
    this.runs.length = 0;
    this.blocks.length = 0;
    this.tableRows.length = 0;
    this.tableRow.length = 0;
    this.tableCell.length = 0;
  }
  protected readonly importedStyles = new Map<number, SwTextFormatColl>();
  protected readonly importedCharacterStyles = new Map<number, SwCharFormat>();
  protected readonly previousParagraphs = new Map<SwStartNode, SwTextNode>();
  protected fontName = "";
  protected color = { red: 0, green: 0, blue: 0 };
  protected sawHeader = false;
  protected terminatedParagraph = false;
  protected tableRows: RtfTableRow[] = [];
  protected tableRow: RtfParagraph[][] = [];
  protected tableCell: RtfParagraph[] = [];
  protected rowBoundaries: number[] = [];
  protected rowAlignment: "left" | "center" | "right" = "left";
  protected rowLeft = 0;
  protected rowHeight = 0;
  protected rowSplit = true;
  protected rowHeader = false;
  protected rowVerticals: (VertOrientation | undefined)[] = [];
  protected nextCellVertical: VertOrientation | undefined;
  protected rowBorders: Map<SvxBoxItemLine, RtfCellBorder>[] = [];
  protected nextCellBorders = new Map<SvxBoxItemLine, RtfCellBorder>();
  protected activeBorder: RtfCellBorder | undefined;
  protected rowPaddings: Map<SvxBoxItemLine, number>[] = [];
  protected nextCellPaddings = new Map<SvxBoxItemLine, number>();
  protected rowDefaultPaddings = new Map<SvxBoxItemLine, number>();
  protected inTable = false;
  protected defaultTabStop = 720;
  protected firstRun = true;
  protected pendingPageBreak = false;
  protected readonly m_aDefaultSectionSprms = new RTFSprms();
  protected readonly m_aSectionSprms = new Map<number, RTFSprms>();
  protected m_bNeedPar = true;
  protected currentSection = 0;

  /** Resolves source bytes with live group/font encoding feedback to the tokenizer.  @param bytes - Bytes. @param options - Options. @returns The SwDoc result. */
  public ResolveBytes(bytes: Uint8Array, options: SwDocOptions = {}): SwDoc {
    try {
      new RtfTokenizer(bytes).Parse(
        /** Computes the token result. @param token - Token. @returns The computed result. */ (
          token,
        ) => this.Dispatch(token),
        /** Computes the callback result. @returns The computed result. */ () =>
          this.states.at(-1)?.currentCodepage ?? this.defaultCodepage,
      );
      return this.Finish(options);
    } finally {
      this.ClearStyleTable();
      this.ClearCharacterProperties();
    }
  }

  /** Resolves already-lexed events into a fresh Writer document.  @param tokens - Tokens. @param options - Options. @returns The SwDoc result. */
  public Resolve(tokens: readonly RtfToken[], options: SwDocOptions = {}): SwDoc {
    try {
      for (const token of tokens) this.Dispatch(token);
      return this.Finish(options);
    } finally {
      this.ClearStyleTable();
      this.ClearCharacterProperties();
    }
  }

  /** Materializes the parsed blocks only after the complete stream is valid.  @param options - Options. @returns The SwDoc result. */
  protected Finish(options: SwDocOptions): SwDoc {
    return Finish.call(this, options);
  }

  /** Installs represented RTF stylesheet properties on the document-owned collection.  @param collection - Collection. @param definition - Definition. @param properties - Original deduplicated native style properties. @returns Nothing. */
  protected ApplyStyleDefinition(
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
    return ApplyStyleDefinition.call(this, collection, definition, properties);
  }

  /** Applies parsed values through native text and item-set owners. @param node - Target paragraph. @param paragraph - Parsed values.  @returns Nothing. */
  protected ApplyParagraph(node: SwTextNode, paragraph: RtfParagraph): void {
    return ApplyParagraph.call(this, node, paragraph);
  }

  /** Dispatches one lexical event under the current group state. @param token - Source event.  @returns Nothing. */
  protected Dispatch(token: RtfToken): void {
    return Dispatch.call(this, token);
  }

  /** Applies one represented body control. @param name - RTF control. @param parameter - Optional value. @param state - Current group.  @returns Nothing. */
  protected DispatchBodyControl(
    name: string,
    parameter: number | undefined,
    state: RtfState,
  ): void {
    return DispatchBodyControl.call(this, name, parameter, state);
  }

  /** Appends text with group-scoped character state. @param value - Visible text. @param state - Current group.  @returns Nothing. */
  protected AppendText(value: string, state: RtfState): void {
    if (value.length === 0) return;
    this.checkFirstRun();
    this.checkNeedPap(state);
    if (!this.inTable && this.tableRows.length > 0) this.FlushTable();
    const previous = this.runs.at(-1);
    if (
      previous !== undefined &&
      equalWriterHyperlinks(previous.hyperlink, state.hyperlink) &&
      equalControls(previous.controls, state.characterControls) &&
      previous.characterSprms.equals(state.characterSprms) &&
      previous.autoKerning === state.autoKerning &&
      previous.characterStyleIndex === state.characterStyleIndex &&
      previous.paragraphStyleIndex === state.paragraph.styleIndex &&
      previous.currentCharacterStyleIndex === state.currentCharacterStyleIndex &&
      equalCharacter(previous.attributes, state.character)
    )
      this.runs[this.runs.length - 1] = { ...previous, text: previous.text + value };
    else this.runs.push(this.SnapshotRun(value, state));
    this.terminatedParagraph = false;
  }

  /** Captures original runProps input at the atomic import boundary, including empty paragraph markers. @param value - Native text. @param state - Current group. @returns Owned state snapshot. */
  protected SnapshotRun(value: string, state: RtfState): RtfRun {
    return {
      text: value,
      characterSprms: new RTFSprms(state.characterSprms),
      attributes: { ...state.character },
      ...(state.paragraph.styleIndex === undefined
        ? {}
        : { paragraphStyleIndex: state.paragraph.styleIndex }),
      ...(state.currentCharacterStyleIndex === undefined
        ? {}
        : { currentCharacterStyleIndex: state.currentCharacterStyleIndex }),
      ...(state.characterStyleIndex === undefined
        ? {}
        : { characterStyleIndex: state.characterStyleIndex }),

      ...(state.autoKerning === undefined ? {} : { autoKerning: state.autoKerning }),
      controls: new Set(state.characterControls),
      ...(state.hyperlink === undefined ? {} : { hyperlink: state.hyperlink }),
    };
  }

  /** Completes a paragraph at native \par or document end. @param state - Current group. @param marker - Capture PAR run properties. @returns Nothing. */
  protected CommitParagraph(state = this.states.at(-1), marker = false): void {
    this.checkFirstRun();
    if (state) this.checkNeedPap(state);
    const paragraph: RtfParagraph = {
      paragraphSprms: new RTFSprms(this.m_aParagraphSprms),
      ...(marker && state ? { marker: this.SnapshotRun("", state) } : {}),
      runs: this.runs.splice(0),
      state: {
        ...(state?.paragraph ?? DEFAULT_PARAGRAPH),
        ...(this.pendingPageBreak && !this.inTable
          ? { pageBreakBefore: true, pageBreakBeforeSet: true }
          : {}),
      },
      marks: this.marks.splice(0),
    };
    if (this.inTable) this.tableCell.push(paragraph);
    else {
      this.blocks.push({ kind: "paragraph", paragraph, section: this.currentSection });
      this.pendingPageBreak = false;
    }
    this.terminatedParagraph = true;
    this.m_bNeedPar = false;
    this.m_bNeedPap = true;
  }

  /** Completes rows as one native table block.  @returns Nothing. */
  protected FlushTable(): void {
    if (this.tableRows.length === 0) return;
    this.blocks.push({
      kind: "table",
      rows: this.tableRows.splice(0),
      section: this.currentSection,
      pageBreakBefore: this.pendingPageBreak,
    });
    this.pendingPageBreak = false;
  }

  /** Adds one font-family table token. @param value - Font text. @param state - Current group.  @returns Nothing. */
  protected ReadFontText(value: string, state: RtfState): void {
    for (const character of value) {
      if (character === ";") this.CommitFont(state);
      else this.fontName += character;
    }
  }

  /** Completes the current font table entry. @param state - Current group.  @returns Nothing. */
  protected CommitFont(state: RtfState): void {
    const name = this.fontName.trim();
    if (name.length > 0) {
      const lastSpace = name.lastIndexOf(" ");
      const suffix =
        lastSpace < 0 ? undefined : RTF_FONT_SUFFIX_CODEPAGE.get(name.slice(lastSpace + 1));
      this.fonts.set(state.fontIndex, suffix === undefined ? name : name.slice(0, lastSpace));
      if (suffix !== undefined || state.fontCodepage !== undefined)
        this.fontCodepages.set(
          state.fontIndex,
          suffix ?? state.fontCodepage ?? this.defaultCodepage,
        );
    }
    this.fontName = "";
  }

  /** Converts ANSI bytes only after the current group and selected font are known.  @param bytes - Bytes. @param state - State. @returns The string result. */
  protected DecodeBytes(bytes: Uint8Array, state: RtfState): string {
    return DecodeBytes.call(this, bytes, state);
  }

  /** Adds color table entries separated by semicolons. @param value - Color table text.  @returns Nothing. */
  protected ReadColorText(value: string): void {
    for (const character of value)
      if (character === ";") {
        const { red, green, blue } = this.color;
        this.colors.push(
          `#${[red, green, blue].map(/** Computes the channel result. @param channel - Channel. @returns The computed result. */ (channel) => channel.toString(16).padStart(2, "0")).join("")}`,
        );
        this.color = { red: 0, green: 0, blue: 0 };
      }
  }
}

import type { SwCharFormat } from "../../../inc/charfmt";

import type { DomainMapper } from "../dmapper/DomainMapper";

import type { ReferencePointer, Properties } from "../inc/dmapper/resourcemodel";
import type { RtfStyleDefinition } from "./rtfdocumentimpl.context";

import { RTFSprms } from "./rtfsprm";

import { getNestedAttribute, putNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";

import { SvRef } from "../../../../tools/inc/ref";
import { RTFValue } from "./rtfvalue";
import { GetNumberingProperties } from "./rtfdocumentimpl.numbering";
