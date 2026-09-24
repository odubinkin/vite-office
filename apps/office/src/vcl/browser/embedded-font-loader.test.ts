/** @fileoverview Checks document font installation, fallback and revocation at the browser boundary. */

import { describe, expect, it, vi } from "vitest";
import { installWriterEmbeddedFonts, type BrowserEmbeddedFont } from "./embedded-font-loader";

const resource: BrowserEmbeddedFont = {
  familyName: "Package Serif",
  style: "normal",
  weight: "bold",
  bytes: new Uint8Array([1, 2, 3]),
  canLoad: true,
};

describe("embedded browser fonts", /** Groups availability and lifecycle tests. @returns Nothing. */ () => {
  it("reports fallback when the browser API or a viewable resource is absent", /** Keeps selected family identity while showing unavailable status. @returns Nothing. */ () => {
    const onChange = vi.fn();
    installWriterEmbeddedFonts([resource], undefined, undefined, onChange)();
    expect(onChange).toHaveBeenCalledWith("Package Serif", false);
    const fontSet = { add: vi.fn(), delete: vi.fn() } as unknown as FontFaceSet;
    /** Minimal successfully loaded browser face. */
    class FakeFontFace {
      /** Resolves without loading. @returns Fake browser face. */ public async load(): Promise<FakeFontFace> {
        return this;
      }
    }
    installWriterEmbeddedFonts(
      [
        { ...resource, canLoad: false },
        {
          familyName: resource.familyName,
          style: resource.style,
          weight: resource.weight,
          canLoad: true,
        },
      ],
      fontSet,
      FakeFontFace as unknown as typeof FontFace,
      onChange,
    )();
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(fontSet.add).not.toHaveBeenCalled();
  });

  it("installs a loaded face and revokes it when its document leaves the browser", /** Checks the bounded document lifecycle. @returns Completion. */ async () => {
    const added = vi.fn();
    const deleted = vi.fn();
    const onChange = vi.fn();
    /** Captures the constructor arguments passed to the browser API. */
    class FakeFontFace {
      /** Captures requested family and descriptors. @param family - Family. @param bytes - Font bytes. @param descriptors - CSS metadata. @returns Nothing. */
      public constructor(
        public readonly family: string,
        public readonly bytes: ArrayBuffer,
        public readonly descriptors: FontFaceDescriptors,
      ) {}
      /** Resolves one fake load. @returns Face. */ public async load(): Promise<FakeFontFace> {
        return this;
      }
    }
    const cleanup = installWriterEmbeddedFonts(
      [resource],
      { add: added, delete: deleted } as unknown as FontFaceSet,
      FakeFontFace as unknown as typeof FontFace,
      onChange,
    );
    await Promise.resolve();
    expect(added).toHaveBeenCalledOnce();
    expect(added.mock.calls[0]?.[0]).toMatchObject({
      family: "Package Serif",
      descriptors: { style: "normal", weight: "bold" },
    });
    expect(onChange).toHaveBeenCalledWith("Package Serif", true);
    cleanup();
    expect(deleted).toHaveBeenCalledWith(added.mock.calls[0]?.[0]);
  });

  it("reports decode failure and ignores a late load after revocation", /** Prevents stale document fonts from leaking into the next document. @returns Completion. */ async () => {
    let resolveLate: ((value: FakeFontFace) => void) | undefined;
    /** Simulates failed and delayed browser font decoding. */
    class FakeFontFace {
      /** Creates a controlled font load. @returns Pending face. */ public load(): Promise<FakeFontFace> {
        return new Promise(
          /** Records a deferred load resolution. @param resolve - Completes loading. @param reject - Rejects loading. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            resolveLate = resolve;
            if (failNext) reject(new Error("decode failed"));
          },
        );
      }
    }
    let failNext = true;
    const added = vi.fn();
    const onChange = vi.fn();
    const fontSet = { add: added, delete: vi.fn() } as unknown as FontFaceSet;
    const cleanupFailed = installWriterEmbeddedFonts(
      [resource],
      fontSet,
      FakeFontFace as unknown as typeof FontFace,
      onChange,
    );
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledWith("Package Serif", false);
    cleanupFailed();
    failNext = false;
    const cleanup = installWriterEmbeddedFonts(
      [resource],
      fontSet,
      FakeFontFace as unknown as typeof FontFace,
      onChange,
    );
    cleanup();
    resolveLate?.(new FakeFontFace());
    await Promise.resolve();
    expect(added).not.toHaveBeenCalled();
    const callsBeforeLateFailure = onChange.mock.calls.length;
    failNext = true;
    installWriterEmbeddedFonts(
      [resource],
      fontSet,
      FakeFontFace as unknown as typeof FontFace,
      onChange,
    )();
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(callsBeforeLateFailure);
  });
});
