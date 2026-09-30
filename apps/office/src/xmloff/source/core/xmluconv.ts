/** @fileoverview Owns the bounded ODF-to-core length conversion responsibility from pinned xmloff/source/core/xmluconv.cxx. */

import { Converter, type CoreMeasureUnit } from "../../../sax/source/tools/converter";

/** Delegates configured XML core measurement conversion to the SAX converter. */
export class SvXMLUnitConverter {
  /** Captures the owning import's core measurement unit. @param coreUnit - Core unit. @returns Nothing. */
  public constructor(private readonly coreUnit: CoreMeasureUnit) {}

  /** Converts one XML measure using native failure and range semantics. @param value - XML measure. @param min - Inclusive lower limit. @param max - Inclusive upper limit. @returns Core integer or null on conversion failure. */
  public convertMeasureToCore(value: string, min = -2147483648, max = 2147483647): number | null {
    return Converter.convertMeasure(value, this.coreUnit, min, max);
  }
}

/** Converts one bounded ODF absolute length to Writer twips. @param value - ODF length. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
export function importOdfLength(value: string, signed: boolean, label: string): number {
  const match = new RegExp(`^(${signed ? "-?" : ""}(?:0|[0-9]+(?:\\.[0-9]+)?))(cm|in|mm|pt)$`).exec(
    value,
  );
  if (match === null) throw new Error(`Unsupported ODF ${label}: ${value}`);
  return new SvXMLUnitConverter("twip").convertMeasureToCore(value) as number;
}
