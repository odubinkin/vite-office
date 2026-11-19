/** @fileoverview Native DOCX section property output from the Writer page descriptor and master frame. */
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import {
  SvxBoxItemLine as Edge,
  type WordPageMargins,
} from "../../../../editeng/source/items/frmitems";
import { HdFtDistanceGlue } from "./writerwordglue";
import { SectionPageBorders } from "./docxattributeoutput.borders";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import { RES_PAGEDESC } from "../../../inc/hintids";
import type { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { UseOnPage, type SwPageDesc } from "../../core/layout/pagedesc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { DocxAttributeOutput } from "./docxattributeoutput";

const w = token("w");

/** Writer's represented native page-style section and optional restart. */
export interface WW8SepInfo {
  readonly page: SwPageDesc;
  readonly restart: number | undefined;
}

/** Resolves page-description assignments as the native body traversal advances. */
export class MSWordSections {
  private current: WW8SepInfo;

  /** Starts with the first block's page item or the native default page. @param document - Writer graph. @param first - First body block. @returns Native section collection. */
  constructor(
    private readonly document: SwDoc,
    first: SwTextNode | SwTableNode | undefined,
  ) {
    this.current = this.resolve(first && pageItem(first, true));
  }

  /** Returns the current section when a later page style or restart opens another one. @param next - Next body block. @returns Section being closed. */
  Advance(next: SwTextNode | SwTableNode | undefined): WW8SepInfo | undefined {
    const item = next && pageItem(next, false);
    if (!item) return undefined;
    const name = item.GetPageDescName();
    if (!name && item.GetNumOffset() === undefined) return undefined;
    const previous = this.current;
    this.current = this.resolve(item, previous.page);
    return previous;
  }

  /** Returns the final section, emitted under the body. @returns Current section. */
  CurrentSectionInfo(): WW8SepInfo {
    return this.current;
  }

  /** Resolves the real descriptor by name and preserves a standalone number offset. @param item - Native item. @param fallback - Prior descriptor. @returns Section. */
  private resolve(item?: SwFormatPageDesc, fallback = this.document.GetPageDesc()): WW8SepInfo {
    return {
      page: (item && this.document.FindPageDesc(item.GetPageDescName())) || fallback,
      restart: item?.GetNumOffset(),
    };
  }
}

/** Reads the actual body or table page item. @param block - Native block. @param inherited - Whether to resolve the initial effective page. @returns Page item. */
function pageItem(
  block: SwTextNode | SwTableNode,
  inherited: boolean,
): SwFormatPageDesc | undefined {
  const items =
    block instanceof SwTableNode
      ? block.GetTable().GetFrameFormat().GetAttrSet()
      : inherited
        ? block.GetSwAttrSet()
        : block.GetpSwAttrSet();
  return items?.GetItemIfSet(RES_PAGEDESC, inherited) as SwFormatPageDesc | undefined;
}

/** Writes the represented page frame in the native WordprocessingML section order. @param output - DOCX attribute owner. @param section - Actual section and restart. @returns Nothing. */
export function SectionProperties(output: DocxAttributeOutput, section: WW8SepInfo): void {
  const serializer = output.GetSerializer();
  const { page, restart } = section;
  const master = page.GetMaster();
  const size = master.GetFrameSize();
  const lr = master.GetLRSpace();
  const box = master.GetBox();
  const distances = new HdFtDistanceGlue(master);
  const margins: WordPageMargins = [
    distances.m_DyaTop,
    distances.m_DyaBottom,
    (lr.ResolveLeft() & 0xffff) + box.CalcLineSpace(Edge.LEFT, true),
    (lr.ResolveRight() & 0xffff) + box.CalcLineSpace(Edge.RIGHT, true),
  ];
  const frameDirection = master.GetFrameDir().GetValue();
  const direction =
    frameDirection === SvxFrameDirection.Environment
      ? output.GetExport().GetDefaultFrameDirection()
      : frameDirection;
  const usage = page.GetUseOn();
  const breakCode = usage === UseOnPage.Left ? 3 : usage === UseOnPage.Right ? 4 : 2;
  serializer.startElementNS(w, token("sectPr"));
  output.GetExport().WriteHeadersFooters(page, breakCode);
  output.SectionType(breakCode);
  serializer.singleElementNS(
    w,
    token("pgSz"),
    FSNS(w, token("orient")),
    page.GetLandscape() ? "landscape" : null,
    FSNS(w, token("w")),
    String(Math.min(65500, size.GetWidth())),
    FSNS(w, token("h")),
    String(Math.min(65500, size.GetHeight())),
  );
  serializer.singleElementNS(
    w,
    token("pgMar"),
    FSNS(w, token("left")),
    String(margins[Edge.LEFT]),
    FSNS(w, token("right")),
    String(margins[Edge.RIGHT]),
    FSNS(w, token("gutter")),
    String(lr.GetGutterMargin() & 0xffff),
    FSNS(w, token("top")),
    String(margins[Edge.TOP]),
    FSNS(w, token("bottom")),
    String(margins[Edge.BOTTOM]),
    FSNS(w, token("header")),
    "0",
    FSNS(w, token("footer")),
    "0",
  );
  SectionPageBorders(serializer, master, margins);
  output.SectionPageNumbering(SvxNumType.SVX_NUM_ARABIC, restart);
  if (!page.IsFirstShared()) serializer.singleElementNS(w, token("titlePg"));
  serializer.singleElementNS(
    w,
    token("textDirection"),
    FSNS(w, token("val")),
    pageTextFlow.get(direction) ?? "lrTb",
  );
  if (direction === SvxFrameDirection.Horizontal_RL_TB)
    serializer.singleElementNS(w, token("bidi"));
  serializer.endElementNS(w, token("sectPr"));
}

const pageTextFlow = new Map([
  [SvxFrameDirection.Vertical_RL_TB, "tbRl"],
  [SvxFrameDirection.Vertical_LR_TB, "tbLrV"],
  [SvxFrameDirection.Vertical_LR_BT, "btLr"],
  [SvxFrameDirection.Vertical_RL_TB90, "tbRlV"],
]);
