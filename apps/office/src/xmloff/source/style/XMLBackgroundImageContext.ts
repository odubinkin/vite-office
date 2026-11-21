/** @fileoverview Original legacy ODF page background image and placement context. */
import { Converter } from "../../../sax/source/tools/converter";
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint as P } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import { XMLBase64ImportContext } from "../core/XMLBase64ImportContext";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import type { XMLGraphicSource } from "../core/xmlgrhlp";
import { XMLToken } from "../core/xmltoken";
import { importBitmapMode } from "../draw/fill-properties";

/** Legacy graphic source, anchor, repeat mode and opacity. */
export interface OdfPageBackgroundImage extends XMLGraphicSource {
  readonly mode: BitmapMode;
  readonly point?: P;
  readonly transparency?: number;
}

/** Translates the original legacy position tokens to their drawing point. @param raw - Legacy style position. @returns Position if recognized. */
function importLegacyPoint(raw: string): P | undefined {
  let point = P.MIDDLE_MIDDLE,
    horizontal = false,
    vertical = false;
  for (const token of raw.split(" ")) {
    if (horizontal && vertical) return undefined;
    if (token.includes("%")) {
      const percent: [number] = [0];
      if (!Converter.convertPercent(percent, token)) return undefined;
      const value = percent[0];
      if (!horizontal) {
        point = value < 25 ? P.LEFT_TOP : value < 75 ? P.MIDDLE_MIDDLE : P.RIGHT_BOTTOM;
        horizontal = true;
      } else {
        // The second percent passes a left-column point to the native vertical merge.
        point = mergeLegacyVertical(
          point,
          value < 25 ? P.LEFT_TOP : value < 75 ? P.LEFT_MIDDLE : P.LEFT_BOTTOM,
        );
        vertical = true;
      }
    } else if (token === "center") {
      if (horizontal) point = mergeLegacyVertical(point, P.MIDDLE_MIDDLE);
      else if (vertical) point = Math.floor(point / 3) * 3 + 1;
      else point = P.MIDDLE_MIDDLE;
    } else if (token === "left" || token === "right") {
      const column = token === "left" ? 0 : 2;
      if (vertical) point = Math.floor(point / 3) * 3 + column;
      else if (!horizontal) point = 3 + column;
      else return undefined;
      horizontal = true;
    } else if (token === "top" || token === "bottom") {
      const row = token === "top" ? 0 : 2;
      if (horizontal) point = mergeLegacyVertical(point, row * 3 + 1);
      else if (!vertical) point = row * 3 + 1;
      else return undefined;
      vertical = true;
    } else return undefined;
  }
  return point;
}

/** Applies the source GraphicLocation vertical merge. @param point - Current point. @param vertical - Point contributed by the vertical token. @returns Merged point. */
function mergeLegacyVertical(point: P, vertical: P): P {
  const column = point % 3;
  if (column === 1) return vertical;
  const row = vertical === P.MIDDLE_TOP ? 0 : vertical === P.MIDDLE_MIDDLE ? 1 : 2;
  return row * 3 + column;
}

/** Loads the first inline background image only if the legacy URL is empty. */
export class XMLBackgroundImageContext extends SvXMLImportContext {
  private readonly image: OdfPageBackgroundImage;
  private hasStream = false;
  private inline: Uint8Array | undefined;

  /** Collects placement in original attribute order. @param attributes - Legacy image attributes. @param publish - Receiver for this background. @returns Context. */
  constructor(
    attributes: FastAttributeList,
    private readonly publish: (image: OdfPageBackgroundImage) => void,
  ) {
    super();
    const href = attributes.get(XMLToken.XLINK_HREF) ?? "";
    const opacity = attributes.get(XMLToken.DRAW_OPACITY);
    const value: [number] = [0];
    const transparent =
      opacity !== null &&
      Converter.convertPercent(value, opacity) &&
      value[0] >= 0 &&
      value[0] < 100;
    let mode = BitmapMode.REPEAT;
    let point: P | undefined;
    for (const [key, raw] of attributes) {
      if (key === XMLToken.STYLE_POSITION) {
        const authored = importLegacyPoint(raw);
        if (authored !== undefined) {
          point = authored;
          mode = BitmapMode.NO_REPEAT;
        }
      } else if (key === XMLToken.STYLE_REPEAT) {
        const authored = importBitmapMode(raw);
        if (authored !== undefined && !(authored === BitmapMode.NO_REPEAT && point !== undefined)) {
          mode = authored;
          point = authored === BitmapMode.NO_REPEAT ? P.MIDDLE_MIDDLE : undefined;
        }
      }
    }
    this.image = {
      href,
      mode,
      ...(point === undefined ? {} : { point }),
      ...(transparent ? { transparency: 100 - value[0] } : {}),
    };
  }

  /** Admits a binary child only in the absence of a URL. @param element - Child token. @returns Binary context or absence. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
    if (element !== XMLToken.OFFICE_BINARY_DATA || this.image.href || this.hasStream) return null;
    this.hasStream = true;
    return new XMLBase64ImportContext(
      /** Retains the decoded legacy graphic. @param bytes - Decoded data. @returns Nothing. */
      (bytes) => {
        this.inline = bytes;
      },
    );
  }

  /** Publishes the graphic source only if it could have an image. @returns Nothing. */
  override endFastElement(): void {
    if (this.image.href) this.publish(this.image);
    else if (this.inline !== undefined) this.publish({ ...this.image, inline: this.inline });
  }
}
