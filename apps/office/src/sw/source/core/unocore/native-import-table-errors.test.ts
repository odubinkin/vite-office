/** @fileoverview Native table name lookup, range admission and property failure isolation across Writer import owners. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXTextRange } from "./unoobj2";
import { SwXTextTable, SwXCell } from "./unotbl";
import { SwXTextCursor } from "./unoobj";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { unicode, text, stringAny } from "./unocrsrhelper";
/** Owns native text, names, property descriptors and live conversion endpoints. @returns Actual document fixture. */
function fixture() {
  const document = new SwDoc(),
    model = new SwXTextDocument(document),
    body = model.getText();
  const input = unicode("ABCD\rEFGH\rIJKL");
  body.setString(input);
  input.dispose();
  const names: ReturnType<typeof unicode>[] = [],
    ranges: SwXTextRange[] = [],
    properties: PropertyValue[] = [];
  return {
    document,
    body,
    /** Owns a native name. @param name - API name. @returns Native string. */
    key(name: string) {
      const value = unicode(name);
      names.push(value);
      return value;
    },
    /** Owns a native endpoint over the actual supplied node. @param node - Canonical node. @param index - UTF16 offset. @returns Live endpoint. */
    range(node: SwTextNode, index: number) {
      const position = new SwPosition(node, index),
        pam = new SwPaM(position);
      try {
        const value = new SwXTextRange(pam, body);
        ranges.push(value);
        return value;
      } finally {
        pam.Dispose();
        position.Dispose();
      }
    },
    /** Copies one owned native property descriptor. @param name - API name. @param input - Consumed Any. @returns Descriptor. */
    property(name: string, input: Any) {
      const nameValue = unicode(name);
      try {
        const value = new PropertyValue(nameValue, -1, input, 0);
        properties.push(value);
        return value;
      } finally {
        nameValue.dispose();
        input.dispose();
      }
    },
    /** Releases only the fixture's actual native owners. @returns Nothing. */
    close() {
      for (const p of properties) {
        p.Name.dispose();
        p.Value.dispose();
      }
      for (const range of ranges) range.dispose();
      for (const name of names) name.dispose();
      model.dispose();
      document.Dispose();
    },
  };
}
/** Captures native generated exceptions. @param operation - Native operation. @returns Thrown value or unexpected result. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}

it("returns native null references for malformed and absent cell names while preserving real flat-cell identity", /** Uses original unotbl.cxx null-result semantics and the canonical table formats. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.document.GetNodes().MakeTableNode("Named");
  f.document.GetNodes().AppendTableRow(table, 1);
  const api = new SwXTextTable(table);
  try {
    for (const name of ["", "1A", "A0", "Z1", "A2"])
      expect(api.getCellByName(f.key(name))).toBeNull();
    const cell = api.getCellByName(f.key("A1"));
    expect(cell).toBeInstanceOf(SwXCell);
    const title = stringAny("Renamed"),
      count = new Any([2], "sal_Int32");
    try {
      api.setPropertyValue(f.key("Name"), title);
      api.setPropertyValue(f.key("HeaderRowCount"), count);
    } finally {
      title.dispose();
      count.dispose();
    }
    expect(table.GetName()).toBe("Renamed");
    expect(table.GetRowsToRepeat()).toBe(1); // Native repeat count is bounded by the one existing row.
    assert(cell);
    const bad = new Any([true], "bool");
    try {
      expect(
        failure(
          /** Rejects a scalar in place of a native border compound. @returns Nothing. */ () =>
            cell.setPropertyValue(f.key("TopBorder"), bad),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      bad.dispose();
    }
    const distance = new Any([254], "sal_Int32");
    const reject = vi.spyOn(SvxBoxItem.prototype, "PutValue").mockReturnValueOnce(false);
    try {
      expect(
        failure(
          /** A native item rejection must not be silently committed. @returns Nothing. */ () =>
            cell.setPropertyValue(f.key("BorderDistance"), distance),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      reject.mockRestore();
      distance.dispose();
    }
  } finally {
    f.close();
  }
});

it("validates conversion dimensions, endpoint ordering, document ownership and contiguous body text before mutation", /** Checks invalid ranges on canonical native positions rather than a parallel table model. @returns Nothing. */ () => {
  const f = fixture(),
    foreign = fixture();
  const [a, b, c] = f.document.paragraphs;
  assert(a);
  assert(b);
  assert(c);
  const other = foreign.document.paragraphs[0];
  assert(other);
  const start = f.range(a, 0),
    end = f.range(a, 4),
    gap = f.range(c, 0),
    gapEnd = f.range(c, 4),
    foreignRange = foreign.range(other, 0);
  try {
    expect(f.body.convertToTable([], [], [], [])).toBeNull();
    for (const rows of [
      [[]],
      [[[start]]],
      [[[foreignRange, end]]],
      [[[end, start]]],
      [
        [
          [start, end],
          [gap, gapEnd],
        ],
      ],
    ]) {
      expect(
        failure(
          /** Rejects invalid native cell ranges. @returns Table. */ () =>
            f.body.convertToTable(rows, [], [], []),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    }
    const table = f.document.GetNodes().MakeTableNode("Existing"),
      line = f.document.GetNodes().AppendTableRow(table, 1),
      box = line.GetTabBoxes()[0];
    assert(box);
    const cell = new SwXCell(box),
      cursor = cell.createTextCursor();
    try {
      expect(
        failure(
          /** Cell text is not a body conversion domain. @returns Table. */ () =>
            f.body.convertToTable([[[cursor, cursor]]], [], [], []),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      cursor.dispose();
      cell.dispose();
    }
    const position = new SwPosition(table.GetTableNode(), 0),
      pam = new SwPaM(position),
      nontext = new SwXTextRange(pam, f.body, false);
    try {
      expect(
        failure(
          /** Structural table nodes cannot be admitted as text endpoints. @returns Table. */ () =>
            f.body.convertToTable([[[nontext, nontext]]], [], [], []),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      nontext.dispose();
      pam.Dispose();
      position.Dispose();
    }
    expect(f.document.paragraphs).toEqual([a, b, c]);
  } finally {
    foreign.close();
    f.close();
  }
});

it("creates an empty first cell at a collapsed paragraph start and allocates a unique native table name", /** Covers live native endpoint correction after splitting the destination paragraph. @returns Nothing. */ () => {
  const f = fixture();
  const first = f.document.paragraphs[0];
  assert(first);
  f.document.GetNodes().MakeTableNode("Table1");
  const point = f.range(first, 0),
    end = f.range(first, 0);
  try {
    const table = f.body.convertToTable([[[point, end]]], [], [], []);
    assert(table);
    expect(text(table.getName())).toBe("Table2");
    const cell = table.getCellByName(f.key("A1"));
    assert(cell);
    const value = cell.getString();
    expect(text(value)).toBe("");
    value.dispose();
    cell.dispose();
    expect(f.document.paragraphs[0]?.GetText()).toBe("ABCD");
  } finally {
    f.close();
  }
});

it("converts an interior text selection without absorbing its prefix or suffix", /** Checks both native paragraph splits with independent literal text before, inside and after the table. @returns Nothing. */ () => {
  const f = fixture(),
    node = f.document.paragraphs[0];
  assert(node);
  const start = f.range(node, 1),
    end = f.range(node, 3);
  try {
    const table = f.body.convertToTable([[[start, end]]], [], [], []);
    assert(table);
    const cell = table.getCellByName(f.key("A1"));
    assert(cell);
    const value = cell.getString();
    expect(text(value)).toBe("BC");
    value.dispose();
    cell.dispose();
    expect(
      f.document.paragraphs.map(
        /** Projects literal remaining native paragraphs. @param paragraph - Body node. @returns Literal text. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["A", "D", "EFGH", "IJKL"]);
  } finally {
    f.close();
  }
});

it("rejects out-of-bounds property grids and propagates unexpected table or cursor property failures", /** Retains native typed failure isolation without swallowing host exceptions. @returns Nothing. */ () => {
  for (const mode of ["grid", "table", "cell"] as const) {
    const f = fixture(),
      node = f.document.paragraphs[0];
    assert(node);
    const start = f.range(node, 0),
      end = f.range(node, node.Len()),
      host = new Error("property host failure");
    const tableSpy =
      mode === "table"
        ? vi.spyOn(SwXTextTable.prototype, "setPropertyValue").mockImplementationOnce(
            /** Injects one native host error. @returns Never. */ () => {
              throw host;
            },
          )
        : undefined;
    const cursorSpy =
      mode === "cell"
        ? vi.spyOn(SwXTextCursor.prototype, "setPropertyValue").mockImplementationOnce(
            /** Injects one native host error. @returns Never. */ () => {
              throw host;
            },
          )
        : undefined;
    try {
      const weight = f.property("CharWeight", new Any([150], "float"));
      const operation = /** Applies the represented native property grid. @returns Table. */ () =>
        f.body.convertToTable(
          [[[start, end]]],
          mode === "grid" ? [[[], [weight]]] : mode === "cell" ? [[[weight]]] : [],
          [],
          mode === "table" ? [weight] : [],
        );
      if (mode === "grid") expect(failure(operation)).toBeInstanceOf(IllegalArgumentException);
      else expect(operation).toThrow(host);
    } finally {
      tableSpy?.mockRestore();
      cursorSpy?.mockRestore();
      f.close();
    }
  }
});
