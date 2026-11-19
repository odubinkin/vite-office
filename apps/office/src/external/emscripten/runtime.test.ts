/** @fileoverview Actual shared native runtime/MEMFS and libxml2 libc file IO, independent descriptors, unlink lifetime, seeking/truncation and real errno failures; no filesystem provider or document substitute. */
import { expect, it } from "vitest";
import { getRuntime, getFileSystem, initializeRuntime } from "./runtime";
import { initializeLibXml2, getLibXml2, withXmlBytes } from "../libxml2/libxml2";
it("publishes one native runtime and filesystem for XML and subsequent synchronous file users", /** Bootstrap must complete before exposing the real runtime; the XML entry point retains its exact Promise and module identity. @returns Completion. */ async () => {
  expect(getRuntime()).toBeUndefined();
  expect(getFileSystem).toThrow(
    "Emscripten runtime must be initialized before filesystem operations",
  );
  expect(getLibXml2).toThrow("libxml2 must be initialized before constructing XML components");
  const first = initializeRuntime();
  expect(initializeRuntime()).toBe(first);
  expect(initializeLibXml2()).toBe(first);
  const module = await first;
  expect(getRuntime()).toBe(module);
  expect(getLibXml2()).toBe(module);
  expect(getFileSystem()).toBe(module.FS);
});
it("uses the same real filesystem for public MEMFS writes and native libxml2 file parsing", /** Actual C fopen/read sees the bytes written through Emscripten's public FS API, including Unicode names/content. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    path = "/tmp/runtime-字😀.xml",
    file = fs.open(path, "w+", 0o600),
    xml = new TextEncoder().encode("<root>字😀&amp;</root>");
  try {
    expect(fs.write(file, xml, 0, xml.length)).toBe(xml.length);
    expect(fs.fstat(file.fd).size).toBe(xml.length);
    const module = getLibXml2(),
      context = module._xmlNewParserCtxt();
    try {
      const doc = withXmlBytes(
        new TextEncoder().encode(path),
        /** Real C filename input; source default parser flags remain zero. @param pointer - Native terminated path. @returns Actual document address. */ (
          pointer,
        ) => module._xmlCtxtReadFile(context, pointer, 0, 0),
      );
      expect(doc).not.toBe(0);
      try {
        const root = module._xmlDocGetRootElement(doc),
          content = module._xmlNodeGetContent(root);
        try {
          expect(module.UTF8ToString(content)).toBe("字😀&");
        } finally {
          module._office_xmlFree(content);
        }
      } finally {
        module._xmlFreeDoc(doc);
      }
    } finally {
      module._xmlFreeParserCtxt(context);
    }
  } finally {
    fs.close(file);
    fs.unlink(path);
  }
});
it("retains descriptor positions, positional IO and truncate semantics on actual MEMFS", /** Real FS methods manipulate one persistent file object, not a byte-map projection in the tests. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    path = "/tmp/runtime-positions",
    file = fs.open(path, "w+"),
    data = Uint8Array.of(1, 2, 3, 4);
  try {
    fs.write(file, data, 0, data.length);
    expect(file.position).toBe(4);
    const other = fs.open(path, "r");
    try {
      expect(other.fd).not.toBe(file.fd);
      expect(other.position).toBe(0);
      expect(fs.llseek(file, -2, 2)).toBe(2);
      expect(fs.write(file, Uint8Array.of(9), 0, 1, 0)).toBe(1);
      expect(file.position).toBe(2);
      const output = new Uint8Array(4);
      expect(fs.read(other, output, 0, 4)).toBe(4);
      expect([...output]).toEqual([9, 2, 3, 4]);
      expect(file.position).toBe(2);
      expect(other.position).toBe(4);
      fs.ftruncate(file.fd, 1);
      expect(fs.stat(path).size).toBe(1);
      expect(file.position).toBe(2);
      expect(fs.llseek(file, 0, 0)).toBe(0);
      expect(fs.read(file, output, 1, 3)).toBe(1);
      expect(output[1]).toBe(9);
      expect(fs.read(file, output, 0, 4)).toBe(0);
    } finally {
      fs.close(other);
    }
  } finally {
    fs.close(file);
    fs.unlink(path);
  }
});
it("retains open inode lifetime after unlink and reports real descriptor/path failures", /** The original low-level file owner will need both unlink-after-close cleanup and genuine errno propagation. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    dir = "/tmp/runtime-directory",
    path = dir + "/held";
  fs.mkdir(dir, 0o700);
  expect(fs.readdir(dir)).toEqual([".", ".."]);
  const file = fs.open(path, "w+"),
    descriptor = file.fd;
  fs.write(file, Uint8Array.of(7, 8), 0, 2);
  fs.unlink(path);
  try {
    expect(fs.readdir(dir)).toEqual([".", ".."]);
    expect(fs.fstat(file.fd).size).toBe(2);
    expect(fs.llseek(file, 0x100000001, 0)).toBe(0x100000001);
    expect(fs.fstat(file.fd).size).toBe(2); // Seeking beyond uint32 does not allocate a fake gap.

    fs.llseek(file, 0, 0);
    const output = new Uint8Array(2);
    expect(fs.read(file, output, 0, 2)).toBe(2);
    expect([...output]).toEqual([7, 8]);
    expect(
      /** Actual invalid seek origin on an open descriptor. @returns Position or errno failure. */ () =>
        fs.llseek(file, 0, 99),
    ).toThrow();
    let failure: unknown;
    try {
      fs.open(path, "r");
    } catch (error) {
      failure = error;
    }
    expect(failure).toHaveProperty("errno");
    expect(Number.isInteger((failure as { errno: number }).errno)).toBe(true);
  } finally {
    fs.close(file);
  }
  expect(
    /** Actual closed descriptor. @returns Native stat or error. */ () => fs.fstat(descriptor),
  ).toThrow();
  expect(
    /** Actual operation on a closed stream, with no error injector. @returns Position or errno failure. */ () =>
      fs.llseek(file, 0, 99),
  ).toThrow();
});
