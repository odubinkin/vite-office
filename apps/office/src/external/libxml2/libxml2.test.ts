/** @fileoverview Actual native module bootstrap and byte argument binding, including counted NUL and callback cleanup behavior. */
import { expect, it } from "vitest";
import { getLibXml2, initializeLibXml2, withXmlBytes } from "./libxml2";

it("requires completed initialization and retains one actual library per realm", /** Tests the native dependency bootstrap prerequisite, not a fabricated XML graph. @returns Async completion. */ async () => {
  expect(
    /** Verifies the actual bootstrap precondition. @returns Native module if initialized. */ () =>
      getLibXml2(),
  ).toThrow("must be initialized");
  const first = initializeLibXml2(),
    second = initializeLibXml2();
  expect(first === second).toBe(true);
  const module = await first;
  expect(getLibXml2() === module).toBe(true);
  expect(module.UTF8ToString(module._office_xmlVersion())).toBe("2.15.3");
});

it("retains counted bytes and an extra terminator without applying a JavaScript text conversion", /** Native C APIs select the interpretation of the same actual allocation. @returns Async completion. */ async () => {
  const module = await initializeLibXml2();
  const input = new Uint8Array([65, 0, 66, 0xff]);
  const result = withXmlBytes(
    input,
    /** Reads actual WASM memory and calls real strlen-like libxml behavior. @param pointer - Native address. @param length - Original count. @returns Native count. */ (
      pointer,
      length,
    ) => {
      expect(Array.from(module.HEAPU8.subarray(pointer, pointer + length + 1))).toEqual([
        65, 0, 66, 0xff, 0,
      ]);
      expect(module._xmlStrlen(pointer)).toBe(1);
      return length;
    },
  );
  expect(result).toBe(4);
  expect(Array.from(input)).toEqual([65, 0, 66, 0xff]);
});

it("propagates native-call exceptions through the temporary allocation scope", /** Subsequent real native allocation remains usable after callback unwinding. @returns Async completion. */ async () => {
  const module = await initializeLibXml2(),
    failure = new Error("native caller failure");
  expect(
    /** Invokes the actual temporary-buffer scope. @returns Never. */ () =>
      withXmlBytes(
        new Uint8Array(),
        /** Throws a caller exception through the native argument lifetime scope. @returns Never. */ () => {
          throw failure;
        },
      ),
  ).toThrow(failure);
  const doc = withXmlBytes(
    new Uint8Array([49, 46, 48]),
    /** Creates an actual native document. @param version - Native version string. @returns Native document. */ (
      version,
    ) => module._xmlNewDoc(version),
  );
  try {
    expect(module._office_node_type_get(doc)).toBe(9);
    expect(module._office_node_doc_get(doc)).toBe(doc);
  } finally {
    module._xmlFreeDoc(doc);
  }
});
