/** @fileoverview Original Word drawing text effects through Writer import, Worker and export. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { DocxExport } from "./docxexport";
import { RES_CHRATR_GRABBAG } from "../../../inc/hintids";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { effectiveItem } from "../../core/unocore/unocrsrhelper";
import { readTextEffect } from "../../writerfilter/dmapper/TextEffectsHandler";

const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const effects = "http://schemas.microsoft.com/office/word/2010/wordml";

/** Reads the entire upstream effect subtree with ordered children and unordered attributes. @param element - Word effect element. @returns Namespace-qualified XML structure. */
function signature(element: Element): unknown {
  return {
    name: [element.namespaceURI, element.localName],
    attributes: Object.fromEntries(
      Array.from(
        element.attributes,
        /** Keys the attribute by namespace and name. @param attribute - XML attribute. @returns Qualified attribute and value. */ (
          attribute,
        ) => [
          `${attribute.namespaceURI}:${attribute.localName}`,
          element.localName === "srgbClr" ? attribute.value.toUpperCase() : attribute.value,
        ],
      ),
    ),
    children: Array.from(element.childNodes)
      .filter(
        /** Selects effect elements alone. @param node - Child. @returns Whether it is an element. */ (
          node,
        ): node is Element => node.nodeType === 1,
      )
      .map(signature),
  };
}

/** Selects the first run in each body paragraph as in the original XPath assertions. @param bytes - DOCX package. @param name - Effect name. @returns Effects by paragraph. */
async function paragraphEffects(bytes: Uint8Array, name: string) {
  const archive = await DocumentArchive.open(bytes);
  const xml = await archive.readTextEntry("word/document.xml");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const body = doc.getElementsByTagNameNS(word, "body").item(0);
  assert(body);
  return Array.from(
    body.getElementsByTagNameNS(word, "p"),
    /** Reads the complete effect subtree from the first run. @param paragraph - Body paragraph. @returns Any effects attached to the first run. */
    (paragraph) =>
      Array.from(
        paragraph.getElementsByTagNameNS(word, "r")[0]?.getElementsByTagNameNS(effects, name) ?? [],
        signature,
      ),
  );
}

it.each([
  ["Outline", "textOutline", [1, 1, 1]],
  ["Fill", "textFill", [0, 1, 1, 1]],
] as const)(
  "preserves the original LibreOffice Word text %s test cases",
  /** Ports Test_TextEffects_TextOutline and Test_TextEffects_TextFill, comparing all supported descendants after reload. @param fixture - Upstream fixture suffix. @param name - Word element. @param counts - Expected effect count in each paragraph. @returns Completion. */
  async (fixture, name, counts) => {
    const bytes = new Uint8Array(
      readFileSync(
        `../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/TextEffects_Text${fixture}.docx`,
      ),
    );
    const expected = await paragraphEffects(bytes, name);
    expect(
      expected.map(
        /** Counts the effects per original paragraph. @param values - Paragraph effects. @returns Number of effects. */ (
          values,
        ) => values.length,
      ),
    ).toEqual(counts);
    const source = await importOOXML(bytes, {});
    try {
      const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
      try {
        const exported = await DocxExport.WriteDocument(worker);
        expect(await paragraphEffects(exported, name)).toEqual(expected);
        const reopened = await importOOXML(exported, {});
        try {
          expect(await paragraphEffects(await DocxExport.WriteDocument(reopened), name)).toEqual(
            expected,
          );
        } finally {
          reopened.Dispose();
        }
      } finally {
        worker.Dispose();
      }
    } finally {
      source.Dispose();
    }
  },
);

const fixtureRoot = "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/";

/** Reads ordered drawing effects across a real DOCX part. @param bytes - Package. @param part - Original part. @param names - Admitted effect roots. @returns Original complete effect subtrees and their character coverage. */
async function drawingEffects(bytes: Uint8Array, part: string, names: readonly string[]) {
  const archive = await DocumentArchive.open(bytes);
  const xml = await archive.readTextEntry(part);
  return Array.from(
    new DOMParser().parseFromString(xml, "application/xml").getElementsByTagNameNS(effects, "*"),
  )
    .filter(
      /** Selects the original feature roots. @param element - Original XML element. @returns Match. */
      (element) => names.includes(element.localName),
    )
    .map(
      /** Measures character coverage independently of equivalent run splitting. @param element - Effect element. @returns Effect and covered UTF16 length. */
      (element) => {
        const run = element.parentElement?.parentElement;
        const count =
          run?.localName === "r"
            ? Array.from(run.getElementsByTagNameNS(word, "t")).reduce(
                /** Counts the original run's text. @param total - Covered length. @param node - Text element. @returns Length. */
                (total, node) => total + (node.textContent?.length ?? 0),
                0,
              )
            : 1;
        return { effect: signature(element), count };
      },
    );
}

/** Compares the effect on each character or style instead of XML run counts. @param values - Ordered drawing effects. @returns Comparable effect sequence. */
function coveredEffects(values: Awaited<ReturnType<typeof drawingEffects>>): unknown[] {
  return values.flatMap(
    /** Retains the drawing properties of every covered character. @param value - Original effect coverage. @returns Projected effect sequence. */
    ({ effect, count }) => Array<unknown>(count).fill(effect),
  );
}

it.each([
  ["Glow_Shadow_Reflection", "word/document.xml", ["glow", "shadow", "reflection"], 7],
  ["Props3d_Ligatures_NumForm_NumSpacing", "word/document.xml", ["props3d"], 2],
  ["InStyle", "word/styles.xml", ["glow", "shadow", "reflection", "props3d"], 8],
] as const)(
  "round-trips original w14 drawing properties in %s",
  /** Ports the run and style XML assertions for the original upstream drawing cases. @param fixture - Original filename stem. @param part - Source and target XML part. @param names - Effect names. @param count - Original total. @returns Completion. */
  async (fixture, part, names, count) => {
    const bytes = new Uint8Array(readFileSync(fixtureRoot + "TextEffects_" + fixture + ".docx"));
    const expected = await drawingEffects(bytes, part, names);
    expect(expected).toHaveLength(count);
    const source = await importOOXML(bytes, {});
    let worker: typeof source | undefined;
    let reopened: typeof source | undefined;
    try {
      worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
      const exported = await DocxExport.WriteDocument(worker);
      expect(coveredEffects(await drawingEffects(exported, part, names))).toEqual(
        coveredEffects(expected),
      );
      reopened = await importOOXML(exported, {});
      expect(
        coveredEffects(await drawingEffects(await DocxExport.WriteDocument(reopened), part, names)),
      ).toEqual(coveredEffects(expected));
    } finally {
      reopened?.Dispose();
      worker?.Dispose();
      source.Dispose();
    }
  },
);

it("preserves Word scene3d camera presets and light rotations with native camera filtering", /** Verifies the native run item and scene nodes using the documented w14 camera boundary. @returns Completion. */ async () => {
  const input = await DocumentArchive.open(
    new Uint8Array(readFileSync(fixtureRoot + "hello.docx")),
  );
  const writer = new DocumentArchiveWriter();
  const scene =
    '<w14:scene3d><w14:camera w14:prst="orthographicFront"><w14:rot w14:lat="-60000" w14:lon="120000" w14:rev="0"/></w14:camera><w14:lightRig w14:rig="threePt" w14:dir="t"><w14:rot w14:lat="0" w14:lon="0" w14:rev="60000"/></w14:lightRig></w14:scene3d>';
  for (const part of input.getEntryNames()) {
    writer.putNextEntry(
      part,
      part === "word/document.xml"
        ? new TextEncoder().encode(
            `<w:document xmlns:w="${word}" xmlns:w14="${effects}"><w:body><w:p><w:r><w:rPr>${scene}</w:rPr><w:t>Scene</w:t></w:r></w:p></w:body></w:document>`,
          )
        : await input.readEntry(part),
    );
  }
  const source = await importOOXML(await writer.finish(), {});
  try {
    const run = source.paragraphs[0];
    assert(run);
    const item = effectiveItem(run, 0, RES_CHRATR_GRABBAG);
    assert(item instanceof SfxGrabBagItem);
    const value = item.GetGrabBag().get("CharScene3DTextEffect");
    assert(value);
    expect(readTextEffect("CharScene3DTextEffect", value)?.[0]).toBe("scene3d");
    const exported = await DocumentArchive.open(await DocxExport.WriteDocument(source));
    expect(await exported.readTextEntry("word/document.xml")).toContain(
      scene.replace('><w14:rot w14:lat="-60000" w14:lon="120000" w14:rev="0"/></w14:camera>', "/>"),
    );
  } finally {
    source.Dispose();
  }
});
