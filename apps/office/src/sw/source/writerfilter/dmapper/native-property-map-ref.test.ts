/** @fileoverview Actual PropertyMap/TablePropertyMap intrusive aliases own their cached and stored UNO values until the native last-release destructor. */
import { expect, it } from "vitest";
import { SvRef } from "../../../../tools/inc/ref";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WeakReferenceHelper } from "../../../../cppuhelper/inc/weakref";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import { createXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { getFromXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLPropertyType,
  OOXMLValue,
} from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { resolveThemeColor } from "./ThemeColorHandler";
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

it("retains a prior native text-fill color while importing the Word RGB fallback", /** Verifies native priority and the nullable color resource. @returns Nothing. */ () => {
  const owner = new SvRef<PropertyMap>(new PropertyMap());
  const context = owner.operatorArrow();
  const missing = new OOXMLProperty(
    N.LN_EG_RPrBase_color,
    new OOXMLValue(),
    OOXMLPropertyType.SPRM,
  );
  const props = new OOXMLPropertySet();
  props.add(N.LN_CT_Color_val, OOXMLValue.createInteger(0x123456), OOXMLPropertyType.ATTRIBUTE);
  props.add(
    N.LN_CT_Color_themeColor,
    OOXMLValue.createInteger(N.LN_Value_St_ThemeColor_accent3),
    OOXMLPropertyType.ATTRIBUTE,
  );
  props.add(N.LN_CT_Color_themeTint, OOXMLValue.createInteger(255), OOXMLPropertyType.SPRM);
  const color = new OOXMLProperty(
    N.LN_EG_RPrBase_color,
    OOXMLValue.createPropertySet(props),
    OOXMLPropertyType.SPRM,
  );
  const original = createXComplexColor(ComplexColor.Theme(ThemeColorType.Accent2));
  const previous = new Any([original.get()], XComplexColor.static_type);
  const actual = new Reference<XComplexColor>();
  try {
    resolveThemeColor(missing, context);
    expect(context.isSet(P.PROP_CHAR_COLOR)).toBe(false);
    context.Insert(P.PROP_CHAR_COMPLEX_COLOR, previous);
    resolveThemeColor(color, context);
    const rgb = context.getProperty(P.PROP_CHAR_COLOR)?.[1];
    const complex = context.getProperty(P.PROP_CHAR_COMPLEX_COLOR)?.[1];
    try {
      expect(rgb?.get("sal_Int32")).toBe(0x123456);
      expect(complex?.extract(actual.getAddress(), XComplexColor.static_type)).toBe(true);
      expect(getFromXComplexColor(actual).getThemeColorType()).toBe(ThemeColorType.Accent2);
    } finally {
      rgb?.dispose();
      complex?.dispose();
    }
  } finally {
    actual.dispose();
    previous.dispose();
    original.dispose();
    owner.clear();
  }
});
