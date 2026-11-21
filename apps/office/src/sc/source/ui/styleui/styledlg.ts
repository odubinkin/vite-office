/** @fileoverview Native page-family ScStyleDlg input and output item contracts. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxPageItem, type SvxPageUsage } from "../../../../svx/inc/pageitem";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { SvxNumType } from "../../../../editeng/inc/svxenum";
import type { SvxPageGeometry } from "../../../../cui/source/tabpages/page";
import { Size } from "../../../../tools/inc/gen";
import {
  ATTR_LRSPACE,
  ATTR_ULSPACE,
  ATTR_PAGE,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_HORCENTER,
  ATTR_PAGE_VERCENTER,
  ATTR_WRITINGDIR,
} from "../../../inc/scitems";

/** Original Page Style tab identities in factory order. */
export const pageStyleTabs = [
  "General",
  "Page",
  "Borders",
  "Background",
  "Header",
  "Footer",
  "Sheet",
] as const;

/** Dialog values borrowed from the active style snapshot. */
export interface ScStyleDlgRequest {
  readonly name: string;
  readonly canRename: boolean;
  readonly items: SfxItemSet;
  readonly nameAvailable: (name: string) => boolean;
}

/** Accepted output item set and requested style name. */
export interface ScStyleDlgResult {
  readonly name: string;
  readonly items: SfxItemSet;
}

/** Additional Page tab values backed by the native page, frame-direction, and center items. */
export interface ScPageStyleGeometry extends SvxPageGeometry {
  readonly usage: SvxPageUsage;
  readonly numbering: SvxNumType;
  readonly direction: SvxFrameDirection;
  readonly centerHorizontal: boolean;
  readonly centerVertical: boolean;
}

/** Reads physical page and layout values from the effective style. @param items - Page item set. @returns Native Page tab fields. */
export function GetPageStyleGeometry(items: SfxItemSet): ScPageStyleGeometry {
  const page = items.Get(ATTR_PAGE) as SvxPageItem;
  const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
  const lr = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
  const ul = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
  return {
    landscape: page.IsLandscape(),
    width: size.Width(),
    height: size.Height(),
    leftMargin: lr.ResolveLeft(),
    rightMargin: lr.ResolveRight(),
    topMargin: ul.GetUpper(),
    bottomMargin: ul.GetLower(),
    usage: page.GetPageUsage(),
    numbering: page.GetNumType(),
    direction: (items.Get(ATTR_WRITINGDIR) as SvxFrameDirectionItem).GetValue(),
    centerHorizontal: (items.Get(ATTR_PAGE_HORCENTER) as SfxBoolItem).GetValue(),
    centerVertical: (items.Get(ATTR_PAGE_VERCENTER) as SfxBoolItem).GetValue(),
  };
}

/** Writes Page tab deltas to the original page-family item identities. @param old - Initial fields. @param value - Accepted fields. @param output - Dialog output set. @returns Nothing. */
export function FillPageStyleGeometry(
  old: ScPageStyleGeometry,
  value: ScPageStyleGeometry,
  output: SfxItemSet,
): void {
  if (
    old.landscape !== value.landscape ||
    old.usage !== value.usage ||
    old.numbering !== value.numbering
  ) {
    const page = new SvxPageItem(ATTR_PAGE);
    page.SetLandscape(value.landscape);
    page.SetPageUsage(value.usage);
    page.SetNumType(value.numbering);
    output.Put(page);
  }
  if (old.width !== value.width || old.height !== value.height)
    output.Put(new SvxSizeItem(ATTR_PAGE_SIZE, new Size(value.width, value.height)));
  if (old.leftMargin !== value.leftMargin || old.rightMargin !== value.rightMargin)
    output.Put(
      new SvxLRSpaceItem(
        SvxIndentValue.twips(value.leftMargin),
        SvxIndentValue.twips(value.rightMargin),
        SvxIndentValue.zero(),
        ATTR_LRSPACE,
      ),
    );
  if (old.topMargin !== value.topMargin || old.bottomMargin !== value.bottomMargin)
    output.Put(new SvxULSpaceItem(value.topMargin, value.bottomMargin, ATTR_ULSPACE));
  if (old.direction !== value.direction)
    output.Put(new SvxFrameDirectionItem(value.direction, ATTR_WRITINGDIR));
  if (old.centerHorizontal !== value.centerHorizontal)
    output.Put(new SfxBoolItem(ATTR_PAGE_HORCENTER, value.centerHorizontal));
  if (old.centerVertical !== value.centerVertical)
    output.Put(new SfxBoolItem(ATTR_PAGE_VERCENTER, value.centerVertical));
}
