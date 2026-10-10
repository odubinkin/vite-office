/** @fileoverview Original celltextattr.cxx metadata defaults and implicit native value copying; no layout or document substitute. */
import { TEXTWIDTH_DIRTY } from "../../../inc/globalnames";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";

/** Original two-field value owner, with public UInt16 width and UInt8 script discriminator. */
export class CellTextAttr {
  private textWidth: number;
  private scriptType: SvtScriptType;

  /** Constructs original defaults or an implicit native value copy. @param source - Optional copied value. @returns New independent metadata. */
  public constructor(source?: CellTextAttr) {
    this.textWidth = source ? source.mnTextWidth : TEXTWIDTH_DIRTY;
    this.scriptType = source ? source.mnScriptType : SvtScriptType.UNKNOWN;
  }
  /** Reads the original public text-width field. @returns UInt16 width. */
  public get mnTextWidth(): number {
    return this.textWidth;
  }
  /** Adapts assignment to the native UInt16 field for finite integer inputs. @param value - Assigned width. @returns Nothing. */
  public set mnTextWidth(value: number) {
    this.textWidth = value & 0xffff;
  }
  /** Reads the original public script field. @returns UInt8 script discriminator. */
  public get mnScriptType(): SvtScriptType {
    return this.scriptType;
  }
  /** Retains the original fixed UInt8 enum representation. @param value - Assigned script value. @returns Nothing. */
  public set mnScriptType(value: SvtScriptType) {
    this.scriptType = (value & 0xff) as SvtScriptType;
  }
  /** Adapts implicit native memberwise assignment, including self-assignment. @param source - Copied metadata. @returns Recipient. */
  public assign(source: CellTextAttr): this {
    this.textWidth = source.mnTextWidth;
    this.scriptType = source.mnScriptType;
    return this;
  }
}
