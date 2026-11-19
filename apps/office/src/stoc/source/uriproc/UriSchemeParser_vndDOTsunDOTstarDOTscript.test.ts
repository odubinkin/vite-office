/** @fileoverview Original testVndSunStarScript QA and critical lexical boundaries through the registered parser. */
import { afterEach, expect, it } from "vitest";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import { XVndSunStarScriptUrlReference } from "../../../udkapi/com/sun/star/uri/XVndSunStarScriptUrlReference";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { api, own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Original data rows, including normalized mutation assertions and fixed parameterCount3. */
const rows: [string, string | null, boolean, [string, string | null][]][] = [
  ["vnd.sun.star.script:", null, false, []],
  ["vnd.sun.star.script:/", null, false, []],
  ["vnd.sun.star.script:/abc/def?ghi=jkl&mno=pqr", null, false, []],
  ["vnd.sun.star.script:abc%3fdef/ghi", "abc?def/ghi", false, []],
  ["vnd.sun.star.script:name?a", null, false, []],
  [
    "vnd.sun.star.script:name?a=",
    "name",
    true,
    [
      ["a", ""],
      ["A", null],
    ],
  ],
  ["vnd.sun.star.script:name?a=&", null, true, []],
  [
    "vnd.sun.star.script:name?key1=&%26=%3D&key1=hello",
    "name",
    true,
    [
      ["key1", ""],
      ["key2", null],
      ["&", "="],
    ],
  ],
];
for (const [text, name, normalized, parameters] of rows)
  it(`replays original testVndSunStarScript ${text}`, /** Checks that `replays original testVndSunStarScript ${text}`. @returns Nothing. */ () => {
    const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
      uri = own(api(factory).parse(u(text)));
    expect(uri.is()).toBe(name !== null);
    if (!uri.is()) return;
    const script = own(
      new Reference<XVndSunStarScriptUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
    expect(read(api(script).getUriReference())).toBe(text);
    expect(read(api(script).getName())).toBe(name);
    for (const [key, value] of parameters) {
      expect(api(script).hasParameter(u(key))).toBe(value !== null);
      expect(read(api(script).getParameter(u(key)))).toBe(value ?? "");
      if (normalized && api(script).hasParameter(u(key))) {
        const original = own(api(script).getParameter(u(key)));
        api(script).setParameter(u(key), original);
        expect(read(api(uri).getUriReference())).toBe(text);
      }
    }
    if (normalized) {
      const original = own(api(script).getName());
      api(script).setName(original);
      expect(read(api(uri).getUriReference())).toBe(text);
    }
  });
it("replays original script parameter replace/append and illegal argument cases", /** Checks that replays original script parameter replace/append and illegal argument cases. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.script:Hello?location=Library.Module"))),
    script = own(
      new Reference<XVndSunStarScriptUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
  api(script).setParameter(u("location"), u("foo"));
  expect(read(api(uri).getUriReference())).toBe("vnd.sun.star.script:Hello?location=foo");
  api(script).setParameter(u("language"), u("StarBasic"));
  expect(read(api(uri).getUriReference())).toBe(
    "vnd.sun.star.script:Hello?location=foo&language=StarBasic",
  );
  for (const operation of [
    /** Checks that replays original script parameter replace/append and illegal argument cases. @returns Result of the operation under assertion. */ () =>
      api(script).setName(u("")),
    /** Checks that replays original script parameter replace/append and illegal argument cases. @returns Result of the operation under assertion. */ () =>
      api(script).setParameter(u(""), u("non-empty")),
  ]) {
    let caught: unknown;
    try {
      operation();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(IllegalArgumentException);
    const error = caught as IllegalArgumentException;
    try {
      expect(error.ArgumentPosition).toBe(1);
      expect(error.Message.isEmpty()).toBe(true);
      expect(error.Context.get()).toBe(script.get());
    } finally {
      error.dispose();
    }
  }
});
it("retains first duplicate parameter, fragment ownership and encoded Unicode mutations", /** Checks that retains first duplicate parameter, fragment ownership and encoded Unicode mutations. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.script:name?a=first&a=last#fragment"))),
    script = own(
      new Reference<XVndSunStarScriptUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
  api(script).setParameter(u("a"), u("ä&=\u{22513}"));
  api(script).setName(u("new?name"));
  expect(read(api(uri).getUriReference())).toBe(
    "vnd.sun.star.script:new%3Fname?a=%C3%A4%26%3D%F0%A2%94%93&a=last#fragment",
  );
  expect(read(api(script).getParameter(u("a")))).toBe("ä&=\u{22513}");
  expect(api(script).hasParameter(u(""))).toBe(false);
  api(script).setParameter(u("new key"), u("value"));
  expect(api(script).hasParameter(u("new key"))).toBe(true);
  expect(read(api(script).getParameter(u("new key")))).toBe("value");
});
it("preserves original malformed-name delimiter admission rather than adding validation", /** Checks that preserves original malformed-name delimiter admission rather than adding validation. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.script:abc%key=value"))),
    script = own(
      new Reference<XVndSunStarScriptUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
  expect(read(api(script).getName())).toBe("abc");
  expect(read(api(script).getParameter(u("key")))).toBe("value");
});
for (const value of [
  "%",
  "%0",
  "%GG",
  "%80",
  "%C0%80",
  "%E0%80%80",
  "%ED%A0%80",
  "%F0%80%80%80",
  "%F4%90%80%80",
  "%F8%88%80%80%80",
  "%FC%84%80%80%80%80",
  "name?a=%GG",
  "name?a=b=",
  "name?=value",
])
  it(`rejects original malformed script lexical boundary ${value}`, /** Checks that `rejects original malformed script lexical boundary ${value}`. @returns Nothing. */ () => {
    const factory = own(UriReferenceFactory.create(getProcessComponentContext()));
    expect(own(api(factory).parse(u("vnd.sun.star.script:" + value))).is()).toBe(false);
  });
it("preserves the specialized URI facet's complete public value and fragment contract", /** Checks that preserves the specialized URI facet's complete public value and fragment contract. @returns Nothing. */ () => {
  const factory = own(UriReferenceFactory.create(getProcessComponentContext())),
    uri = own(api(factory).parse(u("vnd.sun.star.script:%E2%82%AC?a=b#old"))),
    script = own(
      new Reference<XVndSunStarScriptUrlReference>(
        uri,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
  const value = api(script);
  expect(value.isAbsolute()).toBe(true);
  expect(read(value.getScheme())).toBe("vnd.sun.star.script");
  expect(read(value.getSchemeSpecificPart())).toBe("%E2%82%AC?a=b");
  expect(value.isHierarchical()).toBe(false);
  expect(value.hasAuthority()).toBe(false);
  expect(read(value.getAuthority())).toBe("");
  expect(read(value.getPath())).toBe("%E2%82%AC?a=b");
  expect(value.hasRelativePath()).toBe(true);
  expect(value.getPathSegmentCount()).toBe(1);
  expect(read(value.getPathSegment(0))).toBe("%E2%82%AC?a=b");
  expect(value.hasQuery()).toBe(false);
  expect(read(value.getQuery())).toBe("");
  expect(value.hasFragment()).toBe(true);
  expect(read(value.getFragment())).toBe("old");
  expect(read(value.getName())).toBe("€");
  value.setFragment(u(""));
  expect(read(value.getUriReference())).toBe("vnd.sun.star.script:%E2%82%AC?a=b#");
  value.clearFragment();
  expect(value.hasFragment()).toBe(false);
  expect(read(value.getUriReference())).toBe("vnd.sun.star.script:%E2%82%AC?a=b");
  const withoutParameters = own(api(factory).parse(u("vnd.sun.star.script:name"))),
    plain = own(
      new Reference<XVndSunStarScriptUrlReference>(
        withoutParameters,
        UNO_QUERY_THROW,
        XVndSunStarScriptUrlReference.static_type,
      ),
    );
  api(plain).setParameter(u("a"), u("b"));
  expect(read(api(plain).getUriReference())).toBe("vnd.sun.star.script:name?a=b");
});

it("constructs the actual parser service with its source implementation identity", /** Checks that constructs the actual parser service with its source implementation identity. @returns Nothing. */ () => {
  const context = getProcessComponentContext(),
    manager = own(context.operatorStar().getServiceManager()),
    instance = own(
      api(manager).createInstanceWithContext(
        u("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTscript"),
        context,
      ),
    ),
    info = own(new Reference<XServiceInfo>(instance, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(api(info).getImplementationName())).toBe(
    "com.sun.star.comp.uri.UriSchemeParser_vndDOTsunDOTstarDOTscript",
  );
  expect(
    api(info).supportsService(u("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTscript")),
  ).toBe(true);
  expect(api(info).supportsService(u("com.sun.star.uri.UriReferenceFactory"))).toBe(false);
  expect(own(api(info).getSupportedServiceNames()).getLength()).toBe(1);
});
