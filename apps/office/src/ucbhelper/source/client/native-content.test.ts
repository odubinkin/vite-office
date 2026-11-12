/** @fileoverview Actual Content intrusive state and real component-context/service-manager negative construction paths; no positive content, provider or broker substitute is supplied. */
import { afterEach, expect, it } from "vitest";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { ComponentContext } from "../../../cppuhelper/source/component_context";
import { ContextEntry_Init } from "../../../cppuhelper/inc/component_context";
import { ServiceManager } from "../../../cppuhelper/source/servicemanager";
import { XMultiComponentFactory } from "../../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import type { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import type { XContent } from "../../../offapi/com/sun/star/ucb/XContent";
import { UniversalContentBroker } from "../../../offapi/com/sun/star/ucb/UniversalContentBroker";
import { Content } from "../../inc/content";
import { CommandEnvironment } from "./commandenvironment";
import { own, api, u, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Real original context with its genuine manager and an empty registry, representing an unavailable service. @returns Acquired actual context. */
function context(): Reference<XComponentContext> {
  const manager = own(new Reference(new ServiceManager([]))),
    value = own(new Any(manager.getAddress(), XMultiComponentFactory.static_type)),
    entry = own(new ContextEntry_Init(u("/singletons/com.sun.star.lang.theServiceManager"), value));
  return own(
    new Reference<XComponentContext>(
      new ComponentContext([entry], 1, own(new Reference<XComponentContext>())),
    ),
  );
}
/** Observes without retaining an acquired weak lookup past the expression. @param weak - Actual weak reference. @returns Whether target is still alive. */
function alive(weak: WeakReferenceHelper): boolean {
  const value = weak.get();
  try {
    return value.is();
  } finally {
    value.dispose();
  }
}
it("retains valid default empty content and void command results", /** Default Content deliberately needs no context or provider. @returns Nothing. */ () => {
  const content = own(new Content());
  expect(own(content.get()).is()).toBe(false);
  expect(content.getURL().isEmpty()).toBe(true);
  expect(content.getCommandEnvironment().is()).toBe(false);
  expect(own(content.executeCommand(u("getCommandInfo"), own(new Any()))).hasValue()).toBe(false);
});
it("shares environment state through real copy/move handles and destroys the last intrusive owner", /** Uses a genuine CommandEnvironment and actual weak lifetime observations. @returns Nothing. */ () => {
  const input = own(
      new Reference(new CommandEnvironment(own(new Reference()), own(new Reference()))),
    ),
    weak = own(new WeakReferenceHelper(input)),
    first = own(new Content());
  first.setCommandEnvironment(input);
  const copy = own(new Content(first)),
    assigned = own(new Content()).assign(copy),
    moved = own(Content.move(first));
  input.clear();
  expect(alive(weak)).toBe(true);
  expect(copy.getCommandEnvironment().operatorEquals(moved.getCommandEnvironment())).toBe(true);
  copy.assign(copy);
  assigned.moveAssign(own(new Content()));
  expect(assigned.getCommandEnvironment().is()).toBe(false);
  copy.assign(own(new Content()));
  expect(alive(weak)).toBe(true);
  moved.assign(assigned);
  expect(alive(weak)).toBe(false);
});
it("retains a genuine context and environment in the source empty-content constructor", /** The source accepts empty XContent when a real context is supplied. @returns Nothing. */ () => {
  const ctx = context(),
    weak = own(new WeakReferenceHelper(ctx)),
    environment = own(
      new Reference(new CommandEnvironment(own(new Reference()), own(new Reference()))),
    ),
    content = own(new Content(own(new Reference<XContent>()), environment, ctx));
  ctx.clear();
  expect(alive(weak)).toBe(true);
  expect(content.getCommandEnvironment().operatorEquals(environment)).toBe(true);
  expect(own(content.get()).is()).toBe(false);
  expect(own(content.executeCommand(u("getPropertyValues"), own(new Any()))).hasValue()).toBe(
    false,
  );
  content.assign(own(new Content()));
  expect(alive(weak)).toBe(false);
});
it("uses the real service factory's unavailable-broker result and preserves DeploymentException Context", /** No fake factory supplies a success or injected error. @returns Nothing. */ () => {
  const ctx = context(),
    env = own(new Reference<XCommandEnvironment>()),
    result = own(new Content());
  for (const call of [
    /** Original generated explicit service constructor. @returns Broker or actual exception. */ () =>
      UniversalContentBroker.create(ctx),
    /** Original URL constructor. @returns Client or actual exception. */ () =>
      new Content(u("file:///missing.xml"), env, ctx),
    /** Original static create still propagates factory exceptions. @returns Creation status. */ () =>
      Content.create(u("file:///missing.xml"), env, ctx, result),
  ]) {
    try {
      call();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DeploymentException);
      const failure = error as DeploymentException;
      try {
        expect(
          failure.Message.equals(
            u(
              "component context fails to supply service com.sun.star.ucb.UniversalContentBroker of type com.sun.star.ucb.XUniversalContentBroker",
            ),
          ),
        ).toBe(true);
        expect(failure.Context.operatorEquals(ctx)).toBe(true);
      } finally {
        failure.dispose();
      }
    }
  }
  expect(own(result.get()).is()).toBe(false);
  expect(own(api(ctx).getServiceManager()).is()).toBe(true);
});
