/** @fileoverview Native OOXML document-protection defaults and unenforced settings round trips. */
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import {
  DocumentProtection,
  ReadDocumentProtection,
} from "../../writerfilter/dmapper/DocumentProtection";
import { NS_ooxml as N } from "../../writerfilter/inc/ooxml/resourceids";
import {
  OOXMLProperty,
  OOXMLPropertyType,
  OOXMLValue,
} from "../../writerfilter/ooxml/OOXMLPropertySet";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { DocxExport } from "./docxexport";

vi.setConfig({ testTimeout: 120_000 });

const fixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf166173_enforcement.docx";

/** Reads the actual interoperability sequence on the Writer document. @param document - Canonical graph. @returns Represented protection settings. */
function protection(document: SwDoc) {
  return ReadDocumentProtection(document.interopGrabBag.GetGrabBag().get("DocumentProtection"));
}

/** Modifies only the settings element in a source-backed test package. @param replacement - Source XML element. @returns Modified DOCX. */
async function inputWithProtection(replacement: string): Promise<Uint8Array> {
  const input = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const output = new DocumentArchiveWriter();
  for (const name of input.getEntryNames()) {
    if (name !== "word/settings.xml") {
      output.putNextEntry(name, await input.readEntry(name));
      continue;
    }
    const xml = await input.readTextEntry(name);
    expect(xml).toMatch(/<w:documentProtection\b[^>]*\/>/u);
    output.putNextEntry(
      name,
      new TextEncoder().encode(xml.replace(/<w:documentProtection\b[^>]*\/>/u, replacement)),
    );
  }
  return output.finish();
}

/** Exports through the real DOCX package writer and reads its settings. @param document - Canonical graph. @returns XML settings. */
async function settings(document: SwDoc): Promise<string> {
  const output = await DocxExport.WriteDocument(document);
  return (await DocumentArchive.open(output)).readTextEntry("word/settings.xml");
}

it("ports tdf166173 with the original zero enforcement through Worker and DOCX export", /** Checks the unmodified pinned source and exported package. @returns Completion. */ async () => {
  const document = await importOOXML(new Uint8Array(readFileSync(fixture)), {});
  let worker: SwDoc | undefined;
  try {
    expect(protection(document)?.enforcement).toBe("0");
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    expect(protection(worker)).toEqual(protection(document));
    expect(await settings(worker)).toMatch(/<w:documentProtection\b[^>]*\bw:enforcement="0"/u);
  } finally {
    worker?.Dispose();
    document.Dispose();
  }
});

it.each(["0", "1"])(
  "accepts a settings element with enforcement=%s and no edit mode",
  /** Asserts that the original default edit mode produces an empty sequence. @param enforcement - Lexical source flag. @returns Completion. */ async (
    enforcement,
  ) => {
    const document = await importOOXML(
      await inputWithProtection(`<w:documentProtection w:enforcement="${enforcement}"/>`),
      {},
    );
    try {
      expect(protection(document)).toEqual({});
      expect(await settings(document)).not.toContain("<w:documentProtection");
    } finally {
      document.Dispose();
    }
  },
);

it("preserves the source attributes and omits an empty algorithm SID", /** Checks the metadata shape and XML serializer order. @returns Completion. */ async () => {
  const xml =
    '<w:documentProtection w:edit="forms" w:formatting="true" w:cryptProviderType="rsaFull" w:cryptSpinCount="60" w:hash="YWJj" w:salt="ZGVm"/>';
  const document = await importOOXML(await inputWithProtection(xml), {});
  try {
    expect(protection(document)).toEqual({
      edit: "forms",
      enforcement: "0",
      formatting: "1",
      cryptProviderType: "rsaFull",
      cryptAlgorithmClass: "hash",
      cryptAlgorithmType: "typeAny",
      cryptAlgorithmSid: "",
      cryptSpinCount: "60",
      hash: "YWJj",
      salt: "ZGVm",
    });
    expect(await settings(document)).toContain(
      '<w:documentProtection w:edit="forms" w:enforcement="0" w:formatting="1" w:cryptProviderType="rsaFull" w:cryptAlgorithmClass="hash" w:cryptAlgorithmType="typeAny" w:cryptSpinCount="60" w:hash="YWJj" w:salt="ZGVm"/>',
    );
  } finally {
    document.Dispose();
  }
});

it("keeps unsupported active editing restrictions from opening for editing", /** Checks that successful syntax decoding cannot silently deactivate editing restrictions. @returns Completion. */ async () => {
  const input = await inputWithProtection(
    '<w:documentProtection w:edit="readOnly" w:enforcement="1"/>',
  );
  await expect(importOOXML(input, {})).rejects.toThrow(
    "Writer does not support this enforced DOCX editing restriction.",
  );
});

it("keeps native optional algorithm data and ignores unrelated property tokens", /** Exercises the attribute receiver apart from package and shell policy. @returns Nothing. */ () => {
  const protection = new DocumentProtection();
  protection.sprm(new OOXMLProperty(0, OOXMLValue.createInteger(1), OOXMLPropertyType.SPRM));
  protection.attribute(N.LN_CT_DocProtect_edit, OOXMLValue.createInteger(999));
  protection.attribute(N.LN_AG_Password_cryptProviderType, OOXMLValue.createInteger(999));
  protection.attribute(N.LN_CT_DocProtect_enforcement, OOXMLValue.createInteger(1));
  expect(protection.toSequence()).toEqual({
    enforcement: "1",
    cryptAlgorithmClass: "hash",
    cryptAlgorithmType: "typeAny",
    cryptAlgorithmSid: "",
    cryptSpinCount: "0",
    hash: "",
    salt: "",
  });
  protection.attribute(
    N.LN_CT_DocProtect_edit,
    OOXMLValue.createInteger(N.LN_Value_doc_ST_DocProtect_comments),
  );
  expect(protection.toSequence().edit).toBe("comments");
});

it("keeps the original nonempty algorithm SID", /** Checks source algorithm text on export, including its lexical spelling. @returns Completion. */ async () => {
  const input = await inputWithProtection(
    '<w:documentProtection w:edit="comments" w:cryptAlgorithmSid="014"/>',
  );
  const document = await importOOXML(input, {});
  const newDocument = createWriterDocument();
  try {
    expect(protection(document)?.cryptAlgorithmSid).toBe("014");
    expect(await settings(document)).toContain('w:cryptAlgorithmSid="014"');
    expect(protection(newDocument)).toBeUndefined();
  } finally {
    newDocument.Dispose();
    document.Dispose();
  }
});
