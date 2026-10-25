/** @fileoverview Optional pinned-corpus package checks; deterministic authored contract tests remain independent of the ignored research tree. */
import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { XmlFilterBase } from "./xmlfilterbase";
import { FragmentHandler, type FragmentContext } from "./fragmenthandler";
import { ZipStorage } from "../helper/zipstorage";
import type { SaxesTagNS } from "saxes";

const root = "../../vendor/libreoffice-reference/";
/** Receives actual root names/text from the pinned DOCX/XLSX main part. */
class MainPart extends FragmentHandler {
  readonly names: string[] = [];
  text = "";
  /** Traverses actual SAX events. @param tag - Expanded name. @returns Context. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext {
    this.names.push(tag.uri + ":" + tag.local);
    return this;
  }
  /** Collects actual content. @param value - Text. @returns Nothing. */
  override characters(value: string): void {
    this.text += value;
  }
}

it.skipIf(!existsSync(root)).each([
  [
    "sw/qa/extras/ooxmlexport/data/hello.docx",
    "word/document.xml",
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main:document",
  ],
  [
    "sw/qa/extras/ooxmlexport/data/strict.docx",
    "word/document.xml",
    "http://purl.oclc.org/ooxml/wordprocessingml/main:document",
  ],
  [
    "sc/qa/unit/data/xlsx/preserve_space.xlsx",
    "xl/workbook.xml",
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main:workbook",
  ],
  [
    "sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
    "xl/workbook.xml",
    "http://purl.oclc.org/ooxml/spreadsheetml/main:workbook",
  ],
])(
  "imports the actual pinned package and related parts %s",
  /** Tests actual DEFLATE packages and strict/transitional relationship namespaces. @param file - Fixture. @param main - Main path. @param element - Root. @returns Completion. */ async (
    file,
    main,
    element,
  ) => {
    const filter = new XmlFilterBase(new ZipStorage(new Uint8Array(readFileSync(root + file))));
    expect(await filter.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument")).toBe(main);
    const handler = new MainPart(filter, main);
    expect(await filter.importFragment(handler)).toBe(true);
    expect(handler.names[0]).toBe(element);
    if (file.endsWith("hello.docx")) expect(handler.text).toBe("hello");
    const styles = (await filter.importRelations(main)).getFragmentPathFromFirstTypeFromOfficeDoc(
      "styles",
    );
    expect(styles).not.toBe("");
    expect(await filter.importFragment(new MainPart(filter, styles))).toBe(true);
  },
);
