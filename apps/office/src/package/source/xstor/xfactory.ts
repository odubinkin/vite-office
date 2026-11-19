/** @fileoverview Original StorageFactory service, argument decoding and package signature admission. */
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { READ, READWRITE, TRUNCATE, WRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { OFOPXML, PACKAGE, ZIP } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { SimpleFileAccess } from "../../../offapi/com/sun/star/ucb/SimpleFileAccess";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  rtl_uString_assign,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../../../sal/inc/rtl/ustring.h";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { TempFileFastService } from "../../../unotools/source/ucbhelper/tempfile.fast";
import { OStorage } from "./xstorage";
import { OStorage_Impl } from "./xstorage.impl";
import { storageName } from "./xstorage.catalog";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
const implementation = "com.sun.star.comp.embed.StorageFactory";
const service = "com.sun.star.embed.StorageFactory";

/** Converts a native string literal. @param text - Literal. @returns Owned string. */
function literal(text: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(text));
}

/** Tests the upstream prohibited package URL scheme using ASCII case folding. @param url - Actual URL. @returns Whether it is a package URL. */
function asciiPackageUrl(url: OUString): boolean {
  const prefix = "vnd.sun.star.pkg:";
  const head = url.copy(0, Math.min(prefix.length, url.getLength()));
  const type = literal(prefix);
  try {
    return head.equalsIgnoreAsciiCase(type);
  } finally {
    type.dispose();
    head.dispose();
  }
}

/** Checks the original local ZIP header and resets the persistence cursor. @param input - Actual input. @param seekable - Actual seek facet. @returns Whether the stream is empty or contains a local ZIP header. */
function CheckPackageSignature_Impl(
  input: Reference<XInputStream>,
  seekable: Reference<XSeekable>,
): boolean {
  if (!input.is() || !seekable.is()) throw new RuntimeException();
  const seek = seekable.operatorStar();
  if (seek.getLength() === 0n) return true;
  const bytes = new Bytes(4);
  try {
    seek.seek(0n);
    const count = input.operatorStar().readBytes(bytes, 4);
    seek.seek(0n);
    if (count !== 4) return false;
    const data = bytes.getConstArray() as SequenceElements;
    const signature = [0x50, 0x4b, 0x03, 0x04];
    for (let index = 0; index < signature.length; ++index)
      if ((data.get(index) as [number])[0] !== signature[index]) return false;
    return true;
  } finally {
    bytes.dispose();
  }
}

/** Original single-service implementation over actual package storage. */
export class OStorageFactory
  extends WeakImplHelper.specialize(XSingleServiceFactory, XServiceInfo)
  implements XSingleServiceFactory, XServiceInfo
{
  private readonly context: Reference<XComponentContext>;

  /** Retains the originating component context. @param context - Caller context. @returns Factory. */
  constructor(context: XComponentContext | null) {
    super();
    this.context = new Reference(context);
  }

  /** Creates the original temporary PACKAGE storage. @returns Owned storage identity. */
  createInstance(): Reference<XInterface> {
    const stream = new Reference<XStream>(new TempFileFastService());
    const properties = new Properties();
    try {
      return new Reference(
        new OStorage(
          new OStorage_Impl(stream, READWRITE, properties, this.context, PACKAGE, "stream"),
        ),
      );
    } finally {
      properties.dispose();
      stream.dispose();
    }
  }

  /** Opens an actual source using the published factory argument order. @param args - Source, mode and descriptor. @returns Owned storage identity. */
  createInstanceWithArguments(args: Sequence<Any>): Reference<XInterface> {
    const length = args.getLength();
    if (!length) return this.createInstance();
    const modeSlot = [READ];
    if (length >= 2 && !Any.prototype.extract.call(args.operatorIndex(1), modeSlot, "sal_Int32"))
      throw new IllegalArgumentException();
    const mode = (modeSlot[0] as number) | READ;
    if (mode & TRUNCATE && !(mode & WRITE)) throw new IllegalArgumentException();

    const first = args.operatorIndex(0);
    const url = new OUString();
    const stream = new Reference<XStream>();
    const input = new Reference<XInputStream>();
    const properties = new Properties();
    try {
      if (Any.prototype.extract.call(first, url, "OUString")) {
        if (url.isEmpty() || asciiPackageUrl(url)) throw new IllegalArgumentException();
        const access = SimpleFileAccess.create(this.context);
        try {
          if (mode & WRITE) {
            const opened = access.operatorStar().openFileReadWrite(url);
            stream.moveAssign(opened);
            opened.dispose();
          } else {
            const opened = access.operatorStar().openFileRead(url);
            input.moveAssign(opened);
            opened.dispose();
          }
        } finally {
          access.dispose();
        }
      } else if (
        !Any.prototype.extract.call(first, stream.getAddress(), [
          "Reference",
          XStream.static_type,
        ]) &&
        !Any.prototype.extract.call(first, input.getAddress(), [
          "Reference",
          XInputStream.static_type,
        ])
      ) {
        this.fail("wrong first arg");
      }
      const format =
        length >= 3 ? this.descriptor(args.operatorIndex(2) as Any, url, properties) : PACKAGE;
      if (input.is()) {
        if (mode & WRITE) this.fail("storagemode==write");
        const seekable = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
        try {
          if (!CheckPackageSignature_Impl(input, seekable)) {
            const message = literal("package signature check failed, probably not a package file"),
              context = new Reference();
            try {
              throw new IOException(message, context);
            } finally {
              context.dispose();
              message.dispose();
            }
          }
          return new Reference(
            new OStorage(new OStorage_Impl(input, mode, properties, this.context, format, "input")),
          );
        } finally {
          seekable.dispose();
        }
      }
      if (stream.is()) {
        const actual = stream.operatorStar();
        const inner = actual.getInputStream();
        try {
          if (mode & WRITE) {
            const output = actual.getOutputStream();
            try {
              if (!output.is()) this.fail("access denied");
            } finally {
              output.dispose();
            }
          }
          if (!inner.is()) this.fail("access denied");
          const seekable = new Reference<XSeekable>(stream, UNO_QUERY, XSeekable.static_type);
          try {
            if (!CheckPackageSignature_Impl(inner, seekable)) throw new IOException();
            return new Reference(
              new OStorage(
                new OStorage_Impl(stream, mode, properties, this.context, format, "stream"),
              ),
            );
          } finally {
            seekable.dispose();
          }
        } finally {
          inner.dispose();
        }
      }
      this.fail("no input stream or regular stream");
    } finally {
      properties.dispose();
      input.dispose();
      stream.dispose();
      url.dispose();
    }
  }

  /** Reads the original StorageFormat and forwards recognized storage properties. @param argument - Third factory argument. @param url - Available URL. @param target - Native output descriptor. @returns Storage format. */
  private descriptor(argument: Any, url: OUString, target: Sequence<PropertyValue>): number {
    const description = new Properties();
    try {
      if (
        !Any.prototype.extract.call(argument, description.getAddress(), ["Sequence", propertyType])
      )
        this.fail("wrong 3rd arg");
      if (!url.isEmpty()) {
        const name = literal("URL"),
          value = new Any(url.getDataAddress(), "OUString");
        try {
          this.property(target, 0, name, value);
        } finally {
          value.dispose();
          name.dispose();
        }
      }
      let format = PACKAGE;
      let index = 1;
      for (let i = 0; i < description.getLength(); ++i) {
        const row = PropertyValue.unacquired(description.operatorIndex(i) as SequenceElements);
        const name = storageName(row.Name);
        if (name === "StorageFormat") format = this.format(row.Value as Any);
        else if (
          [
            "InteractionHandler",
            "Password",
            "RepairPackage",
            "StatusIndicator",
            "NoFileSync",
          ].includes(name)
        )
          this.property(target, index++, row.Name, row.Value as Any);
      }
      return format;
    } finally {
      description.dispose();
    }
  }

  /** Decodes the published string or numeric storage format. @param value - Descriptor value. @returns Format. */
  private format(value: Any): number {
    const name = new OUString();
    try {
      if (Any.prototype.extract.call(value, name, "OUString")) {
        switch (storageName(name)) {
          case "PackageFormat":
            return PACKAGE;
          case "ZipFormat":
            return ZIP;
          case "OFOPXMLFormat":
            return OFOPXML;
        }
      } else {
        const id = [0];
        if (
          Any.prototype.extract.call(value, id, "sal_Int32") &&
          [PACKAGE, ZIP, OFOPXML].includes(id[0] as number)
        )
          return id[0] as number;
      }
      const empty = new OUString(),
        root = new Reference();
      try {
        throw new IllegalArgumentException(empty, root, 1);
      } finally {
        root.dispose();
        empty.dispose();
      }
    } finally {
      name.dispose();
    }
  }

  /** Writes the source descriptor member and leaves default Handle and State. @param target - Descriptor. @param index - Source slot. @param name - Native name. @param value - Native value. @returns Nothing. */
  private property(
    target: Sequence<PropertyValue>,
    index: number,
    name: OUStringConstReference,
    value: Any,
  ): void {
    target.realloc(index + 1);
    const record = target.operatorIndex(index) as SequenceElements;
    rtl_uString_assign(record.get(0) as rtl_uStringSlot, name.pData as rtl_uString);
    Any.prototype.assign.call(record.get(16), value);
  }

  /** Throws the exact generic factory exception. @param text - Native diagnostic. @returns Never. */
  private fail(text: string): never {
    const message = literal(text),
      context = new Reference();
    try {
      throw new Exception(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }

  /** Returns the original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal(implementation);
  }

  /** Tests the original advertised names. @param name - Requested service. @returns Match. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }

  /** Returns original service names in source order. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const first = literal(service),
      second = literal(implementation);
    try {
      return new Names(
        new Map([
          [0, first.getDataAddress()],
          [8, second.getDataAddress()],
        ]),
        2,
      );
    } finally {
      second.dispose();
      first.dispose();
    }
  }

  /** Releases the retained context. @returns Nothing. */
  protected override destroy(): void {
    this.context.dispose();
    super.destroy();
  }
}

/** Original package factory component constructor. @param context - Caller context. @param args - Source ignored arguments. @returns Acquired factory. */
export function package_OStorageFactory_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  return acquire(new OStorageFactory(context));
}
