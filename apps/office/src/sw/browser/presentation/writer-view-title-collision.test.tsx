/** @fileoverview Verifies interactive Writer title-collision resolution. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { expect, it } from "vitest";

import { createWriterDocumentSession } from "../composition/writer-module";
import { IndexedDbWriterOdtStore } from "../storage/writer-odt-store";
import type { WriterAutosaveController } from "../workflows/writer-autosave";
import { autosaveWriter } from "../workflows/writer-odt-io";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import { WriterWorkbench } from "./writer-view";

it("repeats rename collision resolution for an occupied edited alternative", /** Checks editable indexed suggestions before a unique rename. @returns Completion. */ async () => {
  const store = new IndexedDbWriterOdtStore("view-rename-repeat", new IDBFactory());
  const session = createWriterDocumentSession();
  session.view.GetWrtShell().Insert("Current body");
  await autosaveWriter(session.docShell, store);
  await store.save({ bytes: new Uint8Array([1]), id: "target", title: "Target", version: 1 });
  await store.save({
    bytes: new Uint8Array([2]),
    id: "target-1",
    title: "Target (1)",
    version: 1,
  });
  const autosave = {
    Flush: /** Persists the active title change. @returns Save completion. */ () =>
      autosaveWriter(session.docShell, store),
  } as unknown as WriterAutosaveController;
  const services = { odtStore: store } as unknown as WriterSessionServices;
  const rendered = render(
    <WriterWorkbench autosave={autosave} isActive services={services} view={session.view} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: "Target" },
  });
  fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
  const alternative = await screen.findByRole("textbox", { name: "New document name" });
  expect(alternative).toHaveValue("Target (2)");
  fireEvent.change(alternative, { target: { value: "Target (1)" } });
  fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
  await waitFor(
    /** Waits for the repeated collision suggestion. @returns Nothing. */ () => {
      expect(screen.getByRole("dialog", { name: "Resolve document name" })).toBeVisible();
      expect(screen.getByRole("textbox", { name: "New document name" })).toHaveValue("Target (2)");
    },
  );
  fireEvent.change(screen.getByRole("textbox", { name: "New document name" }), {
    target: { value: "Custom title" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
  await waitFor(
    /** Waits for the unique rename to persist. @returns Nothing. */ () =>
      expect(
        screen.queryByRole("dialog", { name: "Resolve document name" }),
      ).not.toBeInTheDocument(),
  );
  expect(session.docShell.GetTitle()).toBe("Custom title");
  expect((await store.load(session.docShell.GetDocumentId()))?.title).toBe("Custom title");
  rendered.unmount();
  session.Close();
});

it("overwrites a rename conflict after explicit confirmation", /** Checks the shared collision dialog replaces the target identity. @returns Completion. */ async () => {
  const store = new IndexedDbWriterOdtStore("view-rename-overwrite", new IDBFactory());
  const session = createWriterDocumentSession();
  session.view.GetWrtShell().Insert("Current body");
  await autosaveWriter(session.docShell, store);
  const previousId = session.docShell.GetDocumentId();
  await store.save({ bytes: new Uint8Array([1]), id: "target", title: "Target", version: 1 });
  const autosave = {
    Flush: /** Persists ordinary title changes. @returns Save completion. */ () =>
      autosaveWriter(session.docShell, store),
  } as unknown as WriterAutosaveController;
  const rendered = render(
    <WriterWorkbench
      autosave={autosave}
      isActive
      services={{ odtStore: store } as unknown as WriterSessionServices}
      view={session.view}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: "Target" },
  });
  fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
  await screen.findByRole("dialog", { name: "Resolve document name" });
  fireEvent.click(screen.getByRole("button", { name: "Replace existing" }));
  await waitFor(
    /** Waits for the target identity to be adopted. @returns Nothing. */ () =>
      expect(session.docShell.GetDocumentId()).toBe("target"),
  );
  expect(session.docShell.GetTitle()).toBe("Target");
  expect(await store.load(previousId)).toBeUndefined();
  expect(await store.list()).toHaveLength(1);
  rendered.unmount();
  session.Close();
});
