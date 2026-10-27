/** @fileoverview Original BorderHandler table-border state, interop capture and ComplexColor construction; separate cell-border reset behavior remains in TDefTableHandler. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import { convertTwipToMm100_Limited, MakeBorderLine } from "./ConversionHelper";
import { TDefTableHandler } from "./TDefTableHandler";
import { PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";

const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Native border-position declaration order. */
enum BorderPosition {
  Top,
  Left,
  Bottom,
  Right,
  Horizontal,
  Vertical,
}
/** Original table-border receiver, with shared current-border parameters and independently filled output slots. */
export class BorderHandler implements Properties {
  private m_nLineWidth = 15;
  private m_nLineType = 0;
  private m_nLineColor = 0;
  private m_nLineDistance = 0;
  private m_bShadow = false;
  private m_eThemeColorType = ThemeColorType.Unknown;
  private m_nThemeShade = 0;
  private m_nThemeTint = 0;
  private readonly m_aFilledLines = new Array<boolean>(6).fill(false);
  private readonly m_aBorderLines = Array.from(
    { length: 6 },
    /** Native default value construction for each independent slot. @returns Border. */ () =>
      new BorderLine2(),
  );
  private readonly m_aInteropGrabBagName = new OUString();
  private m_aInteropGrabBag: PropertyValue[] = [];
  /** Original OOXML flag, without an inferred default. @param m_bOOXML - Native format flag. @returns Border receiver. */
  constructor(private readonly m_bOOXML: boolean) {}
  /** Original attribute switch captures raw strings independently of the typed border result. @param id - Native ID. @param value - Typed original value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const number = value.getInt();
    let key: string, text: OUString;
    switch (id) {
      case N.LN_CT_Border_sz:
        this.m_nLineWidth = Math.trunc((number * 5) / 2);
        key = "sz";
        text = new OUString(OUString.number(number));
        break;
      case N.LN_CT_Border_val:
        this.m_nLineType = number;
        key = "val";
        text = TDefTableHandler.getBorderTypeString(number);
        break;
      case N.LN_CT_Border_color:
        this.m_nLineColor = number;
        key = "color";
        text = ConvertColorOU(new Color(ColorTransparency, number, "ColorTransparencyTag"));
        break;
      case N.LN_CT_Border_space:
        this.m_nLineDistance = convertTwipToMm100_Limited(number * 20);
        key = "space";
        text = new OUString(OUString.number(number));
        break;
      case N.LN_CT_Border_shadow:
        this.m_bShadow = number !== 0;
        return;
      case N.LN_CT_Border_frame:
        key = "frame";
        text = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Border_themeTint:
        this.m_nThemeTint = number;
        key = "themeTint";
        text = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Border_themeShade:
        this.m_nThemeShade = number;
        key = "themeShade";
        text = new OUString(OUString.number(number, 16));
        break;
      case N.LN_CT_Border_themeColor:
        this.m_eThemeColorType = TDefTableHandler.getThemeColorTypeIndex(number);
        key = "themeColor";
        text = TDefTableHandler.getThemeColorTypeString(number);
        break;
      default:
        return;
    }
    try {
      this.appendGrabBag(key, text);
    } finally {
      text.dispose();
    }
  }
  /** Original supported-edge switch keeps fixed LTR start/end and never resets current width/type/color between sides. @param modifier - Actual nested modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    let position: BorderPosition, edge: string;
    switch (modifier.getId()) {
      case N.LN_CT_TblBorders_top:
        position = BorderPosition.Top;
        edge = "top";
        break;
      case N.LN_CT_TblBorders_start:
        position = BorderPosition.Left;
        edge = "start";
        break;
      case N.LN_CT_TblBorders_left:
        position = BorderPosition.Left;
        edge = "left";
        break;
      case N.LN_CT_TblBorders_bottom:
        position = BorderPosition.Bottom;
        edge = "bottom";
        break;
      case N.LN_CT_TblBorders_end:
        position = BorderPosition.Right;
        edge = "end";
        break;
      case N.LN_CT_TblBorders_right:
        position = BorderPosition.Right;
        edge = "right";
        break;
      case N.LN_CT_TblBorders_insideH:
        position = BorderPosition.Horizontal;
        edge = "insideH";
        break;
      case N.LN_CT_TblBorders_insideV:
        position = BorderPosition.Vertical;
        edge = "insideV";
        break;
      default:
        return;
    }
    const properties = modifier.getProps();
    if (properties) {
      let saved: PropertyValue[] = [];
      if (!this.m_aInteropGrabBagName.isEmpty()) {
        saved = this.m_aInteropGrabBag.map(
          /** Original copied saved vector before clearing current entries. @param property - Original element. @returns Value copy. */ (
            property,
          ) => new PropertyValue(property),
        );
        this.clearGrabBag();
      }
      properties.resolve(this);
      if (!this.m_aInteropGrabBagName.isEmpty()) {
        const name = OUString.createFromAscii(new TextEncoder().encode(edge + "\0"));
        try {
          saved.push(this.getInteropGrabBag(name));
        } finally {
          name.dispose();
        }
        this.clearGrabBag();
        this.m_aInteropGrabBag = saved;
      }
    }
    MakeBorderLine(
      this.m_nLineWidth,
      this.m_nLineType,
      this.m_nLineColor,
      this.m_aBorderLines[position] as BorderLine2,
      this.m_bOOXML,
    );
    this.m_aFilledLines[position] = true;
  }
  /** Original sparse OOXML map; non-OOXML returns an empty map even for filled border slots. @returns Owned result. */
  getProperties(): PropertyMap {
    const result = new PropertyMap(),
      ids = [
        P.PROP_TOP_BORDER,
        P.PROP_LEFT_BORDER,
        P.PROP_BOTTOM_BORDER,
        P.PROP_RIGHT_BORDER,
        P.META_PROP_HORIZONTAL_BORDER,
        P.META_PROP_VERTICAL_BORDER,
      ];
    if (this.m_bOOXML)
      for (let index = 0; index < 6; ++index)
        if (this.m_aFilledLines[index]) {
          const value = new Any(
            this.m_aBorderLines[index] as BorderLine2,
            cppu_detail_getUnoType_BorderLine2,
          );
          try {
            result.Insert(ids[index] as P, value);
          } finally {
            value.dispose();
          }
        }
    return result;
  }
  /** Original standalone border uses current state in a fresh generated result. @returns Border. */
  getBorderLine(): BorderLine2 {
    const result = new BorderLine2();
    MakeBorderLine(this.m_nLineWidth, this.m_nLineType, this.m_nLineColor, result, this.m_bOOXML);
    return result;
  }
  /** Original converted spacing. @returns Mm100. */
  getLineDistance(): number {
    return this.m_nLineDistance;
  }
  /** Original style token. @returns Resource identity. */
  getLineType(): number {
    return this.m_nLineType;
  }
  /** Original shadow flag. @returns Flag. */
  getShadow(): boolean {
    return this.m_bShadow;
  }
  /** Copies original capture name without clearing prior entries. @param name - Native name. @returns Nothing. */
  enableInteropGrabBag(name: OUStringConstReference): void {
    this.m_aInteropGrabBagName.assign(name);
  }
  /** Original non-clearing sequence getter, unlike the cell handler. @param name - Optional native name override. @returns Owned generated value. */
  getInteropGrabBag(name?: OUStringConstReference): PropertyValue {
    const result = new PropertyValue(),
      sequence = new PropertyValues(
        {
          /** Borrows actual vector storage at the native compound byte address. @param offset - Byte offset. @returns Property. */
          get: (offset) => this.m_aInteropGrabBag[offset / 48],
        },
        this.m_aInteropGrabBag.length,
      );
    try {
      result.Name = name && !name.isEmpty() ? name : this.m_aInteropGrabBagName;
      result.Value.insert(sequence.getAddress(), [
        "Sequence",
        cppu_detail_getUnoType_PropertyValue,
      ]);
      return result;
    } finally {
      sequence.dispose();
    }
  }
  /** Original theme-only color value with tint preceding shade, without resolving a theme palette. @returns Independent actual ComplexColor. */
  getComplexColor(): ComplexColor {
    const result = new ComplexColor();
    if (this.m_eThemeColorType === ThemeColorType.Unknown) return result;
    result.setThemeColor(this.m_eThemeColorType);
    if (this.m_nThemeTint > 0)
      result.addTransformation(
        new Transformation(
          TransformationType.Tint,
          (Math.trunc(((255 - this.m_nThemeTint) * 10000) / 255) << 16) >> 16,
        ),
      );
    if (this.m_nThemeShade > 0)
      result.addTransformation(
        new Transformation(
          TransformationType.Shade,
          (Math.trunc(((255 - this.m_nThemeShade) * 10000) / 255) << 16) >> 16,
        ),
      );
    return result;
  }
  /** Original native vector append copies generated fields. @param key - Literal key. @param value - Borrowed Unicode. @returns Nothing. */
  private appendGrabBag(key: string, value: OUStringConstReference): void {
    const result = new PropertyValue(),
      name = OUString.createFromAscii(new TextEncoder().encode(key + "\0"));
    try {
      result.Name = name;
      result.Value.insert([value.pData], "OUString");
      this.m_aInteropGrabBag.push(result);
    } finally {
      name.dispose();
    }
  }
  /** Original vector element destruction. @returns Nothing. */
  private clearGrabBag(): void {
    for (const property of this.m_aInteropGrabBag) {
      property.Name.dispose();
      property.Value.dispose();
    }
    this.m_aInteropGrabBag.length = 0;
  }
  /** Original owned Unicode/vector member destruction. @returns Nothing. */
  dispose(): void {
    this.clearGrabBag();
    this.m_aInteropGrabBagName.dispose();
  }
}
