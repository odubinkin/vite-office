/** @fileoverview Actual browser text/focus binding for the source tabulator page; numeric parsing and item algorithms remain in their native owners. */
/// <reference lib="es2023.intl" />
import { SvxTabulatorTabPage } from "../../source/tabpages/tabstpge";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import { formatMetricUnit, type MetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SV_FUNIT_STRINGS } from "../../../vcl/inc/units";
import {
  getSystemLocale,
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
  getSystemThousandSeparator,
} from "../../../unotools/source/misc/syslocale";
/** Original hidden metric field formatting for the page's bounded numeric range. Native JS supplies grouping positions; actual source locale separators, Latin digits, sign and unit rules remain explicit. @param field - Actual normalized numeric owner. @returns Widget text. */
export function formatTabulatorMetric(field: MetricSpinButton): string {
  const locale = getSystemLocale(),
    language = String.fromCharCode(
      ...locale.Language.getStr().subarray(0, locale.Language.getLength()),
    ),
    country = String.fromCharCode(
      ...locale.Country.getStr().subarray(0, locale.Country.getLength()),
    ),
    tag =
      language === "qlt"
        ? String.fromCharCode(...locale.Variant.getStr().subarray(0, locale.Variant.getLength()))
        : language + (country ? "-" + country : ""),
    value = field.get_value(FieldUnit.NONE),
    digits = field.get_digits(),
    unit = field.get_unit();
  const text = new Intl.NumberFormat(tag, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: "always",
    numberingSystem: "latn",
  })
    .formatToParts(Number(value < 0n ? -value : value) / 10 ** digits)
    .map(
      /** Uses the actual LocaleData number fields and uses positive decimal/latn Intl parts, with sign handled separately. @param part - Actual native Intl number part. @returns Original visible number segment. */ (
        part,
      ) =>
        part.type === "group"
          ? getSystemThousandSeparator()
          : part.type === "decimal"
            ? getSystemDecimalSeparator()
            : part.value,
    )
    .join("");
  const suffix =
    SV_FUNIT_STRINGS.find(
      /** Original first unit alias. @param row - Native resource. @returns Match. */ (row) =>
        row[1] === unit,
    )?.[0] ?? "";
  return formatMetricUnit((value < 0n ? "-" : "") + text, unit, suffix);
}
/** Creates original page state against the actual pool and platform fields, with only real entry focus delegated. @param input - Actual input set. @param unit - Module unit. @param focusEntry - Actual entry focus/select operation. @returns Reset native page. */
export function createTabulatorPage(
  input: SfxItemSet,
  unit: FieldUnit,
  focusEntry: (selectAll: boolean) => void,
): SvxTabulatorTabPage {
  const page = new SvxTabulatorTabPage(input, unit, {
    decimal: getSystemDecimalSeparator(),
    alternate: getSystemDecimalSeparatorAlternate(),
    format: formatTabulatorMetric,
    focusEntry,
  });
  page.Reset(input);
  return page;
}
