/** @fileoverview Actual DOCX package stream traversal in main/Worker realms with the caller's native context and registered URI services. */
import { OOXMLStreamImpl } from "../../apps/office/src/sw/source/writerfilter/ooxml/OOXMLStreamImpl";
import { StreamType_t } from "../../apps/office/src/sw/source/writerfilter/inc/ooxml/OOXMLDocument";
import { ZipStorage } from "../../apps/office/src/oox/source/helper/zipstorage";
import { writeRelationsInfoSequenceXml } from "../../apps/office/src/comphelper/source/xml/ofopxmlhelper.string";
import { writeOutput } from "../../apps/office/src/test/oox-output";
import { readOwnedInput } from "../../apps/office/src/test/oox-input";
import type { ReferenceConstParameter } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { FastTokenHandler as FastTokenHandlerService } from "../../apps/office/src/offapi/com/sun/star/xml/sax/FastTokenHandler";
import { FastSaxSerializer } from "../../apps/office/src/sax/source/tools/fastserializer";
import { ZipFragmentStream } from "../../apps/office/src/oox/source/helper/zipstorage";
import { getTokenFromUtf8 } from "../../apps/office/src/oox/source/token/tokenmap";
import type { SequenceElements } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import {
  FastAttributeList,
  FastTokenHandlerBase,
  castToFastAttributeList,
} from "../../apps/office/src/sax/source/tools/fastattribs";
import { Reference as RtlReference } from "../../apps/office/src/sal/inc/rtl/ref";
import {
  Reference,
  UNO_QUERY_THROW,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { XFastAttributeList } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XFastAttributeList";
import { Attribute } from "../../apps/office/src/offapi/com/sun/star/xml/Attribute";
import { FastAttribute } from "../../apps/office/src/offapi/com/sun/star/xml/FastAttribute";
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
import { OUString, type OUStringConstReference } from "../../apps/office/src/sal/inc/rtl/ustring";
/** Observes borrowed native UTF16 units without acquiring or destroying the source field. @param value - Borrowed native string. @returns Exact host observation. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Exercises real cloned UNO attribute facets and native by-value sequences in the calling realm. @param context - Genuine registered component context. @returns Public native attribute observations. */
export function probeNativeAttributes(context: ReferenceConstParameter<XComponentContext>) {
  const service = FastTokenHandlerService.create(context),
    handler = service.operatorStar();
  if (!(handler instanceof FastTokenHandlerBase))
    throw new Error("Actual native token base is missing");
  const owner = new RtlReference(new FastAttributeList(handler)),
    list = owner.operatorStar(),
    namespace = new OUString(new Uint16Array([117, 114, 110, 58, 937]), 5),
    nameBytes = new TextEncoder().encode("p:字"),
    name = new OString(nameBytes, nameBytes.length),
    value = new OString(new Uint8Array([65, 0, 66]), 3);
  try {
    list.add(1, "visible", 2, new Uint16Array([937, 0, 233]));
    list.addUnknown(namespace, name, value);
    const clone = list.createClone();
    try {
      const facet = new Reference<XFastAttributeList>(
        clone,
        UNO_QUERY_THROW,
        XFastAttributeList.static_type,
      );
      try {
        const copied = castToFastAttributeList(facet),
          unknown = copied.getUnknownAttributes(),
          fast = copied.getFastAttributes();
        try {
          list.clear();
          const first = Attribute.unacquired(
              (unknown.getConstArray() as SequenceElements).get(0) as SequenceElements,
            ),
            known = FastAttribute.unacquired(
              (fast.getConstArray() as SequenceElements).get(16) as SequenceElements,
            );
          return {
            cloneToken: copied.getValueToken(1) === getTokenFromUtf8("visible"),
            sourceCleared: !list.hasAttribute(1),
            names: [text(first.NamespaceURL), text(first.Name), text(first.Value)],
            known: [known.Token, text(known.Value)],
            prefixBoolean: copied.begin().toBoolean(),
            unknownCount: unknown.getLength(),
          };
        } finally {
          fast.dispose();
          unknown.dispose();
        }
      } finally {
        facet.dispose();
      }
    } finally {
      clone.dispose();
    }
  } finally {
    value.dispose();
    name.dispose();
    namespace.dispose();
    owner.dispose();
    service.dispose();
  }
}
/** Exercises the registered token service, real COW byte owners and serializer in the calling realm. @param context - Actual caller context. @returns Public token and emitted XML observations. */
export function probeNativeTokenService(context: ReferenceConstParameter<XComponentContext>) {
  const handler = FastTokenHandlerService.create(context),
    token = getTokenFromUtf8("document"),
    first = handler.operatorStar().getUTF8Identifier(token),
    second = handler.operatorStar().getUTF8Identifier(token),
    stream = new ZipFragmentStream("tokens.xml", "application/xml"),
    serializer = new FastSaxSerializer(stream);
  try {
    const sharedBeforeWrite = first.get() === second.get(),
      roundTrip = handler.operatorStar().getTokenFromUTF8(first);
    ((first.getArray() as SequenceElements).get(0) as [number])[0] = 63;
    const detachedAfterWrite = first.get() !== second.get(),
      mutatedLookup = handler.operatorStar().getTokenFromUTF8(first),
      cachedLookup = handler.operatorStar().getTokenFromUTF8(second);
    serializer.singleFastElement(token);
    serializer.endDocument();
    return {
      sharedBeforeWrite,
      detachedAfterWrite,
      roundTrip: roundTrip === token,
      mutatedLookup,
      cachedLookup: cachedLookup === token,
      xml: new TextDecoder().decode(stream.getBytes()),
    };
  } finally {
    serializer.dispose();
    second.dispose();
    first.dispose();
    handler.dispose();
  }
}
const relationshipPrefix = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
/** Builds and reopens a real package before traversing actual readonly UNO streams. @param context - Borrowed caller context. @returns Public stream/byte observations, without private state access. */
export async function probeWriterPackage(context: ReferenceConstParameter<XComponentContext>) {
  const output = new ZipStorage();
  const rootRelations = writeRelationsInfoSequenceXml([
    [
      { First: "Id", Second: "root" },
      { First: "Type", Second: relationshipPrefix + "officeDocument" },
      { First: "Target", Second: "word/document.xml" },
    ],
  ]);
  const partRelations = writeRelationsInfoSequenceXml([
    [
      { First: "Id", Second: "styles" },
      { First: "Type", Second: relationshipPrefix + "styles" },
      { First: "Target", Second: "../styles.xml" },
    ],
  ]);
  const documentXml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Привет</w:t></w:r></w:p></w:body></w:document>';
  const stylesXml =
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>';
  const parts = [
    ["_rels/.rels", "application/vnd.openxmlformats-package.relationships+xml", rootRelations],
    [
      "word/_rels/document.xml.rels",
      "application/vnd.openxmlformats-package.relationships+xml",
      partRelations,
    ],
    [
      "word/document.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
      documentXml,
    ],
    [
      "styles.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
      stylesXml,
    ],
  ] as const;
  for (const [path, mediaType, xml] of parts) {
    writeOutput(output.openOutputStream(path, mediaType), new TextEncoder().encode(xml));
  }
  const storage = await ZipStorage.open(await output.commit());
  const root = await OOXMLStreamImpl.createStream(context, storage);
  try {
    const child = await OOXMLStreamImpl.createStream(root, StreamType_t.STYLES);
    try {
      return {
        rootTarget: root.getTarget(),
        childTarget: child.getTarget(),
        byId: root.getTargetForId("styles"),
        rootText: new TextDecoder().decode(readOwnedInput(root.getDocumentStream()) as Uint8Array),
        childText: new TextDecoder().decode(
          readOwnedInput(child.getDocumentStream()) as Uint8Array,
        ),
      };
    } finally {
      child.dispose();
    }
  } finally {
    root.dispose();
  }
}
