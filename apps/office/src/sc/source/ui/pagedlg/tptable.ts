/** @fileoverview Original Calc Sheet tab state, scaling choices and item-set output. */
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import { ScPageScaleToItem, ScViewObjectModeItem } from "../../../inc/attrib";
import { ScVObjMode } from "../../../inc/global";
import {
  ATTR_PAGE_CHARTS,
  ATTR_PAGE_DRAWINGS,
  ATTR_PAGE_FIRSTPAGENO,
  ATTR_PAGE_FORMULAS,
  ATTR_PAGE_GRID,
  ATTR_PAGE_HEADERS,
  ATTR_PAGE_NOTES,
  ATTR_PAGE_NULLVALS,
  ATTR_PAGE_OBJECTS,
  ATTR_PAGE_SCALE,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_TOPDOWN,
} from "../../../inc/scitems";

/** Native checkboxes with ordinary page flags. */
export const sheetPrintFlags = [
  ["headers", "Column and row headers", ATTR_PAGE_HEADERS],
  ["grid", "Grid", ATTR_PAGE_GRID],
  ["notes", "Comments", ATTR_PAGE_NOTES],
  ["formulas", "Formulas", ATTR_PAGE_FORMULAS],
  ["zeroes", "Zero values", ATTR_PAGE_NULLVALS],
] as const;

/** Native object visibility checkboxes. */
export const sheetPrintObjects = [
  ["objects", "Objects/Images", ATTR_PAGE_OBJECTS],
  ["charts", "Charts", ATTR_PAGE_CHARTS],
  ["drawings", "Drawing objects", ATTR_PAGE_DRAWINGS],
] as const;

/** Original mutually exclusive list entries. */
export const sheetScaleModes = [
  "Reduce/enlarge printout",
  "Shrink print range(s) to width/height",
  "Shrink print range(s) on number of pages",
] as const;

/** Contents of the original Sheet tab controls. Zero dimensions denote unchecked axes. */
export interface ScTablePageState {
  readonly flags: Readonly<
    Record<(typeof sheetPrintFlags)[number][0] | (typeof sheetPrintObjects)[number][0], boolean>
  >;
  readonly topDown: boolean;
  readonly useFirstPage: boolean;
  readonly firstPage: number;
  readonly scaleMode: 0 | 1 | 2;
  readonly percent: number;
  readonly width: number;
  readonly height: number;
  readonly pages: number;
}

/** Reads an effective native boolean. @param items - Input set. @param which - Page item identity. @returns Effective value. */
function flag(items: SfxItemSet, which: number): boolean {
  return (items.Get(which) as SfxBoolItem).GetValue();
}

/** Reads an effective source unsigned16. @param items - Input set. @param which - Page item identity. @returns Effective value. */
function number(items: SfxItemSet, which: number): number {
  return (items.Get(which) as SfxUInt16Item).GetValue();
}

/** Knows the native Sheet tab's initial values and its item-set output rules. */
export class ScTablePage {
  readonly initial: ScTablePageState;

  /** Resets all original widget values with the native scaling priority. @param input - Actual current page style set. @returns Sheet tab state. */
  constructor(private readonly input: SfxItemSet) {
    const flags = {} as Record<keyof ScTablePageState["flags"], boolean>;
    for (const [key, , which] of sheetPrintFlags) flags[key] = flag(input, which);
    for (const [key, , which] of sheetPrintObjects)
      flags[key] =
        (input.Get(which) as ScViewObjectModeItem).GetValue() === ScVObjMode.VOBJ_MODE_SHOW;

    const first = number(input, ATTR_PAGE_FIRSTPAGENO);
    const percent = number(input, ATTR_PAGE_SCALE);
    const pages = number(input, ATTR_PAGE_SCALETOPAGES);
    const fit = input.Get(ATTR_PAGE_SCALETO) as ScPageScaleToItem;
    const width = fit.GetWidth();
    const height = fit.GetHeight();
    this.initial = {
      flags,
      topDown: flag(input, ATTR_PAGE_TOPDOWN),
      useFirstPage: first !== 0,
      firstPage: first || 1,
      scaleMode: pages ? 2 : width || height ? 1 : 0,
      percent: percent || 100,
      width: width || height ? width : 1,
      height: width || height ? height : 1,
      pages: pages || 1,
    };
  }

  /** Produces original Sheet-tab changes without writing unchanged default items. @param state - Current tab controls. @param output - Dialog output set. @returns Nothing. */
  FillItemSet(state: ScTablePageState, output: SfxItemSet): void {
    const saved = this.initial;
    const explicit = (which: number) => this.input.GetItemState(which) !== SfxItemState.DEFAULT;
    for (const [key, , which] of sheetPrintFlags) {
      if (explicit(which) || state.flags[key] !== saved.flags[key])
        output.Put(new SfxBoolItem(which, state.flags[key]));
    }
    for (const [key, , which] of sheetPrintObjects) {
      if (explicit(which) || state.flags[key] !== saved.flags[key]) {
        output.Put(
          new ScViewObjectModeItem(
            which,
            state.flags[key] ? ScVObjMode.VOBJ_MODE_SHOW : ScVObjMode.VOBJ_MODE_HIDE,
          ),
        );
      }
    }
    if (explicit(ATTR_PAGE_TOPDOWN) || state.topDown !== saved.topDown)
      output.Put(new SfxBoolItem(ATTR_PAGE_TOPDOWN, state.topDown));
    if (
      explicit(ATTR_PAGE_FIRSTPAGENO) ||
      state.useFirstPage !== saved.useFirstPage ||
      (state.useFirstPage && state.firstPage !== saved.firstPage)
    )
      output.Put(
        new SfxUInt16Item(ATTR_PAGE_FIRSTPAGENO, state.useFirstPage ? state.firstPage : 0),
      );

    const noDimensions = !state.width && !state.height;
    const mode = noDimensions ? 0 : state.scaleMode;
    const percent = noDimensions ? 100 : state.percent;
    const modeChanged = mode !== saved.scaleMode;
    if (modeChanged || percent !== saved.percent || explicit(ATTR_PAGE_SCALE))
      output.Put(new SfxUInt16Item(ATTR_PAGE_SCALE, mode === 0 ? percent : 0));
    if (
      modeChanged ||
      state.width !== saved.width ||
      state.width !== saved.height ||
      explicit(ATTR_PAGE_SCALETO)
    )
      output.Put(
        mode === 1 ? new ScPageScaleToItem(state.width, state.height) : new ScPageScaleToItem(),
      );
    if (modeChanged || state.pages !== saved.pages || explicit(ATTR_PAGE_SCALETOPAGES))
      output.Put(new SfxUInt16Item(ATTR_PAGE_SCALETOPAGES, mode === 2 ? state.pages : 0));
  }
}
