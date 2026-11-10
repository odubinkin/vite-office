/** @fileoverview Original ODF configuration settings export for represented boolean properties. */
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { escapeXml } from "../text/txtparae";
import { ODF_NAMESPACES } from "./xmltoken";

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
