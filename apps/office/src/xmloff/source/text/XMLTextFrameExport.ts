/** @fileoverview Native Writer text-frame element and graphic style export from txtparae.cxx. */
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";
import type { XMLTextExportBlock } from "../table/XMLTableExport";
import { escapeXml, exportOdfLength } from "./txtparae";
import { exportFrameConstant } from "./txtprhdl";
import type { XMLTextFrameAttributes, XMLTextFrameStyle } from "./XMLTextFrameContext";

/** Neutral text-frame properties supplied by Writer at an actual paragraph anchor. */
export interface XMLTextFrameExportSource extends Omit<XMLTextFrameAttributes, "styleName"> {
  readonly parentStyle: string;
  readonly style: XMLTextFrameStyle;
  readonly content: readonly XMLTextExportBlock[];
}

/** Formats one optional XML attribute after lexical conversion. @param name - Qualified name. @param value - Converted value. @returns Attribute text. */
function attribute(name: string, value: string | undefined): string {
  return value === undefined ? "" : ` ${name}="${escapeXml(value)}"`;
}

/** Formats a represented physical frame measure. @param name - Qualified name. @param value - Twip measure. @returns Attribute text. */
function length(name: string, value: number | undefined): string {
  return attribute(name, value === undefined ? undefined : exportOdfLength(value));
}

/** Emits the original relative size lexical value. @param value - Native byte field. @returns Percentage, scale or absent. */
function percent(value: number | undefined): string | undefined {
  return value === undefined || value === 0 ? undefined : value === 255 ? "scale" : `${value}%`;
}

/** Emits the consumed native graphic style properties. @param frame - Original properties. @param styleName - Automatic style name. @returns ODF automatic style. */
export function exportTextFrameStyle(frame: XMLTextFrameExportSource, styleName: string): string {
  const { style } = frame;
  const values =
    attribute(
      "style:horizontal-pos",
      exportFrameConstant(style.toggle ? "horizontalMirrored" : "horizontal", style.horizontal),
    ) +
    attribute(
      "style:horizontal-rel",
      exportFrameConstant("horizontalRelation", style.horizontalRelation),
    ) +
    attribute("style:vertical-pos", exportFrameConstant("vertical", style.vertical)) +
    attribute(
      "style:vertical-rel",
      exportFrameConstant("verticalRelation", style.verticalRelation),
    ) +
    attribute("style:wrap", exportFrameConstant("wrap", style.wrap)) +
    attribute(
      "style:number-wrapped-paragraphs",
      style.anchorOnly === undefined ? undefined : style.anchorOnly ? "1" : "no-limit",
    ) +
    length("fo:margin-left", style.marginLeft) +
    length("fo:margin-right", style.marginRight) +
    length("fo:margin-top", style.marginTop) +
    length("fo:margin-bottom", style.marginBottom);
  const parent = attribute("style:parent-style-name", frame.parentStyle || undefined);
  return `<style:style style:name="${styleName}" style:family="graphic"${parent}><style:graphic-properties${values}/></style:style>`;
}

/** Emits the original text frame and text box with already-exported native text and tables. @param frame - Actual frame properties. @param styleName - Automatic style name. @param content - Ordered text-box XML. @returns ODF frame element. */
export function exportTextFrameElement(
  frame: XMLTextFrameExportSource,
  styleName: string,
  content: string,
): string {
  const values =
    attribute("draw:name", frame.name || undefined) +
    attribute("text:anchor-type", frame.anchor) +
    length("svg:x", frame.style.horizontal === HoriOrientation.NONE ? frame.x : undefined) +
    length("svg:y", frame.style.vertical === VertOrientation.NONE ? frame.y : undefined) +
    length("svg:width", frame.width) +
    length("svg:height", frame.height) +
    attribute("style:rel-width", percent(frame.relativeWidth)) +
    attribute("style:rel-height", percent(frame.relativeHeight));
  const minimum =
    length("fo:min-height", frame.minimumHeight) + length("fo:min-width", frame.minimumWidth);
  return `<draw:frame draw:style-name="${styleName}"${values}><draw:text-box${minimum}>${content}</draw:text-box></draw:frame>`;
}
