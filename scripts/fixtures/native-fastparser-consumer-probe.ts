/** @fileoverview Actual converted-input parseStream and all five source C callbacks/custom entities drive native Entity/legacy/Writer owners without DOM globals. Full original QA remain unfinished. */
import { OInputStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";
import { probeNativeUcbCommands } from "./native-ucb-command-probe";
import { probeNativePersistenceStream } from "./native-persistence-stream-probe";
import { probeNativeOfopXml } from "./native-ofopxml-probe";
import { probeNativeWriterParagraph } from "./native-writer-paragraph-probe";
import { probeNativeArchiveOutput } from "./native-archive-output-probe";
import { probeNativeZipOutputEntry } from "./native-zip-output-entry-probe";
import { probeNativeDeflater } from "./native-deflater-probe";
import { probeNativeFastTemp } from "./native-fast-temp-probe";
import { probeNativeUcbRegexp } from "./native-ucb-regexp-probe";
import { probeNativeUcbFileStreams } from "./native-ucb-file-stream-probe";
import { probeNativeZipAccess } from "./native-zip-access-probe";
import { probeNativeTempFile } from "./native-tempfile-probe";
import { probeNativeDirectoryMetadata } from "./native-directory-stat-probe";
import { probeNativeFileUrlReverse } from "./native-file-url-reverse-probe";
import { probeNativeSecurity } from "./native-security-probe";
import { probeNativePackageFolderSave } from "./native-package-folder-save-probe";
import { probeNativeFileUrlEncoding } from "./native-file-url-encoding-probe";
import { probeNativeFileAccess } from "./native-file-access-probe";

import { osl_getTextEncodingFromLocale } from "../../apps/office/src/sal/osl/unx/nlsupport";
import {
  osl_getProcessLocale,
  osl_setProcessLocale,
} from "../../apps/office/src/sal/inc/osl/process";
import {
  osl_getThreadTextEncoding,
  osl_setThreadTextEncoding,
} from "../../apps/office/src/sal/inc/osl/thread";
import {
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_MS_1251,
} from "../../apps/office/src/sal/inc/rtl/textenc";
import type { rtl_Locale } from "../../apps/office/src/sal/inc/rtl/locale";
import {
  rtl_locale_register,
  rtl_locale_equals,
  rtl_locale_hashCode,
} from "../../apps/office/src/sal/inc/rtl/locale";
import {
  GetSvError,
  GetSvErrorErrno,
} from "../../apps/office/src/tools/source/stream/strmunx.errors";
import { oslFileError } from "../../apps/office/src/sal/inc/osl/file";
import { OSeekableInputWrapper } from "../../apps/office/src/comphelper/source/streaming/seekableinput";
import { NotConnectedException } from "../../apps/office/src/cppu/inc/com/sun/star/io/NotConnectedException";
import { WrapStreamForShare } from "../../apps/office/src/package/source/zippackage/wrapstreamforshare";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../apps/office/src/cppu/inc/com/sun/star/uno/XInterface";
import { ZipPackageFolder } from "../../apps/office/src/package/source/zippackage/ZipPackageFolder.native";
import { ZipPackageBuffer } from "../../apps/office/src/package/source/zippackage/ZipPackageBuffer";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { ZipEntry } from "../../apps/office/src/package/inc/ZipEntry";
import { initializeZlib } from "../../apps/office/src/external/zlib/zlib";
import { InflateZlib } from "../../apps/office/src/package/source/zipapi/InflateZlib";
import { XBufferedStream } from "../../apps/office/src/package/source/zipapi/ZipFile.buffered";

import { RefCountedMutex } from "../../apps/office/src/comphelper/inc/refcountedmutex";
import { MutexGuard } from "../../apps/office/src/sal/inc/osl/mutex";
import { ZipFile, Checks } from "../../apps/office/src/package/source/zipapi/ZipFile";
import { ByteGrabber } from "../../apps/office/src/package/source/zipapi/ByteGrabber";
import { SvInputStream } from "../../apps/office/src/svl/source/misc/strmadpt";
import { OStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";
import {
  createFileHandleFromFD,
  osl_writeFile,
  osl_syncFile,
  osl_setFilePos,
  osl_readFile,
  osl_closeFile,
} from "../../apps/office/src/sal/osl/unx/file";

import {
  ParserData,
  NamespaceDefine,
} from "../../apps/office/src/sax/source/fastparser/fastparser.entity";
import {
  NamespaceHandler,
  CallbackDocumentHandler,
} from "../../apps/office/src/sax/source/fastparser/legacyfastparser.handlers";
import { AttributeList } from "../../apps/office/src/oox/source/helper/attributelist";
import { getTokenFromUtf8 } from "../../apps/office/src/oox/source/token/tokenmap";
import {
  FastTokenHandlerBase,
  FastAttributeList,
} from "../../apps/office/src/sax/source/tools/fastattribs";
import { Writer } from "../../apps/office/src/offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../apps/office/src/offapi/com/sun/star/xml/sax/FastTokenHandler";
import { XDocumentHandler } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XDocumentHandler";
import { DONTKNOW } from "../../apps/office/src/offapi/com/sun/star/xml/sax/FastToken";
import {
  Reference,
  UNO_QUERY_THROW,
  type ReferenceConstParameter,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../apps/office/src/sal/inc/rtl/ref";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { OSequenceOutputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { unicode } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
import { NormalizeURI } from "../../apps/office/src/sax/source/fastparser/fastparser.normalize";
import { SAXParseException } from "../../apps/office/src/offapi/com/sun/star/xml/sax/SAXParseException";
import { XParser } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XParser";
import {
  SvMemoryStream,
  StreamMode,
} from "../../apps/office/src/tools/source/stream/stream.native";
import { getFileSystem } from "../../apps/office/src/external/emscripten/runtime";
import { SwitchablePersistenceStream } from "../../apps/office/src/package/source/xstor/switchpersistencestream";
import { ZipStorage as NativeZipStorage } from "../../apps/office/src/oox/source/helper/zipstorage.native";
import type { XStorage } from "../../apps/office/src/offapi/com/sun/star/embed/XStorage";
import { RelationsFragment as NativeRelationsFragment } from "../../apps/office/src/oox/source/core/relationshandler.native";
import { ContextHandler } from "../../apps/office/src/oox/source/core/contexthandler";
import { FragmentHandler as NativeFragment } from "../../apps/office/src/oox/source/core/fragmenthandler.native";
import {
  Relations as NativeRelations,
  Relation as NativeRelation,
} from "../../apps/office/src/oox/source/core/relations.native";
import { SharedReference } from "../../apps/office/src/oox/source/core/shared-reference";
import { XmlFilterBase } from "../../apps/office/src/oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../apps/office/src/oox/source/helper/zipstorage";
import { FastParser as OoxFastParser } from "../../apps/office/src/oox/source/core/fastparser";
import {
  namespaceTokens,
  StaticNamespaceMap,
} from "../../apps/office/src/oox/source/token/namespacemap";
import { FastParser } from "../../apps/office/src/offapi/com/sun/star/xml/sax/FastParser";
import { FastSaxParserImpl } from "../../apps/office/src/sax/source/fastparser/fastparser.impl";
import { FastLocatorImpl } from "../../apps/office/src/sax/source/fastparser/fastparser.locator";
import { InputSource } from "../../apps/office/src/offapi/com/sun/star/xml/sax/InputSource";
import { MemoryInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { getLibXml2, withXmlBytes } from "../../apps/office/src/external/libxml2/libxml2";
import { text } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
import {
  PairStringString,
  cppu_detail_getUnoType_PairStringString,
} from "../../apps/office/src/udkapi/com/sun/star/beans/Pair";
import {
  rtl_uString_assign,
  type rtl_uStringSlot,
} from "../../apps/office/src/sal/inc/rtl/ustring.h";
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
/** Executes only real source component/value owners; emitted observations are scalar Worker messages. @param context - Actual registered context. @returns Consumer output and saved-exception state. */
export async function probeNativeFastParserConsumer(
  context: ReferenceConstParameter<XComponentContext>,
) {
  await initializeZlib();
  const owners: { dispose(): void }[] = [];
  /** Test scope models ordinary native local destruction without alternate value/type construction. @param value - Actual owned result. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  try {
    const strong = own(new Reference(context.get())),
      bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
      stream = own(new Reference(new OSequenceOutputStream(bytes))),
      writer = own(Writer.create(strong)),
      document = own(
        new Reference<XDocumentHandler>(writer, UNO_QUERY_THROW, XDocumentHandler.static_type),
      ),
      tokens = own(FastTokenHandler.create(context)),
      namespaces = own(new RtlReference(new NamespaceHandler()));
    writer.operatorStar().setOutputStream(stream);
    const handler = tokens.operatorStar();
    if (!(handler instanceof FastTokenHandlerBase))
      throw new Error("Original native token base required");
    const adapter = own(
      new RtlReference(new CallbackDocumentHandler(document, namespaces, tokens)),
    );
    const parser = own(FastParser.create(context)).operatorStar(),
      input = own(new InputSource()),
      xml = new TextEncoder().encode('<root xmlns:p="urn:probe"><p>字&amp;&face;</p></root>'),
      source = own(new Reference(new MemoryInputStream(xml, xml.length))),
      replacements = own(
        new (Sequence.specialize<PairStringString>(cppu_detail_getUnoType_PairStringString, 16))(1),
      ),
      fields = (replacements.getArray() as SequenceElements).get(0) as ReadonlyMap<number, unknown>,
      name = own(unicode("face")),
      replacement = own(unicode("😀"));
    rtl_uString_assign(fields.get(0) as rtl_uStringSlot, name.pData);
    rtl_uString_assign(fields.get(8) as rtl_uStringSlot, replacement.pData);
    parser.setCustomEntityNames(replacements);
    parser.setFastDocumentHandler(own(new Reference(adapter.get())));
    parser.setNamespaceHandler(own(new Reference(namespaces.get())));
    parser.setTokenHandler(tokens);
    input.aInputStream.assign(source);
    parser.parseStream(input);
    const outputFields = bytes.getConstArray() as SequenceElements,
      output = new Uint8Array(bytes.getLength());
    for (let i = 0; i < output.length; ++i) output[i] = (outputFields.get(i) as [number])[0];
    const legacyBytes = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
      legacyStream = own(new Reference(new OSequenceOutputStream(legacyBytes))),
      legacyWriter = own(Writer.create(context)),
      manager = own(context.operatorStar().getServiceManager()),
      component = own(
        manager
          .operatorStar()
          .createInstanceWithContext(
            own(unicode("com.sun.star.xml.sax.LegacyFastParser")),
            context,
          ),
      ),
      legacy = own(new Reference<XParser>(component, UNO_QUERY_THROW, XParser.static_type)),
      legacyInput = own(new InputSource()),
      legacyXml = new TextEncoder().encode(
        '<zz xmlns:p="urn:legacy"><p:child>字😀&amp;</p:child></zz>',
      );
    legacyWriter.operatorStar().setOutputStream(legacyStream);
    legacy
      .operatorStar()
      .setDocumentHandler(
        own(
          new Reference<XDocumentHandler>(
            legacyWriter,
            UNO_QUERY_THROW,
            XDocumentHandler.static_type,
          ),
        ),
      );
    legacyInput.aInputStream.assign(
      own(new Reference(new MemoryInputStream(legacyXml, legacyXml.length))),
    );
    legacy.operatorStar().parseStream(legacyInput);
    const legacyFields = legacyBytes.getConstArray() as SequenceElements,
      legacyOutput = new Uint8Array(legacyBytes.getLength());
    for (let i = 0; i < legacyOutput.length; ++i)
      legacyOutput[i] = (legacyFields.get(i) as [number])[0];
    const oox = own(new OoxFastParser()),
      ooxBytes = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
      ooxStream = own(new Reference(new OSequenceOutputStream(ooxBytes))),
      ooxWriter = own(Writer.create(context)),
      ooxDocument = own(
        new Reference<XDocumentHandler>(ooxWriter, UNO_QUERY_THROW, XDocumentHandler.static_type),
      ),
      ooxTokens = own(new Reference(oox.getTokenHandler().get())),
      ooxNamespaces = own(new RtlReference(new NamespaceHandler())),
      ooxAdapter = own(
        new RtlReference(new CallbackDocumentHandler(ooxDocument, ooxNamespaces, ooxTokens)),
      ),
      wordNamespace = namespaceTokens.get("doc") as number;
    ooxWriter.operatorStar().setOutputStream(ooxStream);
    oox.registerNamespace(wordNamespace);
    oox.setDocumentHandler(own(new Reference(ooxAdapter.get())));
    const ooxInput = own(new InputSource()),
      ooxXml = new TextEncoder().encode(
        '<w:document xmlns:w="' +
          text(
            StaticNamespaceMap().maStrictNamespaceMap.get(wordNamespace) as ReturnType<
              typeof unicode
            >,
          ) +
          '">字😀</w:document>',
      );
    ooxInput.aInputStream.assign(own(new Reference(new MemoryInputStream(ooxXml, ooxXml.length))));
    oox.parseStream(ooxInput);
    const ooxFields = ooxBytes.getConstArray() as SequenceElements,
      ooxOutput = new Uint8Array(ooxBytes.getLength());
    for (let i = 0; i < ooxOutput.length; ++i) ooxOutput[i] = (ooxFields.get(i) as [number])[0];
    const nativeRelations = own(
        new SharedReference(new NativeRelations(own(unicode("word/document.xml")))),
      ),
      relation = own(new NativeRelation());
    relation.maId = own(unicode("rId1"));
    relation.maType = own(unicode("urn:source-type"));
    relation.maTarget = own(unicode("字😀.xml"));
    nativeRelations.operatorStar().emplace(relation.maId, relation);
    const filter = new XmlFilterBase(new ZipStorage()),
      fragment = own(
        new Reference(
          new NativeFragment(filter, own(unicode("word/document.xml")), nativeRelations),
        ),
      ),
      child = own(new Reference(new ContextHandler(fragment.operatorStar())));
    oox.setDocumentHandler(own(new Reference(fragment.get())));
    const nativeInput = own(new InputSource());
    nativeInput.aInputStream.assign(
      own(new Reference(new MemoryInputStream(ooxXml, ooxXml.length))),
    );
    oox.parseStream(nativeInput);
    fragment.clear();
    const resolved = own(child.operatorStar().getFragmentPathFromRelId(own(unicode("rId1"))));
    const parsedRelations = own(
        new SharedReference(new NativeRelations(own(unicode("word/document.xml")))),
      ),
      relationsFragment = own(new Reference(new NativeRelationsFragment(filter, parsedRelations))),
      relationshipInput = own(new InputSource()),
      relationshipXml = new TextEncoder().encode(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdNative" Type="urn:styles" Target="字😀.xml"/><Relationship Id="external" Type="urn:external" Target="https://example.test" TargetMode="External"/></Relationships>',
      );
    oox.registerNamespace(namespaceTokens.get("packageRel") as number);
    oox.setDocumentHandler(own(new Reference(relationsFragment.get())));
    relationshipInput.aInputStream.assign(
      own(new Reference(new MemoryInputStream(relationshipXml, relationshipXml.length))),
    );
    oox.parseStream(relationshipInput);
    const parsedTarget = own(
        parsedRelations.operatorStar().getFragmentPathFromRelId(own(unicode("rIdNative"))),
      ),
      externalTarget = own(
        parsedRelations.operatorStar().getExternalTargetFromRelId(own(unicode("external"))),
      );
    const attributeOwner = own(
        new Reference(
          new FastAttributeList(oox.getTokenHandler().operatorStar() as FastTokenHandlerBase),
        ),
      ),
      attributes = own(new AttributeList(attributeOwner));
    attributeOwner.operatorStar().add(1, "2024-02-29T01:02:03Z");
    attributeOwner.operatorStar().add(2, " true  false ");
    const date = attributes.getDateTime(1);
    const nativeStorage = own(
        new NativeZipStorage(own(new Reference(context.get())), ooxInput.aInputStream, false),
      ),
      nativeChild = own(
        new NativeZipStorage(nativeStorage, own(new Reference<XStorage>()), own(unicode("word"))),
      ),
      nativeGrandchild = own(
        new NativeZipStorage(nativeChild, own(new Reference<XStorage>()), own(unicode("字😀"))),
      );
    const persistence = own(
        new Reference(new SwitchablePersistenceStream(ooxInput.aInputStream, "input")),
      ),
      persistenceInput = own(persistence.operatorStar().getInputStream()),
      persistenceBytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    persistenceInput.operatorStar().readBytes(persistenceBytes, 3);
    const persistenceFields = persistenceBytes.getConstArray() as SequenceElements;
    const fileSystem = getFileSystem(),
      filePath = "/tmp/native-consumer-probe",
      file = fileSystem.open(filePath, "w+"),
      memoryStream = own(new SvMemoryStream(0, 16));
    memoryStream.WriteBytes(Uint8Array.of(1, 2, 3), 3);
    const fileBytes = (memoryStream.GetData() as Uint8Array).subarray(
        0,
        Number(memoryStream.GetSize()),
      ),
      readBytes = new Uint8Array(3);
    const streamWrapper = own(new Reference(new OStreamWrapper(memoryStream))),
      wrapperData = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    streamWrapper.operatorStar().seek(0n);
    streamWrapper.operatorStar().readBytes(wrapperData, 3);
    const wrapperFields = wrapperData.getConstArray() as SequenceElements,
      wrapperOutput = own(streamWrapper.operatorStar().getOutputStream());
    streamWrapper.operatorStar().seek(0n);
    const unoAdapter = own(new SvInputStream(streamWrapper)),
      adapterBytes = new Uint8Array(3),
      adapterRead = unoAdapter.ReadBytes(adapterBytes, 3);
    const zipReader = own(new ByteGrabber(streamWrapper));
    zipReader.seek(0n);
    const zipU16 = zipReader.ReadUInt16(),
      zipLast = new Int8Array(1),
      zipCount = zipReader.readBytes(zipLast, 1);
    const nativeInflater = own(new InflateZlib(true)),
      compressedBytes = Uint8Array.of(203, 72, 205, 201, 201, 87, 200, 64, 144, 0),
      compressedSequence = own(
        new (Sequence.specialize<number>("sal_Int8", 1))(compressedBytes.length),
      ),
      compressedCells = compressedSequence.getArray() as SequenceElements,
      inflatedSequence = own(new (Sequence.specialize<number>("sal_Int8", 1))(32));
    for (let i = 0; i < compressedBytes.length; ++i)
      (compressedCells.get(i) as [number])[0] = ((compressedBytes[i] as number) << 24) >> 24;
    nativeInflater.setInput(compressedSequence);
    const inflatedCount = nativeInflater.doInflateSegment(inflatedSequence, 0, 32),
      inflatedCells = inflatedSequence.getConstArray() as SequenceElements;
    streamWrapper.operatorStar().seek(0n);
    const bufferedInput = own(new Reference(new XBufferedStream(streamWrapper))),
      bufferedReader = own(new ByteGrabber(bufferedInput));
    const mutexOwner = own(new RtlReference(new RefCountedMutex())),
      nativeMutex = mutexOwner.operatorStar().GetMutex(),
      mutexGuard = new MutexGuard(nativeMutex);
    const recursiveMutex = nativeMutex.tryToAcquire(),
      releasedMutex = nativeMutex.release();
    mutexGuard.dispose();
    const directoryBytes = Uint8Array.of(
        80,
        75,
        3,
        4,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        97,
        120,
        80,
        75,
        1,
        2,
        20,
        3,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        97,
        80,
        75,
        5,
        6,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        47,
        0,
        0,
        0,
        32,
        0,
        0,
        0,
        0,
        0,
      ),
      directoryMemory = own(
        new SvMemoryStream(directoryBytes, directoryBytes.length, StreamMode.READ),
      ),
      directoryInput = own(new Reference(new OStreamWrapper(directoryMemory))),
      nativeDirectory = own(
        new ZipFile(mutexOwner, directoryInput, context, true, false, Checks.CheckInsensitive),
      ),
      directoryEntry = nativeDirectory.GetEntryHash().find(own(unicode("a")));

    let fileRead = 0;
    const fileHandle = createFileHandleFromFD(file.fd),
      count: [bigint] = [0n],
      oslStatuses: number[] = [];
    try {
      oslStatuses.push(osl_writeFile(fileHandle, fileBytes, BigInt(fileBytes.length), count));
      oslStatuses.push(osl_syncFile(fileHandle));
      oslStatuses.push(osl_setFilePos(fileHandle, 1, 0n));
      oslStatuses.push(osl_readFile(fileHandle, readBytes, 3n, count));
      fileRead = Number(count[0]);
    } finally {
      oslStatuses.push(osl_closeFile(fileHandle));
      fileSystem.unlink(filePath);
    }
    const partBytes = Uint8Array.of(
        80,
        75,
        3,
        4,
        20,
        0,
        0,
        0,
        8,
        0,
        0,
        0,
        0,
        0,
        128,
        136,
        249,
        229,
        10,
        0,
        0,
        0,
        17,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        97,
        203,
        72,
        205,
        201,
        201,
        87,
        200,
        64,
        144,
        0,
        80,
        75,
        1,
        2,
        20,
        3,
        20,
        0,
        0,
        0,
        8,
        0,
        0,
        0,
        0,
        0,
        128,
        136,
        249,
        229,
        10,
        0,
        0,
        0,
        17,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        97,
        80,
        75,
        5,
        6,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        47,
        0,
        0,
        0,
        41,
        0,
        0,
        0,
        0,
        0,
      ),
      partMemory = own(new SvMemoryStream(partBytes, partBytes.length, StreamMode.READ)),
      partInput = own(new Reference(new OStreamWrapper(partMemory))),
      partZip = own(
        new ZipFile(mutexOwner, partInput, context, true, false, Checks.CheckInsensitive),
      ),
      partEntry = partZip.GetEntryHash().find(own(unicode("a")));
    if (!partEntry) throw new Error("Native ZIP probe entry missing");
    const partStream = own(
        partZip.getDataStream(partEntry, own(new RtlReference<never>()), null, mutexOwner),
      ),
      partReader = own(new ByteGrabber(partStream));
    const outputStream = own(new Reference(new ZipPackageBuffer())),
      outputZip = own(new ZipOutputStream(outputStream)),
      outputEntry = new ZipEntry(partEntry),
      sourceRaw = own(
        partZip.getRawData(partEntry, own(new RtlReference<never>()), null, mutexOwner, false),
      ),
      rawBuffer = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    ZipOutputStream.setEntry(outputEntry);
    outputZip.writeLOC(outputEntry);
    sourceRaw.operatorStar().readBytes(rawBuffer, 32768);
    outputZip.rawWrite(rawBuffer);
    outputZip.rawCloseEntry();
    outputZip.finish();
    const reopenedOutput = own(
        new ZipFile(mutexOwner, outputStream, context, true, false, Checks.CheckInsensitive),
      ),
      outputRecord = reopenedOutput.GetEntryHash().find(own(unicode("a")));
    if (!outputRecord) throw new Error("Native ZIP output entry missing");
    const outputData = own(
        reopenedOutput.getDataStream(
          outputRecord,
          own(new RtlReference<never>()),
          null,
          mutexOwner,
        ),
      ),
      outputReader = own(new ByteGrabber(outputData));
    const localeLanguage = Uint16Array.of(101, 110, 0),
      localeCountry = Uint16Array.of(85, 83, 0),
      localeVariant = Uint16Array.of(71, 66, 0),
      registeredLocale = rtl_locale_register(localeLanguage, localeCountry, localeVariant),
      collidedLocale = rtl_locale_register(localeLanguage, localeVariant, localeCountry);
    const nativeFileAccess = probeNativeFileAccess();
    const originalProcessLocale: [rtl_Locale | null] = [null];
    osl_getProcessLocale(originalProcessLocale);
    const utf8Locale = rtl_locale_register(
      localeLanguage,
      localeCountry,
      Uint16Array.of(46, 85, 84, 70, 45, 56, 0),
    );
    osl_setProcessLocale(utf8Locale);
    const nativeLocaleEncoding = osl_getTextEncodingFromLocale(null),
      originalThreadEncoding = osl_getThreadTextEncoding(),
      exchangedThreadEncoding = osl_setThreadTextEncoding(RTL_TEXTENCODING_MS_1251),
      selectedThreadEncoding = osl_getThreadTextEncoding();
    osl_setThreadTextEncoding(originalThreadEncoding);
    osl_setProcessLocale(originalProcessLocale[0]);
    let nativeBadDescriptor = 0;
    try {
      fileSystem.fstat(-1);
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("errno" in error) ||
        typeof error.errno !== "number"
      )
        throw error;
      nativeBadDescriptor = GetSvErrorErrno(error.errno).valueOf();
    }
    const seekableIdentity = own(OSeekableInputWrapper.CheckSeekableCanWrap(outputData, context)),
      deferredMemory = own(new SvMemoryStream(Uint8Array.of(9, 8, 7), 3, StreamMode.READ)),
      deferredOriginal = own(new Reference(new OInputStreamWrapper(deferredMemory))),
      deferredSeekable = own(new Reference(new OSeekableInputWrapper(deferredOriginal, context)));
    const copiedTempFile = deferredSeekable.operatorStar().available() === 3;
    let closedSeekable = false;
    deferredSeekable.operatorStar().closeInput();
    try {
      deferredSeekable.operatorStar().getLength();
    } catch (error) {
      if (!(error instanceof NotConnectedException)) throw error;
      closedSeekable = true;
      error.dispose();
    }
    const sharedSource = own(
        reopenedOutput.getDataStream(
          outputRecord,
          own(new RtlReference<never>()),
          null,
          mutexOwner,
        ),
      ),
      sharedA = own(new Reference(new WrapStreamForShare(sharedSource, mutexOwner))),
      sharedB = own(new Reference(new WrapStreamForShare(sharedSource, mutexOwner))),
      sharedReader = own(new ByteGrabber(sharedA)),
      sharedFirst = sharedReader.ReadUInt16();
    sharedB.operatorStar().readSomeBytes(rawBuffer, 1);
    const sharedSecond = ((rawBuffer.getConstArray() as SequenceElements).get(0) as [number])[0],
      sharedAvailable = sharedA.operatorStar().available(),
      sharedNext = sharedReader.ReadUInt16();
    sharedA.operatorStar().closeInput();
    sharedB.operatorStar().readBytes(rawBuffer, 1);
    const sharedAfterClose = (
      (rawBuffer.getConstArray() as SequenceElements).get(0) as [number]
    )[0];
    const packageRoot = own(new Reference(new ZipPackageFolder(context, 0, false))),
      packageChild = own(new Reference(new ZipPackageFolder(context, 0, false))),
      packageName = own(unicode("字")),
      packageAny = own(new Any(packageChild.getAddress(), "XInterface"));
    packageRoot.operatorStar().insertByName(packageName, packageAny);
    const packageParent = own(packageChild.operatorStar().getParent()),
      packageNames = own(packageRoot.operatorStar().getElementNames()),
      packageValue = own(packageRoot.operatorStar().getByName(packageName)),
      packageResult = own(new Reference<XInterface>());
    if (!packageValue.extract(packageResult.getAddress(), "XInterface"))
      throw new Error("Native folder Any extraction failed");
    packageChild.operatorStar().setName(own(unicode("renamed")));
    return {
      nativeDirectoryMetadata: probeNativeDirectoryMetadata(),
      nativeTempFile: probeNativeTempFile(),
      nativeFileUrlReverse: probeNativeFileUrlReverse(),
      nativeSecurity: probeNativeSecurity(),
      nativePackageFolderSave: probeNativePackageFolderSave(),
      nativeFileUrlEncoding: probeNativeFileUrlEncoding(),
      nativeFileAccess,
      nativeLocaleEncoding: {
        utf8: nativeLocaleEncoding === RTL_TEXTENCODING_UTF8,
        exchange: exchangedThreadEncoding === originalThreadEncoding,
        selected: selectedThreadEncoding === RTL_TEXTENCODING_MS_1251,
        restored: osl_getThreadTextEncoding() === originalThreadEncoding,
      },
      nativeLocale: {
        sameIdentity: rtl_locale_equals(registeredLocale, collidedLocale),
        sameHash: rtl_locale_hashCode(registeredLocale) === rtl_locale_hashCode(collidedLocale),
        country: String.fromCharCode(...collidedLocale.Country.buffer.subarray(0, 2)),
      },
      nativeFileErrors: {
        badDescriptor: nativeBadDescriptor,
        errnoDomain: GetSvErrorErrno(2).valueOf(),
        oslDomain: GetSvError(oslFileError.NOENT).valueOf(),
      },
      nativeSeekableInput: {
        identity: seekableIdentity.get() === outputData.get(),
        copiedTempFile,
        closed: closedSeekable,
      },
      nativeSharedStream: {
        first: sharedFirst,
        second: sharedSecond,
        available: sharedAvailable,
        next: sharedNext,
        afterClose: sharedAfterClose,
        position: sharedB.operatorStar().getPosition().toString(),
      },
      nativePackageFolder: {
        names: packageNames.getLength(),
        identity: packageResult.get() === packageChild.get(),
        parent: packageParent.get() === packageRoot.get(),
        detachedRename:
          !packageRoot.operatorStar().hasElements() &&
          !own(packageChild.operatorStar().getParent()).is(),
      },
      nativeZipAccess: probeNativeZipAccess(partBytes),
      nativeUcbFileStreams: probeNativeUcbFileStreams(partBytes),
      nativeUcbRegexp: probeNativeUcbRegexp(),
      nativeUcbCommands: probeNativeUcbCommands(),
      nativePersistenceStream: probeNativePersistenceStream(),
      nativeOfopXml: probeNativeOfopXml(),
      nativeFastTemp: probeNativeFastTemp(),
      nativeDeflater: probeNativeDeflater(),
      nativeZipOutputEntry: probeNativeZipOutputEntry(),
      nativeArchiveOutput: await probeNativeArchiveOutput(),
      nativeWriterParagraph: await probeNativeWriterParagraph(),
      nativeZipOutput: {
        length: outputStream.operatorStar().getLength().toString(),
        word: outputReader.ReadUInt16(),
        size: outputReader.getLength().toString(),
      },
      nativeZipEntryRead: {
        length: partReader.getLength().toString(),
        word: partReader.ReadUInt16(),
        position: partReader.getPosition().toString(),
      },
      nativeZipInflate: {
        count: inflatedCount,
        first: (inflatedCells.get(0) as [number])[0],
        last: (inflatedCells.get(16) as [number])[0],
        finished: nativeInflater.finished(),
        error: nativeInflater.getLastInflateError(),
      },
      nativeZipBuffered: {
        length: bufferedReader.getLength().toString(),
        word: bufferedReader.ReadUInt16(),
        position: bufferedReader.getPosition().toString(),
      },
      nativeZipDirectory: {
        count: nativeDirectory.GetEntryHash().size(),
        offset: directoryEntry?.nOffset.toString(),
        size: directoryEntry?.nSize.toString(),
        identity: nativeDirectory.entries().nextElement() === directoryEntry,
      },
      nativeZipMutex: {
        identity: mutexOwner.operatorStar().GetMutex() === nativeMutex,
        recursive: recursiveMutex,
        released: releasedMutex,
      },
      nativeZipByte: {
        u16: zipU16,
        count: zipCount,
        last: zipLast[0],
        position: zipReader.getPosition().toString(),
      },
      nativeUnoAdapter: { count: adapterRead, bytes: Array.from(adapterBytes) },
      nativeStreamWrapper: {
        identity: wrapperOutput.get() === streamWrapper.get(),
        bytes: [
          (wrapperFields.get(0) as [number])[0],
          (wrapperFields.get(1) as [number])[0],
          (wrapperFields.get(2) as [number])[0],
        ],
        length: streamWrapper.operatorStar().getLength().toString(),
      },
      nativeMemoryStream: {
        size: memoryStream.GetSize().toString(),
        position: memoryStream.Tell().toString(),
      },
      nativeFileSystem: { read: fileRead, bytes: Array.from(readBytes) },
      nativeOslFile: { statuses: oslStatuses },
      nativePersistence: {
        prefix: [
          (persistenceFields.get(0) as [number])[0],
          (persistenceFields.get(1) as [number])[0],
          (persistenceFields.get(2) as [number])[0],
        ],
        position: persistence.operatorStar().getPosition().toString(),
        identity: persistenceInput.get() === persistence.get(),
      },
      nativeStorage: {
        path: text(own(nativeGrandchild.getPath())),
        readOnly: nativeGrandchild.isReadOnly(),
        valid: nativeStorage.isStorage(),
        missingStream: own(nativeStorage.openInputStream(own(unicode("word/document.xml")))).is(),
      },
      nativeAttributes: {
        date: date && [
          date.Year,
          date.Month,
          date.Day,
          date.Hours,
          date.Minutes,
          date.Seconds,
          date.NanoSeconds,
          date.IsUTC,
        ],
        tokens: attributes.getTokenList(2),
        trueToken: getTokenFromUtf8("true"),
        falseToken: getTokenFromUtf8("false"),
      },
      nativeRelationships: {
        count: parsedRelations.operatorStar().size(),
        target: text(parsedTarget),
        external: text(externalTarget),
        part: text(relationsFragment.operatorStar().getFragmentPath()),
      },
      nativeContext: {
        fragment: text(child.operatorStar().getFragmentPath()),
        target: text(resolved),
        sharedRelations: child.operatorStar().getRelations() === nativeRelations.get(),
        filterIdentity: child.operatorStar().getFilter() === filter,
      },
      ooxXml: new TextDecoder().decode(ooxOutput),
      legacyXml: new TextDecoder().decode(legacyOutput),
      xml: new TextDecoder().decode(output),
      completed: true,
      owner: probeNativeFastParserOwner(),
    };
  } finally {
    while (owners.length !== 0) (owners.pop() as { dispose(): void }).dispose();
  }
}

/** Exercises actual parser-stack/locator owners with genuine C context and explicit public source namespace aggregates. This direct owner/locator inspection is independent of the complete parseStream call above. @returns Scalar realm observations. */
function probeNativeFastParserOwner() {
  const parser = new FastSaxParserImpl(),
    data = new ParserData(),
    input = new InputSource(),
    xml = new TextEncoder().encode("<root>\n<child/>"),
    stream = new Reference(new MemoryInputStream(xml, xml.length)),
    publicId = unicode("public😀"),
    systemId = unicode("package:/字.xml"),
    prefixBytes = new TextEncoder().encode("p"),
    prefix = new OString(prefixBytes, prefixBytes.length),
    uri = unicode("urn:owner"),
    prefixView = unicode("p"),
    locator = new RtlReference(new FastLocatorImpl(parser)),
    m = getLibXml2(),
    context = m._xmlCreatePushParserCtxt(0, 0, 0, 0, 0);
  try {
    input.aInputStream.assign(stream);
    input.sPublicId.assign(publicId);
    input.sSystemId.assign(systemId);
    parser.pushEntity(data, input);
    const entity = parser.getEntity();
    entity.mpParser = context;
    entity.maNamespaceDefines.push(new NamespaceDefine(prefix, DONTKNOW, uri));
    entity.maNamespaceCount.push(1);
    withXmlBytes(
      xml,
      /** Actual default C parser call. @param bytes - Native bytes. @param count - Native length. @returns Status. */ (
        bytes,
        count,
      ) => m._xmlParseChunk(context, bytes, count, 0),
    );
    const observedPublicId = locator.operatorArrow().getPublicId(),
      observedSystemId = locator.operatorArrow().getSystemId();
    try {
      const namespace = parser.getNamespaceURL(
        prefixView.getStr().subarray(0, prefixView.getLength()),
      );
      const result = {
        publicId: text(observedPublicId),
        systemId: text(observedSystemId),
        line: locator.operatorArrow().getLineNumber(),
        columnPositive: locator.operatorArrow().getColumnNumber() > 1,
        namespace: text(namespace),
        borrowedNamespace: namespace === entity.maNamespaceDefines[0]?.maNamespaceURL,
      };
      const alias = unicode("http://www.w3.org/not-a-year/xforms");
      try {
        NormalizeURI(alias);
        withXmlBytes(
          new TextEncoder().encode("</wrong>"),
          /** Genuine native mismatched-tag input. @param bytes - Native pointer. @param count - Native count. @returns C status. */ (
            bytes,
            count,
          ) => m._xmlParseChunk(context, bytes, count, 1),
        );
        try {
          entity.throwException(locator, true);
        } catch (error) {
          if (!(error instanceof SAXParseException)) throw error;
          try {
            return {
              ...result,
              normalizedAlias: text(alias),
              failure: {
                nativeException: true,
                line: error.LineNumber,
                systemId: text(error.SystemId),
                wrapped: error.WrappedException.hasValue(),
                hasSourcePrefix: text(error.Message).startsWith("[package:/字.xml line 2]: "),
              },
            };
          } finally {
            error.dispose();
          }
        }
      } finally {
        alias.dispose();
      }
      throw new Error("Expected native SAXParseException");
    } finally {
      observedSystemId.dispose();
      observedPublicId.dispose();
    }
  } finally {
    const document = m._office_parser_doc_get(context);
    if (document !== 0) m._xmlFreeDoc(document);
    m._xmlFreeParserCtxt(context);
    locator.operatorArrow().dispose();
    locator.dispose();
    prefixView.dispose();
    uri.dispose();
    prefix.dispose();
    systemId.dispose();
    publicId.dispose();
    stream.dispose();
    input.dispose();
    data.dispose();
    parser.dispose();
  }
}
