/** @fileoverview Native group-scoped section sprms and the existing atomic RTF page-style application boundary. */
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { DomainMapper } from "../dmapper/DomainMapper";
import { ContextType } from "../dmapper/DomainMapper_Impl";
import { SectionPropertyMap } from "../dmapper/PropertyMap";
import { text } from "../../core/unocore/unocrsrhelper";

/** Original global controls update default and current section; section-only controls update current state. */
const geometry = new Map<string, readonly [number, number, boolean]>([
  ["paperw", [N.LN_EG_SectPrContents_pgSz, N.LN_CT_PageSz_w, true]],
  ["pgwsxn", [N.LN_EG_SectPrContents_pgSz, N.LN_CT_PageSz_w, false]],
  ["paperh", [N.LN_EG_SectPrContents_pgSz, N.LN_CT_PageSz_h, true]],
  ["pghsxn", [N.LN_EG_SectPrContents_pgSz, N.LN_CT_PageSz_h, false]],
  ["margl", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_left, true]],
  ["marglsxn", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_left, false]],
  ["margr", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_right, true]],
  ["margrsxn", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_right, false]],
  ["margt", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_top, true]],
  ["margtsxn", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_top, false]],
  ["margb", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_bottom, true]],
  ["margbsxn", [N.LN_EG_SectPrContents_pgMar, N.LN_CT_PageMar_bottom, false]],
]);
/** Captures actual section references at the existing atomic materialization boundary. @param this - Reader. @param state - Current parser state. @returns Nothing. */
export function CaptureSection(this: RtfDocumentImplContext, state: RtfState): void {
  const id = this["currentSection"];
  this["m_aSectionSprms"].get(id)?.dispose();
  this["m_aSectionSprms"].set(id, new RTFSprms(state.sectionSprms));
}
/** Original sectBreak control flow for the represented new-document body profile. @param this - Reader. @param state - Current group. @param final - Original final selector. @returns Nothing. */
export function SectBreak(this: RtfDocumentImplContext, state: RtfState, final = false): void {
  const needSect = this["m_bNeedSect"],
    type = state.sectionSprms.find(N.LN_EG_SectPrContents_type);
  let continuous: boolean;
  try {
    continuous = type.get()?.getInt() === N.LN_Value_ST_SectionMark_continuous;
  } finally {
    type.dispose();
  }
  if (this["m_bNeedPar"] && (!final || this["m_bNeedSect"] || continuous)) {
    this["m_bParAtEndOfSection"] = true;
    this["Dispatch"]({ kind: "control", name: "par" });
  }
  if (this["m_bNeedFinalPar"] && final) {
    this["Dispatch"]({ kind: "control", name: "pard" });
    this["m_bParAtEndOfSection"] = true;
    this["Dispatch"]({ kind: "control", name: "par" });
    this["m_bNeedSect"] = needSect;
  }
  this["m_bParAtEndOfSection"] = false;
  if ((!needSect || !this["m_bHadSect"]) && final && continuous)
    state.sectionSprms.erase(N.LN_EG_SectPrContents_type);
  this["FlushTable"]();
  CaptureSection.call(this, state);
  this["currentSection"]++;
  this["m_bNeedPar"] = false;
  this["m_bNeedSect"] = false;
}
/** Original guarded root-pop paragraph/section finalization. @param this - Reader. @param state - Root state before pop. @returns Nothing. */
export function FinishRtfSections(this: RtfDocumentImplContext, state: RtfState): void {
  if (this["m_bNeedCr"]) this["Dispatch"]({ kind: "control", name: "par" });
  if (this["m_bNeedSect"]) SectBreak.call(this, state, true);
  if (this["m_bNeedPar"]) {
    this["Dispatch"]({ kind: "control", name: "par" });
    this["m_bNeedSect"] = false;
  }
}
/** Atomic binding for the original non-newline lcl_utext deferred-page phase. Zero-length utext still clears first-run state. Completed table buffers retain the break until native table-frame placement. @param this - Reader. @param state - Incoming paragraph state. @returns Nothing. */
export function FlushDeferredPageBreak(this: RtfDocumentImplContext, state: RtfState): void {
  if (this["inTable"]) return;
  if (this["pendingPageBreak"]) {
    if (this["m_bIsFirstParaInSection"] || !this["m_bIsFirstRun"])
      this["CommitParagraph"](state, false, true);
    this["m_bParagraphPageBreak"] = true;
    this["pendingPageBreak"] = false;
  }
  this["m_bIsFirstRun"] = false;
}
/** Original PAGE/one-column COLUMN handling, including synthetic section state and lazy reset. @param this - Reader. @param name - Original symbol. @param state - Current group. @returns Nothing. */
export function DispatchPageBreak(
  this: RtfDocumentImplContext,
  name: string,
  state: RtfState,
): void {
  if (name === "column") this["checkFirstRun"]();
  if (this["inTable"]) return;
  const type = state.sectionSprms.find(N.LN_EG_SectPrContents_type),
    title = state.sectionSprms.find(N.LN_EG_SectPrContents_titlePg);
  let synthetic: boolean;
  try {
    synthetic =
      ((type.get()?.getInt() === N.LN_Value_ST_SectionMark_continuous && this["m_bHadSect"]) ||
        this["m_nResetBreakOnSectBreak"] === RTFKeyword.SBKNONE) &&
      !title.get()?.getInt();
  } finally {
    type.dispose();
    title.dispose();
  }
  if (synthetic) {
    SectBreak.call(this, state);
    this["Dispatch"]({ kind: "control", name: "sbkpage" });
    if (this["m_bNeedPar"]) this["Dispatch"]({ kind: "control", name: "par" });
    this["m_bIgnoreNextContSectBreak"] = true;
    this["m_nResetBreakOnSectBreak"] = RTFKeyword.SBKNONE;
  } else {
    const first = this["firstRun"];
    this["checkFirstRun"]();
    if (this["tableRows"].length > 0) this["FlushTable"]();
    if (first || this["m_bNeedCr"]) {
      this["checkNeedPap"](state);
      FlushDeferredPageBreak.call(this, state);
    }
    this["pendingPageBreak"] = true;
    this["m_bNeedCr"] = true;
  }
}
/** Consumes native section control families without flattening parser state into physical DTOs. @param this - Actual reader. @param name - Original control. @param parameter - Optional integer. @param state - Actual group owner. @returns Whether consumed. */
export function DispatchSectionControl(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  if (name === "sect") {
    this["m_bHadSect"] = true;
    if (this["m_bIgnoreNextContSectBreak"]) this["m_bIgnoreNextContSectBreak"] = false;
    else {
      if (this["m_bNeedCr"]) this["m_bNeedPar"] = true;
      SectBreak.call(this, state);
      if (this["m_nResetBreakOnSectBreak"] !== RTFKeyword.invalid) {
        const reset = this["m_nResetBreakOnSectBreak"];
        const keyword =
          reset === RTFKeyword.SBKNONE
            ? "sbknone"
            : reset === RTFKeyword.SBKPAGE
              ? "sbkpage"
              : reset === RTFKeyword.SBKCOL
                ? "sbkcol"
                : reset === RTFKeyword.SBKEVEN
                  ? "sbkeven"
                  : "sbkodd";
        this["Dispatch"]({ kind: "control", name: keyword });
        this["m_nResetBreakOnSectBreak"] = RTFKeyword.invalid;
        this["m_bNeedSect"] = false;
      }
      this["m_bNeedPar"] = true;
    }
    return true;
  }
  const type = sectionTypes.get(name);
  if (type !== undefined) {
    if (this["m_nResetBreakOnSectBreak"] !== RTFKeyword.invalid)
      this["m_nResetBreakOnSectBreak"] = (getSymbolData(name) as RTFSymbol).index;
    state.sectionSprms.set(N.LN_EG_SectPrContents_type, new RTFValue(type));
    return true;
  }
  if (name === "titlepg") {
    state.sectionSprms.set(N.LN_EG_SectPrContents_titlePg, new RTFValue(1));
    return true;
  }
  if (name === "sectd") {
    state.sectionSprms.dispose();
    state.sectionSprms = new RTFSprms(this["m_aDefaultSectionSprms"]);
    return true;
  }
  if (name === "pgnrestart") {
    putNestedAttribute(
      state.sectionSprms,
      N.LN_EG_SectPrContents_pgNumType,
      N.LN_CT_PageNumber_start,
      new RTFValue(1),
    );
    return true;
  }
  if (name === "landscape" || name === "lndscpsxn") {
    if (name === "landscape")
      putNestedAttribute(
        this["m_aDefaultSectionSprms"],
        N.LN_EG_SectPrContents_pgSz,
        N.LN_CT_PageSz_orient,
        new RTFValue(N.LN_Value_ST_PageOrientation_landscape),
      );
    putNestedAttribute(
      state.sectionSprms,
      N.LN_EG_SectPrContents_pgSz,
      N.LN_CT_PageSz_orient,
      new RTFValue(N.LN_Value_ST_PageOrientation_landscape),
    );
    return true;
  }
  const entry = geometry.get(name);
  if (!entry) return false;
  if (parameter !== undefined) {
    const [parent, child, global] = entry;
    if (global)
      putNestedAttribute(this["m_aDefaultSectionSprms"], parent, child, new RTFValue(parameter));
    putNestedAttribute(state.sectionSprms, parent, child, new RTFValue(parameter));
  }
  return true;
}
/** Binds captured native section references to the actual mapper/page-style owners in the atomic importer. Unsupported desktop section services are not synthesized. @param mapper - Actual mapper. @param sprms - Captured native properties. @returns Applied page-style identity and source restart. */
export function ApplyRtfSectionProperties(
  mapper: DomainMapper,
  sprms: RTFSprms,
): { name: string; numOffset?: number; continuous: boolean } {
  const attributes = new RTFSprms(),
    section = new RTFSprms();
  section.set(N.LN_CT_PPr_sectPr, new RTFValue(attributes, sprms));
  const properties = new RTFReferenceProperties(attributes, section);
  section.dispose();
  attributes.dispose();
  const context = mapper.impl.PushProperties(ContextType.CONTEXT_SECTION);
  try {
    if (!(context instanceof SectionPropertyMap)) throw new Error("assert(SectionPropertyMap)");
    mapper.props(properties);
    context.CloseSectionGroup(mapper.impl);
    const number = context["m_nPageNumber"];
    return {
      name: text(context.GetPageStyleName()),
      continuous: context["m_nBreakType"] === N.LN_Value_ST_SectionMark_continuous,
      ...(number < 0 ? {} : { numOffset: (number << 16) >> 16 }),
    };
  } finally {
    mapper.impl.PopProperties(ContextType.CONTEXT_SECTION);
    properties.dispose();
  }
}

/** Native generated section-type flag mapping. */
const sectionTypes = new Map<string, number>([
  ["sbknone", N.LN_Value_ST_SectionMark_continuous],
  ["sbkcol", N.LN_Value_ST_SectionMark_nextColumn],
  ["sbkpage", N.LN_Value_ST_SectionMark_nextPage],
  ["sbkeven", N.LN_Value_ST_SectionMark_evenPage],
  ["sbkodd", N.LN_Value_ST_SectionMark_oddPage],
]);

import { RTFKeyword } from "./rtfcontrolwords";
import { getSymbolData, type RTFSymbol } from "./rtftokenizer";
