/** @fileoverview Original SfxDocumentMetaData.cxx storage/medium method bodies on the actual receiver. Source storage/version/parser/media dependencies remain under implementation; the metadata component is not registered while these dependencies are incomplete. */
import * as MediaDescriptor from "../../../unotools/inc/mediadescriptor";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ErrorCodeIOException } from "../../../offapi/com/sun/star/task/ErrorCodeIOException";
import { WrongFormatException } from "../../../cppu/inc/com/sun/star/io/WrongFormatException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XImporter } from "../../../offapi/com/sun/star/document/XImporter";
import { XExporter } from "../../../offapi/com/sun/star/document/XExporter";
import { XFilter } from "../../../offapi/com/sun/star/document/XFilter";
import { XFastParser } from "../../../offapi/com/sun/star/xml/sax/XFastParser";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { XWriter } from "../../../offapi/com/sun/star/xml/sax/XWriter";
import { Parser } from "../../../offapi/com/sun/star/xml/sax/Parser";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { SotStorage } from "../../../sot/source/sdstor/storage";
import { SOFFICE_FILEFORMAT_60 } from "../../../comphelper/inc/fileformat.h";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { ERRCODE_IO_GENERAL, ErrCodeMsg } from "../../../comphelper/inc/errcode";
import { SfxMedium } from "./docfile";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxDocumentMetaData, literal } from "./SfxDocumentMetaData";
const Args = Sequence.specialize<Any>("Any", 24),
  Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Original storage input and source importer/parser orchestration. @param this - Original document metadata receiver. @param storage - Actual native storage. @param medium - Actual descriptor sequence. @returns Nothing. */
export function loadFromStorage(
  this: SfxDocumentMetaData,
  storage: Reference<XStorage>,
  medium: Readonly<Sequence<PropertyValue>>,
): void {
  if (!storage.is()) this.illegal("SfxDocumentMetaData::loadFromStorage: argument is null");
  const name = literal("meta.xml"),
    stream = storage.operatorStar().openStreamElement(name, 1);
  name.dispose();
  try {
    if (!stream.is()) throw new RuntimeException();
    const input = stream.operatorStar().getInputStream();
    try {
      if (!input.is()) throw new RuntimeException();
      const manager = this.m_xContext.operatorStar().getServiceManager(),
        source = new InputSource(),
        properties = this.getURLProperties(medium);
      source.aInputStream = input;
      try {
        const version = SotStorage.GetVersion(storage),
          oasis = version > SOFFICE_FILEFORMAT_60 || version === 0,
          service = literal(
            oasis
              ? "com.sun.star.document.XMLOasisMetaImporter"
              : "com.sun.star.document.XMLMetaImporter",
          );
        try {
          try {
            const base = literal("BaseURI"),
              value = properties.operatorStar().getPropertyValue(base);
            base.dispose();
            try {
              Any.prototype.extract.call(value, source.sSystemId, "OUString");
              const suffix = literal("/meta.xml");
              try {
                source.sSystemId.append(suffix);
              } finally {
                suffix.dispose();
              }
            } finally {
              value.dispose();
            }
          } catch (error) {
            if (!(error instanceof Exception)) throw error;
            error.dispose();
            const meta = literal("meta.xml");
            try {
              source.sSystemId = meta;
            } finally {
              meta.dispose();
            }
          }
          const arg = new Any(properties.getAddress(), ["Reference", XPropertySet.static_type]),
            args = new Args(
              {
                /** Exposes the initialization argument to the sequence constructor. @returns Borrowed sequence value. */ get() {
                  return arg;
                },
              },
              1,
            );
          try {
            const filter = manager
              .operatorStar()
              .createInstanceWithArgumentsAndContext(service, args, this.m_xContext);
            try {
              const fast = new Reference<XFastParser>(filter, UNO_QUERY, XFastParser.static_type),
                importer = new Reference<XImporter>(filter, UNO_QUERY_THROW, XImporter.static_type),
                self = new Reference<XComponent>(this);
              try {
                importer.operatorStar().setTargetDocument(self);
                try {
                  if (fast.is()) fast.operatorStar().parseStream(source);
                  else {
                    const handler = new Reference<XDocumentHandler>(
                        filter,
                        UNO_QUERY_THROW,
                        XDocumentHandler.static_type,
                      ),
                      parser = Parser.create(this.m_xContext);
                    try {
                      parser.operatorStar().setDocumentHandler(handler);
                      parser.operatorStar().parseStream(source);
                    } finally {
                      parser.dispose();
                      handler.dispose();
                    }
                  }
                } catch (error) {
                  if (!(error instanceof SAXException)) throw error;
                  error.dispose();
                  const message = literal(
                      "SfxDocumentMetaData::loadFromStorage: XML parsing exception",
                    ),
                    root = new Reference<XInterface>(this);
                  try {
                    throw new WrongFormatException(message, root);
                  } finally {
                    root.dispose();
                    message.dispose();
                  }
                }
                this.checkInit();
              } finally {
                self.dispose();
                importer.dispose();
                fast.dispose();
              }
            } finally {
              filter.dispose();
            }
          } finally {
            args.dispose();
            arg.dispose();
          }
        } finally {
          service.dispose();
        }
      } finally {
        properties.dispose();
        source.dispose();
        manager.dispose();
      }
    } finally {
      input.dispose();
    }
  } finally {
    stream.dispose();
  }
}
/** Original storage output, source metadata exporter and optional transaction. @param this - Original document metadata receiver. @param storage - Actual native storage. @param medium - Actual descriptor. @returns Nothing. */
export function storeToStorage(
  this: SfxDocumentMetaData,
  storage: Reference<XStorage>,
  medium: Readonly<Sequence<PropertyValue>>,
): void {
  if (!storage.is()) this.illegal("SfxDocumentMetaData::storeToStorage: argument is null");
  this.checkInit();
  const name = literal("meta.xml"),
    stream = storage.operatorStar().openStreamElement(name, 2 | 8);
  name.dispose();
  try {
    if (!stream.is()) throw new RuntimeException();
    const properties = new Reference<XPropertySet>(
      stream,
      UNO_QUERY_THROW,
      XPropertySet.static_type,
    );
    try {
      for (const [name, value] of [
        ["MediaType", "text/xml"],
        ["Compressed", false],
        ["UseCommonStoragePasswordEncryption", false],
      ] as const) {
        const key = literal(name),
          text = typeof value === "string" ? literal(value) : null,
          any = text ? new Any(text.getDataAddress(), "OUString") : new Any([value], "bool");
        try {
          properties.operatorStar().setPropertyValue(key, any);
        } finally {
          any.dispose();
          text?.dispose();
          key.dispose();
        }
      }
    } finally {
      properties.dispose();
    }
    const output = stream.operatorStar().getOutputStream();
    try {
      if (!output.is()) throw new RuntimeException();
      const manager = this.m_xContext.operatorStar().getServiceManager(),
        writer = Writer.create(this.m_xContext);
      try {
        writer.operatorStar().setOutputStream(output);
        const version = SotStorage.GetVersion(storage),
          oasis = version > SOFFICE_FILEFORMAT_60 || version === 0,
          service = literal(
            oasis
              ? "com.sun.star.document.XMLOasisMetaExporter"
              : "com.sun.star.document.XMLMetaExporter",
          ),
          urlProperties = this.getURLProperties(medium);
        try {
          const writerArg = new Any(writer.getAddress(), ["Reference", XWriter.static_type]),
            urlArg = new Any(urlProperties.getAddress(), ["Reference", XPropertySet.static_type]),
            args = new Args(
              {
                /** Selects the writer or URL argument by its native sequence byte offset. @param offset - Byte offset within the source sequence. @returns Borrowed sequence value. */ get(
                  offset: number,
                ) {
                  return offset === 0 ? writerArg : urlArg;
                },
              },
              2,
            );
          try {
            const created = manager
              .operatorStar()
              .createInstanceWithArgumentsAndContext(service, args, this.m_xContext);
            try {
              const exporter = new Reference<XExporter>(
                created,
                UNO_QUERY_THROW,
                XExporter.static_type,
              );
              try {
                const self = new Reference<XComponent>(this);
                try {
                  exporter.operatorStar().setSourceDocument(self);
                } finally {
                  self.dispose();
                }
                const filter = new Reference<XFilter>(
                    exporter,
                    UNO_QUERY_THROW,
                    XFilter.static_type,
                  ),
                  empty = new Properties();
                try {
                  if (!filter.operatorStar().filter(empty)) {
                    const message = literal("SfxDocumentMetaData::storeToStorage: cannot filter"),
                      root = new Reference<XInterface>(this);
                    try {
                      throw new IOException(message, root);
                    } finally {
                      root.dispose();
                      message.dispose();
                    }
                  }
                } finally {
                  empty.dispose();
                  filter.dispose();
                }
              } finally {
                exporter.dispose();
              }
            } finally {
              created.dispose();
            }
          } finally {
            args.dispose();
            urlArg.dispose();
            writerArg.dispose();
          }
        } finally {
          urlProperties.dispose();
          service.dispose();
        }
      } finally {
        writer.dispose();
        manager.dispose();
      }
    } finally {
      output.dispose();
    }
    const transaction = new Reference<XTransactedObject>(
      storage,
      UNO_QUERY,
      XTransactedObject.static_type,
    );
    try {
      if (transaction.is()) transaction.operatorStar().commit();
    } finally {
      transaction.dispose();
    }
  } finally {
    stream.dispose();
  }
}
/** Original descriptor stream/URL input selection and exception translation. @param this - Original document metadata receiver. @param url - Actual native URL. @param medium - Native descriptor. @returns Nothing. */
export function loadFromMedium(
  this: SfxDocumentMetaData,
  url: OUStringConstReference,
  medium: Readonly<Sequence<PropertyValue>>,
): void {
  const input = new Reference<XInputStream>(),
    md = new SequenceAsHashMap(medium, "PropertyValue");
  try {
    if (!url.isEmpty()) {
      const name = literal("URL"),
        readonly = literal("ReadOnly"),
        value = new OUString(url);
      try {
        md.operatorIndex(name).insert(value.getDataAddress(), "OUString");
        md.operatorIndex(readonly).insert([true], "bool");
      } finally {
        value.dispose();
        readonly.dispose();
        name.dispose();
      }
    }
    if (MediaDescriptor.addInputStream(md)) {
      const name = literal("InputStream");
      try {
        md.operatorIndex(name).extract(input.getAddress(), ["Reference", XInputStream.static_type]);
      } finally {
        name.dispose();
      }
    }
    const storage = new Reference<XStorage>();
    try {
      try {
        const created = input.is()
          ? OStorageHelper.GetStorageFromInputStream(input, this.m_xContext)
          : OStorageHelper.GetStorageFromURL(url, 1, this.m_xContext);
        try {
          storage.assign(created);
        } finally {
          created.dispose();
        }
      } catch (error) {
        if (error instanceof RuntimeException || error instanceof IOException) throw error;
        if (!(error instanceof Exception)) throw error;
        try {
          const caught = withCaughtException(error, getCaughtException),
            message = literal("SfxDocumentMetaData::loadFromMedium: exception"),
            self = new Reference<XInterface>(this);
          try {
            throw new WrappedTargetException(message, self, caught);
          } finally {
            self.dispose();
            message.dispose();
            caught.dispose();
          }
        } finally {
          error.dispose();
        }
      }
      if (!storage.is()) this.runtime("SfxDocumentMetaData::loadFromMedium: cannot get Storage");
      const values = md.getAsConstPropertyValueList();
      try {
        this.loadFromStorage(storage, values);
      } finally {
        values.dispose();
      }
    } finally {
      storage.dispose();
    }
  } finally {
    md.dispose();
    input.dispose();
  }
}
/** Original medium output and commit-error translation. @param this - Original document metadata receiver. @param url - Source URL. @param medium - Native descriptor. @returns Nothing. */
export function storeToMedium(
  this: SfxDocumentMetaData,
  url: OUStringConstReference,
  medium: Readonly<Sequence<PropertyValue>>,
): void {
  const md = new SequenceAsHashMap(medium, "PropertyValue");
  try {
    if (!url.isEmpty()) {
      const name = literal("URL"),
        value = new OUString(url);
      try {
        md.operatorIndex(name).insert(value.getDataAddress(), "OUString");
      } finally {
        value.dispose();
        name.dispose();
      }
    }
    const values = md.getAsConstPropertyValueList();
    try {
      const target = new SfxMedium(values);
      try {
        const storage = target.GetOutputStorage();
        try {
          if (!storage.is()) this.runtime("SfxDocumentMetaData::storeToMedium: cannot get Storage");
          const name = literal("MediaType");
          try {
            const value = md.find(name);
            if (value !== undefined) {
              const properties = new Reference<XPropertySet>(
                storage,
                UNO_QUERY_THROW,
                XPropertySet.static_type,
              );
              try {
                properties.operatorStar().setPropertyValue(name, value[1]);
              } finally {
                properties.dispose();
              }
            }
          } finally {
            name.dispose();
          }
          const properties = md.getAsConstPropertyValueList();
          try {
            this.storeToStorage(storage, properties);
          } finally {
            properties.dispose();
          }
          const ok = target.Commit();
          target.Close();
          if (!ok) {
            let error = target.GetErrorIgnoreWarning();
            if (!error.IsSet()) error = new ErrCodeMsg(ERRCODE_IO_GENERAL);
            const message = literal("SfxDocumentMetaData::storeToMedium <"),
              tail = literal("> Commit failed: "),
              diagnostic = error.toString(),
              root = new Reference<XInterface>();
            try {
              message.append(url);
              message.append(tail);
              message.append(diagnostic);
              throw new ErrorCodeIOException(message, root, error.GetCode().valueOf());
            } finally {
              root.dispose();
              diagnostic.dispose();
              tail.dispose();
              message.dispose();
            }
          }
        } finally {
          storage.dispose();
        }
      } finally {
        target.Close();
      }
    } finally {
      values.dispose();
    }
  } finally {
    md.dispose();
  }
}
