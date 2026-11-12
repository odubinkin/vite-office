/** @fileoverview Genuine Writer/UNO style names across named XML attributes, graph references, custom renames and ODF reopen. */
import { expect, it } from "vitest";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwDoc } from "../../core/doc/doc";
import { exportStylesXml, exportContentXml } from "./xmlexp";
import { getParagraphOdfStyleName, exportParagraphStyleNameAttributes } from "./xmlexp-style-names";
import { exportStyleNameAttributes } from "../../../../xmloff/source/style/styleexp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
it("uses programmatic names and conditional display-name at the XMLStyleExport boundary", /** Keeps native style-name versus UI-name semantics. @returns Nothing. */ () => {
  expect(exportStyleNameAttributes("Standard", "Standard")).toBe(' style:name="Standard"');
  expect(exportStyleNameAttributes('A&B "name"', "A_26_B_20__22_name_22_")).toBe(
    ' style:name="A_26_B_20__22_name_22_" style:display-name="A&amp;B &quot;name&quot;"',
  );
  const doc = new SwDoc(),
    standard = doc.GetDfltTextFormatColl(),
    body = doc.GetTextFormatColl("text-body");
  expect(exportParagraphStyleNameAttributes(standard)).toBe(' style:name="Standard"');
  expect(exportParagraphStyleNameAttributes(body)).toBe(
    ' style:name="Text_20_body" style:display-name="Text body"',
  );
  expect(getParagraphOdfStyleName(doc, "heading-1")).toBe("Heading_20_1");
  expect(exportStylesXml(doc)).not.toContain('style:display-name="Default Paragraph Style"');
  doc.Dispose();
});
it("exports current custom names rather than stale graph IDs and keeps parent/follow/body references aligned", /** Uses actual canonical named owners after a rename. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTextFormatColl("Parent UI", doc.GetDfltTextFormatColl(), "parent-graph-id"),
    child = doc.MakeTextFormatColl("Text body", parent, "child-graph-id"),
    node = doc.paragraphs[0] as SwTextNode;
  child.SetNextTextFormatColl(parent);
  child.SetFormatName("Body Text (user)");
  node.ChgFormatColl(child);
  const styles = exportStylesXml(doc),
    content = exportContentXml(doc);
  expect(styles).toContain(
    'style:name="Body_20_Text" style:display-name="Body Text" style:family="paragraph" style:next-style-name="Parent_20_UI" style:parent-style-name="Parent_20_UI"',
  );
  expect(styles).not.toContain('style:name="child-graph-id"');
  expect(content).toContain('text:style-name="Body_20_Text"');
  expect(node.GetParagraphStyle()).toBe("child-graph-id");
  doc.Dispose();
});
it("reopens canonical default and built-in paragraph names without inventing a user-suffixed default", /** Verifies the browser regression with the real ODF package path. @returns Completion. */ async () => {
  const doc = new SwDoc();
  doc.GetTextFormatColl("text-body");
  const metadata = { title: "Native style names" },
    reopened = (await readOdtDocument(await writeOdtDocument(doc, metadata), metadata)).document;
  expect(reopened.GetDfltTextFormatColl().GetName()).toBe("Default Paragraph Style");
  expect(
    reopened
      .GetTextFormatColls()
      .some(
        /** Rejects an invented duplicate. @param format - Actual owner. @returns Duplicate match. */ (
          format,
        ) => format.GetName() === "Default Paragraph Style (user)",
      ),
  ).toBe(false);
  expect(reopened.GetTextFormatColl("text-body").GetName()).toBe("Body Text");
  reopened.Dispose();
  doc.Dispose();
});
