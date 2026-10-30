/** @fileoverview Consumed native SectionPropertyMap page-style finalization and parity-copy methods; range attachment remains on the existing atomic import boundary. */
import { PageBreakType, SectionPropertyMap, type PropertyMap } from "./PropertyMap";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text, unicode, stringAny } from "../../core/unocore/unocrsrhelper";
import {
  PageStyleLayout,
  cppu_detail_getUnoType_PageStyleLayout as layoutType,
} from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { convertTwipToMm100_Limited } from "./ConversionHelper";

/** Original write-only/header-content denylist retained even though this model has no header/footer content owner. */
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
    const properties = source.getPropertySetInfo().getProperties();
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
/** Consumed original no-header/no-column body section finalization. Content sections, header/footer text and frames have no current model owners; their services are not fabricated here. @param this - Actual section map. @param mapper - Actual mapper. @returns Nothing. */
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
  if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_continuous) {
    this.InheritOrFinalizePageStyles(mapper);
    return;
  }
  const style = this.GetPageStyle(mapper);
  this.HandleMarginsHeaderFooter(mapper);
  if (mapper.GetSettingsTable().GetMirrorMarginSettings())
    insert(this, P.PROP_PAGE_STYLE_LAYOUT, new Any([PageStyleLayout.MIRRORED], layoutType));
  // These are the native defaults for the currently unrepresented section grid controls.
  const pitch = 1,
    lines = Math.trunc(
      (integerProperty(this, P.PROP_HEIGHT) - this["m_nTopMargin"] - this["m_nBottomMargin"]) /
        pitch,
    );
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
  try {
    if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_evenPage)
      this.CreateEvenOddPageStyleCopy(mapper, PageBreakType.Even);
    else if (this["m_nBreakType"] === N.LN_Value_ST_SectionMark_oddPage)
      this.CreateEvenOddPageStyleCopy(mapper, PageBreakType.Odd);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}
