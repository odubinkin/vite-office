/** @fileoverview Original ODF condition contexts and optional attribute defaults through the Calc file filter. */
import { assert, expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import {
  ScCondDateFormatEntry,
  ScCondFormatDateType,
  ScCondFormatEntry,
} from "../../../inc/conditio";
import { ScColorScaleEntryType, ScColorScaleFormat } from "../../../inc/colorscale";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("admits known ODF condition elements and retains native defaults on omitted attributes", /** Exercises actual construction, rejected records and subsequent ODF output. @returns Completion. */ async () => {
  const source = new ScDocument();
  const name = unicode("Rules");
  try {
    assert(source.InsertTab(0, name));
    source.SetValue(new ScAddress(2, 0), 2);
    const original = await DocumentArchive.open(await writeOdsDocument(source));
    const writer = new DocumentArchiveWriter();
    const rules = `<calcext:conditional-formats>
      <calcext:color-scale/>
      <calcext:conditional-format calcext:target-range-address="Rules.A1">
        <calcext:color-scale>
          <calcext:condition calcext:value="=1"/>
          <calcext:color-scale-entry calcext:type="auto-maximum"/>
          <calcext:color-scale-entry calcext:color="#123456" calcext:value="3"/>
        </calcext:color-scale>
      </calcext:conditional-format>
      <calcext:conditional-format calcext:target-range-address="Rules.B1">
        <calcext:date-is/>
      </calcext:conditional-format>
      <calcext:conditional-format calcext:target-range-address="Rules.C1">
        <calcext:condition calcext:value="=2"/>
        <calcext:condition calcext:value="unsupported()"/>
        <calcext:condition/>
        <calcext:color-scale-entry/>
      </calcext:conditional-format>
      <calcext:conditional-format calcext:target-range-address="Rules.D1">
        <calcext:condition calcext:value="unsupported()"/>
      </calcext:conditional-format>
      <calcext:conditional-format><calcext:condition calcext:value="=1"/></calcext:conditional-format>
    </calcext:conditional-formats>`;
    for (const entry of original.getEntryNames()) {
      if (entry !== "content.xml") writer.putNextEntry(entry, await original.readEntry(entry));
      else {
        const xml = await original.readTextEntry(entry);
        expect(xml).toContain("</table:table>");
        writer.putNextEntry(
          entry,
          new TextEncoder().encode(xml.replace("</table:table>", rules + "</table:table>")),
        );
      }
    }
    const reopened = await readOdsDocument(await writer.finish());
    try {
      const list = reopened.FetchTable(0)?.GetCondFormList();
      assert(list);
      const [scaleGroup, dateGroup, conditionGroup] = [...list];
      expect([...list]).toHaveLength(3);
      const scale = scaleGroup?.GetEntry(0);
      const date = dateGroup?.GetEntry(0);
      const condition = conditionGroup?.GetEntry(0);
      assert(scale instanceof ScColorScaleFormat);
      assert(date instanceof ScCondDateFormatEntry);
      assert(condition instanceof ScCondFormatEntry);
      expect([...scale]).toHaveLength(2);
      expect(scale.GetEntry(0)?.GetType()).toBe(ScColorScaleEntryType.AUTO);
      expect(scale.GetEntry(0)?.GetValue()).toBe(0);
      expect(scale.GetEntry(0)?.GetColor().toUInt32()).toBe(0);
      expect(scale.GetEntry(1)?.GetType()).toBe(ScColorScaleEntryType.VALUE);
      expect(scale.GetEntry(1)?.GetValue()).toBe(3);
      expect(scale.GetEntry(1)?.GetColor().toUInt32()).toBe(0x123456);
      expect(date.GetDateType()).toBe(ScCondFormatDateType.TODAY);
      expect(text(date.GetStyleName())).toBe("");
      expect(condition.GetSrcPos().equals(new ScAddress(2, 0))).toBe(true);
      expect(condition.GetStyleName()).toBe("");
      expect(
        condition.IsCellValid(reopened.GetRefCellValue(new ScAddress(2, 0)), new ScAddress(2, 0)),
      ).toBe(true);
      expect(conditionGroup?.size()).toBe(1);
      const surviving = await DocumentArchive.open(await writeOdsDocument(reopened));
      const xml = await surviving.readTextEntry("content.xml");
      expect(xml).toContain('calcext:type="auto-minimum"');
      expect(xml).toContain('calcext:date="today"');
      expect(xml).not.toContain("unsupported()");
    } finally {
      reopened.Dispose();
    }
  } finally {
    name.dispose();
    source.Dispose();
  }
});
