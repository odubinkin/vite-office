/** @fileoverview Consumed native border preset dispatch and last-used frame toolbox state from tbcontrl.cxx. Native UNO/controller/window lifetimes remain unported;the actual dispatch port carries existing typed items. */
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as Inner,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import type { SfxPoolItem } from "../../../svl/inc/poolitem";
/** Actual command-dispatch boundary for the consumed toolbox controller. */
export type BorderDispatch = (command: string, items: readonly SfxPoolItem[]) => void;
/** Original DispatchBorderItem retains Calc ordering,nonzero Thin width,diagonal Hairline and exact Shift-only validity reset. @param dispatch - Actual command port. @param selected - Native ValueSet item id. @param calc - Native document kind. @param modifier - Original modifier mask. @returns Nothing. */
export function DispatchBorderItem(
  dispatch: BorderDispatch,
  selected: number,
  calc: boolean,
  modifier: number,
): void {
  const outer = new SvxBoxItem(10024),
    inner = new SvxBoxInfoItem(10023),
    line = new SvxBorderLine();
  line.GuessLinesWidths(line.GetBorderLineStyle(), 15);
  const diagonal = new SvxBorderLine(null, 1),
    down = new SvxLineItem(11013),
    up = new SvxLineItem(11014);
  const item = calc
    ? ([1, 8, 12, 15, 2, 3, 5, 6, 13, 14, 7, 4][selected - 1] ?? selected)
    : selected;
  let flags = 0,
    left = false,
    right = false,
    top = false,
    bottom = false,
    isDiagonal = false;
  switch (item) {
    case 1:
      flags = 63;
      dispatch(".uno:BorderTLBR", [down]);
      dispatch(".uno:BorderBLTR", [up]);
      break;
    case 2:
      left = true;
      flags = 1;
      break;
    case 3:
      right = true;
      flags = 2;
      break;
    case 4:
      left = right = true;
      flags = 3;
      break;
    case 5:
      top = true;
      flags = 4;
      break;
    case 6:
      bottom = true;
      flags = 8;
      break;
    case 7:
      top = bottom = true;
      flags = 12;
      break;
    case 8:
      left = right = top = bottom = true;
      flags = 15;
      break;
    case 9:
      top = bottom = true;
      inner.SetLine(line, Inner.HORI);
      flags = 28;
      break;
    case 10:
      left = right = top = bottom = true;
      inner.SetLine(line, Inner.HORI);
      flags = 31;
      break;
    case 11:
      left = right = top = bottom = true;
      inner.SetLine(line, Inner.VERT);
      flags = 47;
      break;
    case 12:
      left = right = top = bottom = true;
      inner.SetLine(line, Inner.HORI);
      inner.SetLine(line, Inner.VERT);
      flags = 63;
      break;
    case 13:
      down.SetLine(diagonal);
      dispatch(".uno:BorderTLBR", [down]);
      isDiagonal = true;
      break;
    case 14:
      up.SetLine(diagonal);
      dispatch(".uno:BorderBLTR", [up]);
      isDiagonal = true;
      break;
    case 15:
      down.SetLine(diagonal);
      up.SetLine(diagonal);
      dispatch(".uno:BorderTLBR", [down]);
      dispatch(".uno:BorderBLTR", [up]);
      isDiagonal = true;
      break;
  }
  if (isDiagonal) return;
  outer.SetLine(left ? line : undefined, Edge.LEFT);
  outer.SetLine(right ? line : undefined, Edge.RIGHT);
  outer.SetLine(top ? line : undefined, Edge.TOP);
  outer.SetLine(bottom ? line : undefined, Edge.BOTTOM);
  if (modifier === 0x1000) flags |= 63;
  for (const [flag, bit] of [
    [Valid.LEFT, 1],
    [Valid.RIGHT, 2],
    [Valid.TOP, 4],
    [Valid.BOTTOM, 8],
    [Valid.HORI, 16],
    [Valid.VERT, 32],
  ] as const)
    inner.SetValid(flag, (flags & bit) !== 0);
  inner.SetValid(Valid.DISTANCE);
  inner.SetValid(Valid.DISABLE, false);
  dispatch(".uno:SetBorderStyle", [outer, inner]);
}
/** Original frame toolbox state outlives individual popup activations. */
export class SvxFrameToolBoxControl {
  private m_nLastItemId = 0;
  private m_bLastIsCalc = false;
  /** Borrows the actual command dispatch port. @param dispatch - Source dispatch. @returns Controller. */
  constructor(private readonly dispatch: BorderDispatch) {}
  /** Original execution opens/toggles the popup before first selection and reapplies the last preset without modifiers afterwards. @param openPopup - Actual browser popup port replacing native window creation. @returns Nothing. */
  execute(openPopup: () => void): void {
    if (this.m_nLastItemId === 0) openPopup();
    else DispatchBorderItem(this.dispatch, this.m_nLastItemId, this.m_bLastIsCalc, 0);
  }
  /** Original persistent last-item assignment;the browser owns actual icon painting. @param item - ValueSet item id. @param calc - Source document kind. @returns Nothing. */
  SetLastUsedBorderItem(item: number, calc: boolean): void {
    this.m_nLastItemId = item;
    this.m_bLastIsCalc = calc;
  }
}
