/** @fileoverview Replays unchanged native currency completion methods over actual owned buffers and borrowed counted UTF16 symbols. */
import { expect, it } from "vitest";
import observations from "./native-currency-completion.json";
import { NfCurrencyEntry } from "./zforlist.currency-entry";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";

it.each([false, true])(
  "matches complete original buffer state with owned symbol=%s",
  /** Original native observations cover all placement values, UInt16 conversion, NUL/surrogate units, empty spans and buffer growth. No aliasing invalidation or allocator failure is introduced. @param owned - Pass an actual owned string's borrowed const view. @returns Nothing. */ (
    owned,
  ) => {
    expect(observations.cases).toHaveLength(3402);
    for (const [query, expected] of observations.cases) {
      const [operation, placement, initial, symbolUnits] = query as [
          string,
          number,
          number[],
          number[],
        ],
        original = Uint16Array.from(initial),
        symbol = Uint16Array.from(symbolUnits),
        owner = owned ? new OUString(symbol, symbol.length) : null,
        buffer = new OUStringBuffer(original);
      try {
        if (operation === "P")
          NfCurrencyEntry.CompletePositiveFormatString(buffer, owner ?? symbol, placement);
        else NfCurrencyEntry.CompleteNegativeFormatString(buffer, owner ?? symbol, placement);
        const data: [rtl_uStringSlot | null] = [null],
          capacity: [[number] | null] = [null];
        buffer.accessInternals(data, capacity);
        expect(
          [
            buffer.getCapacity(),
            buffer.getLength(),
            data[0]?.[0]?.refCount,
            Array.from(buffer.getStr().subarray(0, buffer.getLength() + 1)),
          ],
          JSON.stringify(query),
        ).toEqual(expected);
        expect(Array.from(symbol)).toEqual(symbolUnits);
        expect(Array.from(original)).toEqual(initial);
      } finally {
        buffer.dispose();
        owner?.dispose();
      }
    }
  },
);
