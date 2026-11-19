/** @fileoverview Retained source-derived generic URI regressions migrated to the actual registered factory after removing the parallel string kernel. */
import { afterEach, expect, it } from "vitest";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import { RelativeUriExcessParentSegments as E } from "../../../udkapi/com/sun/star/uri/RelativeUriExcessParentSegments";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { api, own, u, read, releaseDomScope } from "../../../test/native-dom";
import { processSegments } from "./UriReferenceFactory.segments";
import { view } from "./UriReferenceFactory.temporaries";
afterEach(releaseDomScope);
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
    const factory = own(UriReferenceFactory.create(getProcessComponentContext()));
    const absolute = own(
      api(factory).makeAbsolute(
        own(api(factory).parse(u(base))),
        own(api(factory).parse(u(relative))),
        true,
        E.RETAIN,
      ),
    );
    expect(absolute.is()).toBe(true);
    expect(read(api(absolute).getUriReference())).toBe(result);
  },
);

it("preserves absent versus empty native components and configurable excess-parent policies", /** Checks that preserves absent versus empty native components and configurable excess-parent policies. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext()));
  const parse =
    /** Parses a URI fixture and registers its reference for cleanup. @param text - URI text to parse. @returns Owned parsed URI reference. */ (
      text: string,
    ): Reference<XUriReference> => own(api(factory).parse(u(text)));
  const uri = parse("file:///?#"),
    empty = parse("");
  expect(read(api(uri).getScheme())).toBe("file");
  expect(api(uri).hasAuthority()).toBe(true);
  expect(read(api(uri).getAuthority())).toBe("");
  expect(api(uri).hasQuery()).toBe(true);
  expect(read(api(uri).getQuery())).toBe("");
  expect(api(uri).hasFragment()).toBe(true);
  expect(read(api(uri).getFragment())).toBe("");
  expect(read(api(empty).getScheme())).toBe("");
  expect(read(api(empty).getUriReference())).toBe("");
  expect([api(empty).hasAuthority(), api(empty).hasQuery(), api(empty).hasFragment()]).toEqual([
    false,
    false,
    false,
  ]);
  expect([
    read(api(empty).getAuthority()),
    read(api(empty).getQuery()),
    read(api(empty).getFragment()),
  ]).toEqual(["", "", ""]);
  const absent = own(new Reference<XUriReference>());
  expect(own(api(factory).makeAbsolute(absent, uri, true, E.RETAIN)).is()).toBe(false);
  expect(own(api(factory).makeAbsolute(empty, uri, true, E.RETAIN)).is()).toBe(false);
  expect(own(api(factory).makeAbsolute(uri, absent, true, E.RETAIN)).is()).toBe(false);
  for (const relative of ["../../a", "/../a", "file:///../a"]) {
    expect(own(api(factory).makeAbsolute(uri, parse(relative), true, E.ERROR)).is()).toBe(false);
    const result = own(api(factory).makeAbsolute(uri, parse(relative), true, E.REMOVE));
    expect(read(api(result).getUriReference())).toBe("file:///a");
  }
  for (const [base, target, special, expected] of [
    ["file:///?#", "file:///a/../b", false, "file:///a/../b"],
    ["file:///?#", "/a/../b", false, "file:///a/../b"],
    ["file:///a/../b/", "c/../d", false, "file:///a/../b/d"],
    ["s:", "//host", true, "s://host"],
    ["s:path", "", true, "s:path"],
    ["file:///?#", "s:a/./b#f", true, "s:a/b#f"],
  ] as const) {
    const result = own(api(factory).makeAbsolute(parse(base), parse(target), special, E.RETAIN));
    expect(read(api(result).getUriReference())).toBe(expected);
  }
  expect(processSegments(view(u("base")), view(u("..")), true)).toEqual([
    [{ leadingSlash: false, excessParent: false, segment: Uint16Array.of(98, 97, 115, 101) }],
    true,
  ]);
});
