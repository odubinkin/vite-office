/** @fileoverview Native FontList family search semantics over actual input values; no installed-face or glyph availability is inferred. */
import { expect, it } from "vitest";
import {
  findFontListFamily,
  makeFontListAliases,
  makeFontListSearchString,
  makeFontListSearchStringFromName,
} from "./ctrltool";

it("preserves ASCII-only folding,spaces and the first feature/alternate boundary", /** Source never normalizes Unicode or tries later fallback families. @returns Nothing. */ () => {
  expect(makeFontListSearchString("ÄBC ＡZ")).toBe("Äbc Ａz");
  for (const [input, expected] of [
    ["Face", "face"],
    ["Face:liga=0", "face"],
    ["Face;Other", "face"],
    ["Face:liga=0;Other", "face"],
    ["Face;Other:liga=0", "face"],
    [" Face :feature", " face "],
    [":feature", ""],
    [";Other", ""],
  ])
    expect(makeFontListSearchStringFromName(input as string)).toBe(expected);
});

it("uses native sorted lookup boundaries and does not search fallback names", /** Empty,last,first,middle and all insertion gaps are covered with the original read-only operation. @returns Nothing. */ () => {
  const aliases = makeFontListAliases([]);
  expect(findFontListFamily([], aliases, "face")).toBeUndefined();
  const keys = ["alpha", "delta", "gamma", "omega", "zeta"];
  for (const key of keys)
    expect(findFontListFamily(keys, aliases, key.toUpperCase() + ":liga=0;missing")).toBe(key);
  for (const key of ["", "a", "beta", "epsilon", "lambda", "psi", "zz", "missing;alpha"])
    expect(findFontListFamily(keys, aliases, key)).toBeUndefined();
  expect(findFontListFamily(["alpha"], aliases, "alpha")).toBe("alpha");
  expect(findFontListFamily(["alpha"], aliases, "a")).toBeUndefined();
});

it("checks real family names before one alias hop and preserves device last-writer normalization", /** Alias target text is not reparsed or recursively resolved. @returns Nothing. */ () => {
  const entries: [string, string][] = [
    ["ALIAS", "ALPHA"],
    ["alias", "DELTA"],
    ["alpha", "delta"],
    ["chain", "alias"],
    ["dangling", "missing"],
    ["feature", "delta:liga=0"],
    ["literal:tag", "alpha"],
    ["spaced", " delta "],
  ];
  const aliases = makeFontListAliases(entries);
  entries.push(["later", "alpha"]);
  expect([...aliases.entries()]).toEqual([
    ["alias", "delta"],
    ["alpha", "delta"],
    ["chain", "alias"],
    ["dangling", "missing"],
    ["feature", "delta:liga=0"],
    ["literal:tag", "alpha"],
    ["spaced", " delta "],
  ]);
  const keys = ["alpha", "delta"];
  expect(findFontListFamily(keys, aliases, "ALPHA")).toBe("alpha");
  expect(findFontListFamily(keys, aliases, "ALIAS:liga=0;missing")).toBe("delta");
  for (const query of ["chain", "dangling", "feature", "literal:tag", "spaced", "later"])
    expect(findFontListFamily(keys, aliases, query)).toBeUndefined();
});
