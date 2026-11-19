/** @fileoverview Original URI value assertions from stoc test_uriproc::testParse rows and native RTL ownership/segment contracts. Factory parsing and UNO service dispatch remain separate and unqualified here. */
import { afterEach, expect, it } from "vitest";
import { UriReference } from "./UriReference";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Original testParse data fields required by the actual value owner. */
type Row = readonly [
  uri: string,
  scheme: string | null,
  authority: string | null,
  path: string,
  query: string | null,
  fragment: string | null,
  hierarchical: boolean,
  relative: boolean,
  count: number,
  specificPart: string,
];
const rows: readonly Row[] = [
  ["", null, null, "", null, null, true, true, 0, ""],
  ["scheme:", "scheme", null, "", null, null, false, true, 0, ""],
  ["scheme:/", "scheme", null, "/", null, null, true, false, 1, "/"],
  ["scheme://", "scheme", "", "", null, null, true, false, 0, "//"],
  ["scheme:///", "scheme", "", "/", null, null, true, false, 1, "///"],
  ["scheme:////", "scheme", "", "//", null, null, true, false, 2, "////"],
  ["scheme:////", "scheme", "", "//", null, null, true, false, 2, "////"],
  ["scheme:#", "scheme", null, "", null, "", false, true, 0, ""],
  ["scheme:?", "scheme", null, "", "", null, false, true, 0, "?"],
  ["/", null, null, "/", null, null, true, false, 1, "/"],
  ["//", null, "", "", null, null, true, false, 0, "//"],
  ["///", null, "", "/", null, null, true, false, 1, "///"],
  ["////", null, "", "//", null, null, true, false, 2, "////"],
];
it.each(rows)(
  "retains original value fields of %s",
  /** Replays applicable testParse value assertions without substituting a parser. @param uri - Original expected serialization. @param scheme - Explicit source scheme. @param authority - Explicit authority or absent. @param path - Source path. @param query - Explicit query or absent. @param fragment - Explicit fragment or absent. @param hierarchical - Original hierarchy expectation. @param relative - Original relative-path expectation. @param count - Original segment count. @param specificPart - Original explicit scheme-specific expectation. @returns Nothing. */ (
    uri,
    scheme,
    authority,
    path,
    query,
    fragment,
    hierarchical,
    relative,
    count,
    specificPart,
  ) => {
    const value = own(
      new UriReference(
        u(scheme ?? ""),
        authority !== null,
        u(authority ?? ""),
        u(path),
        query !== null,
        u(query ?? ""),
      ),
    );
    if (fragment !== null) value.setFragment(u(fragment));
    expect(read(value.getUriReference())).toBe(uri);
    expect(value.isAbsolute()).toBe(scheme !== null);
    expect(read(new OUString(value.getScheme()))).toBe(scheme ?? "");
    expect(read(value.getSchemeSpecificPart())).toBe(specificPart);
    expect(value.isHierarchical()).toBe(hierarchical);
    expect(value.hasAuthority()).toBe(authority !== null);
    expect(read(new OUString(value.getAuthority()))).toBe(authority ?? "");
    expect(read(value.getPath())).toBe(path);
    expect(value.hasRelativePath()).toBe(relative);
    expect(value.getPathSegmentCount()).toBe(count);
    for (let index = -1; index <= 5; ++index) expect(read(value.getPathSegment(index))).toBe("");
    expect(value.hasQuery()).toBe(query !== null);
    expect(read(new OUString(value.getQuery()))).toBe(query ?? "");
    expect(value.hasFragment()).toBe(fragment !== null);
    expect(read(value.getFragment())).toBe(fragment ?? "");
  },
);

it("retains lexical escapes, UTF16 units and empty segments without URL normalization", /** Checks actual source path enumeration at interior and terminal delimiters. @returns Nothing. */ () => {
  const value = own(
    new UriReference(u("file"), true, u("host"), u("/a//%2f/字/"), true, u("q=%2F")),
  );
  expect(value.getPathSegmentCount()).toBe(5);
  for (const [index, expected] of ["a", "", "%2f", "字", ""].entries())
    expect(read(value.getPathSegment(index))).toBe(expected);
  expect(read(value.getPathSegment(5))).toBe("");
  expect(read(value.getUriReference())).toBe("file://host/a//%2f/字/?q=%2F");
  const relative = own(new UriReference(u(""), false, u(""), u("a/b"), false, u("")));
  expect(relative.getPathSegmentCount()).toBe(2);
  expect(read(relative.getPathSegment(0))).toBe("a");
  expect(read(relative.getPathSegment(1))).toBe("b");
  expect(read(relative.getPathSegment(2))).toBe("");
});

it("preserves explicit empty fragments and independent returned strings with real member ownership", /** Exercises source by-value moves, borrowed const members and fragment mutation. @returns Nothing. */ () => {
  const scheme = u("s"),
    path = u("/p"),
    authority = u("host"),
    query = u("q"),
    value = own(new UriReference(scheme, true, authority, path, true, query));
  expect(scheme.isEmpty()).toBe(true);
  expect(path.isEmpty()).toBe(true);
  expect(read(new OUString(authority))).toBe("host");
  value.setFragment(u(""));
  expect(value.hasFragment()).toBe(true);
  expect(read(value.getUriReference())).toBe("s://host/p?q#");
  value.setFragment(u("frag"));
  const retained = own(value.getFragment()),
    retainedPath = own(value.getPath());
  value.clearFragment();
  value.m_path.assign(u("/new"));
  expect(value.hasFragment()).toBe(false);
  expect(read(value.getFragment())).toBe("");
  expect(read(new OUString(retained))).toBe("frag");
  expect(read(new OUString(retainedPath))).toBe("/p");
  expect(read(value.getUriReference())).toBe("s://host/new?q");
});
