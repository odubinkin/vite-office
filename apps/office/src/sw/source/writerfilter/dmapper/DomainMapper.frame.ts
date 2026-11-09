/** @fileoverview Consumed native framePr attributes from DomainMapper.cxx. */
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import type { ParagraphProperties } from "./PropertyMap";

const horizontal = new Map<number, number>([
  [N.LN_Value_doc_ST_XAlign_left, H.LEFT],
  [N.LN_Value_doc_ST_XAlign_right, H.RIGHT],
  [N.LN_Value_doc_ST_XAlign_center, H.CENTER],
  [N.LN_Value_doc_ST_XAlign_inside, H.INSIDE],
  [N.LN_Value_doc_ST_XAlign_outside, H.OUTSIDE],
]);
const vertical = new Map<number, number>([
  [N.LN_Value_doc_ST_YAlign_top, V.TOP],
  [N.LN_Value_doc_ST_YAlign_inside, V.TOP],
  [N.LN_Value_doc_ST_YAlign_bottom, V.BOTTOM],
  [N.LN_Value_doc_ST_YAlign_outside, V.BOTTOM],
  [N.LN_Value_doc_ST_YAlign_center, V.CENTER],
]);
const anchors = new Map<number, number>([
  [N.LN_Value_doc_ST_HAnchor_text, R.FRAME],
  [N.LN_Value_doc_ST_HAnchor_margin, R.PAGE_PRINT_AREA],
  [N.LN_Value_doc_ST_HAnchor_page, R.PAGE_FRAME],
  [N.LN_Value_doc_ST_VAnchor_text, R.FRAME],
  [N.LN_Value_doc_ST_VAnchor_margin, R.PAGE_PRINT_AREA],
  [N.LN_Value_doc_ST_VAnchor_page, R.PAGE_FRAME],
]);

/** Stores the original frame attribute on the actual paragraph property owner. @param props - Native paragraph properties. @param id - Original resource identity. @param value - Original value. @returns Whether consumed. */
export function ApplyFrameAttribute(
  props: ParagraphProperties,
  id: number,
  value: number,
): boolean {
  switch (id) {
    case N.LN_CT_FramePr_hAnchor:
      props.SethAnchor(anchors.get(value) ?? value);
      break;
    case N.LN_CT_FramePr_vAnchor:
      props.SetvAnchor(anchors.get(value) ?? value);
      break;
    case N.LN_CT_FramePr_x:
      props.Setx(convertTwipToMm100_Limited(value));
      props.SetxAlign(H.NONE);
      break;
    case N.LN_CT_FramePr_y:
      props.Sety(convertTwipToMm100_Limited(value));
      props.SetyAlign(V.NONE);
      break;
    case N.LN_CT_FramePr_xAlign:
      props.SetxAlign(horizontal.get(value) ?? H.NONE);
      break;
    case N.LN_CT_FramePr_yAlign:
      if (value === N.LN_Value_doc_ST_YAlign_inline) props.SetFrameMode(false);
      props.SetyAlign(vertical.get(value) ?? V.NONE);
      break;
    case N.LN_CT_FramePr_hRule:
      props.SethRule(
        value === N.LN_Value_doc_ST_HeightRule_exact
          ? SizeType.FIX
          : value === N.LN_Value_doc_ST_HeightRule_atLeast
            ? SizeType.MIN
            : SizeType.VARIABLE,
      );
      break;
    case N.LN_CT_FramePr_w:
      props.Setw(convertTwipToMm100_Limited(value));
      break;
    case N.LN_CT_FramePr_h:
      props.Seth(convertTwipToMm100_Limited(value));
      break;
    case N.LN_CT_FramePr_hSpace:
      props.SethSpace(convertTwipToMm100_Limited(value));
      break;
    case N.LN_CT_FramePr_vSpace:
      props.SetvSpace(convertTwipToMm100_Limited(value));
      break;
    case N.LN_CT_FramePr_wrap:
      props.SetWrap(
        value === N.LN_Value_doc_ST_Wrap_auto || value === N.LN_Value_doc_ST_Wrap_through
          ? W.DYNAMIC
          : value === N.LN_Value_doc_ST_Wrap_around
            ? W.PARALLEL
            : value === N.LN_Value_doc_ST_Wrap_none
              ? W.THROUGH
              : W.NONE,
      );
      break;
    default:
      return false;
  }
  return true;
}
