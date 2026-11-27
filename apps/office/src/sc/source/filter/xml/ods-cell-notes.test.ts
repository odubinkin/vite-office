/** @fileoverview Ports the pinned Calc ODS cell-note and threaded-comment scenarios. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { ScThreadedCommentData, ScThreadedCommentEntry } from "../../../inc/postit";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("testCellNoteExportODS preserves imported and newly created notes on empty cells", /** Executes the native fixture scenario across both transfer paths. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/single-note.ods"),
    ),
  );
  const a1 = new ScAddress(0, 0, 0);
  const a2 = new ScAddress(0, 1, 0);
  expect(document.HasNote(a1)).toBe(true);
  expect(document.GetNote(a1)?.GetText()).toBe("a");
  expect(document.GetNote(a1)?.GetDate()).toBe("2014-02-02T00:00:00");

  const note = document.GetOrCreateNote(a2);
  assert(note);
  note.SetText(a2, "Note One");
  note.SetAuthor("Author One");
  expect(document.HasNote(a2)).toBe(true);

  const restored = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
  const reopened = await readOdsDocument(await writeOdsDocument(restored));
  for (const workbook of [restored, reopened]) {
    expect(workbook.HasNote(a1)).toBe(true);
    expect(workbook.HasNote(a2)).toBe(true);
    expect(workbook.GetNote(a1)?.GetText()).toBe("a");
    expect(workbook.GetNote(a2)?.GetText()).toBe("Note One");
    expect(workbook.GetNote(a2)?.GetAuthor()).toBe("Author One");
    expect(workbook.GetCellType(a1)).toBe(CellType.CELLTYPE_NONE);
    expect(workbook.GetCellType(a2)).toBe(CellType.CELLTYPE_NONE);
  }
});

it("testThreadedCommentOdsRoundtrip preserves native root, reply and person", /** Ports the native ODS assertions using the pinned fixture's thread data. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/single-note.ods"),
    ),
  );
  const a2 = new ScAddress(0, 1, 0);
  const note = document.GetOrCreateNote(a2);
  assert(note);

  const rootId = "{FB8EA27E-C1B6-4481-B034-193455CC7425}";
  const personId = "{4A73A60B-EAFA-41CF-BAF3-B061059D7A5C}";
  const person = {
    maId: personId,
    maDisplayName: "Mike Kaganski",
    maUserId: "5008b16217855fa4",
    maProviderId: "Windows Live",
  };
  const thread = new ScThreadedCommentData();
  Object.assign(thread.maRoot, {
    maGuid: rootId,
    maPersonId: personId,
    maDateTime: "2026-03-24T09:25:49.80",
    maText: "a comment on A2",
  });
  const reply = new ScThreadedCommentEntry();
  Object.assign(reply, {
    maGuid: "{789BBBE8-38C6-4228-9338-E9C75EB78FCF}",
    maPersonId: personId,
    maDateTime: "2026-04-07T14:14:05.49",
    maText: "A reply",
  });
  thread.maReplies.push(reply);
  note.SetText(a2, thread.maRoot.maText);
  note.SetAuthor(person.maDisplayName);
  note.SetThreadedCommentData(thread);
  document.AddPerson(person);

  const restored = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
  const bytes = await writeOdsDocument(restored);
  const reopened = await readOdsDocument(bytes);
  try {
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const annotation = content?.match(
      /<office:annotation[^>]*>(?:(?!<\/office:annotation>)[\s\S])*<loext:threaded-comment[\s\S]*?<\/office:annotation>/u,
    )?.[0];
    expect(annotation).toContain(`<loext:threaded-comment loext:id="${rootId}"`);
    expect(annotation).toContain("<loext:text>a comment on A2</loext:text>");
    expect(annotation).toContain("<loext:text>A reply</loext:text></loext:reply>");
    expect(annotation).not.toContain("loext:resolved");
    expect(content).toContain(
      `<loext:persons><loext:person loext:person-id="${personId}" loext:display-name="Mike Kaganski"`,
    );
    for (const workbook of [restored, reopened]) {
      const imported = workbook.GetNote(a2);
      expect(imported?.GetText()).toBe("a comment on A2");
      expect(imported?.GetThreadedCommentData()).toEqual(thread);
      expect(imported?.IsResolved()).toBe(false);
      expect(workbook.GetPersonById(personId)).toEqual(person);
    }
  } finally {
    document.Dispose();
    restored.Dispose();
    reopened.Dispose();
  }
});
