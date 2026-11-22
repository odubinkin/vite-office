/** @fileoverview LibreOffice annotation field regressions through Writer ODT and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { EE_CHAR_WEIGHT } from "../../../../editeng/inc/eeitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { getPostItFields } from "./xmlannotation";
import { importWriterXml } from "./xmlimp";

const metadata = createDocument({ id: "annotation", suiteId: "writer", title: "Annotation" });
const upstream = "../../vendor/libreoffice-reference/sw/qa/extras";

/** Collects annotation fields in source document order. @param document - Native Writer document. @returns Original point hints. */
function annotations(document: SwDoc) {
  return document.paragraphs.flatMap(
    /** Reads each native annotation hint on its paragraph. @param node - Owning paragraph. @returns Hint list. */
    (node) => [...getPostItFields(node)],
  );
}

it("preserves the bold second annotation run from annotation-formatting.odt", /** Ports testAnnotationFormatting. @returns Completion. */ async () => {
  const source = (
    await readOdtDocument(
      new Uint8Array(readFileSync(`${upstream}/odfimport/data/annotation-formatting.odt`)),
      metadata,
    )
  ).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(source)));
    reopened = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata)).document;
    for (const document of [source, worker, reopened]) {
      const field = annotations(document)[0]?.GetAttr().GetField();
      assert(field);
      expect(field.GetPar2()).toBe("Looses: bold");
      const rich = field.GetTextObject();
      assert(rich);
      const items: EECharAttrib[] = [];
      rich.GetCharAttribs(0, items);
      const bold = items.find(
        /** Finds the original bold span. @param item - Native span. @returns Whether this is the span weight. */
        (item) => item.nStart === 8 && item.nEnd === 12 && item.pAttr?.Which() === EE_CHAR_WEIGHT,
      )?.pAttr;
      assert(bold instanceof SvxWeightItem);
      expect(bold.GetValue()).toBe(FontWeight.WEIGHT_BOLD);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("preserves resolved and unresolved annotation metadata from resolved-comment.odt", /** Ports testResolvedComment and verifies ODF 1.3 legacy initials conversion. @returns Completion. */ async () => {
  const source = (
    await readOdtDocument(
      new Uint8Array(readFileSync(`${upstream}/odfexport/data/resolved-comment.odt`)),
      metadata,
    )
  ).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(source)));
    const bytes = await writeOdtDocument(worker, metadata);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain("<meta:creator-initials>SC</meta:creator-initials>");
    expect(xml).toContain("<dc:date>2019-08-08T14:05:04.535603552</dc:date>");
    expect(xml).not.toContain(CH_TXTATR_INWORD);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const document of [source, worker, reopened]) {
      const hints = annotations(document);
      expect(hints).toHaveLength(2);
      const first = hints[0]?.GetAttr().GetField().GetData();
      expect(first).toMatchObject({
        author: "Scott Clarke",
        initials: "SC",
        resolved: true,
        text: "This comment is resolved",
      });
      expect(first?.dateTime.GetNanoSec()).toBe(535603552);
      expect(hints[1]?.GetAttr().GetField().GetData()).toMatchObject({
        resolved: false,
        text: "This comment is not resolved",
      });
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("retains adjacent point anchors, thread names and paragraph boundaries through both paths", /** Exercises real UTF-16 owners, empty dates, and legacy initials. @returns Completion. */ async () => {
  const namespaces = `xmlns:office="${NS.office}" xmlns:style="${NS.style}" xmlns:text="${NS.text}" xmlns:dc="${NS.dc}" xmlns:loext="${NS.loext}"`;
  const styles = `<office:document-styles ${namespaces}><office:styles/></office:document-styles>`;
  const xml = `<office:document-content ${namespaces}><office:body><office:text><text:p>😀<office:annotation office:name="one">
    <text:sender-initials>A</text:sender-initials><dc:date>invalid</dc:date><text:p>a<text:s text:c="2"/>b</text:p><text:p/><text:p>c<text:tab/>d</text:p>
  </office:annotation><office:annotation office:name="two" loext:parent-name="one" loext:resolved="true"><text:p>reply</text:p></office:annotation>end</text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, xml, metadata);
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
    const saved = await writeOdtDocument(worker, metadata);
    const content = await (await DocumentArchive.open(saved)).readTextEntry("content.xml");
    expect(content).toContain("<dc:date>0000-00-00T00:00:00</dc:date>");
    reopened = (await readOdtDocument(saved, metadata)).document;
    for (const candidate of [document, worker, reopened]) {
      const node = candidate.paragraphs[0] as SwTextNode;
      expect(node.GetText()).toBe(`😀${CH_TXTATR_INWORD}${CH_TXTATR_INWORD}end`);
      const [one, two] = annotations(candidate);
      assert(one && two);
      expect([one.GetStart(), two.GetStart()]).toEqual([2, 3]);
      expect(one.GetAttr().GetField().GetData()).toMatchObject({
        name: "one",
        initials: "A",
        text: "a  b\n\nc\td",
      });
      expect(one.GetAttr().GetField().GetData().dateTime.GetDate()).toBe(0);
      expect(two.GetAttr().GetField().GetData()).toMatchObject({
        name: "two",
        parentName: "one",
        text: "reply",
        resolved: true,
      });
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
