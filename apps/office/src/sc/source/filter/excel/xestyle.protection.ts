/** @fileoverview Native Calc protection projection to OOXML XF records. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { ScPatternAttr } from "../../../inc/patattr";
import * as Which from "../../../inc/scitems";
import type { ScProtectionAttr } from "../../../inc/attrib";

/** Original OOXML projection of the Calc XF's two protection flags. */
export class XclExpCellProt {
  readonly locked: boolean;
  readonly hidden: boolean;
  readonly used: boolean;

  /** Captures the native XF's direct state and its two representable flags. @param pattern - Cell pattern. @returns Protection record. */
  constructor(pattern: ScPatternAttr) {
    const item = pattern.GetItem(Which.ATTR_PROTECTION) as ScProtectionAttr;
    this.locked = item.GetProtection();
    this.hidden = item.GetHideFormula() || item.GetHideCell();
    this.used = pattern.GetItemSet().GetItemIfSet(Which.ATTR_PROTECTION, false) !== undefined;
  }

  /** Writes original protection attributes for the selected XF. @param serializer - Stylesheet writer. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    serializer.singleElement(
      token("protection"),
      token("locked"),
      String(this.locked),
      token("hidden"),
      String(this.hidden),
    );
  }
}
