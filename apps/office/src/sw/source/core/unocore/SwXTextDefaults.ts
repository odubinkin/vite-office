/** @fileoverview Writer's item-backed UNO text defaults for the consumed tab-distance property. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { PROPERTY_MAP_TEXT_DEFAULT } from "../../../inc/unomap";
import type { SwDoc } from "../doc/doc";
import { text, unknown } from "./unocrsrhelper";
import { aSwMapProvider } from "./unomap";

const properties = aSwMapProvider.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT);

/** Native text defaults borrow the document and its static property map. */
export class SwXTextDefaults {
  /** Binds defaults to the actual document pool. @param document - Owning Writer document. @returns Native text defaults. */
  constructor(private readonly document: SwDoc) {}

  /** Looks up the represented item member in the original UNO schema. @param name - Property name. @returns Item member. */
  private getTabDistanceMember(name: OUStringConstReference): number {
    const entry = properties
      .getPropertyMap()
      .getByName(name.getStr().subarray(0, name.getLength()));
    if (entry?.nWID !== RES_PARATR_TABSTOP) return unknown(text(name));
    return entry.nMemberId;
  }

  /** Queries the active default through its native item. @param name - Property name. @returns Owned property value. */
  getPropertyValue(name: OUStringConstReference): Any {
    const member = this.getTabDistanceMember(name);
    const output = new Any();
    (this.document.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue(output, member);
    return output;
  }

  /** Clones the current item, applies the UNO member and publishes it through SwDoc::SetDefault. @param name - Property name. @param value - Borrowed property value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const member = this.getTabDistanceMember(name);
    const item = (this.document.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem).Clone();
    try {
      item.PutValue(value, member);
      this.document.SetDefault(item);
    } finally {
      item.Dispose();
    }
  }
}
