/** @fileoverview Calc worker filtering with bounded main-thread graph transfer, stale-result rejection and explicit worker teardown. */
import type { OdsFilterService } from "../../../source/filter/xml/ods-filter-service";
import type { OdsImportOptions } from "../../../source/filter/xml/xmlwrap";
import type { ScDocument } from "../../../inc/document";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import {
  encodeCalcDocumentAsync,
  decodeCalcDocumentAsync,
  type CalcDocumentRecord,
} from "./calc-document-codec";
import type { OdsWorkerRequest, OdsWorkerResult } from "./ods-worker-runtime";
/** One reusable module worker per browser document session. */
export class OdsWorkerClient implements OdsFilterService {
  private worker: Worker | undefined;
  private generation = 0;
  private closed = false;
  private pending:
    { reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | undefined;
  /** Injects worker creation for transport tests. @param factory - Dedicated Worker factory. @returns Client. */
  constructor(
    private readonly factory: () => Worker = /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
      new Worker(new URL("./ods-worker.ts", import.meta.url), {
        type: "module",
        name: "calc-ods-filter",
      }),
  ) {}
  /** Terminates active CPU work as well as pending graph preparation/adoption. @returns Nothing. */
  Cancel(): void {
    this.generation++;
    const terminate = this.pending !== undefined || this.closed;
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(new Error("ODS operation was cancelled."));
      this.pending = undefined;
    }
    if (terminate) {
      this.worker?.terminate();
      this.worker = undefined;
    }
  }
  /** Permanently closes this session's worker. @returns Nothing. */
  Close(): void {
    this.closed = true;
    this.Cancel();
  }
  /** Reads files or browser XML in the worker, then adopts a candidate in bounded tasks. @param input - Package or XML. @param options - Parser controls. @returns Native candidate. */
  async Import(
    input: Uint8Array | XmlPackage,
    options: OdsImportOptions = {},
  ): Promise<ScDocument> {
    this.Cancel();
    const generation = this.generation;
    const data = input instanceof Uint8Array ? input.slice().buffer : input;
    const result = await this.Run(
      {
        id: generation,
        operation: "import",
        input: data,
        options: {
          ...(options.limits === undefined ? {} : { limits: options.limits }),
          ...(options.maxExpandedCells === undefined
            ? {}
            : { maxExpandedCells: options.maxExpandedCells }),
          ...(options.zipLimits === undefined ? {} : { zipLimits: options.zipLimits }),
        },
      },
      data instanceof ArrayBuffer ? [data] : [],
    );
    return decodeCalcDocumentAsync(
      result as CalcDocumentRecord,
      /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
        this.closed || generation !== this.generation || options.isCancelled?.() === true,
    );
  }
  /** Exports primary XML. @param document - Model. @param xml - XML selection. @param isCurrent - Generation guard. @returns Streams. */
  Export(document: ScDocument, xml: true, isCurrent?: () => boolean): Promise<XmlPackage>;
  /** Exports external ODS. @param document - Model. @param xml - Package selection. @param isCurrent - Generation guard. @returns ODS bytes. */
  Export(document: ScDocument, xml?: false, isCurrent?: () => boolean): Promise<Uint8Array>;
  /** Captures a stable graph in bounded tasks and delegates all XML/result computation to the worker. @param document - Live model. @param xml - Browser XML selection. @param isCurrent - Snapshot-generation guard. @returns XML or external file. */
  async Export(
    document: ScDocument,
    xml = false,
    isCurrent: () => boolean = /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
      true,
  ): Promise<XmlPackage | Uint8Array> {
    this.Cancel();
    const generation = this.generation;
    const snapshot = await encodeCalcDocumentAsync(
      document,
      /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
        this.closed || generation !== this.generation || !isCurrent(),
    );
    const result = await this.Run({
      id: generation,
      operation: xml ? "export-xml" : "export",
      document: snapshot,
    });
    return xml ? (result as XmlPackage) : new Uint8Array(result as ArrayBuffer);
  }
  /** Posts a request and binds its failure/timeout to this exact worker instance. @param request - Request. @param transfer - Ownership transfers. @returns Worker response. */
  private Run(request: OdsWorkerRequest, transfer: Transferable[] = []): Promise<OdsWorkerResult> {
    if (this.closed) return Promise.reject(new Error("ODS filter is closed."));
    const worker = (this.worker ??= this.factory());
    return new Promise(
      /** Coordinates the exact active Calc worker request. @param resolve - resolve. @param reject - reject. @returns Operation result. */ (
        resolve,
        reject,
      ) => {
        const timer = setTimeout(
          /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
            this.Cancel(),
          120_000,
        );
        this.pending = { reject, timer };
        const fail =
          /** Coordinates the exact active Calc worker request. @param message - message. @returns Operation result. */ (
            message: string,
          ) => {
            if (this.worker !== worker || request.id !== this.generation) return;
            clearTimeout(timer);
            this.pending = undefined;
            worker.terminate();
            if (this.worker === worker) this.worker = undefined;
            reject(new Error(message));
          };
        worker.onmessage =
          /** Coordinates the exact active Calc worker request. @param input1 - Operation input. @returns Operation result. */ ({
            data,
          }) => {
            if (data.id !== request.id || request.id !== this.generation) return;
            clearTimeout(timer);
            this.pending = undefined;
            if (data.error !== undefined) reject(new Error(data.error));
            else resolve(data.result);
          };
        worker.onerror =
          /** Coordinates the exact active Calc worker request. @param event - event. @returns Operation result. */ (
            event,
          ) => fail(event.message || "ODS worker failed.");
        worker.onmessageerror =
          /** Coordinates the exact active Calc worker request.  @returns Operation result. */ () =>
            fail("ODS worker response could not be cloned.");
        try {
          worker.postMessage(request, transfer);
        } catch (error) {
          fail(error instanceof Error ? error.message : String(error));
        }
      },
    );
  }
}
