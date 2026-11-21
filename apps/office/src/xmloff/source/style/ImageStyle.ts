/** @fileoverview Named ODF fill-image attributes from xmloff ImageStyle.cxx. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { encodeStyleName } from "../core/xmluconv";
import { escapeXml } from "../text/txtparae";

/** XML identity, public style name and embedded package reference. */
export interface XMLImageStyleDefinition {
  readonly name: string;
  readonly displayName: string;
  readonly href: string;
}

/** Reads the original image-style identity and link. @param attributes - SAX attributes. @returns Declaration when both required attributes are present. */
export function importImageStyle(
  attributes: FastAttributeList,
): XMLImageStyleDefinition | undefined {
  const name = attributes.get(T.DRAW_NAME),
    href = attributes.get(T.XLINK_HREF);
  if (name === null || href === null) return undefined;
  return { name, displayName: attributes.get(T.DRAW_DISPLAY_NAME) || name, href };
}

/** Writes the original encoded declaration and package link. @param name - Public bitmap name. @param href - Stored graphic reference. @returns ODF image style. */
export function exportImageStyle(name: string, href: string): string {
  const encoded = encodeStyleName(name);
  const display = encoded === name ? "" : ` draw:display-name="${escapeXml(name)}"`;
  return `<draw:fill-image draw:name="${encoded}"${display} xlink:href="${escapeXml(href)}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>`;
}
