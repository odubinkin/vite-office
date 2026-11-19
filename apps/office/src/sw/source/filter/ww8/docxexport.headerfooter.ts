/** @fileoverview Owns the native OOXML header/footer fragments and their section references. */
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { SwDoc } from "../../core/doc/doc";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import { DocxAttributeOutput } from "./docxattributeoutput";
import { DocxBookmarks } from "./docxattributeoutput.hyperlink";
import type { DocxExport } from "./docxexport";
import { WriteText } from "./docxexport.text";

const w = token("w");

/** Borrows the active native story format from a page variant. @param frame - Variant frame. @param header - Selects header rather than footer. @returns Active content owner or null. */
function storyFormat(frame: SwFrameFormat, header: boolean): SwFrameFormat | null {
  if (header) {
    const item = frame.GetHeader();
    return item.IsActive() ? item.GetHeaderFormat() : null;
  }
  const item = frame.GetFooter();
  return item.IsActive() ? item.GetFooterFormat() : null;
}

/** Section-level header/footer selection and original part-local output order. */
export class DocxHeaderFooterExport {
  private headers = 0;
  private footers = 0;
  private hasHeader = false;
  private hasFooter = false;
  private readonly bookmarks: DocxBookmarks;
  evenAndOddHeaders = false;

  /** Binds original package and main stream owners. @param exporter - Native exporter. @param document - Actual Writer document. @param documentSerializer - Owning main serializer. @returns Header/footer exporter. */
  constructor(
    private readonly exporter: DocxExport,
    document: SwDoc,
    private readonly documentSerializer: FastSerializerHelper,
  ) {
    this.bookmarks = new DocxBookmarks(document);
  }

  /** Records the document-wide setting using the even variants of sections actually emitted. @param page - Actual used page descriptor. @returns Nothing. */
  CheckEvenAndOddHeaders(page: SwPageDesc): void {
    const left = page.GetLeft();
    if (
      (!page.IsHeaderShared() && storyFormat(left, true)) ||
      (!page.IsFooterShared() && storyFormat(left, false))
    )
      this.evenAndOddHeaders = true;
  }

  /** Emits active default/even/first stories and clears previous next-page stories with blank parts. @param page - Current section's page descriptor. @param breakCode - Native break code. @returns Nothing. */
  WriteHeadersFooters(page: SwPageDesc, breakCode: number): void {
    for (const header of [true, false]) {
      const ordinary = storyFormat(page.GetMaster(), header);
      const shared = header ? page.IsHeaderShared() : page.IsFooterShared();
      const even = shared ? null : storyFormat(page.GetLeft(), header);
      const first = page.IsFirstShared() ? null : storyFormat(page.GetFirstMaster(), header);
      const clear = breakCode === 2 && (header ? this.hasHeader : this.hasFooter);
      if (header) this.hasHeader = Boolean(ordinary || even || first);
      else this.hasFooter = Boolean(ordinary || even || first);
      const evenPart = even ?? (this.evenAndOddHeaders ? ordinary : null);
      if (evenPart || (this.evenAndOddHeaders && clear))
        this.WriteHeaderFooter(evenPart, header, "even");
      if (ordinary || clear) this.WriteHeaderFooter(ordinary, header, "default");
      if (first || clear) this.WriteHeaderFooter(first, header, "first");
    }
  }

  /** Writes one standalone WordprocessingML story and its main-document relationship. @param frame - Actual active story or empty part. @param header - Header flag. @param type - Word page variant. @returns Nothing. */
  private WriteHeaderFooter(
    frame: SwFrameFormat | null,
    header: boolean,
    type: "even" | "default" | "first",
  ): void {
    const family = header ? "header" : "footer",
      path = family + (header ? ++this.headers : ++this.footers) + ".xml",
      root = token(header ? "hdr" : "ftr");
    const filter = this.exporter.GetFilter();
    const relation = filter.addRelation(
      this.documentSerializer.getOutputStream() as ZipFragmentStream,
      getRelationship(header ? Relationship.HEADER : Relationship.FOOTER),
      path,
    );
    const serializer = filter.openFragmentStreamWithSerializer(
      "word/" + path,
      "application/vnd.openxmlformats-officedocument.wordprocessingml." + family + "+xml",
    );
    const attributes = this.exporter.MainXmlNamespaces();
    try {
      serializer.startElementNS(w, root, attributes);
    } finally {
      attributes.dispose();
    }
    const output = new DocxAttributeOutput(this.exporter, serializer);
    try {
      const start = frame?.GetContent().GetContentIdx()?.GetNode();
      const content = start?.IsStartNode() ? start.GetNodes().GetSectionContent(start) : [];
      if (content.length) WriteText(output, content, this.bookmarks);
      else serializer.singleElementNS(w, token("p"));
      serializer.endElementNS(w, root);
      serializer.endDocument();
    } finally {
      output.dispose();
    }
    this.documentSerializer.singleElementNS(
      w,
      token(header ? "headerReference" : "footerReference"),
      FSNS(w, token("type")),
      type,
      FSNS(token("r"), token("id")),
      relation,
    );
  }
}
