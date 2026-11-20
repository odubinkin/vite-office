/** @fileoverview Original table boundary and merge resources applied to real Writer text and table owners. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  OOXMLProperty,
  OOXMLPropertyType as Kind,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import { DomainMapper } from "./DomainMapper";
import { DomainMapperTableRanges } from "./DomainMapperTableManager.ranges";

/** Creates the original table event receiver over the actual Writer body. @returns Model and owned receiver. */
function createTableSession() {
  const document = createWriterDocument();
  const model = new SwXTextDocument(document);
  const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  const receiver = new DomainMapperTableRanges(model.getText(), mapper.impl);
  return {
    document,
    /** Delivers an original table resource, including null when no scalar was supplied. @param id - Native resource. @param value - Optional native integer. @returns Whether consumed. */
    send(id: number, value?: number) {
      return receiver.sprm(
        new OOXMLProperty(id, value === undefined ? new V() : V.createInteger(value), Kind.SPRM),
      );
    },
    /** Delivers the original paragraph break marker through the mapper. @returns Nothing. */
    finishParagraph() {
      mapper.utext(Uint16Array.of(13));
    },
    /** Releases remaining mapper ranges and the original model. @returns Nothing. */
    dispose() {
      receiver.dispose();
      mapper.dispose();
      model.dispose();
    },
  };
}

it("closes empty tables and distinguishes absent grid values from missing cell boundaries", /** Exercises the native nullable resource and incomplete parse paths. @returns Nothing. */ () => {
  const s = createTableSession();
  try {
    expect(s.send(N.LN_tblEnd)).toBe(false);
    expect(s.send(N.LN_tblStart)).toBe(true);
    expect(s.send(N.LN_tblEnd)).toBe(true);
    expect(s.document.GetTables()).toHaveLength(0);

    s.send(N.LN_tblStart);
    expect(s.send(N.LN_CT_TcPrBase_gridSpan)).toBe(true);
    expect(s.send(N.LN_CT_TblGridBase_gridCol)).toBe(true);
    s.send(N.LN_tcStart);
    s.send(N.LN_tcEnd);
    expect(s.send(N.LN_CT_TcPrBase_gridSpan)).toBe(true);
    s.send(N.LN_tblRow);
    s.send(N.LN_tblEnd);
    expect(s.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()).toHaveLength(1);

    s.send(N.LN_tblStart);
    expect(
      /** A cell cannot close before the original start marker. @returns Whether consumed. */ () =>
        s.send(N.LN_tcEnd),
    ).toThrow("DOCX table cell has no start paragraph.");
    expect(s.document.GetTables()).toHaveLength(1);
  } finally {
    s.dispose();
  }
});

it("uses a terminal nested table as the complete cell range when no following paragraph event arrives", /** Exercises actual inner and outer native table nodes and endpoints. @returns Nothing. */ () => {
  const s = createTableSession();
  try {
    s.send(N.LN_tblStart);
    s.send(N.LN_tcStart);
    s.finishParagraph();
    for (const event of [
      N.LN_tblStart,
      N.LN_tcStart,
      N.LN_tcEnd,
      N.LN_tblRow,
      N.LN_tblEnd,
      N.LN_tcEnd,
      N.LN_tblRow,
      N.LN_tblEnd,
    ]) {
      expect(s.send(event)).toBe(true);
    }
    const [parent] = s.document.GetTables();
    const box = parent?.GetTabLines()[0]?.GetTabBoxes()[0];
    const content = box?.GetContentNodes();
    expect(content).toHaveLength(2);
    const child = content?.[1];
    expect(child).toBeInstanceOf(SwTableNode);
    if (child instanceof SwTableNode)
      expect(child.GetTable().GetTabLines()[0]?.GetTabBoxes()).toHaveLength(1);
  } finally {
    s.dispose();
  }
});

it("merges right-hand cells by their shared grid edge and keeps separated runs and orphan marks distinct", /** Exercises new starts at matching and different left edges through the original native cell spans. @returns Nothing. */ () => {
  const s = createTableSession();
  const restart = N.LN_Value_ST_Merge_restart;
  const continuation = N.LN_Value_ST_Merge_continue;
  try {
    s.send(N.LN_tblStart);
    for (const row of [
      [undefined, restart],
      [continuation, continuation],
      [restart, restart],
      [undefined, continuation],
    ]) {
      for (const width of [1200, 1800]) s.send(N.LN_CT_TblGridBase_gridCol, width);
      for (const merge of row) {
        s.send(N.LN_tcStart);
        s.send(N.LN_tcEnd);
        if (merge !== undefined) s.send(N.LN_CT_TcPrBase_vMerge, merge);
      }
      s.send(N.LN_tblRow);
    }
    s.send(N.LN_tblEnd);
    const rows = s.document.GetTables()[0]?.GetTabLines();
    expect(
      rows?.map(
        /** Reads both native cell spans in source order. @param row - Output row. @returns Signed spans. */ (
          row,
        ) =>
          row
            .GetTabBoxes()
            .map(
              /** Reads the original merge result. @param box - Native cell. @returns Signed row span. */ (
                box,
              ) => box.getRowSpan(),
            ),
      ),
    ).toEqual([
      [1, 2],
      [1, -1],
      [1, 2],
      [1, -1],
    ]);

    s.send(N.LN_tblStart);
    for (const merge of [false, true]) {
      s.send(N.LN_tcStart);
      s.send(N.LN_tcEnd);
      if (merge) s.send(N.LN_CT_TcPrBase_vMerge, restart);
    }
    s.send(N.LN_tblRow);
    s.send(N.LN_tblEnd);
    expect(s.document.GetTables()[1]?.GetTabLines()[0]?.GetTabBoxes()[1]?.getRowSpan()).toBe(1);
  } finally {
    s.dispose();
  }
});
