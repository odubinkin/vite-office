/** @fileoverview Original MeasureHandler width/unit, string row height, limited twip conversion and interop sequence contracts. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { convertTwipToMm100_Limited } from "./ConversionHelper";

const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Native table width/indent/row-height receiver; percentage conversion deliberately remains unimplemented as upstream. */
export class MeasureHandler implements Properties {
  private m_nMeasureValue = 0;
  private m_nUnit = -1;
  private m_nRowHeightSizeType = SizeType.MIN;
  private readonly m_aInteropGrabBagName = new OUString();
  private readonly m_aInteropGrabBag: PropertyValue[] = [];
  /** Original attribute dispatch, retaining native value alternatives and sticky exact-height state. @param id - Resource ID. @param value - Actual typed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const number = value.getInt();
    switch (id) {
      case N.LN_CT_TblWidth_type: {
        this.m_nUnit = number;
        if (!this.m_aInteropGrabBagName.isEmpty()) {
          const property = new PropertyValue(),
            name = OUString.createFromAscii(new Uint8Array([116, 121, 112, 101, 0]));
          property.Name = name;
          name.dispose();
          let type: string | undefined;
          switch (number) {
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
          if (type !== undefined) {
            const text = OUString.createFromAscii(new TextEncoder().encode(type + "\0"));
            try {
              property.Value.insert([text.pData], "OUString");
            } finally {
              text.dispose();
            }
          }
          this.m_aInteropGrabBag.push(property);
        }
        break;
      }
      case N.LN_CT_Height_hRule: {
        const text = value.getString();
        try {
          if (text.equalsAsciiL(new Uint8Array([101, 120, 97, 99, 116]), 5))
            this.m_nRowHeightSizeType = SizeType.FIX;
        } finally {
          text.dispose();
        }
        break;
      }
      case N.LN_CT_TblWidth_w:
        this.m_nMeasureValue = number;
        if (!this.m_aInteropGrabBagName.isEmpty()) {
          const property = new PropertyValue(),
            name = OUString.createFromAscii(new Uint8Array([119, 0]));
          property.Name = name;
          name.dispose();
          property.Value.insert([number], "sal_Int32");
          this.m_aInteropGrabBag.push(property);
        }
        break;
      case N.LN_CT_Height_val: {
        this.m_nUnit = N.LN_Value_ST_TblWidth_dxa;
        const text = value.getString();
        try {
          this.m_nMeasureValue = text.toInt32();
        } finally {
          text.dispose();
        }
        break;
      }
    }
  }
  /** Original modifier callback is empty. @param value - Unused modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    void value;
  }
  /** Original only absolute dxa or legacy numeric unit3 produces a converted measure. @returns Limited mm100. */
  getMeasureValue(): number {
    let result = 0;
    if (this.m_nMeasureValue !== 0 && this.m_nUnit >= 0)
      if (this.m_nUnit === 3 || this.m_nUnit === N.LN_Value_ST_TblWidth_dxa)
        result = convertTwipToMm100_Limited(this.m_nMeasureValue);
    return result;
  }
  /** Original unconverted width. @returns Signed32 value. */
  getValue(): number {
    return this.m_nMeasureValue;
  }
  /** Original unit identity. @returns Unit. */
  getUnit(): number {
    return this.m_nUnit;
  }
  /** Original row-height interpretation. @returns Native SizeType. */
  GetRowHeightSizeType(): SizeType {
    return this.m_nRowHeightSizeType;
  }
  /** Copies the native Unicode name; an empty name disables subsequent capture without clearing existing entries. @param name - Borrowed name. @returns Nothing. */
  enableInteropGrabBag(name: OUStringConstReference): void {
    this.m_aInteropGrabBagName.assign(name);
  }
  /** Original container-to-sequence copies generated values into actual UNO storage. @returns Owned generated property. */
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
