/** @fileoverview Original native relation/map/path contracts through actual RTL values and shared owners, including counted Unicode and retained native copies. No alternate relation/URI provider. */
import { afterEach, expect, it } from "vitest";
import { Relation, Relations, type RelationConstReference } from "./relations.native";
import { SharedReference } from "./shared-reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const O = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/",
  S = "http://purl.oclc.org/ooxml/officeDocument/relationships/",
  M = "http://schemas.microsoft.com/office/2006/relationships/";
afterEach(releaseDomScope);
/** Actual native type view. @param value - Fixture units. @returns Borrowed view. */
function view(value: OUStringConstReference): Uint16Array {
  return value.getStr().subarray(0, value.getLength());
}
/** Actual source relation fields. @param id - Native ID fixture. @param type - Type fixture. @param target - Target fixture. @param external - Source flag. @returns Owned native relation. */
function relation(id: string, type: string, target: string, external = false): Relation {
  const value = own(new Relation());
  value.maId = u(id);
  value.maType = u(type);
  value.maTarget = u(target);
  value.mbExternal = external;
  return value;
}
it("copies actual native fields and orders keys by counted UTF16 with first-emplace retention", /** Embedded NUL keys must not truncate or alias the caller's relation. @returns Nothing. */ () => {
  const values = own(new Relations(u("word/document.xml"))),
    first = relation("b", "TyPe", "one.xml");
  expect(first.mbExternal).toBe(false);
  values.emplace(u("b"), first);
  first.maTarget = u("changed");
  values.emplace(u("b"), relation("b", "other", "ignored"));
  values.emplace(u("a\0z"), relation("a\0z", "type", "two.xml"));
  values.emplace(u("a"), relation("a", "type", "three.xml"));
  expect(
    values
      .entries()
      .map(
        /** Observes only native key units. @param entry - Actual entry. @returns Fixture spelling. */ ([
          key,
        ]) => text(key),
      ),
  ).toEqual(["a", "a\0z", "b"]);
  expect(values.size()).toBe(3);
  expect(values.count(u("b"))).toBe(1);
  expect(values.count(u("none"))).toBe(0);
  expect(text((values.getRelationFromRelId(u("b")) as RelationConstReference).maTarget)).toBe(
    "one.xml",
  );
  expect(
    text((values.getRelationFromFirstType(view(u("TYPE"))) as RelationConstReference).maId),
  ).toBe("a");
  expect(values.getRelationFromFirstType(view(u("absent")))).toBeNull();
  expect(read(values.getExternalTargetFromRelId(u("b")))).toBe("");
  expect(read(values.getInternalTargetFromRelId(u("b")))).toBe("one.xml");
  expect(read(values.getInternalTargetFromRelId(u("none")))).toBe("");
  expect(read(values.getExternalTargetFromRelId(u("none")))).toBe("");
});
it.each([
  ["", "", false, ""],
  ["", "字😀.xml", false, "字😀.xml"],
  ["word/document.xml", "/absolute.xml", false, "absolute.xml"],
  ["word/document.xml", "styles.xml", false, "word/styles.xml"],
  ["word/document.xml", "../media/字.xml", false, "media/字.xml"],
  ["file.xml", "../x", false, "x"],
  ["word/document.xml", "./x", false, "word/./x"],
  ["a/b/document.xml", "../../x", false, "x"],
  ["word/document.xml", "//x", false, "/x"],
  ["a/b/document.xml", "c//x", false, "a/b/c//x"],
  ["word/document.xml", "x/", false, "word/x"],
  ["word/document.xml", "https://example.test", true, ""],
] as const)(
  "preserves original native target resolution %s %s",
  /** Original dot/empty/root semantics are not replaced with browser URL normalization. @param path - Owner path. @param target - Target. @param external - Source external flag. @param expected - Source result. @returns Nothing. */ (
    path,
    target,
    external,
    expected,
  ) => {
    const values = own(new Relations(u(path))),
      value = relation("id", "type", target, external);
    values.emplace(u("id"), value);
    expect(read(values.getFragmentPathFromRelation(value))).toBe(expected);
    expect(read(values.getFragmentPathFromRelId(u("id")))).toBe(expected);
    expect(read(values.getFragmentPathFromFirstType(view(u("type"))))).toBe(expected);
    expect(read(values.getExternalTargetFromRelId(u("id")))).toBe(external ? target : "");
    expect(read(values.getInternalTargetFromRelId(u("id")))).toBe(external ? "" : target);
  },
);
it("retains original office type fallback, external short-circuit and shared filtered result copies", /** Actual source collections remain independently owned. @returns Nothing. */ () => {
  const values = own(new Relations(u("word/document.xml"))),
    type = view(u("styles"));
  expect(read(values.getFragmentPathFromFirstTypeFromOfficeDoc(type))).toBe("");
  expect(read(values.getFragmentPathFromRelId(u("none")))).toBe("");
  expect(read(values.getFragmentPathFromFirstType(type))).toBe("");
  values.emplace(u("ms"), relation("ms", M + "styles", "ms.xml"));
  expect(read(values.getFragmentPathFromFirstTypeFromOfficeDoc(type))).toBe("word/ms.xml");
  values.emplace(u("strict"), relation("strict", S + "styles", "strict.xml"));
  expect(read(values.getFragmentPathFromFirstTypeFromOfficeDoc(type))).toBe("word/strict.xml");
  values.emplace(u("trans"), relation("trans", (O + "styles").toUpperCase(), "trans.xml", true));
  expect(read(values.getFragmentPathFromFirstTypeFromOfficeDoc(type))).toBe("");
  const filtered = own(values.getRelationsFromTypeFromOfficeDoc(type));
  expect(filtered.operatorStar().size()).toBe(2);
  expect(text(filtered.operatorStar().getFragmentPath())).toBe("word/document.xml");
  filtered.operatorStar().emplace(u("new"), relation("new", O + "styles", "new.xml"));
  expect(values.count(u("new"))).toBe(0);
  expect(
    own(values.getRelationsFromTypeFromOfficeDoc(view(u("missing"))))
      .operatorStar()
      .size(),
  ).toBe(0);
});
it("retains actual shared copies, resets, copy assignment and self-move without another lifetime registry", /** Live retained native strings witness the last-pointee destructor while remaining valid. @returns Nothing. */ () => {
  const empty = own(new SharedReference<Relations>());
  expect(empty.is()).toBe(false);
  expect(empty.get()).toBeNull();
  expect(empty.use_count()).toBe(0);
  const first = own(new SharedReference(new Relations(u("first")))),
    retained = own(new OUString(first.operatorStar().getFragmentPath())),
    copy = own(new SharedReference(first));
  expect(retained.pData.refCount).toBe(3);
  expect(copy.use_count()).toBe(2);
  expect(copy.get()).toBe(first.get());
  copy.assign(copy);
  expect(copy.use_count()).toBe(2);
  empty.assign(copy);
  expect(copy.use_count()).toBe(3);
  first.reset();
  expect(copy.use_count()).toBe(2);
  const moved = own(SharedReference.move(copy));
  expect(copy.is()).toBe(false);
  expect(moved.use_count()).toBe(2);
  moved.moveAssign(moved);
  expect(moved.use_count()).toBe(2);
  const other = own(new SharedReference(new Relations(u("other"))));
  other.moveAssign(moved);
  expect(moved.is()).toBe(false);
  expect(other.use_count()).toBe(2);
  empty.reset();
  other.reset();
  expect(retained.pData.refCount).toBe(2);
  expect(text(retained)).toBe("first");
});
