/** @fileoverview Actual native Overline menu,typed item,selection/history and ODS line-property integration. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScPatternAttr } from "../../inc/patattr";
import { ScDocument } from "../../inc/document";
import { SvxOverlineItem, SvxUnderlineItem } from "../../../editeng/source/items/textitem";
import { FontLineStyle as F } from "../../../tools/inc/fontenum";
import { Color } from "../../../tools/inc/color";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { ScInputMode } from "../../inc/global";
import { ScXMLImport } from "../../source/filter/xml/xmlimprt";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
afterEach(cleanup);
/** Reads the actual native item. @param doc - Model. @param col - Column. @param tab - Sheet. @returns Borrowed line. */
function line(doc: ScDocument, col = 0, tab = 0): SvxOverlineItem {
  return doc.GetPattern(new ScAddress(col, 0, tab))?.GetItem(105) as SvxOverlineItem;
}
/** Creates independently authored ODF content with one native cell style. @param properties - Ordered line XML attributes. @returns Content. */
function content(properties: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Line" style:family="table-cell"><style:text-properties ${properties}/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Line" office:value-type="string"><text:p>Overline text</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("uses the shared Writer Format/Text menu and real overline metadata with independent underline painting", /** Native bound toggles retain the queried line color and document history. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  try {
    c.EnterString("Overline text");
    const over = new SvxOverlineItem(F.LINESTYLE_DOUBLE, 11568);
    over.SetColor(new Color(0x123456));
    expect(d.ExecuteRequest(new SfxRequest(11568, [over]))).toMatchObject({ value: true });
    const delta = new ScPatternAttr(doc.getCellAttributeHelper());
    delta.ItemSetPut(new SvxUnderlineItem(F.LINESTYLE_SINGLE, 104));
    doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
    delta.Dispose();
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const cell = screen.getByRole("gridcell", { name: "A1" }),
      text = within(cell).getByText("Overline text");
    expect(cell).toHaveStyle({ textDecorationLine: "underline" });
    expect(text).toHaveStyle({
      textDecorationLine: "overline",
      textDecorationStyle: "double",
      textDecorationColor: "rgb(18, 52, 86)",
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    const command = screen.getByRole("menuitemcheckbox", { name: "Overline" });
    expect(command).toHaveAttribute("aria-checked", "true");
    fireEvent.click(command);
    expect(line(doc).GetLineStyle()).toBe(F.LINESTYLE_NONE);
    expect(line(doc).GetColor().toUInt32()).toBe(0x123456);
    act(
      /** Executes real history within React notifications. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(line(doc).GetLineStyle()).toBe(F.LINESTYLE_DOUBLE);
    act(
      /** Replays the real attribute delta. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(line(doc).GetLineStyle()).toBe(F.LINESTYLE_NONE);
  } finally {
    s.Close();
  }
});
it("uses the native mixed-state factory and marked attribute history without changing selection gaps", /** Pending invalid input prevents attribute application. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  try {
    const colored = new SvxOverlineItem(F.LINESTYLE_DOUBLE, 105);
    colored.SetColor(new Color(0x123456));
    c.SetOverline(colored);
    const range = new ScRange(0, 0, 0, 1, 0, 0);
    marks.SetMarkArea(range);
    expect(d.QueryState(".uno:Overline")).toMatchObject({ mixed: true });
    expect(d.Execute(".uno:Overline")).toMatchObject({ value: true });
    expect(line(doc).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    expect(line(doc, 1).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    expect(line(doc).GetColor().GetAlpha()).toBe(0);
    c.Undo();
    expect(line(doc, 1).GetLineStyle()).toBe(F.LINESTYLE_NONE);
    marks.ResetMark();
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    c.SetOverline(new SvxOverlineItem(F.LINESTYLE_SINGLE, 105));
    expect(line(doc, 1).GetLineStyle()).toBe(F.LINESTYLE_NONE);
    c.Undo();
    c.Redo();
    expect(line(doc, 2).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    expect(
      /** Rejects incomplete request arguments. @returns Dispatch result. */ () =>
        d.Execute(".uno:Overline", { enabled: true }),
    ).toThrow("complete SvxOverlineItem");
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.SetOverline()).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    s.Close();
  }
});
it("writes and reopens native overline style,type,width and color independently of underline", /** Real package registration includes explicit overline-only patterns and metadata. @returns Completion. */ async () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    content(
      'style:text-overline-style="solid" style:text-overline-type="double" style:text-overline-width="auto" style:text-overline-color="#123456" style:text-underline-style="solid" style:text-underline-type="single" style:text-underline-color="font-color"',
    ),
  );
  try {
    expect(line(doc).GetLineStyle()).toBe(F.LINESTYLE_DOUBLE);
    const bytes = writeOdsDocument(doc),
      xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml).toContain('style:text-overline-type="double"');
    expect(xml).toContain('style:text-overline-color="#123456"');
    const reopened = await readOdsDocument(bytes);
    try {
      expect(line(reopened).GetLineStyle()).toBe(F.LINESTYLE_DOUBLE);
      expect(line(reopened).GetColor().toUInt32()).toBe(0x123456);
    } finally {
      reopened.DisposeAttributes();
    }
  } finally {
    doc.DisposeAttributes();
  }
  const invalid = new ScDocument(),
    issues: string[] = [];
  new ScXMLImport(invalid, {
    onDiagnostic:
      /** Records actual importer diagnostics. @param issue - Import diagnostic. @returns Array length. */ (
        issue,
      ) => issues.push(issue.name),
  }).importContent(content('style:text-overline-style="bad" style:text-overline-color="bad"'));
  expect(issues).toContain("invalid cell overline property");
  invalid.DisposeAttributes();
});

it("applies source overline-only patterns to grouped sheets and restores them through real history", /** The native simple selection retains independent grouped-sheet attributes. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    name = unicode("Other");
  try {
    doc.InsertTab(1, name);
    name.dispose();
    c.viewData.GetMarkData().SelectTable(1, true);
    const item = new SvxOverlineItem(F.LINESTYLE_SINGLE, 105);
    c.SetOverline(item);
    expect(line(doc, 0, 1).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    c.Undo();
    expect(line(doc, 0, 1).GetLineStyle()).toBe(F.LINESTYLE_NONE);
    c.Redo();
    expect(line(doc, 0, 1).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    const reopened = await readOdsDocument(writeOdsDocument(doc));
    try {
      expect(line(reopened, 0, 1).GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
    } finally {
      reopened.DisposeAttributes();
    }
  } finally {
    s.Close();
  }
});
