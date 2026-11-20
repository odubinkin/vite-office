/** @fileoverview Verifies Writer's scoped cell paragraph defaults using canonical ODT and Worker paths. */
import { expect, it } from "vitest";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import type { SvxAdjustItem } from "../../../../editeng/source/items/paraitem.adjust";
import type { SvxColorItem } from "../../../../editeng/source/items/textitem.color";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { RES_CHRATR_COLOR, RES_PARATR_ADJUST } from "../../../inc/hintids";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Cell text styles" };

/** Reads the actual paragraph and character item state at the start of each nonempty node. @param doc - Writer graph. @returns Text, paragraph adjustment and character color. */
function readState(doc: SwDoc): [string, SvxAdjust, number][] {
  const result: [string, SvxAdjust, number][] = [];
  for (const node of doc.nodes.entries()) {
    if (!(node instanceof SwTextNode) || !node.Len()) continue;
    const adjust = (node.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust();
    const items = node.GetCharacterItemsAt(0);
    try {
      result.push([
        node.GetText(),
        adjust,
        (items.Get(RES_CHRATR_COLOR) as SvxColorItem).GetValue().toUInt32(),
      ]);
    } finally {
      items.Dispose();
    }
  }
  return result;
}

it("applies explicit cell defaults before paragraph properties and restores them across nested and repeated cells", /** Mirrors the source item-set and text import split through both serialization paths. @returns Completion. */ async () => {
  const { office, table, text, style, fo } = ODF_NAMESPACES;
  const source = `<office:document-content xmlns:office="${office}" xmlns:table="${table}" xmlns:text="${text}" xmlns:style="${style}" xmlns:fo="${fo}">
    <office:automatic-styles>
      <style:style style:name="Cell" style:family="table-cell">
        <style:table-cell-properties fo:background-color="#ffffff"/>
        <style:text-properties fo:color="#235789"/>
        <style:paragraph-properties fo:text-align="center"/>
      </style:style>
      <style:style style:name="Inner" style:family="table-cell">
        <style:paragraph-properties fo:text-align="justify"/>
        <style:text-properties fo:color="#307040"/>
      </style:style>
      <style:style style:name="P" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="end"/>
      </style:style>
      <style:style style:name="PNoParent" style:family="paragraph">
        <style:paragraph-properties fo:text-align="justify"/>
      </style:style>
    </office:automatic-styles>
    <office:body><office:text>
      <table:table table:name="Outer"><table:table-column table:number-columns-repeated="5" table:default-cell-style-name="Cell"/>
        <table:table-row>
          <table:table-cell table:style-name="Cell">
            <text:p>outer</text:p>
            <table:table table:name="Nested"><table:table-column table:number-columns-repeated="2"/><table:table-row>
              <table:table-cell><text:p>inherited</text:p></table:table-cell>
              <table:table-cell table:style-name="Inner"><text:p>inner</text:p></table:table-cell>
            </table:table-row></table:table>
            <text:p text:style-name="P">override</text:p>
            <text:p text:style-name="PNoParent">no parent</text:p>
          </table:table-cell>
          <table:table-cell table:style-name="Cell" table:number-columns-repeated="2" office:value-type="string" office:string-value="scalar"><text:p>ignored</text:p></table:table-cell>
          <table:table-cell office:value-type="string" office:string-value="column scalar"/>
          <table:table-cell><text:p>column paragraph</text:p></table:table-cell>
        </table:table-row>
      </table:table>
      <text:p>body</text:p>
    </office:text></office:body>
  </office:document-content>`;
  const original = importWriterXml(undefined, source, metadata).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const expected = [
      ["outer", SvxAdjust.Center, 0x235789],
      ["inherited", SvxAdjust.Center, 0x235789],
      ["inner", SvxAdjust.Block, 0x307040],
      ["override", SvxAdjust.ParaEnd, 0],
      ["no parent", SvxAdjust.Block, 0x235789],
      ["scalar", SvxAdjust.Center, 0x235789],
      ["scalar", SvxAdjust.Center, 0x235789],
      ["column scalar", SvxAdjust.ParaStart, 0],
      ["column paragraph", SvxAdjust.ParaStart, 0],
      ["body", SvxAdjust.ParaStart, 0],
    ];
    expect(readState(original)).toEqual(expected);
    worker = decodeWriterDocument(encodeWriterDocument(original));
    expect(readState(worker)).toEqual(expected);
    reopened = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata)).document;
    expect(readState(reopened)).toEqual(expected);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    original.Dispose();
  }
});
