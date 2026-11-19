/** @fileoverview Original ODF configuration settings export for represented boolean properties. */
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { escapeXml } from "../text/txtparae";
import { ODF_NAMESPACES } from "./xmltoken";
import type { ViewSettings } from "./DocumentSettingsContext";

/** Encodes a typed scalar view property. @param name - Native name. @param value - Native scalar value. @returns XML. */
function exportViewItem(name: string, value: string | boolean): string {
  return `<config:config-item config:name="${escapeXml(name)}" config:type="${typeof value}">${escapeXml(String(value))}</config:config-item>`;
}

/** Writes the represented indexed native Views property. @param views - Ordered view records. @returns Settings XML. */
export function exportViewSettings(views: ViewSettings): string {
  const { office, config, ooo } = ODF_NAMESPACES;
  const output = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<office:document-settings xmlns:office="${office}" xmlns:config="${config}" xmlns:ooo="${ooo}" office:version="1.3">`,
    '<office:settings><config:config-item-set config:name="ooo:view-settings">',
    '<config:config-item-map-indexed config:name="Views">',
  ];
  for (const view of views) {
    output.push("<config:config-item-map-entry>");
    for (const [name, value] of view) {
      if (typeof value === "string" || typeof value === "boolean") {
        output.push(exportViewItem(name, value));
        continue;
      }
      output.push(`<config:config-item-map-named config:name="${escapeXml(name)}">`);
      for (const [entry, items] of value) {
        output.push(`<config:config-item-map-entry config:name="${escapeXml(entry)}">`);
        for (const [item, scalar] of items) output.push(exportViewItem(item, scalar));
        output.push("</config:config-item-map-entry>");
      }
      output.push("</config:config-item-map-named>");
    }
    output.push("</config:config-item-map-entry>");
  }
  output.push(
    "</config:config-item-map-indexed></config:config-item-set></office:settings></office:document-settings>",
  );
  return output.join("");
}

/** Writes original office:settings and its qualified configuration item set. @param properties - Borrowed configuration property vector. @returns Complete settings XML. */
export function exportConfigurationSettings(properties: readonly PropertyValue[]): string {
  const { office, config, ooo } = ODF_NAMESPACES;
  const output = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<office:document-settings xmlns:office="${office}" xmlns:config="${config}" xmlns:ooo="${ooo}" office:version="1.3">`,
    '<office:settings><config:config-item-set config:name="ooo:configuration-settings">',
  ];
  for (const { Name, Value } of properties) {
    const boolean: [boolean] = [false];
    if (!Value.extract(boolean, "bool")) continue;
    let name = "";
    const units = Name.getStr();
    for (let index = 0; index < Name.getLength(); ++index)
      name += String.fromCharCode(units[index] as number);
    output.push(
      `<config:config-item config:name="${escapeXml(name)}" config:type="boolean">${boolean[0]}</config:config-item>`,
    );
  }
  output.push("</config:config-item-set></office:settings></office:document-settings>");
  return output.join("");
}
