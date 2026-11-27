/** @fileoverview Original Writer ruby position and hyperlink regressions through ODT. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import { SwTextRuby } from "../../core/txtnode/txtatr2";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const fixtures = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";
const metadata = { title: "Ruby" };

/** Reads normal ODT content through the established ZIP and XML owners. @param bytes - Exported archive. @returns Content document. */
async function readContent(bytes: Uint8Array): Promise<Document> {
  const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
  return new DOMParser().parseFromString(content, "application/xml");
}

it("ports native RubyPosition from ruby-position.odt", /** Checks the extended position and native legacy compatibility attribute. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${fixtures}/ruby-position.odt`)),
    metadata,
  );
  try {
    const native = document.paragraphs[0]
      ?.GetpSwpHints()
      ?.entries()
      .find(
        /** Finds the native ruby range. @param hint - Live text attribute. @returns Whether a ruby hint. */ (
          hint,
        ) => hint instanceof SwTextRuby,
      );
    expect(native?.GetAttr().GetPosition()).toBe(2);
    expect(document.paragraphs[0]?.GetText()).toBe("上");
    const worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
    try {
      const bytes = await writeOdtDocument(worker, metadata);
      const content = await readContent(bytes);
      const rubyStyle = [...content.getElementsByTagNameNS(NS.style, "ruby-properties")];
      expect(
        rubyStyle.filter(
          /** Selects the authored extended ruby style. @param node - Ruby properties. @returns Match. */ (
            node,
          ) => node.getAttributeNS(NS.loext, "ruby-position") === "inter-character",
        ),
      ).toHaveLength(1);
      expect(
        rubyStyle.filter(
          /** Selects the native compatibility ruby position. @param node - Ruby properties. @returns Match. */ (
            node,
          ) => node.getAttributeNS(NS.style, "ruby-position") === "below",
        ),
      ).toHaveLength(1);
      const reopened = await readOdtDocument(bytes, metadata);
      try {
        expect(reopened.document.paragraphs[0]?.GetText()).toBe("上");
      } finally {
        reopened.document.Dispose();
      }
    } finally {
      worker.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("keeps the original tdf168817 hyperlink inside the ruby base", /** Ports the original flat fixture markup into the ODT content stream. @returns Completion. */ async () => {
  const source = readFileSync(`${fixtures}/ruby+hyperlink.fodt`, "utf8");
  const dom = new DOMParser().parseFromString(source, "application/xml");
  const root = dom.documentElement;
  const namespaces = [...root.attributes]
    .filter(
      /** Selects the unchanged source namespace declarations. @param attribute - Original root declaration. @returns Match. */ (
        attribute,
      ) => attribute.name.startsWith("xmlns:"),
    )
    .map(
      /** Copies one original namespace declaration. @param attribute - Original root declaration. @returns XML attribute. */ (
        attribute,
      ) => `${attribute.name}="${attribute.value}"`,
    )
    .join(" ");
  const auto = dom.getElementsByTagNameNS(NS.office, "automatic-styles")[0];
  const body = dom.getElementsByTagNameNS(NS.office, "body")[0];
  const serializer = new XMLSerializer();
  if (!auto || !body) throw new Error("Original ruby fixture has no content stream.");
  const { document } = importWriterXml(
    undefined,
    `<office:document-content ${namespaces}>${serializer.serializeToString(auto)}${serializer.serializeToString(body)}</office:document-content>`,
    metadata,
  );
  try {
    const bytes = await writeOdtDocument(document, metadata);
    const content = await readContent(bytes);
    expect(content.getElementsByTagNameNS(NS.text, "p")).toHaveLength(1);
    expect(content.getElementsByTagNameNS(NS.text, "ruby")).toHaveLength(1);
    expect(content.getElementsByTagNameNS(NS.text, "a")).toHaveLength(1);
    const base = content.getElementsByTagNameNS(NS.text, "ruby-base")[0];
    const anchor = base?.getElementsByTagNameNS(NS.text, "a")[0];
    expect(anchor?.getAttributeNS(NS.xlink, "href")).toBe(
      "https://en.wiktionary.org/wiki/一日#Japanese",
    );
    expect(anchor?.textContent).toBe("一日");
    expect(content.getElementsByTagNameNS(NS.text, "ruby-text")[0]?.textContent).toBe("ついたち");
  } finally {
    document.Dispose();
  }
});
