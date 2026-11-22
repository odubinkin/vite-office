/** @fileoverview Original Writer ODT annotation range regressions with real field and mark owners. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { CH_TXTATR_INWORD, RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { SwTextAnnotationField } from "../../../inc/txtannotationfld";
import type { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const metadata = createDocument({
  id: "annotation-range",
  suiteId: "writer",
  title: "Annotation range",
});
const fixtures = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";

/** Reads the nearest ODF paragraph through any surrounding text spans. @param element - Exported text element. @returns Parent paragraph. */
function containingParagraph(element: Element | undefined): Element {
  let parent = element?.parentElement;
  while (parent && (parent.localName !== "p" || parent.namespaceURI !== NS.text))
    parent = parent.parentElement;
  assert(parent);
  return parent;
}

it.each([
  ["fdo38244.odt", "__Fieldmark__4_1833023242", false],
  ["fdo60769.odt", "__Fieldmark__5_752385397", true],
] as const)(
  "preserves original comment text and anchors in %s",
  /** Ports the native single and multi-paragraph annotation witnesses. @param fixture - Pinned ODT. @param name - Original name. @param spanning - Whether the range crosses paragraphs. @returns Completion. */
  async (fixture, name, spanning) => {
    const source = (
      await readOdtDocument(new Uint8Array(readFileSync(`${fixtures}/${fixture}`)), metadata)
    ).document;
    let worker: SwDoc | undefined;
    let reopened: SwDoc | undefined;
    try {
      worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(source)));
      const bytes = await writeOdtDocument(worker, metadata);
      const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
      expect(xml).not.toContain(CH_TXTATR_INWORD);
      const root = new DOMParser().parseFromString(xml, "application/xml");
      const annotations = root.getElementsByTagNameNS(NS.office, "annotation");
      const ends = root.getElementsByTagNameNS(NS.office, "annotation-end");
      expect(annotations).toHaveLength(1);
      expect(ends).toHaveLength(1);
      expect(annotations[0]?.getAttributeNS(NS.office, "name")).toBe(name);
      expect(ends[0]?.getAttributeNS(NS.office, "name")).toBe(name);
      expect(containingParagraph(annotations[0]) === containingParagraph(ends[0])).toBe(!spanning);
      reopened = (await readOdtDocument(bytes, metadata)).document;
      for (const document of [source, worker, reopened]) {
        const access = document.GetIDocumentMarkAccess();
        expect(access.GetBookmarks()).toHaveLength(0);
        const marks = access.GetAnnotationMarks();
        expect(marks).toHaveLength(1);
        const mark = marks[0];
        assert(mark);
        expect(mark.GetName()).toBe(name);
        const [start, end] = mark.GetMarkStartEnd();
        expect(start.GetNode()).toBe(document.paragraphs[0]);
        expect(end.GetNode()).toBe(document.paragraphs[spanning ? 1 : 0]);
        const endNode = end.GetNode().GetTextNode();
        assert(endNode);
        const offset = end.GetContentIndex() - 1;
        expect(endNode.GetText()[offset]).toBe(CH_TXTATR_INWORD);
        const hint = endNode.GetpSwpHints()?.GetTextAttrForCharAt(offset, RES_TXTATR_ANNOTATION);
        assert(hint instanceof SwTextAnnotationField);
        expect(hint.GetAnnotationMark()).toBe(mark);
        expect(mark.GetAnnotationFormatField()).toBe(hint.GetAttr());
        expect(hint.GetAttr().GetField().GetData()).toMatchObject({ name, initials: "M" });
        if (!spanning)
          expect(endNode.GetText().slice(start.GetContentIndex(), offset)).toBe("comment");
      }
    } finally {
      reopened?.Dispose();
      worker?.Dispose();
      source.Dispose();
    }
  },
);

it("keeps unmatched ends inert and rebinds registered range positions during edits", /** Exercises point and range annotations together without an artificial document owner. @returns Nothing. */ () => {
  const ns = `xmlns:office="${NS.office}" xmlns:style="${NS.style}" xmlns:text="${NS.text}"`;
  const styles = `<office:document-styles ${ns}><office:styles/></office:document-styles>`;
  const xml = `<office:document-content ${ns}><office:body><office:text><text:p>a<office:annotation office:name="range"><text:p>Note</text:p></office:annotation>bc<office:annotation-end office:name="range"/>d<office:annotation office:name="point"/><office:annotation-end office:name="missing"/>e</text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, xml, metadata);
  try {
    const node = document.paragraphs[0];
    assert(node);
    const mark = document.GetIDocumentMarkAccess().FindAnnotationMark("range");
    assert(mark);
    expect(document.GetIDocumentMarkAccess().GetAnnotationMarks()).toHaveLength(1);
    expect(node.GetText()).toBe(`abc${CH_TXTATR_INWORD}d${CH_TXTATR_INWORD}e`);
    node.InsertText("!", 0);
    expect(mark.GetMarkStart().GetContentIndex()).toBe(2);
    expect(mark.GetMarkEnd().GetContentIndex()).toBe(5);
    expect(mark.GetAnnotationFormatField()?.GetTextField()?.GetStart()).toBe(4);
    node.EraseText(4, 1);
    const worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
    try {
      expect(worker.GetIDocumentMarkAccess().GetAnnotationMarks()).toHaveLength(0);
      expect(worker.paragraphs[0]?.GetText()).toBe(`!abcd${CH_TXTATR_INWORD}e`);
    } finally {
      worker.Dispose();
    }
  } finally {
    document.Dispose();
  }
});
