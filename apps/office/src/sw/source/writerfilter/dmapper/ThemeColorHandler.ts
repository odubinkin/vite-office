/** @fileoverview Original ThemeColorHandler.hxx consumed color/index/tint/shade receiver, retaining source initial values and separate property resolution. */
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
/** Native color attribute receiver; theme resolution belongs to the importing document's color scheme. */
export class ThemeColorHandler implements Properties {
  mnColor = 0;
  mnIndex = -1;
  mnTint = 0;
  mnShade = 0;
  /** Original attribute switch. @param id - ID. @param value - Value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const n = value.getInt();
    switch (id) {
      case N.LN_CT_Color_val:
        this.mnColor = n;
        break;
      case N.LN_CT_Color_themeColor:
        this.mnIndex = n;
        break;
      case N.LN_CT_Color_themeTint:
        this.mnTint = n;
        break;
      case N.LN_CT_Color_themeShade:
        this.mnShade = n;
        break;
    }
  }
  /** Original modifier receiver is inert. @param value - Unused modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    void value;
  }
}
