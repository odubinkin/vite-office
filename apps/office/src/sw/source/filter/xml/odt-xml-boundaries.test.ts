/** @fileoverview Browser XML error paths, embedded resources and shell snapshot generation guards. */
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml, SwXMLWriter } from "./wrtxml";
import { createOdtFilterDocument, InlineOdtFilterService } from "./odt-filter-service";
import {
  restoreOdtWorkerDocumentAsync,
  createOdtWorkerDocument,
} from "../../../browser/filter/xml/odt-transfer";
import { SwDocShell } from "../../uibase/app/docsh";
import { ScDocShell } from "../../../../sc/source/ui/docshell/docsh";
import { createInlineOdsFilterService } from "../../../../sc/source/filter/xml/ods-filter-service";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScDocument } from "../../../../sc/inc/document";
import type { OdtFilterOperationOptions } from "./odt-filter-service";
it("rejects nontext stored XML and complete external exports above their byte ceiling", /** Keeps persisted stream typing and final archive limits enforced. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    metadata = { title: "XML" },
    xml = writeOdtXml(doc, metadata);
  await expect(
    readOdtDocument({ ...xml, files: { ...xml.files, mimetype: new Uint8Array() } }, metadata),
  ).rejects.toThrow("Missing ODT XML");
  await expect(readOdtDocument(xml, metadata, undefined, { maxXmlStreamBytes: 1 })).rejects.toThrow(
    "size limit",
  );
  const size = Object.values(xml.files).reduce(
    /** Checks the browser XML and worker regression boundary. @param n - Controlled regression input. @param s - Controlled regression input. @returns Regression result or completion. */ (
      n,
      s,
    ) => n + new TextEncoder().encode(String(s)).length,
    0,
  );
  expect(
    /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
      writeOdtDocument(doc, metadata, { maxOutputBytes: size }),
  ).toThrow("size limit");
  expect(new SwXMLWriter().WriteXml(doc, metadata).format).toBe("xml");
  const transfer = createOdtWorkerDocument(createOdtFilterDocument(doc, "XML"));
  for (const input of [
    { ...transfer, document: { ...transfer.document, transferVersion: 4 } },
    { ...transfer, metadata: { title: 0 } },
  ])
    await expect(
      restoreOdtWorkerDocumentAsync(
        input as never,
        undefined,
        /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
          false,
      ),
    ).rejects.toThrow("unsupported");
  doc.Dispose();
});
it("reads raw and typed embedded resources from browser XML and rejects a missing resource", /** Validates the unpacked font-resource boundary against an existing ODF fixture. @returns Completion. */ async () => {
  const metadata = { title: "Font" },
    opened = await readOdtDocument(
      new Uint8Array(readFileSync("src/sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt")),
      metadata,
    );
  const xml = writeOdtXml(opened.document, metadata),
    font = opened.document.GetEmbeddedFonts()[0];
  if (font === undefined) throw new Error("Embedded font fixture is missing.");
  const loaded = await readOdtDocument(xml, metadata);
  expect(loaded.document.GetEmbeddedFonts()[0]?.bytes).toEqual(font.bytes);
  const bytes = xml.files[font.path] as Uint8Array;
  const textResource = {
    ...xml,
    files: { ...xml.files, [font.path]: new TextDecoder().decode(bytes) },
  };
  const textLoaded = await readOdtDocument(textResource, metadata);
  expect(textLoaded.document.GetEmbeddedFonts()[0]?.bytes).toEqual(
    new TextEncoder().encode(new TextDecoder().decode(bytes)),
  );
  textLoaded.document.Dispose();
  const files = { ...xml.files };
  Reflect.deleteProperty(files, font.path);
  Object.defineProperty(files, font.path, {
    enumerable: true,
    configurable: false,
    get: /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
      undefined,
  });
  await expect(readOdtDocument({ ...xml, files }, metadata)).rejects.toThrow("Missing ODF stream");
  opened.document.Dispose();
  loaded.document.Dispose();
});
it("normalizes cancellation raised during inline XML export", /** Ensures inline ExportXml uses the same cancellation contract as external ODT export. @returns Completion. */ async () => {
  const service = new InlineOdtFilterService(),
    doc = createWriterDocument();
  let reads = 0;
  const signal = {
    /** Cancels after the initial operation admission. @returns Whether XML export must stop. */
    get aborted() {
      return ++reads > 1;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  await expect(
    service.ExportXml(createOdtFilterDocument(doc, "Cancelled"), { signal }),
  ).rejects.toMatchObject({ category: "cancelled" });
  service.Close();
  doc.Dispose();
});
it("invalidates captured shell guards after generation changes and same-generation graph replacement", /** Checks Writer and Calc guards for both XML and external exports. @returns Completion. */ async () => {
  const writerFilter = new InlineOdtFilterService(),
    writer = new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "w", suiteId: "writer", title: "Writer" }),
      undefined,
      writerFilter,
    );
  const writerGuards: (() => boolean)[] = [];
  const capture =
    /** Checks the browser XML and worker regression boundary. @param options - Controlled regression input. @returns Regression result or completion. */ (
      options?: OdtFilterOperationOptions,
    ) => {
      if (options?.isCurrent === undefined) throw new Error("Writer filter guard is missing.");
      writerGuards.push(options.isCurrent);
    };
  const exportSpy = vi.spyOn(writerFilter, "Export").mockImplementation(
    /** Checks the browser XML and worker regression boundary. @param _doc - Controlled regression input. @param options - Controlled regression input. @returns Regression result or completion. */ async (
      _doc,
      options,
    ) => {
      capture(options);
      return new Uint8Array();
    },
  );
  const xmlSpy = vi.spyOn(writerFilter, "ExportXml").mockImplementation(
    /** Checks the browser XML and worker regression boundary. @param _doc - Controlled regression input. @param options - Controlled regression input. @returns Regression result or completion. */ async (
      _doc,
      options,
    ) => {
      capture(options);
      return { format: "xml", files: {} };
    },
  );
  await writer.SerializeOdt();
  await writer.SerializeXml();
  expect(
    writerGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([true, true]);
  const writerGeneration = vi.spyOn(writer, "GetContentGeneration").mockReturnValue(1);
  expect(
    writerGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([false, false]);
  writerGeneration.mockReturnValue(0);
  writer.InitNew(createDocument({ id: "w2", suiteId: "writer", title: "New" }));
  expect(
    writerGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([false, false]);
  exportSpy.mockRestore();
  xmlSpy.mockRestore();
  writerGeneration.mockRestore();
  writer.Close();
  const calcFilter = createInlineOdsFilterService(),
    calc = new ScDocShell(new ScDocument(), calcFilter),
    calcGuards: (() => boolean)[] = [];
  const calcSpy = vi.spyOn(calcFilter, "Export").mockImplementation(
    /** Checks the browser XML and worker regression boundary. @param _doc - Controlled regression input. @param xml - Controlled regression input. @param isCurrent - Controlled regression input. @returns Regression result or completion. */ async (
      _doc,
      xml,
      isCurrent,
    ) => {
      if (isCurrent === undefined) throw new Error("Calc filter guard is missing.");
      calcGuards.push(isCurrent);
      return (xml ? { format: "xml", files: {} } : new Uint8Array()) as never;
    },
  );
  await calc.SerializeXml();
  await calc.SerializeOdsAsync();
  expect(
    calcGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([true, true]);
  const generation = vi.spyOn(calc, "GetContentGeneration").mockReturnValue(1);
  expect(
    calcGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([false, false]);
  generation.mockReturnValue(0);
  calc.ReplaceDocument(
    new ScDocument(),
    createDocument({ id: "c2", suiteId: "calc", title: "New" }),
    { kind: "untitled", name: "New" },
  );
  expect(
    calcGuards.map(
      /** Checks the browser XML and worker regression boundary. @param f - Controlled regression input. @returns Regression result or completion. */ (
        f,
      ) => f(),
    ),
  ).toEqual([false, false]);
  calcSpy.mockRestore();
  generation.mockRestore();
  calc.Close();
});
