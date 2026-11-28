/** @fileoverview Applies imported Writer master-page layout and line-numbering properties. */
import { importPageLayoutBox } from "./xmlimpit";
import { getActivePageStory, type SwFrameFormat } from "../../core/layout/atrfrm";
import { UseOnPage } from "../../core/layout/pagedesc";
import { cppu_detail_getUnoType_PageStyleLayout as pageLayoutType } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { applyPageStoryGeometry } from "./xmlpageheaderfooter";
import type { OdfPageBackground } from "../../../../xmloff/source/style/PageMasterStyleMap";
import { applyTextImportProperties, xmlTextString } from "../../../../xmloff/source/text/txtprmap";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { type OdfPageLayout } from "../../../../xmloff/source/style/xmlstyle";
import { applyPageRegisterReference } from "../../core/layout/pagedesc";
import type { OdfLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingImportContext";
import {
  getWriterStyleIdFromOdfName,
  getWriterMaterializedParagraphStyleDefinition,
} from "../../../inc/poolfmt";
import type { SwXMLImport } from "./xmlimp";

/** Applies global ODF line numbering through the original Writer properties. @param this - Writer import. @param value - Imported configuration. @returns Nothing. */
export function applyLineNumbering(this: SwXMLImport, value: OdfLineNumberingConfiguration): void {
  const properties = this["model"].getLineNumberingProperties();
  for (const [name, field] of [
    ["CountEmptyLines", "countBlankLines"],
    ["CountLinesInFrames", "countInFlys"],
    ["IsOn", "paintLineNumbers"],
    ["RestartAtEachPage", "restartEachPage"],
  ] as const) {
    const key = xmlTextString(name),
      any = new Any([value[field]], "bool");
    try {
      properties.setPropertyValue(key, any);
    } finally {
      key.dispose();
      any.dispose();
    }
  }
  for (const [name, number] of [
    ["Interval", value.countBy],
    ["SeparatorInterval", value.dividerCountBy],
    ["NumberingType", value.numberingType],
    [
      "NumberPosition",
      value.position === "right"
        ? 1
        : value.position === "inside"
          ? 2
          : value.position === "outside"
            ? 3
            : 0,
    ],
  ] as const) {
    if (number === undefined || (number < 0 && name !== "NumberingType")) continue;
    const key = xmlTextString(name),
      any = new Any([(number << 16) >> 16], "sal_Int16");
    try {
      properties.setPropertyValue(key, any);
    } finally {
      key.dispose();
      any.dispose();
    }
  }
  const distanceKey = xmlTextString("Distance"),
    distance = new Any([value.distance], "sal_Int32");
  try {
    properties.setPropertyValue(distanceKey, distance);
  } finally {
    distanceKey.dispose();
    distance.dispose();
  }
  const style = value.charStyleName
    ? this.resolveNamedCharacterStyle(value.charStyleName)
    : undefined;
  for (const [name, text] of [
    ["SeparatorText", value.divider],
    ["CharStyleName", style],
  ] as const) {
    if (text === undefined) continue;
    const key = xmlTextString(name),
      string = xmlTextString(text),
      any = new Any(string.getDataAddress(), "OUString");
    try {
      properties.setPropertyValue(key, any);
    } finally {
      key.dispose();
      string.dispose();
      any.dispose();
    }
  }
}

/** Applies native page geometry and resolves deferred master-page references. @param this - Writer import. @param applyBackground - Applies the background using this import's graphic definitions. @returns Nothing. */
export function applyNamedPageStyles(
  this: SwXMLImport,
  applyBackground: (frame: SwFrameFormat | null, background?: OdfPageBackground) => void,
): void {
  const pages = this["model"].getStyleFamilies().getByName(xmlTextString("PageStyles"));
  const applyPage =
    /** Applies the page geometry and story properties. @param name - Master page name. @param layout - Imported physical geometry. @returns Nothing. */ (
      name: string,
      layout: OdfPageLayout,
    ): void => {
      const key = xmlTextString(name);
      if (!pages.hasByName(key)) {
        const descriptor = this["model"].createInstance(
          xmlTextString("com.sun.star.style.PageStyle"),
        );
        pages.insertByName(key, descriptor as import("../../core/unocore/unostyle").SwXStyle);
      }
      const style = pages.getByName(key);
      /** Publishes one typed property to the original Writer page-style owner. @param property - UNO name. @param type - UNO value type. @param propertyValue - Authored value. @returns Nothing. */
      function setProperty(
        property: string,
        type: "bool" | "sal_Int16" | "sal_Int32" | ReturnType<typeof pageLayoutType>,
        propertyValue: number | boolean,
      ): void {
        const propertyName = xmlTextString(property);
        const value = new Any([propertyValue], type);
        try {
          style.setPropertyValue(propertyName, value);
        } finally {
          propertyName.dispose();
          value.dispose();
        }
      }
      try {
        setProperty("Width", "sal_Int32", Number(convertTwipToMm100(BigInt(layout.width))));
        setProperty("Height", "sal_Int32", Number(convertTwipToMm100(BigInt(layout.height))));
        setProperty("IsLandscape", "bool", layout.landscape);
        if (layout.numberingType !== undefined)
          setProperty("NumberingType", "sal_Int16", layout.numberingType);
        if (layout.direction !== undefined)
          setProperty("WritingMode", "sal_Int16", layout.direction);
        if (layout.rtlGutter !== undefined) setProperty("RtlGutter", "bool", layout.rtlGutter);
        if (layout.gutter !== undefined) setProperty("GutterMargin", "sal_Int32", layout.gutter);
        const gutterSide = this.document.GetDocumentSettingManager().get("GUTTER_AT_TOP")
          ? "TopMargin"
          : layout.rtlGutter
            ? "RightMargin"
            : "LeftMargin";
        for (const [property, margin] of Object.entries(layout.margins))
          setProperty(
            property,
            "sal_Int32",
            margin -
              (property === gutterSide && layout.explicitMargins.has(property)
                ? (layout.gutter ?? 0)
                : 0),
          );
        for (const [property, type, value] of layout.grid) setProperty(property, type, value);
        if (layout.usage !== undefined)
          setProperty("PageStyleLayout", pageLayoutType(), layout.usage);
        const page = this["model"].GetDoc().FindPageDesc(name);
        if (page) importPageLayoutBox(page, layout);
        if (page && layout.registerParagraphStyle) {
          const styleName = layout.registerParagraphStyle;
          const identity =
            this.resolveNamedParagraphStyle(styleName) ?? getWriterStyleIdFromOdfName(styleName);
          const reference =
            identity && getWriterMaterializedParagraphStyleDefinition(identity)
              ? this.document.GetTextFormatColl(identity)
              : identity
                ? this.document.FindTextFormatColl(identity)
                : this.document.FindTextFormatCollByName(styleName);
          if (reference) applyPageRegisterReference(page, reference);
        }
        if (page?.GetUseOn() === UseOnPage.Mirror) {
          page.Mirror();
          page.GetFirstLeft().SetFormatAttr(page.GetLeft().GetLRSpace());
        }
        applyPageStoryGeometry(style, layout);
        if (page) {
          const frames = [
            page.GetMaster(),
            page.GetLeft(),
            page.GetFirstMaster(),
            page.GetFirstLeft(),
          ];
          for (const frame of frames) applyBackground(frame, layout.background);
          for (const [header, story] of [
            [true, layout.header],
            [false, layout.footer],
          ] as const) {
            for (const frame of new Set(
              frames.map(
                /** Finds the effective story format for one physical page. @param owner - Page frame. @returns Story frame. */
                (owner) => getActivePageStory(owner, header),
              ),
            ))
              applyBackground(frame, story?.background);
          }
        }
      } finally {
        key.dispose();
      }
    };
  for (const { name, pageLayoutName, followName } of this["masterPages"]) {
    const layout = this["pageLayouts"].get(pageLayoutName);
    if (layout) applyPage(name, layout);
    const key = xmlTextString(name);
    const property = xmlTextString("FollowStyle");
    const value = xmlTextString(this["resolvePageStyleReference"](followName) || name);
    const any = new Any(value.getDataAddress(), "OUString");
    try {
      pages.getByName(key).setPropertyValue(property, any);
    } finally {
      any.dispose();
      value.dispose();
      property.dispose();
      key.dispose();
    }
  }
  for (const [style, name] of this["paragraphPageStyleReferences"]) {
    const pageStyleName = this["resolvePageStyleReference"](name);
    if (pageStyleName !== undefined) applyTextImportProperties(style, {}, { pageStyleName });
  }
  this["paragraphPageStyleReferences"].length = 0;
}
