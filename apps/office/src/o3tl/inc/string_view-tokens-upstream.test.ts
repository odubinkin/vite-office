/** @fileoverview Pinned o3tl/qa/test-string_view.cxx testGetToken source scenarios over actual native OUString/counting views; byte specializations additionally run the same logical cases. Pointer-address-dependent native ABI assertion remains unqualified. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import { getToken } from "./string_view";
/** Literal UTF16 units without host tokenization. @param text - Source literal. @returns Units. */
function units(text: string): Uint16Array {
  return Uint16Array.from(
    text,
    /** Reads ASCII source unit. @param value - Character. @returns Unit. */ (value) =>
      value.charCodeAt(0),
  );
}
it("retains the original OUString empty-input and a;b source cases", /** Original first two source blocks borrow the actual native string storage. @returns Nothing. */ () => {
  const empty = new OUString(),
    literal = new OUString(units("a;b"), 3);
  try {
    const index: [number] = [0];
    do {
      getToken(empty.getStr().subarray(0, empty.getLength()), 0, 59, index);
    } while (index[0] >= 0);
    index[0] = 0;
    const view = literal.getStr().subarray(0, literal.getLength());
    expect([...getToken(view, 0, 59, index)]).toEqual([97]);
    expect([...getToken(view, 0, 59, index)]).toEqual([98]);
    expect(index[0]).toBe(-1);
  } finally {
    literal.dispose();
    empty.dispose();
  }
});
it.each(["utf16", "byte"] as const)(
  "retains original counted-view source cases in %s",
  /** Remaining original source value/index assertions plus the matching byte specialization. @param mode - Original UTF16 or additional byte view. @returns Nothing. */ (
    mode,
  ) => {
    /** Native template specialization binding preserves the selected actual borrowed view. @param text - Literal. @returns Native counted view. */
    function view(text: string): Uint16Array | Uint8Array {
      return mode === "byte" ? Uint8Array.from(units(text)) : units(text);
    }
    /** Selects the actual overload; no alternate splitting algorithm. @param source - Native view. @param delimiter - Original delimiter. @param index - Original in/out signed32. @returns Native borrowed token. */
    function read(
      source: Uint16Array | Uint8Array,
      delimiter: number,
      index: [number],
    ): Uint16Array | Uint8Array {
      return source instanceof Uint8Array
        ? getToken(source, 0, delimiter, index)
        : getToken(source, 0, delimiter, index);
    }
    const changing = view("a;b.c"),
      index: [number] = [0];
    expect([...read(changing, 59, index)]).toEqual([97]);
    expect([...read(changing, 46, index)]).toEqual([98]);
    expect([...read(changing, 46, index)]).toEqual([99]);
    expect(index[0]).toBe(-1);
    const doubled = view("a;;b");
    index[0] = 0;
    expect([...read(doubled, 59, index)]).toEqual([97]);
    expect(read(doubled, 59, index)).toHaveLength(0);
    expect([...read(doubled, 59, index)]).toEqual([98]);
    expect(index[0]).toBe(-1);
    const trailing = view("longer.then.ever.");
    index[0] = 0;
    expect([...read(trailing, 46, index)]).toEqual([...units("longer")]);
    expect([...read(trailing, 46, index)]).toEqual([...units("then")]);
    expect([...read(trailing, 46, index)]).toEqual([...units("ever")]);
    expect(read(trailing, 46, index)).toHaveLength(0);
    expect(index[0]).toBe(-1);
    const ab = view("ab");
    index[0] = 0;
    expect([...read(ab, 45, index)]).toEqual([97, 98]);
    expect(index[0]).toBe(-1);
    expect(read(ab, 45, index)).toHaveLength(0);
    // The original final empty-view case derives a negative index from the native data pointer.
    // There is no physical source pointer binding here; exercise only the defined negative-index contract.
    index[0] = -2147483647;
    expect(read(view(""), 59, index)).toHaveLength(0);
    expect(index[0]).toBe(-1);
  },
);
