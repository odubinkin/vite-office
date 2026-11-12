/** @fileoverview Original ManifestWriter.cxx component/factory and existing package string I/O boundary over actual native manifest sequences, registered SAX Writer and output stream. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XManifestWriter } from "../../../offapi/com/sun/star/packages/manifest/XManifestWriter";
import { ManifestWriter as ManifestWriterService } from "../../../offapi/com/sun/star/packages/manifest/ManifestWriter";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { SaxStringOutput } from "../../../comphelper/source/xml/saxstringwriter";
import { ManifestExport } from "./ManifestExport";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48),
  Manifest = Sequence.specialize<Sequence<PropertyValue>>(["Sequence", propertyType], 8);
/** Original source ASCII literal. @param value - Literal. @returns Native string. */
function literal(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
/** Complete original actual component and source-owned context. */
export class ManifestWriter
  extends WeakImplHelper.specialize(XManifestWriter, XServiceInfo)
  implements XManifestWriter, XServiceInfo
{
  private readonly m_xContext: Reference<XComponentContext>;
  /** Original acquired context copy. @param context - Actual component context. @returns Actual component. */ constructor(
    context: Reference<XComponentContext>,
  ) {
    super();
    this.m_xContext = new Reference(context);
  }
  /** Original Writer service construction/output assignment precede the SAX catch scope. @param stream - Actual output stream. @param sequence - Actual native manifest entries. @returns Nothing. */
  writeManifestSequence(
    stream: Reference<XOutputStream>,
    sequence: SequenceReference<Sequence<PropertyValue>>,
  ): void {
    const writer = Writer.create(this.m_xContext);
    try {
      writer.operatorStar().setOutputStream(stream);
      try {
        new ManifestExport(writer, sequence);
      } catch (error) {
        if (!(error instanceof SAXException)) throw error;
        try {
          const caught = withCaughtException(error, getCaughtException),
            empty = new OUString(),
            context = new Reference();
          try {
            throw new WrappedTargetRuntimeException(empty, context, caught);
          } finally {
            context.dispose();
            empty.dispose();
            caught.dispose();
          }
        } finally {
          error.dispose();
        }
      }
    } finally {
      writer.dispose();
    }
  }
  /** Original implementation name. @returns Native name. */ getImplementationName(): OUString {
    return literal("com.sun.star.packages.manifest.comp.ManifestWriter");
  }
  /** Original service predicate. @param name - Requested service. @returns Membership. */ supportsService(
    name: OUString,
  ): boolean {
    return supportsService(this, name);
  }
  /** Original one supported service. @returns Native sequence. */ getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.packages.manifest.ManifestWriter");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Borrows native source string storage. @returns Actual string pointer. */ get() {
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original reverse member/base destruction. @returns Nothing. */ protected override destroy(): void {
    this.m_xContext.dispose();
    super.destroy();
  }
}
/** Original acquired component factory ignores arguments. @param context - Source context pointer. @param args - Ignored arguments. @returns Actual acquired root. */
export function package_ManifestWriter_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const reference = new Reference<XComponentContext>(context);
  try {
    return acquire(new ManifestWriter(reference));
  } finally {
    reference.dispose();
  }
}
/** Container conversion at the existing browser package boundary; every source element is already an actual initialized PropertyValue. @param rows - Caller-owned actual values. @returns Native sequence with source copy semantics. */
export function createManifestSequence(
  rows: readonly (readonly PropertyValue[])[],
): Sequence<Sequence<PropertyValue>> {
  const values: Sequence<PropertyValue>[] = [];
  try {
    for (const row of rows)
      values.push(
        new Properties(
          {
            /** Borrows actual initialized property storage. @param offset - Byte offset. @returns Native compound address. */ get(
              offset: number,
            ) {
              return row[offset / 48] as PropertyValue;
            },
          },
          row.length,
        ),
      );
    return new Manifest(
      {
        /** Borrows original sequence pointer storage. @param offset - Byte offset. @returns Native field address. */ get(
          offset: number,
        ) {
          return (values[offset / 8] as Sequence<PropertyValue>).getAddress();
        },
      },
      values.length,
    );
  } finally {
    for (const value of values) value.dispose();
  }
}
/** Existing browser string result over actual registered source services and native sequences. @param rows - Caller-owned actual property values. @returns Source-produced XML text for package transport. */
export function createManifestXml(rows: readonly (readonly PropertyValue[])[]): string {
  const context = new Reference<XComponentContext>(getProcessComponentContext().get()),
    output = new SaxStringOutput();
  let sequence: Sequence<Sequence<PropertyValue>> | undefined,
    writer: Reference<XManifestWriter> | undefined;
  try {
    sequence = createManifestSequence(rows);
    writer = ManifestWriterService.create(context);
    writer.operatorStar().writeManifestSequence(output.stream, sequence);
    return output.getXml();
  } finally {
    writer?.dispose();
    sequence?.dispose();
    output.dispose();
    context.dispose();
  }
}

/** Builds an actual string-valued PropertyValue without a parallel package DTO model. @param name - Property name. @param value - Native value content. @returns Property. */
export function createManifestProperty(name: string, value: string): PropertyValue {
  const result = new PropertyValue(),
    key = new OUString(
      Uint16Array.from(
        name,
        /** ASCII name unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0),
      ),
      name.length,
    ),
    data = new OUString(
      Uint16Array.from(
        value.split(""),
        /** UTF16 content unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
      ),
      value.length,
    );
  try {
    result.Name = key;
    result.Value.insert([data.pData], "OUString");
    return result;
  } finally {
    key.dispose();
    data.dispose();
  }
}
