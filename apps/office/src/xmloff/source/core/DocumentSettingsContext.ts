/** @fileoverview Represented boolean configuration groups from xmloff DocumentSettingsContext. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "./xmlimp";
import { ODF_NAMESPACES, XMLToken } from "./xmltoken";

/** Original office:settings context for the represented configuration-property sequence. */
export class XMLDocumentSettingsContext extends SvXMLImportContext {
  private configuration: readonly (readonly [string, boolean])[] = [];

  /** Binds the Writer configuration consumer. @param apply - Borrows the native property vector. @returns Context. */
  constructor(private readonly apply: (properties: readonly PropertyValue[]) => void) {
    super();
  }

  /** Selects the original namespace-qualified configuration group. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const name = attributes.get(XMLToken.CONFIG_NAME) ?? "";
    const separator = name.indexOf(":");
    if (
      element !== XMLToken.CONFIG_ITEM_SET ||
      separator <= 0 ||
      name.slice(separator + 1) !== "configuration-settings" ||
      attributes.getNamespaceUri(name.slice(0, separator)) !== ODF_NAMESPACES.ooo
    )
      return new SvXMLIgnoreContext(true);
    return new XMLConfigItemSetContext(
      /** Publishes the last complete configuration group. @param values - Parsed group. @returns Nothing. */
      (values) => {
        this.configuration = values;
      },
    );
  }

  /** Applies the represented native values after finishing the settings group. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element !== XMLToken.OFFICE_SETTINGS || this.configuration.length === 0) return;
    const properties: PropertyValue[] = [];
    try {
      for (const [key, flag] of this.configuration) {
        const units = new Uint16Array(key.length);
        for (let index = 0; index < key.length; ++index) units[index] = key.charCodeAt(index);
        const name = new OUString(units, units.length);
        const value = new Any(flag);
        try {
          properties.push(new PropertyValue(name, 0, value, PropertyState.DIRECT_VALUE));
        } finally {
          name.dispose();
          value.dispose();
        }
      }
      this.apply(properties);
    } finally {
      for (const property of properties) {
        property.Name.dispose();
        property.Value.dispose();
      }
    }
  }
}

/** A configuration item set retains typed boolean properties in input order. */
class XMLConfigItemSetContext extends SvXMLImportContext {
  private readonly values: [string, boolean][] = [];

  /** Binds the settings group's property receiver. @param finish - Completed group consumer. @returns Context. */
  constructor(private readonly finish: (values: readonly (readonly [string, boolean])[]) => void) {
    super();
  }

  /** Reads the original boolean configuration-item domain. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const name = attributes.get(XMLToken.CONFIG_NAME);
    if (
      element !== XMLToken.CONFIG_ITEM ||
      !name ||
      attributes.get(XMLToken.CONFIG_TYPE) !== "boolean"
    )
      return new SvXMLIgnoreContext(true);
    return new XMLConfigItemContext(
      /** Adds the named native boolean value. @param value - Parsed value. @returns Nothing. */
      (value) => {
        this.values.push([name, value]);
      },
    );
  }

  /** Completes the original item set. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element === XMLToken.CONFIG_ITEM_SET) this.finish(this.values);
  }
}

/** The original boolean config item compares its complete character data with XML_TRUE. */
class XMLConfigItemContext extends SvXMLImportContext {
  private value = "";

  /** Binds the original property sink. @param finish - Receives parsed value. @returns Context. */
  constructor(private readonly finish: (value: boolean) => void) {
    super();
  }

  /** Buffers decoded input. @param value - XML text. @returns Nothing. */
  override characters(value: string): void {
    this.value += value;
  }

  /** Ends a boolean config item. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element === XMLToken.CONFIG_ITEM) this.finish(this.value === "true");
  }
}
