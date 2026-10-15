/** @fileoverview Native sheetdata namespace-map contract retains every prefix alias needed for separate Calc sheet persistence. */
import { expect, it } from "vitest";
import { SvXMLNamespaceMap } from "../../../../xmloff/inc/namespacemap";
it("retains all prefix aliases rather than only the reverse map canonical prefix", /** Source sheetdata.cxx reads GetAllEntries; no sheetdata model or ODS filter is fabricated here. @returns Nothing. */ () => {
  const map = new SvXMLNamespaceMap();
  map.Add("table", "urn:table", 3);
  map.Add("alternate", "urn:table", 3);
  const copied = new SvXMLNamespaceMap(map),
    entries = Array.from(
      copied.GetAllEntries().values(),
      /** Reads native immutable entry fields. @param entry - Original namespace entry. @returns Logical persistence fields. */ (
        entry,
      ) => [entry.m_sPrefix, entry.m_sName, entry.m_nKey],
    );
  expect(entries).toEqual(
    expect.arrayContaining([
      ["table", "urn:table", 3],
      ["alternate", "urn:table", 3],
    ]),
  );
  expect(entries).toHaveLength(2);
  expect(copied.GetPrefixByKey(3)).toBe("alternate");
});
