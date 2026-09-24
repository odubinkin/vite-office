/** @fileoverview Privacy-safe structural diagnostics for the existing Writer ODT reader. */

import { ZipFile } from "../../apps/office/src/package/source/zipapi/ZipFile";
import { parseFastXmlStream } from "../../apps/office/src/sax/source/fastparser/fastparser";
import { projectWriterTextRuns } from "../../apps/office/src/sw/source/core/txtnode/ndtxt";
import { projectSwTextPrintBounds } from "../../apps/office/src/sw/source/core/layout/newfrm";
import {
  readOdtDocument,
  ODT_XML_STREAM_BYTE_LIMIT,
} from "../../apps/office/src/sw/source/filter/xml/swxml";
import type { OdfXmlDiagnostic } from "../../apps/office/src/xmloff/source/core/xmlimp";
import { ODF_NAMESPACES } from "../../apps/office/src/xmloff/source/core/xmltoken";

/** One counted diagnostic with a conservative semantic-loss class. */
export interface CountedOdtDiagnostic extends OdfXmlDiagnostic {
  readonly frequency: number;
  readonly loss: "content" | "structure" | "styling" | "metadata" | "unclassified";
}

/** Only counts and numeric metrics; no document text, URLs, names, or font bytes. */
export interface OdtDiagnosticReport {
  readonly imported: boolean;
  readonly xml: Readonly<Record<string, number>>;
  readonly canonical: Readonly<{
    paragraphs: number;
    links: number;
    listParagraphs: number;
    paragraphMetrics: Readonly<{
      leftMargins: readonly number[];
      rightMargins: readonly number[];
      firstLineIndents: readonly number[];
      printWidths: readonly number[];
    }>;
    page: Readonly<{
      width: number;
      height: number;
      leftMargin: number;
      rightMargin: number;
      topMargin: number;
      bottomMargin: number;
    }> | null;
  }>;
  readonly diagnostics: readonly CountedOdtDiagnostic[];
}

const countedElements = new Set([
  "text:p",
  "text:span",
  "text:a",
  "text:bookmark",
  "text:soft-page-break",
  "text:list",
  "table:table",
  "table:table-row",
  "table:table-cell",
  "style:style",
]);
const elementNamespaces: Readonly<Record<string, string>> = {
  text: ODF_NAMESPACES.text,
  style: ODF_NAMESPACES.style,
  table: "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
};

/** Runs the real package/XML reader and reports structural deltas without logging content. @param bytes - ODT package bytes. @returns Counted XML, canonical state and diagnostics. */
export async function diagnoseOdtImport(bytes: Uint8Array): Promise<OdtDiagnosticReport> {
  const archive = new ZipFile(bytes);
  const xml: Record<string, number> = Object.fromEntries(
    [...countedElements].map(
      /** Initializes one structural counter. @param element - QName. @returns Counter entry. */
      (element) => [element, 0],
    ),
  );
  for (const stream of ["content.xml", "styles.xml"]) {
    const entry = await archive.readEntry(stream);
    if (entry.length > ODT_XML_STREAM_BYTE_LIMIT)
      throw new Error(`ODT XML stream exceeds size limit: ${stream}`);
    parseFastXmlStream(new TextDecoder("utf-8", { fatal: true }).decode(entry), {
      /** Counts selected structural elements. @param tag - SAX tag. @returns Nothing. */
      open(tag): void {
        const prefix = Object.keys(elementNamespaces).find(
          /** Finds the declared namespace prefix. @param candidate - Prefix. @returns Whether URI matches. */
          (candidate) => elementNamespaces[candidate] === tag.uri,
        );
        const key = `${prefix}:${tag.local}`;
        if (countedElements.has(key)) xml[key] = (xml[key] as number) + 1;
      },
      /** Discards document text. @returns Nothing. */
      characters(): void {},
      /** Discards closing tags. @returns Nothing. */
      close(): void {},
    });
  }
  const counts = new Map<string, CountedOdtDiagnostic>();
  const onDiagnostic =
    /** Groups one structural event without retaining values. @param diagnostic - Event. @returns Nothing. */
    (diagnostic: OdfXmlDiagnostic): void => {
      const loss = classifyLoss(diagnostic);
      const key = JSON.stringify([
        diagnostic.stream,
        diagnostic.path,
        diagnostic.kind,
        diagnostic.name,
        loss,
      ]);
      const prior = counts.get(key);
      counts.set(key, { ...diagnostic, frequency: (prior?.frequency ?? 0) + 1, loss });
    };
  try {
    const imported = await readOdtDocument(bytes, { title: "diagnostic" }, undefined, {
      onDiagnostic,
    });
    const page = imported.document.GetPageDesc().GetValue();
    const paragraphs = imported.document.paragraphs;
    const unique =
      /** Sorts distinct numeric metrics. @param values - Observed metrics. @returns Sorted values. */
      (values: readonly number[]): readonly number[] =>
        [...new Set(values)].sort(
          /** Orders numeric metrics. @param a - Left value. @param b - Right value. @returns Sort order. */
          (a, b) => a - b,
        );
    return {
      imported: true,
      xml,
      canonical: {
        paragraphs: paragraphs.length,
        links: paragraphs.reduce(
          /** Counts hyperlink runs. @param count - Prior count. @param paragraph - Text node. @returns Updated count. */
          (count, paragraph) =>
            count +
            projectWriterTextRuns(paragraph).filter(
              /** Selects linked runs. @param run - Text run. @returns Whether linked. */
              (run) => run.hyperlink !== undefined,
            ).length,
          0,
        ),
        listParagraphs: paragraphs.filter(
          /** Selects list paragraphs. @param paragraph - Text node. @returns Whether listed. */
          (paragraph) => paragraph.GetListKind() !== "none",
        ).length,
        paragraphMetrics: {
          leftMargins: unique(
            paragraphs.map(
              /** Reads left indent. @param paragraph - Text node. @returns Twips. */
              (paragraph) => paragraph.GetParagraphTextLeftMargin(),
            ),
          ),
          rightMargins: unique(
            paragraphs.map(
              /** Reads right indent. @param paragraph - Text node. @returns Twips. */
              (paragraph) => paragraph.GetParagraphRightMargin(),
            ),
          ),
          firstLineIndents: unique(
            paragraphs.map(
              /** Reads first-line indent. @param paragraph - Text node. @returns Twips. */
              (paragraph) => paragraph.GetParagraphFirstLineIndent(),
            ),
          ),
          printWidths: unique(
            paragraphs.map(
              /** Reads printable text width. @param paragraph - Text node. @returns Twips. */
              (paragraph) => {
                const bounds = projectSwTextPrintBounds(paragraph, page);
                return bounds.right - bounds.left;
              },
            ),
          ),
        },
        page: {
          width: page.width,
          height: page.height,
          leftMargin: page.leftMargin,
          rightMargin: page.rightMargin,
          topMargin: page.topMargin,
          bottomMargin: page.bottomMargin,
        },
      },
      diagnostics: [...counts.values()].sort(compareDiagnostics),
    };
  } catch {
    if (
      ![...counts.values()].some(
        /** Finds an XML-stage failure. @param diagnostic - Event. @returns Whether import failed. */
        (diagnostic) => diagnostic.kind === "import-error",
      )
    )
      onDiagnostic({ kind: "import-error", path: "", name: "", stream: "package" });
    return {
      imported: false,
      xml,
      canonical: {
        paragraphs: 0,
        links: 0,
        listParagraphs: 0,
        paragraphMetrics: {
          leftMargins: [],
          rightMargins: [],
          firstLineIndents: [],
          printWidths: [],
        },
        page: null,
      },
      diagnostics: [...counts.values()].sort(compareDiagnostics),
    };
  }
}

/** Classifies only relationships supported by element ownership; uncertain cases stay explicit. @param diagnostic - Structural diagnostic. @returns Conservative impact class. */
function classifyLoss(diagnostic: OdfXmlDiagnostic): CountedOdtDiagnostic["loss"] {
  if (diagnostic.path.includes("/table:table")) return "content";
  if (
    diagnostic.path.includes("/text:bookmark") ||
    diagnostic.path.includes("/text:soft-page-break")
  )
    return "structure";
  if (diagnostic.path.includes("/style:") || diagnostic.path.includes("/text:span"))
    return "styling";
  if (diagnostic.path.includes("/office:meta") || diagnostic.path.includes("/office:settings"))
    return "metadata";
  return "unclassified";
}

/** Stabilizes reports across runs. @param a - Left diagnostic. @param b - Right diagnostic. @returns Sort order. */
function compareDiagnostics(a: CountedOdtDiagnostic, b: CountedOdtDiagnostic): number {
  return `${a.stream}:${a.path}:${a.kind}:${a.name}`.localeCompare(
    `${b.stream}:${b.path}:${b.kind}:${b.name}`,
  );
}
