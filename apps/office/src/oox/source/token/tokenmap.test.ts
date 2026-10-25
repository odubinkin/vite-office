/** @fileoverview Full native token and namespace identities against unchanged generator inputs and outputs, through actual shared FastTokenHandler APIs. */
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

it("retains every original native local token identity and UTF8 output, including punctuation aliases and unknown values", /** Checks the complete token table and public byte transport. @returns Nothing. */ () => {
  const names = tokenText.trimEnd().split("\n"),
    handler = new FastTokenHandler();
  expect(XML_TOKEN_COUNT).toBe(6079);
  expect(names).toHaveLength(XML_TOKEN_COUNT);
  expect(new Set(names).size).toBe(XML_TOKEN_COUNT);
  for (const [id, name] of names.entries()) {
    const bytes = new TextEncoder().encode(name);
    expect(TokenMap.getTokenFromUtf8(name), name).toBe(id);
    expect(handler.getTokenDirect(name), name).toBe(id);
    expect(handler.getTokenFromUTF8(bytes), name).toBe(id);
    expect(handler.getUTF8Identifier(id), name).toEqual(bytes);
  }
  expect(TokenMap.getTokenFromUtf8("sans-serif")).toBeGreaterThanOrEqual(0);
  expect(TokenMap.getTokenFromUtf8("sans_serif")).toBe(XML_TOKEN_INVALID);
  for (const unknown of ["", "unrecognized-OOXML-name", "val ", "😀", "VAL\0", "vAl"])
    expect(handler.getTokenDirect(unknown)).toBe(XML_TOKEN_INVALID);
  expect(handler.getTokenFromUTF8(new Uint8Array([0xff]))).toBe(XML_TOKEN_INVALID);
  expect(handler.getTokenFromUTF8(new Uint8Array([0xef, 0xbb, 0xbf, 118, 97, 108]))).toBe(
    XML_TOKEN_INVALID,
  );
  expect(handler.getUTF8Identifier(-1)).toEqual(new Uint8Array());
  expect(handler.getUTF8Identifier(XML_TOKEN_COUNT)).toEqual(new Uint8Array());
  const output = handler.getUTF8Identifier(0);
  output.fill(0);
  expect(handler.getUTF8Identifier(0)).toEqual(new TextEncoder().encode(names[0]));
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
    expect(map.maTransitionalNamespaceMap.get(token), alias).toBeTypeOf("string");
    expect(map.maStrictNamespaceMap.get(token), alias).toBeTypeOf("string");
  }
  const doc = namespaceTokens.get("doc") as number;
  expect(map.maTransitionalNamespaceMap.get(doc)).toBe(
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  );
  expect(map.maStrictNamespaceMap.get(doc)).toBe(
    "http://purl.oclc.org/ooxml/wordprocessingml/main",
  );
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
