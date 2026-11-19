/** @fileoverview Original SfxDocumentMetaData.cxx metadata accessors and reset responsibilities, executed on the same actual component receiver. */
import { SfxDocumentMetaData, literal } from "./SfxDocumentMetaData";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LanguageTag } from "../../../i18nlangtag/source/languagetag/languagetag.value";
import { DateTime as ToolsDateTime } from "../../../tools/source/datetime/datetime";
import { Converter } from "../../../sax/source/tools/converter";
import {
  textToDateTimeDefault,
  dateTimeToText,
  textToDuration,
  durationToText,
} from "./SfxDocumentMetaData.values";

/** Original Author read. @param this - Original document metadata receiver. @returns Owned text. */
export function getAuthor(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("meta:initial-creator");
}

/** Original Author assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setAuthor(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("meta:initial-creator");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Generator read. @param this - Original document metadata receiver. @returns Owned text. */
export function getGenerator(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("meta:generator");
}

/** Original Generator assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setGenerator(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("meta:generator");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Title read. @param this - Original document metadata receiver. @returns Owned text. */
export function getTitle(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:title");
}

/** Original Title assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setTitle(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:title");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Subject read. @param this - Original document metadata receiver. @returns Owned text. */
export function getSubject(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:subject");
}

/** Original Subject assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setSubject(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:subject");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Description read. @param this - Original document metadata receiver. @returns Owned text. */
export function getDescription(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:description");
}

/** Original Description assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setDescription(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:description");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original ModifiedBy read. @param this - Original document metadata receiver. @returns Owned text. */
export function getModifiedBy(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:creator");
}

/** Original ModifiedBy assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setModifiedBy(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:creator");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original PrintedBy read. @param this - Original document metadata receiver. @returns Owned text. */
export function getPrintedBy(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("meta:printed-by");
}

/** Original PrintedBy assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setPrintedBy(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("meta:printed-by");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Coverage read. @param this - Original document metadata receiver. @returns Owned text. */
export function getCoverage(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:coverage");
}

/** Original Coverage assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setCoverage(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:coverage");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Identifier read. @param this - Original document metadata receiver. @returns Owned text. */
export function getIdentifier(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:identifier");
}

/** Original Identifier assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setIdentifier(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:identifier");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Rights read. @param this - Original document metadata receiver. @returns Owned text. */
export function getRights(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:rights");
}

/** Original Rights assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setRights(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:rights");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Source read. @param this - Original document metadata receiver. @returns Owned text. */
export function getSource(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:source");
}

/** Original Source assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setSource(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:source");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original Type read. @param this - Original document metadata receiver. @returns Owned text. */
export function getType(this: SfxDocumentMetaData): OUString {
  return this.getMetaText("dc:type");
}

/** Original Type assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setType(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  const name = literal("dc:type");
  try {
    this.setMetaTextAndNotify(name, value);
  } finally {
    name.dispose();
  }
}

/** Original CreationDate conversion. @param this - Original document metadata receiver. @returns Scalar value. */
export function getCreationDate(this: SfxDocumentMetaData): DateTime {
  const text = this.getMetaText("meta:creation-date");
  try {
    return textToDateTimeDefault(text);
  } finally {
    text.dispose();
  }
}

/** Original CreationDate assignment. @param this - Original document metadata receiver. @param value - Native value. @returns Nothing. */
export function setCreationDate(this: SfxDocumentMetaData, value: Readonly<DateTime>): void {
  const name = literal("meta:creation-date"),
    text = dateTimeToText(value);
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    text.dispose();
    name.dispose();
  }
}

/** Original ModificationDate conversion. @param this - Original document metadata receiver. @returns Scalar value. */
export function getModificationDate(this: SfxDocumentMetaData): DateTime {
  const text = this.getMetaText("dc:date");
  try {
    return textToDateTimeDefault(text);
  } finally {
    text.dispose();
  }
}

/** Original ModificationDate assignment. @param this - Original document metadata receiver. @param value - Native value. @returns Nothing. */
export function setModificationDate(this: SfxDocumentMetaData, value: Readonly<DateTime>): void {
  const name = literal("dc:date"),
    text = dateTimeToText(value);
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    text.dispose();
    name.dispose();
  }
}

/** Original PrintDate conversion. @param this - Original document metadata receiver. @returns Scalar value. */
export function getPrintDate(this: SfxDocumentMetaData): DateTime {
  const text = this.getMetaText("meta:print-date");
  try {
    return textToDateTimeDefault(text);
  } finally {
    text.dispose();
  }
}

/** Original PrintDate assignment. @param this - Original document metadata receiver. @param value - Native value. @returns Nothing. */
export function setPrintDate(this: SfxDocumentMetaData, value: Readonly<DateTime>): void {
  const name = literal("meta:print-date"),
    text = dateTimeToText(value);
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    text.dispose();
    name.dispose();
  }
}

/** Original Keywords read. @param this - Original document metadata receiver. @returns Native sequence. */
export function getKeywords(this: SfxDocumentMetaData): Sequence<OUString> {
  return this.getMetaList("meta:keyword");
}

/** Original Keywords assignment. @param this - Original document metadata receiver. @param value - Native sequence. @returns Nothing. */
export function setKeywords(this: SfxDocumentMetaData, value: Readonly<Sequence<OUString>>): void {
  const name = literal("meta:keyword");
  try {
    if (this.setMetaList(name, value, null)) this.setModified(true);
  } finally {
    name.dispose();
  }
}

/** Original Contributor read. @param this - Original document metadata receiver. @returns Native sequence. */
export function getContributor(this: SfxDocumentMetaData): Sequence<OUString> {
  return this.getMetaList("dc:contributor");
}

/** Original Contributor assignment. @param this - Original document metadata receiver. @param value - Native sequence. @returns Nothing. */
export function setContributor(
  this: SfxDocumentMetaData,
  value: Readonly<Sequence<OUString>>,
): void {
  const name = literal("dc:contributor");
  try {
    if (this.setMetaList(name, value, null)) this.setModified(true);
  } finally {
    name.dispose();
  }
}

/** Original Publisher read. @param this - Original document metadata receiver. @returns Native sequence. */
export function getPublisher(this: SfxDocumentMetaData): Sequence<OUString> {
  return this.getMetaList("dc:publisher");
}

/** Original Publisher assignment. @param this - Original document metadata receiver. @param value - Native sequence. @returns Nothing. */
export function setPublisher(this: SfxDocumentMetaData, value: Readonly<Sequence<OUString>>): void {
  const name = literal("dc:publisher");
  try {
    if (this.setMetaList(name, value, null)) this.setModified(true);
  } finally {
    name.dispose();
  }
}

/** Original Relation read. @param this - Original document metadata receiver. @returns Native sequence. */
export function getRelation(this: SfxDocumentMetaData): Sequence<OUString> {
  return this.getMetaList("dc:relation");
}

/** Original Relation assignment. @param this - Original document metadata receiver. @param value - Native sequence. @returns Nothing. */
export function setRelation(this: SfxDocumentMetaData, value: Readonly<Sequence<OUString>>): void {
  const name = literal("dc:relation");
  try {
    if (this.setMetaList(name, value, null)) this.setModified(true);
  } finally {
    name.dispose();
  }
}

/** Original delayed TemplateName member read. @param this - Original document metadata receiver. @returns Owned text. */
export function getTemplateName(this: SfxDocumentMetaData): OUString {
  this.checkInit();
  return new OUString(this.m_TemplateName);
}

/** Original delayed TemplateName assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setTemplateName(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  this.checkInit();
  if (!this.m_TemplateName.equals(value)) {
    this.m_TemplateName.assign(value);
    this.setModified(true);
  }
}

/** Original delayed TemplateURL member read. @param this - Original document metadata receiver. @returns Owned text. */
export function getTemplateURL(this: SfxDocumentMetaData): OUString {
  this.checkInit();
  return new OUString(this.m_TemplateURL);
}

/** Original delayed TemplateURL assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setTemplateURL(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  this.checkInit();
  if (!this.m_TemplateURL.equals(value)) {
    this.m_TemplateURL.assign(value);
    this.setModified(true);
  }
}

/** Original delayed AutoloadURL member read. @param this - Original document metadata receiver. @returns Owned text. */
export function getAutoloadURL(this: SfxDocumentMetaData): OUString {
  this.checkInit();
  return new OUString(this.m_AutoloadURL);
}

/** Original delayed AutoloadURL assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setAutoloadURL(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  this.checkInit();
  if (!this.m_AutoloadURL.equals(value)) {
    this.m_AutoloadURL.assign(value);
    this.setModified(true);
  }
}

/** Original delayed DefaultTarget member read. @param this - Original document metadata receiver. @returns Owned text. */
export function getDefaultTarget(this: SfxDocumentMetaData): OUString {
  this.checkInit();
  return new OUString(this.m_DefaultTarget);
}

/** Original delayed DefaultTarget assignment. @param this - Original document metadata receiver. @param value - Native text. @returns Nothing. */
export function setDefaultTarget(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  this.checkInit();
  if (!this.m_DefaultTarget.equals(value)) {
    this.m_DefaultTarget.assign(value);
    this.setModified(true);
  }
}

/** Original language conversion. @param this - Original document metadata receiver. @returns Native locale. */
export function getLanguage(this: SfxDocumentMetaData): Locale {
  const text = this.getMetaText("dc:language");
  try {
    return LanguageTag.convertToLocale(text, false);
  } finally {
    text.dispose();
  }
}

/** Original language assignment. @param this - Original document metadata receiver. @param value - Native locale. @returns Nothing. */
export function setLanguage(this: SfxDocumentMetaData, value: Readonly<Locale>): void {
  const text = LanguageTag.convertToBcp47(value, false),
    name = literal("dc:language");
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    name.dispose();
    text.dispose();
  }
}

/** Original template scalar read. @param this - Original document metadata receiver. @returns Value copy. */
export function getTemplateDate(this: SfxDocumentMetaData): DateTime {
  this.checkInit();
  return new DateTime(this.m_TemplateDate);
}

/** Original template scalar assignment. @param this - Original document metadata receiver. @param value - Source scalar. @returns Nothing. */
export function setTemplateDate(this: SfxDocumentMetaData, value: Readonly<DateTime>): void {
  this.checkInit();
  if (!this.m_TemplateDate.equals(value)) {
    this.m_TemplateDate.assign(value);
    this.setModified(true);
  }
}

/** Original delay read. @param this - Original document metadata receiver. @returns Seconds. */
export function getAutoloadSecs(this: SfxDocumentMetaData): number {
  this.checkInit();
  return this.m_AutoloadSecs;
}

/** Original negative check precedes initialization check. @param this - Original document metadata receiver. @param value - Seconds. @returns Nothing. */
export function setAutoloadSecs(this: SfxDocumentMetaData, value: number): void {
  if (value < 0) this.illegal("SfxDocumentMetaData::setAutoloadSecs: argument is negative");
  this.checkInit();
  if (this.m_AutoloadSecs !== value) {
    this.m_AutoloadSecs = value;
    this.setModified(true);
  }
}

/** Original bounded editing-cycle parsing. @param this - Original document metadata receiver. @returns Signed16 value or0. */
export function getEditingCycles(this: SfxDocumentMetaData): number {
  const text = this.getMetaText("meta:editing-cycles"),
    output: [number] = [0];
  try {
    return Converter.convertNumber(output, text.subView(0), 0, 32767) ? (output[0] as number) : 0;
  } finally {
    text.dispose();
  }
}

/** Original signed negative admission. @param this - Original document metadata receiver. @param value - Signed16 cycles. @returns Nothing. */
export function setEditingCycles(this: SfxDocumentMetaData, value: number): void {
  if (value < 0) this.illegal("SfxDocumentMetaData::setEditingCycles: argument is negative");
  const name = literal("meta:editing-cycles"),
    text = new OUString(OUString.number(value));
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    text.dispose();
    name.dispose();
  }
}

/** Original editing duration read. @param this - Original document metadata receiver. @returns Signed32 seconds. */
export function getEditingDuration(this: SfxDocumentMetaData): number {
  const text = this.getMetaText("meta:editing-duration");
  try {
    return textToDuration(text);
  } finally {
    text.dispose();
  }
}

/** Original editing duration assignment. @param this - Original document metadata receiver. @param value - Signed32 seconds. @returns Nothing. */
export function setEditingDuration(this: SfxDocumentMetaData, value: number): void {
  if (value < 0) this.illegal("SfxDocumentMetaData::setEditingDuration: argument is negative");
  const name = literal("meta:editing-duration"),
    text = durationToText(value);
  try {
    this.setMetaTextAndNotify(name, text);
  } finally {
    text.dispose();
    name.dispose();
  }
}

/** Original user reset uses the actual shared local platform clock and source defaults. @param this - Original document metadata receiver. @param value - Author. @returns Nothing. */
export function resetUserData(this: SfxDocumentMetaData, value: OUStringConstReference): void {
  let modified = false;
  const now = new ToolsDateTime(ToolsDateTime.SYSTEM).GetUNODateTime(),
    date = dateTimeToText(now),
    empty = new OUString(),
    invalid = dateTimeToText(new DateTime()),
    duration = durationToText(0),
    one = literal("1");
  try {
    for (const [name, text] of [
      ["meta:initial-creator", value],
      ["meta:creation-date", date],
      ["dc:creator", empty],
      ["meta:printed-by", empty],
      ["dc:date", invalid],
      ["meta:print-date", invalid],
      ["meta:editing-duration", duration],
      ["meta:editing-cycles", one],
    ] as const) {
      const key = literal(name);
      try {
        modified = this.setMetaText(key, text) || modified;
      } finally {
        key.dispose();
      }
    }
  } finally {
    one.dispose();
    duration.dispose();
    invalid.dispose();
    empty.dispose();
    date.dispose();
  }
  if (modified) this.setModified(true);
}
