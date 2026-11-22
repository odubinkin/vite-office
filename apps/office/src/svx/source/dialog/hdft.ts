/** @fileoverview Native header/footer tab values and nested item exchange from hdft.cxx. */
import { SvxIndentValue, SvxLRSpaceItem } from "../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { SvxSizeItem } from "../../../editeng/inc/sizeitem";
import { Length, toTwips } from "../../../o3tl/inc/unit_conversion";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { Size } from "../../../tools/inc/gen";
import { SvxSetItem } from "../../inc/pageitem";
import {
  SID_ATTR_PAGE_DYNAMIC,
  SID_ATTR_PAGE_FOOTERSET,
  SID_ATTR_PAGE_HEADERSET,
  SID_ATTR_PAGE_ON,
  SID_ATTR_PAGE_SHARED,
  SID_ATTR_PAGE_SHARED_FIRST,
  SID_ATTR_PAGE_SIZE,
} from "../../inc/svxids";

/** Native page-format Which IDs resolved by the owning module. */
export interface SvxHFPageIds {
  readonly margins: number;
  readonly spacing: number;
  readonly dynamicSpacing: number;
}

/** Original header/footer control state in twips. */
export interface SvxHFPageState {
  readonly enabled: boolean;
  readonly shared: boolean;
  readonly sharedFirst: boolean;
  readonly dynamicHeight: boolean;
  readonly dynamicSpacing: boolean;
  readonly left: number;
  readonly right: number;
  readonly height: number;
  readonly spacing: number;
}

/** Reads a native flag from the supplied nested item set. @param items - Original nested header or footer data. @param which - Native item identity. @returns Flag or absence. */
function flag(items: SfxItemSet | undefined, which: number): boolean | undefined {
  return (items?.GetItemIfSet(which, false) as SfxBoolItem | undefined)?.GetValue();
}

/** Returns the outer header or footer group slot. @param header - Whether this is the header. @returns Native slot. */
export function headerFooterSetSlot(header: boolean): number {
  return header ? SID_ATTR_PAGE_HEADERSET : SID_ATTR_PAGE_FOOTERSET;
}

/** Exchanges the native nested group including original size-plus-spacing semantics. @param output - Outer item exchange. @param header - Header or footer. @param ids - Format item identities. @param state - Current values. @returns Nothing. */
export function putHeaderFooterSet(
  output: SfxItemSet,
  header: boolean,
  ids: SvxHFPageIds,
  state: SvxHFPageState,
): void {
  const items = new SfxItemSet(output.GetPool(), [
    [SID_ATTR_PAGE_SIZE, SID_ATTR_PAGE_SIZE],
    [SID_ATTR_PAGE_ON, SID_ATTR_PAGE_SHARED],
    [SID_ATTR_PAGE_SHARED_FIRST, SID_ATTR_PAGE_SHARED_FIRST],
  ]);
  for (const which of [ids.margins, ids.spacing, ids.dynamicSpacing])
    items.MergeRange(which, which);
  try {
    items.Put(new SfxBoolItem(SID_ATTR_PAGE_ON, state.enabled));
    items.Put(new SfxBoolItem(SID_ATTR_PAGE_SHARED, state.shared));
    items.Put(new SfxBoolItem(SID_ATTR_PAGE_SHARED_FIRST, state.sharedFirst));
    items.Put(new SfxBoolItem(SID_ATTR_PAGE_DYNAMIC, state.dynamicHeight));
    items.Put(new SfxBoolItem(ids.dynamicSpacing, state.dynamicSpacing));
    items.Put(
      new SvxLRSpaceItem(
        SvxIndentValue.twips(state.left),
        SvxIndentValue.twips(state.right),
        SvxIndentValue.zero(),
        ids.margins,
      ),
    );
    items.Put(
      new SvxULSpaceItem(header ? 0 : state.spacing, header ? state.spacing : 0, ids.spacing),
    );
    items.Put(new SvxSizeItem(SID_ATTR_PAGE_SIZE, new Size(0, state.height + state.spacing)));
    output.Put(new SvxSetItem(headerFooterSetSlot(header), items), true);
  } finally {
    items.Dispose();
  }
}

/** Reads the represented controls with Writer's original unconfigured 5 mm defaults. @param group - Existing native header or footer set. @param header - Header or footer. @param ids - Original format item identities. @returns Restored state. */
export function readHeaderFooterSet(
  group: SvxSetItem | undefined,
  header: boolean,
  ids: SvxHFPageIds,
): SvxHFPageState {
  const items = group?.GetItemSet();
  const lr = items?.GetItemIfSet(ids.margins, false) as SvxLRSpaceItem | undefined;
  const ul = items?.GetItemIfSet(ids.spacing, false) as SvxULSpaceItem | undefined;
  const size = items?.GetItemIfSet(SID_ATTR_PAGE_SIZE, false) as SvxSizeItem | undefined;
  const defaults = Number(toTwips(5n, Length.mm));
  const spacing = ul ? (header ? ul.GetLower() : ul.GetUpper()) : defaults;
  return {
    enabled: flag(items, SID_ATTR_PAGE_ON) ?? false,
    shared: flag(items, SID_ATTR_PAGE_SHARED) ?? true,
    sharedFirst: flag(items, SID_ATTR_PAGE_SHARED_FIRST) ?? true,
    dynamicHeight: flag(items, SID_ATTR_PAGE_DYNAMIC) ?? true,
    dynamicSpacing: flag(items, ids.dynamicSpacing) ?? false,
    left: lr?.ResolveLeft() ?? 0,
    right: lr?.ResolveRight() ?? 0,
    height: size ? Math.max(0, size.GetSize().Height() - spacing) : defaults,
    spacing,
  };
}

/** The shared SVX tab owner used by Writer's Page Style dialog. */
export class SvxHFPage {
  public readonly initial: SvxHFPageState;

  /** Resets the tab from its native nested item set. @param input - Dialog item set. @param header - Header or footer. @param ids - Resolved format item identities. @returns Tab page. */
  constructor(
    input: SfxItemSet,
    readonly header: boolean,
    private readonly ids: SvxHFPageIds,
  ) {
    this.initial = readHeaderFooterSet(
      input.GetItemIfSet(headerFooterSetSlot(header), false) as SvxSetItem | undefined,
      header,
      ids,
    );
  }

  /** Exchanges only edited page settings. @param state - Current values. @param output - Native dialog deltas. @returns Nothing. */
  FillItemSet(state: SvxHFPageState, output: SfxItemSet): void {
    if (
      Object.keys(state).some(
        /** Finds a changed tab property. @param key - Existing settings key. @returns Whether changed. */
        (key) => state[key as keyof SvxHFPageState] !== this.initial[key as keyof SvxHFPageState],
      )
    )
      putHeaderFooterSet(output, this.header, this.ids, state);
  }
}
