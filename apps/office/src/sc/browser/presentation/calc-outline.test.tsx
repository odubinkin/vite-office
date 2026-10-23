/** @fileoverview Native Calc OutlineFont menu,typed boolean items,selection/history and source ODS properties. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { FontLineStyle as F } from "../../../tools/inc/fontenum";
import { ScAddress, ScRange } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import type { ScDocument } from "../../inc/document";
import { ScDocument as Document } from "../../inc/document";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { ScXMLImport } from "../../source/filter/xml/xmlimprt";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
afterEach(cleanup);
/** Reads actual native outline. @param doc - Actual document. @param col - Column. @param tab - Sheet. @returns Contour flag. */
function style(doc: ScDocument, col = 0, tab = 0): boolean {
  return (doc.GetPattern(new ScAddress(col, 0, tab))?.GetItem(107) as SvxContourItem).GetValue();
}
/** Independently authored style content. @param properties - Ordered XML properties. @returns Source XML. */
function content(properties: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Contour" style:family="table-cell"><style:text-properties ${properties}/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Contour" office:value-type="string"><text:p>OutlineFont text</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("uses the actual Writer menu and original typed contour item without disturbing other line decorations", /** Native outline toggles to false and restores through real history. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  try {
    c.EnterString("OutlineFont text");
    c.SetOverline(new SvxOverlineItem(F.LINESTYLE_DOUBLE, 105));
    c.SetUnderlineStyle(F.LINESTYLE_SINGLE);
    expect(
      d.ExecuteRequest(new SfxRequest(10012, [new SvxContourItem(true, 10012)])),
    ).toMatchObject({ value: true });
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const cell = screen.getByRole("gridcell", { name: "A1" }),
      glyph = within(cell).getByText("OutlineFont text");
    expect(cell).toHaveStyle({ textDecorationLine: "none" });
    expect(glyph).toHaveStyle({ textDecorationLine: "overline" });
    expect(cell.querySelectorAll("feOffset")).toHaveLength(8);
    expect(cell.querySelector("feColorMatrix")).toHaveAttribute("result", "center");
    expect(within(cell).getAllByText("OutlineFont text")).toHaveLength(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    const menu = screen.getByRole("menuitemcheckbox", { name: "Outline Font Effect" });
    expect(menu).toHaveAttribute("aria-checked", "true");
    fireEvent.click(menu);
    expect(style(doc)).toBe(false);
    act(
      /** Executes actual undo under React notifications. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(style(doc)).toBe(true);
    act(
      /** Executes actual redo. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(style(doc)).toBe(false);
    expect(
      /** Rejects a flattened request payload. @returns Dispatch result. */ () =>
        d.Execute(".uno:OutlineFont", { enabled: true }),
    ).toThrow("complete SvxContourItem");
  } finally {
    s.Close();
  }
});
it("uses native mixed factories,grouped and disjoint marks and pending-input admission with real attribute history", /** No selected gaps or other sheets are flattened into a browser model. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  try {
    c.SetOutlineFont(new SvxContourItem(true, 107));
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(d.QueryState(".uno:OutlineFont")).toMatchObject({ mixed: true });
    d.Execute(".uno:OutlineFont");
    expect(style(doc)).toBe(true);
    expect(style(doc, 1)).toBe(true);
    c.Undo();
    expect(style(doc)).toBe(true);
    expect(style(doc, 1)).toBe(false);
    marks.ResetMark();
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    c.SetOutlineFont(new SvxContourItem(true, 107));
    expect(style(doc, 1)).toBe(false);
    c.Undo();
    c.Redo();
    expect(style(doc, 2)).toBe(true);
    const name = unicode("Other");
    doc.InsertTab(1, name);
    name.dispose();
    marks.ResetMark();
    marks.SelectTable(1, true);
    c.SetOutlineFont(new SvxContourItem(true, 107));
    expect(style(doc, 0, 1)).toBe(true);
    c.Undo();
    expect(style(doc, 0, 1)).toBe(false);
    c.Redo();
    expect(style(doc, 0, 1)).toBe(true);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.SetOutlineFont()).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    s.Close();
  }
});
it("retains explicit false and true ODS contour properties across repeated reopens", /** Exercises actual package owners and independent source XML. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    c.EnterString("Outline text");
    for (const expected of [true, false]) {
      c.SetOutlineFont(new SvxContourItem(expected, 107));
      let bytes = writeOdsDocument(c.shell.GetDocument());
      expect(await new ZipFile(bytes).readTextEntry("content.xml")).toContain(
        `style:text-outline="${expected}"`,
      );
      for (let i = 0; i < 2; i++) {
        const doc = await readOdsDocument(bytes);
        try {
          expect(style(doc)).toBe(expected);
          bytes = writeOdsDocument(doc);
        } finally {
          doc.DisposeAttributes();
        }
      }
    }
  } finally {
    session.Close();
  }
});
it("imports source boolean lexical forms and diagnoses rejected outline properties", /** Uses independently authored XML and the actual SAX mapper. @returns Nothing. */ () => {
  for (const [props, expected, invalid] of [
    ['style:text-outline="true"', true, false],
    ['style:text-outline="false"', false, false],
    ["", false, false],
    ['style:text-outline="1"', false, true],
    ['style:text-outline="TRUE"', false, true],
  ] as const) {
    const doc = new Document(),
      issues: string[] = [];
    try {
      new ScXMLImport(doc, {
        onDiagnostic:
          /** Captures native diagnostics. @param issue - Diagnostic. @returns Count. */ (issue) =>
            issues.push(issue.name),
      }).importContent(content(props));
      expect(style(doc)).toBe(expected);
      expect(issues).toEqual(invalid ? ["invalid cell outline property"] : []);
    } finally {
      doc.DisposeAttributes();
    }
  }
});
