/** @fileoverview Original anonymous OFOPXMLHelper_Impl SAX handler, native StringPair sequences and element stack. Parser-service construction belongs to the separate input boundary; this class supplies no parser or storage replacement. */
import {
  rtl_uString_assign,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../../../sal/inc/rtl/ustring.h";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { Parser } from "../../../offapi/com/sun/star/xml/sax/Parser";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";

export const RELATIONINFO_FORMAT = 0,
  CONTENTTYPE_FORMAT = 1;
const Pairs = Sequence.specialize<StringPair>(pairType, 16),
  Rows = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
/** Binds the source static UTF16 literal owner. @param text - Original ASCII literal. @returns Static source string. */
function literal(text: string): OUString {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        text + "\0",
        /** Binds one source literal unit. @param unit - ASCII unit. @returns UTF16 unit. */
        (unit) => unit.charCodeAt(0),
      ),
    ),
  );
}
const g_aRelListElement = literal("Relationships"),
  g_aRelElement = literal("Relationship"),
  g_aIDAttr = literal("Id"),
  g_aTypeAttr = literal("Type"),
  g_aTargetAttr = literal("Target"),
  g_aTargetModeAttr = literal("TargetMode"),
  g_aTypesElement = literal("Types"),
  g_aDefaultElement = literal("Default"),
  g_aOverrideElement = literal("Override"),
  g_aExtensionAttr = literal("Extension"),
  g_aPartNameAttr = literal("PartName"),
  g_aContentTypeAttr = literal("ContentType");

/** Original source-internal document handler. Export only links the compiler shard and its source-contract tests. */
export class OFOPXMLHelper_Impl
  extends WeakImplHelper.specialize(XDocumentHandler)
  implements XDocumentHandler
{
  private readonly m_nFormat: number;
  private readonly m_aResultSeq = new Rows();
  private readonly m_aElementsSeq: OUString[] = [];
  /** Original unsigned16 format constructor does not reset or validate another owner's state. @param format - Original format discriminator. @returns Handler. */
  constructor(format: number) {
    super();
    this.m_nFormat = format & 0xffff;
  }
  /** Original reverse member and weak-base destruction. @returns Nothing. */
  protected override destroy(): void {
    for (const name of this.m_aElementsSeq.reverse()) name.dispose();
    this.m_aElementsSeq.length = 0;
    this.m_aResultSeq.dispose();
    super.destroy();
  }
  /** Original const-reference result requires a completely closed element stack. @returns Borrowed source result. */
  GetParsingResult(): SequenceReference<Sequence<StringPair>> {
    if (this.m_aElementsSeq.length !== 0) throw new RuntimeException();
    return this.m_aResultSeq;
  }
  /** Original empty document callback intentionally retains existing results. @returns Nothing. */
  startDocument(): void {}
  /** Original empty document callback does not finish or validate the element stack. @returns Nothing. */
  endDocument(): void {}
  /** Original qualified-name matching, depth validation and ordered native field assignments. @param name - Borrowed qualified element name. @param attributes - Actual SAX attributes. @returns Nothing. */
  startElement(name: OUStringConstReference, attributes: Reference<XAttributeList>): void {
    if (this.m_nFormat === RELATIONINFO_FORMAT) {
      if (name.equals(g_aRelListElement)) {
        if (this.m_aElementsSeq.length + 1 !== 1) throw new SAXException();
        this.m_aElementsSeq.push(new OUString(name));
        return;
      }
      if (!name.equals(g_aRelElement)) throw new SAXException();
      if (this.m_aElementsSeq.length + 1 !== 2) throw new SAXException();
      this.m_aElementsSeq.push(new OUString(name));
      const length = this.m_aResultSeq.getLength() + 1;
      this.m_aResultSeq.realloc(length);
      const row = Sequence.unacquired(
        Pairs,
        (this.m_aResultSeq.getArray() as SequenceElements).get((length - 1) * 8) as [
          uno_Sequence | null,
        ],
      );
      row.realloc(4);
      const fields = row.getArray() as SequenceElements,
        id = attributes.operatorStar().getValueByName(g_aIDAttr);
      try {
        if (id.isEmpty()) throw new SAXException();
        const values: OUString[] = [];
        try {
          values.push(attributes.operatorStar().getValueByName(g_aTypeAttr));
          values.push(attributes.operatorStar().getValueByName(g_aTargetAttr));
          values.push(attributes.operatorStar().getValueByName(g_aTargetModeAttr));
          let count = 0;
          for (const [key, value] of [
            [g_aIDAttr, id],
            [g_aTypeAttr, values[0] as OUString],
            [g_aTargetAttr, values[1] as OUString],
            [g_aTargetModeAttr, values[2] as OUString],
          ] as const) {
            if (key === g_aIDAttr || !value.isEmpty()) {
              const pair = fields.get(count++ * 16) as SequenceElements;
              rtl_uString_assign(pair.get(0) as rtl_uStringSlot, key.pData as rtl_uString);
              rtl_uString_assign(pair.get(8) as rtl_uStringSlot, value.pData as rtl_uString);
            }
          }
          row.realloc(count);
        } finally {
          for (const value of values.reverse()) value.dispose();
        }
      } finally {
        id.dispose();
      }
      return;
    }
    if (this.m_nFormat !== CONTENTTYPE_FORMAT) throw new SAXException();
    if (name.equals(g_aTypesElement)) {
      if (this.m_aElementsSeq.length + 1 !== 1) throw new SAXException();
      this.m_aElementsSeq.push(new OUString(name));
      if (!this.m_aResultSeq.hasElements()) this.m_aResultSeq.realloc(2);
      return;
    }
    const isDefault = name.equals(g_aDefaultElement);
    if (!isDefault && !name.equals(g_aOverrideElement)) throw new SAXException();
    if (this.m_aElementsSeq.length + 1 !== 2) throw new SAXException();
    this.m_aElementsSeq.push(new OUString(name));
    if (!this.m_aResultSeq.hasElements()) this.m_aResultSeq.realloc(2);
    if (this.m_aResultSeq.getLength() !== 2) {
      const message = literal("m_aResultSeq already has elements and is not reallocated to 2."),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const result = this.m_aResultSeq.getArray() as SequenceElements,
      key = attributes
        .operatorStar()
        .getValueByName(isDefault ? g_aExtensionAttr : g_aPartNameAttr);
    try {
      if (key.isEmpty()) throw new SAXException();
      const type = attributes.operatorStar().getValueByName(g_aContentTypeAttr);
      try {
        if (type.isEmpty()) throw new SAXException();
        const row = Sequence.unacquired(
            Pairs,
            result.get(isDefault ? 0 : 8) as [uno_Sequence | null],
          ),
          length = row.getLength() + 1;
        row.realloc(length);
        const pair = (row.getArray() as SequenceElements).get(
          (length - 1) * 16,
        ) as SequenceElements;
        rtl_uString_assign(pair.get(0) as rtl_uStringSlot, key.pData as rtl_uString);
        rtl_uString_assign(pair.get(8) as rtl_uStringSlot, type.pData as rtl_uString);
      } finally {
        type.dispose();
      }
    } finally {
      key.dispose();
    }
  }
  /** Original end-name check pops only on an exact match in either recognized format. @param name - Borrowed qualified closing name. @returns Nothing. */
  endElement(name: OUStringConstReference): void {
    if (this.m_nFormat === RELATIONINFO_FORMAT || this.m_nFormat === CONTENTTYPE_FORMAT) {
      const length = this.m_aElementsSeq.length;
      if (length <= 0 || !(this.m_aElementsSeq[length - 1] as OUString).equals(name))
        throw new SAXException();
      (this.m_aElementsSeq.pop() as OUString).dispose();
    }
  }
  /** Original ignores character content. @param text - Ignored text. @returns Nothing. */
  characters(text: OUStringConstReference): void {
    void text;
  }
  /** Original ignores ignorable whitespace. @param text - Ignored spacing. @returns Nothing. */
  ignorableWhitespace(text: OUStringConstReference): void {
    void text;
  }
  /** Original ignores processing instructions. @param target - Ignored target. @param data - Ignored data. @returns Nothing. */
  processingInstruction(target: OUStringConstReference, data: OUStringConstReference): void {
    void target;
    void data;
  }
  /** Original ignores the document locator. @param locator - Ignored locator. @returns Nothing. */
  setDocumentLocator(locator: Reference<XLocator>): void {
    void locator;
  }
}

/** Original stream/context read implementation, including mandatory real Parser service lookup and success-only handler reset. @param input - Original input stream. @param systemId - Original source identifier. @param format - Unsigned16 format selector. @param context - Actual component context. @returns Original copied result. */
export function ReadSequence_Impl(
  input: Reference<XInputStream>,
  systemId: OUStringConstReference,
  format: number,
  context: Reference<XComponentContext>,
): Sequence<Sequence<StringPair>> {
  if (!context.is() || !input.is() || (format & 0xffff) > CONTENTTYPE_FORMAT) {
    const message = literal("Invalid input stream or context"),
      empty = new Reference();
    try {
      throw new RuntimeException(message, empty);
    } finally {
      empty.dispose();
      message.dispose();
    }
  }
  const parser = Parser.create(context);
  try {
    const helper = new Reference(new OFOPXMLHelper_Impl(format)),
      source = new InputSource();
    try {
      source.aInputStream = input;
      source.sSystemId = systemId;
      parser.operatorStar().setDocumentHandler(helper);
      parser.operatorStar().parseStream(source);
      const empty = new Reference<XDocumentHandler>();
      try {
        parser.operatorStar().setDocumentHandler(empty);
      } finally {
        empty.dispose();
      }
      return new Rows(helper.operatorStar().GetParsingResult());
    } finally {
      source.dispose();
      helper.dispose();
    }
  } finally {
    parser.dispose();
  }
}

/** Original OFOPXMLHelper stream overload, including the source _rels/ identifier prefix. @param input - Actual relationship input. @param streamName - Original UTF16 string view. @param context - Actual component context. @returns Ordered source result. */
export function ReadRelationsInfoSequence(
  input: Reference<XInputStream>,
  streamName: Uint16Array,
  context: Reference<XComponentContext>,
): Sequence<Sequence<StringPair>> {
  const id = literal("_rels/");
  try {
    id.append(streamName);
    return ReadSequence_Impl(input, id, RELATIONINFO_FORMAT, context);
  } finally {
    id.dispose();
  }
}

/** Original content-types stream overload uses the fixed package identifier. @param input - Actual content-types input. @param context - Actual component context. @returns Defaults and overrides. */
export function ReadContentTypeSequence(
  input: Reference<XInputStream>,
  context: Reference<XComponentContext>,
): Sequence<Sequence<StringPair>> {
  const id = literal("[Content_Types].xml");
  try {
    return ReadSequence_Impl(input, id, CONTENTTYPE_FORMAT, context);
  } finally {
    id.dispose();
  }
}
