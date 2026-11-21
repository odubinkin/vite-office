/** @fileoverview Native Calc header and footer dialog variants and owned item-set exchange. */
import { ScPageHFItem } from "../../../inc/attrib";
import {
  ATTR_PAGE,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_ON,
  ATTR_PAGE_SHARED,
  ATTR_PAGE_HEADERFIRST,
  ATTR_PAGE_HEADERRIGHT,
  ATTR_PAGE_HEADERLEFT,
  ATTR_PAGE_FOOTERFIRST,
  ATTR_PAGE_FOOTERRIGHT,
  ATTR_PAGE_FOOTERLEFT,
} from "../../../inc/scitems";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxPageItem, SvxPageUsage, type SvxSetItem } from "../../../../svx/inc/pageitem";
import { CellAttributeHelper } from "../../core/data/patattr";
import { ScHFEditPage } from "./scuitphfedit";
import type { ScHeaderFieldData } from "../../core/tool/editutil";

const header = {
  first: ATTR_PAGE_HEADERFIRST,
  right: ATTR_PAGE_HEADERRIGHT,
  left: ATTR_PAGE_HEADERLEFT,
} as const;
const footer = {
  first: ATTR_PAGE_FOOTERFIRST,
  right: ATTR_PAGE_FOOTERRIGHT,
  left: ATTR_PAGE_FOOTERLEFT,
} as const;
/** Original first, right and left page variants. */
type PageVariant = keyof typeof header;

/** A source content tab and its native page style item identity. */
interface HFPane {
  readonly label: string;
  readonly which: number;
}

/** Original dialog layout chosen by the standalone command or page-style tab. */
export interface ScHFEditLayout {
  readonly title: string;
  readonly panes: readonly HFPane[];
  readonly single?: true;
}

/** Admitted draft settings for the original ScHFPage Edit button. */
export interface ScHFPageEditorSettings {
  readonly header: boolean;
  readonly shared: boolean;
  readonly sharedFirst: boolean;
  readonly shareSides: boolean;
  readonly usage: SvxPageUsage;
}

/** Builds one original header/footer position and its label. @param isHeader - Header versus footer. @param position - Native page occurrence. @param shared - Shared caption. @returns Content pane. */
function pane(isHeader: boolean, position: PageVariant, shared = false): HFPane {
  const name = isHeader ? "Header" : "Footer";
  return {
    which: (isHeader ? header : footer)[position],
    label: shared ? name : `${name} (${position})`,
  };
}

/** Builds a source group in fixed first/right/left order. @param isHeader - Header versus footer. @param sides - Independent left and right controls. @param first - Independent first-page control. @returns Native panes. */
function group(isHeader: boolean, sides = true, first = true): HFPane[] {
  const panes: HFPane[] = [];
  if (first) panes.push(pane(isHeader, "first"));
  panes.push(pane(isHeader, "right", !sides && first));
  if (sides) panes.push(pane(isHeader, "left"));
  return panes;
}

/** Reads the two flags used by the source document shell. @param items - Page style. @param which - Header or footer set. @returns Flags. */
function flags(items: SfxItemSet, which: number) {
  const set = (items.Get(which) as SvxSetItem).GetItemSet();
  return {
    on: (set.Get(ATTR_PAGE_ON) as SfxBoolItem).GetValue(),
    shared: (set.Get(ATTR_PAGE_SHARED) as SfxBoolItem).GetValue(),
  };
}

/** Reproduces the standalone ScDocShell dialog resource choice. @param items - Content and layout of the active style. @returns Dialog layout, or disabled when both are off. */
export function StandaloneHeaderFooterLayout(items: SfxItemSet): ScHFEditLayout | undefined {
  const h = flags(items, ATTR_PAGE_HEADERSET);
  const f = flags(items, ATTR_PAGE_FOOTERSET);
  if (!h.on && !f.on) return undefined;
  const usage = (items.Get(ATTR_PAGE) as SvxPageItem).GetPageUsage();
  const oneSide = usage === SvxPageUsage.Left || usage === SvxPageUsage.Right;
  const active = (isHeader: boolean, shared: boolean) =>
    pane(
      isHeader,
      usage === SvxPageUsage.Left && !shared ? "left" : "right",
      usage !== SvxPageUsage.Left,
    );
  if (h.on && f.on) {
    const panes =
      oneSide || (h.shared && f.shared)
        ? [active(true, h.shared), active(false, f.shared)]
        : [...group(true, !h.shared), ...group(false, !f.shared)];
    return { title: "Headers/Footers", panes };
  }
  const isHeader = h.on;
  const shared = isHeader ? h.shared : f.shared;
  if (!oneSide && !shared)
    return { title: isHeader ? "Headers" : "Footers", panes: group(isHeader) };
  const entry = pane(isHeader, usage === SvxPageUsage.Left && !shared ? "left" : "right");
  return { title: entry.label, panes: [entry] };
}

/** Reproduces the nested ScHFPage Edit resource choice using uncommitted page-style settings. @param state - Current parent dialog settings. @returns Native layout. */
export function NestedHeaderFooterLayout(state: ScHFPageEditorSettings): ScHFEditLayout {
  const sides = state.shareSides && !state.shared;
  const first = !state.sharedFirst;
  const name = state.header ? "Header" : "Footer";
  if (!sides && !first) {
    const entry = pane(
      state.header,
      state.usage === SvxPageUsage.Left && !state.shared ? "left" : "right",
    );
    return { title: name, panes: [entry], single: true };
  }
  // The shared-left resource names its remaining shared page explicitly "(right)".
  const panes = group(state.header, sides, first);
  if (!sides) panes[1] = pane(state.header, "right");
  return { title: state.header ? "Headers" : "Footers", panes };
}

/** Actual dialog contents, kept independent from the live style until acceptance. */
export class ScHFEditDlg {
  readonly pages: readonly ScHFEditPage[];
  private readonly visited = new Set<number>([0]);

  /** Owns original item copies and editor pages for one opened dialog. @param items - Current page style, including possible parent edits. @param name - Style name. @param layout - Chosen original dialog resource. @param data - Current view preview data. @returns Dialog session. */
  constructor(
    private readonly items: SfxItemSet,
    readonly name: string,
    readonly layout: ScHFEditLayout,
    data: ScHeaderFieldData,
  ) {
    const type = (items.Get(ATTR_PAGE) as SvxPageItem).GetNumType();
    const pattern = new CellAttributeHelper(items.GetPool()).getDefaultCellAttribute();
    this.pages = layout.panes.map(
      ({ which }) =>
        new ScHFEditPage(
          data,
          type,
          which,
          pattern,
          items.GetItemIfSet(which) as ScPageHFItem | undefined,
        ),
    );
  }

  /** Marks a native tab as opened. @param index - Actual tab. @returns Nothing. */
  Visit(index: number): void {
    this.visited.add(index);
  }

  /** Resets the current original page. @param index - Active tab. @returns Nothing. */
  Reset(index: number): void {
    const entry = this.layout.panes[index];
    if (entry)
      this.pages[index]?.Reset(this.items.GetItemIfSet(entry.which) as ScPageHFItem | undefined);
  }

  /** Produces only the visited source tabs' typed deltas. @returns Owned item set. */
  Output(): SfxItemSet {
    const result = this.items.Clone(false);
    for (const index of this.visited) this.pages[index]?.FillItemSet(result);
    return result;
  }

  /** Releases the editor regions. @returns Nothing. */
  Dispose(): void {
    for (const page of this.pages) page.Dispose();
  }
}
