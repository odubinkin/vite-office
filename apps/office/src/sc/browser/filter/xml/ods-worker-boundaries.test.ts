/** @fileoverview Actual Calc worker protocol success, failure, timeout and stale-callback boundaries. */
import { afterEach, expect, it, vi } from "vitest";
import { DEFAULT_FAST_XML_LIMITS } from "../../../../sax/source/fastparser/fastparser";
import { DEFAULT_ZIP_FILE_LIMITS } from "../../../../package/source/zipapi/ZipFile";
import { OdsWorkerClient } from "./ods-worker-client";
import { processOdsWorkerRequest, type OdsWorkerRequest } from "./ods-worker-runtime";
import { encodeCalcDocument, decodeCalcDocument } from "./calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { CellType } from "../../../inc/global";
import { writeOdsXml } from "../../../source/filter/xml/xmlwrap";
import { createInlineOdsFilterService } from "../../../source/filter/xml/ods-filter-service";
import { createCalcSession } from "../../composition/calc-module";
/** Controllable transport with actual terminal envelopes. */
class Transport {
  onmessage: Worker["onmessage"] = null;
  onerror: Worker["onerror"] = null;
  onmessageerror: Worker["onmessageerror"] = null;
  request: OdsWorkerRequest | undefined;
  terminated = false;
  fault: unknown;
  /** Checks the browser XML and worker regression boundary. @param request - Controlled regression input. @returns Regression result or completion. */ postMessage(
    request: OdsWorkerRequest,
  ): void {
    if (this.fault !== undefined) throw this.fault;
    this.request = request;
  }
  /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ terminate(): void {
    this.terminated = true;
  }
  /** Checks the browser XML and worker regression boundary. @param result - Controlled regression input. @param error - Controlled regression input. @param id - Controlled regression input. @returns Regression result or completion. */ emit(
    result: unknown,
    error?: string,
    id = this.request?.id,
  ): void {
    this.onmessage?.call(
      this as unknown as Worker,
      new MessageEvent("message", {
        data: { id, result, ...(error === undefined ? {} : { error }) },
      }),
    );
  }
}
/** Makes a nonempty canonical model. @returns Document. */
function model(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(), 7);
  return doc;
}
it("transfers edit-text cells through the browser worker document record", () => {
  const doc = model(),
    pos = new ScAddress(1, 0, 0);
  doc.SetTextCell(pos, unicode("first\nsecond"));
  const loaded = decodeCalcDocument(encodeCalcDocument(doc));
  expect(loaded.GetCellType(pos)).toBe(CellType.CELLTYPE_EDIT);
  const value = loaded.GetRefCellValue(pos).getEditText()?.GetText();
  expect(value).toBeDefined();
  try {
    if (value) expect(text(value)).toBe("first\nsecond");
  } finally {
    value?.dispose();
  }
});
afterEach(
  /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  },
);
it("round-trips browser XML and external ODS through default production worker construction", /** Uses the real worker runtime with a controlled host transport. @returns Completion. */ async () => {
  const worker = new Transport();
  vi.stubGlobal(
    "Worker",
    vi.fn(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ function () {
        return worker;
      },
    ),
  );
  const session = createCalcSession(undefined);
  session.Close();
  const client = new OdsWorkerClient(),
    doc = model(),
    xml = writeOdsXml(doc);
  const imported = client.Import(xml, {
    maxExpandedCells: 100,
    limits: DEFAULT_FAST_XML_LIMITS,
    zipLimits: DEFAULT_ZIP_FILE_LIMITS,
  });
  expect(worker.request?.operation).toBe("import");
  worker.emit(await processOdsWorkerRequest(worker.request as OdsWorkerRequest));
  const copy = await imported;
  expect(copy.GetValue(new ScAddress())).toBe(7);
  copy.DisposeAttributes();
  for (const xmlOutput of [false, true] as const) {
    const pending = xmlOutput ? client.Export(doc, true) : client.Export(doc);
    await vi.waitFor(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        expect(worker.request?.operation).toBe(xmlOutput ? "export-xml" : "export"),
    );
    worker.emit(await processOdsWorkerRequest(worker.request as OdsWorkerRequest));
    expect(await pending).toEqual(xmlOutput ? xml : expect.any(Uint8Array));
  }
  client.Close();
  doc.DisposeAttributes();
});
it("rejects malformed worker envelopes, transport errors and late failures without adopting stale models", /** Exercises recoverable failure channels and current-request ownership. @returns Completion. */ async () => {
  const doc = model(),
    graph = encodeCalcDocument(doc),
    workers: Transport[] = [];
  const client = new OdsWorkerClient(
    /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () => {
      const worker = new Transport();
      workers.push(worker);
      return worker as unknown as Worker;
    },
  );
  const first = client.Import(new Uint8Array([1]));
  const rejected = expect(first).rejects.toThrow("format");
  const worker = workers[0] as Transport;
  worker.emit(undefined, "format");
  await rejected;
  const late = worker.onerror;
  const next = client.Import(new Uint8Array([2]));
  late?.call(worker as unknown as AbstractWorker, new ErrorEvent("error", { message: "old" }));
  worker.emit(graph, undefined, -1);
  worker.emit(graph);
  (await next).DisposeAttributes();
  {
    const message = "diagnostic";
    const request = client.Import(new Uint8Array());
    const failure = expect(request).rejects.toThrow(message || "ODS worker failed");
    worker.onerror?.call(worker as unknown as AbstractWorker, new ErrorEvent("error", { message }));
    await failure;
    const stale = worker.onerror;
    client.Cancel();
    stale?.call(worker as unknown as AbstractWorker, new ErrorEvent("error"));
  }
  const clone = client.Import(new Uint8Array());
  const cloneFailure = expect(clone).rejects.toThrow("could not be cloned");
  (workers.at(-1) as Transport).onmessageerror?.call(
    workers.at(-1) as unknown as Worker,
    new MessageEvent("messageerror"),
  );
  await cloneFailure;
  for (const fault of [new Error("post"), "post-string"]) {
    const broken = new Transport();
    broken.fault = fault;
    const c = new OdsWorkerClient(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        broken as unknown as Worker,
    );
    await expect(c.Import(new Uint8Array())).rejects.toThrow(
      String(fault instanceof Error ? fault.message : fault),
    );
    c.Close();
  }
  client.Close();
  doc.DisposeAttributes();
});
it("times out an unresponsive worker and cancels the exact pending request", /** Uses the real operation timer rather than waiting two minutes. @returns Completion. */ async () => {
  vi.useFakeTimers();
  const worker = new Transport(),
    client = new OdsWorkerClient(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        worker as unknown as Worker,
    );
  const pending = client.Import(new Uint8Array());
  const rejected = expect(pending).rejects.toThrow("cancelled");
  await vi.advanceTimersByTimeAsync(120000);
  await rejected;
  expect(worker.terminated).toBe(true);
  client.Close();
});
it("imports XML and exports default external bytes through the inline service", /** Checks native callers outside browser worker sessions. @returns Completion. */ async () => {
  const doc = model(),
    service = createInlineOdsFilterService();
  service.Cancel();
  const copy = await service.Import(writeOdsXml(doc));
  expect(await service.Export(copy)).toBeInstanceOf(Uint8Array);
  const restored = decodeCalcDocument(encodeCalcDocument(copy));
  expect(restored.GetTableCount()).toBe(1);
  restored.DisposeAttributes();
  service.Close();
  copy.DisposeAttributes();
  doc.DisposeAttributes();
});
it("keeps reentrant transport closure authoritative during failure cleanup", /** Verifies an injected transport can close its owning session during termination. @returns Completion. */ async () => {
  const worker = new Transport(),
    client = new OdsWorkerClient(
      /** Returns the session-owned transport. @returns Controlled worker. */ () =>
        worker as unknown as Worker,
    );
  let closing = false;
  vi.spyOn(worker, "terminate").mockImplementation(
    /** Closes the owning session once during termination. @returns Nothing. */ () => {
      worker.terminated = true;
      if (!closing) {
        closing = true;
        client.Close();
      }
    },
  );
  const pending = client.Import(new Uint8Array()),
    rejected = expect(pending).rejects.toThrow("ODS worker failed");
  worker.onerror?.call(worker as unknown as AbstractWorker, new ErrorEvent("error"));
  await rejected;
  await expect(client.Import(new Uint8Array())).rejects.toThrow("closed");
});
