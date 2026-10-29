/** @fileoverview CSV admission retains existing cells, literal multiline ownership and overflow counters. */
import { assert, expect, it, vi } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { SC_COL_TEXT, ScAsciiOptions } from "../dbgui/asciiopt";
import { ScDocShell } from "./docsh";
import { ScImportExport } from "./impex";

it("clears empty fields only when skip-empty is disabled and rejects an unconfigured importer", /** Checks actual document cells through the public import route. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  try {
    const converter = new ScImportExport(doc);
    doc.SetValue(new ScAddress(), 42);
    expect(converter.ImportStream(new TextEncoder().encode("A"))).toBe(false);
    expect(doc.GetValue(new ScAddress())).toBe(42);
    const options = new ScAsciiOptions();
    options.aFieldSeps = ",";
    options.bSkipEmptyCells = true;
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode(",B\n"))).toBe(true);
    expect(doc.GetValue(new ScAddress())).toBe(42);
    options.bSkipEmptyCells = false;
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode(",B\n"))).toBe(true);
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  } finally {
    shell.Close();
  }
});

it("imports literal multiline fields and empty fixed-width spans through native cells", /** Checks text-only multiline transport, block-position invalidation and zero-width field admission. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  try {
    const converter = new ScImportExport(doc);
    const options = new ScAsciiOptions();
    options.aFieldSeps = ",";
    options.mvColStart = [1];
    options.mvColFormat = [SC_COL_TEXT];
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode('"A\nB",2\n'))).toBe(true);
    const edit = doc.GetRefCellValue(new ScAddress()).getEditText();
    assert(edit);
    const value = edit.GetText();
    try {
      expect(text(value)).toBe("A\nB");
    } finally {
      value.dispose();
    }
    options.bFixedLen = true;
    options.mvColStart = [0, 0, 1];
    options.mvColFormat = [];
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode("AB\n"))).toBe(true);
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
    expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("A");
    expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe("B");
    options.nStartRow = 5;
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode("ignored\n"))).toBe(true);
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  } finally {
    shell.Close();
  }
});

it.each([false, true])(
  "reports column overflow at constrained admission bounds for fixed width %s",
  /** Constrains only the native limit query so original cell storage and import logic execute without allocating a full-width sheet. @param fixed - Fixed-width mode. @returns Nothing. */ (
    fixed,
  ) => {
    const shell = new ScDocShell();
    const doc = shell.GetDocument();
    const bound = vi.spyOn(doc, "MaxCol").mockReturnValue(0);
    try {
      const options = new ScAsciiOptions();
      options.bFixedLen = fixed;
      options.aFieldSeps = ",";
      options.mvColStart = fixed ? [0, 1] : [];
      const converter = new ScImportExport(doc);
      converter.SetExtOptions(options);
      expect(converter.ImportStream(new TextEncoder().encode(fixed ? "AB\n" : "A,B\n"))).toBe(true);
      expect(converter.IsOverflowCol()).toBe(true);
      expect(converter.IsOverflowRow()).toBe(false);
      expect(converter.IsOverflow()).toBe(true);
      expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("A");
      expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_NONE);
    } finally {
      bound.mockRestore();
      shell.Close();
    }
  },
);

it("reports row overflow before mutating the first excluded row", /** Constrains only the native admission limit while retaining real document storage. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  const bound = vi.spyOn(doc, "MaxRow").mockReturnValue(0);
  try {
    const converter = new ScImportExport(doc);
    converter.SetExtOptions(new ScAsciiOptions());
    expect(converter.ImportStream(new TextEncoder().encode("A\nB\n"))).toBe(true);
    expect(converter.IsOverflowRow()).toBe(true);
    expect(converter.IsOverflowCol()).toBe(false);
    expect(converter.IsOverflow()).toBe(true);
    expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("A");
    expect(doc.GetCellType(new ScAddress(0, 1, 0))).toBe(CellType.CELLTYPE_NONE);
  } finally {
    bound.mockRestore();
    shell.Close();
  }
});

it.each([false, true])(
  "preserves native blank-row empty-cell policy with skip-empty %s",
  /** A nonfinal empty row clears only its first cell unless skip-empty is enabled; the following source row must still be imported. @param skip - Original filter flag. @returns Nothing. */ (
    skip,
  ) => {
    const shell = new ScDocShell(),
      doc = shell.GetDocument();
    try {
      doc.SetValue(new ScAddress(), 42);
      doc.SetValue(new ScAddress(1, 0, 0), 99);
      const options = new ScAsciiOptions();
      options.bSkipEmptyCells = skip;
      const converter = new ScImportExport(doc);
      converter.SetExtOptions(options);
      expect(converter.ImportStream(new TextEncoder().encode("\nB\n"))).toBe(true);
      expect(doc.GetCellType(new ScAddress())).toBe(
        skip ? CellType.CELLTYPE_VALUE : CellType.CELLTYPE_NONE,
      );
      if (skip) expect(doc.GetValue(new ScAddress())).toBe(42);
      expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(99);
      expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("B");
    } finally {
      shell.Close();
    }
  },
);
