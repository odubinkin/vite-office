/** @fileoverview Original UCB creation enum/exception metadata and complete generated value ownership; native exception values remain distinct from host Error. */
import { afterEach, expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import * as Creation from "../../../offapi/com/sun/star/ucb/ContentCreationException";
import * as Illegal from "../../../offapi/com/sun/star/ucb/IllegalIdentifierException";
import {
  ContentCreationError as E,
  cppu_detail_getUnoType_ContentCreationError as errorType,
} from "../../../offapi/com/sun/star/ucb/ContentCreationError";
import { own, u, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it("retains all original creation ordinals and normal enum Any transport", /** Native enum type remains distinct from integer transport. @returns Nothing. */ () => {
  expect([
    E.UNKNOWN,
    E.NO_CONTENT_BROKER,
    E.NO_IDENTIFIER_FACTORY,
    E.IDENTIFIER_CREATION_FAILED,
    E.NO_CONTENT_PROVIDER,
    E.CONTENT_CREATION_FAILED,
  ]).toEqual([0, 1, 2, 3, 4, 5]);
  expect(errorType()).toBe(errorType());
  const value = own(new Any([E.CONTENT_CREATION_FAILED], errorType)),
    output: [number] = [0];
  expect(value.extract(output, errorType)).toBe(true);
  expect(output[0]).toBe(E.CONTENT_CREATION_FAILED);
  expect(value.extract([0], "sal_Int32")).toBe(false);
});
it("preserves creation exception defaults, member ownership, copy/move and typed compound transport", /** Original exception Context is empty in Content creation failures. @returns Nothing. */ () => {
  const empty = own(new Creation.ContentCreationException());
  expect(empty.eError).toBe(E.UNKNOWN);
  expect(empty.Message.isEmpty()).toBe(true);
  expect(empty.Context.is()).toBe(false);
  const source = own(
      new Creation.ContentCreationException(
        u("failure Ω"),
        own(new Reference()),
        E.NO_CONTENT_PROVIDER,
      ),
    ),
    copied = own(new Creation.ContentCreationException(source)),
    envelope = own(new Any(source, Creation.cppu_detail_getUnoType)),
    output = own(new Creation.ContentCreationException());
  expect(envelope.extract(output, Creation.cppu_detail_getUnoType)).toBe(true);
  source.Message = u("changed");
  source.eError = E.UNKNOWN;
  expect(output.Message.equals(u("failure Ω"))).toBe(true);
  expect(output.eError).toBe(E.NO_CONTENT_PROVIDER);
  output.assign(copied).assign(output);
  const moved = own(Creation.ContentCreationException.move(copied));
  expect(copied.Message.isEmpty()).toBe(true);
  expect(moved.eError).toBe(E.NO_CONTENT_PROVIDER);
  empty.moveAssign(moved);
  expect(empty.Message.equals(u("failure Ω"))).toBe(true);
  expect(moved.Message.isEmpty()).toBe(true);
  expect(Creation.getCppuType()).toBe(Creation.cppu_detail_getUnoType());
  expect(empty).toBeInstanceOf(Exception);
  expect(empty).not.toBeInstanceOf(Error);
});
it("preserves the complete empty-derived IllegalIdentifierException type and inherited members", /** No generic Error fallback or generated-value provider is substituted. @returns Nothing. */ () => {
  const empty = own(new Illegal.IllegalIdentifierException()),
    source = own(new Illegal.IllegalIdentifierException(u("bad URI"), own(new Reference()))),
    copy = own(new Illegal.IllegalIdentifierException(source)),
    envelope = own(new Any(source, Illegal.cppu_detail_getUnoType));
  expect(envelope.extract(empty, Illegal.cppu_detail_getUnoType)).toBe(true);
  expect(empty.Message.equals(u("bad URI"))).toBe(true);
  const moved = own(Illegal.IllegalIdentifierException.move(copy));
  expect(moved.Message.equals(u("bad URI"))).toBe(true);
  expect(copy.Message.isEmpty()).toBe(true);
  expect(Illegal.getCppuType()).toBe(Illegal.cppu_detail_getUnoType());
  expect(moved).toBeInstanceOf(Exception);
  expect(moved).not.toBeInstanceOf(Error);
});
