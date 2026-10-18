/** @fileoverview Pinned native defaults and numeric slot identities consumed by Calc sheet-navigation UI. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
/** Reads an original pinned source. @param path - Relative native path. @returns Text. */
function source(path: string): string {
  return readFileSync("vendor/libreoffice-reference/" + path, "utf8");
}
it("pins native wrap=true and original sheet-navigation slot offsets", /** Checks actual upstream configuration and command declarations. @returns Nothing. */ () => {
  const schema = source("officecfg/registry/schema/org/openoffice/Office/Calc.xcs"),
    slots = source("sc/inc/sc.hrc"),
    shared = source("include/sfx2/sfxsids.hrc"),
    sdi = source("sc/sdi/scalc.sdi");
  expect(
    schema.match(/<prop oor:name="WrapNextPrevSheetTab"[\s\S]*?<value>(.*?)<\/value>/)?.[1],
  ).toBe("true");
  expect(shared).toMatch(/#define SID_KEYFUNC_START\s+\(SID_SC_START \+ 521\)/);
  expect(source("include/svl/solar.hrc")).toMatch(/#define SID_SC_START\s+26000/);
  for (const [name, offset] of [
    ["SID_NEXT_TABLE", 22],
    ["SID_PREV_TABLE", 23],
    ["SID_NEXT_TABLE_SEL", 40],
    ["SID_PREV_TABLE_SEL", 41],
  ] as const)
    expect(slots).toMatch(new RegExp(`#define ${name}\\s+\\(SID_KEYFUNC_START \\+ ${offset}\\)`));
  expect(slots).toMatch(/#define FID_TAB_SELECTALL\s+\(TAB_POPUP_START\+3\)/);
  expect(slots).toMatch(/#define FID_TAB_DESELECTALL\s+\(TAB_POPUP_START\+7\)/);
  expect(sdi).toContain("SfxVoidItem JumpToNextTable SID_NEXT_TABLE");
  expect(sdi).toContain("SfxVoidItem TableSelectAll FID_TAB_SELECTALL");
});

it("pins Go to Sheet one-based Nr and case-sensitive source filter behavior", /** Checks original slot,dialog and handler composition. @returns Nothing. */ () => {
  expect(source("sc/inc/sc.hrc")).toMatch(
    /#define SID_CURRENTTAB\s+TypedWhichId<SfxUInt16Item>\(SC_VIEW_START \+ 42\)/,
  );
  expect(source("sc/sdi/scalc.sdi")).toContain("(SfxUInt16Item Nr SID_CURRENTTAB)");
  const handler = source("sc/source/ui/view/tabvwsh3.cxx"),
    dialog = source("sc/source/ui/miscdlgs/gototabdlg.cxx");
  expect(handler).toContain("GetValue() - 1");
  expect(dialog).toContain("SelectionMode::Single");
  expect(dialog).toContain("m_xLb->clear()");
  expect(dialog).toContain("s.indexOf(aMask) >= 0");
  expect(dialog).toContain("m_xDialog->response(RET_OK)");
  const ui = source("sc/uiconfig/scalc/ui/gotosheetdialog.ui");
  for (const id of ["entry-mask", "treeview", "ok", "cancel", "help"])
    expect(ui).toContain(`id="${id}"`);
});

it("pins original four input modes,F2 slot and noncommitting mode toggle", /** Checks actual native declaration and shell routing guards. @returns Nothing. */ () => {
  expect(source("sc/inc/global.hxx")).toMatch(
    /enum ScInputMode\s*\{\s*SC_INPUT_NONE,\s*SC_INPUT_TYPE,[^\n]*\n\s*SC_INPUT_TABLE,[^\n]*\n\s*SC_INPUT_TOP/,
  );
  expect(source("sc/inc/sc.hrc")).toMatch(/#define SID_SETINPUTMODE\s+\(SID_KEYFUNC_START \+ 31\)/);
  expect(source("sc/sdi/scalc.sdi")).toContain("SfxVoidItem SetInputMode SID_SETINPUTMODE");
  expect(source("sc/source/ui/inc/inputhdl.hxx")).toContain("eMode != SC_INPUT_TYPE");
  expect(source("sc/source/ui/app/inputhdl.cxx")).toMatch(
    /eMode == SC_INPUT_TABLE\s*\? SC_INPUT_TYPE\s*: SC_INPUT_TABLE/,
  );
  expect(source("sc/source/ui/view/cellsh4.cxx")).toContain(
    "!pHdl->IsInputMode() || pHdl->IsTopMode()",
  );
  expect(source("sc/source/ui/view/tabvwsh4.cxx")).toContain(
    "bool bInPlace   = pScMod->IsEditMode()",
  );
});
