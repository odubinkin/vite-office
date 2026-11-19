/** @fileoverview Original OStorageHelper factory construction, byte transfer and UTF16 package-name/path helpers. Actual storage factory implementations and encryption families remain unfinished; no replacement factory or stream is manufactured. */
import {
  Reference as NativeReference,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { StorageFactory } from "../../../offapi/com/sun/star/embed/StorageFactory";
import { READ, READWRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XInputStream as InputInterface } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { getProcessComponentContext } from "../../inc/processfactory";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { ByteReader, ByteWriter } from "../../inc/bytereader";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Original format property/Any initializer-list lowering with actual compound/sequence owners. @param first - Borrowed source argument. @param format - Native requested format. @param mode - Native storage mode. @param context - Actual context. @param repair - Original repair flag. @returns Actual factory storage. */
function formattedStorage(
  first: Any,
  format: OUStringConstReference,
  mode: number,
  context: Reference<XComponentContext>,
  repair: boolean,
): NativeReference<XStorage> {
  const formatName = new OUString(
      Uint8Array.from(
        "StorageFormat\0",
        /** ASCII literal unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
      ),
    ),
    repairName = new OUString(
      Uint8Array.from(
        "RepairPackage\0",
        /** ASCII literal unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
      ),
    ),
    formatValue = new OUString(format),
    formatAny = new Any(formatValue.getDataAddress(), "OUString"),
    repairAny = new Any([repair], "bool"),
    formatProperty = new PropertyValue(),
    repairProperty = new PropertyValue();
  try {
    formatProperty.Name = formatName;
    formatProperty.Value = formatAny;
    repairProperty.Name = repairName;
    repairProperty.Value = repairAny;
    const properties = new Properties(
      {
        /** Native initializer-list element address. @param offset - Byte offset. @returns Existing source compound. */
        get(offset: number) {
          return offset === 0 ? formatProperty : repairProperty;
        },
      },
      repair ? 2 : 1,
    );
    try {
      const modeAny = new Any([mode], "sal_Int32"),
        propsAny = new Any(properties.getAddress(), ["Sequence", propertyType]);
      try {
        const args = new (Sequence.specialize<Any>("Any", 24))(
          {
            /** Native initializer-list element address. @param offset - Byte offset. @returns Existing source compound. */
            get(offset: number) {
              return offset === 0 ? first : offset === 24 ? modeAny : propsAny;
            },
          },
          3,
        );
        try {
          const factory = OStorageHelper.GetStorageFactory(context);
          try {
            const created = factory.operatorStar().createInstanceWithArguments(args);
            try {
              return new NativeReference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type);
            } finally {
              created.dispose();
            }
          } finally {
            factory.dispose();
          }
        } finally {
          args.dispose();
        }
      } finally {
        propsAny.dispose();
        modeAny.dispose();
      }
    } finally {
      properties.dispose();
    }
  } finally {
    repairProperty.dispose();
    formatProperty.dispose();
    repairAny.dispose();
    formatAny.dispose();
    formatValue.dispose();
    repairName.dispose();
    formatName.dispose();
  }
}
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original static helper namespace; it does not implement an XStorage service. */
export const OStorageHelper = {
  /** Original requested-format URL factory overload. @param format - Storage format. @param url - Native URL. @param mode - Element mode. @param context - Actual context. @returns Acquired actual storage. */
  GetStorageOfFormatFromURL(
    format: OUStringConstReference,
    url: OUStringConstReference,
    mode: number,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ): NativeReference<XStorage> {
    const value = new OUString(url),
      first = new Any(value.getDataAddress(), "OUString");
    try {
      return formattedStorage(first, format, mode, context, false);
    } finally {
      first.dispose();
      value.dispose();
    }
  },
  /** Original requested-format input factory overload, READ mode and optional RepairPackage property. @param format - Storage format. @param input - Native input. @param context - Actual context. @param repair - Original repair flag. @returns Acquired actual storage. */
  GetStorageOfFormatFromInputStream(
    format: OUStringConstReference,
    input: Reference<XInputStream>,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
    repair = false,
  ): NativeReference<XStorage> {
    const first = new Any(input.getAddress(), ["Reference", InputInterface.static_type]);
    try {
      return formattedStorage(first, format, READ, context, repair);
    } finally {
      first.dispose();
    }
  },
  /** Original requested-format bidirectional stream factory overload. @param format - Storage format. @param stream - Actual bidirectional stream. @param mode - Element mode. @param context - Actual context. @param repair - Original repair flag. @returns Acquired actual storage. */
  GetStorageOfFormatFromStream(
    format: OUStringConstReference,
    stream: Reference<XStream>,
    mode = READWRITE,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
    repair = false,
  ): NativeReference<XStorage> {
    const first = new Any(stream.getAddress(), ["Reference", XStream.static_type]);
    try {
      return formattedStorage(first, format, mode, context, repair);
    } finally {
      first.dispose();
    }
  },

  /** Original context fallback is explicit in storagehelper.cxx. @param context - Optional source context. @returns Registered factory. */
  GetStorageFactory(
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ) {
    const selected = new NativeReference<XComponentContext>(
      context.is() ? context.get() : getProcessComponentContext().get(),
    );
    try {
      return StorageFactory.create(selected);
    } finally {
      selected.dispose();
    }
  },
  /** Original temporary storage construction and throwing query. @param context - Actual context. @returns Actual storage. */
  GetTemporaryStorage(
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ): NativeReference<XStorage> {
    const factory = OStorageHelper.GetStorageFactory(context);
    try {
      const created = factory.operatorStar().createInstance();
      try {
        return new NativeReference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type);
      } finally {
        created.dispose();
      }
    } finally {
      factory.dispose();
    }
  },
  /** Original URL/mode arguments and throwing storage query. @param url - Source URL. @param mode - Original flags. @param context - Actual context. @returns Actual storage. */
  GetStorageFromURL(
    url: OUStringConstReference,
    mode: number,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ): NativeReference<XStorage> {
    const text = new OUString(url),
      first = new Any(text.getDataAddress(), "OUString"),
      second = new Any([mode], "sal_Int32");
    try {
      const args = new (Sequence.specialize<Any>("Any", 24))(
        {
          /** Native initializer-list element address. @param offset - Byte offset. @returns Existing source compound. */
          get(offset: number) {
            return offset === 0 ? first : second;
          },
        },
        2,
      );
      try {
        const factory = OStorageHelper.GetStorageFactory(context);
        try {
          const created = factory.operatorStar().createInstanceWithArguments(args);
          try {
            return new NativeReference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type);
          } finally {
            created.dispose();
          }
        } finally {
          factory.dispose();
        }
      } finally {
        args.dispose();
      }
    } finally {
      second.dispose();
      first.dispose();
      text.dispose();
    }
  },
  /** Original input stream and READ arguments. @param input - Actual source input. @param context - Actual context. @returns Actual storage. */
  GetStorageFromInputStream(
    input: Reference<XInputStream>,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ): NativeReference<XStorage> {
    const first = new Any(input.getAddress(), ["Reference", InputInterface.static_type]),
      second = new Any([READ], "sal_Int32");
    try {
      const args = new (Sequence.specialize<Any>("Any", 24))(
        {
          /** Native initializer-list element address. @param offset - Byte offset. @returns Existing source compound. */
          get(offset: number) {
            return offset === 0 ? first : second;
          },
        },
        2,
      );
      try {
        const factory = OStorageHelper.GetStorageFactory(context);
        try {
          const created = factory.operatorStar().createInstanceWithArguments(args);
          try {
            return new NativeReference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type);
          } finally {
            created.dispose();
          }
        } finally {
          factory.dispose();
        }
      } finally {
        args.dispose();
      }
    } finally {
      second.dispose();
      first.dispose();
    }
  },
  /** Original stream/mode storage construction. @param stream - Actual bidirectional stream. @param mode - Source flags. @param context - Actual context. @returns Actual storage. */
  GetStorageFromStream(
    stream: Reference<XStream>,
    mode = READWRITE,
    context: Reference<XComponentContext> = new NativeReference<XComponentContext>(),
  ): NativeReference<XStorage> {
    const first = new Any(stream.getAddress(), ["Reference", XStream.static_type]),
      second = new Any([mode], "sal_Int32");
    try {
      const args = new (Sequence.specialize<Any>("Any", 24))(
        {
          /** Native initializer-list element address. @param offset - Byte offset. @returns Existing source compound. */
          get(offset: number) {
            return offset === 0 ? first : second;
          },
        },
        2,
      );
      try {
        const factory = OStorageHelper.GetStorageFactory(context);
        try {
          const created = factory.operatorStar().createInstanceWithArguments(args);
          try {
            return new NativeReference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type);
          } finally {
            created.dispose();
          }
        } finally {
          factory.dispose();
        }
      } finally {
        args.dispose();
      }
    } finally {
      second.dispose();
      first.dispose();
    }
  },

  /** Original UTF16 code-unit scan; empty names and empty internal segments are accepted by this helper. @param name - Borrowed std::u16string_view units. @param slashAllowed - Original slash flag. @returns Source validity result. */
  IsValidZipEntryFileName(name: Uint16Array, slashAllowed: boolean): boolean {
    let dots = 0;
    for (let i = 0; i < name.length; ++i) {
      const unit = name[i] as number;
      switch (unit) {
        case 46:
          if (dots !== -1) ++dots;
          break;
        case 92:
        case 63:
        case 60:
        case 62:
        case 34:
        case 124:
        case 58:
          return false;
        case 47:
          if (!slashAllowed || dots === 1 || dots === 2 || i === 0) return false;
          dots = 0;
          break;
        default:
          dots = -1;
          if (unit < 32 || (unit >= 0xd800 && unit <= 0xdfff)) return false;
      }
    }
    return dots !== 1 && dots !== 2;
  },
  /** Original substring/begin/end checks, including segments containing separators; this does not normalize or validate paths. @param path - Borrowed UTF16 path. @param segment - Borrowed UTF16 segment. @returns Source match result. */
  PathHasSegment(path: Uint16Array, segment: Uint16Array): boolean {
    let result = false;
    const pathLength = path.length,
      segmentLength = segment.length;
    if (segmentLength !== 0 && pathLength >= segmentLength) {
      // Primitive std::u16string_view find/starts_with/substr operations bind to exact JS UTF16 strings.
      let pathText = "",
        segmentText = "";
      for (let i = 0; i < pathLength; ++i) pathText += String.fromCharCode(path[i] as number);
      for (let i = 0; i < segmentLength; ++i)
        segmentText += String.fromCharCode(segment[i] as number);
      const endSegment = "/" + segmentText,
        internalSegment = endSegment + "/";
      if (pathText.indexOf(internalSegment) !== -1) result = true;
      if (!result && pathText.startsWith(segmentText)) {
        if (pathLength === segmentLength || path[segmentLength] === 47) result = true;
      }
      if (
        !result &&
        pathLength > segmentLength &&
        pathText.slice(pathLength - segmentLength - 1) === endSegment
      )
        result = true;
    }
    return result;
  },
  /** Original do/while transfer, preserving short-read termination, final empty writes and exception propagation. The raw stack array is lowered to primitive uninitialized lvalue cells, never a fake Sequence. @param input - Actual input Reference. @param output - Actual output Reference. @returns Nothing. */
  CopyInputToOutput(input: Reference<XInputStream>, output: Reference<XOutputStream>): void {
    const size = 32000,
      reader = input.get();
    if (reader instanceof ByteReader) {
      const writer = output.get();
      if (writer instanceof ByteWriter) {
        const buffer = new Map<number, [number]>();
        // Original sal_Int8 stack array is uninitialized; only the prefix written by the reader is consumed.
        for (let i = 0; i < size; ++i) buffer.set(i, [undefined as unknown as number]);
        let read: number;
        do {
          read = reader.readSomeBytes(buffer, size);
          writer.writeBytes(buffer, read);
        } while (read === size);
        return;
      }
    }
    const sequence = new Bytes(size);
    try {
      let read: number;
      do {
        read = (input.get() as XInputStream).readBytes(sequence, size);
        if (read < size) sequence.realloc(read);
        (output.get() as XOutputStream).writeBytes(sequence);
      } while (read === size);
    } finally {
      sequence.dispose();
    }
  },
};
