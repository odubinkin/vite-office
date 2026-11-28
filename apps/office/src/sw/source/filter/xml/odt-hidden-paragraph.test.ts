/** @fileoverview Native Writer hidden paragraph conditions, frame visibility and ODT persistence. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwViewOption } from "../../../inc/viewopt";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHiddenParaField } from "../../core/fields/docufld";
import { CollectTextFlyFrames } from "../../core/layout/flycnt";
import { SwRootFrame } from "../../core/layout/newfrm";
import { SwFrame } from "../../core/layout/wsfrm";
import { DEFAULT_SW_TEXT_FRAME_SETTINGS } from "../../core/text/txtfrm";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const metadata = { title: "Hidden paragraphs" };

it("preserves the pinned hidden paragraph in its native text fly", /** Replays the relevant visibility and field assertions from testFlyHiddenParagraph. @returns Completion. */ async () => {
  const content = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/layout/data/fly_hidden_paragraph.fodt",
    "utf8",
  )
    .replace("<office:document ", "<office:document-content ")
    .replace("</office:document>", "</office:document-content>");
  const source = importWriterXml(undefined, content, metadata);
  try {
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const bytes = await writeOdtDocument(restored.document, metadata);
      const xml = new DOMParser().parseFromString(
        await (await DocumentArchive.open(bytes)).readTextEntry("content.xml"),
        "application/xml",
      );
      const marker = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "hidden-paragraph")[0];
      expect(marker?.getAttributeNS(ODF_NAMESPACES.text, "condition")).toBe('ooow:Test EQ ""');
      expect(marker?.getAttributeNS(ODF_NAMESPACES.text, "is-hidden")).toBe("true");
      const { document } = await readOdtDocument(bytes, metadata);
      try {
        const fly = [...CollectTextFlyFrames(document).values()].flat()[0];
        assert(fly);
        const hidden = fly.content[0]?.GetTextNode();
        const field = hidden?.GetpSwpHints()?.GetOrdinaryFields()[0]?.GetAttr().GetField();
        const master = document.getIDocumentFieldsAccess().FindUserFieldType("Test");
        assert(hidden && field instanceof SwHiddenParaField && master);
        expect(hidden.IsHiddenByParaField()).toBe(true);
        field.SetHidden(false);
        document.getIDocumentFieldsAccess().UpdateExpFields();
        expect(hidden.IsHiddenByParaField()).toBe(true);

        const first = document.paragraphs[0];
        assert(first);
        const point = new SwPosition(first, 0);
        const cursor = new SwPaM(point);
        point.Dispose();
        try {
          const options = new SwViewOption(
            /** Ignores binding changes in this view fixture. @returns Nothing. */ () => {},
          );
          const projection = new WriterViewProjection();
          const state = createDocument({
            id: "hidden-paragraph",
            suiteId: "writer",
            title: metadata.title,
          });
          /** Reads the browser projection for the original fly text node. @returns Projected paragraph. */
          const projectHidden = () =>
            projection.Project(document, first, cursor, state, options).textNodes.find(
              /** Finds the original fly paragraph by its node position. @param value - Projected paragraph. @returns Whether it belongs to the field. */
              (value) => value.nodeIndex === hidden.GetIndex(),
            )?.hiddenByParaField;
          expect(projectHidden()).toBe(true);
          options.SetFieldName(true);
          expect(projectHidden()).toBeUndefined();
          options.SetFieldName(false);
          master.content = "visible";
          document.getIDocumentFieldsAccess().UpdateExpFields();
          expect(hidden.IsHiddenByParaField()).toBe(false);
          expect(projectHidden()).toBeUndefined();
        } finally {
          cursor.Dispose();
        }
      } finally {
        document.Dispose();
      }
    } finally {
      restored.document.Dispose();
    }
  } finally {
    source.document.Dispose();
  }
});

it("keeps original hidden body frames at zero height and preserves a visible caret frame", /** Checks field precedence and the first body paragraph exception. @returns Nothing. */ () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:ooow="${ODF_NAMESPACES.ooow}"`;
  const hide = '<text:hidden-paragraph text:condition="ooow:TRUE"/>';
  const document = importWriterXml(
    undefined,
    `<office:document-content ${ns}><office:body><office:text><text:p>A${hide}</text:p><text:p>B${hide}<text:hidden-paragraph text:condition="ooow:FALSE"/></text:p></office:text></office:body></office:document-content>`,
    metadata,
  ).document;
  const layout = new SwRootFrame(
    /** Borrows the fixture model. @returns Source document. */ () => document,
  );
  try {
    const measurements = document.paragraphs.map(
      /** Supplies ordinary device lines for both body nodes. @param node - Text node. @param index - Body index. @returns Measurement. */
      (node, index) => ({ id: String(index), lines: [{ start: 0, end: node.Len(), height: 240 }] }),
    );
    const descriptor = document.GetPageDesc().GetValue();
    const lineInfo = new SwLineNumberInfo().QueryValue();
    const hidden = layout.Format(measurements, descriptor, undefined, lineInfo).pages[0]
      ?.textFrames;
    expect(hidden?.map((frame) => frame.IsHiddenNow())).toEqual([true, false]);
    expect(hidden?.[0]?.GetPara()).toBeUndefined();
    const shown = layout.Format(
      measurements,
      descriptor,
      { ...DEFAULT_SW_TEXT_FRAME_SETTINGS, showHiddenPara: true },
      lineInfo,
    ).pages[0]?.textFrames;
    expect(shown?.map((frame) => frame.IsHiddenNow())).toEqual([false, false]);

    const second = document.paragraphs[1];
    assert(second);
    const point = second.GetpSwpHints()?.GetOrdinaryFields().at(-1)?.GetStart();
    assert(point !== undefined);
    second.EraseText(point, 1);
    const allHidden = layout.Format(measurements, descriptor, undefined, lineInfo).pages[0]
      ?.textFrames;
    expect(allHidden?.map((frame) => frame.IsHiddenNow())).toEqual([false, true]);
  } finally {
    SwFrame.DestroyFrame(layout);
    document.Dispose();
  }
});
