/** @fileoverview Exact source ICU legacy name/base/canonical modes and append/failure timing. */
import { expect, it } from "vitest";
import * as N from "./uloc.normalize";
import { Locale } from "./locid";
/** Calls one original normalizer over an existing sink. @param text - Counted view. @param mode - Source mode0/1/2. @param incoming - Status. @returns Output/status. */
function normalize(text: string, mode: 0 | 1 | 2 = 0, incoming = 0) {
  let output = "seed";
  const status: [number] = [incoming];
  const normalizers = [N.ulocimp_getName, N.ulocimp_canonicalize, N.ulocimp_getBaseName] as const;
  normalizers[mode](
    text,
    {
      /** Appends counted bytes. @param value - Span. @returns Nothing. */ Append(value: string) {
        output += value;
      },
    },
    status,
  );
  return { output, status: status[0] };
}
it("normalizes actual subtag and keyword fragments", /** Original alias and sorting rules are reused. @returns Nothing. */ () => {
  expect(normalize("ENG_latn_USA_posix@z=VaL; Calendar=gregorian")).toEqual({
    output: "seeden_Latn_US_POSIX@calendar=gregorian;z=VaL",
    status: 0,
  });
  expect(normalize("en-u-ca-gregory").output).toBe("seeden@calendar=gregorian");
  expect(normalize("en_US@calendar=gregorian", 2).output).toBe("seeden_US");
});
it("preserves source name versus legacy-canonical POSIX behavior", /** Legacy canonicalization remains separate from modern alias-resource processing. @returns Nothing. */ () => {
  expect(normalize("mr.utf8@FOO").output).toBe("seedmr.utf8@FOO");
  expect(normalize("mr.utf8@FOO", 1).output).toBe("seedmr__FOO");
  expect(normalize("art__LOJBAN").output).toBe("seedart__LOJBAN");
  expect(normalize("art__LOJBAN", 1).output).toBe("seedjbo");
});
it("retains original classifier final-subtag omission and i-default branch", /** No new language-tag heuristic is applied. @returns Nothing. */ () => {
  expect(normalize("en-u").output).toBe("seeden__U");
  expect(normalize("en-u-ca").output).toBe("seeden@calendar=yes");
  Locale.setDefault(new Locale("fr_FR"), [0]);
  expect(normalize("i-default@x=y").output).toBe("seedfr_FR@x=y");
});
it("keeps deferred tag output, partial keyword output and source bounds", /** Failure timing is part of the original ByteSink contract. @returns Nothing. */ () => {
  expect(normalize("en." + "a".repeat(65))).toEqual({ output: "seed", status: 1 });
  expect(normalize("en@a=1;b")).toEqual({ output: "seeden@", status: 3 });
  expect(normalize("en-US", 0, 1)).toEqual({ output: "seed", status: 1 });
  expect(normalize("en-US", 0, -128).status).toBe(-128);
});
