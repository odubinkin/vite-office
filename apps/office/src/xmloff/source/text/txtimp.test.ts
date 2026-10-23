/** @fileoverview Verifies the shared native text dispatcher retains actual list context ownership across text locations. */
import { expect, it, vi } from "vitest";
import { FastAttributeList, SvXMLIgnoreContext } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { XMLTableContext, type XMLTableImportTarget } from "../table/XMLTableImport";
import { XMLParaContext, type XMLParagraphListState, type XMLTextImportTarget } from "./txtparai";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { SwXTextDocument } from "../../../sw/source/uibase/uno/unotxdoc";
import { XMLTextImportHelper } from "./txtimp";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";
import { XMLTextListItemContext } from "./XMLTextListItemContext";

/** Requires a real fixture owner instead of silently accepting a missing native node. @param value - Actual fixture value. @returns Valid owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing actual native fixture owner");
  return value;
}

/** Builds namespace-resolved literal attributes for actual contexts. @param values - Qualified attributes. @returns Native attribute list. */
function attrs(values: Record<string, string> = {}): FastAttributeList {
  return new FastAttributeList(
    Object.entries(values).map(
      /** Creates one qualified SAX attribute. @param pair - Name/value. @returns Attribute. */ ([
        name,
        value,
      ]) => {
        const [prefix, local] = name.split(":");
        return {
          name,
          value,
          prefix: required(prefix),
          local: required(local),
          uri: ODF_NAMESPACES[prefix as keyof typeof ODF_NAMESPACES],
        };
      },
    ),
  );
}
/** Creates a paragraph-only target which records the exact shared native list projection. @param records - Actual paragraph list arguments. @returns Target. */
function target(records: (XMLParagraphListState | undefined)[]): XMLTextImportTarget {
  const target: XMLTextImportTarget = {
    GetTextImport:
      /** Executes this bounded native operation. @returns Native operation result. */ () => helper,
    getListRule: /** Returns the one existing rule. @returns Rule. */ () => ({
      name: "S",
      levelCount: 10,
      levels: [],
      defaultListId: "DS",
    }),
    getStyle: /** Has no named style definitions. @returns Nothing. */ () => undefined,
    getAutoStyle: /** Has no automatic style definitions. @returns Nothing. */ () => undefined,
  };
  const helper = new XMLTextImportHelper(target, new SwXTextDocument(createWriterDocument()));
  vi.spyOn(helper, "BeginParagraph").mockImplementation(
    /** Executes this bounded native operation. @param _style - Native operation input. @param _alignment - Native operation input. @param _left - Native operation input. @param _paragraph - Native operation input. @param _properties - Native operation input. @param list - Native operation input. @returns Native operation result. */ (
      _style,
      _alignment,
      _left,
      _paragraph,
      _properties,
      list,
    ) => {
      records.push(list);
    },
  );
  return target;
}

it("shares native list roots across body cells and later body contexts", /** Checks the common owner rather than independently copying per-cell state. @returns Nothing. */ () => {
  const records: (XMLParagraphListState | undefined)[] = [],
    helper = target(records).GetTextImport();
  for (const [id, previous, type] of [
    ["Before", "", "Body"],
    ["Cell", "Before", "Cell"],
    ["After", "Cell", "Body"],
  ] as const) {
    const root = helper.CreateTextChildContext(
      XMLToken.TEXT_LIST,
      attrs({
        "text:style-name": "S",
        "xml:id": id,
        ...(previous === "" ? {} : { "text:continue-list": previous }),
      }),
      type,
    ) as XMLTextListBlockContext;
    expect(root).toBeInstanceOf(XMLTextListBlockContext);
    expect(root.level).toBe(0);
    const item = root.createFastChildContext(
      XMLToken.TEXT_LIST_ITEM,
      attrs(),
    ) as XMLTextListItemContext;
    expect(item.createFastChildContext(XMLToken.TEXT_P, attrs())).toBeInstanceOf(XMLParaContext);
    item.endFastElement();
    root.endFastElement();
  }
  expect(
    records.map(
      /** Reads exact owner-projected IDs. @param list - Actual argument. @returns ID. */ (list) =>
        list?.listId,
    ),
  ).toEqual(["DS", "DS", "DS"]);
  expect(
    records.map(
      /** Reads zero-based levels. @param list - Actual argument. @returns Level. */ (list) =>
        list?.level,
    ),
  ).toEqual([0, 0, 0]);
  const independent = target(records).GetTextImport();
  const root = independent.CreateTextChildContext(
    XMLToken.TEXT_LIST,
    attrs({ "text:style-name": "S", "xml:id": "Fresh", "text:continue-list": "After" }),
    "Cell",
  ) as XMLTextListBlockContext;
  expect(root.GetContinueListId()).toBe("");
  root.endFastElement();
});

it("keeps native body cell dispatch and explicit unimplemented structural boundaries", /** Verifies body/cell location, inert children and retained public standalone table entry. @returns Nothing. */ () => {
  const records: (XMLParagraphListState | undefined)[] = [],
    base = target(records),
    helper = base.GetTextImport();
  for (const type of ["Body", "Cell"] as const)
    for (const token of [XMLToken.TEXT_P, XMLToken.TEXT_H])
      expect(helper.CreateTextChildContext(token, attrs(), type)).toBeInstanceOf(XMLParaContext);
  expect(records).toEqual([undefined, undefined, undefined, undefined]);
  expect(
    helper.CreateTextChildContext(XMLToken.TEXT_SEQUENCE_DECLS, attrs(), "Body"),
  ).toBeInstanceOf(SvXMLIgnoreContext);
  expect(helper.CreateTextChildContext(XMLToken.TEXT_SEQUENCE_DECLS, attrs(), "Cell")).toBeNull();
  expect(helper.CreateTextChildContext(XMLToken.UNKNOWN, attrs(), "Body")).toBeNull();
  expect(helper.CreateTextChildContext(XMLToken.TABLE_TABLE, attrs(), "Body")).toBeNull();
  expect(
    /** Reads unsupported body section. @returns Result. */ () =>
      helper.CreateTextChildContext(XMLToken.TEXT_SECTION, attrs(), "Body"),
  ).toThrow("Unsupported ODF text section");
  for (const token of [XMLToken.TEXT_SECTION, XMLToken.TABLE_TABLE])
    expect(
      /** Reads unsupported nested structure. @returns Result. */ () =>
        helper.CreateTextChildContext(token, attrs(), "Cell"),
    ).toThrow("Unsupported ODF table cell section or nested table");
  const sink: XMLTableImportTarget = {
    ...base,
    registerTableStyle: /** No style mutation here. @returns Nothing. */ () => {},
    beginTable: /** Opens a standalone empty table. @returns Nothing. */ () => {},
    addTableColumn: /** No column here. @returns Nothing. */ () => {},
    beginTableHeaderRows: /** No header here. @returns Nothing. */ () => {},
    endTableHeaderRows: /** No header here. @returns Nothing. */ () => {},
    beginTableRow: /** No row here. @returns Nothing. */ () => {},
    beginTableCell: /** No cell here. @returns Nothing. */ () => {},
    endTableCell: /** No cell here. @returns Nothing. */ () => {},
    endTableRow: /** No row here. @returns Nothing. */ () => {},
    endTable: /** Closes the empty table. @returns Nothing. */ () => {},
    addTableSoftPageBreak: /** No break here. @returns Nothing. */ () => {},
  };
  expect(new XMLTableContext(sink, attrs({ "table:name": "Standalone" }))).toBeInstanceOf(
    XMLTableContext,
  );
  expect(
    new XMLTextImportHelper(
      sink,
      new SwXTextDocument(createWriterDocument()),
    ).CreateTextChildContext(XMLToken.TABLE_TABLE, attrs({ "table:name": "Shared" }), "Body"),
  ).toBeInstanceOf(XMLTableContext);
});
