/** @fileoverview Verifies missing lifecycle and failure paths in the current protected browser dialog/IO baseline, without changing its behavior. */
import { promiseHooks } from "node:v8";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterFileDialog } from "./WriterFileDialog";
import {
  IndexedDbWriterOdtStore,
  type BrowserWriterDocument,
  type WriterOdtStore,
} from "../storage/writer-odt-store";
import {
  getAutomaticWriterTitle,
  getUniqueWriterTitle,
  openWriterText,
  overwriteBrowserWriterDocument,
} from "../workflows/writer-odt-io";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual browser/session owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Creates actual native/browser owners. @returns Owned Writer session. */
function session() {
  const value = createWriterDocumentSession();
  sessions.push(value);
  return value;
}
/** Supplies an isolated immutable browser record. @param title - Stored title. @param id - Stored identity. @returns Record. */
function record(title = "Target", id = "target"): BrowserWriterDocument {
  return { bytes: new Uint8Array([1]), id, title, version: 1 };
}
/** Opens the actual inline-title interaction. @param title - Edited title. @returns Nothing. */
function rename(title: string): void {
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  const input = screen.getByRole("textbox", { name: "Document title" });
  fireEvent.change(input, { target: { value: title } });
  fireEvent.blur(input);
}
/** Observes exactly one expected rejected UI promise at the host boundary, retaining every unexpected rejection as a failing assertion. @param action - Known stale-port or invalid-name event. @param message - Expected production guard error. @returns Completion. */
async function expectedUiRejection(action: () => void, message: string): Promise<void> {
  const roots = new WeakSet<Promise<unknown>>(),
    errors: unknown[] = [];
  const stop = promiseHooks.createHook({
    init: /** Tracks root promises without changing production functions. @param promise - New promise. @param parent - Parent for chained promises. @returns Nothing. */ (
      promise,
      parent,
    ) => {
      if (parent === undefined) roots.add(promise);
    },
    settled:
      /** Handles expected host-level rejection before the unhandled event. @param promise - Settled root or child. @returns Nothing. */ (
        promise,
      ) => {
        if (!roots.has(promise)) return;
        roots.delete(promise);
        void promise.catch(
          /** Retains every rejected root for exact comparison. @param error - Rejected value. @returns Nothing. */ (
            error: unknown,
          ) => {
            errors.push(error);
          },
        );
      },
  });
  try {
    action();
    await waitFor(
      /** Waits for the exact observed production error. @returns Nothing. */ () =>
        expect(errors).toHaveLength(1),
    );
    expect(errors[0]).toBeInstanceOf(Error);
    expect((errors[0] as Error).message).toBe(message);
  } finally {
    stop();
  }
}

it("current paragraph heading closes the actual native request without changing history", /** Checks a newly added chrome callback. @returns Nothing. */ () => {
  const owner = session();
  render(<WriterWorkbench isActive services={owner.services} view={owner.view} />);
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /Paragraph/ }));
  const dialog = screen.getByRole("dialog", { name: "Paragraph" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(owner.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});

it.each(["header", "footer"])(
  "current rename conflict cancels through %s without changing title or target",
  /** Checks both independent cancellation controls. @param origin - Cancellation surface. @returns Completion. */ async (
    origin,
  ) => {
    const owner = session(),
      store = {
        list: /** Lists the isolated conflicting record. @returns Current records. */ async () => [
          record(),
        ],
      } as unknown as WriterOdtStore;
    render(
      <WriterWorkbench
        isActive
        services={{ ...owner.services, odtStore: store }}
        view={owner.view}
      />,
    );
    const original = owner.docShell.GetTitle();
    rename("Target");
    const dialog = await screen.findByRole("dialog", { name: "Resolve document name" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: origin === "header" ? "Close" : "Cancel" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(owner.docShell.GetTitle()).toBe(original);
  },
);

it.each([false, true])(
  "current rename reports alternative lookup failures Error=%s",
  /** Checks both existing failure-value contracts. @param useError - Failure representation. @returns Completion. */ async (
    useError,
  ) => {
    const owner = session(),
      failure = useError ? new Error("lookup failed") : "lookup failed",
      list = vi.fn().mockResolvedValueOnce([record()]).mockRejectedValueOnce(failure),
      store = { list } as unknown as WriterOdtStore;
    render(
      <WriterWorkbench
        isActive
        services={{ ...owner.services, odtStore: store }}
        view={owner.view}
      />,
    );
    rename("Target");
    const dialog = await screen.findByRole("dialog", { name: "Resolve document name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save as new" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("lookup failed");
    expect(dialog).toBeVisible();
  },
);

it.each([false, true])(
  "current rename reports overwrite failures Error=%s",
  /** Checks both existing overwrite failure values. @param useError - Failure representation. @returns Completion. */ async (
    useError,
  ) => {
    const owner = session();
    owner.view.GetWrtShell().Insert("Two words");
    const store = {
      list: /** Lists the isolated conflicting record. @returns Current records. */ async () => [
        record(),
      ],
      replace: vi.fn().mockRejectedValue(useError ? new Error("replace failed") : "replace failed"),
    } as unknown as WriterOdtStore;
    render(
      <WriterWorkbench
        isActive
        services={{ ...owner.services, odtStore: store }}
        view={owner.view}
      />,
    );
    rename("Target");
    const dialog = await screen.findByRole("dialog", { name: "Resolve document name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Replace existing" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("replace failed");
    expect(owner.docShell.GetDocumentId()).not.toBe("target");
  },
);

it("current rename without a conflicting record keeps the owned title flow", /** Checks the noncollision branch introduced in the baseline. @returns Completion. */ async () => {
  const owner = session(),
    store = {
      list: /** Lists an empty collision-free store. @returns Current records. */ async () => [],
    } as unknown as WriterOdtStore;
  render(
    <WriterWorkbench
      isActive
      services={{ ...owner.services, odtStore: store }}
      view={owner.view}
    />,
  );
  rename("Unique title");
  await waitFor(
    /** Observes the actual owning shell. @returns Nothing. */ () =>
      expect(owner.docShell.GetTitle()).toBe("Unique title"),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it.each(["blank", "missing"])(
  "current rename guards expected %s alternative input at the host boundary",
  /** Checks current guard behavior without changing protected IO code. @param fault - Invalid name or released storage. @returns Completion. */ async (
    fault,
  ) => {
    const owner = session(),
      store = {
        list: /** Lists the isolated conflicting record. @returns Current records. */ async () => [
          record(),
        ],
      } as unknown as WriterOdtStore;
    const mounted = render(
      <WriterWorkbench
        isActive
        services={{ ...owner.services, odtStore: store }}
        view={owner.view}
      />,
    );
    rename("Target");
    await screen.findByRole("dialog", { name: "Resolve document name" });
    if (fault === "blank")
      fireEvent.change(screen.getByRole("textbox", { name: "New document name" }), {
        target: { value: " " },
      });
    else mounted.rerender(<WriterWorkbench isActive services={owner.services} view={owner.view} />);
    await expectedUiRejection(
      /** Triggers the existing public event. @returns Nothing. */ () =>
        fireEvent.click(screen.getByRole("button", { name: "Save as new" })),
      fault === "blank" ? "Document name is required." : "Browser storage is unavailable.",
    );
    expect(screen.getByRole("dialog", { name: "Resolve document name" })).toBeVisible();
  },
);

it("current overwrite guard keeps a conflict when its storage port disappears", /** Checks stale-port admission without a write. @returns Completion. */ async () => {
  const owner = session(),
    store = {
      list: /** Lists the isolated conflicting record. @returns Current records. */ async () => [
        record(),
      ],
    } as unknown as WriterOdtStore;
  const mounted = render(
    <WriterWorkbench
      isActive
      services={{ ...owner.services, odtStore: store }}
      view={owner.view}
    />,
  );
  rename("Target");
  await screen.findByRole("dialog", { name: "Resolve document name" });
  mounted.rerender(<WriterWorkbench isActive services={owner.services} view={owner.view} />);
  fireEvent.click(screen.getByRole("button", { name: "Replace existing" }));
  expect(screen.getByRole("dialog", { name: "Resolve document name" })).toBeVisible();
});

it.each(["cancel", "blank", "missing"])(
  "current file collision handles %s without importing",
  /** Checks new collision lifecycle and guard paths. @param fault - Collision action. @returns Completion. */ async (
    fault,
  ) => {
    const owner = session(),
      close = vi.fn(),
      store = {
        list: /** Lists the imported title conflict. @returns Current records. */ async () => [
          record("import"),
        ],
      } as unknown as WriterOdtStore;
    const ports = { ...owner.services, odtStore: store };
    const mounted = render(
      <WriterFileDialog docShell={owner.docShell} kind="open" onClose={close} services={ports} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["New body"], "import.txt")] },
    });
    await screen.findByRole("textbox", { name: "New document name" });
    if (fault === "cancel") {
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("textbox", { name: "New document name" })).not.toBeInTheDocument();
      expect(screen.getByLabelText("Browse")).toBeInTheDocument();
    } else {
      if (fault === "blank")
        fireEvent.change(screen.getByRole("textbox", { name: "New document name" }), {
          target: { value: " " },
        });
      else
        mounted.rerender(
          <WriterFileDialog
            docShell={owner.docShell}
            kind="open"
            onClose={close}
            services={owner.services}
          />,
        );
      fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(
        fault === "blank" ? "Document name is required." : "Browser storage is unavailable.",
      );
    }
    expect(close).not.toHaveBeenCalled();
  },
);

it("current imported bytes detect a released storage service after opening", /** Checks the post-read port guard without changing current import semantics. @returns Completion. */ async () => {
  const owner = session(),
    close = vi.fn();
  let current: WriterOdtStore | undefined;
  let listings = 0;
  const ports = { ...owner.services };
  current = {
    list: /** Releases the host port only after the import list request. @returns Current records. */ async () => {
      if (++listings > 1) current = undefined;
      return [];
    },
  } as unknown as WriterOdtStore;
  Object.defineProperty(ports, "odtStore", {
    get: /** Reads the current host port. @returns Present port or released state. */ () => current,
  });
  render(
    <WriterFileDialog docShell={owner.docShell} kind="open" onClose={close} services={ports} />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  fireEvent.change(screen.getByLabelText("Browse"), {
    target: { files: [new File(["Imported body"], "fresh.txt")] },
  });
  expect(await screen.findByRole("alert")).toHaveTextContent("Browser storage is unavailable.");
  expect(close).not.toHaveBeenCalled();
});

it("current browser naming retains empty tokens and refuses invalid persistence", /** Checks preserved naming and overwrite eligibility deviations. @returns Completion. */ async () => {
  const owner = session(),
    doc = owner.docShell.GetDoc(),
    store = { replace: vi.fn() } as unknown as WriterOdtStore;
  expect(getAutomaticWriterTitle(doc)).toBeUndefined();
  expect(
    /** Requests an invalid title. @returns Allocated title. */ () => getUniqueWriterTitle(" ", []),
  ).toThrow("Document name is required.");
  await expect(overwriteBrowserWriterDocument(owner.docShell, store, record())).rejects.toThrow(
    "Empty documents cannot be saved.",
  );
  owner.view.GetWrtShell().Insert("One");
  await expect(overwriteBrowserWriterDocument(owner.docShell, store, record())).rejects.toThrow(
    "at least two words",
  );
  openWriterText(owner.docShell, new TextEncoder().encode("Named"), "named.txt");
  await overwriteBrowserWriterDocument(owner.docShell, store, record());
  expect(store.replace).toHaveBeenCalledTimes(1);
});

it("current replacement refuses blank titles and can retain the same identity", /** Checks actual atomic same-record writes. @returns Completion. */ async () => {
  const store = new IndexedDbWriterOdtStore("current-replace", new IDBFactory());
  await expect(store.replace(record(" "), "same")).rejects.toThrow("Document name is required.");
  await store.save(record());
  await store.replace({ ...record(), version: 2 }, "target");
  expect((await store.load("target"))?.version).toBe(2);
});

it("current replacement propagates target and transaction host failures", /** Checks new request callbacks through a bounded IndexedDB fault port. @returns Completion. */ async () => {
  const failure = new DOMException("replacement host failure", "UnknownError"),
    target: { error: DOMException; onerror?: () => void } = { error: failure };
  const transaction: {
    error: DOMException;
    onerror?: () => void;
    onabort?: () => void;
    objectStore: () => unknown;
  } = {
    error: failure,
    objectStore: /** Supplies the failing target request. @returns Host store. */ () => ({
      get: /** Reads the target. @returns Request. */ () => target,
    }),
  };
  const db = {
    close: vi.fn(),
    transaction: /** Supplies the failing transaction. @returns Host transaction. */ () => {
      queueMicrotask(
        /** Fires target and transaction failures. @returns Nothing. */ () => {
          target.onerror?.();
          transaction.onerror?.();
          transaction.onabort?.();
        },
      );
      return transaction;
    },
  };
  const opened: { result: typeof db; onsuccess?: () => void } = { result: db };
  const factory = {
    open: /** Opens the controlled host. @returns Request. */ () => {
      queueMicrotask(
        /** Delivers the owned database. @returns Nothing. */ () => opened.onsuccess?.(),
      );
      return opened;
    },
  } as unknown as IDBFactory;
  await expect(
    new IndexedDbWriterOdtStore("current-failed-replace", factory).replace(record(), "old"),
  ).rejects.toThrow("replacement host failure");
  expect(db.close).toHaveBeenCalledTimes(1);
});
