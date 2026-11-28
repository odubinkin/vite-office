/** @fileoverview Original ODF configuration settings export for represented typed properties. */
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { escapeXml } from "../text/txtparae";
import { ODF_NAMESPACES } from "./xmltoken";
import type { ViewItem, ViewSettings } from "./DocumentSettingsContext";

/** Encodes a typed scalar view property. @param name - Native name. @param value - Native scalar value. @param numericType - Explicit native short type. @returns XML. */
function exportViewItem(name: string, value: ViewItem[1], numericType?: ViewItem[2]): string {
  const type = typeof value === "number" ? (numericType ?? "int") : typeof value;
  return `<config:config-item config:name="${escapeXml(name)}" config:type="${type}">${escapeXml(String(value))}</config:config-item>`;
}

/** Writes the view group into the existing settings stream. @param views - Ordered view records. @param output - XML writer. @returns Nothing. */
function exportViewGroup(views: ViewSettings, output: string[]): void {
  output.push(
    '<config:config-item-set config:name="ooo:view-settings">',
    '<config:config-item-map-indexed config:name="Views">',
  );
  for (const view of views) {
    output.push("<config:config-item-map-entry>");
    for (const [name, value, numericType] of view) {
      if (typeof value !== "object") {
        output.push(exportViewItem(name, value, numericType));
        continue;
      }
      output.push(`<config:config-item-map-named config:name="${escapeXml(name)}">`);
      for (const [entry, items] of value) {
        output.push(`<config:config-item-map-entry config:name="${escapeXml(entry)}">`);
        for (const [item, scalar, type] of items) output.push(exportViewItem(item, scalar, type));
        output.push("</config:config-item-map-entry>");
      }
      output.push("</config:config-item-map-named>");
    }
    output.push("</config:config-item-map-entry>");
  }
  output.push("</config:config-item-map-indexed></config:config-item-set>");
}

/** Serializes the represented native UNO scalar types. @param properties - Borrowed property vector. @param output - XML writer. @returns Nothing. */
function exportConfigurationGroup(properties: readonly PropertyValue[], output: string[]): void {
  output.push('<config:config-item-set config:name="ooo:configuration-settings">');
  for (const { Name, Value } of properties) {
    let name = "";
    const units = Name.getStr();
    for (let index = 0; index < Name.getLength(); ++index)
      name += String.fromCharCode(units[index] as number);
    const type = Value.getValueTypeClass();
    if (type === TypeClass.BOOLEAN) {
      const boolean: [boolean] = [false];
      if (Value.extract(boolean, "bool")) output.push(exportViewItem(name, boolean[0]));
    } else if (type === TypeClass.STRING) {
      const value = new OUString();
      try {
        if (Value.extract(value, "OUString")) output.push(exportViewItem(name, text(value)));
      } finally {
        value.dispose();
      }
    } else if (type === TypeClass.SHORT || type === TypeClass.LONG) {
      const number: [number] = [0];
      const short = type === TypeClass.SHORT;
      if (Value.extract(number, short ? "sal_Int16" : "sal_Int32"))
        output.push(exportViewItem(name, number[0], short ? "short" : undefined));
    }
  }
  output.push("</config:config-item-set>");
}

/** Writes supported groups into one original settings stream. @param views - Optional native view group. @param properties - Optional configuration group. @returns Complete settings XML. */
export function exportDocumentSettings(
  views?: ViewSettings,
  properties?: readonly PropertyValue[],
): string {
  const { office, config, ooo } = ODF_NAMESPACES;
  const output = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<office:document-settings xmlns:office="${office}" xmlns:config="${config}" xmlns:ooo="${ooo}" office:version="1.3">`,
    "<office:settings>",
  ];
  if (views !== undefined) exportViewGroup(views, output);
  if (properties !== undefined) exportConfigurationGroup(properties, output);
  output.push("</office:settings></office:document-settings>");
  return output.join("");
}

/** Writes the represented indexed native Views property. @param views - Ordered view records. @returns Settings XML. */
export function exportViewSettings(views: ViewSettings): string {
  return exportDocumentSettings(views);
}

/** Writes the represented original configuration property group. @param properties - Borrowed property vector. @returns Settings XML. */
export function exportConfigurationSettings(properties: readonly PropertyValue[]): string {
  return exportDocumentSettings(undefined, properties);
}
