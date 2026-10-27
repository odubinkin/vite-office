/** @fileoverview Exercises collector-delivered lifetime notifications through real registered Writer listeners and controlled host expiry. */
import { afterEach, assert, expect, it, vi } from "vitest";
/** One observed host registry and its original callback. */
interface Registration {
  registry: FinalizationRegistry<unknown>;
  callback: (held: unknown) => void;
  target: WeakRef<WeakKey>;
  held: unknown;
}
afterEach(
  /** Restores the host API and module identities after each isolated lifetime case. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  },
);
it("detaches real character and internet listener owners on collector notification and expired weak references", /** Verifies ownership at the JavaScript collector boundary. @returns Nothing. */ async () => {
  vi.resetModules();
  const OriginalRegistry = globalThis.FinalizationRegistry,
    callbacks = new WeakMap<object, (held: unknown) => void>(),
    registrations: Registration[] = [];
  /** Observes actual registration without replacing the runtime ownership implementation. */
  class Registry<T> extends OriginalRegistry<T> {
    /** Retains the host callback for deterministic collector-event delivery. @param callback - Original cleanup. @returns Native registry. */ constructor(
      callback: (held: T) => void,
    ) {
      super(callback);
      callbacks.set(this, callback as (held: unknown) => void);
    }
    /** Preserves actual weak registration and records its public host payload. @param target - Weak owner. @param held - Original held value. @param token - Optional unregister token. @returns Nothing. */ override register(
      target: WeakKey,
      held: T,
      token?: WeakKey,
    ): void {
      super.register(target, held, token);
      const callback = callbacks.get(this);
      assert(callback);
      registrations.push({ registry: this, callback, target: new WeakRef(target), held });
    }
  }
  vi.stubGlobal("FinalizationRegistry", Registry);
  const { SwDoc } = await import("../doc/doc"),
    { SwFormatCharFormat, SwFormatINetFormat } = await import("./fmtatr2"),
    { SwTextINetFormat } = await import("./txtatr2"),
    { SwPoolFormatId } = await import("../../../inc/poolfmt");
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  try {
    const style = doc.MakeCharFormat("Lifetime", doc.GetDfltCharFormat()),
      item = new SwFormatCharFormat(style);
    expect(style.GetNotifier().HasListeners()).toBe(true);
    const characterCleanup = registrations.find(
      /** Finds this actual native item registration. @param entry - Host registration. @returns Match. */ (
        entry,
      ) => entry.target.deref() === item,
    );
    assert(characterCleanup);
    characterCleanup.callback(characterCleanup.held);
    expect(style.GetNotifier().HasListeners()).toBe(false);
    const link = new SwTextINetFormat(new SwFormatINetFormat("https://example.test"), 0, 1);
    link.InitINetFormat(node);
    const internetStyle = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_INET_NORMAL);
    assert(internetStyle);
    expect(internetStyle.HasWriterListeners()).toBe(true);
    const internetCleanup = registrations.find(
      /** Finds this actual text attribute registration. @param entry - Host registration. @returns Match. */ (
        entry,
      ) => entry.target.deref() === link,
    );
    assert(internetCleanup);
    internetCleanup.callback(internetCleanup.held);
    expect(internetStyle.HasWriterListeners()).toBe(false);
    for (const entry of [characterCleanup, internetCleanup]) {
      assert(entry.held instanceof WeakRef);
      vi.spyOn(entry.held, "deref").mockReturnValue(undefined);
      entry.callback(entry.held);
    }
    const orphan = new SwTextINetFormat(
      new SwFormatINetFormat("https://example.test/orphan"),
      0,
      1,
    );
    orphan.InitINetFormat(node);
    const originalDeref = WeakRef.prototype.deref;
    vi.spyOn(WeakRef.prototype, "deref").mockImplementation(
      /** Models host expiry of only the now-unreachable text owner. @param this - Actual host weak reference. @returns Live target or expired owner. */ function (
        this: WeakRef<WeakKey>,
      ) {
        const target = originalDeref.call(this);
        return target === orphan ? undefined : target;
      },
    );
    internetStyle.CallSwClientNotify({ kind: "document-state-changed" });
    expect(internetStyle.HasWriterListeners()).toBe(false);
  } finally {
    doc.Dispose();
  }
});
