/** @fileoverview Imports supported ODF line-number settings at the pinned XMLLineNumberingImportContext boundary. */

import { Converter } from "../../../sax/source/tools/converter";
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { ARABIC } from "../../../offapi/com/sun/star/style/NumberingType";

/** ODF line-numbering configuration independent of Writer document ownership. */
export interface OdfLineNumberingConfiguration {
  readonly countBlankLines: boolean;
  readonly countBy?: number | undefined;
  readonly countInFlys: boolean;
  readonly divider: string;
  readonly dividerCountBy?: number;
  readonly paintLineNumbers: boolean;
  readonly distance: number;
  readonly numberingType: number;
  readonly charStyleName?: string | undefined;
  readonly position: "left" | "right" | "inside" | "outside";
  readonly restartEachPage: boolean;
}

/** Imports one document-level text:linenumbering-configuration. */
export class XMLLineNumberingImportContext extends SvXMLImportContext {
  private values: OdfLineNumberingConfiguration;

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
    const converter = new SvXMLUnitConverter("mm100");
    const numbering = { value: ARABIC as number };
    converter.convertNumFormat(
      numbering,
      attributes.get(XMLToken.STYLE_NUM_FORMAT) ?? "1",
      attributes.get(XMLToken.STYLE_NUM_LETTER_SYNC) ?? "false",
      false,
    );
    const position = attributes.get(XMLToken.TEXT_NUMBER_POSITION);
    const rawDistance = attributes.get(XMLToken.TEXT_OFFSET);
    this.values = {
      countBlankLines: readBoolean(attributes, XMLToken.TEXT_COUNT_EMPTY_LINES, true),
      countBy: readIncrement(attributes),
      countInFlys: readBoolean(attributes, XMLToken.TEXT_COUNT_IN_TEXT_BOXES, false),
      divider: "",
      paintLineNumbers: readBoolean(attributes, XMLToken.TEXT_NUMBER_LINES, true),
      distance: (rawDistance === null ? null : converter.convertMeasureToCore(rawDistance)) ?? -1,
      numberingType: numbering.value,
      charStyleName: attributes.get(XMLToken.TEXT_STYLE_NAME) ?? undefined,
      position:
        position === "right" || position === "inside" || position === "outside" ? position : "left",
      restartEachPage: readBoolean(attributes, XMLToken.TEXT_RESTART_ON_PAGE, false),
    };
  }

  /** Imports the optional separator. @param element - Child token. @param attributes - Child attributes. @returns Separator context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.TEXT_LINENUMBERING_SEPARATOR) return null;
    attributes.assertOnly([XMLToken.TEXT_INCREMENT], "line-number separator");
    const increment = readIncrement(attributes);
    if (increment !== undefined) this.values = { ...this.values, dividerCountBy: increment };
    return new XMLLineNumberingSeparatorImportContext(
      /** Captures separator text. @param divider - Text. @returns Nothing. */
      (divider) => {
        this.values = { ...this.values, divider };
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

  /** Binds the separator text to its parent context. @param publish - Parent sink. @returns Nothing. */
  public constructor(private readonly publish: (divider: string) => void) {
    super();
  }
  /** Accumulates decoded separator characters. @param characters - Text. @returns Nothing. */
  public override characters(characters: string): void {
    this.divider += characters;
  }
  /** Publishes separator values. @returns Nothing. */
  public override endFastElement(): void {
    this.publish(this.divider);
  }
}

/** Keeps the source default when SAX boolean conversion fails. @param attributes - Source. @param token - Attribute. @param fallback - Upstream default. @returns Boolean. */
function readBoolean(attributes: FastAttributeList, token: XMLToken, fallback: boolean): boolean {
  const raw = attributes.get(token);
  const value: [boolean] = [false];
  return raw !== null && Converter.convertBool(value, raw) ? value[0] : fallback;
}

/** Mirrors native SAX conversion and signed16 narrowing before UNO property admission. @param attributes - Source. @returns XML interval or no value on failed conversion. */
function readIncrement(attributes: FastAttributeList): number | undefined {
  const raw = attributes.get(XMLToken.TEXT_INCREMENT);
  const output: [number] = [0];
  return raw !== null && Converter.convertNumber(output, raw, 0)
    ? (output[0] << 16) >> 16
    : undefined;
}
