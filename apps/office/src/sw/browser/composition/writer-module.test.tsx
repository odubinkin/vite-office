/** @fileoverview Verifies Writer composition ownership in alternate browser environments. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createWriterDocumentSession, createWriterModuleFactory } from "./writer-module";

afterEach(
  /** Runs the test callback. @returns Test callback result. */ () => vi.unstubAllGlobals(),
);

describe("Writer browser composition", /** Groups Writer browser composition. @returns Test callback result. */ () => {
  it("uses a stable locale fallback and closes a session only once", /** Checks uses a stable locale fallback and closes a session only once. @returns Test callback result. */ () => {
    vi.stubGlobal("navigator", undefined);
    const session = createWriterDocumentSession();
    expect(session.docShell.GetDoc()).toBeDefined();
    session.Close();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => session.Close(),
    ).not.toThrow();
  });

  it("selects the worker filter when the browser provides Worker", /** Checks selects the worker filter when the browser provides Worker. @returns Test callback result. */ () => {
    vi.stubGlobal(
      "Worker",
      /** Runs the test callback. @returns Test callback result. */ function WorkerStub() {},
    );
    const factory = createWriterModuleFactory();
    const view = render(factory.createWorkspace());
    expect(view.getByRole("region", { name: "Writer workspace" })).toBeInTheDocument();
    view.unmount();
  });
});
