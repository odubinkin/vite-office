/** @fileoverview WriterFilter's DOCX package, resource mapper and destination graph orchestration. */
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";
import {
  WrongFormatException,
  getCppuType as wrongFormatType,
} from "../../../../cppu/inc/com/sun/star/io/WrongFormatException";
import { WrappedTargetRuntimeException } from "../../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import {
  SAXException,
  cppu_detail_getUnoType as saxType,
} from "../../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import {
  SAXParseException,
  cppu_detail_getUnoType as saxParseType,
} from "../../../../cppu/inc/com/sun/star/xml/sax/SAXParseException";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FastSaxParseError } from "../../../../sax/source/fastparser/fastparser";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { OOXMLDocument } from "../ooxml/OOXMLDocumentImpl";
import { OOXMLStreamImpl } from "../ooxml/OOXMLStreamImpl";

/** Extracts the native wrapped exception in subtype order. @param error - Actual SAX exception. @returns Nested source message or empty text. */
function lcl_GetExceptionMessageRec(error: SAXException): string {
  const candidates = [
    [new SAXParseException(), saxParseType],
    [new SAXException(), saxType],
    [new Exception(), "Exception"],
  ] as const;
  try {
    for (const [value, type] of candidates) {
      if (error.WrappedException.extract(value, type)) return lcl_GetExceptionMessage(value);
    }
    return "";
  } finally {
    for (const [value] of candidates) value.dispose();
  }
}

/** Recovers original nested SAX and UNO messages from the parser transport. @param error - Exception at this depth. @returns Original diagnostic text. */
function lcl_GetExceptionMessage(error: unknown): string {
  if (error instanceof FastSaxParseError) {
    const nested = lcl_GetExceptionMessage(error.WrappedException);
    return `${nested}\nSAXParseException: '${error.Message}', Stream '${error.SystemId}', Line ${error.LineNumber}, Column ${error.ColumnNumber}`;
  }
  if (error instanceof SAXParseException) {
    const nested = lcl_GetExceptionMessageRec(error);
    return `${nested}\nSAXParseException: '${text(error.Message)}', Stream '${text(error.SystemId)}', Line ${error.LineNumber}, Column ${error.ColumnNumber}`;
  }
  if (error instanceof SAXException)
    return `${lcl_GetExceptionMessageRec(error)}\nSAXParseException: "${text(error.Message)}"`;
  if (error instanceof Exception) return text(error.Message);
  return error instanceof Error ? error.message : "";
}

/** Throws the native WriterFilter wrong-format failure for the object shell to classify. @param error - Parse failure. @returns Never. */
export function ThrowWrongFormat(error: unknown): never {
  if (!(error instanceof FastSaxParseError || error instanceof SAXException)) throw error;
  const message = unicode(lcl_GetExceptionMessage(error));
  const context = new Reference();
  const empty = new OUString();
  const detail = new WrongFormatException(message, context);
  const target = new Any(detail, wrongFormatType());
  try {
    throw new WrappedTargetRuntimeException(empty, context, target);
  } finally {
    target.dispose();
    detail.dispose();
    empty.dispose();
    context.dispose();
    message.dispose();
    if (error instanceof SAXException) error.dispose();
  }
}

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
        await document
          .resolve(
            mapper,
            /** Attaches the native theme before style and body import. @param theme - Parsed DrawingML theme. @returns Nothing. */
            (theme) => {
              graph.theme = theme;
            },
          )
          .catch(ThrowWrongFormat);
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
