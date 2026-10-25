/** @fileoverview Source-contract cases for original std::map relations, URI path resolution and ToIUri conversion. */
import { expect, it } from "vitest";
import {
  Relation,
  Relations,
  OFFICE_DOCUMENT_RELATION as O,
  STRICT_OFFICE_DOCUMENT_RELATION as S,
  MS_OFFICE_RELATION as M,
} from "./relations";
import { decodeToIUri } from "../../../tools/source/fsys/urlobj";

/** Creates an actual relation value. @param id - ID. @param type - Type. @param target - Raw target. @param external - Mode. @returns Relation. */
function relation(id: string, type: string, target: string, external = false): Relation {
  return Object.assign(new Relation(), {
    maId: id,
    maType: type,
    maTarget: target,
    mbExternal: external,
  });
}

it("preserves native defaults, first insertion, value copying and lexical rather than numeric ID order", /** Exercises the actual collection. @returns Nothing. */ () => {
  const value = new Relation(),
    r = new Relations("word/document.xml");
  expect(value).toEqual({ maId: "", maType: "", maTarget: "", mbExternal: false });
  expect(r.getFragmentPath()).toBe("word/document.xml");
  expect(r.size()).toBe(0);
  expect(r.count("rId1")).toBe(0);
  r.emplace("rId2", relation("rId2", "TYPE", "second"));
  const first = relation("rId10", "type", "first");
  r.emplace("rId10", first);
  first.maTarget = "mutated";
  r.emplace("rId10", relation("rId10", "wrong", "duplicate"));
  expect(r.count("rId10")).toBe(1);
  expect(r.size()).toBe(2);
  expect(
    r.entries().map(/** Reads map keys. @param entry - Entry. @returns Key. */ (entry) => entry[0]),
  ).toEqual(["rId10", "rId2"]);
  expect(r.getRelationFromFirstType("TyPe")?.maTarget).toBe("first");
  expect(r.getRelationFromFirstType("missing")).toBeNull();
  expect(r.getRelationFromRelId("missing")).toBeNull();
  expect(r.getFragmentPathFromFirstType("missing")).toBe("");
  expect(r.getFragmentPathFromRelId("missing")).toBe("");
  expect(r.getInternalTargetFromRelId("missing")).toBe("");
  expect(r.getExternalTargetFromRelId("missing")).toBe("");
  r.emplace("nonASCII", relation("nonASCII", "Ä", "unicode"));
  expect(r.getRelationFromFirstType("ä")).toBeNull();
});

it.each([
  ["", "word/document.xml", "word/document.xml"],
  ["", "../word/document.xml", "../word/document.xml"],
  ["word/document.xml", "styles.xml", "word/styles.xml"],
  ["word/document.xml", "../docProps/core.xml", "docProps/core.xml"],
  ["word/document.xml", "../../../root.xml", "root.xml"],
  ["word/document.xml", "./styles.xml", "word/./styles.xml"],
  ["word/document.xml", "folder//styles.xml", "word/folder//styles.xml"],
  ["word/document.xml", "folder/", "word/folder"],
  ["word/document.xml", "/custom/main.xml", "custom/main.xml"],
  ["document.xml", "styles.xml", "styles.xml"],
  ["word/document.xml", "", ""],
])(
  "preserves original path resolution %s + %s",
  /** Verifies the source algorithm including unusual dot/empty segments. @param owner - Owner path. @param target - Target. @param expected - Native output. @returns Nothing. */ (
    owner,
    target,
    expected,
  ) => {
    const r = new Relations(owner),
      value = relation("rId1", "type", target);
    r.emplace("rId1", value);
    expect(r.getFragmentPathFromRelation(value)).toBe(expected);
    expect(r.getFragmentPathFromRelId("rId1")).toBe(expected);
    expect(r.getInternalTargetFromRelId("rId1")).toBe(target);
    expect(r.getExternalTargetFromRelId("rId1")).toBe("");
    value.mbExternal = true;
    const external = new Relations(owner);
    external.emplace("external", value);
    expect(external.getFragmentPathFromRelation(value)).toBe("");
    expect(external.getInternalTargetFromRelId("external")).toBe("");
    expect(external.getExternalTargetFromRelId("external")).toBe(target);
  },
);

it("retains native transitional, strict and Microsoft fallback ordering and independent filtered maps", /** Verifies type identity and owner retention. @returns Nothing. */ () => {
  const r = new Relations("word/document.xml");
  expect(r.getFragmentPathFromFirstTypeFromOfficeDoc("styles")).toBe("");
  r.emplace("ms", relation("ms", M + "styles", "ms.xml"));
  expect(r.getFragmentPathFromFirstTypeFromOfficeDoc("styles")).toBe("word/ms.xml");
  r.emplace("strict", relation("strict", S + "styles", "strict.xml"));
  expect(r.getFragmentPathFromFirstTypeFromOfficeDoc("styles")).toBe("word/strict.xml");
  r.emplace(
    "transitional",
    relation("transitional", (O + "styles").toUpperCase(), "transitional.xml"),
  );
  expect(r.getFragmentPathFromFirstTypeFromOfficeDoc("styles")).toBe("word/transitional.xml");
  const filtered = r.getRelationsFromTypeFromOfficeDoc("styles");
  expect(filtered.getFragmentPath()).toBe("word/document.xml");
  expect(filtered.size()).toBe(2);
  filtered.emplace("new", relation("new", O + "styles", "new.xml"));
  expect(r.count("new")).toBe(0);
  const external = new Relations("");
  external.emplace("a", relation("a", O + "officeDocument", "https://example.test", true));
  external.emplace("b", relation("b", S + "officeDocument", "strict.xml"));
  expect(external.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument")).toBe("");
});

it.each([
  ["", ""],
  ["plain 😃", "plain 😃"],
  ["%", "%"],
  ["%0", "%0"],
  ["%zz", "%zz"],
  ["%2f%20%00%7f", "%2F%20%00%7F"],
  ["%c3%a9%2F", "é%2F"],
  ["%E2%82%AC", "€"],
  ["%F0%9F%98%83", "😃"],
  ["%C0%AF", "%C0%AF"],
  ["%E0%80%AF", "%E0%80%AF"],
  ["%F0%80%80%AF", "%F0%80%80%AF"],
  ["%ED%A0%80", "%ED%A0%80"],
  ["%F4%90%80%80", "%F4%90%80%80"],
  ["%F5%80%80%80", "%F5%80%80%80"],
  ["%C3", "%C3"],
  ["%E2%82X", "%E2%82X"],
  ["%E2%82%zz", "%E2%82%zz"],
  ["%E2%42%AC", "%E2%42%AC"],
  ["%C3%A9%ff%C3%B1", "é%FFñ"],
])(
  "ports ToIUri escaped UTF8 %s",
  /** Verifies the actual consumed native mode. @param input - Input. @param output - Original result. @returns Nothing. */ (
    input,
    output,
  ) => {
    expect(decodeToIUri(input)).toBe(output);
  },
);
