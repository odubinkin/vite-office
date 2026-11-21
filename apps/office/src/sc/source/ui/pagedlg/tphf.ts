/** @fileoverview Native Calc header and footer page settings over the nested page-style item sets. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxSetItem } from "../../../../svx/inc/pageitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { Size } from "../../../../tools/inc/gen";
import {
  ATTR_LRSPACE,
  ATTR_ULSPACE,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_ON,
  ATTR_PAGE_DYNAMIC,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_SHARED,
  ATTR_PAGE_SHARED_FIRST,
} from "../../../inc/scitems";

/** Values of the original common header and footer widgets, in twips. */
export interface ScHFPageState {
  readonly enabled: boolean;
  readonly shared: boolean;
  readonly sharedFirst: boolean;
  readonly dynamic: boolean;
  readonly left: number;
  readonly right: number;
  readonly spacing: number;
  readonly height: number;
}

/** Reads an effective source boolean. @param items - Nested set. @param which - Item identity. @returns Flag. */
function flag(items: SfxItemSet, which: number): boolean {
  return (items.Get(which) as SfxBoolItem).GetValue();
}

/** Native ScHeaderPage or ScFooterPage settings for a given page style. */
export class ScHFPage {
  readonly initial: ScHFPageState;
  private readonly group: SvxSetItem;

  /** Resets the settings from actual nested style items. @param input - Borrowed original page style. @param header - Header versus footer. @returns Settings owner. */
  constructor(
    input: SfxItemSet,
    private readonly header: boolean,
  ) {
    this.group = input.Get(header ? ATTR_PAGE_HEADERSET : ATTR_PAGE_FOOTERSET) as SvxSetItem;
    const items = this.group.GetItemSet();
    const lr = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
    const ul = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
    const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
    const spacing = header ? ul.GetLower() : ul.GetUpper();
    this.initial = {
      enabled: flag(items, ATTR_PAGE_ON),
      shared: flag(items, ATTR_PAGE_SHARED),
      sharedFirst: flag(items, ATTR_PAGE_SHARED_FIRST),
      dynamic: flag(items, ATTR_PAGE_DYNAMIC),
      left: lr.ResolveLeft(),
      right: lr.ResolveRight(),
      spacing,
      height: Math.max(0, size.Height() - spacing),
    };
  }

  /** Writes the original nested group while retaining unrelated header or footer items. @param state - Current widget values. @param output - Style delta. @returns Nothing. */
  FillItemSet(state: ScHFPageState, output: SfxItemSet): void {
    const initial = this.initial;
    if (
      state.enabled === initial.enabled &&
      state.shared === initial.shared &&
      state.sharedFirst === initial.sharedFirst &&
      state.dynamic === initial.dynamic &&
      state.left === initial.left &&
      state.right === initial.right &&
      state.spacing === initial.spacing &&
      state.height === initial.height
    )
      return;
    const group = this.group.Clone();
    try {
      const items = group.GetItemSet();
      items.Put(new SfxBoolItem(ATTR_PAGE_ON, state.enabled));
      items.Put(new SfxBoolItem(ATTR_PAGE_DYNAMIC, state.dynamic));
      items.Put(new SfxBoolItem(ATTR_PAGE_SHARED, state.shared));
      items.Put(new SfxBoolItem(ATTR_PAGE_SHARED_FIRST, state.sharedFirst));
      items.Put(
        new SvxLRSpaceItem(
          SvxIndentValue.twips(state.left),
          SvxIndentValue.twips(state.right),
          SvxIndentValue.zero(),
          ATTR_LRSPACE,
        ),
      );
      const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
      items.Put(
        new SvxSizeItem(ATTR_PAGE_SIZE, new Size(size.Width(), state.height + state.spacing)),
      );
      items.Put(
        new SvxULSpaceItem(
          this.header ? 0 : state.spacing,
          this.header ? state.spacing : 0,
          ATTR_ULSPACE,
        ),
      );
      output.Put(group);
    } finally {
      group.Dispose();
    }
  }
}
