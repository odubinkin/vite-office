/** @fileoverview Native named Writer reference fields from reffld.cxx. */
import { RedlineType } from "../../../../svx/inc/ctredlin";
import { LANGUAGE_HUNGARIAN } from "../../../../i18nlangtag/inc/lang";
import type { SwField } from "../../../inc/fldbas";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import { SwChapterField, SwChapterFormat } from "./chpfld";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";
import type { SwRootFrame } from "../layout/newfrm";
import type { SwDoc } from "../doc/doc";
import type { SwTextNode } from "../txtnode/ndtxt";
import { GetTextNodeExpandedText } from "../txtnode/ndtxt-hints";

/** Applies the original Hungarian reference article for text and numbering. @param text - Reference expansion. @param language - Native language of the field anchor. @param referenceLanguage - Authored reference language and case. @returns Localized expansion. */
function formatReferenceLanguage(
  text: string,
  language: number,
  referenceLanguage: string,
): string {
  if (language !== LANGUAGE_HUNGARIAN || (referenceLanguage !== "hu" && referenceLanguage !== "Hu"))
    return text;
  const numbering = text.replace(/^[^\p{Letter}\p{Decimal_Number}]*/u, "");
  if (/^(?:A|Az|a|az) /.test(numbering)) return text;
  const digits = numbering.match(/^\p{Decimal_Number}+/u)?.[0];
  const letters = numbering.match(/^\p{Letter}+/u)?.[0] ?? "";
  let articleAz = false;
  if (digits) {
    articleAz =
      (digits.startsWith("1") && [1, 4, 7, 10].includes(digits.length)) || digits.startsWith("5");
  } else if (letters.length === 1 && letters.charCodeAt(0) < 128) {
    articleAz = /^[aefilmnorsuyv]$/i.test(letters);
  } else if (letters) {
    const roman = letters.replace(/[A-Ha-h]$/, "");
    const isRoman =
      letters.length > 1 &&
      (letters.length + 1 >= numbering.length || numbering[letters.length] === ".") &&
      (/^[ivxlc]+$/.test(roman) || /^[IVXLC]+$/.test(roman));
    articleAz = isRoman
      ? /^(?:i[^ivx]|I[^IVX]|v[^i]|V[^I]|l[^x]|L[^X])/.test(letters)
      : /^[aáeéiíoóöőuúüű]/i.test(letters);
  }
  const article = referenceLanguage === "hu" ? "a" : "A";
  return `${article}${articleAz ? "z" : ""} ${text}`;
}

/** Native reference field values consumed by the named field sources. */
export interface SwGetRefFieldData {
  readonly name: string;
  readonly format: RefFieldFormat;
  readonly source:
    ReferencesSubtype.SetRefAttr | ReferencesSubtype.Bookmark | ReferencesSubtype.SequenceField;
  readonly sequenceNumber?: number;
  readonly language: string;
  readonly flags: number;
  readonly presentation: string;
}

/** Original document field type and named target lookup. */
export class SwGetRefFieldType {
  /** Binds the field type to the original document. @param document - Writer model. @returns The initialized SwGetRefFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the actual field type owner. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Updates the native reference instances in document order. @returns Nothing. */
  public UpdateGetReferences(): void {
    for (const node of this.document.GetNodes().entries()) {
      const text = node.GetTextNode();
      const fields = text?.GetpSwpHints()?.GetReferenceFields();
      if (!text || !fields?.length) continue;
      let changed = false;
      for (const hint of fields) {
        const field = hint.GetAttr().GetField();
        const before = field.Expand();
        field.UpdateField(undefined, text.GetLang(hint.GetStart()));
        changed ||= before !== field.Expand();
      }
      if (changed)
        this.document.NotifyModelChange({
          kind: "node-content-changed",
          nodeIndex: node.GetIndex(),
        });
    }
  }

  /** Updates references after their target frames and sequence fields have been formatted. @param layout - Current Writer root. @returns Nothing. */
  public UpdateLayoutFields(layout: SwRootFrame): void {
    for (const node of this.document.GetNodes().entries()) {
      const text = node.GetTextNode();
      if (!text) continue;
      const fields = text.GetpSwpHints()?.GetReferenceFields() ?? [];
      for (const hint of fields) {
        const field = hint.GetAttr().GetField();
        if (
          field.GetFormat() === RefFieldFormat.Chapter ||
          field.GetData().source === ReferencesSubtype.SequenceField
        )
          field.UpdateField(layout, text.GetLang(hint.GetStart()));
      }
    }
  }

  /** Resolves a reference mark or bookmark in the native document. @param name - Reference target. @param source - Original named source category. @param sequenceNumber - Native sequence reference identity. @returns Target paragraph and offsets. */
  public FindAnchor(
    name: string,
    source: SwGetRefFieldData["source"],
    sequenceNumber = 0,
  ): { node: SwTextNode; start: number; end: number } | undefined {
    if (source === ReferencesSubtype.SetRefAttr) {
      const hint = this.document.GetRefMark(name)?.GetTextRefMark();
      const node = hint?.GetTextNode();
      if (node && hint) return { node, start: hint.GetStart(), end: hint.GetAnyEnd() };
      return undefined;
    }
    if (source === ReferencesSubtype.SequenceField) {
      for (const node of this.document.GetNodes().entries()) {
        const text = node.GetTextNode();
        if (!text) continue;
        for (const hint of text.GetpSwpHints()?.GetSequenceFields() ?? []) {
          const field = hint.GetAttr().GetField();
          if (field.GetTyp().GetName() === name && field.GetSeqNumber() === sequenceNumber)
            return { node: text, start: hint.GetStart(), end: hint.GetStart() + 1 };
        }
      }
      return undefined;
    }
    const mark = this.document.GetIDocumentMarkAccess().FindMark(name);
    if (!mark) return undefined;
    const start = mark.GetMarkStart();
    const end = mark.GetMarkEnd();
    const node = start.GetNode().GetTextNode();
    if (!node) return undefined;
    return {
      node,
      start: start.GetContentIndex(),
      end: end.GetNode() === node ? end.GetContentIndex() : node.Len(),
    };
  }
}

/** Owns source, display format and the remembered text of a Writer GetReference field. */
export class SwGetRefField implements SwField<SwGetRefField> {
  private m_sText: string;

  /** Initializes the original named source and imported expansion. @param type - Native document field type. @param data - Imported values. @returns The initialized SwGetRefField instance. */
  public constructor(
    private readonly type: SwGetRefFieldType,
    private data: SwGetRefFieldData,
  ) {
    this.m_sText = data.presentation;
  }

  /** Borrows the document's actual reference type. @returns Native field type. */
  public GetTyp(): SwGetRefFieldType {
    return this.type;
  }

  /** Supplies the original cached expansion. @returns Presentation. */
  public Expand(): string {
    return this.m_sText;
  }

  /** Returns the original reference presentation format. @returns Native format. */
  public GetFormat(): RefFieldFormat {
    return this.data.format;
  }

  /** Sets the native name of a resolved sequence target. @param name - Native sequence master name. @returns Nothing. */
  public SetSetRefName(name: string): void {
    this.data = { ...this.data, name };
  }

  /** Sets the source identity of a resolved sequence target. @param id - UNO sequence identity. @returns Nothing. */
  public SetSeqNo(id: number): void {
    this.data = { ...this.data, sequenceNumber: id & 0xffff };
  }

  /** Returns independent native field data for the filter. @returns Field settings and presentation. */
  public GetData(): SwGetRefFieldData {
    return { ...this.data, presentation: this.m_sText };
  }

  /** Copies the field without the text-attribute owner. @returns Native field. */
  public Copy(): SwGetRefField {
    return new SwGetRefField(this.type, this.GetData());
  }

  /** Copies the field to the target document's system reference type. @param document - Target document. @returns Native field. */
  public CopyToDocument(document: SwDoc): SwGetRefField {
    return new SwGetRefField(
      document.getIDocumentFieldsAccess().GetReferenceFieldType(),
      this.GetData(),
    );
  }

  /** Updates the requested native reference expansion. @param layout - Formatted root for layout-dependent references. @param language - Native language of the reference field anchor. @returns Nothing. */
  public UpdateField(layout?: SwRootFrame, language = 0): void {
    const chapter = this.data.format === RefFieldFormat.Chapter;
    const sequence = this.data.source === ReferencesSubtype.SequenceField;
    const page =
      sequence &&
      (this.data.format === RefFieldFormat.Page || this.data.format === RefFieldFormat.AsPageStyle);
    const sequenceText =
      sequence &&
      (this.data.format === RefFieldFormat.CategoryAndNumber ||
        this.data.format === RefFieldFormat.CaptionText ||
        this.data.format === RefFieldFormat.Numbering);
    if (
      this.data.format !== RefFieldFormat.Content &&
      !sequenceText &&
      !((chapter || page) && layout)
    )
      return;
    const anchor = this.type.FindAnchor(this.data.name, this.data.source, this.data.sequenceNumber);
    if (!anchor) {
      this.m_sText = "Error: Reference source not found";
      return;
    }
    const { node } = anchor;
    let { start, end } = anchor;
    const document = this.type.GetDoc();
    if (page && layout) {
      const pages = layout.GetFormattedPages();
      const frame =
        pages[layout.FindPageIndexAt(node, start)] ?? pages[layout.FindPageIndexAt(node, 0)];
      const style =
        frame && this.data.format === RefFieldFormat.AsPageStyle
          ? document.FindPageDesc(frame.descriptor.name)
          : undefined;
      this.m_sText = frame
        ? formatReferenceLanguage(
            style?.GetNumType().GetNumStr(frame.number) ?? String(frame.number),
            language,
            this.data.language,
          )
        : "";
      return;
    }
    if (chapter && layout) {
      this.m_sText = "";
      if (node.getLayoutFrame(layout)) {
        const field = new SwChapterField(
          document.getIDocumentFieldsAccess().GetChapterFieldType(),
          SwChapterFormat.Number,
          WRITER_MAX_LIST_LEVEL,
        );
        field.ChangeExpansion(node, true, layout);
        this.m_sText = formatReferenceLanguage(field.GetNumber(), language, this.data.language);
      }
      return;
    }
    if (sequence) {
      const text = node.GetText();
      const category = text.indexOf(this.data.name);
      const categoryEnd = category < 0 ? -1 : category + this.data.name.length;
      switch (this.data.format) {
        case RefFieldFormat.Content:
          start = 0;
          end = text.length;
          break;
        case RefFieldFormat.CategoryAndNumber:
          if (category >= 0) {
            start = Math.min(start, category);
            end = Math.max(end, categoryEnd);
          }
          break;
        case RefFieldFormat.CaptionText:
          start = Math.max(end, categoryEnd);
          if (start < text.length && !/^[\p{Letter}\p{Number}]/u.test(text.slice(start))) {
            ++start;
            while (text[start] === " " || text[start] === "\t") ++start;
          }
          end = text.length;
          break;
      }
    }
    let from = start;
    let result = "";
    for (const change of document.GetIDocumentRedlineAccess().GetRedlineTable().entries()) {
      if (!change.HasMark() || change.GetRedlineData().GetType() !== RedlineType.Delete) continue;
      const first = change.Start();
      const last = change.End();
      if (first.GetNode().GetIndex() > node.GetIndex()) break;
      if (last.GetNode().GetIndex() < node.GetIndex()) continue;
      const left = first.GetNode() === node ? first.GetContentIndex() : 0;
      const right = last.GetNode() === node ? last.GetContentIndex() : node.Len();
      if (right <= from || left >= end) continue;
      if (left > from) result += GetTextNodeExpandedText(node, from, left);
      from = Math.min(right, end);
    }
    result += GetTextNodeExpandedText(node, from, end);
    if (!result) result = GetTextNodeExpandedText(node, start, end);
    this.m_sText = "";
    for (const character of result) {
      if (character === "\u00ad") continue;
      this.m_sText += character < " " ? " " : character === "\u2011" ? "-" : character;
    }
    if (result) this.m_sText = formatReferenceLanguage(this.m_sText, language, this.data.language);
  }

  /** Releases the value-only native field. @returns Nothing. */
  public Dispose(): void {}
}
