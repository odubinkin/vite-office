/** @fileoverview Owns the original Writer Text Grid tab controls and RES_TEXTGRID item exchange. */
import type { SfxItemSet } from "../../../../svl/inc/itemset";
import type { Color } from "../../../../tools/inc/color";
import { RES_TEXTGRID } from "../../../inc/hintids";
import { SwTextGrid, SwTextGridItem } from "../../../inc/tgrditem";

/** Grid tab's page dimensions in reading order and twips. */
export interface SwTextGridPageSize {
  readonly width: number;
  readonly height: number;
}

/** Values from textgridpage.ui's original spin adjustments. */
const NORMAL_MAX_LINES = 154;
const NORMAL_MAX_CHARS = 233;
/** Physical max for the original 56.00 pt metric adjustment. */
export const TEXT_GRID_MAX_METRIC = 1120;

/** Original Text Grid tab after absorbing the dialog's current page dimensions. */
export class SwTextGridPage {
  private size: SwTextGridPageSize;
  private readonly draft: SwTextGridItem;
  private characters = 1;
  private maxCharacters = NORMAL_MAX_CHARS;
  private maxLines = NORMAL_MAX_LINES;
  private modified = false;

  /** Opens the original page and selects its document-wide paper mode. @param input - Actual dialog input. @param size - Page dimensions after the other dialog tabs. @returns Native tab. */
  constructor(input: SfxItemSet, size: SwTextGridPageSize) {
    const original = input.Get(RES_TEXTGRID) as SwTextGridItem;
    const defaults = input.GetPool().GetUserOrPoolDefaultItem(RES_TEXTGRID) as SwTextGridItem;
    this.size = size;
    this.draft = original.Clone();
    this.draft.SetSquaredMode(defaults.IsSquaredMode());
    this.UpdateRanges();
    this.AssignLineCount(original.GetLines() > 0 ? original.GetLines() : this.CalculatedLines());
  }

  /** Releases the draft item. @returns Nothing. */
  public Dispose(): void {
    this.draft.Dispose();
  }

  /** Borrows the draft for binding the tab controls and live preview. @returns Current grid. */
  public GetGrid(): SwTextGridItem {
    return this.draft;
  }

  /** Returns the current count and the two original spin bounds. @returns Widget state. */
  public GetCounts(): { characters: number; maxCharacters: number; maxLines: number } {
    return {
      characters: this.characters,
      maxCharacters: this.maxCharacters,
      maxLines: this.maxLines,
    };
  }

  /** Activates the grid tab using the latest page layout, border and story values. @param size - Page dimensions in reading order. @returns Nothing. */
  public UpdatePageSize(size: SwTextGridPageSize): void {
    if (size.width === this.size.width && size.height === this.size.height) return;
    this.size = size;
    this.UpdateRanges();
    if (!this.draft.IsSquaredMode()) this.AssignLineCount(this.CalculatedLines());
  }

  /** Handles the original grid radio group and its dependent controls. @param type - Active radio value. @returns Nothing. */
  public SetGridType(type: SwTextGrid): void {
    if (type === this.draft.GetGridType()) return;
    this.draft.SetGridType(type);
    if (type !== SwTextGrid.NONE) {
      this.draft.SetPrintGrid(this.draft.IsDisplayGrid());
      this.UpdateTextSize();
    }
    this.modified = true;
  }

  /** Handles the original lines-per-page adjustment. @param lines - User-selected count. @returns Nothing. */
  public SetLinesPerPage(lines: number): void {
    const count = this.AssignLineCount(lines);
    if (!this.draft.IsSquaredMode() && count > 0) {
      this.draft.SetBaseHeight(Math.trunc(this.size.height / count));
    }
    this.modified = true;
  }

  /** Handles the original characters-per-line adjustment. @param characters - User-selected count. @returns Nothing. */
  public SetCharactersPerLine(characters: number): void {
    const count = this.AssignCharacterCount(characters);
    if (count > 0) {
      const width = Math.trunc(this.size.width / count);
      if (this.draft.IsSquaredMode()) {
        this.draft.SetBaseHeight(width);
        this.UpdateLineRange();
      } else {
        this.draft.SetBaseWidth(Math.min(TEXT_GRID_MAX_METRIC, Math.max(1, width)));
      }
    }
    this.modified = true;
  }

  /** Handles editing the maximum base text size. @param height - Size in twips. @returns Nothing. */
  public SetBaseHeight(height: number): void {
    this.draft.SetBaseHeight(height);
    this.UpdateTextSize();
    this.modified = true;
  }

  /** Handles editing the ruby size in squared paper mode. @param height - Size in twips. @returns Nothing. */
  public SetRubyHeight(height: number): void {
    this.draft.SetRubyHeight(height);
    this.UpdateLineRange();
    this.modified = true;
  }

  /** Handles editing the character width in normal paper mode. @param width - Size in twips. @returns Nothing. */
  public SetBaseWidth(width: number): void {
    this.draft.SetBaseWidth(width);
    this.AssignCharacterCount(this.CalculatedCharacters(width));
    this.modified = true;
  }

  /** Handles the original Display grid toggle and its dependent Print grid state. @param display - Checked state. @returns Nothing. */
  public SetDisplayGrid(display: boolean): void {
    this.draft.SetDisplayGrid(display);
    this.draft.SetPrintGrid(display);
    this.modified = true;
  }

  /** Handles the original Print grid toggle. @param print - Checked state. @returns Nothing. */
  public SetPrintGrid(print: boolean): void {
    this.draft.SetPrintGrid(print);
    this.modified = true;
  }

  /** Handles the original snap-to-characters toggle. @param snap - Checked state. @returns Nothing. */
  public SetSnapToChars(snap: boolean): void {
    this.draft.SetSnapToChars(snap);
    this.modified = true;
  }

  /** Handles the original ruby placement toggle. @param below - Checked state. @returns Nothing. */
  public SetRubyTextBelow(below: boolean): void {
    this.draft.SetRubyTextBelow(below);
    this.modified = true;
  }

  /** Handles an original grid color selection. @param color - Actual color. @returns Nothing. */
  public SetColor(color: Color): void {
    this.draft.SetColor(color);
    this.modified = true;
  }

  /** Stores the accepted modified grid with the native normal-paper ruby default. @param output - Dialog's frame item output. @returns Whether the tab exchanged a grid. */
  public FillItemSet(output: SfxItemSet): boolean {
    if (!this.modified) return false;
    const item = this.draft.Clone();
    if (!item.IsSquaredMode()) item.SetRubyHeight(0);
    output.Put(item, true);
    return true;
  }

  /** Resets the dependent ranges and calculated column count. @returns Nothing. */
  private UpdateRanges(): void {
    const squared = this.draft.IsSquaredMode();
    const width = squared ? this.draft.GetBaseHeight() : this.draft.GetBaseWidth();
    const calculated = this.CalculatedCharacters(width);
    this.maxCharacters = squared ? calculated : NORMAL_MAX_CHARS;
    this.AssignCharacterCount(calculated);
    this.UpdateLineRange();
  }

  /** Applies dependent count changes from the original base-size event. @returns Nothing. */
  private UpdateTextSize(): void {
    if (this.draft.IsSquaredMode()) this.UpdateRanges();
    else this.AssignLineCount(this.CalculatedLines());
  }

  /** Updates the original allowed lines on squared paper. @returns Nothing. */
  private UpdateLineRange(): void {
    if (!this.draft.IsSquaredMode()) return;
    this.maxLines = this.CalculatedLines();
    this.AssignLineCount(this.draft.GetLines());
  }

  /** Computes whole lines in the available page area. @returns Line count. */
  private CalculatedLines(): number {
    const height = this.draft.GetBaseHeight();
    const pitch = this.draft.IsSquaredMode() ? height + this.draft.GetRubyHeight() : height;
    return pitch > 0 ? Math.max(0, Math.trunc(this.size.height / pitch)) : 0;
  }

  /** Computes whole characters using the original width fallback. @param width - Cell width in twips. @returns Character count. */
  private CalculatedCharacters(width: number): number {
    return width > 0 ? Math.max(0, Math.trunc(this.size.width / width)) : 45;
  }

  /** Applies a native spin adjustment range. @param count - Requested count. @returns Actual admitted count. */
  private AssignLineCount(count: number): number {
    const lines = Math.min(this.maxLines, Math.max(1, Math.trunc(count)));
    this.draft.SetLines(lines);
    return lines;
  }

  /** Applies a native spin adjustment range. @param count - Requested count. @returns Actual admitted count. */
  private AssignCharacterCount(count: number): number {
    this.characters = Math.min(this.maxCharacters, Math.max(1, Math.trunc(count)));
    return this.characters;
  }
}
