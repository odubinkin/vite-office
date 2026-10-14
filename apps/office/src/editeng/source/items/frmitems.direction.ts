/** @fileoverview Original frame direction value/Any responsibilities from frmitems.cxx; presentation and native caches remain separate. */
import { SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxFrameDirection as D } from "../../inc/frmdir";
import { WritingMode2 as W } from "../../../offapi/com/sun/star/text/WritingMode2";
/** Original shared frame direction item. */
export class SvxFrameDirectionItem extends SfxEnumItem<D> {
  /** Original value/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: D, which: number] | [source: Readonly<SvxFrameDirectionItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent copy Clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxFrameDirectionItem {
    void pool;
    return new SvxFrameDirectionItem(this);
  }
  /** Browser scalar direction projection. @returns Writing mode; unknown values retain the inherited unsigned16 browser projection. */
  public override QueryValue(): number;
  /** Original signed short Any output. @param output - Actual destination. @param member - Ignored member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original switch mapping and unchanged output on invalid enum. @param output - Optional Any. @param member - Ignored member. @returns Success or scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    let value: number;
    switch (this.GetValue()) {
      case D.Horizontal_LR_TB:
        value = W.LR_TB;
        break;
      case D.Horizontal_RL_TB:
        value = W.RL_TB;
        break;
      case D.Vertical_RL_TB:
        value = W.TB_RL;
        break;
      case D.Vertical_LR_TB:
        value = W.TB_LR;
        break;
      case D.Vertical_LR_BT:
        value = W.BT_LR;
        break;
      case D.Vertical_RL_TB90:
        value = W.TB_RL90;
        break;
      case D.Environment:
        value = W.PAGE;
        break;
      case D.Stacked:
        value = W.STACKED;
        break;
      default:
        return output === undefined ? this.GetEnumValue() : false;
    }
    if (output === undefined) return value;
    output.insert([value], "sal_Int16");
    return true;
  }
  /** Original signed16 extraction and exact accepted mappings; failed writes preserve value. @param input - Any or browser signed16. @param member - Ignored member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const value: [number] = [0];
    if (input instanceof Any) {
      if (!input.extract(value, "sal_Int16")) return false;
    } else {
      if (typeof input !== "number" || !Number.isInteger(input) || input < -32768 || input > 32767)
        return false;
      value[0] = input;
    }
    let direction: D;
    switch (value[0]) {
      case W.LR_TB:
        direction = D.Horizontal_LR_TB;
        break;
      case W.RL_TB:
        direction = D.Horizontal_RL_TB;
        break;
      case W.TB_RL:
        direction = D.Vertical_RL_TB;
        break;
      case W.TB_LR:
        direction = D.Vertical_LR_TB;
        break;
      case W.BT_LR:
        direction = D.Vertical_LR_BT;
        break;
      case W.TB_RL90:
        direction = D.Vertical_RL_TB90;
        break;
      case W.PAGE:
        direction = D.Environment;
        break;
      case W.STACKED:
        direction = D.Stacked;
        break;
      default:
        return false;
    }
    this.SetValue(direction);
    return true;
  }
}
