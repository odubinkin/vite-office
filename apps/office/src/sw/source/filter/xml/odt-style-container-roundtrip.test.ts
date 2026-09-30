/** @fileoverview Verifies pinned common/automatic container ownership and parent lookup through literal real ODT package cycles. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Emits one literal source definition. @param name - Source identity. @param family - Style family. @param parent - Optional named parent. @param properties - Literal property XML. @returns Definition XML. */
function style(
  name: string,
  family: "paragraph" | "text",
  parent: string | undefined,
  properties = "",
): string {
  return `<style:style style:name="${name}" style:family="${family}"${parent === undefined ? "" : ` style:parent-style-name="${parent}"`}>${properties}</style:style>`;
}
const bold = '<style:text-properties fo:font-weight="bold"/>';
const italic = '<style:text-properties fo:font-style="italic"/>';
const underline = '<style:text-properties style:text-underline-style="solid"/>';
const common = [
  style(
    "Shared",
    "paragraph",
    "Standard",
    '<style:paragraph-properties fo:text-align="right" fo:margin-left="1in"/>' + bold,
  ),
  style("Shared", "text", undefined, italic),
  style(
    "Parent",
    "paragraph",
    "Standard",
    '<style:paragraph-properties fo:text-align="right" fo:margin-left="1in"/>' + bold,
  ),
  style("Parent", "text", undefined, bold),
  style("Chain", "paragraph", "Parent", italic),
  style("Chain", "text", "Parent", italic),
].join("");
const automatic = [
  style(
    "Shared",
    "paragraph",
    "Shared",
    '<style:paragraph-properties fo:text-align="center" fo:margin-left="0.5in"/><style:text-properties fo:font-weight="normal"/>',
  ),
  style("Shared", "text", "Shared", underline),
  style(
    "Parent",
    "paragraph",
    "Standard",
    '<style:paragraph-properties fo:margin-left="3in"/>' + underline,
  ),
  style("Parent", "text", undefined, underline),
  style("Child", "paragraph", "Parent", italic),
  style("Child", "text", "Parent", italic),
  style(
    "AutoOnly",
    "paragraph",
    "Standard",
    '<style:paragraph-properties fo:margin-left="3in"/>' + bold,
  ),
  style("AutoOnly", "text", undefined, bold),
  style("Orphan", "paragraph", "AutoOnly", italic),
  style("Orphan", "text", "AutoOnly", italic),
  style("SelfOnly", "paragraph", "SelfOnly", italic),
  style("SelfOnly", "text", "SelfOnly", italic),
  style("MissingParent", "paragraph", "Missing", italic),
  style("MissingParent", "text", "Missing", italic),
  style("EmptyParent", "paragraph", "", italic),
  style("EmptyParent", "text", "", italic),
  style("Propertyless", "paragraph", "Shared"),
  style("Propertyless", "text", "Shared"),
  style(
    "Standard",
    "paragraph",
    "Standard",
    '<style:paragraph-properties fo:text-align="center"/>' + bold,
  ),
].join("");

/** Injects literal source containers without changing package metadata. @param base - Real Writer ODT. @param body - Literal paragraph. @param named - Common definitions. @param stylesAutomatic - styles.xml automatic definitions. @param contentAutomatic - Active replacement, or undefined to omit the new container. @returns ODT bytes. */
async function input(
  base: Uint8Array,
  body: string,
  named: string | undefined,
  stylesAutomatic: string,
  contentAutomatic: string | undefined,
): Promise<Uint8Array> {
  const zip = new ZipFile(base);
  const output = new ZipOutputStream();
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml") {
      const xml = await zip.readTextEntry(entry);
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml
            .replace(
              /<office:styles>[\s\S]*?<\/office:styles>/u,
              /** Retains the existing common definitions or omits their container. @param container - Original common XML. @returns Literal named input. */
              (container) =>
                named === undefined
                  ? ""
                  : container.replace("</office:styles>", `${named}</office:styles>`),
            )
            .replace("</office:automatic-styles>", `${stylesAutomatic}</office:automatic-styles>`),
        ),
      );
    } else if (entry === "content.xml") {
      const xml = await zip.readTextEntry(entry);
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml
            .replace(
              /<office:automatic-styles>[\s\S]*?<\/office:automatic-styles>/u,
              contentAutomatic === undefined
                ? ""
                : `<office:automatic-styles>${contentAutomatic}</office:automatic-styles>`,
            )
            .replace(/<office:text>[\s\S]*?<\/office:text>/u, `<office:text>${body}</office:text>`),
        ),
      );
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

/** Checks manual effective model values on import and reopen. @param base - Package baseline. @param body - Input paragraph. @param named - Common definitions. @param stylesAutomatic - Previous automatic context. @param contentAutomatic - Active automatic replacement. @param expected - Manual text/geometry/format values. @returns Completion after both package states. */
async function assertCycle(
  base: Uint8Array,
  body: string,
  named: string,
  stylesAutomatic: string,
  contentAutomatic: string | undefined,
  expected: {
    alignment: string;
    margin: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
  },
): Promise<void> {
  const imported = await readOdtDocument(
    await input(base, body, named, stylesAutomatic, contentAutomatic),
    { title: "Style containers" },
  );
  const reopened = await readOdtDocument(
    writeOdtDocument(imported.document, { title: "Style containers" }),
    { title: "Style containers" },
  );
  for (const document of [imported.document, reopened.document]) {
    expect(document.paragraphs).toHaveLength(1);
    const paragraph = document.paragraphs[0];
    expect(paragraph?.GetParagraphAlignment()).toBe(expected.alignment);
    expect(paragraph?.GetParagraphTextLeftMargin()).toBe(expected.margin);
    expect(
      projectWriterTextRuns(paragraph).map(
        /** Projects source-independent effective run state. @param run - Model run. @returns Text and format tuple. */
        (run) => [run.text, run.attributes.bold, run.attributes.italic, run.attributes.underline],
      ),
    ).toEqual([["x", expected.bold, expected.italic, expected.underline]]);
  }
}

it("applies automatic styles directly and resolves every parent only in common styles", /** Verifies legal equal names and named-only parent chains against literal upstream contracts. @returns Completion after all package cycles. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), { title: "Style containers" });
  const cases = [
    ["Shared", "Shared", "center", 720, false, true, true],
    ["Child", "Child", "right", 1440, true, true, false],
    ["Chain", "Chain", "right", 1440, true, true, false],
    ["Orphan", "Orphan", "left", 0, false, true, false],
    ["SelfOnly", "SelfOnly", "left", 0, false, true, false],
    ["MissingParent", "MissingParent", "left", 0, false, true, false],
    ["EmptyParent", "EmptyParent", "left", 0, false, true, false],
    ["Propertyless", "Propertyless", "right", 1440, true, true, false],
    ["Standard", "Missing", "center", 0, true, false, false],
    ["Missing", "Missing", "left", 0, false, false, false],
    ["Missing", "Chain", "left", 0, true, true, false],
  ] as const;
  for (const [
    paragraph,
    text,
    alignment,
    margin,
    boldValue,
    italicValue,
    underlineValue,
  ] of cases) {
    await assertCycle(
      base,
      `<text:p text:style-name="${paragraph}"><text:span text:style-name="${text}">x</text:span></text:p>`,
      common,
      "",
      automatic,
      { alignment, margin, bold: boldValue, italic: italicValue, underline: underlineValue },
    );
  }
});

it("replaces the active automatic context while retaining independent common styles", /** Verifies styles.xml versus content.xml reference replacement including absent and empty containers. @returns Completion after package cycles. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), { title: "Replacement" });
  const previous =
    style(
      "Stream",
      "paragraph",
      "Parent",
      '<style:paragraph-properties fo:text-align="center"/>' + italic,
    ) + style("Stream", "text", "Parent", underline);
  const replacement =
    style(
      "Stream",
      "paragraph",
      "Parent",
      '<style:paragraph-properties fo:text-align="left"/>' + italic,
    ) + style("Stream", "text", "Parent", italic);
  const body =
    '<text:p text:style-name="Stream"><text:span text:style-name="Stream">x</text:span></text:p>';
  await assertCycle(base, body, common, previous, undefined, {
    alignment: "center",
    margin: 1440,
    bold: true,
    italic: true,
    underline: true,
  });
  await assertCycle(base, body, common, previous, "", {
    alignment: "left",
    margin: 0,
    bold: false,
    italic: false,
    underline: false,
  });
  await assertCycle(base, body, common, previous, replacement, {
    alignment: "left",
    margin: 1440,
    bold: true,
    italic: true,
    underline: false,
  });
  const automaticDefault =
    '<style:default-style style:family="paragraph"><style:text-properties fo:font-weight="bold"/></style:default-style>';
  await assertCycle(base, "<text:p>x</text:p>", common, automaticDefault, automaticDefault, {
    alignment: "left",
    margin: 0,
    bold: false,
    italic: false,
    underline: false,
  });
});

it("preserves the existing missing common-container diagnostic", /** Checks the bounded Writer bridge when the required named Standard container is absent. @returns Completion after rejection. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), { title: "Absent common container" });
  const bytes = await input(base, "<text:p>x</text:p>", undefined, "", "");
  await expect(readOdtDocument(bytes, { title: "Absent common container" })).rejects.toThrow(
    "ODF Writer Standard paragraph style is missing.",
  );
});
