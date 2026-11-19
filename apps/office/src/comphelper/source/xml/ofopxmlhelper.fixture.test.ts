/** @fileoverview Reads pinned Strict/Transitional DOCX/XLSX metadata through registered native ZipFileAccess and the original OFOPXML handler. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { observePairRows } from "../../../test/ofopxml-values";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeZlib } from "../../../external/zlib/zlib";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XZipFileAccess2 } from "../../../offapi/com/sun/star/packages/zip/XZipFileAccess2";
import { SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import { OSeekableInputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { ReadRelationsInfoSequence, ReadContentTypeSequence } from "./ofopxmlhelper";
beforeAll(
  /** Uses actual production runtime, codecs and registry. @returns Initialization completion. */ async () => {
    await initializeRuntime();
    await initializeExceptionAbi();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Opens a pinned archive through the actual registered source factory and native initialization arguments. @param file - Pinned fixture path. @returns Acquired native ZIP access. */
function archive(file: string): Reference<XZipFileAccess2> {
  const data = new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", file))),
    memory = own(new SvMemoryStream(data, data.length, StreamMode.READ)),
    input = own(new Reference<XInputStream>(new OSeekableInputStreamWrapper(memory))),
    argument = own(new Any(input.getAddress(), ["Reference", XInputStream.static_type])),
    arguments_ = own(new (Sequence.specialize<Any>("Any", 24))(1));
  Any.prototype.assign.call(arguments_.operatorIndex(0), argument);
  const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
    manager = own(context.operatorStar().getServiceManager()),
    instance = own(
      manager
        .operatorStar()
        .createInstanceWithArgumentsAndContext(
          u("com.sun.star.packages.zip.ZipFileAccess"),
          arguments_,
          context,
        ),
    );
  return own(
    new Reference<XZipFileAccess2>(instance, UNO_QUERY_THROW, XZipFileAccess2.static_type),
  );
}
/** Extracts a genuine native entry stream for the registered SAX parser. @param zip - Actual source service. @param path - Original package part name. @returns Owned input reference. */
function part(zip: Reference<XZipFileAccess2>, path: string): Reference<XInputStream> {
  const value = own(zip.operatorStar().getByName(u(path))),
    input = own(new Reference<XInputStream>());
  expect(value.extract(input.getAddress(), ["Reference", XInputStream.static_type])).toBe(true);
  return input;
}
it.each([
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word/document.xml", false],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml", true],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl/workbook.xml", false],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml", true],
] as const)(
  "reads original package metadata from upstream%s",
  /** Both archive and schema owners are production implementations, not fixture providers. @param file - Pinned archive. @param main - Expected main document part. @param strict - Original relationship namespace family. @returns Nothing. */ (
    file,
    main,
    strict,
  ) => {
    const zip = archive(file),
      context = own(new Reference<XComponentContext>(getProcessComponentContext())),
      relationships = own(
        ReadRelationsInfoSequence(part(zip, "_rels/.rels"), u("_rels/.rels").subView(0), context),
      ),
      relations = observePairRows(relationships),
      types = own(ReadContentTypeSequence(part(zip, "[Content_Types].xml"), context)),
      content = observePairRows(types),
      relation = relations.find(
        /** Identifies the original main-part relationship. @param row - Native observed row. @returns Whether main-part relation. */ (
          row,
        ) =>
          row.some(
            /** Checks the published relationship type suffix. @param pair - Native observed field. @returns Whether officeDocument type. */ (
              pair,
            ) => pair.First === "Type" && pair.Second.endsWith("/officeDocument"),
          ),
      );
    expect(relation).toBeDefined();
    expect(relation).toContainEqual({ First: "Target", Second: main });
    expect(relation).toContainEqual({
      First: "Type",
      Second: strict
        ? "http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument"
        : "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    });
    expect(content).toHaveLength(2);
    const override = content[1]?.find(
      /** Observes the source main-part override without changing extension-first MIME lookup. @param pair - Native observed content-type pair. @returns Whether the expected part. */ (
        pair,
      ) => pair.First === "/" + main,
    );
    expect(override?.Second).toBe(
      main.startsWith("word/")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    );
  },
);
