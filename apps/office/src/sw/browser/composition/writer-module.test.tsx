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

it.each([
  [null, "Writer output device is unavailable."],
  [
    { actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 },
    "Writer output device could not measure the font height.",
  ],
  [
    { actualBoundingBoxAscent: Infinity, actualBoundingBoxDescent: 0 },
    "Writer output device could not measure the font height.",
  ],
] as const)(
  "rejects unavailable or invalid physical font metrics %s",
  /** Verifies real host-failure boundaries during native RTF leading. @param metrics - Host metrics or no device. @param message - Diagnostic. @returns Nothing. */ (
    metrics,
    message,
  ) => {
    const context =
      metrics === null
        ? null
        : {
            font: "",
            measureText:
              /** Returns the host's incomplete metric payload. @returns Physical metrics. */ () =>
                metrics,
          };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D | null,
    );
    const session = createWriterDocumentSession();
    try {
      const paragraph = session.docShell.GetDoc().paragraphs[0];
      if (!paragraph) throw new Error("Missing Writer paragraph");
      const spacing = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
      spacing.SetInterLineSpace(80);
      paragraph.SetAttr(spacing);
      expect(
        /** Serializes through the real output device binding. @returns Bytes. */ () =>
          session.docShell.SerializeRtf(),
      ).toThrow(message);
    } finally {
      session.Close();
    }
  },
);
it("falls back to actual glyph bounds when the browser omits font bounding boxes", /** Verifies metric API fallback rather than fabricated physical height. @returns Nothing. */ () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    font: "",
    measureText:
      /** Supplies actual glyph metrics from a browser without font bounding fields. @returns Measured bounds. */ () => ({
        actualBoundingBoxAscent: 9,
        actualBoundingBoxDescent: 3,
      }),
  } as unknown as CanvasRenderingContext2D);
  const session = createWriterDocumentSession();
  try {
    const paragraph = session.docShell.GetDoc().paragraphs[0];
    if (!paragraph) throw new Error("Missing Writer paragraph");
    const spacing = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
    spacing.SetInterLineSpace(80);
    paragraph.SetAttr(spacing);
    expect(new TextDecoder().decode(session.docShell.SerializeRtf())).toContain("\\sl260\\slmult0");
  } finally {
    session.Close();
  }
});
