/** @fileoverview Original test_uriproc native factory parse/absolute/relative table assertions through the actual registered SDK service. Includes the independent SAL RTL cross-check; specialized parser/translator/package tests remain separate. */
import { afterEach, expect, it } from "vitest";
import data from "./UriReferenceFactory.qa.json";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import type { XUriReferenceFactory } from "../../../udkapi/com/sun/star/uri/XUriReferenceFactory";
import {
  XUriReference,
  getCppuType as getUriType,
} from "../../../udkapi/com/sun/star/uri/XUriReference";
import { RelativeUriExcessParentSegments as E } from "../../../udkapi/com/sun/star/uri/RelativeUriExcessParentSegments";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { Uri } from "../../../sal/inc/rtl/uri";
import { MalformedUriException } from "../../../sal/inc/rtl/malformeduriexception";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Acquires the original SDK service through the real process service manager. @returns Real factory reference. */
function factory() {
  return own(
    UriReferenceFactory.create(
      own(new Reference<XComponentContext>(getProcessComponentContext().get())),
    ),
  );
}
/** Original optional parse in the source fixture. @param value - Actual factory. @param text - Original text or null pointer case. @returns Actual parsed URI or empty reference. */
function parse(value: Reference<XUriReferenceFactory>, text: string | null) {
  return own(text === null ? new Reference<XUriReference>() : api(value).parse(u(text)));
}
/** Original testParse table columns. */
type ParseRow = [
  string,
  string | null,
  string | null,
  boolean,
  string | null,
  string,
  boolean,
  number,
  string,
  string,
  string,
  string,
  string,
  string | null,
  string | null,
];
it.each(data.testParse as ParseRow[])(
  "original testParse %s",
  /** Replays original complete URI field assertions. @param text - Source URI. @param scheme - Expected scheme. @param specific - Expected scheme-specific part. @param hierarchical - Expected hierarchy. @param authority - Expected authority or absent. @param path - Expected path. @param relative - Expected path type. @param count - Expected segment count. @param s0 - Expected segment0. @param s1 - Expected segment1. @param s2 - Expected segment2. @param s3 - Expected segment3. @param s4 - Expected segment4. @param query - Expected query or absent. @param fragment - Expected fragment or absent. @returns Nothing. */ (
    text,
    scheme,
    specific,
    hierarchical,
    authority,
    path,
    relative,
    count,
    s0,
    s1,
    s2,
    s3,
    s4,
    query,
    fragment,
  ) => {
    const value = parse(factory(), text);
    expect(value.is()).toBe(specific !== null);
    if (!value.is()) return;
    const uri = api(value);
    expect(read(uri.getUriReference())).toBe(text);
    expect(uri.isAbsolute()).toBe(scheme !== null);
    expect(read(uri.getScheme())).toBe(scheme ?? "");
    expect(read(uri.getSchemeSpecificPart())).toBe(specific);
    expect(uri.isHierarchical()).toBe(hierarchical);
    expect(uri.hasAuthority()).toBe(authority !== null);
    expect(read(uri.getAuthority())).toBe(authority ?? "");
    expect(read(uri.getPath())).toBe(path);
    expect(uri.hasRelativePath()).toBe(relative);
    expect(uri.getPathSegmentCount()).toBe(count);
    for (const [i, expected] of ["", s0, s1, s2, s3, s4, ""].entries())
      expect(read(uri.getPathSegment(i - 1))).toBe(expected);
    expect(uri.hasQuery()).toBe(query !== null);
    expect(read(uri.getQuery())).toBe(query ?? "");
    expect(uri.hasFragment()).toBe(fragment !== null);
    expect(read(uri.getFragment())).toBe(fragment ?? "");
  },
);
/** Original testMakeAbsolute table columns. */
type AbsoluteRow = [string | null, string | null, boolean, E, string | null];
it.each(data.testMakeAbsolute as AbsoluteRow[])(
  "original testMakeAbsolute %s + %s",
  /** Replays every original expected native factory result. @param base - Original base. @param target - Original target. @param special - Original processing flag. @param excess - Original excess-parent policy. @param expected - Original result or null. @returns Nothing. */ (
    base,
    target,
    special,
    excess,
    expected,
  ) => {
    const value = factory(),
      result = own(
        api(value).makeAbsolute(parse(value, base), parse(value, target), special, excess),
      );
    expect(result.is()).toBe(expected !== null);
    if (result.is()) expect(read(api(result).getUriReference())).toBe(expected);
    // Original test_uriproc checks only the RFC3986-compatible flag combination.
    if (special && excess === E.REMOVE) {
      try {
        const independent = own(Uri.convertRelToAbs(u(base as string), u(target as string)));
        expect(expected).not.toBeNull();
        expect(read(independent)).toBe(expected);
      } catch (error) {
        if (!(error instanceof MalformedUriException)) throw error;
        try {
          expect(expected).toBeNull();
        } finally {
          error.dispose();
        }
      }
    }
  },
);
/** Original testMakeRelative table columns. */
type RelativeRow = [
  string | null,
  string | null,
  boolean,
  boolean,
  boolean,
  string | null,
  string | null,
];
it.each(data.testMakeRelative as RelativeRow[])(
  "original testMakeRelative %s + %s",
  /** Replays original relative result and resolve-back assertions. @param base - Original base. @param target - Original target. @param authority - Original preference. @param absolute - Original preference. @param encode - Original encoding flag. @param expected - Original relative result. @param resolved - Optional original resolve-back result. @returns Nothing. */ (
    base,
    target,
    authority,
    absolute,
    encode,
    expected,
    resolved,
  ) => {
    const value = factory(),
      b = parse(value, base),
      result = own(api(value).makeRelative(b, parse(value, target), authority, absolute, encode));
    expect(result.is()).toBe(expected !== null);
    if (result.is()) {
      expect(read(api(result).getUriReference())).toBe(expected);
      const full = own(api(value).makeAbsolute(b, result, true, E.ERROR));
      expect(full.is()).toBe(true);
      expect(read(api(full).getUriReference())).toBe(resolved ?? target);
    }
  },
);

it("retains actual registered implementation identity and original clone/fragment independence", /** Checks SDK service composition and the exact native component facets needed by MediaDescriptor. @returns Nothing. */ () => {
  const value = factory(),
    info = own(new Reference<XServiceInfo>(value, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(info.get()).toBe(value.get());
  expect(read(api(info).getImplementationName())).toBe("com.sun.star.comp.uri.UriReferenceFactory");
  expect(api(info).supportsService(u("com.sun.star.uri.UriReferenceFactory"))).toBe(true);
  expect(api(info).supportsService(u("other"))).toBe(false);
  const base = parse(value, "file:///base/"),
    original = parse(value, "file:///a%23b#frag"),
    copy = own(api(value).makeAbsolute(base, original, false, E.ERROR));
  expect(copy.get()).not.toBe(original.get());
  const queried = own(
    new Reference<XUriReference>(copy, UNO_QUERY_THROW, XUriReference.static_type),
  );
  expect(queried.get()).toBe(copy.get());
  expect(getUriType(queried).equals(XUriReference.static_type())).toBe(true);
  api(copy).clearFragment();
  expect(read(api(copy).getUriReference())).toBe("file:///a%23b");
  expect(read(api(original).getUriReference())).toBe("file:///a%23b#frag");
  api(copy).setFragment(u(""));
  expect(api(copy).hasFragment()).toBe(true);
  expect(read(api(copy).getUriReference())).toBe("file:///a%23b#");
});

it("reports the source URI interface namespace and real context when the genuine manager has no registered producer", /** Checks the actual SDK missing-service branch without registering a substitute factory. @returns Nothing. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([]));
  let caught = false;
  try {
    own(UriReferenceFactory.create(context));
  } catch (error) {
    if (!(error instanceof DeploymentException)) throw error;
    own(error);
    caught = true;
    expect(error.Context.get()).toBe(context.get());
    expect(read(new OUString(error.Message))).toBe(
      "component context fails to supply service com.sun.star.uri.UriReferenceFactory of type com.sun.star.uri.XUriReferenceFactory",
    );
  }
  expect(caught).toBe(true);
});
