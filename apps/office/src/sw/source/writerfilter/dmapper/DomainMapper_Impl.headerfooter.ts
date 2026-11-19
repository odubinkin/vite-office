/** @fileoverview Native DomainMapper header/footer text destinations and section variant finalization. */
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import {
  RES_FOOTER,
  RES_HEADER,
  RES_FRM_SIZE,
  RES_HEADER_FOOTER_EAT_SPACING,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import { text } from "../../core/unocore/unocrsrhelper";
import { SwXHeadFootText } from "../../core/unocore/unotext";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import type { SectionPropertyMap } from "./PropertyMap";

/** Resolves the actual section page-style owner before opening a substream. @param mapper - Native stream state. @param section - Original section. @returns Actual page descriptor. */
function pageStyle(mapper: DomainMapper_Impl, section: SectionPropertyMap): SwPageDesc | undefined {
  if (!section.GetPageStyle(mapper)) return undefined;
  return mapper.model.GetDoc().FindPageDesc(text(section.GetPageStyleName()));
}

/** Creates one real independent native story format for a page variant. @param frame - Original page variant. @param header - Whether header. @returns Bound native text. */
function activate(frame: SwFrameFormat, header: boolean): SwXHeadFootText {
  const content = frame
    .GetDoc()
    .getIDocumentLayoutAccess()
    .MakeLayoutFormat(header ? RndStdIds.HEADER : RndStdIds.FOOTER);
  const item = header ? new SwFormatHeader(content) : new SwFormatFooter(content);
  try {
    frame.SetFormatAttr(item);
  } finally {
    item.Dispose();
  }
  return SwXHeadFootText.CreateXHeadFootText(content);
}

/** Original default/even/first dispatch to the section's native text owner. @param mapper - Actual mapper state. @param section - Current original section context. @param id - Original substream ID. @returns Text append owner or absence. */
export function PushPageHeaderFooter(
  mapper: DomainMapper_Impl,
  section: SectionPropertyMap,
  id: number,
): SwXHeadFootText | undefined {
  const page = pageStyle(mapper, section);
  if (!page) return undefined;
  switch (id) {
    case N.LN_headerr:
      return activate(page.GetMaster(), true);
    case N.LN_headerl:
      return activate(page.GetLeft(), true);
    case N.LN_headerf:
      return activate(page.GetFirstMaster(), true);
    case N.LN_footerr:
      return activate(page.GetMaster(), false);
    case N.LN_footerl:
      return activate(page.GetLeft(), false);
    case N.LN_footerf:
      return activate(page.GetFirstMaster(), false);
    default:
      throw new Error("Unsupported Writer substream: " + id);
  }
}

/** Gets the represented three page-variant owners before resolving first-left aliasing. @param page - Actual descriptor. @returns Native variant frames. */
function formats(page: SwPageDesc): readonly [SwFrameFormat, SwFrameFormat, SwFrameFormat] {
  return [page.GetMaster(), page.GetLeft(), page.GetFirstMaster()];
}

/** Copies a previous section's story to an independent native text owner. @param source - Previous story. @param destination - New page variant. @param header - Whether header. @returns Nothing. */
function copyStory(source: SwFrameFormat, destination: SwFrameFormat, header: boolean): void {
  const target = activate(destination, header);
  const text = SwXHeadFootText.CreateXHeadFootText(source);
  try {
    target.copyText(text);
    const frame = storyFormat(destination, header);
    if (frame) {
      for (const which of [RES_FRM_SIZE, RES_UL_SPACE, RES_HEADER_FOOTER_EAT_SPACING]) {
        const item = source.GetAttrSet().GetItemIfSet(which, false);
        if (item) frame.SetFormatAttr(item);
      }
    }
  } finally {
    text.dispose();
    target.dispose();
  }
}

/** Copies represented header/footer variants for the native odd/even predecessor style. @param source - Native following page descriptor. @param target - Native parity page descriptor. @returns Nothing. */
export function CompleteCopyHeaderFooter(source: SwPageDesc, target: SwPageDesc): void {
  const [ordinary, even, first] = formats(target);
  for (const header of [true, false]) {
    const story = storyFormat(source.GetMaster(), header);
    const alternate = storyFormat(source.GetLeft(), header);
    const beginning = storyFormat(source.GetFirstMaster(), header);
    const shared = header ? source.IsHeaderShared() : source.IsFooterShared();
    if (story) copyStory(story, ordinary, header);
    if (!shared && alternate) copyStory(alternate, even, header);
    if (!source.IsFirstShared() && beginning) copyStory(beginning, first, header);
    connectFirstLeft(target, header, !shared, !source.IsFirstShared());
  }
  target.ChgHeaderShare(source.IsHeaderShared());
  target.ChgFooterShare(source.IsFooterShared());
  target.ChgFirstShare(source.IsFirstShared());
}

/** Borrows a matching frame from a native variant. @param variant - Actual page frame. @param header - Whether header. @returns Story format. */
function storyFormat(variant: SwFrameFormat, header: boolean): SwFrameFormat | null {
  return header
    ? variant.GetHeader(false).GetHeaderFormat()
    : variant.GetFooter(false).GetFooterFormat();
}

/** Binds the second native first-page frame to the corresponding first-page story. @param page - Actual descriptor. @param header - Whether header. @param even - Separate even page. @param first - Separate first page. @returns Nothing. */
function connectFirstLeft(page: SwPageDesc, header: boolean, even: boolean, first: boolean): void {
  const effective = first ? page.GetFirstMaster() : even ? page.GetLeft() : page.GetMaster();
  const item = effective.GetAttrSet().GetItemIfSet(header ? RES_HEADER : RES_FOOTER, false);
  if (item) page.GetFirstLeft().SetFormatAttr(item);
}

/** Retains the section's linked stories and applies Word even/odd and title-page selection. @param mapper - Original mapper state. @param section - Current section. @param titlePage - Whether first differs. @returns Nothing. */
export function SetHeaderFooterProperties(
  mapper: DomainMapper_Impl,
  section: SectionPropertyMap,
  titlePage: boolean,
): void {
  if (!mapper.IsNewDoc()) return;
  const doc = mapper.model.GetDoc();
  const page = doc.FindPageDesc(text(section.GetPageStyleName()));
  if (!page) return;
  const previous = mapper.GetLastSectionContext();
  const prior = previous ? doc.FindPageDesc(text(previous.GetPageStyleName())) : undefined;
  const [master, left, first] = formats(page);
  const even = mapper.GetSettingsTable().GetEvenAndOddHeaders();
  for (const header of [true, false]) {
    if (prior && prior !== page) {
      const shared = header ? prior.IsHeaderShared() : prior.IsFooterShared();
      const previousOrdinary = storyFormat(prior.GetMaster(), header);
      const previousEven = shared ? previousOrdinary : storyFormat(prior.GetLeft(), header);
      const previousFirst = prior.IsFirstShared()
        ? previousOrdinary
        : storyFormat(prior.GetFirstMaster(), header);
      if (previousOrdinary && !storyFormat(master, header))
        copyStory(previousOrdinary, master, header);
      if (even && previousEven && !storyFormat(left, header)) copyStory(previousEven, left, header);
      if (titlePage && previousFirst && !storyFormat(first, header))
        copyStory(previousFirst, first, header);
    }
    const main = storyFormat(master, header);
    const alternate = storyFormat(left, header);
    const beginning = storyFormat(first, header);
    if (!main && !alternate && !beginning) continue;
    if (!main) activate(master, header).dispose();
    if (even && !alternate) activate(left, header).dispose();
    if (titlePage && !beginning) activate(first, header).dispose();
    connectFirstLeft(page, header, even, titlePage);
  }
  page.ChgHeaderShare(!even);
  page.ChgFooterShare(!even);
  if (storyFormat(master, true) || storyFormat(master, false)) page.ChgFirstShare(!titlePage);
}
