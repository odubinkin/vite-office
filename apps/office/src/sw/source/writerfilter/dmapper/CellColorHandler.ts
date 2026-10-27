/** @fileoverview Original CellColorHandler shading receiver: independent foreground/fill themes, native brush blending, Form/Paragraph/Character properties and non-clearing interop capture. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  FillStyle,
  cppu_detail_getUnoType_FillStyle,
} from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { ShadingPattern } from "../../../../offapi/com/sun/star/drawing/ShadingPattern";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import { ComplexColor, ColorType } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { createXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { Color, ColorTransparency, COL_AUTO } from "../../../../tools/inc/color";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import { TablePropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { TDefTableHandler } from "./TDefTableHandler";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";

const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Original nested output-format declaration order. */
export enum OutputFormat {
  Form,
  Paragraph,
  Character,
}
/** Original lexical ST_Shd conversion: unknown and nil differ from the numeric character default. @param value - Native resource value. @returns Actual string Any. */
function lcl_ConvertShd(value: number): Any {
  let result = "";
  switch (value) {
    case N.LN_Value_ST_Shd_clear:
      result = "clear";
      break;
    case N.LN_Value_ST_Shd_solid:
      result = "solid";
      break;
    case N.LN_Value_ST_Shd_pct5:
      result = "pct5";
      break;
    case N.LN_Value_ST_Shd_pct10:
      result = "pct10";
      break;
    case N.LN_Value_ST_Shd_pct20:
      result = "pct20";
      break;
    case N.LN_Value_ST_Shd_pct25:
      result = "pct25";
      break;
    case N.LN_Value_ST_Shd_pct30:
      result = "pct30";
      break;
    case N.LN_Value_ST_Shd_pct40:
      result = "pct40";
      break;
    case N.LN_Value_ST_Shd_pct50:
      result = "pct50";
      break;
    case N.LN_Value_ST_Shd_pct60:
      result = "pct60";
      break;
    case N.LN_Value_ST_Shd_pct70:
      result = "pct70";
      break;
    case N.LN_Value_ST_Shd_pct75:
      result = "pct75";
      break;
    case N.LN_Value_ST_Shd_pct80:
      result = "pct80";
      break;
    case N.LN_Value_ST_Shd_pct90:
      result = "pct90";
      break;
    case N.LN_Value_ST_Shd_horzStripe:
      result = "horzStripe";
      break;
    case N.LN_Value_ST_Shd_vertStripe:
      result = "vertStripe";
      break;
    case N.LN_Value_ST_Shd_reverseDiagStripe:
      result = "reverseDiagStripe";
      break;
    case N.LN_Value_ST_Shd_diagStripe:
      result = "diagStripe";
      break;
    case N.LN_Value_ST_Shd_horzCross:
      result = "horzCross";
      break;
    case N.LN_Value_ST_Shd_diagCross:
      result = "diagCross";
      break;
    case N.LN_Value_ST_Shd_thinHorzStripe:
      result = "thinHorzStripe";
      break;
    case N.LN_Value_ST_Shd_thinVertStripe:
      result = "thinVertStripe";
      break;
    case N.LN_Value_ST_Shd_thinReverseDiagStripe:
      result = "thinReverseDiagStripe";
      break;
    case N.LN_Value_ST_Shd_thinDiagStripe:
      result = "thinDiagStripe";
      break;
    case N.LN_Value_ST_Shd_thinHorzCross:
      result = "thinHorzCross";
      break;
    case N.LN_Value_ST_Shd_thinDiagCross:
      result = "thinDiagCross";
      break;
    case N.LN_Value_ST_Shd_pct12:
      result = "pct12";
      break;
    case N.LN_Value_ST_Shd_pct15:
      result = "pct15";
      break;
    case N.LN_Value_ST_Shd_pct35:
      result = "pct35";
      break;
    case N.LN_Value_ST_Shd_pct37:
      result = "pct37";
      break;
    case N.LN_Value_ST_Shd_pct45:
      result = "pct45";
      break;
    case N.LN_Value_ST_Shd_pct55:
      result = "pct55";
      break;
    case N.LN_Value_ST_Shd_pct62:
      result = "pct62";
      break;
    case N.LN_Value_ST_Shd_pct65:
      result = "pct65";
      break;
    case N.LN_Value_ST_Shd_pct85:
      result = "pct85";
      break;
    case N.LN_Value_ST_Shd_pct87:
      result = "pct87";
      break;
    case N.LN_Value_ST_Shd_pct95:
      result = "pct95";
      break;
    case N.LN_Value_ST_Shd_nil:
      result = "nil";
      break;
  }
  const string = OUString.createFromAscii(new TextEncoder().encode(result + "\0"));
  try {
    return new Any([string.pData], "OUString");
  } finally {
    string.dispose();
  }
}
/** Original source-owned state and native resource callbacks; no palette resolution or format normalization is added. */
export class CellColorHandler implements Properties {
  /** Original unscoped nested enum constants for native-style consumers. */
  static readonly Form = OutputFormat.Form;
  static readonly Paragraph = OutputFormat.Paragraph;
  static readonly Character = OutputFormat.Character;
  private m_nShadingPattern: number = ShadingPattern.CLEAR;
  private m_nColor = -1;
  private m_eThemeColorType = ThemeColorType.Unknown;
  private m_nThemeColorTint = 0;
  private m_nThemeColorShade = 0;
  private m_nFillColor = -1;
  private m_eFillThemeColorType = ThemeColorType.Unknown;
  private m_nFillThemeColorTint = 0;
  private m_nFillThemeColorShade = 0;
  private m_bAutoFillColor = true;
  private m_bFillSpecified = false;
  private m_OutputFormat = OutputFormat.Form;
  private readonly m_aInteropGrabBagName = new OUString();
  private readonly m_aInteropGrabBag: PropertyValue[] = [];
  /** Original switch always obtains getInt, including ignored attributes. @param id - Native resource ID. @param value - Typed resource value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    let number = value.getInt();
    let key: string, string: OUString;
    switch (id) {
      case N.LN_CT_Shd_val: {
        const captured = lcl_ConvertShd(number);
        try {
          this.createGrabBag("val", captured);
        } finally {
          captured.dispose();
        }
        this.m_nShadingPattern = number;
        return;
      }
      case N.LN_CT_Shd_fill:
        string = ConvertColorOU(new Color(ColorTransparency, number, "ColorTransparencyTag"));
        try {
          this.createTextGrabBag("fill", string);
        } finally {
          string.dispose();
        }
        if (number === COL_AUTO.toInt32()) number = 0xffffff;
        else this.m_bAutoFillColor = false;
        this.m_nFillColor = number;
        this.m_bFillSpecified = true;
        return;
      case N.LN_CT_Shd_color:
        string = ConvertColorOU(new Color(ColorTransparency, number, "ColorTransparencyTag"));
        try {
          this.createTextGrabBag("color", string);
        } finally {
          string.dispose();
        }
        if (number === COL_AUTO.toInt32()) number = 0;
        this.m_nColor = number;
        return;
      case N.LN_CT_Shd_themeFill:
        this.m_eFillThemeColorType = TDefTableHandler.getThemeColorTypeIndex(number);
        key = "themeFill";
        string = TDefTableHandler.getThemeColorTypeString(number);
        break;
      case N.LN_CT_Shd_themeFillShade:
        this.m_nFillThemeColorShade = number;
        key = "themeFillShade";
        string = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Shd_themeFillTint:
        this.m_nFillThemeColorTint = number;
        key = "themeFillTint";
        string = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Shd_themeColor:
        this.m_eThemeColorType = TDefTableHandler.getThemeColorTypeIndex(number);
        key = "themeColor";
        string = TDefTableHandler.getThemeColorTypeString(number);
        break;
      case N.LN_CT_Shd_themeShade:
        this.m_nThemeColorShade = number;
        key = "themeShade";
        string = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Shd_themeTint:
        this.m_nThemeColorTint = number;
        key = "themeTint";
        string = new OUString(OUString.number(number, 16));
        break;
      default:
        return;
    }
    try {
      this.createTextGrabBag(key, string);
    } finally {
      string.dispose();
    }
  }
  /** Original modifier callback is inert. @param modifier - Ignored modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    void modifier;
  }
  /** Original inline output-format assignment does not clear accumulated state. @param format - Native output selector. @returns Nothing. */
  setOutputFormat(format: OutputFormat): void {
    this.m_OutputFormat = format;
  }
  /** Original Word brush weights and independent character-pattern switch; arithmetic truncates each final channel exactly once. @returns New owned table property map. */
  getProperties(): TablePropertyMap {
    const result = new TablePropertyMap();
    let brush = 0;
    switch (this.m_nShadingPattern) {
      case N.LN_Value_ST_Shd_clear:
        brush = 0;
        break;
      case N.LN_Value_ST_Shd_solid:
        brush = 1000;
        break;
      case N.LN_Value_ST_Shd_pct5:
        brush = 50;
        break;
      case N.LN_Value_ST_Shd_pct10:
        brush = 100;
        break;
      case N.LN_Value_ST_Shd_pct20:
        brush = 200;
        break;
      case N.LN_Value_ST_Shd_pct25:
        brush = 250;
        break;
      case N.LN_Value_ST_Shd_pct30:
        brush = 300;
        break;
      case N.LN_Value_ST_Shd_pct40:
        brush = 400;
        break;
      case N.LN_Value_ST_Shd_pct50:
        brush = 500;
        break;
      case N.LN_Value_ST_Shd_pct60:
        brush = 600;
        break;
      case N.LN_Value_ST_Shd_pct70:
        brush = 700;
        break;
      case N.LN_Value_ST_Shd_pct75:
        brush = 750;
        break;
      case N.LN_Value_ST_Shd_pct80:
        brush = 800;
        break;
      case N.LN_Value_ST_Shd_pct90:
        brush = 900;
        break;
      case N.LN_Value_ST_Shd_horzStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_vertStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_reverseDiagStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_diagStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_horzCross:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_diagCross:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinHorzStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinVertStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinReverseDiagStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinDiagStripe:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinHorzCross:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_thinDiagCross:
        brush = 333;
        break;
      case N.LN_Value_ST_Shd_pct12:
        brush = 125;
        break;
      case N.LN_Value_ST_Shd_pct15:
        brush = 150;
        break;
      case N.LN_Value_ST_Shd_pct35:
        brush = 350;
        break;
      case N.LN_Value_ST_Shd_pct37:
        brush = 375;
        break;
      case N.LN_Value_ST_Shd_pct45:
        brush = 450;
        break;
      case N.LN_Value_ST_Shd_pct55:
        brush = 550;
        break;
      case N.LN_Value_ST_Shd_pct62:
        brush = 625;
        break;
      case N.LN_Value_ST_Shd_pct65:
        brush = 650;
        break;
      case N.LN_Value_ST_Shd_pct85:
        brush = 850;
        break;
      case N.LN_Value_ST_Shd_pct87:
        brush = 875;
        break;
      case N.LN_Value_ST_Shd_pct95:
        brush = 950;
        break;
    }
    let applied: number;
    if (!brush)
      applied =
        this.m_bFillSpecified && this.m_bAutoFillColor ? COL_AUTO.toInt32() : this.m_nFillColor;
    else {
      const foreground = this.m_nColor,
        background = this.m_nFillColor;
      const red =
          ((foreground & 0xff0000) >>> 16) * brush +
          ((background & 0xff0000) >>> 16) * (1000 - brush),
        green =
          ((foreground & 0xff00) >>> 8) * brush + ((background & 0xff00) >>> 8) * (1000 - brush),
        blue = (foreground & 0xff) * brush + (background & 0xff) * (1000 - brush);
      applied =
        (Math.trunc(red / 1000) << 16) + (Math.trunc(green / 1000) << 8) + Math.trunc(blue / 1000);
    }
    if (this.m_OutputFormat === OutputFormat.Character) {
      let pattern: number = ShadingPattern.CLEAR;
      switch (this.m_nShadingPattern) {
        case N.LN_Value_ST_Shd_clear:
          pattern = ShadingPattern.CLEAR;
          break;
        case N.LN_Value_ST_Shd_solid:
          pattern = ShadingPattern.SOLID;
          break;
        case N.LN_Value_ST_Shd_pct5:
          pattern = ShadingPattern.PCT5;
          break;
        case N.LN_Value_ST_Shd_pct10:
          pattern = ShadingPattern.PCT10;
          break;
        case N.LN_Value_ST_Shd_pct20:
          pattern = ShadingPattern.PCT20;
          break;
        case N.LN_Value_ST_Shd_pct25:
          pattern = ShadingPattern.PCT25;
          break;
        case N.LN_Value_ST_Shd_pct30:
          pattern = ShadingPattern.PCT30;
          break;
        case N.LN_Value_ST_Shd_pct40:
          pattern = ShadingPattern.PCT40;
          break;
        case N.LN_Value_ST_Shd_pct50:
          pattern = ShadingPattern.PCT50;
          break;
        case N.LN_Value_ST_Shd_pct60:
          pattern = ShadingPattern.PCT60;
          break;
        case N.LN_Value_ST_Shd_pct70:
          pattern = ShadingPattern.PCT70;
          break;
        case N.LN_Value_ST_Shd_pct75:
          pattern = ShadingPattern.PCT75;
          break;
        case N.LN_Value_ST_Shd_pct80:
          pattern = ShadingPattern.PCT80;
          break;
        case N.LN_Value_ST_Shd_pct90:
          pattern = ShadingPattern.PCT90;
          break;
        case N.LN_Value_ST_Shd_horzStripe:
          pattern = ShadingPattern.HORZ_STRIPE;
          break;
        case N.LN_Value_ST_Shd_vertStripe:
          pattern = ShadingPattern.VERT_STRIPE;
          break;
        case N.LN_Value_ST_Shd_reverseDiagStripe:
          pattern = ShadingPattern.REVERSE_DIAG_STRIPE;
          break;
        case N.LN_Value_ST_Shd_diagStripe:
          pattern = ShadingPattern.DIAG_STRIPE;
          break;
        case N.LN_Value_ST_Shd_horzCross:
          pattern = ShadingPattern.HORZ_CROSS;
          break;
        case N.LN_Value_ST_Shd_diagCross:
          pattern = ShadingPattern.DIAG_CROSS;
          break;
        case N.LN_Value_ST_Shd_thinHorzStripe:
          pattern = ShadingPattern.THIN_HORZ_STRIPE;
          break;
        case N.LN_Value_ST_Shd_thinVertStripe:
          pattern = ShadingPattern.THIN_VERT_STRIPE;
          break;
        case N.LN_Value_ST_Shd_thinReverseDiagStripe:
          pattern = ShadingPattern.THIN_REVERSE_DIAG_STRIPE;
          break;
        case N.LN_Value_ST_Shd_thinDiagStripe:
          pattern = ShadingPattern.THIN_DIAG_STRIPE;
          break;
        case N.LN_Value_ST_Shd_thinHorzCross:
          pattern = ShadingPattern.THIN_HORZ_CROSS;
          break;
        case N.LN_Value_ST_Shd_thinDiagCross:
          pattern = ShadingPattern.THIN_DIAG_CROSS;
          break;
        case N.LN_Value_ST_Shd_pct12:
          pattern = ShadingPattern.PCT12;
          break;
        case N.LN_Value_ST_Shd_pct15:
          pattern = ShadingPattern.PCT15;
          break;
        case N.LN_Value_ST_Shd_pct35:
          pattern = ShadingPattern.PCT35;
          break;
        case N.LN_Value_ST_Shd_pct37:
          pattern = ShadingPattern.PCT37;
          break;
        case N.LN_Value_ST_Shd_pct45:
          pattern = ShadingPattern.PCT45;
          break;
        case N.LN_Value_ST_Shd_pct55:
          pattern = ShadingPattern.PCT55;
          break;
        case N.LN_Value_ST_Shd_pct62:
          pattern = ShadingPattern.PCT62;
          break;
        case N.LN_Value_ST_Shd_pct65:
          pattern = ShadingPattern.PCT65;
          break;
        case N.LN_Value_ST_Shd_pct85:
          pattern = ShadingPattern.PCT85;
          break;
        case N.LN_Value_ST_Shd_pct87:
          pattern = ShadingPattern.PCT87;
          break;
        case N.LN_Value_ST_Shd_pct95:
          pattern = ShadingPattern.PCT95;
          break;
      }
      this.insert(result, P.PROP_CHAR_SHADING_VALUE, new Any([pattern], "sal_Int32"));
    }
    if (
      this.m_OutputFormat === OutputFormat.Paragraph &&
      this.m_nShadingPattern !== N.LN_Value_ST_Shd_nil
    ) {
      if (brush || !this.m_bAutoFillColor)
        this.insert(
          result,
          P.PROP_FILL_STYLE,
          new Any([FillStyle.SOLID], cppu_detail_getUnoType_FillStyle),
        );
      else if (this.m_bFillSpecified)
        this.insert(
          result,
          P.PROP_FILL_STYLE,
          new Any([FillStyle.NONE], cppu_detail_getUnoType_FillStyle),
        );
      this.insert(result, P.PROP_FILL_COLOR, new Any([applied], "sal_Int32"));
      this.insertComplexColor(result, P.PROP_FILL_COMPLEX_COLOR, this.getFillComplexColor());
    } else if (brush || !this.m_bAutoFillColor || this.m_bFillSpecified) {
      if (this.m_OutputFormat === OutputFormat.Form)
        this.insert(result, P.PROP_BACK_COLOR, new Any([applied], "sal_Int32"));
      else {
        this.insert(result, P.PROP_CHAR_BACK_COLOR, new Any([applied], "sal_Int32"));
        const color = this.getFillComplexColor();
        if (color.getType() !== ColorType.Unused)
          this.insertComplexColor(result, P.PROP_CHAR_BACKGROUND_COMPLEX_COLOR, color);
      }
    }
    const original = ConvertColorOU(new Color(ColorTransparency, applied, "ColorTransparencyTag"));
    try {
      this.createTextGrabBag("originalColor", original);
    } finally {
      original.dispose();
    }
    return result;
  }
  /** Binds the original temporary Any destruction after map insertion. @param map - Actual result owner. @param id - Native property. @param value - Owned temporary. @returns Nothing. */
  private insert(map: TablePropertyMap, id: P, value: Any): void {
    try {
      map.Insert(id, value);
    } finally {
      value.dispose();
    }
  }
  /** Original actual component Reference and temporary Any ownership, preserving null-free component creation. @param map - Actual map. @param id - Native property. @param color - Native copied value. @returns Nothing. */
  private insertComplexColor(map: TablePropertyMap, id: P, color: ComplexColor): void {
    const reference = createXComplexColor(color);
    try {
      this.insert(map, id, new Any([reference.get()], XComplexColor.static_type));
    } finally {
      reference.dispose();
    }
  }
  /** Original append copies generated property members only when capture is enabled. @param key - Native literal name. @param value - Borrowed actual Any. @returns Nothing. */
  private createGrabBag(key: string, value: Any): void {
    if (this.m_aInteropGrabBagName.isEmpty()) return;
    const property = new PropertyValue(),
      name = OUString.createFromAscii(new TextEncoder().encode(key + "\0"));
    try {
      property.Name = name;
      property.Value = value;
      this.m_aInteropGrabBag.push(property);
    } finally {
      name.dispose();
    }
  }
  /** Binds original string Any temporary construction/destruction without changing enabled-state evaluation order. @param key - Native literal. @param value - Borrowed string. @returns Nothing. */
  private createTextGrabBag(key: string, value: OUStringConstReference): void {
    const any = new Any([value.pData], "OUString");
    try {
      this.createGrabBag(key, any);
    } finally {
      any.dispose();
    }
  }
  /** Original name assignment retains previously captured entries. @param name - Borrowed native name. @returns Nothing. */
  enableInteropGrabBag(name: OUStringConstReference): void {
    this.m_aInteropGrabBagName.assign(name);
  }
  /** Original non-clearing getter copies the complete vector into a generated PropertyValue sequence. @returns Owned property. */
  getInteropGrabBag(): PropertyValue {
    const result = new PropertyValue(),
      sequence = new PropertyValues(
        {
          /** Original vector element address at the declared compound stride. @param offset - Byte offset. @returns Borrowed element. */
          get: (offset) => this.m_aInteropGrabBag[offset / 48],
        },
        this.m_aInteropGrabBag.length,
      );
    try {
      result.Name = this.m_aInteropGrabBagName;
      result.Value.insert(sequence.getAddress(), [
        "Sequence",
        cppu_detail_getUnoType_PropertyValue,
      ]);
      return result;
    } finally {
      sequence.dispose();
    }
  }
  /** Original disables capture and destroys its accumulated vector, without resetting shading state. @returns Nothing. */
  disableInteropGrabBag(): void {
    this.m_aInteropGrabBagName.clear();
    this.clearGrabBag();
  }
  /** Original name predicate. @returns Enabled state. */
  isInteropGrabBagEnabled(): boolean {
    return !this.m_aInteropGrabBagName.isEmpty();
  }
  /** Original independent foreground theme and tint-before-shade construction; raw RGB and final color are not assigned. @returns Copied native color. */
  getComplexColor(): ComplexColor {
    const result = new ComplexColor();
    if (this.m_eThemeColorType !== ThemeColorType.Unknown) {
      result.setThemeColor(this.m_eThemeColorType);
      if (this.m_nThemeColorTint > 0)
        result.addTransformation(
          new Transformation(
            TransformationType.Tint,
            (Math.trunc(((255 - this.m_nThemeColorTint) * 10000) / 255) << 16) >> 16,
          ),
        );
      if (this.m_nThemeColorShade > 0)
        result.addTransformation(
          new Transformation(
            TransformationType.Shade,
            (Math.trunc(((255 - this.m_nThemeColorShade) * 10000) / 255) << 16) >> 16,
          ),
        );
    }
    return result;
  }
  /** Original independent fill theme construction and signed16 transformation narrowing. @returns Copied native color. */
  getFillComplexColor(): ComplexColor {
    const result = new ComplexColor();
    if (this.m_eFillThemeColorType !== ThemeColorType.Unknown) {
      result.setThemeColor(this.m_eFillThemeColorType);
      if (this.m_nFillThemeColorTint > 0)
        result.addTransformation(
          new Transformation(
            TransformationType.Tint,
            (Math.trunc(((255 - this.m_nFillThemeColorTint) * 10000) / 255) << 16) >> 16,
          ),
        );
      if (this.m_nFillThemeColorShade > 0)
        result.addTransformation(
          new Transformation(
            TransformationType.Shade,
            (Math.trunc(((255 - this.m_nFillThemeColorShade) * 10000) / 255) << 16) >> 16,
          ),
        );
    }
    return result;
  }
  /** Actual native vector member destruction. @returns Nothing. */
  private clearGrabBag(): void {
    for (const property of this.m_aInteropGrabBag) {
      property.Name.dispose();
      property.Value.dispose();
    }
    this.m_aInteropGrabBag.length = 0;
  }
  /** Original owned Unicode/vector member destruction bound to the filter lifetime. @returns Nothing. */
  dispose(): void {
    this.clearGrabBag();
    this.m_aInteropGrabBagName.dispose();
  }
}
