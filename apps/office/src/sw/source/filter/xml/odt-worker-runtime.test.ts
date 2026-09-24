/** @fileoverview Verifies worker-side ODT execution, progress, transfers, errors, and cancellation. */

import { describe, expect, it, vi } from "vitest";

import {
  issueWorkerRequest,
  createWorkerClientState,
} from "../../../../framework/browser/workers/worker-protocol";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh";
import { writeOdtDocument } from "./wrtxml";
import { createOdtFilterDocument, restoreOdtFilterDocument } from "./odt-filter-service";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocument,
  type OdtWorkerDocument,
} from "../../../browser/filter/xml/odt-transfer";
import {
  OdtWorkerRuntime,
  type OdtWorkerRequestPayload,
  type OdtWorkerRuntimeScope,
} from "../../../browser/filter/xml/odt-worker-runtime";

/** Capturing worker scope test double. */
class CapturingScope implements OdtWorkerRuntimeScope {
  public readonly messages: unknown[] = [];
  public readonly transfers: Transferable[][] = [];
  public onPost: ((message: unknown) => void) | undefined;

  /** Captures one worker response. @param message - Structured response. @param transfer - Transfer list. @returns Nothing. */
  public postMessage(message: unknown, transfer: Transferable[] = []): void {
    this.messages.push(message);
    this.transfers.push(transfer);
    this.onPost?.(message);
  }
}

/** Creates deterministic Writer metadata. @returns Metadata. */
function metadata() {
  return createDocument({ id: "worker-runtime", suiteId: "writer", title: "Runtime" });
}

/** Issues one protocol request. @param payload - ODT operation payload. @returns Versioned request. */
function request(payload: OdtWorkerRequestPayload) {
  return issueWorkerRequest(createWorkerClientState(), payload).request;
}

/** Waits for a terminal response. @param scope - Capturing worker scope. @returns Terminal message. */
async function terminal(scope: CapturingScope): Promise<Record<string, unknown>> {
  await vi.waitUntil(
    /** Detects a result or error. @returns Whether terminal. */ () =>
      scope.messages.some(
        /** Checks one response discriminator. @param message - Captured response. @returns Whether terminal. */
        (message) =>
          typeof message === "object" &&
          message !== null &&
          ((message as { type?: string }).type === "result" ||
            (message as { type?: string }).type === "error"),
      ),
  );
  return [...scope.messages].reverse().find(
    /** Finds the terminal response. @param message - Captured response. @returns Whether terminal. */
    (message: unknown) =>
      typeof message === "object" &&
      message !== null &&
      ((message as { type?: string }).type === "result" ||
        (message as { type?: string }).type === "error"),
  ) as Record<string, unknown>;
}

describe("ODT worker runtime" /** Groups worker execution behavior. @returns Nothing. */, () => {
  it("returns the ODT document language across the structured-clone boundary", /** Checks worker import context. @returns Completion after assertions. */ async () => {
    const scope = new CapturingScope();
    const source = new SwDoc({ locale: "ar-SA" });
    new OdtWorkerRuntime(scope).HandleMessage(
      request({
        bytes: writeOdtDocument(source, metadata()).buffer as ArrayBuffer,
        metadata: { title: "Runtime", locale: "en-US" },
        operation: "import",
      }),
    );
    const result = await terminal(scope);
    expect(result.type).toBe("result");
    const transferred = (result.payload as { document: OdtWorkerDocument }).document;
    expect(
      restoreOdtFilterDocument(restoreOdtWorkerDocument(transferred)).document.GetLocale(),
    ).toBe("ar-SA");
  });

  it("imports into a neutral filter document with ordered progress" /** Verifies worker-side ZIP/XML work. @returns Completion after result. */, async () => {
    const scope = new CapturingScope();
    const runtime = new OdtWorkerRuntime(scope);
    const document = createWriterDocument();
    const shell = new SwDocShell(document, metadata());
    new SwWrtShell(shell).Insert("runtime body");
    runtime.HandleMessage(
      request({
        bytes: writeOdtDocument(document, shell.GetDocumentState()).buffer as ArrayBuffer,
        metadata: metadata(),
        operation: "import",
      }),
    );
    expect(await terminal(scope)).toMatchObject({
      id: 1,
      payload: { operation: "import" },
      protocol: 1,
      type: "result",
    });
    expect(scope.messages).toContainEqual(
      expect.objectContaining({ stage: "import:mapping", type: "progress" }),
    );

    const limitedScope = new CapturingScope();
    new OdtWorkerRuntime(limitedScope).HandleMessage(
      request({
        bytes: writeOdtDocument(document, shell.GetDocumentState()).buffer as ArrayBuffer,
        metadata: metadata(),
        operation: "import",
        zipLimits: {
          maxArchiveBytes: 1024 * 1024,
          maxExpansionRatio: 100,
          maxEntries: 10,
          maxEntryBytes: 1024 * 1024,
          maxTotalBytes: 1024 * 1024,
        },
      }),
    );
    expect(await terminal(limitedScope)).toMatchObject({
      payload: { operation: "import" },
      type: "result",
    });
  });

  it("exports a filter document with an exact transferable buffer" /** Verifies worker export and ownership transfer. @returns Completion after result. */, async () => {
    const scope = new CapturingScope();
    const runtime = new OdtWorkerRuntime(scope);
    runtime.HandleMessage(
      request({
        operation: "export",
        document: createOdtWorkerDocument(
          createOdtFilterDocument(createWriterDocument(), metadata().title),
        ),
      }),
    );
    const result = await terminal(scope);
    expect(result).toMatchObject({ payload: { operation: "export" }, type: "result" });
    const bytes = (result.payload as { bytes: ArrayBuffer }).bytes;
    expect(new Uint8Array(bytes).slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(
      scope.transfers.find(
        /** Finds the result transfer list. @param transfer - Captured transfer list. @returns Whether it owns bytes. */ (
          transfer,
        ) => transfer.length > 0,
      ),
    ).toEqual([bytes]);
  });

  it("returns structured protocol, format, and cancellation failures" /** Verifies deterministic non-Error transport. @returns Completion after results. */, async () => {
    const protocolScope = new CapturingScope();
    const protocolRuntime = new OdtWorkerRuntime(protocolScope);
    protocolRuntime.HandleMessage({ id: 7, protocol: 2, type: "request" });
    expect(protocolScope.messages).toContainEqual({
      error: { category: "protocol", message: "ODT worker message is invalid." },
      id: 7,
      protocol: 1,
      type: "error",
    });
    protocolRuntime.HandleMessage(null);
    expect(protocolScope.messages).toContainEqual(
      expect.objectContaining({ id: 0, type: "error" }),
    );
    protocolRuntime.HandleMessage({ id: 99, protocol: 1, type: "cancel" });

    const formatScope = new CapturingScope();
    const formatRuntime = new OdtWorkerRuntime(formatScope);
    formatRuntime.HandleMessage(
      request({
        bytes: new Uint8Array([1, 2, 3]).buffer,
        metadata: metadata(),
        operation: "import",
      }),
    );
    expect(await terminal(formatScope)).toMatchObject({
      error: { category: "format" },
      type: "error",
    });

    const cancelScope = new CapturingScope();
    const cancelRuntime = new OdtWorkerRuntime(cancelScope);
    cancelScope.onPost =
      /** Cancels cooperatively after the style stream. @param message - Posted progress. @returns Nothing. */ (
        message,
      ) => {
        if ((message as { stage?: string }).stage === "import:styles")
          cancelRuntime.HandleMessage({ id: 1, protocol: 1, type: "cancel" });
      };
    const document = createWriterDocument();
    cancelRuntime.HandleMessage(
      request({
        bytes: writeOdtDocument(document, metadata()).buffer as ArrayBuffer,
        metadata: metadata(),
        operation: "import",
      }),
    );
    expect(await terminal(cancelScope)).toMatchObject({
      error: { category: "cancelled" },
      type: "error",
    });
  });
});
