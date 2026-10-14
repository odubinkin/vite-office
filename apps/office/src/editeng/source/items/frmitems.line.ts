/** @fileoverview Native SvxLineItem optional owned border and complete Any contracts; shared frame converters and ordinary JS values replace only C++ storage. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as lineType,
} from "../../../offapi/com/sun/star/table/BorderLine2";
import { SvxBorderLine } from "./borderline";
import { SvxBoxItem, lcl_extractBorderLine } from "./frmitems";
import { MID_FG_COLOR, MID_OUTER_WIDTH, MID_INNER_WIDTH, MID_DISTANCE } from "../../inc/memberids";
import { Color, ColorTransparency, insertColor } from "../../../tools/inc/color";
/** Original final line attribute; a present empty line is distinct from absence. */
export class SvxLineItem extends SfxPoolItem {
  private pLine: SvxBorderLine | null = null;
  /** Original Which-only and implicit copy forms. @param source - Which or actual item. @returns Item. */
  constructor(source: number | Readonly<SvxLineItem>) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") this.SetLine(source.GetLine());
  }
  /** Original factory Which0 with no border. @returns Default. */
  static CreateDefault(): SvxLineItem {
    return new SvxLineItem(0);
  }
  /** Original borrowed const border pointer. @returns Native border or absence. */
  GetLine(): Readonly<SvxBorderLine> | null {
    return this.pLine;
  }
  /** Original copy-before-replace, including self-borrow and null. @param line - Borrowed actual border. @returns Nothing. */
  SetLine(line: Readonly<SvxBorderLine> | null): void {
    this.pLine = line === null ? null : line.Clone();
  }
  /** Original implicit deep copy. @param pool - Unused pool. @returns Clone. */
  override Clone(pool?: SfxItemPool): SvxLineItem {
    void pool;
    return new SvxLineItem(this);
  }
  /** Original CompareBorderLine distinguishes absent and present empty values, omitting Which. @param other - Candidate. @returns Native equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLineItem &&
      (this.pLine === null
        ? other.pLine === null
        : other.pLine !== null && this.pLine.equals(other.pLine))
    );
  }
  /** Original delegation changes border scale only when present. @param scale - New metric scale. @returns Nothing. */
  ScaleMetrics(scale: number): void {
    if (this.pLine !== null) this.pLine.ScaleMetrics(scale);
  }
  /** Original metric support. @returns True. */
  HasMetrics(): boolean {
    return true;
  }
  /** Original query, including absent-line success with unchanged output for any nonzero member. Missing output retains the base unsupported browser projection. @param output - Actual Any. @param member - Unsigned8 member/convert flag. @returns Native result or absent base projection. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0) {
      output.insert(SvxBoxItem.SvxLineToLine(this.pLine, convert), lineType);
      return true;
    }
    if (this.pLine === null) return true;
    switch (member) {
      case MID_FG_COLOR:
        insertColor(output, this.pLine.GetColor());
        break;
      case MID_OUTER_WIDTH:
        output.insert([this.pLine.GetOutWidth()], "sal_Int32");
        break;
      case MID_INNER_WIDTH:
        output.insert([this.pLine.GetInWidth()], "sal_Int32");
        break;
      case MID_DISTANCE:
        output.insert([this.pLine.GetDistance()], "sal_Int32");
        break;
      default:
        return false;
    }
    return true;
  }
  /** Original typed struct/base fallback or scalar color path. Unsupported scalar members allocate before failure; MID_LINE_STYLE0x90 is unreachable after stripping0x80 and is source-folded. @param value - Native input Any. @param member - Unsigned8 member/convert flag. @returns Native result. */
  override PutValue(value: Any, member: number): boolean {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0) {
      const line = new BorderLine2();
      if (!lcl_extractBorderLine(value, line)) return false;
      if (this.pLine === null) this.pLine = new SvxBorderLine();
      if (!SvxBoxItem.LineToSvxLine(line, this.pLine, convert, "BorderLine2")) this.pLine = null;
      return true;
    }
    const scalar: [number] = [0];
    if (!value.extract(scalar, "sal_Int32")) return false;
    if (this.pLine === null) this.pLine = new SvxBorderLine();
    if (member !== MID_FG_COLOR) return false;
    this.pLine.SetColor(new Color(ColorTransparency, scalar[0], "ColorTransparencyTag"));
    return true;
  }
}
