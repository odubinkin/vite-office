/** @fileoverview Imports supported ODF line-number settings at the pinned XMLLineNumberingImportContext boundary. */

import { FastAttributeList, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";
import { importOdfLength } from "./XMLTextPropertySetContext";

/** ODF line-numbering configuration independent of Writer document ownership. */
export interface OdfLineNumberingConfiguration {
  readonly countBlankLines: boolean;
  readonly countBy: number;
  readonly countInFlys: boolean;
  readonly divider: string;
  readonly dividerCountBy: number;
  readonly paintLineNumbers: boolean;
  readonly posFromLeft: number;
  readonly position: "left" | "right" | "inside" | "outside";
  readonly restartEachPage: boolean;
}

/** Imports one document-level text:linenumbering-configuration. */
export class XMLLineNumberingImportContext extends SvXMLImportContext {
  private values: OdfLineNumberingConfiguration;
  private separatorSeen = false;

  /** Reads global line-number attributes. @param attributes - Fast ODF attributes. @param publish - Completed settings sink. @returns Nothing. */
  public constructor(
    attributes: FastAttributeList,
    private readonly publish: (value: OdfLineNumberingConfiguration) => void,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.TEXT_STYLE_NAME,
        XMLToken.TEXT_NUMBER_LINES,
        XMLToken.TEXT_COUNT_EMPTY_LINES,
        XMLToken.TEXT_COUNT_IN_TEXT_BOXES,
        XMLToken.TEXT_RESTART_ON_PAGE,
        XMLToken.TEXT_OFFSET,
        XMLToken.STYLE_NUM_FORMAT,
        XMLToken.STYLE_NUM_LETTER_SYNC,
        XMLToken.TEXT_NUMBER_POSITION,
        XMLToken.TEXT_INCREMENT,
      ],
      "line numbering",
    );
    const format = attributes.get(XMLToken.STYLE_NUM_FORMAT) ?? "1";
    if (format !== "1") throw new Error("Unsupported ODF line-number format.");
    const position = attributes.get(XMLToken.TEXT_NUMBER_POSITION) ?? "left";
    if (!["left", "right", "inside", "outside"].includes(position))
      throw new Error("Unsupported ODF line-number position.");
    this.values = {
      countBlankLines: readBoolean(attributes, XMLToken.TEXT_COUNT_EMPTY_LINES, true),
      countBy: readIncrement(attributes, XMLToken.TEXT_INCREMENT, 5),
      countInFlys: readBoolean(attributes, XMLToken.TEXT_COUNT_IN_TEXT_BOXES, false),
      divider: "",
      dividerCountBy: 3,
      paintLineNumbers: readBoolean(attributes, XMLToken.TEXT_NUMBER_LINES, true),
      posFromLeft:
        attributes.get(XMLToken.TEXT_OFFSET) === null
          ? 283
          : importOdfLength(
              attributes.require(XMLToken.TEXT_OFFSET, "line-number offset"),
              false,
              "line-number offset",
            ),
      position: position as OdfLineNumberingConfiguration["position"],
      restartEachPage: readBoolean(attributes, XMLToken.TEXT_RESTART_ON_PAGE, false),
    };
  }

  /** Imports the optional separator. @param element - Child token. @param attributes - Child attributes. @returns Separator context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.TEXT_LINENUMBERING_SEPARATOR) return null;
    if (this.separatorSeen) throw new Error("Duplicate ODF line-number separator.");
    this.separatorSeen = true;
    return new XMLLineNumberingSeparatorImportContext(
      attributes,
      /** Captures separator text. @param divider - Text. @param dividerCountBy - Interval. @returns Nothing. */
      (divider, dividerCountBy) => {
        this.values = { ...this.values, divider, dividerCountBy };
      },
    );
  }

  /** Publishes the complete settings when the element closes. @returns Nothing. */
  public override endFastElement(): void {
    this.publish(this.values);
  }
}

/** Imports the optional text:linenumbering-separator. */
class XMLLineNumberingSeparatorImportContext extends SvXMLImportContext {
  private divider = "";
  private readonly dividerCountBy: number;

  /** Reads separator interval. @param attributes - Separator attributes. @param publish - Parent sink. @returns Nothing. */
  public constructor(
    attributes: FastAttributeList,
    private readonly publish: (divider: string, dividerCountBy: number) => void,
  ) {
    super();
    attributes.assertOnly([XMLToken.TEXT_INCREMENT], "line-number separator");
    this.dividerCountBy = readIncrement(attributes, XMLToken.TEXT_INCREMENT, 3);
  }
  /** Accumulates decoded separator characters. @param characters - Text. @returns Nothing. */
  public override characters(characters: string): void {
    this.divider += characters;
  }
  /** Publishes separator values. @returns Nothing. */
  public override endFastElement(): void {
    this.publish(this.divider, this.dividerCountBy);
  }
}

/** Reads a strict ODF boolean. @param attributes - Source. @param token - Attribute. @param fallback - Upstream default. @returns Boolean. */
function readBoolean(attributes: FastAttributeList, token: XMLToken, fallback: boolean): boolean {
  const raw = attributes.get(token);
  if (raw === null) return fallback;
  if (raw !== "true" && raw !== "false") throw new Error("Unsupported ODF line-number boolean.");
  return raw === "true";
}

/** Reads a nonnegative ODF line interval. @param attributes - Source. @param token - Attribute. @param fallback - Upstream default. @returns Interval. */
function readIncrement(attributes: FastAttributeList, token: XMLToken, fallback: number): number {
  const raw = attributes.get(token);
  if (raw === null) return fallback;
  const number = Number(raw);
  if (!Number.isInteger(number) || number < 0 || number > 65535)
    throw new Error("Unsupported ODF line-number increment.");
  return number;
}
