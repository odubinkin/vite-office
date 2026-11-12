/** @fileoverview Source-backed property-array, native COW and immutable info-component tests. The pinned cppuhelper/qa tree has no dedicated OPropertyArrayHelper test; these cases are independent contract tests, not an upstream QA replay. */
import { afterEach, expect, it } from "vitest";
import { OPropertyArrayHelper } from "../inc/propshlp";
import { OPropertySetHelperInfo_Impl } from "./propshlp";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../udkapi/com/sun/star/beans/Property";
import { XPropertySetInfo } from "../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { UnknownPropertyException } from "../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { UnoType } from "../../cppu/inc/unotype";
import { OUString } from "../../sal/inc/rtl/ustring";
import { PropertyBag } from "../../comphelper/inc/propertybag";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { REMOVABLE } from "../../udkapi/com/sun/star/beans/PropertyAttribute";
import { own, u, read, releaseDomScope } from "../../test/native-dom";
const Properties = Sequence.specialize<Property>(propertyType, 32),
  Strings = Sequence.specialize<OUString>("OUString", 8);
afterEach(releaseDomScope);
/** Actual initialized descriptor sequence fixture. @param rows - Declared fixture fields. @returns Native value sequence. */
function descriptors(rows: readonly (readonly [string, number, number?])[]): Sequence<Property> {
  const values = rows.map(
    /** Constructs genuine generated values. @param row - Fields. @returns Actual owner. */ ([
      name,
      handle,
      attributes = 0,
    ]) => own(new Property(u(name), handle, UnoType.get("sal_Int32"), attributes)),
  );
  return own(
    new Properties(
      {
        /** Original array pointer indexing. @param offset - Native byte displacement. @returns Initialized value. */ get(
          offset: number,
        ): unknown {
          return values[offset / 32];
        },
      },
      values.length,
    ),
  );
}
/** Actual initialized name sequence. @param names - Fixture names. @returns Native value. */
function strings(names: readonly string[]): Sequence<OUString> {
  const values = names.map(
    /** Original literal fixture owner. @param name - Name. @returns Actual string. */ (name) =>
      u(name),
  );
  return own(
    new Strings(
      {
        /** Original array pointer indexing. @param offset - Native byte displacement. @returns Actual string pointer address. */ get(
          offset: number,
        ): unknown {
          return (values[offset / 8] as OUString).getDataAddress();
        },
      },
      values.length,
    ),
  );
}
/** Reads borrowed native descriptor fields. @param values - Actual sequence. @param index - Index. @returns Borrowed descriptor. */
function at(values: Sequence<Property>, index: number) {
  return Property.unacquired(
    (values.getConstArray() as SequenceElements).get(index * 32) as {
      get(offset: number): unknown;
    },
  );
}
/** Checks actual UnknownPropertyException field values. @param action - Real call. @param name - Original key. @returns Nothing. */
function unknown(action: () => unknown, name: string): void {
  try {
    action();
    expect.fail("Expected UnknownPropertyException");
  } catch (error) {
    expect(error).toBeInstanceOf(UnknownPropertyException);
    const exception = own(error as UnknownPropertyException);
    expect(read(exception.Message.copy(0))).toBe(name);
    expect(exception.Context.is()).toBe(false);
  }
}
it("handles empty arrays and leaves absent outputs untouched", /** Empty source uses the indexed path. @returns Nothing. */ () => {
  const helper = own(new OPropertyArrayHelper(null, 0)),
    name = u("unchanged"),
    attrs: [number] = [77],
    handles = [91];
  expect(helper.getCount()).toBe(0);
  expect(helper.fillPropertyMembersByHandle(name, attrs, 0)).toBe(false);
  expect(read(name.copy(0))).toBe("unchanged");
  expect(attrs[0]).toBe(77);
  expect(helper.fillHandles(handles, strings(["absent"]))).toBe(0);
  expect(handles).toEqual([-1]);
  expect(helper.fillHandles(handles, strings([]))).toBe(0);
  expect(handles).toEqual([-1]);
  expect(helper.hasPropertyByName(u("absent"))).toBe(false);
  expect(helper.getHandleByName(u("absent"))).toBe(-1);
  unknown(
    /** Original unknown lookup. @returns Nothing. */ () => helper.getPropertyByName(u("absent")),
    "absent",
  );
});
it.each([true, false])(
  "sorts an inverted array even when sorted=%s and detaches the original sequence",
  /** Incorrect sorted hint is diagnostic only. @param sorted - Hint. @returns Nothing. */ (
    sorted,
  ) => {
    const input = descriptors([
        ["尾", 2, 3],
        ["Beta", 1, 4],
        ["Alpha", 0, 5],
      ]),
      original = input.get(),
      helper = own(new OPropertyArrayHelper(input, sorted)),
      result = own(helper.getProperties());
    expect(result.get()).not.toBe(original);
    expect(input.get()).toBe(original);
    expect(
      [0, 1, 2].map(
        /** Reads actual descriptors. @param i - Index. @returns Name. */ (i) =>
          read(at(result, i).Name.copy(0)),
      ),
    ).toEqual(["Alpha", "Beta", "尾"]);
    expect(read(at(input, 0).Name.copy(0))).toBe("尾");
    const name = u(""),
      attrs: [number] = [0];
    expect(helper.fillPropertyMembersByHandle(name, attrs, 1)).toBe(true);
    expect(read(name.copy(0))).toBe("Beta");
    expect(attrs[0]).toBe(4);
    expect(helper.fillPropertyMembersByHandle(null, null, 0)).toBe(true);
    expect(helper.fillPropertyMembersByHandle(null, null, -1)).toBe(false);
    expect(helper.fillPropertyMembersByHandle(null, null, 3)).toBe(false);
  },
);
it("uses original linear handle search for sparse and negative handles", /** Outputs and optional pointers follow source ordering. @returns Nothing. */ () => {
  const input = descriptors([
      ["Alpha", 44, 1],
      ["Beta", -7, 2],
      ["Gamma", 0, 4],
    ]),
    helper = own(
      new OPropertyArrayHelper(input.getConstArray() as SequenceElements, input.getLength()),
    ),
    name = u("sentinel"),
    attrs: [number] = [91];
  expect(helper.fillPropertyMembersByHandle(name, attrs, -7)).toBe(true);
  expect(read(name.copy(0))).toBe("Beta");
  expect(attrs[0]).toBe(2);
  expect(helper.fillPropertyMembersByHandle(null, null, 0)).toBe(true);
  expect(helper.fillPropertyMembersByHandle(name, null, 44)).toBe(true);
  expect(read(name.copy(0))).toBe("Alpha");
  expect(helper.fillPropertyMembersByHandle(null, attrs, 0)).toBe(true);
  expect(attrs[0]).toBe(4);
  expect(helper.fillPropertyMembersByHandle(name, attrs, 999)).toBe(false);
  expect(read(name.copy(0))).toBe("Alpha");
  expect(attrs[0]).toBe(4);
  expect(helper.getHandleByName(u("Beta"))).toBe(-7);
  expect(helper.hasPropertyByName(u("Gamma"))).toBe(true);
});
it("returns genuine descriptor copies and independent COW sequence owners", /** Public mutation must not alter the helper snapshot. @returns Nothing. */ () => {
  const helper = own(
      new OPropertyArrayHelper(
        descriptors([
          ["Alpha", 0, 3],
          ["Beta", 1, 4],
        ]),
      ),
    ),
    output = own(helper.getProperties()),
    copy = own(helper.getPropertyByName(u("Beta")));
  copy.Name = u("changed");
  copy.Handle = 20;
  const cell = (output.getArray() as SequenceElements).get(0) as { get(offset: number): unknown },
    replacement = own(new Property(u("replacement"), 99, UnoType.get("bool"), 0));
  const { Name: before } = at(output, 1);
  expect(read(before.copy(0))).toBe("Beta");
  const any = own(new Any(replacement, propertyType));
  expect(any.extract(cell, propertyType)).toBe(true);
  expect(read(at(output, 0).Name.copy(0))).toBe("replacement");
  const unchanged = own(helper.getPropertyByName(u("Alpha")));
  expect(unchanged.Handle).toBe(0);
  expect(unchanged.Type.equals(UnoType.get("sal_Int32"))).toBe(true);
});
it("performs dense linear batch lookup with missing names and repeated matches", /** Native name and handle storage are used. @returns Nothing. */ () => {
  const helper = own(
      new OPropertyArrayHelper(
        descriptors([
          ["Alpha", 9],
          ["Beta", 8],
          ["Delta", 7],
        ]),
      ),
    ),
    output: number[] = [];
  expect(
    helper.fillHandles(output, strings(["", "Alpha", "Alpha", "Between", "Delta", "Zulu"])),
  ).toBe(3);
  expect(output).toEqual([-1, 9, 9, -1, 7, -1]);
});
it("performs sparse binary lookup for keys below, between, at and above stored names", /** Source logarithm heuristic selects binary search. @returns Nothing. */ () => {
  const rows = Array.from(
      { length: 64 },
      /** Sorted fixture descriptor fields. @param unused - Unused. @param i - Index. @returns Fields. */ (
        _,
        i,
      ) => [`p${String(i * 2).padStart(3, "0")}`, i + 100] as const,
    ),
    helper = own(new OPropertyArrayHelper(descriptors(rows)));
  for (const [key, expected] of [
    ["", -1],
    ["p064", 132],
    ["p065", -1],
    ["p999", -1],
  ] as const) {
    const output: number[] = [];
    expect(helper.fillHandles(output, strings([key]))).toBe(expected === -1 ? 0 : 1);
    expect(output).toEqual([expected]);
  }
});
it("preserves the source binary cursor consuming a repeated name while the linear cursor retains it", /** Suspected issue CALC-548/WRITER482 is kept, without fabricated private state. @returns Nothing. */ () => {
  const rows = Array.from(
      { length: 64 },
      /** Sorted actual fixture. @param unused - Unused. @param i - Index. @returns Fields. */ (
        _,
        i,
      ) => [`p${String(i).padStart(3, "0")}`, i] as const,
    ),
    helper = own(new OPropertyArrayHelper(descriptors(rows))),
    output: number[] = [];
  expect(helper.fillHandles(output, strings(["p016", "p016"]))).toBe(1);
  expect(output).toEqual([16, -1]);
  const repeated = Array.from(
    { length: 64 },
    /** Dense caller names retain the linear cursor. @returns Name. */ () => "p016",
  );
  expect(helper.fillHandles(output, strings(repeated))).toBe(58);
  expect(output).toEqual([...Array<number>(58).fill(16), ...Array<number>(6).fill(-1)]);
});
it("snapshots real dynamic bag descriptions and keeps the info component independent of helper lifetime", /** Same anonymous source component as createPropertySetInfo; no placeholder property-set base is introduced. @returns Nothing. */ () => {
  const bag = own(new PropertyBag()),
    value = own(new Any([3], "sal_Int32")),
    descriptions = own(new Properties());
  bag.addProperty(u("custom"), 7, REMOVABLE, value);
  bag.describeProperties(descriptions);
  const helper = new OPropertyArrayHelper(descriptions),
    info = own(new Reference(new OPropertySetHelperInfo_Impl(helper)));
  helper.dispose();
  bag.removeProperty(u("custom"));
  const api = info.operatorStar(),
    fields = own(api.getPropertyByName(u("custom"))),
    output = own(api.getProperties());
  expect(fields.Handle).toBe(7);
  expect(fields.Attributes).toBe(REMOVABLE);
  expect(fields.Type.equals(UnoType.get("sal_Int32"))).toBe(true);
  expect(output.getLength()).toBe(1);
  expect(api.hasPropertyByName(u("custom"))).toBe(true);
  expect(api.hasPropertyByName(u("missing"))).toBe(false);
  unknown(
    /** Original info lookup failure. @returns Descriptor. */ () =>
      api.getPropertyByName(u("missing")),
    "missing",
  );
  for (const type of [XPropertySetInfo.static_type, XWeak.static_type, "XInterface" as const]) {
    const queried = own(api.queryInterface(UnoType.get(type)));
    const reference = own(new Reference());
    expect(queried.extract(reference.getAddress(), type)).toBe(true);
    expect(reference.get()).toBe(api);
  }
});
