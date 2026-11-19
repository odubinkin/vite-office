/** @fileoverview Native DOCX hyperlinks, hyperlink fields and bookmark boundaries. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { Relationship, getRelationship } from "../../../../oox/source/token/relationship";
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FSNS, FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { SwDoc } from "../../core/doc/doc";
import type { SwNode } from "../../core/docnode/node";
import type { SwPosition } from "../../core/crsr/pam";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { BookmarkToWriter } from "./wrtw8nds";

const w = token("w");

/** Emits one native field-control run. @param output - DOCX attributes. @param type - Word field phase. @returns Nothing. */
function WriteFieldChar(output: DocxAttributeOutput, type: string): void {
  const serializer = output.GetSerializer(),
    run = token("r");
  serializer.startElementNS(w, run);
  serializer.singleElementNS(w, token("fldChar"), FSNS(w, token("fldCharType")), type);
  serializer.endElementNS(w, run);
}

/** Starts a native relationship hyperlink or the external-fragment HYPERLINK field. @param output - DOCX attributes. @param link - Native Internet format. @returns Whether represented as a field. */
export function StartURL(output: DocxAttributeOutput, link: WriterHyperlink): boolean {
  const serializer = output.GetSerializer();
  const owner = output.GetExport();
  const hash = link.url.indexOf("#");
  const bookmarkOnly = hash === 0 && link.url.length > 1;
  const url = hash > 0 ? link.url.slice(0, hash) : link.url;
  const mark = bookmarkOnly
    ? owner.BookmarkToWord(BookmarkToWriter(link.url.slice(1)))
    : hash > 0
      ? link.url.slice(hash + 1)
      : "";
  if (mark && !bookmarkOnly && !link.targetFrame) {
    WriteFieldChar(output, "begin");
    serializer.startElementNS(w, token("r"));
    serializer.startElementNS(
      w,
      token("instrText"),
      FSNS(token("xml"), token("space")),
      "preserve",
    );
    serializer.writeEscaped(` HYPERLINK "${url}" \\l "${mark}"`);
    serializer.endElementNS(w, token("instrText"));
    serializer.endElementNS(w, token("r"));
    WriteFieldChar(output, "separate");
    return true;
  }
  const attributes = FastSerializerHelper.createAttrList();
  try {
    if (!bookmarkOnly) {
      const id = owner
        .GetFilter()
        .addRelation(
          serializer.getOutputStream() as ZipFragmentStream,
          getRelationship(Relationship.HYPERLINK),
          url,
          true,
        );
      attributes.operatorArrow().add(FSNS(token("r"), token("id")), id);
    }
    if (mark) attributes.operatorArrow().add(FSNS(w, token("anchor")), mark.replaceAll(" ", "_"));
    if (link.targetFrame)
      attributes.operatorArrow().add(FSNS(w, token("tgtFrame")), link.targetFrame);
    else if (link.name) attributes.operatorArrow().add(FSNS(w, token("tooltip")), link.name);
    serializer.startElementNS(w, token("hyperlink"), attributes);
  } finally {
    attributes.dispose();
  }
  return false;
}

/** Ends the active hyperlink representation after the result run. @param output - DOCX attributes. @param field - Complex field flag. @returns Nothing. */
export function EndURL(output: DocxAttributeOutput, field: boolean): void {
  if (field) WriteFieldChar(output, "end");
  else output.GetSerializer().endElementNS(w, token("hyperlink"));
}

/** Indexes the actual Writer bookmark positions once for the exported body. */
export class DocxBookmarks {
  private readonly positions = new Map<SwNode, Map<number, { starts: string[]; ends: string[] }>>();
  private readonly opened = new Map<string, number>();
  private nextId = 0;

  /** Builds the paragraph position index in native bookmark order. @param document - Native document. @returns Bookmark output owner. */
  constructor(document: SwDoc) {
    for (const mark of document.GetIDocumentMarkAccess().GetBookmarks()) {
      this.AddBoundary(mark.GetMarkStart(), mark.GetName(), true);
      this.AddBoundary(mark.GetMarkEnd(), mark.GetName(), false);
    }
  }

  /** Adds one boundary of the original mark. @param position - Live mark position. @param name - Native mark name. @param start - Whether it opens the mark. @returns Nothing. */
  private AddBoundary(position: SwPosition, name: string, start: boolean): void {
    const node = position.GetNode(),
      offset = position.GetContentIndex();
    let paragraph = this.positions.get(node);
    if (!paragraph) {
      paragraph = new Map();
      this.positions.set(node, paragraph);
    }
    let boundary = paragraph.get(offset);
    if (!boundary) {
      boundary = { starts: [], ends: [] };
      paragraph.set(offset, boundary);
    }
    (start ? boundary.starts : boundary.ends).push(name);
  }

  /** Supplies native offsets for text-run splitting, including empty/end anchors. @param node - Paragraph. @returns Mark offsets. */
  Offsets(node: SwNode): Iterable<number> {
    return this.positions.get(node)?.keys() ?? [];
  }

  /** Writes starts then ends using the active native bookmark IDs. @param output - DOCX attributes. @param node - Paragraph. @param offset - Text offset. @returns Nothing. */
  WriteAt(output: DocxAttributeOutput, node: SwNode, offset: number): void {
    const serializer = output.GetSerializer();
    const idAttr = FSNS(w, token("id"));
    const boundary = this.positions.get(node)?.get(offset);
    if (!boundary) return;
    for (const name of boundary.starts) {
      const id = this.nextId++;
      this.opened.set(name, id);
      serializer.singleElementNS(
        w,
        token("bookmarkStart"),
        idAttr,
        String(id),
        FSNS(w, token("name")),
        output.GetExport().BookmarkToWord(name),
      );
    }
    for (const name of boundary.ends) {
      const id = this.opened.get(name);
      if (id === undefined) continue;
      serializer.singleElementNS(w, token("bookmarkEnd"), idAttr, String(id));
      this.opened.delete(name);
    }
  }
}
