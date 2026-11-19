/** @fileoverview Validates typed Word style properties in the Writer Worker transfer. */
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocxExport } from "../../../source/filter/ww8/docxexport";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwXTextDocument } from "../../../source/uibase/uno/unotxdoc";
import {
  encodeTableInterop,
  encodeTableStyles,
  restoreTableInterop,
  restoreTableStyles,
} from "./writer-table-interop-codec";

it("retains duplicated entries and native scalar types", /** Copies original properties in order through the model's actual grab bag. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const model = new SwXTextDocument(doc);
  const table = doc.nodes.MakeTableNode("Table");
  const frame = table.GetFrameFormat();
  const styles = [
    {
      name: "Style",
      value: [
        { name: "styleId", value: "Style" },
        { name: "default", value: true },
        { name: "semiHidden", value: null },
        { name: "tblStylePr", value: [{ name: "type", value: "firstRow" }] },
        { name: "tblStylePr", value: [{ name: "type", value: "lastRow" }] },
      ],
    },
  ];
  const tableLook = [
    { name: "val", value: 0x4a0 },
    { name: "firstRow", value: 1 },
  ];
  const tableProperties = [
    { name: "TableStyleName", value: "Style" },
    { name: "TableStyleLook", value: tableLook },
  ];
  try {
    expect(encodeTableStyles(doc.interopGrabBag.GetGrabBag().get("tableStyles"))).toBeUndefined();
    expect(encodeTableInterop(frame)).toBeUndefined();
    restoreTableStyles(model, styles);
    restoreTableInterop(frame, tableProperties);
    expect(encodeTableStyles(doc.interopGrabBag.GetGrabBag().get("tableStyles"))).toEqual(styles);
    expect(encodeTableInterop(frame)).toEqual(tableProperties);
    restoreTableInterop(frame, []);
    expect(encodeTableInterop(frame)).toBeUndefined();
  } finally {
    model.dispose();
    doc.Dispose();
  }
});

it("rejects malformed style values without applying a partial table frame", /** Exercises the actual restore owner with malformed cloneable input. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const model = new SwXTextDocument(doc);
  const frame = doc.nodes.MakeTableNode("Table").GetFrameFormat();
  const name = { name: "TableStyleName", value: "Style" };
  try {
    for (const record of [
      {},
      [name, { name: 4, value: "wrong" }],
      [name, { name: "missingValue" }],
      [name, { name: "TableStyleLook", value: 1.5 }],
      [name, { name: "TableStyleLook", value: 0x80000000 }],
      [name, { name: "TableStyleLook", value: true }],
      [{ name: "TableStyleName", value: 4 }],
      [{ name: "unexpected", value: [] }],
    ]) {
      expect(
        /** Exercises the atomic restore. @returns Nothing. */ () =>
          restoreTableInterop(frame, record),
      ).toThrow(/Stored Writer table style/u);
      expect(encodeTableInterop(frame)).toBeUndefined();
    }
    expect(
      /** Rejects invalid nested properties. @returns Nothing. */ () =>
        restoreTableStyles(model, [{ name: "Style", value: [null] }]),
    ).toThrow("Stored Writer table style entry is invalid.");
    expect(encodeTableStyles(doc.interopGrabBag.GetGrabBag().get("tableStyles"))).toBeUndefined();
  } finally {
    model.dispose();
    doc.Dispose();
  }
});

it("writes incomplete native style records without manufacturing an ID or margin element", /** Checks the existing UNO projection for sparse and duplicate groups. @returns Completion. */ async () => {
  const doc = new SwDoc();
  const model = new SwXTextDocument(doc);
  try {
    restoreTableStyles(model, [
      {
        name: "",
        value: [
          {
            name: "tblStylePr",
            value: [
              { name: "type", value: "firstRow" },
              { name: "tblPr", value: [{ name: "tblCellMar", value: [] }] },
              {
                name: "trPr",
                value: [
                  { name: "cantSplit", value: true },
                  { name: "tblHeader", value: true },
                  { name: "tblHeader", value: true },
                ],
              },
            ],
          },
          {
            name: "tblStylePr",
            value: [
              { name: "type", value: "lastRow" },
              { name: "trPr", value: [{ name: "cantSplit", value: true }] },
            ],
          },
        ],
      },
    ]);
    const archive = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const styles = await archive.readTextEntry("word/styles.xml");
    expect(styles).toContain('<w:style w:type="table"><w:name w:val=""/>');
    expect(styles).toContain(
      '<w:tblStylePr w:type="firstRow"><w:tblPr></w:tblPr><w:trPr><w:tblHeader/><w:tblHeader/></w:trPr></w:tblStylePr>',
    );
    expect(styles).toContain(
      '<w:tblStylePr w:type="lastRow"><w:tblPr/><w:trPr></w:trPr></w:tblStylePr>',
    );
    expect(styles).not.toContain("<w:tblCellMar");
    expect(styles).not.toContain("<w:cantSplit");
  } finally {
    model.dispose();
    doc.Dispose();
  }
});
