/** @fileoverview Original reference dispatch,input selection and local address formatting contracts over real document/view owners. */
import { expect, it } from "vitest";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScInputHandler } from "../app/inputhdl";
import { ScModule } from "../../../inc/scmod";
import { ScTabView } from "../inc/tabview";
import { ScRefType } from "../inc/viewdata";
import { ScInputMode } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("formats native local address flags and full-axis endpoint ranges", /** Uses actual owned UTF16 results and rejects unported qualified conventions. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  for (const [address, flags, expected] of [
    [new ScAddress(), ScRefFlags.VALID, "A1"],
    [new ScAddress(26, 5, 0), ScRefFlags.VALID | ScRefFlags.COL_ABS | ScRefFlags.ROW_ABS, "$AA$6"],
    [new ScAddress(2, 4, 0), ScRefFlags.COL_VALID, "C"],
    [new ScAddress(2, 4, 0), ScRefFlags.ROW_VALID, "5"],
    [new ScAddress(), ScRefFlags.ZERO, ""],
    [new ScAddress(0, 0, -1), ScRefFlags.VALID, "#REF!"],
    [new ScAddress(0, 0, 1), ScRefFlags.VALID, "#REF!"],
  ] as const) {
    const s = address.Format(flags, doc);
    expect(text(s)).toBe(expected);
    s.dispose();
  }
  const noDoc = new ScAddress(25, 0, 0).Format(ScRefFlags.VALID);
  expect(text(noDoc)).toBe("Z1");
  noDoc.dispose();
  for (const [range, flags, expected] of [
    [new ScRange(), ScRefFlags.ZERO, "#REF!"],
    [new ScRange(2, 0, 0, 2, doc.MaxRow(), 0), ScRefFlags.VALID, "C1:C1048576"],
    [new ScRange(0, 4, 0, doc.MaxCol(), 4, 0), ScRefFlags.VALID, "A5:XFD5"],
    [
      new ScRange(0, 0, 0, 1, 2, 0),
      ScRefFlags.VALID | ScRefFlags.COL_ABS | ScRefFlags.ROW2_ABS,
      "$A1:B$3",
    ],
  ] as const) {
    const s = range.Format(doc, flags);
    expect(text(s)).toBe(expected);
    s.dispose();
  }
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      new ScAddress().Format(ScRefFlags.TAB_3D),
  ).toThrow(/Nonlocal/);
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      new ScAddress().Format(
        ScRefFlags.VALID,
        null,
        new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_R1C1),
      ),
  ).toThrow(/Nonlocal/);
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      new ScRange(0, 0, 0, 0, 0, 1).Format(doc, ScRefFlags.VALID),
  ).toThrow(/Nonlocal/);
  c.Close();
});
it("retains absent input receivers and source reference-handler precedence", /** Actual ScModule receiver ownership dispatches ordered ranges only to the chosen input handler. @returns Nothing. */ () => {
  const missing = new ScInputHandler(),
    m = new ScModule(
      /** Supplies an actually absent active input view. @returns No receiver. */ () => null,
    );
  missing.RemoveSelection();
  missing.AddRefEntry();
  const c = new CalcViewController(),
    range = new ScRange(3, 4, 0, 0, 0, 0);
  missing.SetReference(range, c.shell.GetDocument());
  m.SetReference(range, c.shell.GetDocument());
  m.AddRefEntry();
  expect(m.IsFormulaMode()).toBe(false);
  expect(m.GetInputHdl()).toBe(null);
  m.SetRefInputHdl(c.inputHandler);
  expect(m.GetInputHdl(false)).toBe(null);
  expect(m.GetInputHdl()).toBe(c.inputHandler);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=");
  expect(m.IsFormulaMode()).toBe(true);
  m.SetReference(range, c.shell.GetDocument());
  expect(c.Input()).toBe("=A1:D5");
  m.SetRefInputHdl(null);
  c.Close();
});
it("adjusts UTF16 editor selections, protects equals and uses native separator rules", /** Reference insertion uses actual controller draft,not a test editor backend. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  c.Select(2, 2);
  c.StartInput(ScInputMode.SC_INPUT_TOP, '=SUM("😀";ZZ9)');
  const start = c.Input().indexOf("ZZ9");
  c.SetInputSelection(start + 3, start);
  c.PointReference(new ScAddress(0, 0, 0));
  expect(c.Input()).toBe('=SUM("😀";A1)');
  expect(c.inputSelection).toEqual([start, start + 2]);
  c.SetInputSelection(0, 2);
  c.PointReference(new ScAddress());
  expect(c.Input()).toBe('=SUM("😀";A1)');
  c.SetInputSelection(start, start + 2);
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      c.inputHandler.SetReference(new ScRange(0, 0, 1), doc),
  ).toThrow(/Sheet-qualified/);
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      c.inputHandler.SetReference(new ScRange(0, 0, 0, 0, 0, 1), doc),
  ).toThrow(/Sheet-qualified/);
  for (const source of ["=", "=SUM(", "=SUM(A1;", "=SUM(A1", "=SUM(A1   ", "", "   "]) {
    c.ChangeInput(source);
    c.scModule.AddRefEntry();
    expect(c.Input()).toBe(source + (["=", "=SUM(", "=SUM(A1;"].includes(source) ? "" : ";"));
  }
  c.inputHandler.PrepareReferenceInput();
  c.Cancel();
  c.Close();
});
it("retains native reference lifetime and refuses non-formula InitRef modes", /** Actual source view owns start/end and optional receiver. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    v = new ScTabView(c.viewData, true, c.scModule);
  expect(
    /** Verifies explicit unsupported boundary rejection. @returns Actual guarded result. */ () =>
      v.InitRefMode(0, 0, 0, ScRefType.SC_REFTYPE_FILL),
  ).toThrow(/Non-formula/);
  const detached = new ScTabView(c.viewData);
  detached.DoneRefMode(true);
  detached.UpdateRef(0, 0, 0);
  detached.DoneRefMode(true);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=SUM(");
  v.UpdateRef(1, 1, 0);
  v.InitRefMode(2, 2, 0, ScRefType.SC_REFTYPE_REF);
  expect(c.Input()).toBe("=SUM(B2");
  v.UpdateRef(1, 1, 0);
  v.UpdateRef(0, 0, 0);
  expect(c.Input()).toBe("=SUM(A1:B2");
  v.DoneRefMode(true);
  expect(c.Input()).toBe("=SUM(A1:B2;");
  v.InitRefMode(0, 0, 1, ScRefType.SC_REFTYPE_REF);
  expect(c.Input()).toBe("=SUM(A1:B2;");
  v.DoneRefMode();
  c.Cancel();
  c.Close();
});

it("rejects external and absent active-view reference contexts without a fake document fallback", /** The input handler borrows the real original active view shell and therefore recognizes actual document identity. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    other = new CalcViewController();
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=");
  expect(
    /** Rejects another actual document with the same sheet number. @returns Actual result. */ () =>
      c.inputHandler.SetReference(new ScRange(), other.shell.GetDocument()),
  ).toThrow(/External/);
  const input = c.inputHandler["pReferenceInput"];
  c.inputHandler.BindReferenceInput(input, c.Position(), null);
  expect(
    /** Rejects an absent active native view. @returns Actual result. */ () =>
      c.inputHandler.SetReference(new ScRange(), c.shell.GetDocument()),
  ).toThrow(/inactive/);
  c.inputHandler.BindReferenceInput(input, c.Position(), c["viewShell"]);
  c.PointReference(new ScAddress(1, 1, 0));
  expect(c.Input()).toBe("=B2");
  other.Close();
  c.Close();
});
