/** @fileoverview Original ThemeColorHandler.hxx consumed color/index/tint/shade receiver, retaining source initial values and separate property resolution. */
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { createXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import type { PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { TDefTableHandler } from "./TDefTableHandler";
/** Native color attribute receiver; theme resolution belongs to the importing document's color scheme. */
export class ThemeColorHandler implements Properties {
  mnColor = 0;
  mnIndex = -1;
  mnTint = 0;
  mnShade = 0;
  /** Original attribute switch. @param id - ID. @param value - Value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const n = value.getInt();
    switch (id) {
      case N.LN_CT_Color_val:
        this.mnColor = n;
        break;
      case N.LN_CT_Color_themeColor:
        this.mnIndex = n;
        break;
      case N.LN_CT_Color_themeTint:
        this.mnTint = n;
        break;
      case N.LN_CT_Color_themeShade:
        this.mnShade = n;
        break;
    }
  }
  /** Original modifier receiver is inert. @param value - Unused modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    void value;
  }
}

/** Applies the original Word run color and theme metadata through the native property map. @param modifier - Run color resource. @param context - Current style or run context. @returns Nothing. */
export function resolveThemeColor(modifier: Sprm, context: PropertyMap): void {
  const properties = modifier.getProps();
  if (!properties) return;
  const handler = new ThemeColorHandler();
  resolveReturnedReference(properties, handler);
  const rgb = new Any([handler.mnColor], "sal_Int32");
  try {
    context.Insert(P.PROP_CHAR_COLOR, rgb);
  } finally {
    rgb.dispose();
  }
  if (context.isSet(P.PROP_CHAR_COMPLEX_COLOR)) return;
  const color = new ComplexColor();
  const type = TDefTableHandler.getThemeColorTypeIndex(handler.mnIndex);
  if (type !== ThemeColorType.Unknown) {
    color.setThemeColor(type);
    color.setThemeColorUsage(TDefTableHandler.getThemeColorUsage(handler.mnIndex));
    for (const [value, transform] of [
      [handler.mnTint, TransformationType.Tint],
      [handler.mnShade, TransformationType.Shade],
    ] as const)
      if (value > 0)
        color.addTransformation(
          new Transformation(transform, Math.trunc(((255 - value) * 10_000) / 255)),
        );
  }
  const reference = createXComplexColor(color);
  const complex = new Any([reference.get()], XComplexColor.static_type);
  try {
    context.Insert(P.PROP_CHAR_COMPLEX_COLOR, complex);
  } finally {
    complex.dispose();
    reference.dispose();
  }
}
