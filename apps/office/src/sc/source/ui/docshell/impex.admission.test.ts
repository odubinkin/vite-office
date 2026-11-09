/** @fileoverview CSV admission retains existing cells, literal multiline ownership and overflow counters. */
import { assert, expect, it, vi } from "vitest";
import { implementations } from "../../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../../desktop/source/app/appinit";
import { CH_FEATURE } from "../../../../editeng/inc/editattr";
import { EE_FEATURE_TAB } from "../../../../editeng/inc/eeitem";
import { EditTextObjectImpl } from "../../../../editeng/inc/editobj";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { SC_COL_TEXT, ScAsciiOptions } from "../dbgui/asciiopt";
import { ScDocShell } from "./docsh";
import { ScImportExport } from "./impex";

InitApplicationServiceManager(implementations);

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

it("imports literal multiline fields and empty fixed-width spans through native cells", /** Checks text-only multiline transport, block-position reuse and zero-width field admission. @returns Nothing. */ () => {
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

it("stores native tab features and independent paragraphs in both multiline branches", /** Checks typed and standard multiline cells and reuse of the document editor and column block position. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  try {
    const converter = new ScImportExport(doc);
    const options = new ScAsciiOptions();
    options.aFieldSeps = ",";
    options.mvColStart = [1];
    options.mvColFormat = [SC_COL_TEXT];
    converter.SetExtOptions(options);
    expect(
      converter.ImportStream(new TextEncoder().encode('"a\tb\n\n末","c\td\ne",2\nplain,again,3\n')),
    ).toBe(true);

    for (const [column, first, paragraphs] of [
      [0, "ab", ["", "末"]],
      [1, "cd", ["e"]],
    ] as const) {
      const edit = doc.GetRefCellValue(new ScAddress(column, 0, 0)).getEditText();
      assert(edit instanceof EditTextObjectImpl);
      expect(edit.GetParagraphCount()).toBe(paragraphs.length + 1);
      const firstParagraph = edit.GetText(0);
      try {
        expect(text(firstParagraph)).toBe(first[0] + String.fromCharCode(CH_FEATURE) + first[1]);
      } finally {
        firstParagraph.dispose();
      }
      const attributes = edit.GetContents()[0]?.GetCharAttribs();
      expect(
        attributes?.map(
          /** Inspects the original feature's ID and raw span. @param attribute - Actual attribute. @returns ID and endpoints. */ (
            attribute,
          ) => [attribute.GetItem()?.Which(), attribute.GetStart(), attribute.GetEnd()],
        ),
      ).toEqual([[EE_FEATURE_TAB, 1, 2]]);
      for (const [index, expected] of paragraphs.entries()) {
        const paragraph = edit.GetText(index + 1);
        try {
          expect(text(paragraph)).toBe(expected);
        } finally {
          paragraph.dispose();
        }
      }
    }
    expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("plain");
    expect(text(doc.GetSharedString(new ScAddress(1, 1, 0)).getString())).toBe("again");
    expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(2);
    expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(3);
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
