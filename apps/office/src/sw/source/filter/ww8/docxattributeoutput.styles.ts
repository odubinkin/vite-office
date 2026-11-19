/** @fileoverview Native MSWordStyles traversal and the represented DocxAttributeOutput style properties. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import type { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { ParaTabStop } from "./docxattributeoutput.tabs";
import { FSNS } from "../../../../sax/inc/fshelper";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_GRABBAG,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import type { SwFormat } from "../../core/attr/format";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { OutputStyleParagraphProperties } from "./docxattributeoutput.paragraph";
import { OutputItem } from "./docxexport.text";
import type { MSWordStyles } from "./wrtw8sty";

const w = token("w");
const val = FSNS(w, token("val"));

/** Writes the native style slots in Word's order. Reserved empty slots have no DOCX element. @param output - Native DOCX attribute output. @param styles - Shared Word style table. @returns Nothing. */
export function OutputStylesTable(output: DocxAttributeOutput, styles: MSWordStyles): void {
  const owner = output.GetExport();
  owner.m_bStyDef = true;
  try {
    DocDefaults(output);
    const slots = styles.GetStyles();
    for (let slot = 0; slot < slots.length; ++slot) {
      const style = slots[slot];
      if (style !== undefined) OutputStyle(output, styles, style, slot);
    }
  } finally {
    owner.m_bStyDef = false;
  }
}

/** Writes the represented native run-default items before the named styles. @param output - Attribute output. @returns Nothing. */
function DocDefaults(output: DocxAttributeOutput): void {
  const owner = output.GetExport();
  const document = owner.m_rDoc;
  const tabs = document.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem;
  const defaultOnly = tabs.Count() === 1 && tabs.At(0).GetAdjustment() === SvxTabAdjust.Default;
  if (defaultOnly) ParaTabStop(output, tabs);
  const explicitTabs = tabs.Count() !== 0 && !defaultOnly;
  const pool = document.GetAttrPool();
  const items = [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_GRABBAG].map(
    /** Reads represented document-default items in native Which order. @param which - Original WhichId. @returns User default or null. */
    (which) => pool.GetUserDefaultItem(which),
  );
  for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CTL_FONTSIZE]) {
    const height = pool.GetUserDefaultItem(which) as SvxFontHeightItem | undefined;
    if (height && height.GetHeight() !== 200) items.push(height);
  }
  const hasRunDefaults = items.some(Boolean);
  if (!hasRunDefaults && !explicitTabs) return;
  const serializer = output.GetSerializer();
  serializer.startElementNS(w, token("docDefaults"));
  if (hasRunDefaults) {
    serializer.startElementNS(w, token("rPrDefault"));
    serializer.startElementNS(w, token("rPr"));
    output.InitCollectedRunProperties();
    for (const item of items) if (item) OutputItem(output, item);
    output.WriteCollectedRunProperties();
    serializer.mergeTopMarks(11);
    serializer.endElementNS(w, token("rPr"));
    serializer.endElementNS(w, token("rPrDefault"));
  }
  if (explicitTabs) {
    serializer.startElementNS(w, token("pPrDefault"));
    serializer.startElementNS(w, token("pPr"));
    ParaTabStop(output, tabs);
    serializer.endElementNS(w, token("pPr"));
    serializer.endElementNS(w, token("pPrDefault"));
  }
  serializer.endElementNS(w, token("docDefaults"));
}

/** Writes a named format's represented identity, relationships and direct properties. @param output - Native DOCX attribute output. @param styles - Shared Word style table. @param style - Native named format. @param slot - Word slot. @returns Nothing. */
function OutputStyle(
  output: DocxAttributeOutput,
  styles: MSWordStyles,
  style: SwFormat,
  slot: number,
): void {
  const paragraph = style instanceof SwTextFormatColl;
  const serializer = output.GetSerializer();
  const id = styles.GetStyleId(slot);
  const attributes = [
    FSNS(w, token("type")),
    paragraph ? "paragraph" : "character",
    FSNS(w, token("styleId")),
    id,
  ];
  if (slot === 0) attributes.push(FSNS(w, token("default")), "1");
  serializer.startElementNS(w, token("style"), ...attributes);
  serializer.singleElementNS(w, token("name"), val, styles.GetWWName(style));
  const base = style.IsDefault() ? 0x0fff : styles.GetSlot(style.DerivedFrom());
  if (base !== 0x0fff)
    serializer.singleElementNS(w, token("basedOn"), val, styles.GetStyleId(base));
  if (paragraph) {
    const next = styles.GetSlot(style.GetNextTextFormatColl());
    if (next !== slot && next !== 0x0fff)
      serializer.singleElementNS(w, token("next"), val, styles.GetStyleId(next));
  }
  if (style.IsAutoUpdateOnDirectFormat()) serializer.singleElementNS(w, token("autoRedefine"));
  if (style.IsFavourite() === true) serializer.singleElementNS(w, token("qFormat"));

  const owner = output.GetExport();
  owner.m_pCurrentStyle = style;
  try {
    if (paragraph) OutputStyleParagraphProperties(output, style);
    serializer.startElementNS(w, token("rPr"));
    output.InitCollectedRunProperties();
    for (const item of style.GetAttrSet().entries()) OutputItem(output, item);
    output.WriteCollectedRunProperties();
    serializer.mergeTopMarks(11);
    serializer.endElementNS(w, token("rPr"));
  } finally {
    owner.m_pCurrentStyle = undefined;
  }
  serializer.endElementNS(w, token("style"));
}
