/** @fileoverview Full native token and namespace identities against unchanged generator inputs and outputs, through actual shared FastTokenHandler APIs. */
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { expect, it } from "vitest";
import { existsSync, readFileSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import * as TokenMap from "./tokenmap";
import { XML_TOKEN_INVALID, XML_TOKEN_COUNT } from "./tokenmap";
import { NamespaceMap, StaticNamespaceMap, namespaceTokens } from "./namespacemap";
import { FastTokenHandler } from "../core/fasttokenhandler";
import tokenText from "./tokens.txt?raw";
import transitionalText from "./namespaces.txt?raw";
import strictText from "./namespaces-strict.txt?raw";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Owns original counted signed-byte input. @param bytes - Actual fixture bytes. @returns Native input owner. */
function input(bytes: Uint8Array): Sequence<number> {
  const result = new Bytes(bytes.length),
    data = result.getArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i)
    (data.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
  return result;
}
/** Reads initialized native byte values without changing their ownership. @param value - Actual output owner. @returns Assertion bytes. */
function read(value: Sequence<number>): Uint8Array {
  const bytes = new Uint8Array(value.getLength()),
    data = value.getConstArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i) bytes[i] = (data.get(i) as [number])[0];
  return bytes;
}
it("retains every original native local token identity and native Sequence output, including COW and invalid values", /** Exercises every pinned lexical identity and native COW owner. @returns Nothing. */ () => {
  const names = tokenText.trimEnd().split("\n"),
    owner = new Reference(new FastTokenHandler()),
    handler = owner.operatorStar();
  try {
    expect(XML_TOKEN_COUNT).toBe(6079);
    expect(names).toHaveLength(XML_TOKEN_COUNT);
    expect(new Set(names).size).toBe(XML_TOKEN_COUNT);
    for (const [id, name] of names.entries()) {
      const bytes = new TextEncoder().encode(name),
        source = input(bytes),
        output = handler.getUTF8Identifier(id);
      try {
        expect(TokenMap.getTokenFromUtf8(name), name).toBe(id);
        expect(handler.getTokenDirect(name), name).toBe(id);
        expect(handler.getTokenFromUTF8(source), name).toBe(id);
        expect([...read(output)], name).toEqual([...bytes]);
        expect(output.get()).toBe(TokenMap.getUtf8TokenName(id).get());
      } finally {
        output.dispose();
        source.dispose();
      }
    }
    expect(TokenMap.getTokenFromUtf8("sans-serif")).toBeGreaterThanOrEqual(0);
    expect(TokenMap.getTokenFromUtf8("sans_serif")).toBe(XML_TOKEN_INVALID);
    for (const unknown of ["", "unrecognized-OOXML-name", "val ", "😀", "VAL\0", "vAl"])
      expect(handler.getTokenDirect(unknown)).toBe(XML_TOKEN_INVALID);
    for (const bytes of [Uint8Array.of(255), Uint8Array.of(239, 187, 191, 118, 97, 108)]) {
      const source = input(bytes);
      try {
        expect(handler.getTokenFromUTF8(source)).toBe(XML_TOKEN_INVALID);
      } finally {
        source.dispose();
      }
    }
    for (const id of [-1, XML_TOKEN_COUNT]) {
      const output = handler.getUTF8Identifier(id);
      try {
        expect(output.getLength()).toBe(0);
      } finally {
        output.dispose();
      }
    }
    const output = handler.getUTF8Identifier(0),
      shared = TokenMap.getUtf8TokenName(0).get();
    try {
      const data = output.getArray() as SequenceElements;
      expect(output.get()).not.toBe(shared);
      for (let i = 0; i < output.getLength(); ++i) (data.get(i) as [number])[0] = 0;
      const retained = handler.getUTF8Identifier(0);
      try {
        expect(retained.get()).toBe(shared);
        expect([...read(retained)]).toEqual([...new TextEncoder().encode(names[0])]);
      } finally {
        retained.dispose();
      }
    } finally {
      output.dispose();
    }
  } finally {
    owner.dispose();
  }
});

it("retains original namespace IDs, both URI sets and source singleton semantics", /** Exercises actual map owners and canonical namespace aliases. @returns Nothing. */ () => {
  const map = StaticNamespaceMap();
  expect(StaticNamespaceMap()).toBe(map);
  const other = new NamespaceMap();
  expect(other).not.toBe(map);
  expect(other.maTransitionalNamespaceMap).toEqual(map.maTransitionalNamespaceMap);
  expect(other.maStrictNamespaceMap).toEqual(map.maStrictNamespaceMap);
  expect(namespaceTokens.get("doc")).toBeDefined();
  for (const [alias, token] of namespaceTokens) {
    expect(token & 0xffff, alias).toBe(0);
    expect(map.maTransitionalNamespaceMap.get(token), alias).toBeInstanceOf(OUString);
    expect(map.maStrictNamespaceMap.get(token), alias).toBeInstanceOf(OUString);
  }
  const doc = namespaceTokens.get("doc") as number;
  expect(text(map.maTransitionalNamespaceMap.get(doc) as OUString)).toBe(
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  );
  expect(text(map.maStrictNamespaceMap.get(doc) as OUString)).toBe(
    "http://purl.oclc.org/ooxml/wordprocessingml/main",
  );
  const retained = new OUString(other.maTransitionalNamespaceMap.get(doc) as OUString);
  other.dispose();
  try {
    expect(text(retained)).toBe(text(map.maTransitionalNamespaceMap.get(doc) as OUString));
  } finally {
    retained.dispose();
  }
});

const nativeRoot = resolve(process.cwd(), "../../vendor/libreoffice-reference");
it.skipIf(!existsSync(nativeRoot + "/oox/source/token/tokens.txt"))(
  "matches byte-exact pinned inputs and every unchanged native generated token/namespace constant",
  /** Runs the original generators within an owned repository-local temporary directory. @returns Nothing. */ () => {
    mkdirSync(resolve(process.cwd(), "coverage"), { recursive: true });
    const nativeTokens = nativeRoot + "/oox/source/token/",
      directory = mkdtempSync(resolve(process.cwd(), "coverage/native-token-proof-"));
    try {
      expect(tokenText).toBe(readFileSync(nativeTokens + "tokens.txt", "utf8"));
      expect(transitionalText).toBe(readFileSync(nativeTokens + "namespaces.txt", "utf8"));
      expect(strictText).toBe(readFileSync(nativeTokens + "namespaces-strict.txt", "utf8"));
      execFileSync("python3", [
        nativeRoot + "/solenv/bin/generate-tokens.py",
        nativeTokens + "tokens.txt",
        directory + "/ids.hxx",
        directory + "/names.inc",
        directory + "/hash.gperf",
      ]);
      const names = [...readFileSync(directory + "/names.inc", "utf8").matchAll(/"([^"]*)",/g)];
      expect(names).toHaveLength(XML_TOKEN_COUNT);
      for (const [id, name] of names.entries())
        expect(TokenMap.getTokenFromUtf8(name[1] as string)).toBe(id);
      execFileSync("python3", [
        nativeTokens + "namespaces.py",
        nativeTokens + "namespaces.txt",
        directory + "/ns.hxx",
        directory + "/ns.inc",
        directory + "/ns.txt",
        nativeTokens + "namespaces-strict.txt",
        directory + "/strict.inc",
      ]);
      const original = [
        ...readFileSync(directory + "/ns.hxx", "utf8").matchAll(
          /NMSP_(\w+) = (\d+) << NMSP_SHIFT;/g,
        ),
      ];
      expect(original).toHaveLength(namespaceTokens.size);
      for (const entry of original)
        expect(namespaceTokens.get(entry[1] as string)).toBe(Number(entry[2]) << 16);
    } finally {
      rmSync(directory, { recursive: true });
    }
  },
);

it("replays both original TokenmapTest round-trip methods for all tokens", /** Original tokenmap-test.cxx UTF8 and Unicode loops. @returns Nothing. */ () => {
  for (let token = 0; token < XML_TOKEN_COUNT; ++token) {
    const utf8 = new Bytes(TokenMap.getUtf8TokenName(token)),
      unicode = TokenMap.getUnicodeTokenName(token);
    try {
      expect(TokenMap.getTokenFromUtf8(utf8.getConstArray(), utf8.getLength())).toBe(token);
      expect(TokenMap.getTokenFromUnicode(unicode)).toBe(token);
    } finally {
      unicode.dispose();
      utf8.dispose();
    }
  }
});
