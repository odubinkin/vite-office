/** @fileoverview Actual formatter/language/scanner public pipeline caller for independently compiled scalar-context observations; private scanner state is read, never manufactured. */
import { SvNFLanguageData, SvNumberFormatter } from "../svl/source/numbers/zforlist";
import { NumberFormatCodeMapper } from "../i18npool/inc/numberformatcode";
import { OUString, type OUStringConstReference } from "../sal/inc/rtl/ustring";
import { Color } from "../tools/inc/color";
/** Observes native counted UTF16 without normalization or terminator-based truncation. @param value - Actual owned/borrowed value. @returns Native protocol units. */
function hex(value: OUStringConstReference): string {
  let result = "";
  for (let index = 0; index < value.getLength(); ++index)
    result += (value.getStr()[index] as number).toString(16).padStart(4, "0");
  return result || "-";
}
/** Initializes the original captured transport as an actual SAL Unicode owner. @param value - Native UTF16 protocol. @returns Owned string. */
function unicode(value: string): OUString {
  const units =
    value === "-"
      ? new Uint16Array()
      : Uint16Array.from(
          value.match(/.{4}/gu) as string[],
          /** Parses the original hex unit rather than treating the input as a browser string. @param unit - Native unit. @returns Code unit. */ (
            unit,
          ) => Number.parseInt(unit, 16),
        );
  return new OUString(units, units.length);
}
/** Creates the actual source owner chain and caller-configured color link. @param language - Original requested language. @returns Observer and release. */
export function createFormatScanObserver(language: number): {
  step(row: readonly (string | number)[]): string;
  dispose(): void;
} {
  const mapper = new NumberFormatCodeMapper(),
    callback = new SvNumberFormatter(language),
    current = new SvNFLanguageData(mapper, language, callback),
    scanner = current.GetFormatScanner();
  const palette = Array.from(
    { length: 64 },
    /** Supplies concrete application palette data through the original SetColorLink API. @param _value - Empty array slot. @param index - Source palette offset. @returns Actual Color value. */ (
      _value,
      index,
    ) => new Color(0x100000 + index),
  );
  return {
    /** Runs only original public ScanFormat/GetColor entrypoints on genuine owners. @param row - Original setup and input. @returns Complete independent-protocol observation. */
    step(row: readonly (string | number)[]): string {
      const mode = Number(row[1]),
        kind = String(row[4]);
      scanner.ChangeIntl(mode);
      if (Number(row[5])) scanner.SetConvertMode(Number(row[6]), Number(row[7]), false, true);
      else scanner.SetConvertMode(false);
      const value = unicode(row[2] as string);
      try {
        if (kind === "C") {
          const calls: number[] = [];
          callback.SetColorLink(
            /** Records original user-color lookup arguments while borrowing actual Color values. @param index - Source palette offset. @returns Borrowed color/null. */ (
              index,
            ) => {
              calls.push(index);
              return palette[index] ?? null;
            },
          );
          const color = scanner.GetColor(value);
          return [color ? color.toUInt32() : -1, hex(value), calls.length, ...calls].join(" ");
        }
        if (kind !== "F") throw new Error("Unsupported native scanner protocol");
        const control = scanner.ScanFormat(value),
          result: (string | number)[] = [
            control,
            hex(value),
            scanner.GetScannedType(),
            scanner["nStringsCnt"],
            scanner["nResultStringsCnt"],
            Number(scanner["bThousand"]),
            scanner["nThousand"],
            scanner["nCntPre"],
            scanner["nCntPost"],
            scanner["nCntExp"],
            scanner["nDecPos"],
            scanner["nExpPos"],
            scanner["nBlankPos"],
            Number(scanner["bDecSep"]),
            Number(scanner["bExp"]),
            Number(scanner["bFrac"]),
            Number(scanner["bBlank"]),
            scanner.GetNatNumModifier(),
          ];
        for (let index = 0; index < scanner["nStringsCnt"]; ++index)
          result.push(
            scanner["nTypeArray"][index] as number,
            hex(scanner["sStrArray"][index] as OUString),
          );
        return result.join(" ");
      } finally {
        value.dispose();
      }
    },
    /** Releases all actual source owners after borrowed scanner use ends. @returns Nothing. */
    dispose(): void {
      current.dispose();
      callback.dispose();
      mapper.dispose();
    },
  };
}
