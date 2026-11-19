/** @fileoverview Unchanged original package URL QA with the genuine registered factory, URI service and SAL codec. */
import { afterEach, expect, it } from "vitest";
import { VndSunStarPkgUrlReferenceFactory } from "../../../udkapi/com/sun/star/uri/VndSunStarPkgUrlReferenceFactory";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { XVndSunStarPkgUrlReferenceFactory } from "../../../udkapi/com/sun/star/uri/XVndSunStarPkgUrlReferenceFactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { api, own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
const rows = [
  ["a/b/c", null],
  ["file:///#foo", null],
  ["file:///a%25b%2fc/d~e&f@g?h", "vnd.sun.star.pkg://file:%2F%2F%2Fa%2525b%252fc%2Fd~e&f@g%3Fh"],
] as const;
for (const [authority, expected] of rows)
  it(`replays original testPkgUrlFactory ${authority}`, /** Checks that `replays original testPkgUrlFactory ${authority}`. @returns Nothing. */ () => {
    const context = getProcessComponentContext(),
      factory = own(VndSunStarPkgUrlReferenceFactory.create(context)),
      parser = own(UriReferenceFactory.create(context));
    const uri = own(api(parser).parse(u(authority))),
      result = own(api(factory).createVndSunStarPkgUrlReference(uri));
    expect(result.is()).toBe(expected !== null);
    if (expected !== null) expect(read(api(result).getUriReference())).toBe(expected);
  });
it("retains actual UNO identity, service declarations, native fields and exact null-authority exception", /** Checks that retains actual UNO identity, service declarations, native fields and exact null-authority exception. @returns Nothing. */ () => {
  const factory = own(VndSunStarPkgUrlReferenceFactory.create(getProcessComponentContext())),
    info = own(new Reference<XServiceInfo>(factory, UNO_QUERY_THROW, XServiceInfo.static_type)),
    same = own(new Reference(info, UNO_QUERY_THROW, XVndSunStarPkgUrlReferenceFactory.static_type));
  expect(same.get()).toBe(factory.get());
  expect(read(api(info).getImplementationName())).toBe(
    "com.sun.star.comp.uri.VndSunStarPkgUrlReferenceFactory",
  );
  expect(api(info).supportsService(u("com.sun.star.uri.VndSunStarPkgUrlReferenceFactory"))).toBe(
    true,
  );
  expect(api(info).supportsService(u("com.sun.star.uri.UriReferenceFactory"))).toBe(false);
  const names = own(api(info).getSupportedServiceNames());
  expect(names.getLength()).toBe(1);
  const empty = own(new Reference<XUriReference>());
  let caught: unknown;
  try {
    own(api(factory).createVndSunStarPkgUrlReference(empty));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  const error = caught as RuntimeException;
  try {
    expect(
      String.fromCharCode(...error.Message.getStr().subarray(0, error.Message.getLength())),
    ).toBe(
      "null authority passed to XVndSunStarPkgUrlReferenceFactory.createVndSunStarPkgUrlReference",
    );
    expect(error.Context.is()).toBe(false);
  } finally {
    error.dispose();
  }
});
it("uses the real SDK missing-service diagnostic on an empty bootstrap context", /** Checks that uses the real SDK missing-service diagnostic on an empty bootstrap context. @returns Nothing. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([]));
  let caught: unknown;
  try {
    own(VndSunStarPkgUrlReferenceFactory.create(context));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(DeploymentException);
  const error = caught as DeploymentException;
  try {
    expect(error.Message.getLength()).toBeGreaterThan(0);
    expect(error.Context.get()).toBe(context.get());
  } finally {
    error.dispose();
  }
});
