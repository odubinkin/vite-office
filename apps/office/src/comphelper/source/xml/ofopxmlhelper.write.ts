/** @fileoverview Original OFOPXMLHelper WriteRelationsInfoSequence/WriteContentSequence stream/context contracts and native StringPair traversal through the actual registered SAX Writer. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { AttributeList } from "./attributelist";
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
/** Original source literal. @param value - Known ASCII. @returns Owned RTL string. */
function literal(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
/** Original output guard only; context validity belongs to the generated Writer constructor. @param stream - Actual output. @returns Nothing. */
function checkOutput(stream: Reference<XOutputStream>): void {
  if (!stream.is()) {
    const message = literal("Invalid output stream"),
      context = new Reference();
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
}
/** Original native relationships writer; attribute admission occurs after document/root callbacks, in source order. @param output - Actual output stream. @param sequence - Native nested StringPair sequence. @param context - Actual component context. @returns Nothing. */
export function WriteRelationsInfoSequence(
  output: Reference<XOutputStream>,
  sequence: SequenceReference<Sequence<StringPair>>,
  context: Reference<XComponentContext>,
): void {
  checkOutput(output);
  const writer = Writer.create(context),
    root = literal("Relationships"),
    child = literal("Relationship"),
    space = literal(" "),
    xmlns = literal("xmlns"),
    namespace = literal("http://schemas.openxmlformats.org/package/2006/relationships"),
    id = literal("Id"),
    type = literal("Type"),
    mode = literal("TargetMode"),
    target = literal("Target"),
    rootAttrs = new Reference(new AttributeList());
  try {
    writer.operatorStar().setOutputStream(output);
    rootAttrs.operatorStar().AddAttribute(xmlns, namespace);
    writer.operatorStar().startDocument();
    writer.operatorStar().startElement(root, rootAttrs);
    for (let i = 0; i < sequence.getLength(); ++i) {
      const row = Sequence.unacquired(
          Pairs,
          sequence.operatorIndex(i) as unknown as [uno_Sequence | null],
        ),
        attrs = new Reference(new AttributeList());
      try {
        for (let n = 0; n < row.getLength(); ++n) {
          const pair = StringPair.unacquired(
            row.operatorIndex(n) as unknown as Parameters<typeof StringPair.unacquired>[0],
          );
          if (!(
            pair.First.equals(id) ||
            pair.First.equals(type) ||
            pair.First.equals(mode) ||
            pair.First.equals(target)
          ))
            throw new IllegalArgumentException();
          attrs.operatorStar().AddAttribute(pair.First, pair.Second);
        }
        writer.operatorStar().startElement(child, attrs);
        writer.operatorStar().ignorableWhitespace(space);
        writer.operatorStar().endElement(child);
      } finally {
        attrs.dispose();
      }
    }
    writer.operatorStar().ignorableWhitespace(space);
    writer.operatorStar().endElement(root);
    writer.operatorStar().endDocument();
  } finally {
    rootAttrs.dispose();
    for (const value of [target, mode, type, id, namespace, xmlns, space, child, root])
      value.dispose();
    writer.dispose();
  }
}
/** Original native content-types writer. @param output - Actual output stream. @param defaults - Native default pairs. @param overrides - Native override pairs. @param context - Actual component context. @returns Nothing. */
export function WriteContentSequence(
  output: Reference<XOutputStream>,
  defaults: SequenceReference<StringPair>,
  overrides: SequenceReference<StringPair>,
  context: Reference<XComponentContext>,
): void {
  checkOutput(output);
  const writer = Writer.create(context),
    root = literal("Types"),
    defaultName = literal("Default"),
    overrideName = literal("Override"),
    extension = literal("Extension"),
    partName = literal("PartName"),
    contentType = literal("ContentType"),
    space = literal(" "),
    xmlns = literal("xmlns"),
    namespace = literal("http://schemas.openxmlformats.org/package/2006/content-types"),
    rootAttrs = new Reference(new AttributeList());
  try {
    writer.operatorStar().setOutputStream(output);
    rootAttrs.operatorStar().AddAttribute(xmlns, namespace);
    writer.operatorStar().startDocument();
    writer.operatorStar().startElement(root, rootAttrs);
    for (const [row, name, key] of [
      [defaults, defaultName, extension],
      [overrides, overrideName, partName],
    ] as const)
      for (let i = 0; i < row.getLength(); ++i) {
        const pair = StringPair.unacquired(
            row.operatorIndex(i) as unknown as Parameters<typeof StringPair.unacquired>[0],
          ),
          attrs = new Reference(new AttributeList());
        try {
          attrs.operatorStar().AddAttribute(key, pair.First);
          attrs.operatorStar().AddAttribute(contentType, pair.Second);
          writer.operatorStar().startElement(name, attrs);
          writer.operatorStar().ignorableWhitespace(space);
          writer.operatorStar().endElement(name);
        } finally {
          attrs.dispose();
        }
      }
    writer.operatorStar().ignorableWhitespace(space);
    writer.operatorStar().endElement(root);
    writer.operatorStar().endDocument();
  } finally {
    rootAttrs.dispose();
    for (const value of [
      namespace,
      xmlns,
      space,
      contentType,
      partName,
      extension,
      overrideName,
      defaultName,
      root,
    ])
      value.dispose();
    writer.dispose();
  }
}
