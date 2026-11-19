/** @fileoverview Exercises registered ZipFileAccess through native UNO arguments and entry streams in browser main and DOM-free Worker realms. */
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import {
  Reference,
  UNO_QUERY_THROW,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { XZipFileAccess2 } from "../../apps/office/src/offapi/com/sun/star/packages/zip/XZipFileAccess2";
import { OUString, OUStringLiteral } from "../../apps/office/src/sal/inc/rtl/ustring";
import { SvMemoryStream, StreamMode } from "../../apps/office/src/tools/inc/stream";
import { XInputStream } from "../../apps/office/src/udkapi/com/sun/star/io/XInputStream";
import { XComponent } from "../../apps/office/src/udkapi/com/sun/star/lang/XComponent";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { DisposedException } from "../../apps/office/src/cppu/inc/com/sun/star/lang/DisposedException";
import { OSeekableInputStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";

/** Uses the production factory and public interfaces without archive replacements. @param archive - Actual deflated ZIP fixture containing entry a. @param source - Optional actual file-provider input. @returns Public observations. */
export function probeNativeZipAccess(
  archive: Uint8Array,
  source?: Reference<XInputStream>,
): {
  names: number;
  length: number;
  first: number[];
  patternFirst: number[];
  disposed: boolean;
} {
  const owners: { dispose(): void }[] = [];
  /** Retains a real owner for reverse-order release. @param value - Actual owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Binds a UTF16 source literal. @param text - Source literal. @returns Owned RTL string. */
  function literal(text: string): OUString {
    return own(
      new OUString(
        new OUStringLiteral(
          Uint16Array.from(
            text.split("").concat("\0"),
            /** Extracts a literal code unit. @param character - UTF16 unit. @returns Code unit. */
            (character) => character.charCodeAt(0),
          ),
        ),
      ),
    );
  }
  try {
    const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
      memory = own(new SvMemoryStream(archive, archive.length, StreamMode.READ)),
      input = own(
        source
          ? new Reference<XInputStream>(source)
          : new Reference<XInputStream>(new OSeekableInputStreamWrapper(memory)),
      ),
      argument = own(new Any(input.getAddress(), ["Reference", XInputStream.static_type])),
      arguments_ = own(new (Sequence.specialize<Any>("Any", 24))(1));
    Any.prototype.assign.call(arguments_.operatorIndex(0), argument);
    const manager = own(context.operatorStar().getServiceManager()),
      instance = own(
        manager
          .operatorStar()
          .createInstanceWithArgumentsAndContext(
            literal("com.sun.star.packages.zip.ZipFileAccess"),
            arguments_,
            context,
          ),
      ),
      access = own(
        new Reference<XZipFileAccess2>(instance, UNO_QUERY_THROW, XZipFileAccess2.static_type),
      ),
      component = own(new Reference<XComponent>(instance, UNO_QUERY_THROW, XComponent.static_type)),
      zip = access.operatorStar(),
      names = own(zip.getElementNames()).getLength(),
      value = own(zip.getByName(literal("a"))),
      entry = own(new Reference<XInputStream>());
    if (!value.extract(entry.getAddress(), ["Reference", XInputStream.static_type]))
      throw new Error("ZipFileAccess did not return its actual input interface");
    const length = entry.operatorStar().available(),
      bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
      pattern = own(zip.getStreamByPattern(literal("*")));
    /** Observes bytes from an independently positioned original stream. @param stream - Actual entry input. @returns First two unsigned bytes. */
    function firstBytes(stream: Reference<XInputStream>): number[] {
      if (stream.operatorStar().readBytes(bytes, 2) !== 2)
        throw new Error("ZipFileAccess entry read was short");
      const fields = bytes.getConstArray() as SequenceElements;
      return [(fields.get(0) as [number])[0] & 255, (fields.get(1) as [number])[0] & 255];
    }
    const first = firstBytes(entry),
      patternFirst = firstBytes(pattern);
    entry.operatorStar().closeInput();
    pattern.operatorStar().closeInput();
    component.operatorStar().dispose();
    let disposed = false;
    try {
      zip.hasElements();
    } catch (error) {
      if (!(error instanceof DisposedException)) throw error;
      disposed = true;
      error.dispose();
    }
    if (
      names !== 1 ||
      length !== 17 ||
      first.join() !== "104,101" ||
      patternFirst.join() !== "104,101" ||
      !disposed
    )
      throw new Error("Registered ZipFileAccess contract failed");
    return { names, length, first, patternFirst, disposed };
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
