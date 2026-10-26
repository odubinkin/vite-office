/** @fileoverview Original floating table positioning handler uses native defaults, source anchor/spec choices and actual SequenceAsHashMap/UNO property owners; invalid-anchor native indeterminate relations are not repaired. */
import { SvRefBase } from "../../../../tools/inc/ref";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { UnoTypeArgument } from "../../../../cppu/inc/unotype";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
/** Original literal string construction. @param value - Known ASCII source literal. @returns Owned string. */
function literal(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
/** Original comparison with an ASCII source literal. @param value - Borrowed member. @param expected - Source literal. @returns Equality. */
function is(value: OUString, expected: string): boolean {
  return value.equalsAsciiL(new TextEncoder().encode(expected), expected.length);
}
/** Source operator[] <<= uses the existing typed Any owner and a temporary original Unicode literal. @param map - Actual map. @param name - Source property literal. @param value - Original value address. @param type - Original declared template. @returns Nothing. */
function put(
  map: SequenceAsHashMap,
  name: string,
  value: unknown,
  type: Exclude<UnoTypeArgument, "Any">,
): void {
  const key = literal(name);
  try {
    map.operatorIndex(key).insert(value, type);
  } finally {
    key.dispose();
  }
}
/** Original logged-properties release build forwarding uses the existing Properties interface and actual intrusive base; debug logging is not a document service. */
export class TablePositionHandler extends SvRefBase implements Properties {
  private readonly m_aVertAnchor = literal("margin");
  private readonly m_aYSpec = new OUString();
  private readonly m_aHorzAnchor = literal("text");
  private readonly m_aXSpec = new OUString();
  private m_nY = 0;
  private m_nX = 0;
  private m_nLeftFromText = 0;
  private m_nRightFromText = 0;
  private m_nTopFromText = 0;
  private m_nBottomFromText = 0;
  private m_nTableOverlap: Id = 0;
  /** Original resource ID assignment. @param overlap - Native overlap ID. @returns Nothing. */
  setTableOverlap(overlap: Id): void {
    this.m_nTableOverlap = overlap >>> 0;
  }
  /** Original attribute callback, no fallbacks for unknown anchor/spec strings. @param id - Original resource ID. @param value - Original typed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    let target: OUString | undefined;
    switch (id) {
      case N.LN_CT_TblPPr_vertAnchor:
        target = this.m_aVertAnchor;
        break;
      case N.LN_CT_TblPPr_tblpYSpec:
        target = this.m_aYSpec;
        break;
      case N.LN_CT_TblPPr_horzAnchor:
        target = this.m_aHorzAnchor;
        break;
      case N.LN_CT_TblPPr_tblpXSpec:
        target = this.m_aXSpec;
        break;
      case N.LN_CT_TblPPr_tblpY:
        this.m_nY = value.getInt() | 0;
        break;
      case N.LN_CT_TblPPr_tblpX:
        this.m_nX = value.getInt() | 0;
        break;
      case N.LN_CT_TblPPr_leftFromText:
        this.m_nLeftFromText = value.getInt() | 0;
        break;
      case N.LN_CT_TblPPr_rightFromText:
        this.m_nRightFromText = value.getInt() | 0;
        break;
      case N.LN_CT_TblPPr_topFromText:
        this.m_nTopFromText = value.getInt() | 0;
        break;
      case N.LN_CT_TblPPr_bottomFromText:
        this.m_nBottomFromText = value.getInt() | 0;
        break;
    }
    if (target !== undefined) {
      const text = value.getString();
      try {
        target.assign(text);
      } finally {
        text.dispose();
      }
    }
  }
  /** Original modifier callback is empty. @param sprm - Unused original modifier. @returns Nothing. */
  sprm(sprm: Sprm): void {
    void sprm;
  }
  /** Original computed frame properties require later adjustment by native table properties before actual model use. @returns Owned actual property sequence. */
  getTablePosition(): Sequence<PropertyValue> {
    const properties = new SequenceAsHashMap();
    try {
      for (const name of [
        "LeftBorderDistance",
        "RightBorderDistance",
        "TopBorderDistance",
        "BottomBorderDistance",
      ])
        put(properties, name, [0], "sal_Int32");
      put(
        properties,
        "LeftMargin",
        [convertTwipToMm100_Limited(this.m_nLeftFromText)],
        "sal_Int32",
      );
      put(
        properties,
        "RightMargin",
        [convertTwipToMm100_Limited(this.m_nRightFromText)],
        "sal_Int32",
      );
      put(properties, "TopMargin", [convertTwipToMm100_Limited(this.m_nTopFromText)], "sal_Int32");
      put(
        properties,
        "BottomMargin",
        [convertTwipToMm100_Limited(this.m_nBottomFromText)],
        "sal_Int32",
      );
      const emptyBorder = new BorderLine2();
      for (const name of ["TopBorder", "BottomBorder", "LeftBorder", "RightBorder"])
        put(properties, name, emptyBorder, cppu_detail_getUnoType_BorderLine2);
      let horizontal = H.NONE;
      if (is(this.m_aXSpec, "center")) horizontal = H.CENTER;
      else if (is(this.m_aXSpec, "inside")) horizontal = H.INSIDE;
      else if (is(this.m_aXSpec, "left")) horizontal = H.LEFT;
      else if (is(this.m_aXSpec, "outside")) horizontal = H.OUTSIDE;
      else if (is(this.m_aXSpec, "right")) horizontal = H.RIGHT;
      let horizontalRelation!: number;
      if (is(this.m_aHorzAnchor, "margin")) horizontalRelation = R.PAGE_PRINT_AREA;
      else if (is(this.m_aHorzAnchor, "page")) horizontalRelation = R.PAGE_FRAME;
      else if (is(this.m_aHorzAnchor, "text")) horizontalRelation = R.FRAME;
      put(properties, "HoriOrient", [horizontal], "sal_Int16");
      put(properties, "HoriOrientRelation", [horizontalRelation], "sal_Int16");
      put(properties, "HoriOrientPosition", [convertTwipToMm100_Limited(this.m_nX)], "sal_Int32");
      let vertical = V.NONE;
      if (is(this.m_aYSpec, "bottom")) vertical = V.BOTTOM;
      else if (is(this.m_aYSpec, "center")) vertical = V.CENTER;
      else if (is(this.m_aYSpec, "top")) vertical = V.TOP;
      let verticalRelation!: number;
      if (is(this.m_aVertAnchor, "margin")) verticalRelation = R.PAGE_PRINT_AREA;
      else if (is(this.m_aVertAnchor, "page")) verticalRelation = R.PAGE_FRAME;
      else if (is(this.m_aVertAnchor, "text")) verticalRelation = R.FRAME;
      put(properties, "VertOrient", [vertical], "sal_Int16");
      put(properties, "VertOrientRelation", [verticalRelation], "sal_Int16");
      put(properties, "VertOrientPosition", [convertTwipToMm100_Limited(this.m_nY)], "sal_Int32");
      put(properties, "FillTransparence", [100], "sal_Int32");
      if (this.m_nTableOverlap === N.LN_Value_ST_TblOverlap_never)
        put(properties, "AllowOverlap", [false], "bool");
      return properties.getAsConstPropertyValueList();
    } finally {
      properties.dispose();
    }
  }
  /** Original equality ignores all four margins and overlap. @param other - Compared handler. @returns Original six-field equality. */
  operatorEquals(other: TablePositionHandler): boolean {
    return (
      this.m_aVertAnchor.equals(other.m_aVertAnchor) &&
      this.m_aYSpec.equals(other.m_aYSpec) &&
      this.m_aHorzAnchor.equals(other.m_aHorzAnchor) &&
      this.m_aXSpec.equals(other.m_aXSpec) &&
      this.m_nY === other.m_nY &&
      this.m_nX === other.m_nX
    );
  }
  /** Original string member destruction. @returns Nothing. */
  dispose(): void {
    this.m_aXSpec.dispose();
    this.m_aHorzAnchor.dispose();
    this.m_aYSpec.dispose();
    this.m_aVertAnchor.dispose();
  }
  /** Original last intrusive reference dispatches the actual member destructor. @returns Nothing. */
  protected override destroy(): void {
    this.dispose();
    super.destroy();
  }
}
