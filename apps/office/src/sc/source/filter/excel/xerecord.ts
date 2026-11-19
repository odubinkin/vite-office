/** @fileoverview Original Excel XML record/list ownership and element callbacks from xerecord.hxx/xerecord.cxx. Binary Save/record framing awaits the actual XclExpStream owner and is not replaced by a successful sink. */
import { SimpleReferenceObject } from "../../../../salhelper/source/simplereferenceobject";
import { Reference } from "../../../../sal/inc/rtl/ref";
import type { XclExpXmlStream } from "./xestream";
/** Original record base with its native empty XML operation. Physical native allocation and binary stream signatures remain unported. */
export class XclExpRecordBase extends SimpleReferenceObject {
  /** Original ordinary/copy/move construction starts a fresh base reference count. @param source - Optional actual source; the base has no copied payload. @returns Record. */
  constructor(source?: XclExpRecordBase) {
    super();
    void source;
  }
  /** Original default XML output is deliberately empty. @param stream - Actual Excel XML stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    void stream;
  }
  /** Explicit binding of the original public by-value destructor; intrusive owners call the same virtual destructor through release. @returns Nothing. */
  dispose(): void {
    this.destroy();
  }
}
/** Original delegating record borrows a record whose lifetime belongs to its caller. */
export class XclExpDelegatingRecord extends XclExpRecordBase {
  /** Original raw pointer constructor does not acquire an intrusive reference. @param mpRecord - Actual borrowed record or native null. @returns Record. */
  constructor(private readonly mpRecord: XclExpRecordBase | null) {
    super();
  }
  /** Original null guard and actual virtual XML dispatch. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    this.mpRecord?.SaveXml(stream);
  }
}
/** Original signed32 element-token record base. */
export class XclExpXmlElementRecord extends XclExpRecordBase {
  protected readonly mnElement: number;
  /** Original token constructor. @param element - Actual token. @returns Record. */
  constructor(element: number) {
    super();
    this.mnElement = element | 0;
  }
}
/** Original start-element record has no generic attribute facility. */
export class XclExpXmlStartElementRecord extends XclExpXmlElementRecord {
  /** Original actual serializer dispatch. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    stream.GetCurrentStream().startElement(this.mnElement);
  }
}
/** Original matching end-element callback. */
export class XclExpXmlEndElementRecord extends XclExpXmlElementRecord {
  /** Original actual serializer dispatch. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    stream.GetCurrentStream().endElement(this.mnElement);
  }
}
/** Original open single-element fragment leaves attribute writing to subsequent records. */
export class XclExpXmlStartSingleElementRecord extends XclExpXmlElementRecord {
  /** Original unescaped prefix/token write, without inserting a normal element into the serializer stack. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    stream.GetCurrentStream().write("<").writeId(this.mnElement);
  }
}
/** Original raw single-element terminator. */
export class XclExpXmlEndSingleElementRecord extends XclExpRecordBase {
  /** Original unescaped terminator write. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    stream.GetCurrentStream().write("/>");
  }
}
/** Original template list owns actual rtl::Reference handles. Consumed pointer/const-reference overloads preserve duplicate aliases; C++ rvalue syntax, copy assignment and binary Save are not admitted yet. */
export class XclExpRecordList<
  RecordType extends XclExpRecordBase = XclExpRecordBase,
> extends XclExpRecordBase {
  private maRecs: Reference<RecordType>[] = [];
  /** Original implicit copy acquires independent handles to the same record objects. @param source - Optional actual list. @returns List. */
  constructor(source?: XclExpRecordList<RecordType>) {
    super(source);
    if (source !== undefined)
      this.maRecs = source.maRecs.map(
        /** Copies each genuine intrusive handle. @param record - Actual handle. @returns Independent handle. */ (
          record,
        ) => new Reference(record),
      );
  }
  /** Original vector emptiness includes invalidated slots until compaction. @returns Whether empty. */
  IsEmpty(): boolean {
    return this.maRecs.length === 0;
  }
  /** Original vector size, including invalidated slots. @returns Number of records. */
  GetSize(): number {
    return this.maRecs.length;
  }
  /** Original valid unsigned vector-index domain. Negative/unsafe native size_t ABI values remain unqualified. @param position - Native nonnegative index. @returns Whether an entry exists. */
  HasRecord(position: number): boolean {
    return position < this.maRecs.length;
  }
  /** Original borrowed pointer or native null; invalidated slots also return null. @param position - Native nonnegative index. @returns Borrowed record. */
  GetRecord(position: number): RecordType | null {
    return this.maRecs[position]?.get() ?? null;
  }
  /** Original first borrowed pointer. @returns Record or native null. */
  GetFirstRecord(): RecordType | null {
    return this.maRecs[0]?.get() ?? null;
  }
  /** Original last borrowed pointer. @returns Record or native null. */
  GetLastRecord(): RecordType | null {
    return this.maRecs.at(-1)?.get() ?? null;
  }
  /** Original insertion clamps only at the upper vector end and requires a nonnull record. @param record - Actual raw/const-reference record. @param position - Native nonnegative index. @returns Nothing. */
  InsertRecord(record: RecordType | Reference<RecordType>, position: number): void {
    const handle = new Reference(record);
    if (!handle.is()) throw new Error("assert(record)");
    this.maRecs.splice(Math.min(position, this.maRecs.length), 0, handle);
  }
  /** Original optional append ignores null without creating a vector slot. @param record - Actual pointer/const reference. @returns Nothing. */
  AppendRecord(record: RecordType | Reference<RecordType> | null): void {
    const body = record instanceof Reference ? record.get() : record;
    if (body !== null) this.maRecs.push(new Reference(body));
  }
  /** Original replacement acquires before releasing the existing record; null erases the slot. The position must exist. @param record - Actual pointer/const reference or null. @param position - Existing index. @returns Nothing. */
  ReplaceRecord(record: RecordType | Reference<RecordType> | null, position: number): void {
    const body = record instanceof Reference ? record.get() : record;
    if (body !== null) (this.maRecs[position] as Reference<RecordType>).set(body);
    else this.RemoveRecord(position);
  }
  /** Original required append retains the actual pointer, including repeated aliases. @param record - Actual raw/const-reference record. @returns Nothing. */
  AppendNewRecord(record: RecordType | Reference<RecordType>): void {
    const handle = new Reference(record);
    if (!handle.is()) throw new Error("assert(record)");
    this.maRecs.push(handle);
  }
  /** Original erase releases one owned handle. The position must exist. @param position - Existing index. @returns Nothing. */
  RemoveRecord(position: number): void {
    (this.maRecs[position] as Reference<RecordType>).dispose();
    this.maRecs.splice(position, 1);
  }
  /** Original clear destroys vector handles; physical allocator/destruction-order ABI and reentrant vector mutation remain unqualified. @returns Nothing. */
  RemoveAllRecords(): void {
    for (const record of this.maRecs) record.dispose();
    this.maRecs.length = 0;
  }
  /** Original virtual XML traversal does not skip invalidated entries; callers must compact them first. @param stream - Actual stream. @returns Nothing. */
  override SaveXml(stream: XclExpXmlStream): void {
    for (const record of this.maRecs) record.operatorArrow().SaveXml(stream);
  }
  /** Original nullable assignment preserves vector cardinality until compaction. @param position - Existing index. @returns Nothing. */
  InvalidateRecord(position: number): void {
    (this.maRecs[position] as Reference<RecordType>).clear();
  }
  /** Original erase-if removes only null references without altering surviving object identity/order. @returns Nothing. */
  RemoveInvalidatedRecords(): void {
    this.maRecs = this.maRecs.filter(
      /** Tests the actual native empty-handle state. @param record - Actual handle. @returns Whether retained. */ (
        record,
      ) => record.is(),
    );
  }
  /** Original derived member destruction precedes the actual reference-base assertion. @returns Nothing. */
  protected override destroy(): void {
    this.RemoveAllRecords();
    super.destroy();
  }
}
