/** @fileoverview Exhaustive ASCII equivalence and original byte-comparison/diagnostic values. */
import { expect, it } from "vitest";
import { ErrorCode } from "./lt-error";
import { lt_strcasecmp, lt_strlower } from "./lt-utils";

it("preserves all original error code values", /** Checks actual declarations without building a native error-stack engine. @returns Nothing. */ () => {
  expect([
    ErrorCode.LT_ERR_UNKNOWN,
    ErrorCode.LT_ERR_SUCCESS,
    ErrorCode.LT_ERR_OOM,
    ErrorCode.LT_ERR_FAIL_ON_XML,
    ErrorCode.LT_ERR_EOT,
    ErrorCode.LT_ERR_FAIL_ON_SCANNER,
    ErrorCode.LT_ERR_NO_TAG,
    ErrorCode.LT_ERR_INVALID,
    ErrorCode.LT_ERR_ANY,
  ]).toEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7]);
});

it("matches the complete ASCII lowercase and folded-byte comparison domains", /** Literal ASCII table, including every pair, supplies an independent expected mapping. @returns Nothing. */ () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower = "abcdefghijklmnopqrstuvwxyz";
  for (let a = 1; a < 128; a++) {
    const x = String.fromCharCode(a),
      i = upper.indexOf(x),
      folded = i < 0 ? a : lower.charCodeAt(i);
    expect(lt_strlower(x)).toBe(String.fromCharCode(folded));
    for (let b = 1; b < 128; b++) {
      const y = String.fromCharCode(b),
        j = upper.indexOf(y),
        other = j < 0 ? b : lower.charCodeAt(j);
      expect(lt_strcasecmp(x, y)).toBe(folded - other);
    }
  }
});

it("preserves first-NUL boundaries and the raw prefix terminator difference", /** Native loop lowercases only while both strings have nonzero bytes. @returns Nothing. */ () => {
  expect(lt_strlower("ABC\0DEF")).toBe("abc");
  expect(lt_strlower("")).toBe("");
  expect(lt_strcasecmp("AB", "abC")).toBe(-67);
  expect(lt_strcasecmp("abC", "AB")).toBe(67);
  expect(lt_strcasecmp("ABC\0ignored", "abc")).toBe(0);
  expect(lt_strcasecmp("", "")).toBe(0);
  expect(lt_strcasecmp("A\0B", "a\0C")).toBe(0);
});
