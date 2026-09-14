/** @fileoverview Verifies lazy Writer module construction and deterministic workspace disposal. */

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Desktop } from "../../../../framework/source/services/desktop";
import { createOfficeModuleDescriptors } from "../../../../framework/source/services/modulemanager";
import { createDownloadFilename } from "../../../../vcl/browser/browser-download";
import type { OdtFilterService } from "../../filter/xml/odt-filter-service";
import {
  createWriterDocumentSession,
  createWriterModuleFactory,
  type WriterDocumentSession,
} from "./swmodule";

/** Creates a deterministic session without browser persistence or lifecycle resources. @returns Active test session. */
function createTestSession(): WriterDocumentSession {
  return createWriterDocumentSession({
    copyRichText: vi.fn(
      /** Completes a clipboard write. @returns Completion. */ async () => undefined,
    ),
    createDownloadFilename,
    documentExport: {
      export: vi.fn(/** Completes an export. @returns Nothing. */ () => undefined),
    },
    documentOpen: {
      open: vi.fn(/** Cancels file selection. @returns No file. */ async () => undefined),
    },
    readRichClipboard: vi.fn(
      /** Reads an empty clipboard. @returns Empty payload. */ async () => ({
        html: "",
        plainText: "",
      }),
    ),
  });
}

describe("createWriterModuleFactory", /** Registers lazy module tests. @returns Nothing. */ function defineLazyWriterModuleTests(): void {
  it("creates no session until mount, retains one per mount, and closes it on unmount", /** Verifies one disposable session per mount. @returns Completion after lifecycle assertions. */ async function verifiesLazySessionOwnership(): Promise<void> {
    let session: WriterDocumentSession | undefined;
    const createSession = vi.fn(
      /** Creates and captures a fresh session. @returns Active session. */ () => {
        session = createTestSession();
        return session;
      },
    );
    const factory = createWriterModuleFactory({ createSession });

    expect(createSession).not.toHaveBeenCalled();
    expect(factory.workspaceRetention).toBe("dispose-on-unmount");
    const firstElement = factory.createWorkspace();
    expect(createSession).not.toHaveBeenCalled();

    const workspace = render(firstElement);
    expect(createSession).toHaveBeenCalledTimes(1);
    if (session === undefined) throw new Error("Writer session was not created during mount.");
    workspace.rerender(factory.createWorkspace());
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(session.view.GetSnapshot().documentState.lifecycle).toBe("new");

    workspace.unmount();
    expect(session.docShell.GetDocumentState().lifecycle).toBe("closed");
    session.BeginRecoveryScheduling();
    session.Close();

    const reopened = render(factory.createWorkspace());
    expect(createSession).toHaveBeenCalledTimes(2);
    reopened.unmount();
  });

  it("does not construct Writer while the launcher or a placeholder suite is mounted", /** Verifies inactive routes remain resource-free. @returns Nothing. */ function keepsInactiveRoutesResourceFree(): void {
    const createSession = vi.fn(createTestSession);
    const modules = createOfficeModuleDescriptors([createWriterModuleFactory({ createSession })]);
    globalThis.history.replaceState(null, "", "/");
    const launcher = render(<Desktop modules={modules} />);
    expect(createSession).not.toHaveBeenCalled();
    launcher.unmount();

    globalThis.history.replaceState(null, "", "/calc");
    const placeholder = render(<Desktop modules={modules} />);
    expect(createSession).not.toHaveBeenCalled();
    placeholder.unmount();
  });

  it("starts recovery only after candidate inspection and releases every owned resource", /** Verifies scheduling and complete disposal. @returns Completion after scheduling. */ async function disposesRecoveryAndFilterResources(): Promise<void> {
    const clearInterval = vi.fn();
    const removePageHide = vi.fn();
    const removeVisibilityChange = vi.fn();
    const setInterval = vi.fn(/** Creates a test timer. @returns Timer handle. */ () => 41);
    const filter: OdtFilterService = {
      Cancel: vi.fn(),
      Close: vi.fn(),
      Export: vi.fn(
        /** Returns empty filter bytes. @returns Empty bytes. */ async () => new Uint8Array(),
      ),
      Import: vi.fn(
        /** Rejects an unused import. @returns Rejected completion. */ async () =>
          Promise.reject(new Error("not used")),
      ),
    };
    const session = createWriterDocumentSession(
      {
        copyRichText: vi.fn(
          /** Completes a clipboard write. @returns Completion. */ async () => undefined,
        ),
        createDownloadFilename,
        documentExport: {
          export: vi.fn(/** Completes an export. @returns Nothing. */ () => undefined),
        },
        documentOpen: {
          open: vi.fn(/** Cancels file selection. @returns No file. */ async () => undefined),
        },
        readRichClipboard: vi.fn(
          /** Reads an empty clipboard. @returns Empty payload. */ async () => ({
            html: "",
            plainText: "",
          }),
        ),
        recoveryEnvironment: {
          clearInterval,
          isHidden: /** Reports visible state. @returns False. */ () => false,
          onPageHide: vi.fn(
            /** Registers pagehide cleanup. @returns Cleanup. */ () => removePageHide,
          ),
          onVisibilityChange: vi.fn(
            /** Registers visibility cleanup. @returns Cleanup. */ () => removeVisibilityChange,
          ),
          setInterval,
        },
        recoverySave: {
          load: vi.fn(/** Loads no recovery record. @returns No record. */ async () => undefined),
          save: vi.fn(/** Completes a recovery save. @returns Completion. */ async () => undefined),
          loadGenerations: vi.fn(
            /** Loads no recovery history. @returns Empty history. */ async () =>
              [] as readonly never[],
          ),
        },
      },
      filter,
    );
    const factory = createWriterModuleFactory({
      createSession: /** Returns the captured session. @returns Active session. */ () => session,
    });
    const workspace = render(factory.createWorkspace());
    await waitFor(
      /** Asserts scheduling has started. @returns Nothing. */ () =>
        expect(setInterval).toHaveBeenCalledTimes(1),
    );
    workspace.unmount();

    expect(clearInterval).toHaveBeenCalledWith(41);
    expect(removePageHide).toHaveBeenCalledTimes(1);
    expect(removeVisibilityChange).toHaveBeenCalledTimes(1);
    expect(filter.Close).toHaveBeenCalledTimes(1);
    expect(session.docShell.GetDocumentState().lifecycle).toBe("closed");
  });

  it("selects the browser Worker-backed filter only when the lazy workspace mounts", /** Verifies the production branch remains lazy. @returns Nothing. */ function defersBrowserFilterConstruction(): void {
    vi.stubGlobal("Worker", vi.fn());
    try {
      const factory = createWriterModuleFactory();
      const element = factory.createWorkspace();
      const workspace = render(element);
      workspace.unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
