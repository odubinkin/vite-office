/** @fileoverview Real Calc shadow/relief slots,shared Writer menus,attribute history and native ODS property handlers. */
import { ScDocument } from "../../inc/document";
import { ScXMLImport } from "../../source/filter/xml/xmlimprt";
import { expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../editeng/source/items/textitem";
import { ScAddress } from "../../inc/address";
import type { ScPatternAttr } from "../../inc/patattr";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { FontRelief } from "../../../vcl/inc/fntstyle";
/** Reads original actual native item. @param session - Real session. @param col - Column. @returns Item pair. */
function effects(session: ReturnType<typeof createCalcSession>, col = 0) {
  const pattern = session.controller.shell
    .GetDocument()
    .GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr;
  return [
    (pattern.GetItem(108) as SvxShadowedItem).GetValue(),
    (pattern.GetItem(124) as SvxCharReliefItem).GetValue(),
  ];
}
it("routes source shadow menu through shared Writer controls and real complete native attribute history", /** Exercises actual workbench. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  let surface: ReturnType<typeof render> | undefined;
  try {
    c.EnterString("Shadow");
    surface = render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Shadow" }));
    expect(effects(s)).toEqual([true, 0]);
    expect(document.querySelector('feOffset[result="special-offset"]')).not.toBeNull();
    c.Undo();
    expect(effects(s)).toEqual([false, 0]);
    c.Redo();
    expect(effects(s)).toEqual([true, 0]);
    expect(d.Execute(".uno:CharacterRelief")).toMatchObject({ status: "executed", value: false });
    expect(
      d.Execute(".uno:CharacterRelief", [new SvxCharReliefItem(FontRelief.Engraved, 10920)]).status,
    ).toBe("executed");
    expect(effects(s)).toEqual([true, 2]);
  } finally {
    surface?.unmount();
    s.Close();
  }
});
it("retains original mixed/default toggles,complete typed requests and real marked history", /** Uses actual source selection. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    d.Execute(".uno:Shadowed");
    c.Select(1, 0, true);
    expect(d.QueryState(".uno:Shadowed").mixed).toBe(true);
    d.Execute(".uno:Shadowed");
    expect(effects(s)).toEqual([true, 0]);
    expect(effects(s, 1)).toEqual([true, 0]);
    d.Execute(".uno:Shadowed", [new SvxShadowedItem(false, 10010)]);
    expect(effects(s)).toEqual([false, 0]);
    expect(effects(s, 1)).toEqual([false, 0]);
    c.Undo();
    expect(effects(s, 1)).toEqual([true, 0]);
    d.Execute(".uno:CharacterRelief", [new SvxCharReliefItem(FontRelief.Embossed, 124)]);
    expect(effects(s, 1)).toEqual([true, 1]);
  } finally {
    s.Close();
  }
});
it("keeps original shadow/relief lexical spellings and values through repeated actual ZIP reopens", /** Actual package transport and native items. @returns Completion. */ async () => {
  const s = createCalcSession(),
    d = s.frame.GetDispatcher();
  try {
    d.Execute(".uno:Shadowed");
    d.Execute(".uno:CharacterRelief", [new SvxCharReliefItem(FontRelief.Engraved, 124)]);
    let bytes = writeOdsDocument(s.controller.shell.GetDocument());
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:text-shadow="1pt 1pt"');
    expect(content).toContain('style:font-relief="engraved"');
    for (let cycle = 0; cycle < 3; cycle++) {
      const doc = await readOdsDocument(bytes);
      try {
        const p = doc.GetPattern(new ScAddress()) as ScPatternAttr;
        expect((p.GetItem(108) as SvxShadowedItem).GetValue()).toBe(true);
        expect((p.GetItem(124) as SvxCharReliefItem).GetValue()).toBe(2);
        bytes = writeOdsDocument(doc);
      } finally {
        doc.DisposeAttributes();
      }
    }
  } finally {
    s.Close();
  }
});

it("imports independent native shadow/relief XML including original permissive lexical and invalid relief contracts", /** Uses literal external-style XML rather than production exporter output. @returns Nothing. */ () => {
  for (const [shadow, relief, expectedShadow, expectedRelief, errors] of [
    ["none", "none", false, 0, 0],
    [" none", "embossed", true, 1, 0],
    ["", "engraved", true, 2, 0],
    ["nonsense", "EMBOSSED", true, 0, 1],
  ] as const) {
    const doc = new ScDocument(),
      diagnostics: string[] = [];
    try {
      new ScXMLImport(doc, {
        onDiagnostic:
          /** Captures real importer diagnostics. @param item - Native diagnostic. @returns Nothing. */ (
            item,
          ) => {
            diagnostics.push(item.name);
          },
      }).importContent(
        `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell"><style:text-properties fo:text-shadow="${shadow}" style:font-relief="${relief}"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="ce" office:value-type="float" office:value="42"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
      );
      const p = doc.GetPattern(new ScAddress()) as ScPatternAttr;
      expect((p.GetItem(108) as SvxShadowedItem).GetValue()).toBe(expectedShadow);
      expect((p.GetItem(124) as SvxCharReliefItem).GetValue()).toBe(expectedRelief);
      expect(doc.GetValue(new ScAddress())).toBe(42);
      expect(diagnostics).toHaveLength(errors);
    } finally {
      doc.DisposeAttributes();
    }
  }
});
