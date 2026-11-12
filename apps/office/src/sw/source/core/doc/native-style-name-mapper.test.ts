/** @fileoverview Native style-name table conversion and critical collision contracts, with actual Writer/UNO integration. English tables are regenerated and checked against pinned original arrays/resources. */
import { expect, it } from "vitest";
import { SwStyleNameMapper as Mapper } from "./SwStyleNameMapper";
import { SwGetPoolIdFromName as Family } from "../../../inc/SwGetPoolIdFromName";
import { SwPoolFormatId as Id } from "../../../inc/poolfmt";
import nameData from "./SwStyleNameMapper-data.json" with { type: "json" };
import { SwDoc } from "./doc";
import { SwXStyleFamilies, SwXStyle } from "../unocore/unostyle";
import { OUString } from "../../../../sal/inc/rtl/ustring";
/** Binds an actual counted UTF16 input. @param name - Name. @returns Owning string. */
function unicode(name: string): OUString {
  return new OUString(
    Uint16Array.from(
      name.split(""),
      /** Reads exact code units. @param unit - Unit. @returns Code. */ (unit) =>
        unit.charCodeAt(0),
    ),
    name.length,
  );
}
/** Reads an actual returned native string while ending its value scope. @param name - Owning output. @returns Text. */
function returned(name: OUString): string {
  try {
    return String.fromCharCode(...name.getStr().subarray(0, name.getLength()));
  } finally {
    name.dispose();
  }
}
for (const range of nameData.ranges) {
  for (let offset = 0; offset < range.programmatic.length; offset++) {
    const id = (range.begin + offset) as Id,
      programmatic = range.programmatic[offset] as string,
      ui = range.ui[offset] as string,
      family = range.family as Family;
    it(`maps original ${family}:${id} ${programmatic} in both directions`, /** Checks native table-based operations without inventing a name resolver. @returns Nothing. */ () => {
      expect(Mapper.GetPoolIdFromUIName(ui, family)).toBe(id);
      expect(Mapper.GetPoolIdFromProgName(programmatic, family)).toBe(id);
      expect(Mapper.GetUIName(id, "fallback")).toBe(ui);
      expect(Mapper.GetProgName(id, "fallback")).toBe(programmatic);
      expect(Mapper.GetUIName(programmatic, family)).toBe(ui);
      expect(Mapper.GetProgName(ui, family)).toBe(programmatic);
      expect(Mapper.FillUIName(programmatic, family)).toBe(ui);
      expect(Mapper.FillProgName(ui, family)).toBe(programmatic);
      expect(Mapper.FillUIName(id, "fallback")).toBe(ui);
      expect(Mapper.FillProgName(id, "fallback")).toBe(programmatic);
    });
  }
}
it("keeps exact original UI resources distinct from programmatic paragraph and page names", /** Guards the former names-equal shortcut with independent original literals. @returns Nothing. */ () => {
  expect(Mapper.GetUIName("Text body", Family.TxtColl)).toBe("Body Text");
  expect(Mapper.GetUIName("Text body indent", Family.TxtColl)).toBe("Body Text, Indented");
  expect(Mapper.GetUIName("First line indent", Family.TxtColl)).toBe("First Line Indent");
  expect(Mapper.GetUIName("Standard", Family.PageDesc)).toBe("Default Page Style");
  expect(Mapper.GetPoolIdFromUIName("Text body", Family.TxtColl)).toBe(Id.UNKNOWN);
  expect(Mapper.GetPoolIdFromProgName("Body Text", Family.TxtColl)).toBe(Id.UNKNOWN);
  expect(Mapper.GetPoolIdFromProgName("Body Text", Family.ChrFmt)).toBe(Id.UNKNOWN);
});
it("preserves Fill collisions, default-character special cases and plain Get overload differences", /** Replays original name-disambiguation order. @returns Nothing. */ () => {
  expect(Mapper.FillProgName("Text body", Family.TxtColl)).toBe("Text body (user)");
  expect(Mapper.FillUIName("Body Text", Family.TxtColl)).toBe("Body Text (user)");
  expect(Mapper.FillProgName("Body Text (user)", Family.TxtColl)).toBe("Body Text");
  expect(Mapper.FillUIName("Text body (user)", Family.TxtColl)).toBe("Text body");
  expect(Mapper.GetUIName("Body Text", Family.TxtColl)).toBe("Body Text");
  expect(Mapper.GetProgName("Text body", Family.TxtColl)).toBe("Text body");
  expect(Mapper.FillUIName("Standard", Family.ChrFmt)).toBe("No Character Style");
  expect(Mapper.FillProgName("No Character Style", Family.ChrFmt)).toBe("Standard");
  expect(Mapper.GetUIName("Standard", Family.ChrFmt)).toBe("Standard");
  expect(Mapper.GetPoolIdFromUIName("No Character Style", Family.ChrFmt)).toBe(Id.UNKNOWN);
});
it("preserves native suffix length, table-name compatibility and exact UTF16 hash keys", /** Does not repair the original more-than-eight-code-unit test. @returns Nothing. */ () => {
  expect(Mapper.FillProgName("A (user)", Family.TxtColl)).toBe("A (user)");
  expect(Mapper.FillProgName("AB (user)", Family.TxtColl)).toBe("AB");
  expect(Mapper.FillProgName("😀 (user)", Family.TxtColl)).toBe("😀");
  expect(Mapper.FillProgName("AB (user)", Family.TableStyle)).toBe("AB (user) (user)");
  expect(Mapper.FillUIName("AB (user) (user)", Family.TableStyle)).toBe("AB (user)");
  expect(Mapper.FillUIName("Default Style", Family.TableStyle)).toBe("Default Style");
  expect(Mapper.FillUIName("Default Table Style", Family.TableStyle)).toBe("Default Table Style");
  for (const name of ["Body Text\0suffix", "body text", "é", "é", "\ud800"]) {
    expect(Mapper.GetPoolIdFromUIName(name, Family.TxtColl)).toBe(Id.UNKNOWN);
    expect(Mapper.FillUIName(name, Family.TxtColl)).toBe(name);
  }
  expect(Mapper.GetPoolIdFromUIName("anything", Family.CellStyle)).toBe(Id.UNKNOWN);
  expect(Mapper.GetPoolIdFromProgName("anything", Family.CellStyle)).toBe(Id.UNKNOWN);
});
it("preserves ID fallback, uint16 boundaries and the native invalid-family precondition", /** Checks explicit source failure domains without fake empty tables. @returns Nothing. */ () => {
  for (const id of [Id.ZERO, Id.UNKNOWN, 0x8000 | 2049, 1048] as Id[]) {
    expect(Mapper.GetUIName(id, "fallback")).toBe("fallback");
    expect(Mapper.GetProgName(id, "fallback")).toBe("fallback");
  }
  expect(Mapper.GetUIName((65536 + 2049) as Id, "fallback")).toBe("Body Text");
  expect(
    /** Invokes the original invalid discriminator assertion. @returns Identity. */ () =>
      Mapper.GetPoolIdFromUIName("Body Text", 0 as Family),
  ).toThrow("unknown SwStyleNameMapper family");
});
it("keeps native UI names in actual paragraph formats and programmatic names at the UNO boundary", /** Verifies built-in and colliding custom formats keep separate real identities. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = doc.GetTextFormatColl("text-body"),
    familyName = unicode("ParagraphStyles"),
    family = new SwXStyleFamilies(doc).getByName(familyName),
    builtInName = unicode("Text body"),
    customName = unicode("Text body (user)");
  expect(body.GetName()).toBe("Body Text");
  expect(returned(family.getByName(builtInName).getName())).toBe("Text body");
  const descriptor = new SwXStyle(doc, "ParagraphStyles");
  family.insertByName(customName, descriptor);
  const custom = doc.FindTextFormatCollByName("Text body");
  expect(custom).toBeDefined();
  expect(custom).not.toBe(body);
  expect(returned(descriptor.getName())).toBe("Text body (user)");
  expect(family.getByName(customName)).toBeInstanceOf(SwXStyle);
  const rename = unicode("Body Text");
  descriptor.setName(rename);
  expect(custom?.GetName()).toBe("Body Text (user)");
  expect(returned(descriptor.getName())).toBe("Body Text");
  familyName.dispose();
  builtInName.dispose();
  customName.dispose();
  rename.dispose();
  doc.Dispose();
});

it("exposes original stable name arrays and five caption conversions", /** Checks the source public arrays and caption-specific scope. @returns Nothing. */ () => {
  for (const range of nameData.ranges) {
    const ui = Reflect.get(Mapper, range.uiArray) as () => readonly string[],
      prog = Reflect.get(Mapper, range.programmaticArray) as () => readonly string[];
    expect(ui()).toBe(ui());
    expect(prog()).toBe(prog());
    expect(ui()).toEqual(range.ui);
    expect(prog()).toEqual(range.programmatic);
  }
  const extra = nameData.ranges[2] as (typeof nameData.ranges)[number];
  for (const index of nameData.specialExtraIndices) {
    expect(Mapper.GetSpecialExtraUIName(extra.programmatic[index] as string)).toBe(extra.ui[index]);
    expect(Mapper.GetSpecialExtraProgName(extra.ui[index] as string)).toBe(
      extra.programmatic[index],
    );
  }
  expect(Mapper.GetSpecialExtraProgName("Body Text")).toBe("Body Text");
  expect(Mapper.GetSpecialExtraUIName("Text body")).toBe("Text body");
});

it("resolves an unmaterialized builtin before a colliding browser graph ID", /** Keeps native name lookup ahead of the existing host ID fallback. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    custom = doc.MakeTextFormatColl("Text body", doc.GetDfltTextFormatColl()),
    familyName = unicode("ParagraphStyles"),
    family = new SwXStyleFamilies(doc).getByName(familyName),
    name = unicode("Text body");
  expect(custom.id).toBe("Text body");
  const builtin = family.getByName(name);
  expect(returned(builtin.getName())).toBe("Text body");
  expect(doc.GetTextFormatColl("text-body")).not.toBe(custom);
  expect(doc.GetTextFormatColl("text-body").GetName()).toBe("Body Text");
  name.dispose();
  familyName.dispose();
  doc.Dispose();
});
