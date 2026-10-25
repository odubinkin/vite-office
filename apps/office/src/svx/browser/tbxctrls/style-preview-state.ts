/** @fileoverview Browser owner of native SvxStyleBox optional font members and actual entry-size measurements;style pool and commands remain in the owning document/frame. */
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { StyleToolboxEntry } from "./style-toolbox-control";
import type { StylePreviewFonts } from "../../source/tbxctrls/tbcontrl.stylerender";
import type { StylePreviewColorItems } from "../../source/tbxctrls/tbcontrl.stylecolor";
import { setupStylePreviewFonts } from "../../source/tbxctrls/tbcontrl.stylepreview";
import { stylePreviewLogicToCssPixel } from "../../../vcl/browser/style-preview-device";
/** Browser owner for the original style box's optional fonts and measured item width. It stores UI metrics only;the document retains the style pool. */
export class BrowserStylePreviewState {
  private fonts: StylePreviewFonts = {};
  private readonly widths = new Map<string, number>();
  private readonly listeners = new Set<() => void>();
  /** Seeds only actual entry-size slots,not document style values. @param entries - Current native identity projection. @returns UI state. */
  constructor(entries: readonly Pick<StyleToolboxEntry, "id">[]) {
    for (const entry of entries) this.widths.set(entry.id, 0);
  }
  /** Prepares the original persistent optional-font members only after real pool lookup. @param set - Actual preview set or no style. @param unit - Actual current shell unit. @returns Current source optional fonts. */
  public Prepare(set: SfxItemSet | undefined, unit: MapUnit | undefined): StylePreviewFonts {
    if (set !== undefined)
      this.fonts = setupStylePreviewFonts(set, this.fonts, unit, stylePreviewLogicToCssPixel);
    return this.fonts;
  }
  /** Publishes actual measured browser item extents for source optimal-width calculation. @param id - Real entry identity. @param width - Measured source extent plus actual host padding. @returns Nothing. */
  public ReportWidth(id: string, width: number): void {
    if (this.widths.get(id) === width) return;
    this.widths.set(id, width);
    for (const listener of this.listeners) listener();
  }
  /** Actual external-store snapshot for popup sizing. @returns Maximum measured width. */
  public readonly GetWidth =
    /** Reads actual measured entry extents. @returns Maximum width. */ (): number => {
      let width = 0;
      for (const value of this.widths.values()) width = Math.max(width, value);
      return width;
    };
  /** Binds only browser UI layout subscribers. @param listener - Actual mounted controller listener. @returns Release callback. */
  public readonly Subscribe =
    /** Binds actual mounted layout observers. @param listener - Subscriber. @returns Release callback. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Releases the actual UI subscriber. @returns Nothing. */ () => {
        this.listeners.delete(listener);
      };
    };
}

/** Actual owning controller ports;style pool and shell units remain outside the generic browser row. */
export interface StylePreviewSource {
  readonly getItemSet: () => SfxItemSet | undefined;
  readonly mapUnit: MapUnit | undefined;
  readonly controller: BrowserStylePreviewState;
  readonly colors?: StylePreviewColorItems;
}
