/** @fileoverview Native Writer document setting properties consumed by RTF and browser ODF reopen. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import type { DocumentSettingId } from "../../core/doc/DocumentSettingManager";
import type { SwDoc } from "../../core/doc/doc";
import { scalar, text, unicode, unknown } from "../../core/unocore/unocrsrhelper";

const documentSettings = new Map<string, DocumentSettingId>([
  ["IgnoreTabsAndBlanksForLineCalculation", "IGNORE_TABS_AND_BLANKS_FOR_LINE_CALCULATION"],
  ["TabsRelativeToIndent", "TABS_RELATIVE_TO_INDENT"],
  ["TabAtLeftIndentForParagraphsInList", "TAB_AT_LEFT_INDENT_FOR_PARA_IN_LIST"],
]);

/** Represented SwXDocumentSettings property owner backed by the actual document manager. */
export class SwXDocumentSettings {
  /** Borrows the existing document settings manager. @param document - Canonical document. @returns Settings owner. */
  constructor(private readonly document: SwDoc) {}

  /** Writes one original boolean document property. @param name - Native property name. @param value - Borrowed Any. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const property = text(name);
    const id = documentSettings.get(property);
    if (id === undefined) unknown(property);
    this.document.GetDocumentSettingManager().set(id, scalar(value, "bool") as boolean);
  }

  /** Supplies the original represented configuration property vector. @returns Owned properties. */
  getConfigurationSettings(): PropertyValue[] {
    const settings = this.document.GetDocumentSettingManager();
    const result: PropertyValue[] = [];
    for (const [key, id] of documentSettings) {
      const name = unicode(key);
      const value = new Any(settings.get(id));
      try {
        result.push(new PropertyValue(name, 0, value, PropertyState.DIRECT_VALUE));
      } finally {
        name.dispose();
        value.dispose();
      }
    }
    return result;
  }

  /** Applies supported boolean configuration properties in input order. @param properties - Borrowed original vector. @returns Nothing. */
  setConfigurationSettings(properties: readonly PropertyValue[]): void {
    for (const property of properties) {
      if (documentSettings.has(text(property.Name)))
        this.setPropertyValue(property.Name, property.Value);
    }
  }
}
