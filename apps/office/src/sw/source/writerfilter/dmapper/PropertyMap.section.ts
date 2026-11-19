/** @fileoverview Native SectionPropertyMap page-style finalization, parity copying and body attachment. */
import { PageBreakType, SectionPropertyMap, type PropertyMap } from "./PropertyMap";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { resolveReturnedReference, type Properties, type Sprm } from "../inc/dmapper/resourcemodel";
import {
  BorderOffsetFrom,
  BorderPosition,
  PageBordersHandler,
  type BorderApply,
  type PgBorder,
} from "./PageBordersHandler";
import { BorderDistanceFromWord } from "../../../../editeng/source/items/frmitems";
import { cppu_detail_getUnoType_BorderLine2 as borderLineType } from "../../../../offapi/com/sun/star/table/BorderLine2";
import {
  ShadowFormat,
  cppu_detail_getUnoType_ShadowFormat as shadowFormatType,
} from "../../../../offapi/com/sun/star/table/ShadowFormat";
import { ShadowLocation } from "../../../../offapi/com/sun/star/table/ShadowLocation";
import type { SwXPageStyle } from "../../core/unocore/unostyle";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text, unicode, stringAny } from "../../core/unocore/unocrsrhelper";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import {
  PageStyleLayout,
  cppu_detail_getUnoType_PageStyleLayout as layoutType,
} from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import { CompleteCopyHeaderFooter } from "./DomainMapper_Impl.headerfooter";

/** Resolves the native compound margin property with defaults for this section. @param mapper - Active mapper. @param modifier - Page margin resource. @param receiver - Attribute receiver. @param section - Current mapper context. @returns Nothing. */
export function ResolvePageMargins(
  mapper: DomainMapper_Impl,
  modifier: Sprm,
  receiver: Properties,
  section: PropertyMap | null,
): void {
  mapper.InitPageMargins();
  resolveReturnedReference(modifier.getProps(), receiver);
  if (!(section instanceof SectionPropertyMap)) return;
  const margins = mapper.GetPageMargins();
  section.SetTopMargin(margins.top);
  section.SetRightMargin(margins.right);
  section.SetBottomMargin(margins.bottom);
  section.SetLeftMargin(margins.left);
  section.SetHeaderFooterMargins(margins.header, margins.footer);
  insert(section, P.PROP_GUTTER_MARGIN, new Any([margins.gutter], "sal_Int32"));
}

/** Resolves Word page border resources on the current section. @param section - Current mapper context. @param modifier - Page border resource. @returns Nothing. */
export function ResolvePageBorders(section: PropertyMap | null, modifier: Sprm): void {
  if (!(section instanceof SectionPropertyMap)) return;
  const handler = new PageBordersHandler();
  resolveReturnedReference(modifier.getProps(), handler);
  handler.SetBorders(section);
}

const sides = ["Left", "Right", "Top", "Bottom"] as const;

/** Applies the native section box geometry. LibreOffice accepts the display selection and uses the section page style for every side. @param style - Target page style. @param borders - Native section sides. @param _apply - Original display selection. @param offset - Original offset origin. @param gutterAtTop - Document gutter direction. @returns Nothing. */
export function ApplyBorderToPageStyles(
  style: SwXPageStyle | null,
  borders: ReadonlyMap<BorderPosition, PgBorder>,
  _apply: BorderApply,
  offset: BorderOffsetFrom,
  gutterAtTop: boolean,
): void {
  if (!style) return;
  const fromEdge = offset === BorderOffsetFrom.Edge;
  for (const [position, side] of sides.entries()) {
    const border = borders.get(position);
    if (!border) continue;
    setPageStyleValue(style, `${side}Border`, new Any(border.line, borderLineType));
    if (border.distance < 0) continue;
    const name = unicode(`${side}Margin`);
    const distanceName = unicode(`${side}BorderDistance`);
    const oldMargin = style.getPropertyValue(name);
    try {
      let [margin, distance] = BorderDistanceFromWord(
        fromEdge,
        oldMargin.get("sal_Int32"),
        border.distance,
        border.line.LineWidth,
      );
      if (fromEdge && position === (gutterAtTop ? BorderPosition.Top : BorderPosition.Left)) {
        const gutterName = unicode("GutterMargin");
        try {
          const gutter = style.getPropertyValue(gutterName);
          try {
            margin -= gutter.get("sal_Int32");
            distance += gutter.get("sal_Int32");
          } finally {
            gutter.dispose();
          }
        } finally {
          gutterName.dispose();
        }
      }
      const marginValue = new Any([margin], "sal_Int32");
      const distanceValue = new Any([distance], "sal_Int32");
      try {
        style.setPropertyValues([name, distanceName], [marginValue, distanceValue]);
      } finally {
        marginValue.dispose();
        distanceValue.dispose();
      }
    } finally {
      oldMargin.dispose();
      distanceName.dispose();
      name.dispose();
    }
  }

  const right = borders.get(BorderPosition.Right);
  if (right?.shadow) {
    const shadow = new ShadowFormat(ShadowLocation.BOTTOM_RIGHT, right.line.LineWidth, false, 0);
    setPageStyleValue(style, "ShadowFormat", new Any(shadow, shadowFormatType));
  }
}

/** Sets one page property and releases the caller's temporary UNO values. @param style - Target style. @param name - Original property name. @param value - Temporary value. @returns Nothing. */
function setPageStyleValue(style: SwXPageStyle, name: string, value: Any): void {
  const property = unicode(name);
  try {
    style.setPropertyValue(property, value);
  } finally {
    property.dispose();
    value.dispose();
  }
}

/** Original properties handled independently from direct page-style property copying. */
const staticDenylist = new Set([
  "FooterBackGraphicURL",
  "BackGraphicURL",
  "HeaderBackGraphicURL",
  "HeaderIsOn",
  "FooterIsOn",
  "HeaderIsShared",
  "FooterIsShared",
  "FirstIsShared",
  "HeaderText",
  "HeaderTextLeft",
  "HeaderTextFirst",
  "FooterText",
  "FooterTextLeft",
  "FooterTextFirst",
]);
/** Original page-style deep copy through actual property descriptors; original mirror-margin settings select the native even-page margin swap. @param this - Actual section map. @param mapper - Actual mapper. @param type - Original parity enum. @returns Nothing. */
export function CreateEvenOddPageStyleCopy(
  this: SectionPropertyMap,
  mapper: DomainMapper_Impl,
  type: PageBreakType,
): void {
  const name = mapper.GetUnusedPageStyleName(),
    style = mapper.GetTextDocument().createPageStyle(),
    source = this["m_aPageStyle"];
  try {
    mapper.GetPageStyles().insertStyleByName(name, style);
    if (!source) throw new Error("assert(m_aPageStyle)");
    const info = source.getPropertySetInfo();
    const sequence = (info.get() as XPropertySetInfo).getProperties();
    info.dispose();
    const properties: Property[] = [];
    try {
      for (let index = 0; index < sequence.getLength(); ++index) {
        const property = new Property();
        uno_type_assignData(
          property,
          propertyType().getTypeLibType() as NativeTypeRef,
          (sequence.getConstArray() as SequenceElements).get(index * 32),
          propertyType().getTypeLibType(),
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
        properties.push(property);
      }
    } finally {
      sequence.dispose();
    }
    try {
      for (const property of properties) {
        // beans::PropertyAttribute::READONLY from the original IDL.
        if ((property.Attributes & 16) !== 0 || staticDenylist.has(text(property.Name))) continue;
        try {
          const value = source.getPropertyValue(property.Name);
          const swapped =
            type === PageBreakType.Even && mapper.GetSettingsTable().GetMirrorMarginSettings();
          const key = text(property.Name),
            destination = unicode(
              swapped && key === "LeftMargin"
                ? "RightMargin"
                : swapped && key === "RightMargin"
                  ? "LeftMargin"
                  : key,
            );
          try {
            style.setPropertyValue(destination, value);
          } finally {
            value.dispose();
            destination.dispose();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    } finally {
      for (const property of properties) {
        property.Name.dispose();
        property.Type.dispose();
      }
    }
    const follow = unicode("FollowStyle"),
      value = stringAny(text(this.GetPageStyleName()));
    try {
      style.setPropertyValue(follow, value);
    } finally {
      follow.dispose();
      value.dispose();
    }
    if (type !== PageBreakType.Both) {
      const property = unicode("PageStyleLayout"),
        layout = new Any(
          [type === PageBreakType.Even ? PageStyleLayout.LEFT : PageStyleLayout.RIGHT],
          layoutType,
        );
      try {
        style.setPropertyValue(property, layout);
      } finally {
        property.dispose();
        layout.dispose();
      }
    }
    const doc = mapper.model.GetDoc();
    const current = doc.FindPageDesc(text(this.GetPageStyleName()));
    const copied = doc.FindPageDesc(text(name));
    if (mapper.IsNewDoc() && current && copied) CompleteCopyHeaderFooter(current, copied);
    this["m_sPageStyleName"].assign(name);
  } finally {
    name.dispose();
  }
}
/** Copies a temporary Any into the original map and releases only its temporary owner. @param map - Actual owner. @param id - Original property. @param value - Owned temporary. @returns Nothing. */
function insert(map: PropertyMap, id: P, value: Any): void {
  try {
    map.Insert(id, value);
  } finally {
    value.dispose();
  }
}
/** Original optional boolean property extraction defaults to false. @param map - Actual context. @param id - Original property ID. @returns Extracted flag. */
function booleanProperty(map: PropertyMap, id: P): boolean {
  const value = map.getProperty(id),
    result: [boolean] = [false];
  try {
    value?.[1].extract(result, "bool");
    return result[0];
  } finally {
    value?.[1].dispose();
  }
}
/** Original optional integer extraction for the represented physical properties. @param map - Actual context. @param id - Original property. @returns Value or1. */
function integerProperty(map: PropertyMap, id: P): number {
  const value = map.getProperty(id),
    result: [number] = [1];
  try {
    value?.[1].extract(result, "sal_Int32");
    return result[0];
  } finally {
    value?.[1].dispose();
  }
}
/** Original Asian character-height preference from imported defaults, overridden by Standard. @param mapper - Actual mapper. @returns Grid character width in mm100. */
function gridCharacterWidth(mapper: DomainMapper_Impl): number {
  let width = 423;
  const table = mapper.GetStyleSheetTable(),
    standard = table.FindStyleSheetByConvertedStyleName("Standard");
  for (const map of [table.GetDefaultCharProps(), standard?.m_pProperties]) {
    const height = map?.getProperty(P.PROP_CHAR_HEIGHT_ASIAN),
      size: [number] = [0];
    try {
      if (height?.[1].extract(size, "double"))
        width = convertTwipToMm100_Limited(Math.trunc(size[0] * 20 + 0.5));
    } finally {
      height?.[1].dispose();
    }
  }
  return width;
}
/** Completes the original page style for the consumed body section. @param this - Actual section map. @param mapper - Actual mapper. @returns Nothing. */
export function CloseSectionGroup(this: SectionPropertyMap, mapper: DomainMapper_Impl): void {
  const previous = mapper.GetLastSectionContext();
  if (this["m_nBreakType"] === -1 || this["m_nBreakType"] === N.LN_Value_ST_SectionMark_nextColumn)
    this["m_nBreakType"] = N.LN_Value_ST_SectionMark_nextPage;
  else if (
    this["m_nBreakType"] === N.LN_Value_ST_SectionMark_continuous &&
    previous &&
    booleanProperty(this, P.PROP_IS_LANDSCAPE) !== booleanProperty(previous, P.PROP_IS_LANDSCAPE)
  )
    this["m_nBreakType"] = N.LN_Value_ST_SectionMark_nextPage;
  if (this["m_nLnnMod"])
    mapper.SetLineNumbering(this["m_nLnnMod"], this["m_nLnc"], this["m_ndxaLnn"]);
  if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_continuous) {
    this.InheritOrFinalizePageStyles(mapper);
    return;
  }
  const style = this.GetPageStyle(mapper);
  this.SetHeaderFooterProperties(mapper);
  this.HandleMarginsHeaderFooter(mapper);
  if (mapper.GetSettingsTable().GetMirrorMarginSettings())
    insert(this, P.PROP_PAGE_STYLE_LAYOUT, new Any([PageStyleLayout.MIRRORED], layoutType));
  // These are the native defaults for the currently unrepresented section grid controls.
  const writingMode = this.getProperty(P.PROP_WRITING_MODE),
    direction: [number] = [WritingMode2.LR_TB];
  try {
    writingMode?.[1].extract(direction, "sal_Int16");
  } finally {
    writingMode?.[1].dispose();
  }
  const pitch = 1,
    textAreaHeight =
      direction[0] === WritingMode2.LR_TB
        ? integerProperty(this, P.PROP_HEIGHT) - this["m_nTopMargin"] - this["m_nBottomMargin"]
        : integerProperty(this, P.PROP_WIDTH) - this["m_nLeftMargin"] - this["m_nRightMargin"],
    lines = Math.trunc(textAreaHeight / pitch);
  if (lines >= 0 && lines <= 32767) insert(this, P.PROP_GRID_LINES, new Any([lines], "sal_Int16"));
  insert(this, P.PROP_GRID_MODE, new Any([0], "sal_Int16"));
  insert(this, P.PROP_GRID_STANDARD_MODE, new Any(true));
  const property = unicode("DefaultPageMode"),
    mode = new Any(false);
  try {
    mapper.GetTextDocument().setPropertyValue(property, mode);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  } finally {
    property.dispose();
    mode.dispose();
  }
  insert(this, P.PROP_GRID_BASE_HEIGHT, new Any([pitch], "sal_Int32"));
  insert(this, P.PROP_GRID_BASE_WIDTH, new Any([gridCharacterWidth(mapper)], "sal_Int32"));
  insert(this, P.PROP_GRID_RUBY_HEIGHT, new Any([0], "sal_Int32"));
  this["ApplyProperties_"](style);
  this.ApplyBorderToPageStyles(mapper);
  try {
    if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_evenPage)
      this.CreateEvenOddPageStyleCopy(mapper, PageBreakType.Even);
    else if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_oddPage)
      this.CreateEvenOddPageStyleCopy(mapper, PageBreakType.Odd);
    const first = this["m_pStartingNode"];
    const pageStyle = text(this.GetPageStyleName());
    const restart = this["m_nPageNumber"];
    if (first && !(this.IsFirstSection() && pageStyle === "Standard" && restart < 0)) {
      const item = new SwFormatPageDesc(pageStyle, restart < 0 ? undefined : restart & 0xffff);
      const table = first.FindTableNode();
      if (table) table.GetTable().GetFrameFormat().SetFormatAttr(item);
      else first.SetAttr(item);
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}

import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../../udkapi/com/sun/star/beans/Property";

import type { XPropertySetInfo } from "../../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { uno_type_assignData } from "../../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as NativeTypeRef } from "../../../../cppu/inc/typelib/typedescription";
