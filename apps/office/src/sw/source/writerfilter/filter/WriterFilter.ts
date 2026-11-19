/** @fileoverview WriterFilter's DOCX package, resource mapper and destination graph orchestration. */
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { OOXMLDocument } from "../ooxml/OOXMLDocumentImpl";
import { OOXMLStreamImpl } from "../ooxml/OOXMLStreamImpl";

/** Loads WordprocessingML into a separate Writer document graph. @param bytes - Complete OOXML package. @param options - Destination document defaults. @returns Owned imported graph. */
export async function importOOXML(bytes: Uint8Array, options: SwDocOptions): Promise<SwDoc> {
  const storage = await ZipStorage.openForImport(bytes, "writer");
  try {
    const stream = await OOXMLStreamImpl.createStream(getProcessComponentContext(), storage);
    try {
      return await importDocument(stream, options);
    } finally {
      stream.dispose();
    }
  } finally {
    storage.dispose();
  }
}

/** Resolves the source document into the isolated destination graph. @param stream - Actual package root stream. @param options - Destination defaults. @returns Imported graph. */
async function importDocument(stream: OOXMLStreamImpl, options: SwDocOptions): Promise<SwDoc> {
  const graph = new SwDoc(options);
  let imported = false;
  try {
    const model = new SwXTextDocument(graph);
    try {
      const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
      const document = new OOXMLDocument(stream, null);
      try {
        await document.resolve(
          mapper,
          /** Attaches the native theme before style and body import. @param theme - Parsed DrawingML theme. @returns Nothing. */
          (theme) => {
            graph.theme = theme;
          },
        );
        mapper.finishDocument();
        graph.themeFontLanguages ??= {};
        imported = true;
        return graph;
      } finally {
        document.dispose();
        mapper.dispose();
      }
    } finally {
      model.dispose();
    }
  } finally {
    if (!imported) graph.Dispose();
  }
}
