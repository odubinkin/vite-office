/** @fileoverview Native Calc Strikeout menu,full enum items,selection/history and source ODS properties. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { FontStrikeout as S, FontLineStyle as F } from "../../../tools/inc/fontenum";
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
/** Reads actual native strikeout. @param doc - Actual document. @param col - Column. @param tab - Sheet. @returns Enum. */
function style(doc: ScDocument, col = 0, tab = 0): S {
  return (
    doc.GetPattern(new ScAddress(col, 0, tab))?.GetItem(106) as SvxCrossedOutItem
  ).GetStrikeout();
}
/** Independently authored style content. @param properties - Ordered XML properties. @returns Source XML. */
function content(properties: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Strike" style:family="table-cell"><style:text-properties ${properties}/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Strike" office:value-type="string"><text:p>Strikeout text</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("uses the actual Writer menu and original typed strikeout enum without disturbing other line decorations", /** Native double strikeout toggles to NONE and restores through real history. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  try {
    c.EnterString("Strikeout text");
    c.SetOverline(new SvxOverlineItem(F.LINESTYLE_DOUBLE, 105));
    c.SetUnderlineStyle(F.LINESTYLE_SINGLE);
    expect(
      d.ExecuteRequest(new SfxRequest(10013, [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, 10013)])),
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
      glyph = within(cell).getByText("Strikeout text");
    expect(cell).toHaveStyle({ textDecorationLine: "underline" });
    expect(glyph).toHaveStyle({ textDecorationLine: "overline" });
    expect(glyph.parentElement).toHaveStyle({
      textDecorationLine: "line-through",
      textDecorationStyle: "double",
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    const menu = screen.getByRole("menuitemcheckbox", { name: "Strikethrough" });
    expect(menu).toHaveAttribute("aria-checked", "true");
    fireEvent.click(menu);
    expect(style(doc)).toBe(S.STRIKEOUT_NONE);
    act(
      /** Executes actual undo under React notifications. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(style(doc)).toBe(S.STRIKEOUT_DOUBLE);
    act(
      /** Executes actual redo. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(style(doc)).toBe(S.STRIKEOUT_NONE);
    expect(
      /** Rejects a flattened request payload. @returns Dispatch result. */ () =>
        d.Execute(".uno:Strikeout", { enabled: true }),
    ).toThrow("complete SvxCrossedOutItem");
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
    c.SetStrikeout(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, 106));
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(d.QueryState(".uno:Strikeout")).toMatchObject({ mixed: true });
    d.Execute(".uno:Strikeout");
    expect(style(doc)).toBe(S.STRIKEOUT_SINGLE);
    expect(style(doc, 1)).toBe(S.STRIKEOUT_SINGLE);
    c.Undo();
    expect(style(doc)).toBe(S.STRIKEOUT_DOUBLE);
    expect(style(doc, 1)).toBe(S.STRIKEOUT_NONE);
    marks.ResetMark();
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    c.SetStrikeout(new SvxCrossedOutItem(S.STRIKEOUT_BOLD, 106));
    expect(style(doc, 1)).toBe(S.STRIKEOUT_NONE);
    c.Undo();
    c.Redo();
    expect(style(doc, 2)).toBe(S.STRIKEOUT_BOLD);
    const name = unicode("Other");
    doc.InsertTab(1, name);
    name.dispose();
    marks.ResetMark();
    marks.SelectTable(1, true);
    c.SetStrikeout(new SvxCrossedOutItem(S.STRIKEOUT_X, 106));
    expect(style(doc, 0, 1)).toBe(S.STRIKEOUT_X);
    c.Undo();
    expect(style(doc, 0, 1)).toBe(S.STRIKEOUT_NONE);
    c.Redo();
    expect(style(doc, 0, 1)).toBe(S.STRIKEOUT_X);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.SetStrikeout()).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    s.Close();
  }
});
it("preserves all native ODF strikeout enum styles across actual repeated package reopens", /** Type/style/width/text are exported from actual Any values. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  try {
    c.EnterString("Strikeout text");
    for (const [value, type, width, text] of [
      [S.STRIKEOUT_NONE, "none", undefined, undefined],
      [S.STRIKEOUT_SINGLE, "single", undefined, undefined],
      [S.STRIKEOUT_DOUBLE, "double", undefined, undefined],
      [S.STRIKEOUT_BOLD, "single", "bold", undefined],
      [S.STRIKEOUT_SLASH, "single", undefined, "/"],
      [S.STRIKEOUT_X, "single", undefined, "X"],
    ] as const) {
      c.SetStrikeout(new SvxCrossedOutItem(value, 106));
      let bytes = writeOdsDocument(doc);
      const xml = await new ZipFile(bytes).readTextEntry("content.xml");
      expect(xml).toContain(`style:text-line-through-type="${type}"`);
      if (width) expect(xml).toContain(`style:text-line-through-width="${width}"`);
      if (text) expect(xml).toContain(`style:text-line-through-text="${text}"`);
      for (let i = 0; i < 2; i++) {
        const reopened = await readOdsDocument(bytes);
        try {
          expect(style(reopened)).toBe(value);
          bytes = writeOdsDocument(reopened);
        } finally {
          reopened.DisposeAttributes();
        }
      }
    }
  } finally {
    s.Close();
  }
});
it("imports native strikeout properties in actual SAX order and diagnoses invalid lexical values", /** Independently authored attributes exercise source precedence and false/no-write rules. @returns Nothing. */ () => {
  for (const [props, expected] of [
    [
      'style:text-line-through-type="double" style:text-line-through-width="bold" style:text-line-through-style="solid"',
      S.STRIKEOUT_DOUBLE,
    ],
    [
      'style:text-line-through-style="solid" style:text-line-through-width="bold" style:text-line-through-type="none"',
      S.STRIKEOUT_BOLD,
    ],
    [
      'style:text-line-through-text="/suffix" style:text-line-through-type="double"',
      S.STRIKEOUT_SLASH,
    ],
    [
      'style:text-line-through-style="none" style:text-line-through-text="arbitrary"',
      S.STRIKEOUT_X,
    ],
  ] as const) {
    const doc = new Document();
    try {
      new ScXMLImport(doc).importContent(content(props));
      expect(style(doc)).toBe(expected);
    } finally {
      doc.DisposeAttributes();
    }
  }
  const doc = new Document(),
    issues: string[] = [];
  try {
    new ScXMLImport(doc, {
      onDiagnostic:
        /** Captures the real importer diagnostic. @param issue - Diagnostic. @returns Array length. */ (
          issue,
        ) => issues.push(issue.name),
    }).importContent(
      content('style:text-line-through-style="invalid" style:text-line-through-text=""'),
    );
    expect(issues).toEqual(["invalid cell strikeout property", "invalid cell strikeout property"]);
    expect(style(doc)).toBe(S.STRIKEOUT_NONE);
  } finally {
    doc.DisposeAttributes();
  }
});
