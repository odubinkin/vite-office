/** @fileoverview Preserves historical inverse row fixtures and assertions only at the test boundary. */
import { SwFormatRowSplit } from "../sw/inc/fmtrowsplt";
import type { SwTableLineFormatValue } from "../sw/source/core/table/swtable";

/** Historical test fixture, independent of canonical Writer row ownership. */
interface InverseRowFixture extends Omit<SwTableLineFormatValue, "rowSplit"> {
  readonly keepTogether?: boolean | undefined;
}
/** Creates a concrete native row item without changing an old literal fixture. @param value - Historical row fixture. @returns Native row attributes. */
export function nativeRowFormatForTest(value: InverseRowFixture): SwTableLineFormatValue {
  const { keepTogether, ...format } = value;
  return {
    ...format,
    ...(keepTogether === undefined ? {} : { rowSplit: new SwFormatRowSplit(!keepTogether) }),
  };
}
/** Observes the historical inverse boolean while preserving omitted direct state. @param value - Actual native row attributes. @returns Original assertion's boolean or absence. */
export function rowKeepTogetherForTest(
  value: SwTableLineFormatValue | undefined,
): boolean | undefined {
  return value?.rowSplit === undefined ? undefined : !value.rowSplit.GetValue();
}
