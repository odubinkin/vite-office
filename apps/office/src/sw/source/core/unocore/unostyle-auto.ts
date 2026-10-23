/** @fileoverview Character SwXAutoStyles/SwXAutoStyleFamily/SwXAutoStyle from pinned unostyle.cxx, over the document-owned automatic-style pool. */
import type { SwDoc } from "../doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { StylePool } from "../../../../svl/source/items/stylepool";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { SwUnoPropertyMap } from "./unomap";
import { noSuchElement, putItem, queryItem, stringAny, text, unknown } from "./unocrsrhelper";
/** Automatic character style supplier over the canonical document. */
export class SwXAutoStyles {
  /** Borrows the model. @param doc - Native document. @returns Nothing. */
  constructor(private readonly doc: SwDoc) {}
  /** Returns the represented native family. @param name - Native family name. @returns Character family. */
  getByName(name: OUStringConstReference): SwXAutoStyleFamily {
    if (text(name) !== "CharacterStyles") noSuchElement();
    return new SwXAutoStyleFamily(this.doc);
  }
}
/** Native character automatic-style insertion. */
export class SwXAutoStyleFamily {
  /** Borrows the model. @param doc - Native document. @returns Nothing. */
  constructor(private readonly doc: SwDoc) {}
  /** Applies ordered properties and interns the resulting native item set. @param values - Actual PropertyValue descriptors. @returns Native auto style. */
  insertStyle(values: readonly PropertyValue[]): SwXAutoStyle {
    const set = new SfxItemSet(this.doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    for (const property of values) {
      try {
        const name = text(property.Name),
          entry = SwUnoPropertyMap.get(name);
        if (!entry || !name.startsWith("Char")) unknown(name);
        set.Put(putItem(set.Get(entry.which), entry, property.Value));
      } catch (error) {
        if (
          !(error instanceof IllegalArgumentException) &&
          !(error instanceof UnknownPropertyException)
        )
          throw error;
        error.dispose();
      }
    }
    return new SwXAutoStyle(
      this.doc.GetIStyleAccess().cacheAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR),
    );
  }
}
/** Native automatic-style property reader retaining the shared item-set handle. */
export class SwXAutoStyle {
  /** Retains the document-owned handle. @param set - Interned items. @returns Nothing. */
  constructor(private readonly set: SfxItemSet) {}
  /** Reads the native identity or a represented item member. @param name - Native property. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    const key = text(name);
    if (key === "CharAutoStyleName") return stringAny(StylePool.nameOf(this.set));
    const entry = SwUnoPropertyMap.get(key);
    if (!entry || !key.startsWith("Char")) unknown(key);
    return queryItem(this.set.Get(entry.which), entry);
  }
}
