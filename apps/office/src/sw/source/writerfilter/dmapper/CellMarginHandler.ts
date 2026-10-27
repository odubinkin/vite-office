/** @fileoverview Original CellMarginHandler keeps separate raw width/unit state, converted values, per-edge validity and nested native interop sequences. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { convertTwipToMm100_LimitedUnsigned } from "./ConversionHelper";

const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Native table/cell margin receiver; direction remains the original hardcoded LTR. */
export class CellMarginHandler implements Properties {
  private m_nValue = 0;
  private m_nWidth = 0;
  private m_nType = 0;
  private readonly m_aInteropGrabBagName = new OUString();
  private readonly m_aInteropGrabBag: PropertyValue[] = [];
  m_nLeftMargin = 0;
  m_bLeftMarginValid = false;
  m_nRightMargin = 0;
  m_bRightMarginValid = false;
  m_nTopMargin = 0;
  m_bTopMarginValid = false;
  m_nBottomMargin = 0;
  m_bBottomMarginValid = false;
  /** Original type handling warns for non-dxa but still accepts it; width conversion is independent of that unit. @param id - Resource ID. @param value - Typed XML value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const number = value.getInt();
    switch (id) {
      case N.LN_CT_TblWidth_w:
        this.m_nWidth = number;
        this.m_nValue = convertTwipToMm100_LimitedUnsigned(number);
        break;
      case N.LN_CT_TblWidth_type:
        this.m_nType = number;
        break;
    }
  }
  /** Original nested-property resolution precedes edge dispatch, and only the converted temporary resets after every modifier. @param modifier - Actual modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    const properties = modifier.getProps();
    if (properties) {
      properties.resolve(this);
      switch (modifier.getId()) {
        case N.LN_CT_TblCellMar_top:
        case N.LN_CT_TcMar_top:
          this.m_nTopMargin = this.m_nValue;
          this.m_bTopMarginValid = true;
          this.createGrabBag("top");
          break;
        case N.LN_CT_TblCellMar_start:
        case N.LN_CT_TcMar_start:
          this.m_nLeftMargin = this.m_nValue;
          this.m_bLeftMarginValid = true;
          this.createGrabBag("start");
          break;
        case N.LN_CT_TblCellMar_left:
        case N.LN_CT_TcMar_left:
          this.m_nLeftMargin = this.m_nValue;
          this.m_bLeftMarginValid = true;
          this.createGrabBag("left");
          break;
        case N.LN_CT_TblCellMar_bottom:
        case N.LN_CT_TcMar_bottom:
          this.m_nBottomMargin = this.m_nValue;
          this.m_bBottomMarginValid = true;
          this.createGrabBag("bottom");
          break;
        case N.LN_CT_TblCellMar_end:
        case N.LN_CT_TcMar_end:
          this.m_nRightMargin = this.m_nValue;
          this.m_bRightMarginValid = true;
          this.createGrabBag("end");
          break;
        case N.LN_CT_TblCellMar_right:
        case N.LN_CT_TcMar_right:
          this.m_nRightMargin = this.m_nValue;
          this.m_bRightMarginValid = true;
          this.createGrabBag("right");
          break;
      }
    }
    this.m_nValue = 0;
  }
  /** Copies the original Unicode name without clearing accumulated entries. @param name - Borrowed name. @returns Nothing. */
  enableInteropGrabBag(name: OUStringConstReference): void {
    this.m_aInteropGrabBagName.assign(name);
  }
  /** Original named two-property sequence preserves the raw width and unit, including empty string for unknown unit. @param edge - Source edge name. @returns Nothing. */
  private createGrabBag(edge: string): void {
    if (this.m_aInteropGrabBagName.isEmpty()) return;
    let type = "";
    switch (this.m_nType) {
      case N.LN_Value_ST_TblWidth_nil:
        type = "nil";
        break;
      case N.LN_Value_ST_TblWidth_pct:
        type = "pct";
        break;
      case N.LN_Value_ST_TblWidth_dxa:
        type = "dxa";
        break;
      case N.LN_Value_ST_TblWidth_auto:
        type = "auto";
        break;
    }
    const width = new PropertyValue(),
      unit = new PropertyValue(),
      result = new PropertyValue(),
      widthName = OUString.createFromAscii(new Uint8Array([119, 0])),
      typeName = OUString.createFromAscii(new Uint8Array([116, 121, 112, 101, 0])),
      text = OUString.createFromAscii(new TextEncoder().encode(type + "\0")),
      name = OUString.createFromAscii(new TextEncoder().encode(edge + "\0"));
    try {
      width.Name = widthName;
      width.Value.insert([this.m_nWidth], "sal_Int32");
      unit.Name = typeName;
      unit.Value.insert([text.pData], "OUString");
      const values = new PropertyValues(
        {
          /** Borrows the two original initializer-list values at their native compound addresses. @param offset - Byte offset. @returns Property. */
          get: (offset) => (offset === 0 ? width : unit),
        },
        2,
      );
      try {
        result.Name = name;
        result.Value.insert(values.getAddress(), [
          "Sequence",
          cppu_detail_getUnoType_PropertyValue,
        ]);
        this.m_aInteropGrabBag.push(result);
      } finally {
        values.dispose();
      }
    } finally {
      width.Name.dispose();
      width.Value.dispose();
      unit.Name.dispose();
      unit.Value.dispose();
      widthName.dispose();
      typeName.dispose();
      text.dispose();
      name.dispose();
    }
  }
  /** Original copied sequence wrapper around retained edge entries. @returns Owned generated value. */
  getInteropGrabBag(): PropertyValue {
    const result = new PropertyValue(),
      sequence = new PropertyValues(
        {
          /** Borrows one original generated vector element by its native compound byte offset. @param offset - Byte offset. @returns Property. */
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
  /** Native Unicode/vector member destruction. @returns Nothing. */
  dispose(): void {
    this.m_aInteropGrabBagName.dispose();
    for (const property of this.m_aInteropGrabBag) {
      property.Name.dispose();
      property.Value.dispose();
    }
    this.m_aInteropGrabBag.length = 0;
  }
}
