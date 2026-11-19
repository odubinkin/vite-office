/** @fileoverview Original first-use temp-base conversion failure/retry and named-file memory fallback using genuine runtime environment, without resetting static state or supplying a fake file service. */
import { expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { getenv } from "../../../external/emscripten/locale";
import { TempFile } from "../../../udkapi/com/sun/star/io/TempFile";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { own, read, releaseDomScope } from "../../../test/native-dom";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
it("retains failed empty TMPDIR fallback and retries the actual environment on the next construction", /** No existing native cache is overwritten; this realm observes original first initialization. @returns Completion. */ async () => {
  const runtime = await initializeRuntime(),
    old = getenv("TMPDIR"),
    key = runtime._malloc(7),
    data = runtime._malloc(Math.max(old?.length ?? 0, 4) + 1);
  runtime.stringToUTF8("TMPDIR", key, 7);
  /** Original setenv native call with actual value bytes. @param value - Original byte value. @returns Nothing. */
  function set(value: Uint8Array): void {
    runtime.HEAPU8.set(value, data);
    runtime.HEAPU8[data + value.length] = 0;
    expect(runtime._setenv(key, data, 1)).toBe(0);
  }
  try {
    set(new Uint8Array());
    const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
      failed = own(TempFile.create(context));
    expect(read(failed.operatorStar().getUri())).toBe("");
    expect(read(failed.operatorStar().getResourceName())).toBe("");
    const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(3)),
      fields = bytes.getArray() as SequenceElements;
    for (let index = 0; index < 3; index++) (fields.get(index) as [number])[0] = index + 7;
    const output = own(failed.operatorStar().getOutputStream());
    output.operatorStar().writeBytes(bytes);
    output.operatorStar().closeOutput();
    const input = own(failed.operatorStar().getInputStream()),
      result = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    expect(input.operatorStar().readBytes(result, 3)).toBe(3);
    input.operatorStar().closeInput();
    set(Uint8Array.of(47, 116, 109, 112));
    const recovered = own(TempFile.create(context));
    expect(read(recovered.operatorStar().getUri())).toMatch(/^file:\/\/\/tmp\/lu/);
  } finally {
    if (old === null) expect(runtime._unsetenv(key)).toBe(0);
    else set(old);
    releaseDomScope();
    runtime._free(data);
    runtime._free(key);
  }
});
