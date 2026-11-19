/** @fileoverview Original XML record dispatch and intrusive list ownership through real serializers and ZIP output. */
import { expect, it, vi } from "vitest";
import { Reference } from "../../../../sal/inc/rtl/ref";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { XclExpXmlStream } from "./xestream";
import {
  XclExpRecordBase,
  XclExpDelegatingRecord,
  XclExpRecordList,
  XclExpXmlStartElementRecord,
  XclExpXmlEndElementRecord,
  XclExpXmlStartSingleElementRecord,
  XclExpXmlEndSingleElementRecord,
} from "./xerecord";
/** Emits actual records, commits their package and independently reads the resulting XML. @param records - Actual borrowed record. @returns XML. */
async function emit(records: XclExpRecordBase): Promise<string> {
  const stream = new XclExpXmlStream(new ZipStorage(), false, false),
    path = unicode("xl/styles.xml"),
    relation = unicode(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
    );
  try {
    const xml = stream.CreateOutputStream(
      path,
      path,
      null,
      new TextEncoder().encode("application/xml\0"),
      relation,
    );
    stream.PushStream(xml);
    records.SaveXml(stream);
    xml.endDocument();
    stream.PopStream();
    const archive = await DocumentArchive.open(await stream.commitStorage());
    return await archive.readTextEntry("xl/styles.xml");
  } finally {
    path.dispose();
    relation.dispose();
  }
}
/** Constructs a real complete empty element from original fragment records. @param name - Token name. @returns Owned-by-caller list. */
function element(name: string): XclExpRecordList {
  const list = new XclExpRecordList();
  list.AppendNewRecord(new XclExpXmlStartSingleElementRecord(token(name)));
  list.AppendNewRecord(new XclExpXmlEndSingleElementRecord());
  return list;
}
it("dispatches nested element and single-element records into a real committed package", /** Uses no replacement serializer or export provider. @returns Completion. */ async () => {
  const list = new XclExpRecordList();
  list.AppendNewRecord(new XclExpXmlStartElementRecord(token("styleSheet")));
  list.AppendNewRecord(new XclExpXmlStartElementRecord(token("fonts")));
  list.AppendNewRecord(element("font"));
  list.AppendNewRecord(new XclExpXmlEndElementRecord(token("fonts")));
  list.AppendNewRecord(new XclExpXmlEndElementRecord(token("styleSheet")));
  expect(await emit(list)).toContain("<styleSheet><fonts><font/></fonts></styleSheet>");
  list.dispose();
});
it("preserves raw and const-reference insertion, aliases, upper clamping and replacement", /** Exercises only valid native unsigned indices. @returns Nothing. */ () => {
  const list = new XclExpRecordList(),
    a = element("font"),
    b = element("fill"),
    handle = new Reference(b),
    empty = new Reference<XclExpRecordBase>(),
    releaseA = vi.spyOn(a, "release"),
    releaseB = vi.spyOn(b, "release");
  expect(list.IsEmpty()).toBe(true);
  expect(list.GetFirstRecord()).toBeNull();
  expect(list.GetLastRecord()).toBeNull();
  expect(list.GetRecord(0)).toBeNull();
  list.AppendRecord(null);
  list.AppendRecord(empty);
  expect(list.GetSize()).toBe(0);
  list.InsertRecord(a, 100);
  list.InsertRecord(handle, 0);
  list.AppendRecord(a);
  list.AppendRecord(handle);
  list.AppendNewRecord(handle);
  expect(list.GetSize()).toBe(5);
  expect(list.GetFirstRecord()).toBe(b);
  expect(list.GetLastRecord()).toBe(b);
  expect(list.GetRecord(1)).toBe(a);
  expect(list.HasRecord(4)).toBe(true);
  expect(list.HasRecord(5)).toBe(false);
  list.ReplaceRecord(a, 1);
  list.ReplaceRecord(handle, 2);
  list.ReplaceRecord(null, 0);
  list.ReplaceRecord(empty, 0);
  expect(list.GetSize()).toBe(3);
  expect(list.GetFirstRecord()).toBe(b);
  list.RemoveRecord(1);
  handle.dispose();
  empty.dispose();
  list.RemoveAllRecords();
  expect(releaseA).toHaveBeenCalledTimes(3);
  expect(releaseB).toHaveBeenCalledTimes(5);
  list.dispose();
});
it("retains copied list bodies until the last real owner releases them", /** No reference counters are injected or observed. @returns Completion. */ async () => {
  const original = new XclExpRecordList(),
    body = element("font");
  original.AppendNewRecord(body);
  const release = vi.spyOn(body, "release"),
    copy = new XclExpRecordList(original);
  original.RemoveAllRecords();
  expect(body.GetSize()).toBe(2);
  expect(await emit(copy)).toContain("<font/>");
  copy.dispose();
  expect(release).toHaveBeenCalledTimes(2);
  original.dispose();
});
it("keeps invalidated slots until compaction and does not silently skip them on XML output", /** Uses the real reference null assertion. @returns Completion. */ async () => {
  const list = new XclExpRecordList(),
    first = element("font"),
    last = element("fill");
  list.AppendRecord(first);
  list.AppendRecord(element("border"));
  list.AppendRecord(last);
  list.InvalidateRecord(1);
  expect(list.GetSize()).toBe(3);
  expect(list.HasRecord(1)).toBe(true);
  expect(list.GetRecord(1)).toBeNull();
  await expect(emit(list)).rejects.toThrow();
  list.RemoveInvalidatedRecords();
  expect(list.GetSize()).toBe(2);
  expect(list.GetFirstRecord()).toBe(first);
  expect(list.GetLastRecord()).toBe(last);
  expect(await emit(list)).toContain("<font/><fill/>");
  list.dispose();
});
it("borrows delegating bodies without retaining or destroying them", /** The actual body remains usable after the delegator destructor. @returns Completion. */ async () => {
  const body = element("font"),
    delegate = new XclExpDelegatingRecord(body);
  expect(await emit(delegate)).toContain("<font/>");
  delegate.dispose();
  expect(body.GetSize()).toBe(2);
  expect(await emit(body)).toContain("<font/>");
  const absent = new XclExpDelegatingRecord(null),
    base = new XclExpRecordBase(),
    handle = new Reference(base),
    copy = new XclExpRecordBase(base);
  expect(await emit(absent)).not.toContain("<font");
  expect(await emit(copy)).not.toContain("<font");
  copy.dispose();
  absent.dispose();
  handle.dispose();
  body.dispose();
});
