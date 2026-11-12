/** @fileoverview Actual native UCB identifiers retain first-colon, ASCII-only scheme conversion, independent returned strings and source URL spelling. */
import { afterEach, expect, it } from "vitest";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XContentIdentifier } from "../../../offapi/com/sun/star/ucb/XContentIdentifier";
import { own, u, read, api, releaseDomScope } from "../../../test/native-dom";
import { ContentIdentifier } from "../../inc/contentidentifier";
afterEach(releaseDomScope);
it.each([
  ["file:///tmp/a.xml", "file:///tmp/a.xml", "file"],
  ["FiLe:///tmp/a.xml", "FiLe:///tmp/a.xml", "file"],
  ["vnd.Office:part:other", "vnd.Office:part:other", "vnd.office"],
  ["ÄBC:東京/é.xml", "ÄBC:東京/é.xml", "Äbc"],
  [":part", ":part", ""],
  ["relative.xml", "", ""],
  ["", "", ""],
])(
  "preserves original identifier and scheme for %s",
  /** Uses the actual complete source component. @param url - Input identifier. @param identifier - Original stored spelling. @param scheme - Original provider scheme. @returns Nothing. */ (
    url,
    identifier,
    scheme,
  ) => {
    const source = u(url),
      owner = own(new Reference(new ContentIdentifier(source))),
      facet = own(
        new Reference<XContentIdentifier>(owner, UNO_QUERY_THROW, XContentIdentifier.static_type),
      );
    source.assign(u("changed:source"));
    expect(read(api(facet).getContentIdentifier())).toBe(identifier);
    expect(read(api(facet).getContentProviderScheme())).toBe(scheme);
  },
);
it("keeps independently owned getter values after the actual component is destroyed", /** Returned strings survive unique implementation destruction. @returns Nothing. */ () => {
  const owner = own(new Reference(new ContentIdentifier(u("FILE:///a.xml")))),
    weak = own(new WeakReferenceHelper(owner)),
    id = own(api(owner).getContentIdentifier()),
    scheme = own(api(owner).getContentProviderScheme());
  id.assign(u("changed"));
  expect(read(api(owner).getContentIdentifier())).toBe("FILE:///a.xml");
  owner.clear();
  expect(own(weak.get()).is()).toBe(false);
  expect(scheme.equals(u("file"))).toBe(true);
  expect(id.equals(u("changed"))).toBe(true);
});
