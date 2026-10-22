/** @fileoverview Browser static resource adapter reads the actual installed Common.xcs Page tab defaults. This is not a Components provider or runtime configuration override service. */
import commonSchema from "../../../officecfg/registry/schema/org/openoffice/Office/Common.xcs?raw";
import type { PageFormatLimits } from "../../source/tabpages/page";
/** Reads original named schema defaults with the platform XML parser; no second numeric defaults table is introduced. @returns Source physical limit values. */
export function getPageFormatDefaultLimits(): PageFormatLimits {
  const schema = new DOMParser().parseFromString(commonSchema, "application/xml");
  /** Resolves an actual Drawinglayer property value. @param name - Original schema name. @returns Actual integer default. */
  function value(name: string): number {
    const drawing = [...schema.getElementsByTagName("group")].find(
      /** Selects the original schema group. @param group - Source element. @returns Match. */ (
        group,
      ) => group.getAttribute("oor:name") === "Drawinglayer",
    );
    const property = [...(drawing?.children ?? [])].find(
      /** Selects the exact original property. @param element - Source child. @returns Match. */ (
        element,
      ) => element.localName === "prop" && element.getAttribute("oor:name") === name,
    );
    const lexical = property?.getElementsByTagName("value")[0]?.textContent;
    if (lexical === undefined || lexical === null || !/^\s*-?[0-9]+\s*$/u.test(lexical))
      throw new Error(`Missing original page limit ${name}`);
    return Number(lexical);
  }
  return Object.freeze({
    widthCm: value("MaximumPaperWidth"),
    heightCm: value("MaximumPaperHeight"),
    leftMm: value("MaximumPaperLeftMargin"),
    rightMm: value("MaximumPaperRightMargin"),
    topMm: value("MaximumPaperTopMargin"),
    bottomMm: value("MaximumPaperBottomMargin"),
  });
}
