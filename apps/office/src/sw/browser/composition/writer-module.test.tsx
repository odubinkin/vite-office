/** @fileoverview Verifies Writer composition ownership in alternate browser environments. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { RES_PARATR_LINESPACING } from "../../inc/hintids";

import {
  createWriterBrowserSessionServices,
  createWriterDocumentSession,
  createWriterModuleFactory,
  prepareWriterBrowserFonts,
} from "./writer-module";

afterEach(
  /** Runs the test callback. @returns Test callback result. */ () => vi.unstubAllGlobals(),
);
afterEach(
  /** Computes the callback result. @returns Test completion or assertion result. */ () =>
    vi.restoreAllMocks(),
);

describe("Writer browser composition", /** Groups Writer browser composition. @returns Test callback result. */ () => {
  it("uses browser font metrics when native RTF leading needs output-device height", /** Checks uses browser font metrics when native RTF leading needs output-device height. @returns Test completion or assertion result. */ () => {
    const context = {
      font: "",
      measureText: vi.fn(
        /** Checks uses browser font metrics when native RTF leading needs output-device height. @returns Test completion or assertion result. */ () => ({
          fontBoundingBoxAscent: 11,
          fontBoundingBoxDescent: 5,
        }),
      ),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const session = createWriterDocumentSession();
    try {
      const paragraph = session.docShell.GetDoc().paragraphs[0];
      if (paragraph === undefined) throw new Error("Missing Writer paragraph.");
      paragraph.SetText("Leading");
      const spacing = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
      spacing.SetInterLineSpace(80);
      paragraph.SetAttr(spacing);
      expect(new TextDecoder().decode(session.docShell.SerializeRtf())).toContain(
        "\\sl320\\slmult0",
      );
      expect(context.font).toContain("px");
      expect(context.measureText).toHaveBeenCalledWith("Mg");
    } finally {
      session.Close();
    }
  });
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

it("prepares configured role requests without inventing fonts when the host has no font collection", /** Verifies the real composition preparation entry point in a non-font host. @returns Completion. */ async () => {
  await expect(prepareWriterBrowserFonts(document, "en-US")).resolves.toBeUndefined();
});

it("constructs browser ports without a storage host and reopens one lazy factory", /** Checks unavailable storage and one-time metric preparation through real workspace mounts. @returns Nothing. */ () => {
  vi.stubGlobal("localStorage", undefined);
  expect(createWriterBrowserSessionServices().layoutPreferences).toBeUndefined();
  const factory = createWriterModuleFactory();
  const first = render(factory.createWorkspace());
  expect(first.getByRole("region", { name: "Writer workspace" })).toBeInTheDocument();
  first.unmount();
  const second = render(factory.createWorkspace());
  expect(second.getByRole("region", { name: "Writer workspace" })).toBeInTheDocument();
  second.unmount();
});
