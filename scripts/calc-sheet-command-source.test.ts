/** @fileoverview Pinned native defaults and numeric slot identities consumed by Calc sheet-navigation UI. */
import calcResources from "../apps/office/src/sc/uiconfig/scalc/calc-ui.generated.json" with { type: "json" };
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

it("pins input modification rather than value equality as the native write and Undo guard", /** Reads original flag lifecycle and operation history after actual input. @returns Nothing. */ () => {
  const input = source("sc/source/ui/app/inputhdl.cxx"),
    header = source("sc/source/ui/inc/inputhdl.hxx");
  expect(input).toMatch(/bModified\( false \)/);
  expect(header).toContain("SetModified()       { bModified = true; }");
  expect(input).toContain("if (bSetModified)\n        bModified = true;");
  expect(input).toContain("bool bOldMod = bModified;");
  expect(input).toContain("if (bOldMod && !bProtected && !bForget)");
  expect(input.slice(input.indexOf("void ScInputHandler::CancelHandler()"))).toContain(
    "bModified = false;",
  );
  const operation = source("sc/source/ui/operation/SetNormalStringOperation.cxx");
  expect(operation).toContain("std::make_unique<ScUndoEnterData>");
  expect(operation).not.toContain("equalsWithoutFormat");
});

it("pins native deep-token clones,formula copy and owning cell history boundaries", /** Source ownership remains explicit rather than a browser token/value snapshot model. @returns Nothing. */ () => {
  const tokens = source("sc/source/core/tool/token.cxx"),
    formula = source("sc/source/core/data/formulacell.cxx"),
    cells = source("sc/source/core/data/cellvalue.cxx");
  const clone = tokens.slice(
    tokens.indexOf("std::unique_ptr<ScTokenArray> ScTokenArray::Clone() const"),
    tokens.indexOf("ScTokenArray ScTokenArray::CloneValue() const"),
  );
  expect(clone).toContain("*pp = (*pp)->Clone()");
  expect(clone).toContain("nIdx = j; break;");
  expect(clone).toContain("*pp = p->pCode[ nIdx ]");
  expect(formula).toContain("pCode = rCell.pCode->Clone().release()");
  expect(formula).toContain("aResult( rCell.aResult )");
  expect(formula).toContain("bDirty( rCell.bDirty )");
  expect(formula).toContain("new ScFormulaCell(*this, rDocument, aPos)");
  expect(formula).toContain("pCode->GetLen()");
  expect(cells).toContain("maData = rCell.getFormula()->Clone()");
  expect(cells).toContain("maData = aRefVal.getFormula()->Clone()");
  expect(cells).toContain("rDoc.SetFormulaCell(rPos, getFormula()->Clone())");
});

it("pins selected-sheet list transactions and native typed-cell Undo ownership", /** Current UI uses real source value/list owners without simulating unported formatter/view services. @returns Nothing. */ () => {
  const view = source("sc/source/ui/view/viewfunc.cxx"),
    undo = source("sc/source/ui/undo/undocell.cxx"),
    header = source("sc/source/ui/inc/undocell.hxx");
  expect(view).toContain("rFunc.EnterListAction( STR_UNDO_ENTERDATA )");
  expect(view).toContain("for (const auto& rTab : aMark)");
  expect(header).toContain("return ScRange(maPos)");
  expect(undo).toContain("maOldValue(std::move(aOldVal))");
  expect(undo).toContain("SetValue(maOldValue)");
  expect(undo).toContain("SetValue(maNewValue)");
  expect(undo).toContain("aParam.meSetTextNumFormat = ScSetStringParam::Keep");
  expect(source("sc/source/core/data/cellvalue.cxx")).toContain(
    "rDoc.SetFormulaCell(rPos, getFormula())",
  );
  expect(source("include/svl/undo.hxx")).toContain("SfxUndoAction* GetUndoAction(size_t idx)");
});

it("pins complete sheet-tab popup resource and source selection/formula admission", /** Actual native XML and controller bodies define the resource and context policy. @returns Nothing. */ () => {
  const xml = source("sc/uiconfig/scalc/popupmenu/sheettab.xml"),
    control = source("sc/source/ui/view/tabcont.cxx"),
    input = source("sc/source/ui/app/inputhdl.cxx");
  const urls = [...xml.matchAll(/menu:id="([^"]+)"/g)].map(
    /** Reads an original command identity. @param match - Native entry. @returns URL. */ (match) =>
      match[1],
  );
  expect(
    calcResources.surfaces.sheettab.flatMap(
      /** Reads original generated leaves. @param node - Source node. @returns Native URL if a command. */ (
        node,
      ) => ("commandUrl" in node ? [node.commandUrl] : []),
    ),
  ).toEqual(urls);
  expect(urls).toHaveLength(14);
  expect(calcResources.surfaces.sheettab).toHaveLength(17);
  expect([...xml.matchAll(/<menu:menuseparator\/>/g)]).toHaveLength(3);
  expect(control).toContain("bool bAlreadySelected = IsPageSelected( nId )");
  expect(control).toContain("if(bAlreadySelected)\n        return;");
  expect(control).toContain("pScMod->IsFormulaMode() || pScMod->IsModalMode()");
  expect(control).toContain('ExecutePopup( u"sheettab"_ustr )');
  expect(input).toContain("mbEditingExistingContent = !cTyped && !aStr.isEmpty()");
  expect(input).toContain("(!mbEditingExistingContent && (rStr[0] == '+' || rStr[0] == '-'))");
});

it("retains all native visible standardbar commands after explicit browser save-policy removal", /** Checks actual XML composition independently of generated surface projection. @returns Nothing. */ () => {
  const native = source("sc/uiconfig/scalc/toolbar/standardbar.xml");
  const commands = [...native.matchAll(/<toolbar:toolbaritem\s+([^>]+)\/>/g)]
    .filter(
      /** Honors explicit native hidden controls. @param match - Source item. @returns Whether visible. */ (
        match,
      ) => !match[1]?.includes('toolbar:visible="false"'),
    )
    .map(
      /** Reads original identity. @param match - Source attributes. @returns UNO URL. */ (match) =>
        match[1]?.match(/xlink:href="([^"]+)"/)?.[1],
    )
    .filter(
      /** Applies the established primary-document/autosave deviations. @param url - Source command. @returns Whether retained. */ (
        url,
      ) => url !== ".uno:AddDirect" && url !== ".uno:Save",
    );
  const visible = calcResources.surfaces.standardbar
    .filter(
      /** Reads generated visibility. @param node - Resource. @returns Whether visible command. */ (
        node,
      ) => node.kind === "command" && !("visible" in node && node.visible === false),
    )
    .map(
      /** Reads source URL. @param node - Generated node. @returns Command URL. */ (node) =>
        "commandUrl" in node ? node.commandUrl : undefined,
    );
  expect(commands).toHaveLength(30);
  expect(visible).toEqual(commands);
});
