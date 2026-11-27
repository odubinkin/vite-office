/** @fileoverview Native named Writer reference fields from reffld.cxx. */
import { RedlineType } from "../../../../svx/inc/ctredlin";
import type { SwField } from "../../../inc/fldbas";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import type { SwDoc } from "../doc/doc";
import type { SwTextNode } from "../txtnode/ndtxt";
import { GetTextNodeExpandedText } from "../txtnode/ndtxt-hints";

/** Native reference field values consumed by the named field sources. */
export interface SwGetRefFieldData {
  readonly name: string;
  readonly format: RefFieldFormat;
  readonly source: ReferencesSubtype.SetRefAttr | ReferencesSubtype.Bookmark;
  readonly language: string;
  readonly flags: number;
  readonly presentation: string;
}

/** Original document field type and named target lookup. */
export class SwGetRefFieldType {
  /** Binds the field type to the original document. @param document - Writer model. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the actual field type owner. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Updates the native reference instances in document order. */
  public UpdateGetReferences(): void {
    for (const node of this.document.GetNodes().entries()) {
      const text = node.GetTextNode();
      const fields = text?.GetpSwpHints()?.GetReferenceFields();
      if (!fields?.length) continue;
      let changed = false;
      for (const hint of fields) {
        const field = hint.GetAttr().GetField();
        const before = field.Expand();
        field.UpdateField();
        changed ||= before !== field.Expand();
      }
      if (changed)
        this.document.NotifyModelChange({
          kind: "node-content-changed",
          nodeIndex: node.GetIndex(),
        });
    }
  }

  /** Resolves a reference mark or bookmark in the native document. @param name - Reference target. @param source - Original named source category. @returns Target paragraph and offsets. */
  public FindAnchor(
    name: string,
    source: SwGetRefFieldData["source"],
  ): { node: SwTextNode; start: number; end: number } | undefined {
    if (source === ReferencesSubtype.SetRefAttr) {
      const hint = this.document.GetRefMark(name)?.GetTextRefMark();
      const node = hint?.GetTextNode();
      if (node && hint) return { node, start: hint.GetStart(), end: hint.GetAnyEnd() };
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

  /** Initializes the original named source and imported expansion. @param type - Native document field type. @param data - Imported values. */
  public constructor(
    private readonly type: SwGetRefFieldType,
    private readonly data: SwGetRefFieldData,
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

  /** Applies native text-reference expansion to the represented, unpaginated source. */
  public UpdateField(): void {
    if (this.data.format !== RefFieldFormat.Content) return;
    const anchor = this.type.FindAnchor(this.data.name, this.data.source);
    if (!anchor) {
      this.m_sText = "Error: Reference source not found";
      return;
    }
    const { node, start, end } = anchor;
    const document = this.type.GetDoc();
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
  }

  /** Releases the value-only native field. */
  public Dispose(): void {}
}
