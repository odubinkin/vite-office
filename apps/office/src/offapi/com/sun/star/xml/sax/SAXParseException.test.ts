/** @fileoverview Actual generated SAXParseException member ownership, normal metadata, typed Any inheritance and copy/move operations. */
import { afterEach, expect, it } from "vitest";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseType,
  getCppuType,
} from "./SAXParseException";
import {
  SAXException,
  cppu_detail_getUnoType as saxType,
} from "../../../../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { Any } from "../../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import { own, releaseDomScope, u } from "../../../../../../test/native-dom";

afterEach(releaseDomScope);

it("retains the original field defaults, declaration order and native signed widths", /** Uses actual generated value constructors and shared type registration. @returns Nothing. */ () => {
  const empty = own(new SAXParseException());
  expect([
    empty.Message.isEmpty(),
    empty.Context.is(),
    empty.WrappedException.hasValue(),
    empty.LineNumber,
    empty.ColumnNumber,
  ]).toEqual([true, false, false, 0, 0]);
  expect(empty.PublicId.isEmpty()).toBe(true);
  expect(empty.SystemId.isEmpty()).toBe(true);
  const context = own(new Reference()),
    wrapped = own(new Any(true)),
    value = own(
      new SAXParseException(
        u("message"),
        context,
        wrapped,
        u("public"),
        u("system"),
        4294967297,
        4294967295,
      ),
    );
  expect(value.LineNumber).toBe(1);
  expect(value.ColumnNumber).toBe(-1);
  expect(parseType()).toBe(getCppuType());
  const copied = own(new SAXParseException(value)),
    assigned = own(new SAXParseException());
  expect(assigned.assign(value)).toBe(assigned);
  value.PublicId = u("changed");
  value.LineNumber = 7;
  expect(copied.PublicId.equals(u("public"))).toBe(true);
  expect(assigned.LineNumber).toBe(1);
});

it("copies inherited fields and derived identifiers through actual typed Any storage", /** The four declared logical offsets use the shared metadata's base layout. @returns Nothing. */ () => {
  const value = own(
      new SAXParseException(
        u("message"),
        own(new Reference()),
        own(new Any(true)),
        u("public"),
        u("system"),
        12,
        34,
      ),
    ),
    envelope = own(new Any(value, parseType)),
    output = own(new SAXParseException()),
    base = own(new SAXException());
  value.Message = u("changed");
  value.PublicId = u("changed");
  value.LineNumber = 99;
  expect(envelope.extract(output, parseType)).toBe(true);
  expect(output.Message.equals(u("message"))).toBe(true);
  expect(output.PublicId.equals(u("public"))).toBe(true);
  expect(output.SystemId.equals(u("system"))).toBe(true);
  expect([output.LineNumber, output.ColumnNumber]).toEqual([12, 34]);
  const boolean: [boolean] = [false];
  expect(output.WrappedException.extract(boolean, "bool")).toBe(true);
  expect(boolean[0]).toBe(true);
  expect(envelope.extract(base, saxType)).toBe(true);
  expect(base.Message.equals(u("message"))).toBe(true);
});

it("moves real member owners and retains the source scalar values", /** Move construction and assignment follow generated memberwise operations. @returns Nothing. */ () => {
  const source = own(
      new SAXParseException(
        u("m"),
        own(new Reference()),
        own(new Any(true)),
        u("p"),
        u("s"),
        12,
        34,
      ),
    ),
    moved = own(SAXParseException.move(source));
  expect(moved.PublicId.equals(u("p"))).toBe(true);
  expect(moved.Message.equals(u("m"))).toBe(true);
  expect(source.PublicId.isEmpty()).toBe(true);
  expect([source.LineNumber, source.ColumnNumber]).toEqual([12, 34]);
  const output = own(new SAXParseException());
  expect(output.moveAssign(moved)).toBe(output);
  expect(output.SystemId.equals(u("s"))).toBe(true);
  expect(output.LineNumber).toBe(12);
  expect(moved.SystemId.isEmpty()).toBe(true);
});
