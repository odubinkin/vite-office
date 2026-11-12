/** @fileoverview Original nonvirtual Any/Reference overloads on actual initialized native sequence and generated event fields; no prototype patches, alternate Any/value owners or type providers. */
import { afterEach, expect, it } from "vitest";
import { Any } from "./Any";
import { Reference, UNO_QUERY, UNO_QUERY_THROW } from "./Reference";
import { Sequence, type SequenceElements } from "./Sequence";
import { RuntimeException } from "./RuntimeException";
import { UnoType } from "../../../../unotype";
import { PropertyBag } from "../../../../../../comphelper/inc/propertybag";
import {
  PropertyChangeEvent,
  cppu_detail_getUnoType_PropertyChangeEvent as eventType,
} from "../../../../../../udkapi/com/sun/star/beans/PropertyChangeEvent";
import { ActiveDataSink } from "../../../../../../ucbhelper/source/client/activedatasink";
import { XActiveDataSink } from "../../../../../../udkapi/com/sun/star/io/XActiveDataSink";
import { own, u, read, releaseDomScope } from "../../../../../../test/native-dom";
const Values = Sequence.specialize<Any>("Any", 24),
  Events = Sequence.specialize<PropertyChangeEvent>(eventType, 72);
afterEach(releaseDomScope);
/** Borrows actual initialized C Any storage without adding an owner or class. @param values - Actual native sequence. @param index - Index. @returns Source Any address. */
function at(values: Sequence<Any>, index: number): Any {
  return (values.getArray() as SequenceElements).get(index * 24) as Any;
}
/** Reads a source nonvirtual signed32 Any extraction. @param value - Actual initialized address. @returns Original scalar. */
function integer(value: Any): number {
  return Any.prototype.get.call(value, "sal_Int32");
}
it("keeps one live Type view over the actual raw Any pType field through replacement and moves", /** Source ownership stays with the actual sequence. @returns Nothing. */ () => {
  const values = own(new Values(2)),
    first = at(values, 0),
    second = at(values, 1),
    type = Any.prototype.getValueType.call(first);
  expect(first instanceof Any).toBe(false);
  expect(type).toBe(Any.prototype.getValueType.call(first));
  expect(type.equals(UnoType.get("void"))).toBe(true);
  Any.prototype.setValue.call(first, [9], UnoType.get("sal_Int32"));
  expect(type.getTypeLibType()).toBe(first.pType);
  expect(integer(first)).toBe(9);
  const source = own(new Any(u("raw\0文字").getDataAddress(), "OUString"));
  Any.prototype.assign.call(second, source);
  Any.prototype.moveAssign.call(first, second);
  expect(type.equals(UnoType.get("OUString"))).toBe(true);
  expect(integer(second)).toBe(9);
  const output = u("");
  expect(Any.prototype.extract.call(first, output, "OUString")).toBe(true);
  expect(read(output.copy(0))).toBe("raw\0文字");
  Any.prototype.assign.call(first, first);
  expect(Any.prototype.getValueType.call(first)).toBe(type);
  Any.prototype.clear.call(first);
  expect(type.equals(UnoType.get("void"))).toBe(true);
});
it("uses original nonvirtual insertion, predicates, comparisons and get failure on C Any addresses", /** Recursive calls remain static member calls rather than requiring a JS prototype. @returns Nothing. */ () => {
  const values = own(new Values(2)),
    first = at(values, 0),
    second = at(values, 1);
  Any.prototype.insert.call(first, [true], "bool");
  expect(Any.prototype.has.call(first, "bool")).toBe(true);
  expect(Any.prototype.isExtractableTo.call(first, UnoType.get("bool"))).toBe(true);
  Any.prototype.assign.call(second, first);
  expect(Any.prototype.operatorNotEquals.call(first, second)).toBe(false);
  Any.prototype.insert.call(second, [false], "bool");
  expect(Any.prototype.operatorNotEquals.call(first, second)).toBe(true);
  let caught = false;
  try {
    integer(first);
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    own(error as RuntimeException);
    caught = true;
  }
  expect(caught).toBe(true);
  Any.prototype.insert.call(first, [14], "sal_Int16");
  expect(integer(first)).toBe(14);
});
it("selects original Any Reference overloads for actual sequence interface values", /** Actual ActiveDataSink query/root identity is used, without a fake component. @returns Nothing. */ () => {
  const sink = own(new Reference(new ActiveDataSink())),
    values = own(new Values(2)),
    first = at(values, 0),
    second = at(values, 1);
  Any.prototype.insert.call(first, sink.getAddress(), XActiveDataSink.static_type);
  for (const result of [
    own(Reference.fromAny(first, UNO_QUERY, XActiveDataSink.static_type)),
    own(Reference.fromAny(first, UNO_QUERY_THROW, XActiveDataSink.static_type)),
    own(Any.prototype.query.call(first, XActiveDataSink.static_type)),
    own(Any.prototype.queryThrow.call(first, XActiveDataSink.static_type)),
  ])
    expect(result.get()).toBe(sink.get());
  expect(own(Reference.fromAny(second, UNO_QUERY, XActiveDataSink.static_type)).is()).toBe(false);
  expect(own(Any.prototype.query.call(second)).is()).toBe(false);
  for (const action of [
    /** Original throwing constructor overload. @returns Reference. */ () =>
      Reference.fromAny(second, UNO_QUERY_THROW, XActiveDataSink.static_type),
    /** Original Any throwing query. @returns Reference. */ () =>
      Any.prototype.queryThrow.call(second),
  ]) {
    let caught = false;
    try {
      action();
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeException);
      own(error as RuntimeException);
      caught = true;
    }
    expect(caught).toBe(true);
  }
});
it("reads, converts and defaults actual dynamic properties through native event Any members", /** Original bag/container helper calls are nonvirtual at actual initialized addresses. @returns Nothing. */ () => {
  const values = own(new Values(1)),
    initial = at(values, 0);
  Any.prototype.insert.call(initial, [3], "sal_Int32");
  const event = own(new Events(1)),
    raw = (event.getArray() as SequenceElements).get(0) as { get(offset: number): unknown },
    old = raw.get(24) as Any,
    converted = raw.get(48) as Any,
    bag = own(new PropertyBag());
  bag.addProperty(u("number"), 7, 0, initial);
  expect(bag.convertFastPropertyValue(7, own(new Any([4], "sal_Int16")), converted, old)).toBe(
    true,
  );
  expect(integer(old)).toBe(3);
  expect(integer(converted)).toBe(4);
  bag.setFastPropertyValue(7, converted);
  bag.getFastPropertyValue(7, old);
  expect(integer(old)).toBe(4);
  bag.getPropertyDefaultByHandle(7, old);
  expect(integer(old)).toBe(3);
  expect(bag.convertFastPropertyValue(7, converted, converted, old)).toBe(false);
});
