/** @fileoverview Actual PropertyMap/TablePropertyMap intrusive aliases own their cached and stored UNO values until the native last-release destructor. */
import { expect, it } from "vitest";
import { SvRef } from "../../../../tools/inc/ref";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WeakReferenceHelper } from "../../../../cppuhelper/inc/weakref";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import { createXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { PropertyIds as P, getPropertyName } from "./PropertyIds";
import {
  PropertyMap,
  TablePropertyMap,
  ParagraphPropertyMap,
  SectionPropertyMap,
} from "./PropertyMap";

it.each([
  ["PropertyMap", /** Constructs the actual native map. @returns Map. */ () => new PropertyMap()],
  [
    "TablePropertyMap",
    /** Constructs the actual table map. @returns Map. */ () => new TablePropertyMap(),
  ],
  [
    "ParagraphPropertyMap",
    /** Constructs the actual paragraph map. @returns Map. */ () => new ParagraphPropertyMap(),
  ],
  [
    "SectionPropertyMap(first)",
    /** Supplies the original required first-section argument. @returns Map. */ () =>
      new SectionPropertyMap(true),
  ],
  [
    "SectionPropertyMap(next)",
    /** Supplies the original required nonfirst-section argument. @returns Map. */ () =>
      new SectionPropertyMap(false),
  ],
] as const)(
  "retains actual %s Any values until its last intrusive alias",
  /** Checks native subtype destruction and genuine shared component ownership. @param name - Caller case. @param create - Actual map constructor. @returns Nothing. */ (
    name,
    create,
  ) => {
    void name;
    const owner = new SvRef<PropertyMap>(create()),
      alias = new SvRef(owner),
      component = createXComplexColor(new ComplexColor()),
      weak = new WeakReferenceHelper(component),
      value = new Any([component.get()], XComplexColor.static_type);
    owner.operatorArrow().Insert(P.PROP_CHAR_COMPLEX_COLOR, value);
    value.dispose();
    component.dispose();
    expect(owner.operatorArrow().GetRefCount()).toBe(2);
    // This fills the original property cache with actual owned Any copies, which also need destruction.
    expect(
      owner
        .operatorArrow()
        .GetPropertyValues()
        .some(
          /** Selects the cached actual component property, independently of native section defaults. @param property - Cached generated value. @returns Matching native property. */ (
            property,
          ) => property.Name.equals(getPropertyName(P.PROP_CHAR_COMPLEX_COLOR)),
        ),
    ).toBe(true);
    owner.clear();
    expect(alias.operatorArrow().GetRefCount()).toBe(1);
    const live = weak.get();
    expect(live.is()).toBe(true);
    live.dispose();
    alias.clear();
    const dead = weak.get();
    expect(dead.is()).toBe(false);
    dead.dispose();
    weak.dispose();
    alias.dispose();
    owner.dispose();
  },
);
