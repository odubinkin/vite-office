/** @fileoverview Native page-style header/footer metric properties over the original story frame items. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { MID_LO_MARGIN, MID_UP_MARGIN } from "../../../../editeng/inc/memberids";
import { MID_SIZE_HEIGHT } from "../../../../svl/inc/memberid";
import { SID_ATTR_PAGE_DYNAMIC, SID_ATTR_PAGE_SIZE } from "../../../../svx/inc/svxids";
import { convert, Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { RES_HEADER_FOOTER_EAT_SPACING, RES_UL_SPACE } from "../../../inc/hintids";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwHeaderAndFooterEatSpacingItem } from "../../../inc/hfspacingitem";
import type { SwPageDesc } from "../layout/pagedesc";
import { getActivePageStory, type SwFrameFormat } from "../layout/atrfrm";
import { scalar } from "./unocrsrhelper";
import type { SwUnoPropertyEntry } from "./unomap";

const geometry = [
  ["BodyDistance", RES_UL_SPACE, "long"],
  ["Height", SID_ATTR_PAGE_SIZE, "long"],
  ["IsDynamicHeight", SID_ATTR_PAGE_DYNAMIC, "bool"],
  ["DynamicSpacing", RES_HEADER_FOOTER_EAT_SPACING, "bool"],
] as const;
/** Original property metadata together with its owning story selector. */
type PageStoryProperty = SwUnoPropertyEntry & { readonly header: boolean };

/** Original metadata for the represented nested header/footer properties. */
export const pageStoryPropertyEntries = new Map<string, PageStoryProperty>();
for (const prefix of ["Header", "Footer"] as const) {
  const header = prefix === "Header";
  for (const [suffix, which, kind] of geometry) {
    const member =
      suffix === "BodyDistance"
        ? (header ? MID_LO_MARGIN : MID_UP_MARGIN) | 0x80
        : suffix === "Height"
          ? MID_SIZE_HEIGHT | 0x80
          : 0;
    pageStoryPropertyEntries.set(prefix + suffix, {
      header,
      which,
      member,
      kind,
      type: kind === "long" ? "sal_Int32" : "bool",
      attributes: suffix === "DynamicSpacing" ? 1 : 0,
    });
  }
}

/** Reads a represented native property from the ordinary page story. @param page - Page or unattached style. @param name - Property. @returns Typed value, void when inactive, or undefined for other properties. */
export function readPageStoryProperty(page: SwPageDesc | undefined, name: string): Any | undefined {
  const property = pageStoryPropertyEntries.get(name);
  if (!property) return undefined;
  const frame = page && getActivePageStory(page.GetMaster(), property.header);
  if (!frame) return new Any();
  if (property.which === SID_ATTR_PAGE_DYNAMIC)
    return new Any(frame.GetFrameSize().GetHeightSizeType() !== SwFrameSize.Fixed);
  if (property.which === RES_HEADER_FOOTER_EAT_SPACING)
    return new Any(
      (frame.GetAttrSet().Get(property.which) as SwHeaderAndFooterEatSpacingItem).GetValue(),
    );
  if (property.which === RES_UL_SPACE)
    return new Any([frame.GetULSpace().QueryValue(property.member)], "sal_Int32");
  const height = Number(
    convert(BigInt(frame.GetFrameSize().GetHeight()), Length.twip, Length.mm100),
  );
  return new Any([height], "sal_Int32");
}

/** Routes one native story property to all active format variants without replacing their content. @param page - Existing page style. @param name - Property. @param value - UNO value. @returns Whether handled. */
export function writePageStoryProperty(page: SwPageDesc, name: string, value: Any): boolean {
  const property = pageStoryPropertyEntries.get(name);
  if (!property) return false;
  if (!getActivePageStory(page.GetMaster(), property.header)) return true;
  const targets = new Set<SwFrameFormat>();
  for (const variant of [
    page.GetMaster(),
    page.GetLeft(),
    page.GetFirstMaster(),
    page.GetFirstLeft(),
  ]) {
    const frame = getActivePageStory(variant, property.header);
    if (frame) targets.add(frame);
  }
  for (const frame of targets) {
    if (property.which === RES_UL_SPACE) {
      const spacing = frame.GetULSpace().Clone();
      try {
        if (spacing.PutValue(value.get("sal_Int32"), property.member)) frame.SetFormatAttr(spacing);
      } finally {
        spacing.Dispose();
      }
    } else if (property.which === RES_HEADER_FOOTER_EAT_SPACING) {
      frame.SetFormatAttr(
        new SwHeaderAndFooterEatSpacingItem(
          RES_HEADER_FOOTER_EAT_SPACING,
          scalar(value, "bool") as boolean,
        ),
      );
    } else {
      const size = frame.GetFrameSize().Clone();
      try {
        if (property.which === SID_ATTR_PAGE_DYNAMIC)
          size.SetHeightSizeType(
            (scalar(value, "bool") as boolean) ? SwFrameSize.Minimum : SwFrameSize.Fixed,
          );
        else size.SetHeight(Number(toTwips(BigInt(value.get("sal_Int32")), Length.mm100)));
        frame.SetFormatAttr(size);
      } finally {
        size.Dispose();
      }
    }
  }
  return true;
}
