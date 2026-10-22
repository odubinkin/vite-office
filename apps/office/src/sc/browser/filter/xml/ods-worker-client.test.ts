/** @fileoverview Verifies Calc request cancellation and generation guards before browser persistence can acknowledge a snapshot. */
import { expect, it } from "vitest";
import { OdsWorkerClient } from "./ods-worker-client";
import { ScDocument } from "../../../inc/document";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { encodeCalcDocument } from "./calc-document-codec";
import type { OdsWorkerRequest } from "./ods-worker-runtime";
/** Minimal deterministic Dedicated Worker transport. */
class Transport {
  onmessage: Worker["onmessage"] = null;
  onerror: Worker["onerror"] = null;
  onmessageerror: Worker["onmessageerror"] = null;
  request: OdsWorkerRequest | undefined;
  terminated = false;
  /** Retains the exact request. @param request - Worker request. @returns Nothing. */
  postMessage(request: OdsWorkerRequest): void {
    this.request = request;
  }
  /** Records terminated work. @returns Nothing. */
  terminate(): void {
    this.terminated = true;
  }
  /** Emits native graph output for this request. @param result - Cloneable record. @returns Nothing. */
  respond(result: unknown): void {
    this.onmessage?.call(
      this as unknown as Worker,
      new MessageEvent("message", { data: { id: this.request?.id, result } }),
    );
  }
}
it("rejects stale capture before starting a worker", /** Proves edits during capture cannot produce a durable mixed-generation document. @returns Completion. */ async () => {
  let created = false;
  const client = new OdsWorkerClient(
    /** Observes process creation. @returns Fake worker. */ () => {
      created = true;
      return new Transport() as unknown as Worker;
    },
  );
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  try {
    await expect(
      client.Export(doc, true, /** Marks the snapshot stale. @returns False. */ () => false),
    ).rejects.toThrow(/stale/);
    expect(created).toBe(false);
  } finally {
    client.Close();
    doc.DisposeAttributes();
  }
});
it("terminates superseded work and ignores its late response", /** Keeps only the latest import candidate eligible for adoption. @returns Completion. */ async () => {
  const workers: Transport[] = [];
  const client = new OdsWorkerClient(
    /** Creates one observable transport. @returns Fake worker. */ () => {
      const worker = new Transport();
      workers.push(worker);
      return worker as unknown as Worker;
    },
  );
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Latest"));
  const graph = encodeCalcDocument(doc);
  const first = client.Import(new Uint8Array([1]));
  const rejected = expect(first).rejects.toThrow(/cancelled/);
  const second = client.Import(new Uint8Array([2]));
  try {
    await rejected;
    expect(workers[0]?.terminated).toBe(true);
    workers[0]?.respond(graph);
    workers[1]?.respond(graph);
    const imported = await second;
    expect(imported.GetTableCount()).toBe(1);
    imported.DisposeAttributes();
    client.Close();
    expect(workers[1]?.terminated).toBe(true);
    await expect(client.Import(new Uint8Array())).rejects.toThrow(/closed/);
  } finally {
    client.Close();
    doc.DisposeAttributes();
  }
});
