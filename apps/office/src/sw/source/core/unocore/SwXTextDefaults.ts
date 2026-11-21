/** @fileoverview Writer's item-backed UNO text defaults for character properties and tab distance. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { PropertyVetoException } from "../../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { READONLY } from "../../../../udkapi/com/sun/star/beans/PropertyAttribute";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_PARATR_TABSTOP,
  RES_TEXTGRID,
} from "../../../inc/hintids";
import { PROPERTY_MAP_TEXT_DEFAULT } from "../../../inc/unomap";
import type { SwDoc } from "../doc/doc";
import { text, unicode, unknown } from "./unocrsrhelper";
import { aSwMapProvider } from "./unomap";

const properties = aSwMapProvider.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT);

/** Native text defaults borrow the document and its static property map. */
export class SwXTextDefaults {
  /** Binds defaults to the actual document pool. @param document - Owning Writer document. @returns Native text defaults. */
  constructor(private readonly document: SwDoc) {}

  /** Looks up the represented item member in the original UNO schema. @param name - Property name. @returns Item member. */
  private getPropertyEntry(name: OUStringConstReference) {
    const entry = properties
      .getPropertyMap()
      .getByName(name.getStr().subarray(0, name.getLength()));
    if (
      !entry ||
      (entry.nWID !== RES_PARATR_TABSTOP &&
        entry.nWID !== RES_TEXTGRID &&
        (entry.nWID < RES_CHRATR_BEGIN || entry.nWID >= RES_CHRATR_END))
    )
      return unknown(text(name));
    return entry;
  }

  /** Queries the active default through its native item. @param name - Property name. @returns Owned property value. */
  getPropertyValue(name: OUStringConstReference): Any {
    const { nWID, nMemberId } = this.getPropertyEntry(name);
    const output = new Any();
    const item = this.document.GetDefault(nWID) as unknown as {
      QueryValue(output: Any, member: number): boolean;
    };
    item.QueryValue(output, nMemberId);
    return output;
  }

  /** Clones the current item, applies the UNO member and publishes it through SwDoc::SetDefault. @param name - Property name. @param value - Borrowed property value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const { nWID, nMemberId, nFlags } = this.getPropertyEntry(name);
    if ((nFlags & READONLY) !== 0) {
      const message = unicode("Property is read-only: " + text(name));
      try {
        throw new PropertyVetoException(message, new Reference());
      } finally {
        message.dispose();
      }
    }
    const item = this.document.GetDefault(nWID).Clone();
    if (!item) return unknown(text(name));
    try {
      item.PutValue(value, nMemberId);
      this.document.SetDefault(item);
    } finally {
      item.Dispose();
    }
  }
}
