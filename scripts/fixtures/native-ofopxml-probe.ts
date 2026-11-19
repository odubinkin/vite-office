/** @fileoverview Exercises the original OFOPXML handler through actual UTF8 InputSource boundaries in browser main and DOM-free Worker realms. */
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../apps/office/src/cppu/inc/uno/sequence2";
import { MemoryInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import {
  GetContentTypeByName,
  ReadContentTypeSequence,
  ReadRelationsInfoSequence,
} from "../../apps/office/src/comphelper/source/xml/ofopxmlhelper";
import { InputSource } from "../../apps/office/src/offapi/com/sun/star/xml/sax/InputSource";
import { OUString, type OUStringConstReference } from "../../apps/office/src/sal/inc/rtl/ustring";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/StringPair";

/** Uses original schema/Sequence owners, preserving the existing input transport without a fake Parser service. @returns Metadata values observed through native owners. */
export function probeNativeOfopXml() {
  const owners: { dispose(): void }[] = [];
  /** Retains actual owners for reverse destruction. @param value - Native owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Binds a caller UTF16 string. @param text - Caller value. @returns Owned RTL string. */
  function native(text: string): OUString {
    return own(
      new OUString(
        Uint16Array.from(
          text.split(""),
          /** Reads one exact UTF16 unit. @param unit - Source unit. @returns Numeric unit. */
          (unit) => unit.charCodeAt(0),
        ),
        text.length,
      ),
    );
  }
  /** Observes a borrowed native string without disposing its field owner. @param value - Source value. @returns Host observation. */
  function text(value: OUStringConstReference): string {
    return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
  }
  /** Creates the actual native byte-input object used by existing package callers. @param xml - UTF8 source text. @returns Owned source. */
  function source(xml: string): InputSource {
    const bytes = new TextEncoder().encode(xml),
      stream = own(new Reference(new MemoryInputStream(bytes, bytes.length))),
      result = own(new InputSource());
    result.aInputStream = stream;
    return result;
  }
  try {
    const relations = own(
        ReadRelationsInfoSequence(
          source(
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="t" Target="字😀.xml" TargetMode="External"/><Relationship Id="rId1"/></Relationships>',
          ),
        ),
      ),
      types = own(
        ReadContentTypeSequence(
          source(
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/rels"/><Override PartName="/word/document.xml" ContentType="application/writer+xml"/></Types>',
          ),
        ),
      ),
      row = Sequence.unacquired(
        Sequence.specialize<StringPair>(pairType, 16),
        (relations.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
      ),
      pairs: string[][] = [];
    for (let index = 0; index < row.getLength(); ++index) {
      const pair = StringPair.unacquired(
        (row.getConstArray() as SequenceElements).get(index * 16) as SequenceElements,
      );
      pairs.push([text(pair.First), text(pair.Second)]);
    }
    return {
      relations: relations.getLength(),
      first: pairs,
      documentType: text(own(GetContentTypeByName(types, native("word/document.xml")))),
      defaultType: text(own(GetContentTypeByName(types, native("_rels/.rels")))),
    };
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
