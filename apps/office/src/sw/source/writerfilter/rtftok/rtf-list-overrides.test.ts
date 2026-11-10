/** @fileoverview Native concrete RTF list overrides, sparse definition merge, original character-merge direction and typed resource-table delivery. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { SwDoc } from "../../core/doc/doc";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import * as T from "../../../../offapi/com/sun/star/style/NumberingType";
import { FontWeight, FontItalic } from "../../../../tools/inc/fontenum";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { RES_CHRATR_WEIGHT, RES_CHRATR_POSTURE } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { SwDoc as Document } from "../../core/doc/doc";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { AbstractListDef, ListDef } from "../dmapper/NumberingManager";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import { text } from "../../core/unocore/unocrsrhelper";
const documents: SwDoc[] = [];
afterEach(
  /** Releases actual document graphs. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
const abstractLevel = String.raw`{\listlevel\levelnfc1\levelstartat2\leveljc0\levelfollow1\li720\fi-360\tx1080\f0\b{\leveltext\'02\'00.;}{\levelnumbers\'01;}}`;
/** Imports concrete override entries through the original native resource table. @param overrides - Concrete table contents. @param levels - Abstract levels. @param body - Original body controls. @returns Real document. */
function read(
  overrides: string,
  levels = abstractLevel,
  body = String.raw`\ls4\ilvl0 First\par Second\par`,
) {
  const input =
    String.raw`{\rtf1{\fonttbl{\f0 AbstractFont;}{\f1 OverrideFont;}}{\*\listtable{\list` +
    levels +
    String.raw`\listid7}}{\*\listoverridetable` +
    overrides +
    "}" +
    body +
    "}";
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  documents.push(doc);
  return doc;
}
/** Wraps one original concrete entry; count is deliberately retained independently of actual levels. @param levels - LFO groups. @param id - Concrete ID. @returns Original entry. */
function entry(levels: string, id = 4) {
  return String.raw`{\listoverride\listid7\listoverridecount0` + levels + `\\ls${id}}`;
}
/** Borrows actual body numbering. @param doc - Owner. @returns Actual rule. */
function rule(doc: SwDoc) {
  const native = doc.paragraphs[0]?.GetNumRule();
  assert(native);
  return native;
}

it("merges ordinary LFO start values into independent concrete rules without synthesizing paragraph restarts", /** The RTF flag does not emit CT_NumLvl_startOverride upstream. @returns Nothing. */ () => {
  const doc = read(
    entry(String.raw`{\lfolevel\listoverridestartat\levelstartat9}`) +
      entry(String.raw`{\lfolevel\listoverridestartat\levelstartat15}`, 5),
    abstractLevel,
    String.raw`\ls4 A\par\ls5 B\par\ls4 C\par`,
  );
  expect(rule(doc).Get(0).GetStart()).toBe(9);
  expect(doc.paragraphs[1]?.GetNumRule()?.Get(0).GetStart()).toBe(15);
  expect(doc.paragraphs[2]?.GetNumRule()).toBe(rule(doc));
  for (const node of doc.paragraphs) {
    expect(node.IsListRestart()).toBe(false);
    expect(node.GetListId()).toBe(doc.paragraphs[0]?.GetListId());
  }
  expect(rule(doc).Get(0).GetListFormat()).toBe("%1%.");
});
it("resolves nested listlevel override numbering and geometry through native current-level attributes", /** Original LFOLEVEL clears table modifiers, nests CT_NumLvl_lvl and retains per-level numbering. @returns Nothing. */ () => {
  const doc = read(
      entry(
        String.raw`{\lfolevel\listoverrideformat1{\listlevel\levelnfc23\levelstartat4\leveljc2\levelfollow2\li1440\fi-720\tx1800\f1\b0\i{\leveltext\'01*;}{\levelnumbers;}}}`,
      ),
    ),
    native = rule(doc).Get(0);
  expect(native.GetNumberingType()).toBe(T.CHAR_SPECIAL);
  expect(native.GetBulletChar()).toBe(42);
  expect(native.GetStart()).toBe(4);
  expect(native.GetListFormat()).toBe("*");
  expect(native.GetNumAdjust()).toBe(SvxAdjust.Right);
  expect(native.GetIndentAt()).toBe(1440);
  expect(native.GetFirstLineIndent()).toBe(-720);
  expect(native.GetListtabPos()).toBe(1800);
  expect(native.GetLabelFollowedBy()).toBe("nothing");
  expect(native.GetBulletFont()?.GetFamilyName()).toBe("OverrideFont");
  const style = native.GetCharFormat();
  assert(style);
  expect((style.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect((style.GetAttrSet().Get(RES_CHRATR_POSTURE) as SvxPostureItem).GetPosture()).toBe(
    FontItalic.ITALIC_NONE,
  );
});
it("keeps geometry-only and character-only stub overrides out of numeric merging", /** HasValues is changed by SetValue only; direct PropertyMap inserts and text are distinct. @returns Nothing. */ () => {
  for (const override of [
    String.raw`{\lfolevel{\listlevel\li1440\fi-720\f1\b0\i}}`,
    String.raw`{\lfolevel}`,
  ]) {
    const native = rule(read(entry(override))).Get(0);
    expect(native.GetIndentAt()).toBe(720);
    expect(native.GetFirstLineIndent()).toBe(-360);
    expect(native.GetStart()).toBe(2);
    expect(native.GetListFormat()).toBe("%1%.");
  }
});
it("retains an explicit empty override label independently of the numeric HasValues gate", /** Optional text presence differs from absence. @returns Nothing. */ () => {
  const native = rule(
    read(entry(String.raw`{\lfolevel{\listlevel{\leveltext\'00;}{\levelnumbers;}}}`)),
  ).Get(0);
  expect(native.GetListFormat()).toBe("");
  expect(native.GetStart()).toBe(2);
});
it("retains native omission of a concrete tab follower and negative start while applying a numeric gate", /** Concrete GetLevelProperties(false) cannot reset an abstract space follower to the omitted LISTTAB default. @returns Nothing. */ () => {
  const native = rule(
    read(
      entry(
        String.raw`{\lfolevel\levelstartat-1\levelfollow0{\listlevel\levelstartat-1\levelfollow0\li1440}}`,
      ),
    ),
  ).Get(0);
  expect(native.GetStart()).toBe(2);
  expect(native.GetLabelFollowedBy()).toBe("space");
  expect(native.GetIndentAt()).toBe(1440);
});
it("uses actual sequential concrete ilvl values and ignores overrides beyond abstract size", /** Outer LFO and inner LISTLEVEL counters follow the original copied parser state. @returns Nothing. */ () => {
  const second = String.raw`{\listlevel\levelnfc2\levelstartat3{\leveltext\'02\'01);}{\levelnumbers\'01;}}`;
  const doc = read(
      entry(
        String.raw`{\lfolevel\levelstartat8}{\lfolevel\levelstartat9}{\lfolevel{\listlevel\levelnfc23\levelstartat99}}`,
      ),
      abstractLevel + second,
      String.raw`\ls4\ilvl1 Nested\par`,
    ),
    native = rule(doc);
  expect(native.Get(0).GetStart()).toBe(8);
  expect(native.Get(1).GetStart()).toBe(9);
  expect(native.Get(1).GetNumberingType()).toBe(T.ROMAN_LOWER);
  expect(native.Get(1).GetListFormat()).toBe("%2%)");
  expect(doc.FindCharFormatByName("ListLabel 3")).toBeUndefined();
});
it("retains concrete label and numeric fields through Worker and native RTF re-export", /** Actual document-owned rule/style owners survive import-manager destruction and graph transfer. @returns Nothing. */ () => {
  const doc = read(
      entry(
        String.raw`{\lfolevel{\listlevel\levelnfc23\levelstartat4\f1{\leveltext\'01*;}{\levelnumbers;}}}`,
      ),
    ),
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  documents.push(worker);
  expect(rule(worker).Get(0).GetBulletChar()).toBe(42);
  expect(rule(worker).Get(0).GetStart()).toBe(4);
  expect(rule(worker).Get(0).GetCharFormat()).toBe(worker.FindCharFormatByName("ListLabel 1"));
  const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(worker));
  documents.push(reopened);
  expect(rule(reopened).Get(0).GetBulletChar()).toBe(42);
  expect(rule(reopened).Get(0).GetStart()).toBe(4);
});
it("retains original first duplicate IDs and creates separate native styles in definition order", /** Definitions stay in vectors, not lossy ID maps. @returns Nothing. */ () => {
  const doc = read(
    entry(String.raw`{\lfolevel\levelstartat8}`) + entry(String.raw`{\lfolevel\levelstartat9}`),
  );
  expect(rule(doc).GetName()).toBe("WWNum4");
  expect(rule(doc).Get(0).GetStart()).toBe(8);
  expect(doc.FindNumRulePtr("WWNum4a")?.Get(0).GetStart()).toBe(9);
});
it("exposes native HasValues and sparse numeric merge without treating geometry as a numeric visit", /** Tests original definition owners with typed maps rather than a browser descriptor replay. @returns Nothing. */ () => {
  const base = new AbstractListDef(),
    concrete = new ListDef();
  base.AddLevel(0);
  concrete.AddLevel(0);
  const abstract = base.GetLevel(0),
    override = concrete.GetLevel(0);
  assert(abstract);
  assert(override);
  abstract.SetValue(N.LN_CT_Lvl_start, 3);
  concrete.SetAbstractDefinition(base);
  const indent = new Any([2540], "sal_Int32");
  try {
    override.Insert(P.PROP_INDENT_AT, indent);
    override.SetBulletChar("");
    expect(override.HasValues()).toBe(false);
    expect(override.HasBulletChar()).toBe(true);
    for (const visited of [false, true]) {
      if (visited) override.SetValue(N.LN_CT_Lvl_legacy, 0);
      const values = concrete.GetMergedPropertyValues();
      try {
        const property = values[0]?.find(
          /** Finds actual typed position. @param value - Native property. @returns Name equality. */ (
            value,
          ) => text(value.Name) === "IndentAt",
        );
        assert(property);
        const value: [number] = [0];
        expect(property.Value.extract(value, "sal_Int32")).toBe(true);
        expect(value[0]).toBe(visited ? 2540 : 0);
      } finally {
        for (const level of values)
          for (const value of level) {
            value.Name.dispose();
            value.Value.dispose();
          }
      }
    }
  } finally {
    indent.dispose();
    concrete.dispose();
    base.dispose();
  }
});
it("uses native numbering table phase flags while resolving actual tables", /** Native stream callback owns phase changes; the retained manager is reused by the import. @returns Nothing. */ () => {
  const doc = new Document();
  documents.push(doc);
  const model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF);
  try {
    const manager = mapper.impl.GetListTable();
    mapper.table(N.LN_NUMBERING, {
      resolve:
        /** Actual table delivery observes the native import phase. @param handler - Native table receiver. @returns Nothing. */ (
          handler,
        ) => {
          expect(handler).toBe(manager);
          expect(mapper.impl.IsAnyTableImport()).toBe(true);
          expect(mapper.impl.IsNumberingImport()).toBe(true);
        },
    });
    expect(mapper.impl.IsAnyTableImport()).toBe(false);
    expect(mapper.impl.IsNumberingImport()).toBe(false);
    expect(mapper.impl.GetListTable()).toBe(manager);
  } finally {
    mapper.dispose();
    model.dispose();
  }
});

it("copies nested LISTOVERRIDEENTRY properties upward and admits concrete RTF ID zero", /** Original group finalization commits only the outer concrete entry. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\listoverride\listid7{\listoverride{\lfolevel\levelstartat11}\ls0}}`,
    abstractLevel,
    String.raw`\ls0 Item\par`,
  );
  expect(rule(doc).GetName()).toBe("WWNum0");
  expect(rule(doc).Get(0).GetStart()).toBe(11);
});
it("keeps LISTNAME outside definition creation so subsequent levels stay in the same abstract list", /** Original LISTNAME destination has no abstract-definition callback. @returns Nothing. */ () => {
  const doc = read(
    entry(""),
    String.raw`\listid7` +
      abstractLevel +
      String.raw`{\listname Original name;}{\listlevel\levelnfc2\levelstartat7{\leveltext\'02\'01.;}{\levelnumbers\'01;}}`,
    String.raw`\ls4\ilvl1 Second\par`,
  );
  expect(rule(doc).Get(1).GetStart()).toBe(7);
  expect(rule(doc).Get(1).GetListFormat()).toBe("%2%.");
});
it("keeps native reference table signed key order and actual reference ownership", /** The table copies owning pointers and releases them with its map. @returns Nothing. */ () => {
  const empty = new RTFSprms(),
    native = new RTFReferenceProperties(empty),
    property = new ReferencePointer<Properties>(native),
    table = new RTFReferenceTable(
      new Map([
        [9, property],
        [-2, property],
      ]),
    );
  expect(native.GetRefCount()).toBe(3);
  const entries: number[] = [];
  try {
    table.resolve({
      entry:
        /** Native ordered callback receives retained properties. @param index - Signed map key. @param reference - Borrowed owning reference. @returns Nothing. */ (
          index,
          reference,
        ) => {
          entries.push(index);
          expect(reference).toBeInstanceOf(ReferencePointer);
          reference.resolve({
            attribute: /** Empty native attributes. @returns Nothing. */ () => {},
            sprm: /** Empty native modifiers. @returns Nothing. */ () => {},
          });
        },
    });
    expect(entries).toEqual([-2, 9]);
  } finally {
    table.dispose();
    expect(native.GetRefCount()).toBe(1);
    property.clear();
    empty.dispose();
  }
});
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFReferenceTable } from "./rtfreferencetable";
import { RTFSprms } from "./rtfsprm";
import { ReferencePointer, type Properties } from "../inc/dmapper/resourcemodel";

it("replays repeated cumulative native numbering tables in original callback order", /** Retained definitions skip existing services while duplicate raw entries create suffixed styles and consume label names as upstream does. @returns Nothing. */ () => {
  const input =
    String.raw`{\rtf1{\*\listtable{\list` +
    abstractLevel +
    String.raw`\listid7}}{\*\listoverridetable` +
    entry(String.raw`{\lfolevel\levelstartat8}`) +
    String.raw`}{\*\listoverridetable` +
    entry(String.raw`{\lfolevel\levelstartat9}`, 5) +
    String.raw`}\ls5 Item\par}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  documents.push(doc);
  expect(rule(doc).GetName()).toBe("WWNum5");
  expect(rule(doc).Get(0).GetStart()).toBe(9);
  expect(rule(doc).Get(0).GetCharFormat()?.GetName()).toBe("ListLabel 3");
  expect(doc.FindNumRulePtr("WWNum4a")).toBeDefined();
});

it("keeps different abstract-list identities separate while Worker retains shared concrete-list identities", /** Native MapListId belongs to the abstract definition, never a global concrete-ID map. @returns Nothing. */ () => {
  const table =
    String.raw`{\rtf1{\*\listtable{\list` +
    abstractLevel +
    String.raw`\listid7}{\list` +
    abstractLevel +
    String.raw`\listid8}}{\*\listoverridetable{\listoverride\listid7\ls4}{\listoverride\listid7\ls5}{\listoverride\listid8\ls6}}\ls4 A\par\ls5 B\par\ls6 C\par}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(table));
  documents.push(doc);
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  documents.push(worker);
  for (const owner of [doc, worker]) {
    const first = owner.paragraphs[0],
      second = owner.paragraphs[1],
      third = owner.paragraphs[2];
    assert(first);
    assert(second);
    assert(third);
    expect(first.GetListId()).toBe(second.GetListId());
    expect(third.GetListId()).not.toBe(first.GetListId());
    expect(first.GetNumRule()).not.toBe(second.GetNumRule());
    expect(first.GetNum()).toBeDefined();
    expect(second.GetNum()).toBeDefined();
  }
});

it("retains inherited LISTLEVEL destination counter changes for a plain nested group", /** Native afterPopState increments the parent level counter even when the child inherited its destination without a listlevel keyword. @returns Nothing. */ () => {
  const doc = read(
    entry(""),
    String.raw`{\listlevel\levelnfc0{\b}{\leveltext\'02\'00.;}{\levelnumbers\'01;}}`,
  );
  expect(rule(doc).Get(0).GetListFormat()).toBe("%2%.");
});
