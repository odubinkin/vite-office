/** @fileoverview Actual registered FastTokenHandler identity and native UNO byte-sequence transport; no stand-in token provider. */
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { FastTokenHandler as FastTokenHandlerService } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import { afterEach, expect, it } from "vitest";
import { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { api, own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it("constructs the actual service and retains its inherited token facet", /** Queries actual registered facets and byte owners. @returns Nothing. */ () => {
  const context = getProcessComponentContext(),
    manager = own(context.operatorStar().getServiceManager()),
    component = own(
      api(manager).createInstanceWithContext(u("com.sun.star.xml.sax.FastTokenHandler"), context),
    );
  const handler = own(
      new Reference<XFastTokenHandler>(component, UNO_QUERY_THROW, XFastTokenHandler.static_type),
    ),
    info = own(new Reference<XServiceInfo>(handler, UNO_QUERY_THROW, XServiceInfo.static_type)),
    back = own(
      new Reference<XFastTokenHandler>(info, UNO_QUERY_THROW, XFastTokenHandler.static_type),
    );
  expect(back.get()).toBe(handler.get());
  expect(read(api(info).getImplementationName())).toBe(
    "com.sun.star.comp.oox.core.FastTokenHandler",
  );
  expect(api(info).supportsService(u("com.sun.star.xml.sax.FastTokenHandler"))).toBe(true);
  expect(api(info).supportsService(u("com.sun.star.xml.sax.Parser"))).toBe(false);
  expect(own(api(info).getSupportedServiceNames()).getLength()).toBe(1);
  const token = 13,
    first = own(api(handler).getUTF8Identifier(token)),
    second = own(api(handler).getUTF8Identifier(token));
  expect(first.get()).toBe(second.get());
  expect(api(handler).getTokenFromUTF8(first)).toBe(token);
});
it("preserves the real SDK missing-service exception on an empty bootstrap context", /** Uses the real empty bootstrap context. @returns Nothing. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([]));
  let caught: unknown;
  try {
    own(FastTokenHandlerService.create(context));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(DeploymentException);
  const error = caught as DeploymentException;
  try {
    expect(error.Context.get()).toBe(context.get());
    expect(read(new OUString(error.Message))).toBe(
      "component context fails to supply service com.sun.star.xml.sax.FastTokenHandler of type com.sun.star.xml.sax.XFastTokenHandler",
    );
  } finally {
    error.dispose();
  }
});
