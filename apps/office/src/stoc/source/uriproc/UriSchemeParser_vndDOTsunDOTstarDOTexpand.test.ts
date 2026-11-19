/** @fileoverview Original expand-URL parse assertions and public URI/null-expander contracts through the registered producer. Positive source macro expansion awaits the real bootstrap owner. */
import { afterEach, expect, it } from "vitest";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import { XVndSunStarExpandUrlReference } from "../../../udkapi/com/sun/star/uri/XVndSunStarExpandUrlReference";
import type { XMacroExpander } from "../../../udkapi/com/sun/star/util/XMacroExpander";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { api, own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
afterEach(releaseDomScope);
// Original expected expansion values are retained for the genuine bootstrap QA.
// This checkpoint executes the original admission assertions only.
const rows = [
  ["vnd.sun.star.expand:", ""],
  ["vnd.sun.star.expand:/", "/"],
  ["vnd.sun.star.expand:%80", null],
  ["vnd.sun.star.expand:%5C$%5C%24%5C%5C", "$$\\"],
] as const;
for (const [text, expanded] of rows)
  it(`preserves original testVndSunStarExpand parse admission ${text}`, /** Checks that `preserves original testVndSunStarExpand parse admission ${text}`. @returns Nothing. */ () => {
    const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
      uri = own(api(factory).parse(u(text)));
    expect(uri.is()).toBe(expanded !== null);
    if (!uri.is()) return;
    const specialized = own(
      new Reference<XVndSunStarExpandUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarExpandUrlReference.static_type,
      ),
    );
    expect(read(api(specialized).getUriReference())).toBe(text);
  });
it("retains specialized URI facets, exact native fragment state and liberal hierarchy", /** Checks that retains specialized URI facets, exact native fragment state and liberal hierarchy. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.expand:abc/def#fragment"))),
    specialized = own(
      new Reference<XVndSunStarExpandUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarExpandUrlReference.static_type,
      ),
    ),
    value = api(specialized);
  expect(value.isAbsolute()).toBe(true);
  expect(read(value.getScheme())).toBe("vnd.sun.star.expand");
  expect(read(value.getSchemeSpecificPart())).toBe("abc/def");
  expect(value.isHierarchical()).toBe(false);
  expect(value.hasAuthority()).toBe(false);
  expect(read(value.getAuthority())).toBe("");
  expect(read(value.getPath())).toBe("abc/def");
  expect(value.hasRelativePath()).toBe(true);
  expect(value.getPathSegmentCount()).toBe(2);
  expect(read(value.getPathSegment(1))).toBe("def");
  expect(value.hasQuery()).toBe(false);
  expect(read(value.getQuery())).toBe("");
  expect(value.hasFragment()).toBe(true);
  expect(read(value.getFragment())).toBe("fragment");
  value.setFragment(u(""));
  expect(read(value.getUriReference())).toBe("vnd.sun.star.expand:abc/def#");
  value.clearFragment();
  expect(value.hasFragment()).toBe(false);
  expect(read(value.getUriReference())).toBe("vnd.sun.star.expand:abc/def");
  const slash = own(api(factory).parse(u("vnd.sun.star.expand:/")));
  expect(api(slash).isHierarchical()).toBe(true);
});
it("throws the original required-expander exception with default empty context", /** Checks that throws the original required-expander exception with default empty context. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.expand:abc"))),
    specialized = own(
      new Reference<XVndSunStarExpandUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarExpandUrlReference.static_type,
      ),
    ),
    empty = own(new Reference<XMacroExpander>());
  let caught: unknown;
  try {
    own(api(specialized).expand(empty));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  const error = caught as RuntimeException;
  try {
    expect(read(new OUString(error.Message))).toBe(
      "null expander passed to XVndSunStarExpandUrl.expand",
    );
    expect(error.Context.is()).toBe(false);
  } finally {
    error.dispose();
  }
});
it("supplies the original registered parser service identity", /** Checks that supplies the original registered parser service identity. @returns Nothing. */ () => {
  const context = getProcessComponentContext(),
    manager = own(context.operatorStar().getServiceManager()),
    instance = own(
      api(manager).createInstanceWithContext(
        u("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTexpand"),
        context,
      ),
    ),
    info = own(new Reference<XServiceInfo>(instance, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(api(info).getImplementationName())).toBe(
    "com.sun.star.comp.uri.UriSchemeParser_vndDOTsunDOTstarDOTexpand",
  );
  expect(
    api(info).supportsService(u("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTexpand")),
  ).toBe(true);
  expect(
    api(info).supportsService(u("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTscript")),
  ).toBe(false);
  expect(own(api(info).getSupportedServiceNames()).getLength()).toBe(1);
});
