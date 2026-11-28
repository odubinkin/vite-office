/** @fileoverview Represented configuration and view groups from xmloff DocumentSettingsContext. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "./xmlimp";
import { ODF_NAMESPACES, XMLToken } from "./xmltoken";
import { Converter } from "../../../sax/source/tools/converter";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Represented scalar properties of one native view record. */
export type ViewItem = readonly [name: string, value: string | boolean | number, type?: "short"];
/** Original named map of property sequences, in XML order. */
export type NamedViewSettings = readonly (readonly [name: string, items: readonly ViewItem[]])[];
/** Properties of one indexed view record. */
type ViewProperty = readonly [
  name: string,
  value: ViewItem[1] | NamedViewSettings,
  type?: ViewItem[2],
];
/** Represented indexed view records, in source order. */
export type ViewSettings = readonly (readonly ViewProperty[])[];

/** A configuration scalar retains the original UNO width. */
type ConfigItem =
  | readonly [name: string, type: "boolean", value: boolean]
  | readonly [name: string, type: "string", value: string]
  | readonly [name: string, type: "short" | "int", value: number];

/** Original office:settings context for the represented configuration-property sequence. */
export class XMLDocumentSettingsContext extends SvXMLImportContext {
  private configuration: readonly ConfigItem[] = [];
  private views: ViewSettings | undefined;

  /** Binds the configuration and indexed view consumers. @param apply - Borrows the native configuration vector. @param applyViews - Receives the indexed view records. @returns Context. */
  constructor(
    private readonly apply?: (properties: readonly PropertyValue[]) => void,
    private readonly applyViews?: (views: ViewSettings) => void,
  ) {
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
      attributes.getNamespaceUri(name.slice(0, separator)) !== ODF_NAMESPACES.ooo
    )
      return new SvXMLIgnoreContext(true);
    const group = name.slice(separator + 1);
    if (group === "view-settings" && this.applyViews)
      return new XMLViewSettingsContext(
        /** Publishes the completed view map. @param views - Indexed view records. @returns Nothing. */
        (views) => (this.views = views),
      );
    if (group !== "configuration-settings" || !this.apply) return new SvXMLIgnoreContext(true);
    return new XMLConfigItemSetContext(
      /** Publishes the last complete configuration group. @param values - Parsed group. @returns Nothing. */
      (values) => {
        this.configuration = values;
      },
    );
  }

  /** Leaves a foreign group and its descendants to the ignore context. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }

  /** Applies the represented native values after finishing the settings group. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element !== XMLToken.OFFICE_SETTINGS) return;
    if (this.views !== undefined) this.applyViews?.(this.views);
    if (!this.apply || this.configuration.length === 0) return;
    const properties: PropertyValue[] = [];
    try {
      for (const [key, type, scalar] of this.configuration) {
        const units = new Uint16Array(key.length);
        for (let index = 0; index < key.length; ++index) units[index] = key.charCodeAt(index);
        const name = new OUString(units, units.length);
        const encoded = type === "string" ? unicode(scalar) : undefined;
        const value = encoded
          ? new Any(encoded.getDataAddress(), "OUString")
          : type === "boolean"
            ? new Any(scalar)
            : new Any([scalar], type === "short" ? "sal_Int16" : "sal_Int32");
        try {
          properties.push(new PropertyValue(name, 0, value, PropertyState.DIRECT_VALUE));
        } finally {
          name.dispose();
          value.dispose();
          encoded?.dispose();
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

/** Selects the indexed Views property of the native view-settings group. */
class XMLViewSettingsContext extends SvXMLImportContext {
  private views: ViewSettings | undefined;

  /** Binds the indexed view property receiver. @param finish - Receives a complete indexed map. @returns Context. */
  constructor(private readonly finish: (views: ViewSettings | undefined) => void) {
    super();
  }
  /** Consumes only the direct indexed Views map. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return element === XMLToken.CONFIG_ITEM_MAP_INDEXED &&
      attributes.get(XMLToken.CONFIG_NAME) === "Views"
      ? new XMLConfigItemMapIndexedContext(
          /** Retains the final indexed Views property in this group. @param views - Indexed view records. @returns Nothing. */
          (views) => (this.views = views),
        )
      : new SvXMLIgnoreContext(true);
  }
  /** Ignores an unrelated subtree without adopting descendants as view properties. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }

  /** Publishes the last complete view group, including one without a Views property. @returns Nothing. */
  override endFastElement(): void {
    this.finish(this.views);
  }
}

/** Collects the represented positional view entries, including empty records. */
class XMLConfigItemMapIndexedContext extends SvXMLImportContext {
  private readonly views: ViewProperty[][] = [];
  /** Borrows the indexed map consumer. @param finish - Receives the ordered views. @returns Context. */
  constructor(private readonly finish: (views: ViewSettings) => void) {
    super();
  }
  /** Appends each direct view entry in document order. @param element - Child token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.CONFIG_ITEM_MAP_ENTRY) return new SvXMLIgnoreContext(true);
    const view: ViewProperty[] = [];
    this.views.push(view);
    return new XMLConfigItemMapEntryContext(view);
  }
  /** Prevents unknown descendants from becoming indexed entries. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
  /** Publishes the completed indexed map. @returns Nothing. */
  override endFastElement(): void {
    this.finish(this.views);
  }
}

/** Reads the direct string properties of one view entry. */
class XMLConfigItemMapEntryContext extends SvXMLImportContext {
  /** Binds one mutable entry while the map is being parsed. @param view - Property vector. @returns Context. */
  constructor(private readonly view: ViewProperty[]) {
    super();
  }
  /** Extracts a typed string property with its original name. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const name = attributes.get(XMLToken.CONFIG_NAME);
    if (!name) return new SvXMLIgnoreContext(true);
    if (element === XMLToken.CONFIG_ITEM_MAP_NAMED) {
      const map: [string, ViewItem[]][] = [];
      this.view.push([name, map]);
      return new XMLConfigItemMapNamedContext(map);
    }
    return createViewItem(element, attributes, this.view);
  }
  /** Ignores unknown descendants without promoting nested properties. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}

/** Collects named entries of the original configuration map. */
class XMLConfigItemMapNamedContext extends SvXMLImportContext {
  /** Borrows the named map output. @param map - Collected entries. @returns Context. */
  constructor(private readonly map: [string, ViewItem[]][]) {
    super();
  }

  /** Reads one named entry and delegates its scalar children. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const name = attributes.get(XMLToken.CONFIG_NAME);
    if (element !== XMLToken.CONFIG_ITEM_MAP_ENTRY || name === null)
      return new SvXMLIgnoreContext(true);
    const items: ViewItem[] = [];
    this.map.push([name, items]);
    return new XMLNamedViewEntryContext(items);
  }

  /** Skips foreign entries as whole subtrees. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}

/** Reads the scalar property sequence of one named view entry. */
class XMLNamedViewEntryContext extends SvXMLImportContext {
  /** Borrows the named entry output. @param items - Collected items. @returns Context. */
  constructor(private readonly items: ViewItem[]) {
    super();
  }

  /** Reads one represented configuration scalar. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return createViewItem(element, attributes, this.items);
  }

  /** Skips foreign items as whole subtrees. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}

/** Reads one typed member of a view property sequence. @param element - Child token. @param attributes - Source attributes. @param output - Collected properties. @returns Child context. */
function createViewItem(
  element: XMLToken,
  attributes: FastAttributeList,
  output: ViewItem[] | ViewProperty[],
): SvXMLImportContext {
  const name = attributes.get(XMLToken.CONFIG_NAME);
  const type = attributes.get(XMLToken.CONFIG_TYPE);
  if (
    element !== XMLToken.CONFIG_ITEM ||
    !name ||
    (type !== "string" && type !== "boolean" && type !== "int" && type !== "short")
  )
    return new SvXMLIgnoreContext(true);
  return new XMLConfigItemContext(
    /** Stores the typed scalar in native property order. @param value - XML text. @returns Nothing. */
    (value) => {
      if (type === "string") output.push([name, value]);
      else if (type === "int" || type === "short") {
        const number: [number] = [0];
        Converter.convertNumber(number, value);
        if (type === "short") output.push([name, (number[0] << 16) >> 16, "short"]);
        else output.push([name, number[0]]);
      } else if (value === "true" || value === "false") output.push([name, value === "true"]);
    },
  );
}

/** A configuration item set retains represented typed properties in input order. */
class XMLConfigItemSetContext extends SvXMLImportContext {
  private readonly values: ConfigItem[] = [];

  /** Binds the settings group's property receiver. @param finish - Completed group consumer. @returns Context. */
  constructor(private readonly finish: (values: readonly ConfigItem[]) => void) {
    super();
  }

  /** Reads the represented original configuration-item domain. @param element - Child token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const name = attributes.get(XMLToken.CONFIG_NAME);
    const type = attributes.get(XMLToken.CONFIG_TYPE);
    if (
      element !== XMLToken.CONFIG_ITEM ||
      !name ||
      (type !== "boolean" && type !== "short" && type !== "int" && type !== "string")
    )
      return new SvXMLIgnoreContext(true);
    return new XMLConfigItemContext(
      /** Adds the native scalar with its original UNO type. @param value - Parsed value. @returns Nothing. */
      (value) => {
        if (type === "boolean") this.values.push([name, type, value === "true"]);
        else if (type === "string") this.values.push([name, type, value]);
        else {
          const number: [number] = [0];
          Converter.convertNumber(number, value);
          this.values.push([name, type, type === "short" ? (number[0] << 16) >> 16 : number[0]]);
        }
      },
    );
  }

  /** Ignores a foreign subtree within a configuration group. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }

  /** Completes the original item set. @returns Nothing. */
  override endFastElement(): void {
    this.finish(this.values);
  }
}

/** Text content of a typed config item. */
class XMLConfigItemContext extends SvXMLImportContext {
  private value = "";

  /** Binds the original property sink. @param finish - Receives parsed value. @returns Context. */
  constructor(private readonly finish: (value: string) => void) {
    super();
  }

  /** Buffers decoded input. @param value - XML text. @returns Nothing. */
  override characters(value: string): void {
    this.value += value;
  }

  /** Keeps text of a foreign child out of the typed property's value. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }

  /** Ends a config item. @returns Nothing. */
  override endFastElement(): void {
    this.finish(this.value);
  }
}
