/** @fileoverview Native header/footer text context and ODF master-page variant selection. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import {
  RES_FRM_SIZE,
  RES_HEADER_FOOTER_EAT_SPACING,
  RES_LR_SPACE,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwFrameSize } from "../../../inc/fmtfsize";
import type { SwHeaderAndFooterEatSpacingItem } from "../../../inc/hfspacingitem";
import { getActivePageStory, type SwFrameFormat } from "../../core/layout/atrfrm";
import type { SwXStyle } from "../../core/unocore/unostyle";
import { unicode } from "../../core/unocore/unocrsrhelper";
import type { OdfPageLayout } from "../../../../xmloff/source/style/xmlstyle";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import type { SwStartNode } from "../../core/docnode/node";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXHeadFootText } from "../../core/unocore/unotext";
import { endTextFrame } from "./xmltextframe";

/** ODF variant names, in the native master-page export order. */
const variants = [
  [XMLToken.STYLE_HEADER, "header", false, "master"],
  [XMLToken.STYLE_HEADER_LEFT, "header-left", false, "left"],
  [XMLToken.STYLE_HEADER_FIRST, "header-first", false, "first"],
  [XMLToken.STYLE_FOOTER, "footer", true, "master"],
  [XMLToken.STYLE_FOOTER_LEFT, "footer-left", true, "left"],
  [XMLToken.STYLE_FOOTER_FIRST, "footer-first", true, "first"],
] as const;
/** Original master-page element selection. */
type Variant = (typeof variants)[number];
/** Actual native section that belongs in one master-page child. */
export interface OdfPageStory {
  readonly element: Variant[1];
  readonly start: SwStartNode;
  readonly display: boolean;
}

/** Reads a variant from its original page format. @param page - Page descriptor. @param variant - ODF variant. @returns Page frame owner. */
function formatOf(page: SwPageDesc, variant: Variant[3]): SwFrameFormat {
  if (variant === "first") return page.GetFirstMaster();
  if (variant === "left") return page.GetLeft();
  return page.GetMaster();
}

/** Reads a variant's owned text frame. @param format - Page variant. @param footer - Whether footer. @returns Bound frame or null. */
function contentFormat(format: SwFrameFormat, footer: boolean): SwFrameFormat | null {
  return footer ? format.GetFooter().GetFooterFormat() : format.GetHeader().GetHeaderFormat();
}

/** Selects original odd, left and first text sections for one ODF master page. @param page - Page descriptor. @returns Ordered original page stories. */
export function getOdfPageStories(page: SwPageDesc): OdfPageStory[] {
  const stories: OdfPageStory[] = [];
  for (const [, element, footer, variant] of variants) {
    if (variant === "first" && page.IsFirstShared()) continue;
    if (variant === "left" && (footer ? page.IsFooterShared() : page.IsHeaderShared())) continue;
    const format = formatOf(page, variant);
    const frame = contentFormat(format, footer);
    if (!frame || (variant !== "master" && frame === contentFormat(page.GetMaster(), footer)))
      continue;
    const start = frame.GetContent().GetContentIdx()?.GetNode();
    if (!start?.IsStartNode()) throw new Error("Writer header/footer section is invalid.");
    const display =
      variant !== "master" ||
      (footer ? format.GetFooter().IsActive() : format.GetHeader().IsActive());
    stories.push({ element, start, display });
  }
  return stories;
}

/** Original master-page text children, bound lazily only when the first child is parsed. */
export class XMLTextMasterPageContext extends SvXMLImportContext {
  private headerSeen = false;
  private footerSeen = false;

  /** Binds one existing page and the original text import helper. @param page - Page descriptor. @param text - Shared helper. @param prepare - Applies preceding named styles. @returns Master page context. */
  constructor(
    private readonly page: SwPageDesc,
    private readonly text: XMLTextImportHelper,
    private readonly prepare: () => void,
  ) {
    super();
  }

  /** Resolves admitted variants after their ordinary predecessor. @param token - Master page child token. @returns Context. */
  override createFastChildContext(token: XMLToken): SvXMLImportContext {
    const variant = variants.find(
      /** Finds the original page child variant. @param candidate - Variant record. @returns Whether matched. */
      ([candidate]) => candidate === token,
    );
    if (!variant) return new SvXMLIgnoreContext();
    const [, , footer, page] = variant;
    const seen = footer ? this.footerSeen : this.headerSeen;
    if (page !== "master") {
      const master = this.page.GetMaster();
      const active = footer ? master.GetFooter().IsActive() : master.GetHeader().IsActive();
      if (!seen || !active) return new SvXMLIgnoreContext();
    } else {
      if (seen) return new SvXMLIgnoreContext();
      if (footer) this.footerSeen = true;
      else this.headerSeen = true;
    }
    this.prepare();
    return new XMLTextHeaderFooterContext(this.page, variant, this.text);
  }

  /** Reconnects original sharing links after the independently imported variants are complete. @returns Nothing. */
  override endFastElement(): void {
    const { page } = this;
    const master = page.GetMaster(),
      left = page.GetLeft(),
      first = page.GetFirstMaster(),
      firstLeft = page.GetFirstLeft();
    if (master.GetHeader().IsActive()) {
      if (page.IsHeaderShared()) left.SetFormatAttr(master.GetHeader());
      if (page.IsFirstShared() || !first.GetHeader().IsActive())
        first.SetFormatAttr(master.GetHeader());
      firstLeft.SetFormatAttr(page.IsFirstShared() ? left.GetHeader() : first.GetHeader());
    }
    if (master.GetFooter().IsActive()) {
      if (page.IsFooterShared()) left.SetFormatAttr(master.GetFooter());
      if (page.IsFirstShared() || !first.GetFooter().IsActive())
        first.SetFormatAttr(master.GetFooter());
      firstLeft.SetFormatAttr(page.IsFirstShared() ? left.GetFooter() : first.GetFooter());
    }
  }
}

/** Owns one ODF header or footer while its actual paragraph/table child contexts are active. */
class XMLTextHeaderFooterContext extends SvXMLImportContext {
  private cursor: SwXTextCursor | undefined;
  private text: SwXHeadFootText | undefined;

  /** Holds the variant until there is actual content to insert. @param page - Actual page descriptor. @param variant - Original variant. @param helper - Shared Writer text import helper. @returns Text section context. */
  constructor(
    private readonly page: SwPageDesc,
    private readonly variant: Variant,
    private readonly helper: XMLTextImportHelper,
  ) {
    super();
  }

  /** Redirects the native import cursor to the section before handling its first block. @param token - Content token. @param attributes - Original block attributes. @returns Child context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (this.cursor === undefined) {
      const [, , footer, variant] = this.variant;
      const frame = formatOf(this.page, variant);
      const layout = frame.GetDoc().getIDocumentLayoutAccess();
      const request = footer
        ? RndStdIds.FOOTER
        : variant === "left"
          ? RndStdIds.HEADERL
          : RndStdIds.HEADER;
      const content = layout.MakeLayoutFormat(request);
      const item = footer ? new SwFormatFooter(content) : new SwFormatHeader(content);
      try {
        frame.SetFormatAttr(item);
      } finally {
        item.Dispose();
      }
      if (variant === "first") this.page.ChgFirstShare(false);
      else if (footer) this.page.ChgFooterShare(variant === "master");
      else this.page.ChgHeaderShare(variant === "master");
      this.text = SwXHeadFootText.CreateXHeadFootText(content);
      this.cursor = this.text.createTextCursor();
      this.helper.PushTextFrameCursor(this.cursor);
    }
    return this.helper.CreateTextChildContext(token, attributes, "HeaderFooter");
  }

  /** Completes native ranges and removes the trailing import paragraph before restoring the previous cursor. @returns Nothing. */
  override endFastElement(): void {
    if (!this.cursor) {
      const [, , footer, variant] = this.variant;
      if (variant !== "left")
        this.page
          .GetMaster()
          .SetFormatAttr(footer ? new SwFormatFooter(false) : new SwFormatHeader(false));
      return;
    }
    try {
      endTextFrame(this.cursor);
    } finally {
      this.helper.PopTextFrameCursor();
      this.text?.dispose();
    }
  }
}

/** Applies ODF story geometry after the associated master-page frames exist. @param style - Target page style. @param layout - Parsed page layout. @returns Nothing. */
export function applyPageStoryGeometry(style: SwXStyle, layout: OdfPageLayout): void {
  for (const [prefix, geometry] of [
    ["Header", layout.header],
    ["Footer", layout.footer],
  ] as const) {
    if (!geometry) continue;
    for (const [suffix, field] of [
      ["Height", geometry.height],
      ["BodyDistance", geometry.bodyDistance],
      ["LeftMargin", geometry.leftMargin],
      ["RightMargin", geometry.rightMargin],
      ["IsDynamicHeight", geometry.isDynamicHeight],
      ["DynamicSpacing", geometry.dynamicSpacing],
    ] as const) {
      if (field === undefined) continue;
      const name = unicode(prefix + suffix);
      const value =
        typeof field === "boolean"
          ? new Any(field)
          : new Any([Number(convertTwipToMm100(BigInt(field)))], "sal_Int32");
      try {
        style.setPropertyValue(name, value);
      } finally {
        name.dispose();
        value.dispose();
      }
    }
  }
}

/** Writes the native ODF page layout style children from actual header and footer items. @param master - Page frame. @param length - ODF measure formatting. @param backgrounds - Page layout fill writer. @returns Original page-layout children. */
export function exportPageStoryStyles(
  master: SwFrameFormat,
  length: (twips: number) => string,
  backgrounds?: import("./xmlexpit").XMLPageBackgroundExport,
): string {
  let result = "";
  for (const header of [true, false]) {
    const story = getActivePageStory(master, header);
    if (!story) continue;
    const items = story.GetAttrSet();
    const attributes: string[] = [];
    if (items.GetItemIfSet(RES_FRM_SIZE, false)) {
      const size = story.GetFrameSize();
      const measure =
        size.GetHeightSizeType() === SwFrameSize.Fixed ? "svg:height" : "fo:min-height";
      attributes.push(`${measure}="${length(size.GetHeight())}"`);
    }
    if (items.GetItemIfSet(RES_UL_SPACE, false)) {
      const spacing = story.GetULSpace();
      const distance = header ? spacing.GetLower() : spacing.GetUpper();
      attributes.push(`fo:margin-${header ? "bottom" : "top"}="${length(distance)}"`);
    }
    if (items.GetItemIfSet(RES_LR_SPACE, false)) {
      const margins = story.GetLRSpace();
      attributes.push(`fo:margin-left="${length(margins.ResolveLeft())}"`);
      attributes.push(`fo:margin-right="${length(margins.ResolveRight())}"`);
    }
    const dynamic = items.GetItemIfSet(RES_HEADER_FOOTER_EAT_SPACING, false) as
      SwHeaderAndFooterEatSpacingItem | undefined;
    if (dynamic) attributes.push(`style:dynamic-spacing="${dynamic.GetValue()}"`);
    const background = backgrounds?.exportBackground(story);
    if (attributes.length || background?.attributes) {
      const element = header ? "header-style" : "footer-style";
      const properties = `<style:header-footer-properties${attributes.length ? ` ${attributes.join(" ")}` : ""}${background?.attributes ?? ""}`;
      result += `<style:${element}>${background?.children ? `${properties}>${background.children}</style:header-footer-properties>` : `${properties}/>`}</style:${element}>`;
    }
  }
  return result;
}
