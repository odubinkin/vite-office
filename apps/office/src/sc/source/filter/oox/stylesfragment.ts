/** @fileoverview Relationship-owned XLSX styles fragment and original style child dispatch. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import {
  FragmentHandler,
  type FragmentContext,
  type FragmentFilter,
} from "../../../../oox/source/core/fragmenthandler";
import { Font, readStyleBool, styleIndex, StylesBuffer, Xf } from "./stylesbuffer";
import { Alignment } from "./stylesbuffer.alignment";
import { Border } from "./stylesbuffer.border";
import { XlsColor } from "./stylesbuffer.color";
import { attribute, isSpreadsheetTag } from "./workbookfragment";
import { readProtection } from "./stylesbuffer.protection";
import { Dxf } from "./stylesbuffer.dxf";

const children: Readonly<Record<string, readonly string[]>> = {
  "": ["styleSheet"],
  styleSheet: [
    "numFmts",
    "fonts",
    "fills",
    "borders",
    "cellStyleXfs",
    "cellXfs",
    "cellStyles",
    "colors",
    "dxfs",
  ],
  dxfs: ["dxf"],
  colors: ["indexedColors"],
  indexedColors: ["rgbColor"],
  cellStyles: ["cellStyle"],
  numFmts: ["numFmt"],
  fonts: ["font"],
  fills: ["fill"],
  fill: ["patternFill"],
  patternFill: ["fgColor"],
  borders: ["border"],
  border: ["left", "right", "start", "end", "top", "bottom", "diagonal", "horizontal", "vertical"],
  left: ["color"],
  right: ["color"],
  start: ["color"],
  end: ["color"],
  top: ["color"],
  bottom: ["color"],
  diagonal: ["color"],
  horizontal: ["color"],
  vertical: ["color"],
  cellStyleXfs: ["xf"],
  cellXfs: ["xf"],
  xf: ["alignment", "protection"],
};

/** Original font context is shared by the styles part and rich string run properties. */
export class FontContext implements FragmentContext {
  /** Borrows the font model. @param font - Original font owner. @returns Context. */
  constructor(private readonly font: Font) {}
  /** Imports the original font property from an admitted SpreadsheetML child. @param tag - Child. @param attributes - Source attributes. @returns No nested context. */
  createFastChildContext(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): null {
    if (isSpreadsheetTag(tag)) {
      if (tag.local === "color") this.font.setColor(XlsColor.importColor(attributes));
      else this.font.importAttribs(tag.local, attribute(attributes, "val"));
    }
    return null;
  }
  /** The root is configured by its owner. @returns Nothing. */
  startFastElement(): void {}
  /** Original inert font end callback. @returns Nothing. */
  endFastElement(): void {}
  /** Font attributes do not carry character content. @returns Nothing. */
  characters(): void {}
}

/** Parses original indexed style tables before worksheet data. */
export class StylesFragment extends FragmentHandler {
  private readonly stack: string[] = [];
  private solidFill = false;
  private xf: Xf | undefined;
  sawStyleSheet = false;

  /** Binds the styles part to its workbook-owned buffer. @param filter - Package owner. @param path - Relationship target. @param styles - Workbook style buffer. @returns Styles fragment. */
  constructor(
    filter: FragmentFilter,
    path: string,
    private readonly styles: StylesBuffer,
  ) {
    super(filter, path);
  }

  /** Admits children allowed within the original SpreadsheetML style record contexts. @param tag - Current element. @returns The admitted context. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (!isSpreadsheetTag(tag) || !children[this.stack.at(-1) ?? ""]?.includes(tag.local))
      return null;
    if (tag.local === "dxf") {
      const dxf = new Dxf(this.styles.graphicHelper);
      this.styles.dxfs.push(dxf);
      return dxf;
    }
    if (tag.local !== "font") return this;
    const font = new Font(this.styles.graphicHelper);
    this.styles.fonts.push(font);
    return new FontContext(font);
  }

  /** Adds original records in package index order and dispatches their supported properties. @param tag - Current element. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    const parent = this.stack.at(-1);
    this.stack.push(tag.local);
    if (parent === "border") this.styles.borders.at(-1)?.importStyle(tag.local, attributes);
    switch (tag.local) {
      case "border":
        this.styles.borders.push(new Border(attributes));
        break;
      case "color":
        if (parent) this.styles.borders.at(-1)?.importColor(parent, attributes);
        break;
      case "styleSheet":
        this.sawStyleSheet = true;
        break;
      case "cellStyle": {
        const xfId = styleIndex(attribute(attributes, "xfId"));
        if (xfId >= 0 && styleIndex(attribute(attributes, "builtinId")) === 0)
          this.styles.defaultStyleXf = xfId;
        break;
      }
      case "numFmt":
        this.styles.numberFormats.importNumFmt(
          styleIndex(attribute(attributes, "numFmtId")),
          attribute(attributes, "formatCode"),
        );
        break;
      case "fill":
        this.styles.fills.push({});
        break;
      case "patternFill":
        this.solidFill = attribute(attributes, "patternType") === "solid";
        break;
      case "fgColor": {
        const fill = this.styles.fills.at(-1);
        if (this.solidFill && fill) fill.color = XlsColor.importColor(attributes);
        break;
      }
      case "rgbColor":
        this.styles.graphicHelper.appendColor(attribute(attributes, "rgb"));
        break;
      case "xf": {
        const font = styleIndex(attribute(attributes, "fontId"));
        const fill = styleIndex(attribute(attributes, "fillId"));
        const border = styleIndex(attribute(attributes, "borderId"));
        const numberFormat = styleIndex(attribute(attributes, "numFmtId"));
        const style = styleIndex(attribute(attributes, "xfId"));
        const cellXf = parent === "cellXfs";
        const apply = !cellXf || style < 0;
        this.xf = new Xf(
          font,
          fill,
          border,
          numberFormat,
          cellXf ? Math.max(0, style) : -1,
          readStyleBool(attribute(attributes, "applyFont"), apply || font > 0),
          readStyleBool(attribute(attributes, "applyFill"), apply || fill > 0),
          readStyleBool(attribute(attributes, "applyBorder"), apply || border > 0),
          readStyleBool(attribute(attributes, "applyNumberFormat"), apply || numberFormat > 0),
          readStyleBool(attribute(attributes, "applyAlignment"), apply),
          readProtection(attributes, apply)[2],
          cellXf,
        );
        (cellXf ? this.styles.cellXfs : this.styles.styleXfs).push(this.xf);
        break;
      }
      case "alignment":
        if (this.xf) this.xf.alignment = Alignment.importAlignment(attributes);
        break;
      case "protection": {
        const [locked, hidden] = readProtection(attributes);
        this.xf?.importProtection(locked, hidden);
        break;
      }
    }
  }

  /** Leaves the current original record context. @param tag - Completed element. @returns Nothing. */
  override endFastElement(tag: SaxesTagNS): void {
    if (tag.local === "xf") this.xf = undefined;
    this.stack.pop();
  }
}
