/** @fileoverview Original SvxRotateModeItem values and Any transport; localized presentation remains pending. */
import { SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { CellVertJustify2 as CV } from "../../../offapi/com/sun/star/table/CellVertJustify2";
import { SvxRotateMode as M } from "../../inc/rotmodit";
/** Original rotated-text anchor item. */
export class SvxRotateModeItem extends SfxEnumItem<M> {
  /** Original value and explicit copy constructors. @param args - Native form. @returns Item. */
  constructor(...args: [mode: M, which: number] | [source: Readonly<SvxRotateModeItem>]) {
    if (args.length === 2) super(args[1], args[0]);
    else super(args[0]);
  }
  /** Original Standard/Which0 factory, distinct from Calc DocPool Bottom. @returns Default item. */
  public static CreateDefault(): SvxRotateModeItem {
    return new SvxRotateModeItem(M.SVX_ROTATE_MODE_STANDARD, 0);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxRotateModeItem {
    void pool;
    return new SvxRotateModeItem(this);
  }
  /** Existing browser scalar projection. @returns Mapped mode. */
  public override QueryValue(): number;
  /** Original outputAny query. @param output - Actual Any. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original int32 output mapping. @param output - Optional native output. @param member - Ignored member. @returns Native success or scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    let value: number = CV.STANDARD;
    switch (this.GetValue()) {
      case M.SVX_ROTATE_MODE_STANDARD:
        value = CV.STANDARD;
        break;
      case M.SVX_ROTATE_MODE_TOP:
        value = CV.TOP;
        break;
      case M.SVX_ROTATE_MODE_CENTER:
        value = CV.CENTER;
        break;
      case M.SVX_ROTATE_MODE_BOTTOM:
        value = CV.BOTTOM;
        break;
    }
    if (output === undefined) return value;
    output.insert([value], "sal_Int32");
    return true;
  }
  /** Original failed extraction also resets Standard and returns true. @param input - Actual Any or browser signed32. @param member - Ignored member. @returns True. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const value: [number] = [0];
    if (input instanceof Any) {
      if (!input.extract(value, "sal_Int32")) value[0] = CV.STANDARD;
    } else if (
      typeof input === "number" &&
      Number.isInteger(input) &&
      input >= -2147483648 &&
      input <= 2147483647
    )
      value[0] = input | 0;
    else value[0] = CV.STANDARD;
    let result = M.SVX_ROTATE_MODE_STANDARD;
    switch (value[0]) {
      case CV.STANDARD:
        result = M.SVX_ROTATE_MODE_STANDARD;
        break;
      case CV.TOP:
        result = M.SVX_ROTATE_MODE_TOP;
        break;
      case CV.CENTER:
        result = M.SVX_ROTATE_MODE_CENTER;
        break;
      case CV.BOTTOM:
        result = M.SVX_ROTATE_MODE_BOTTOM;
        break;
      default:
        break;
    }
    this.SetValue(result);
    return true;
  }
}
