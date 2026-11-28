/** @fileoverview Writer's document statistic cache, node counting and document properties projection. */
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { isAnnotationTextField } from "../../../inc/txtfld";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue,
} from "../../../../udkapi/com/sun/star/beans/NamedValue";
import type { SfxDocumentMetaData } from "../../../../sfx2/source/doc/SfxDocumentMetaData";
import { SwTableNode } from "../docnode/node";
import { CountWords } from "../txtnode/txtedt";
import type { SwDoc } from "./doc";
import { SwDocStat } from "./docstat";

const properties = [
  ["TableCount", "table-count", "nTable"],
  ["ImageCount", "image-count", "nGrf"],
  ["ObjectCount", "object-count", "nOLE"],
  ["PageCount", "page-count", "nPage"],
  ["ParagraphCount", "paragraph-count", "nPara"],
  ["WordCount", "word-count", "nWord"],
  ["CharacterCount", "character-count", "nChar"],
  ["NonWhitespaceCharacterCount", "non-whitespace-character-count", "nCharExcludingSpaces"],
] as const;

/** Owns the imported or calculated native SwDocStat. */
export class DocumentStatisticsManager {
  private stat = new SwDocStat();
  private initialized = false;
  private transferPageCount: number | undefined;
  private revision = -1;

  /** Binds the original document node and layout owners. @param document - Canonical Writer model. @returns The initialized DocumentStatisticsManager instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the latest native counts without forcing calculation. @returns Native cache. */
  public GetDocStat(): Readonly<SwDocStat> {
    return this.stat;
  }

  /** Reads the actual view page count for Worker transport. @returns Physical count when a view has formatted. */
  public GetLayoutPageCount(): number | undefined {
    return (
      this.document.getIDocumentLayoutAccess().GetCurrentLayout()?.GetPageNum() ??
      this.transferPageCount
    );
  }

  /** Restores the originating view's physical count in a DOM-free Worker. @param count - Measured originating page count. @returns Nothing. */
  public SetLayoutPageCount(count: number): void {
    this.transferPageCount = count;
  }

  /** Sets the original native counts from document properties or transfer. @param stat - Original count state. @returns Nothing. */
  public SetDocStat(stat: Readonly<SwDocStat>): void {
    this.stat = { ...stat };
    this.initialized = true;
    this.revision = this.document.GetDocumentStateManager().GetModelRevision();
  }

  /** Imports the accepted UNO document statistics in their original unsigned storage. @param owner - Loaded properties. @returns Nothing. */
  public SetStatistics(owner: SfxDocumentMetaData): void {
    const sequence = owner.getDocumentStatistics();
    const next = { ...this.stat };
    let found = false;
    try {
      for (let index = 0; index < sequence.getLength(); ++index) {
        const item = NamedValue.unacquired(
          sequence.operatorIndex(index) as unknown as Parameters<typeof NamedValue.unacquired>[0],
        );
        const name = text(item.Name);
        const entry = properties.find(
          /** Matches the UNO statistic name. @param property - Original property mapping. @returns Match. */
          ([key]) => key === name,
        );
        const value: [number] = [0];
        if (entry && Any.prototype.extract.call(item.Value as Any, value, "sal_Int32")) {
          next[entry[2]] = value[0] >>> 0;
          found = true;
        }
      }
    } finally {
      sequence.dispose();
    }
    if (found) this.SetDocStat(next);
  }

  /** Counts the original roots and text owners synchronously for ODT export. @returns Current statistics. */
  public GetUpdatedDocStat(): Readonly<SwDocStat> {
    const revision = this.document.GetDocumentStateManager().GetModelRevision();
    const pageCount = this.GetLayoutPageCount() ?? 0;
    if (this.initialized && !this.stat.bModified && this.revision === revision) {
      this.stat.nPage = pageCount;
      return this.stat;
    }
    const next = new SwDocStat();
    next.nPara = 0;
    next.nComments = this.stat.nComments;
    const nodes = this.document.GetNodes();
    const redlines = nodes.GetEndOfRedlines();
    for (let index = nodes.Count() - 1; index > 0; --index) {
      const node = nodes.at(index);
      if (node instanceof SwTableNode) ++next.nTable;
      else if (node.GetGrfNode()) ++next.nGrf;
      else {
        const paragraph = node.GetTextNode();
        if (!paragraph) continue;
        if (index > redlines.StartOfSectionNode().GetIndex() && index < redlines.GetIndex())
          continue;
        CountWords(paragraph, next);
        const hints = paragraph.GetpSwpHints();
        if (!hints) continue;
        for (
          let position = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
          position < hints.Count();
          ++position
        ) {
          const hint = hints.GetSortedByWhichAndStart(position);
          if (!isAnnotationTextField(hint)) break;
          next.nAllPara += hint.GetAttr().GetField().GetTextObject()?.GetParagraphCount() ?? 1;
        }
      }
    }
    next.nPage = pageCount;
    next.bModified = false;
    this.SetDocStat(next);
    return this.stat;
  }

  /** Projects the native physical page count for a PageCount field. @returns Page count. */
  public GetPageCount(): number {
    this.stat.nPage = this.GetLayoutPageCount() ?? this.stat.nPage;
    return this.stat.nPage;
  }

  /** Updates the UNO document properties without marking the Writer model modified. @param owner - Existing Sfx metadata. @returns Nothing. */
  public StoreStatistics(owner: SfxDocumentMetaData): void {
    const values: NamedValue[] = [];
    try {
      for (const [name, , key] of properties) {
        if (key === "nPage" && !this.stat.nPage) continue;
        const label = unicode(name);
        const value = new Any([this.stat[key] | 0], "sal_Int32");
        try {
          values.push(new NamedValue(label, value));
        } finally {
          value.dispose();
          label.dispose();
        }
      }
      const SequenceType = Sequence.specialize<NamedValue>(cppu_detail_getUnoType_NamedValue, 32);
      const sequence = new SequenceType(
        {
          /** Reads the borrowed statistic at the native offset. @param offset - Byte offset. @returns Original value. */
          get(offset: number) {
            return values[offset / 32] as NamedValue;
          },
        },
        values.length,
      );
      try {
        owner.setDocumentStatistics(sequence);
      } finally {
        sequence.dispose();
      }
    } finally {
      for (const value of values) value.dispose();
    }
  }

  /** Returns the same metadata attributes for the synchronous package path without an existing metadata DOM. @returns ODF document-statistic element. */
  public ExportStatistics(): string {
    const attributes = properties
      .filter(
        /** Omits unknown physical pagination. @param property - Statistic mapping. @returns Whether published. */
        ([, , key]) => key !== "nPage" || this.stat.nPage !== 0,
      )
      .map(
        /** Writes the original signed UNO representation. @param property - Statistic mapping. @returns Attribute. */
        ([, name, key]) => ` meta:${name}="${this.stat[key] | 0}"`,
      )
      .join("");
    return `<meta:document-statistic${attributes}/>`;
  }
}
