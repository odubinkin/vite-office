/** @fileoverview Original Writer ODF table-of-content source properties and levels. */
import { Converter } from "../../../sax/source/tools/converter";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLIndexSourceBaseContext,
  type XMLIndexSourceProperties,
} from "./XMLIndexSourceBaseContext";

/** Original content-index source options and its ordered template values. */
export interface XMLIndexTOCSource extends XMLIndexSourceProperties {
  readonly family: "table-of-content";
  readonly outlineLevel: number;
  readonly useOutline: boolean;
  readonly useMarks: boolean;
  readonly useStyles: boolean;
}

/** Imports the native TOC descriptor independently of the generated document body. */
export class XMLIndexTOCSourceContext extends XMLIndexSourceBaseContext {
  private outlineLevel: number;
  private readonly useOutline: [boolean] = [true];
  private readonly useMarks: [boolean] = [true];
  private readonly useStyles: [boolean] = [false];

  /** Reads the source with the defaults of the original chapter and style service. @param attributes - TOC source attributes. @param levels - Document chapter numbering depth. @param publish - Connected index descriptor callback. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    levels: number,
    private readonly publish: (source: XMLIndexTOCSource) => void,
  ) {
    super(attributes, "table-of-content", levels);
    this.outlineLevel = levels;
    const depth: [number] = [0];
    const flag: [boolean] = [false];
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.TEXT_OUTLINE_LEVEL:
          if (value === "none") this.useOutline[0] = false;
          else if (Converter.convertNumber(depth, value, 1, levels)) {
            this.useOutline[0] = true;
            this.outlineLevel = depth[0];
          }
          break;
        case XMLToken.TEXT_USE_OUTLINE_LEVEL:
          if (Converter.convertBool(flag, value)) this.useOutline[0] = flag[0];
          break;
        case XMLToken.TEXT_USE_INDEX_MARKS:
          if (Converter.convertBool(flag, value)) this.useMarks[0] = flag[0];
          break;
        case XMLToken.TEXT_USE_INDEX_SOURCE_STYLES:
          if (Converter.convertBool(flag, value)) this.useStyles[0] = flag[0];
          break;
        default:
          break;
      }
    }
  }

  /** Applies the entire source descriptor to the connected index. @returns Nothing. */
  public override endFastElement(): void {
    this.publish({
      ...this.GetSource(),
      family: "table-of-content",
      outlineLevel: this.outlineLevel,
      useOutline: this.useOutline[0],
      useMarks: this.useMarks[0],
      useStyles: this.useStyles[0],
    });
  }
}
