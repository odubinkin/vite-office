/** @fileoverview Source-derived generic URI resolution contracts consumed by OOXMLStreamImpl, including excessive parents and lexical escape preservation. */
import { expect, it } from "vitest";
import {
  UriReferenceFactory,
  RelativeUriExcessParentSegments as E,
  processSegments,
} from "./UriReferenceFactory";
const factory = new UriReferenceFactory();

it.each([
  ["file:///word/", "document.xml", "file:///word/document.xml"],
  ["file:///word/document.xml", "../styles.xml", "file:///styles.xml"],
  ["file:///word/", "../../../a", "file:///../../a"],
  ["file:///word/", "/x/../a", "file:///a"],
  ["file:///word/", "./a/.", "file:///word/a/"],
  ["file:///word/", "a/..", "file:///word/"],
  ["file:///word/", "a//b", "file:///word/a//b"],
  ["file:///word/", "%2e%2e/a%20b", "file:///word/%2e%2e/a%20b"],
  ["file:///word/?x#old", "#new", "file:///word/?x#new"],
  ["file:///word/?x", "?", "file:///word/?"],
  ["file:///word/?x", "", "file:///word/?x"],
  ["file:///word/", "//host/a/./b?x#", "file://host/a/b?x#"],
  ["file:///word/", "HTTPS://host/a/../b?x#y", "HTTPS://host/b?x#y"],
  ["file:///word/", "https://host/a", "https://host/a"],
  ["s:base", "a", "s:a"],
  ["s:", "a", "s:a"],
  ["file://host", "a", "file://host/a"],
  ["file:///", ".", "file:///"],
  ["file:///", "..", "file:///.."],
  ["file:///", "../..", "file:///../.."],
  ["s:/a", "s:a/../b", "s:/b"],
])(
  "resolves %s + %s to the native lexical result",
  /** Checks actual factory. @param base - Base URI. @param relative - Relative URI. @param result - Native expected URI. @returns Nothing. */ (
    base,
    relative,
    result,
  ) => {
    expect(
      factory
        .makeAbsolute(factory.parse(base), factory.parse(relative), true, E.RETAIN)
        ?.getUriReference(),
    ).toBe(result);
  },
);

it("preserves absent versus empty URI components and configurable excess-parent policies", /** Exercises generic value access and native makeAbsolute branches. @returns Nothing. */ () => {
  const uri = factory.parse("file:///?#");
  expect(uri.getScheme()).toBe("file");
  expect(uri.hasAuthority()).toBe(true);
  expect(uri.getAuthority()).toBe("");
  expect(uri.hasQuery()).toBe(true);
  expect(uri.getQuery()).toBe("");
  expect(uri.hasFragment()).toBe(true);
  expect(uri.getFragment()).toBe("");
  const empty = factory.parse("");
  expect(empty.getScheme()).toBe("");
  expect(empty.getUriReference()).toBe("");
  expect([empty.hasAuthority(), empty.hasQuery(), empty.hasFragment()]).toEqual([
    false,
    false,
    false,
  ]);
  expect([empty.getAuthority(), empty.getQuery(), empty.getFragment()]).toEqual(["", "", ""]);
  expect(factory.makeAbsolute(null, uri, true, E.RETAIN)).toBeNull();
  expect(factory.makeAbsolute(empty, uri, true, E.RETAIN)).toBeNull();
  expect(factory.makeAbsolute(uri, null, true, E.RETAIN)).toBeNull();
  for (const relative of ["../../a", "/../a", "file:///../a"]) {
    expect(factory.makeAbsolute(uri, factory.parse(relative), true, E.ERROR)).toBeNull();
    expect(
      factory.makeAbsolute(uri, factory.parse(relative), true, E.REMOVE)?.getUriReference(),
    ).toBe("file:///a");
  }
  expect(
    factory.makeAbsolute(uri, factory.parse("file:///a/../b"), false, E.ERROR)?.getUriReference(),
  ).toBe("file:///a/../b");
  expect(
    factory.makeAbsolute(uri, factory.parse("/a/../b"), false, E.ERROR)?.getUriReference(),
  ).toBe("file:///a/../b");
  expect(
    factory
      .makeAbsolute(factory.parse("file:///a/../b/"), factory.parse("c/../d"), false, E.RETAIN)
      ?.getUriReference(),
  ).toBe("file:///a/../b/d");
  expect(
    factory
      .makeAbsolute(factory.parse("s:"), factory.parse("//host"), true, E.RETAIN)
      ?.getUriReference(),
  ).toBe("s://host");
  expect(
    factory
      .makeAbsolute(factory.parse("s:path"), factory.parse(""), true, E.RETAIN)
      ?.getUriReference(),
  ).toBe("s:path");
  expect(
    factory.makeAbsolute(uri, factory.parse("s:a/./b#f"), true, E.RETAIN)?.getUriReference(),
  ).toBe("s:a/b#f");
  expect(processSegments("base", "..", true)).toEqual([
    [{ leadingSlash: false, excessParent: false, segment: "base" }],
    true,
  ]);
});
