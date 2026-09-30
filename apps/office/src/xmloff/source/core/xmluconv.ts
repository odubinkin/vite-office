/** @fileoverview Owns the bounded ODF-to-core length conversion responsibility from pinned xmloff/source/core/xmluconv.cxx. */

/** Converts one bounded ODF absolute length to Writer twips. @param value - ODF length. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
export function importOdfLength(value: string, signed: boolean, label: string): number {
  const match = new RegExp(`^(${signed ? "-?" : ""}(?:0|[0-9]+(?:\\.[0-9]+)?))(cm|in|mm|pt)$`).exec(
    value,
  );
  if (match === null) throw new Error(`Unsupported ODF ${label}: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  const twips =
    unit === "cm"
      ? (amount * 1440) / 2.54
      : unit === "in"
        ? amount * 1440
        : unit === "mm"
          ? (amount * 1440) / 25.4
          : amount * 20;
  return Math.round(twips);
}
