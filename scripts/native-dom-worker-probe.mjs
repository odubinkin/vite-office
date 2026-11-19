/** @fileoverview Qualifies actual native UNO document/parser/IO/event-list behavior in a Chromium module Worker with no DOM globals, and in the browser main realm. */
import { build } from "vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import assert from "node:assert/strict";

const built = await build({
  configFile: false,
  logLevel: "error",
  build: {
    write: false,
    minify: false,
    lib: {
      entry: resolve("scripts/fixtures/native-dom-worker-probe.ts"),
      name: "NativeDomProbe",
      formats: ["iife"],
    },
  },
});
const outputs = Array.isArray(built)
  ? built.flatMap(
      /** Collects actual bundle chunks. @param output - Build result. @returns Chunks. */ (
        output,
      ) => output.output,
    )
  : built.output;
const code = outputs.find(
  /** Selects the real emitted entry chunk. @param chunk - Build chunk. @returns Entry predicate. */ (
    chunk,
  ) => chunk.type === "chunk",
).code;
const server = createServer(
  /** Supplies the same-origin fixture only. @param request - Request. @param response - Response. @returns Nothing. */ (
    request,
    response,
  ) => {
    void request;
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<!doctype html><title>Native DOM worker qualification</title>");
  },
);
await new Promise(
  /** Binds only the loopback fixture origin. @param resolve - Listening callback. @param reject - Failure callback. @returns Nothing. */ (
    resolve,
    reject,
  ) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  },
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const workerResult = await page.evaluate(
    /** Runs the actual bundled graph in a genuine module Worker. @param code - Emitted source. @returns Worker result. */ (
      code,
    ) =>
      new Promise(
        /** Waits for the structured-clone-only result. @param resolve - Result callback. @param reject - Failure callback. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const program =
              code +
              "\nNativeDomProbe.runNativeDomWorkerProbe().then(value => postMessage({ok:true,value}), error => postMessage({ok:false,message:String(error),stack:error?.stack}));",
            url = URL.createObjectURL(new Blob([program], { type: "text/javascript" })),
            worker = new Worker(url, { type: "module" });
          /** Releases the actual Worker and object URL. @returns Nothing. */
          function close() {
            worker.terminate();
            URL.revokeObjectURL(url);
          }
          const timer = setTimeout(
            /** Reports a real fixture deadline. @returns Nothing. */ () => {
              close();
              reject(new Error("Native DOM worker timed out"));
            },
            20000,
          );
          worker.onmessage =
            /** Receives only public scalar observations. @param event - Native message. @returns Nothing. */ (
              event,
            ) => {
              clearTimeout(timer);
              close();
              if (event.data.ok) resolve(event.data.value);
              else reject(new Error(event.data.message + "\n" + event.data.stack));
            };
          worker.onerror =
            /** Propagates actual Worker errors. @param event - Native error. @returns Nothing. */ (
              event,
            ) => {
              clearTimeout(timer);
              close();
              reject(new Error(event.message));
            };
        },
      ),
    code,
  );
  const expected = {
    conversion: {
      serviceValue: 42,
      rowValue: 42,
      rowWasNull: false,
      failedFirst: 0,
      failedFirstWasNull: false,
      failedSecond: 0,
      failedSecondWasNull: true,
    },
    nativeFastParserConsumer: {
      nativeFileUrlEncoding: {
        url: "file:///a%20%C3%A9/%FF",
        bytes: [47, 97, 32, 195, 169, 47, 255],
        decoded: true,
      },
      nativeTempFile: {
        bytes: [7, 8, 9],
        deleted: true,
        directoryFound: true,
        directoryDeleted: true,
        copyLength: 96017,
        copyBytes: [122, 123, 124, 125, 126],
      },
      nativeDirectoryMetadata: {
        fileStreamBytes: [7, 2, 3],
        copiedBytes: [1, 2, 3],
        copiedLink: "/tmp/native-stat-probe é",
        copyRemoved: true,
        name: "native-stat-probe é",
        size: 3,
        type: 2,
        link: true,
        target: "file:///tmp/native-stat-probe%20%C3%A9",
        same: true,
        staleSize: 3,
        staleValid: false,
      },
      nativeFileUrlReverse: {
        openedBytes: [7, 8, 9],
        hostname: "emscripten",
        path: "/é/a b",
        bytes: [47, 255],
        rejected: true,
        preserved: true,
      },
      nativeSecurity: {
        current: true,
        home: true,
        nonempty: true,
        rejectedNull: true,
        unchanged: true,
        homeURL: true,
        pathURL: "file:///tmp/%C3%A9/a%20b",
      },
      nativePackageFolderSave: { entries: 1, stored: true, empty: true },
      nativeFileAccess: { created: true, read: true, denied: true },
      nativeLocaleEncoding: { utf8: true, exchange: true, selected: true, restored: true },
      nativeLocale: { sameIdentity: 1, sameHash: true, country: "US" },
      nativeFileErrors: { badDescriptor: 525, errnoDomain: 1287, oslDomain: 770 },
      nativeSeekableInput: { identity: true, copiedTempFile: true, closed: true },
      nativeSharedStream: {
        first: 25960,
        second: 104,
        available: 16,
        next: 27756,
        afterClose: 101,
        position: "2",
      },
      nativePackageFolder: { names: 1, identity: true, parent: true, detachedRename: true },
      nativeZipAccess: {
        names: 1,
        length: 17,
        first: [104, 101],
        patternFirst: [104, 101],
        disposed: true,
      },
      nativeUcbCommands: {
        filterState: { duplicateBlocked: true, reopened: true, defaults: true, context: true },
        mediumData: { componentData: true, mediumArgs: true, defaults: true },
        identifier: "relative.xlsx",
        scheme: "file",
        names: ["getCommandInfo", "globalTransfer", "checkin"],
        handles: [1024, 1025, 1026],
        legacyTransfer: true,
        extendedTransport: true,
      },
      nativePersistenceStream: {
        copiedLength: 64001,
        switchedPosition: 31999,
        sequence: [255, 0, 1, 2],
        raw: [3, 4, 5, 6],
        tail: [254, 255, 0],
        disconnected: true,
        originalPosition: 31999,
      },
      nativeOfopXml: {
        relations: 2,
        first: [
          ["Id", "rId1"],
          ["Type", "t"],
          ["Target", "字😀.xml"],
          ["TargetMode", "External"],
        ],
        documentType: "application/writer+xml",
        defaultType: "application/rels",
      },
      nativeWriterParagraph: {
        escapement: true,
        styleIds: true,
        sectionNumbering: true,
        listOverride: true,
        characterProperties: true,
        split: true,
        widows: 2,
        nativeItems: true,
        sourceXml: true,
        nativeByte: true,
      },
      nativeArchiveOutput: {
        packageStream: true,
        packageSave: true,
        noWorkerPool: true,
        zipTask: true,
        mediaDescriptor: true,
        storageImpl: true,
        packageMetadata: true,
        packageCommitState: true,
        packageMember: true,
        coreVersion: 20,
        coreFlags: 2048,
        stored: true,
        content: true,
        contentTypes: true,
        reopened: true,
      },
      nativeZipOutputEntry: {
        length: 65537,
        compressedSize: true,
        crc: true,
        content: true,
        inputOpen: true,
        sameEntry: true,
        nullParent: true,
        encrypted: false,
        nativeReopened: true,
      },
      nativeDeflater: { sizes: [64001, 64001], reset: true, content: true },
      nativeFastTemp: {
        uuid: true,
        created: true,
        length: 64001,
        position: 31999,
        first: [-1, 0],
        changed: 99,
        removed: true,
        sourcePosition: 64001,
      },
      nativeUcbRegexp: {
        size: 4,
        file: true,
        domain: true,
        defaultMatch: true,
        defaultFirst: true,
        equalityCollision: true,
      },
      nativeUcbFileStreams: {
        zip: { names: 1, length: 17, first: [104, 101], patternFirst: [104, 101], disposed: true },
        reopenedSize: 110,
        disconnectedPosition: true,
        readByte: 123,
        truncatedLength: 1,
      },
      nativeZipOutput: { length: "110", word: 25960, size: "17" },
      nativeZipEntryRead: { length: "17", word: 25960, position: "2" },
      nativeZipInflate: { count: 17, first: 104, last: 111, finished: true, error: 0 },
      nativeZipBuffered: { length: "3", word: 513, position: "2" },
      nativeZipDirectory: { count: 1, offset: "31", size: "1", identity: true },
      nativeZipMutex: { identity: true, recursive: true, released: true },
      nativeZipByte: { u16: 513, count: 1, last: 3, position: "3" },
      nativeUnoAdapter: { count: 3, bytes: [1, 2, 3] },
      nativeStreamWrapper: { identity: true, bytes: [1, 2, 3], length: "3" },
      nativeMemoryStream: { size: "3", position: "3" },
      nativeFileSystem: { read: 3, bytes: [1, 2, 3] },
      nativeOslFile: { statuses: [0, 0, 0, 0, 0] },
      nativePersistence: { prefix: [60, 119, 58], position: "3", identity: true },
      nativeStorage: { path: "word/字😀", readOnly: true, valid: false, missingStream: false },
      nativeAttributes: {
        date: [2024, 2, 29, 1, 2, 3, 0, false],
        tokens: [-1, 5614, -1, 2266, -1],
        trueToken: 5614,
        falseToken: 2266,
      },
      nativeRelationships: {
        count: 2,
        target: "word/字😀.xml",
        external: "https://example.test",
        part: "word/_rels/document.xml.rels",
      },
      nativeContext: {
        fragment: "word/document.xml",
        target: "word/字😀.xml",
        sharedRelations: true,
        filterIdentity: true,
      },
      ooxXml: '<?xml version="1.0" encoding="UTF-8"?>\n<document>字😀</document>',
      legacyXml:
        '<?xml version="1.0" encoding="UTF-8"?>\n<zz xmlns:p="urn:legacy"><p:child>字😀&amp;</p:child></zz>',
      xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root xmlns:p="urn:probe"><p>字&amp;😀</p></root>',
      completed: true,
      owner: {
        publicId: "public😀",
        systemId: "package:/字.xml",
        line: 2,
        columnPositive: true,
        namespace: "urn:owner",
        borrowedNamespace: true,
        normalizedAlias: "http://www.w3.org/2002/xforms",
        failure: {
          nativeException: true,
          line: 2,
          systemId: "package:/字.xml",
          wrapped: false,
          hasSourcePrefix: true,
        },
      },
    },
    nativeXlsxString: {
      length: 7,
      copy: true,
      header: true,
      text: true,
      preserve: true,
      partRouting: true,
      fontData: true,
      fontExtraction: true,
      fontItems: true,
      recordList: true,
      paletteValues: true,
    },
    nativeCalcAttributes: {
      r1c1: true,
      services: true,
      models: true,
      moved: true,
      value: 42,
      latin: true,
      merged: true,
    },
    nativeFastParser: {
      starts: [
        ["root", "p", "urn:push"],
        ["child", "p", "urn:push"],
      ],
      values: ["Ω"],
      declarations: [1, 0],
      instructions: [["keep", "native"]],
      characters: "字&😀",
      ends: 2,
      allChunksOk: true,
      line: 1,
    },
    nativeAttributes: {
      cloneToken: true,
      sourceCleared: true,
      names: ["urn:Ω", "p:字", "A\0B"],
      known: [2, "Ω\0é"],
      prefixBoolean: false,
      unknownCount: 1,
    },
    nativeTokenService: {
      sharedBeforeWrite: true,
      detachedAfterWrite: true,
      roundTrip: true,
      mutatedLookup: -1,
      cachedLookup: true,
      xml: "<document/>",
    },
    writerPackage: {
      rootTarget: "word/document.xml",
      childTarget: "styles.xml",
      byId: "styles.xml",
      rootText:
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Привет</w:t></w:r></w:p></w:body></w:document>',
      childText:
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>',
    },
    nativeUriFactory: {
      packageUri: "vnd.sun.star.pkg://file:%2F%2F%2Fstyles.xml",
      expandPath: "/",
      rejectedExpand: false,
      scriptUri: "vnd.sun.star.script:Hello?a=%C3%A4%26value",
      scriptParameter: "ä&value",
      absolute: "file:///styles.xml",
      relative: "../styles.xml",
      fragmentRemoved: "file:///a%23b.xlsx",
      invalidFragmentPreserved: "vnd.sun.star.script:#fragment",
      rtlAbsolute: "file:///styles.xml",
      rtlEncoded: "a%20b%2F%C3%A4",
      rtlDecoded: "\u028a",
    },
    metadataServices: {
      emptyDocument: true,
      baseURI: "file:///metadata-base",
      relativePath: "nested/document",
      streamName: "meta.xml",
    },
    metadataIngestion: ["Dies ist ein wichtiger Hinweis", "Kann Spuren von Nüssen enthalten"],
    metadataValues: {
      values: ["2024-02-29+05:30", "2024-02-29T03:04:05.000000009-01:30", "-P1DT2H3M4.000000005S"],
      types: ["date", "date", "time"],
    },
    nativeSaxWriterBuffer: {
      valid: true,
      xml:
        '<?xml version="1.0" encoding="UTF-8"?>\n<r a="&amp;&#x0a;">' +
        "x".repeat(1020) +
        "字😀&beta;</r>",
    },
    registeredSaxWriter: {
      xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>worker SAX字</root>',
      sameIdentity: true,
    },
    packageSaxWriters: {
      manifest:
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0">\n <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text" manifest:version="1.3"/>\n <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>\n</manifest:manifest>',
      relationships:
        '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="worker字" Target="word/document.xml?a=1&amp;b=2"/>\n</Relationships>',
    },
    nativeSax: {
      calls: ["begin", "start:root:0", "text:worker SAX字", "end", "finish"],
      sameIdentity: true,
    },
    registeredPropertyBag: {
      value: 42,
      count: 1,
      modified: true,
      directState: 0,
      sameIdentity: true,
    },
    nativePropertyControl: {
      value: 42,
      storedLong: true,
      notifications: 1,
      notifiedTypeLong: false,
      notifiedValue: 42,
      notifiedOld: 41,
      sameSource: true,
      state: 0,
      initialStates: [1, 0],
      typeCount: 7,
    },
    nativeAnyFields: { value: 43, initialDefault: 41, liveType: true, interfaceIdentity: true },
    legacyListeners: { remaining: 1, sameFirst: true, sameSnapshot: true, keyCount: 1, key: -7 },
    propertyArray: {
      count: 1,
      handle: 7,
      missing: -1,
      snapshotName: "workerValue",
      sameInfoIdentity: true,
    },
    dynamicProperties: {
      changed: true,
      value: 42,
      initialDefault: 41,
      name: "workerValue",
      handle: 7,
      declaredLong: true,
      stableTypeField: true,
    },
    publicHelpers: { notifications: 1, sameEventSource: true, componentTypeCount: 3 },
    xpath: { count: 1, listLength: 1, sameRoot: true },
    documentBuilder: {
      rootName: "document-content",
      streamOpen: true,
      namespaceAware: true,
      validating: false,
      emptyImplementation: true,
      capturedType: true,
      sameContext: true,
      exceptionMessage: "worker exception",
    },
    globals: { window: "undefined", document: "undefined", DOMParser: "undefined" },
    rootName: "document-content",
    attribute: "1.0",
    listCounts: [0, 1, 0],
    sameOwner: true,
    unicode: "😀字",
    utf16Length: 3,
    borrowedStreamOpen: true,
    warnings: 1,
    errors: 0,
    warningLine: 1,
  };
  assert.deepEqual(workerResult, expected);
  await page.addScriptTag({ content: code });
  const mainResult = await page.evaluate(
    /** Repeats the genuine native graph in the browser main realm. @returns Native observations. */ () =>
      globalThis.NativeDomProbe.runNativeDomWorkerProbe(),
  );
  assert.deepEqual(mainResult, {
    ...expected,
    globals: { window: "object", document: "object", DOMParser: "function" },
  });
  await writeFile(
    "apps/office/coverage/native-dom-worker-result.json",
    JSON.stringify({ workerResult, mainResult }, null, 2) + "\n",
  );
  console.info(
    "PASS: native dynamic properties and Type field transport, public comphelper lifecycle, registered XPathAPI/DocumentBuilder and JavaScript UNO exception ABI, registered Converter/PropertyValueSet, actual UNO DOM, C SAX callbacks, typed parser diagnostics, native stream IO, live mutation lists and Unicode in Chromium main realm and DOM-free module Worker",
  );
} finally {
  await browser.close();
  await new Promise(
    /** Releases the fixture origin. @param resolve - Close callback. @returns Nothing. */ (
      resolve,
    ) => server.close(resolve),
  );
}
