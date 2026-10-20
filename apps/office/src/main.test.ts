/** @fileoverview Verifies that the real browser entrypoint waits for font preparation before synchronous document/module construction. */
import { afterEach, expect, it, vi } from "vitest";
const calls = vi.hoisted(
  /** Creates observable composition boundaries. @returns Mock ports. */ () => ({
    mount: vi.fn(),
    prepare: vi.fn(),
    calcFactory: vi.fn(
      /** Returns the Calc module boundary. @returns Token. */ () => "calc-factory",
    ),
    factory: vi.fn(/** Returns the module boundary. @returns Token. */ () => "writer-factory"),
    descriptors: vi.fn(/** Returns module descriptors. @returns Token. */ () => "descriptors"),
  }),
);
vi.mock(
  "./framework/browser/app/bootstrap",
  /** Binds root mounting. @returns Module. */ () => ({ mountApplication: calls.mount }),
);
vi.mock(
  "./framework/browser/app/modulemanager",
  /** Binds module registry. @returns Module. */ () => ({
    createOfficeModuleDescriptors: calls.descriptors,
  }),
);
vi.mock(
  "./sw/browser/composition/writer-module",
  /** Binds actual preparation/module composition boundaries. @returns Module. */ () => ({
    createWriterModuleFactory: calls.factory,
    prepareWriterBrowserFonts: calls.prepare,
  }),
);
vi.mock(
  "./sc/browser/composition/calc-module",
  /** Keeps both application factories observable without constructing documents during bootstrap. @returns Module. */ () => ({
    createCalcModuleFactory: calls.calcFactory,
  }),
);
afterEach(
  /** Restores host state and isolated entrypoint modules. @returns Nothing. */ () => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.resetModules();
  },
);
it.each(["fr-FR", undefined])(
  "waits for prepared fonts with host locale %s",
  /** Verifies observable ordering without loading application implementation into the bootstrap test. @param language - Host language or absent navigator. @returns Completion. */ async (
    language,
  ) => {
    vi.stubGlobal("navigator", language === undefined ? undefined : { language });
    let finish: (() => void) | undefined;
    calls.prepare.mockReturnValue(
      new Promise<void>(
        /** Holds platform preparation pending. @param resolve - Completion. @returns Nothing. */ (
          resolve,
        ) => {
          finish = resolve;
        },
      ),
    );
    await import("./main");
    expect(calls.prepare).toHaveBeenCalledWith(document, language ?? "en-US");
    expect(calls.mount).not.toHaveBeenCalled();
    expect(calls.factory).not.toHaveBeenCalled();
    expect(calls.calcFactory).not.toHaveBeenCalled();
    finish?.();
    await Promise.resolve();
    expect(calls.factory).toHaveBeenCalledOnce();
    expect(calls.calcFactory).toHaveBeenCalledOnce();
    expect(calls.descriptors).toHaveBeenCalledWith(["writer-factory", "calc-factory"]);
    expect(calls.mount).toHaveBeenCalledWith(document.getElementById("root"), "descriptors");
  },
);
