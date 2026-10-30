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
/** Captures the previous section's original sprms at sectBreak, before the current group can pop. @param this - Actual reader. @param state - Current parser state. @param final - Original final-section selector. @returns Nothing. */
export function CaptureSection(this: RtfDocumentImplContext, state: RtfState, final = false): void {
  const sections = this["m_aSectionSprms"],
    id = this["currentSection"];
  sections.get(id)?.dispose();
  const captured = new RTFSprms(state.sectionSprms);
  if (final && !this["m_bHadSect"]) {
    const type = captured.find(N.LN_EG_SectPrContents_type);
    try {
      if (type.get()?.getInt() === N.LN_Value_ST_SectionMark_continuous)
        captured.erase(N.LN_EG_SectPrContents_type);
    } finally {
      type.dispose();
    }
  }
  sections.set(id, captured);
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
    if (this["runs"].length > 0 || this["m_bNeedPar"]) this["CommitParagraph"](state);
    this["FlushTable"]();
    CaptureSection.call(this, state);
    this["currentSection"]++;
    this["m_bNeedPar"] = true;
    this["terminatedParagraph"] = true;
    return true;
  }
  const type = sectionTypes.get(name);
  if (type !== undefined) {
    state.sectionSprms.set(N.LN_EG_SectPrContents_type, new RTFValue(type));
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
