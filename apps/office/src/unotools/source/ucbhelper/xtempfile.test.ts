/** @fileoverview Original unotools Python TempFile test01/test02 behavior through the real service manager and OSL file reads, plus actual component/property/stream lifetime/error contracts. SimpleFileAccess helper service itself is unqualified. */
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { beforeAll, beforeEach, afterEach, it, expect } from "vitest";
import { getpid } from "../../../external/emscripten/file";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OTempFileService } from "./xtempfile";
import { TempFile } from "../../../udkapi/com/sun/star/io/TempFile";
import { XTempFile } from "../../../udkapi/com/sun/star/io/XTempFile";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XFastPropertySet } from "../../../udkapi/com/sun/star/beans/XFastPropertySet";
import { XPropertyAccess } from "../../../udkapi/com/sun/star/beans/XPropertyAccess";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as valueType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import { READONLY } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { TempFileNamed, UniqueTokens } from "../../inc/tempfile";
import { SvFileStream, SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import { File } from "../../../sal/inc/osl/file.hxx";
import * as H from "../../../sal/inc/osl/file";
import { setAllowedPaths } from "../../../sal/osl/unx/file.access";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Values = Sequence.specialize<PropertyValue>(valueType, 48);
let before: string[];
beforeAll(initializeRuntime);
beforeEach(
  /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
    before = getFileSystem().readdir("/tmp");
  },
);
afterEach(
  /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
    const fs = getFileSystem();
    for (const name of fs.readdir("/tmp")) if (!before.includes(name)) fs.unlink("/tmp/" + name);
  },
);
/** Actual service creation from the installed original registry. @returns Owned service reference. */
function temp(): Reference<XTempFile> {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  return own(TempFile.create(context));
}
/** Initializes real signed-byte UNO cells. @param values - Original bytes. @returns Owned source sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const result = own(new Bytes(values.length)),
    data = result.getArray() as SequenceElements;
  values.forEach(
    /** Checks the declared real-runtime source contract. @param value - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
      value,
      index,
    ) => {
      (data.get(index) as [number])[0] = (value << 24) >> 24;
    },
  );
  return result;
}
/** Reads actual byte output. @param value - Actual sequence. @returns Unsigned bytes. */
function observed(value: Sequence<number>): number[] {
  const data = value.getConstArray() as SequenceElements;
  return Array.from(
    { length: value.getLength() },
    /** Checks the declared real-runtime source contract. @param _ - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
      _,
      index,
    ) => (data.get(index) as [number])[0] & 255,
  );
}
/** Original expected UNO exception, with real exception-owned references released. @param action - Actual operation. @param kind - Declared exception class. @returns Nothing. */
function fails(
  action: () => unknown,
  kind:
    | typeof NotConnectedException
    | typeof BufferSizeExceededException
    | typeof IllegalArgumentException
    | typeof RuntimeException
    | typeof UnknownPropertyException,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(kind);
    if (error instanceof Exception) error.dispose();
    else throw error;
    caught = true;
  }
  expect(caught).toBe(true);
}
/** Independent original OSL File wrapper reads the actual URL. @param url - Source URL. @param count - Expected byte count. @returns Real bytes. */
function direct(url: string, count: number): number[] {
  const file = own(new File(u(url))),
    data = new Uint8Array(count),
    read: [bigint] = [0n];
  expect(file.open(H.osl_File_OpenFlag_Read)).toBe(H.oslFileError.None);
  expect(file.read(data, BigInt(count), read)).toBe(H.oslFileError.None);
  expect(read[0]).toBe(BigInt(count));
  file.close();
  return [...data];
}
it("ports Python TempFile test01 URL/name/stream/direct-file/persistent-close assertions", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const value = temp().operatorStar(),
    uri = read(value.getUri()),
    name = read(value.getResourceName()),
    data = [115, 111, 109, 101, 32, 100, 97, 116, 97],
    output = own(value.getOutputStream());
  expect(uri.endsWith(name.replaceAll("\\", "/"))).toBe(true);
  output.operatorStar().writeBytes(bytes(data));
  output.operatorStar().flush();
  value.seek(0n);
  const input = own(value.getInputStream()),
    result = own(new Bytes());
  expect(input.operatorStar().readBytes(result, data.length)).toBe(data.length);
  expect(observed(result)).toEqual(data);
  expect(direct(uri, data.length)).toEqual(data);
  value.setRemoveFile(false);
  output.operatorStar().closeOutput();
  input.operatorStar().closeInput();
  expect(getFileSystem().stat(name).size).toBe(data.length);
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      value.getResourceName(),
    RuntimeException,
  );
});
it("ports Python TempFile test02 persistent file contents after both close calls", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const value = temp().operatorStar(),
    data = [115, 111, 109, 101, 32, 100, 97, 116, 97],
    output = own(value.getOutputStream());
  output.operatorStar().writeBytes(bytes(data));
  const uri = read(value.getUri());
  value.setRemoveFile(false);
  output.operatorStar().closeOutput();
  own(value.getInputStream()).operatorStar().closeInput();
  expect(direct(uri, data.length)).toEqual(data);
});
it("publishes source service/type/property identities without deduplicating XPropertySet", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const reference = temp(),
    value = reference.operatorStar(),
    info = own(new Reference<XServiceInfo>(reference, UNO_QUERY, XServiceInfo.static_type));
  expect(read(info.operatorStar().getImplementationName())).toBe("com.sun.star.io.comp.TempFile");
  expect(info.operatorStar().supportsService(u("com.sun.star.io.TempFile"))).toBe(true);
  const concrete = reference.get();
  if (!concrete || !(concrete instanceof ByteReader)) throw new Error("actual ByteReader absent");
  const types = own((concrete as import("./xtempfile").OTempFileService).getTypes());
  let count = 0;
  for (let i = 0; i < types.getLength(); i++) {
    const type = types.operatorIndex(i);
    if (type.equals(XPropertySet.static_type())) count++;
  }
  expect(count).toBe(2);
  expect(own(new Reference<XSeekable>(reference, UNO_QUERY, XSeekable.static_type)).is()).toBe(
    true,
  );
  expect(value.getRemoveFile()).toBe(true);
  const name = read(value.getResourceName());
  expect(getFileSystem().stat(name).mode & 0o777).toBe(0o600);
});
it.each([false, true])(
  "deletes default file when both endpoints close (input first %s)",
  /** Checks the declared real-runtime source contract. @param inputFirst - Actual declared argument. @returns Original result or test completion. */ (
    inputFirst,
  ) => {
    const reference = temp(),
      value = reference.operatorStar(),
      name = read(value.getResourceName()),
      input = own(value.getInputStream()),
      output = own(value.getOutputStream());
    output.operatorStar().writeBytes(bytes([1, 2, 3]));
    if (inputFirst) input.operatorStar().closeInput();
    else output.operatorStar().closeOutput();
    expect(getFileSystem().stat(name)).toBeDefined();
    if (inputFirst) output.operatorStar().closeOutput();
    else input.operatorStar().closeInput();
    expect(
      /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
        getFileSystem().stat(name),
    ).toThrow();
    fails(
      /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
        value.getLength(),
      NotConnectedException,
    );
    fails(
      /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
        value.getUri(),
      RuntimeException,
    );
    fails(
      /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
        value.getRemoveFile(),
      RuntimeException,
    );
    fails(
      /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
        value.setRemoveFile(false),
      RuntimeException,
    );
  },
);
it("closeOutput rewinds for input and duplicate closes retain NotConnected", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const value = temp().operatorStar(),
    output = own(value.getOutputStream()),
    input = own(value.getInputStream());
  output.operatorStar().writeBytes(bytes([9, 8, 7]));
  expect(value.getPosition()).toBe(3n);
  output.operatorStar().closeOutput();
  expect(value.getPosition()).toBe(0n);
  const data = own(new Bytes());
  expect(input.operatorStar().readBytes(data, 10)).toBe(3);
  expect(observed(data)).toEqual([9, 8, 7]);
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      output.operatorStar().flush(),
    NotConnectedException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      output.operatorStar().writeBytes(bytes([1])),
    NotConnectedException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      output.operatorStar().closeOutput(),
    NotConnectedException,
  );
  input.operatorStar().closeInput();
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      input.operatorStar().closeInput(),
    NotConnectedException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      input.operatorStar().available(),
    NotConnectedException,
  );
});
it("retains signed count/seek/truncate and pointer read contracts", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const reference = temp(),
    value = reference.operatorStar(),
    output = own(value.getOutputStream()),
    input = own(value.getInputStream()),
    data = own(new Bytes());
  output.operatorStar().writeBytes(bytes([1, 2, 3, 4]));
  value.seek(1n);
  input.operatorStar().skipBytes(-1);
  expect(value.getPosition()).toBe(0n);
  expect(input.operatorStar().available()).toBe(4);
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      input.operatorStar().readBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      input.operatorStar().readSomeBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      value.seek(-1n),
    IllegalArgumentException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      value.seek(5n),
    IllegalArgumentException,
  );
  const concrete = reference.get();
  if (!(concrete instanceof ByteReader)) throw new Error("actual ByteReader absent");
  const raw = new Int8Array(2);
  expect(concrete.readSomeBytes(raw, 2)).toBe(2);
  expect([...raw]).toEqual([1, 2]);
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      concrete.readSomeBytes(raw, -1),
    BufferSizeExceededException,
  );
  expect(input.operatorStar().readSomeBytes(data, 10)).toBe(2);
  expect(input.operatorStar().readSomeBytes(data, 10)).toBe(0);
  expect(input.operatorStar().readSomeBytes(data, 10)).toBe(0);
  expect(data.getLength()).toBe(0);
  own(new Reference<XTruncate>(reference, UNO_QUERY, XTruncate.static_type))
    .operatorStar()
    .truncate();
  expect(value.getLength()).toBe(0n);
  expect(value.getPosition()).toBe(0n);
});
it("preserves property descriptor sorting, handles, readonly flags and value order", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const ref = temp(),
    properties = own(new Reference<XPropertySet>(ref, UNO_QUERY, XPropertySet.static_type)),
    fast = own(new Reference<XFastPropertySet>(ref, UNO_QUERY, XFastPropertySet.static_type)),
    access = own(new Reference<XPropertyAccess>(ref, UNO_QUERY, XPropertyAccess.static_type)),
    info = own(properties.operatorStar().getPropertySetInfo()),
    descriptions = own(info.operatorStar().getProperties()),
    fields = descriptions.getConstArray() as SequenceElements;
  expect(descriptions.getLength()).toBe(3);
  const names: string[] = [];
  for (let i = 0; i < 3; i++)
    names.push(
      read(
        new OUString(
          Property.unacquired(fields.get(i * 32) as Parameters<typeof Property.unacquired>[0]).Name,
        ),
      ),
    );
  expect(names).toEqual(["RemoveFile", "ResourceName", "Uri"]);
  const uri = own(info.operatorStar().getPropertyByName(u("Uri")));
  expect(uri.Handle).toBe(1);
  expect(uri.Attributes).toBe(READONLY);
  const values = own(access.operatorStar().getPropertyValues()),
    array = values.getConstArray() as SequenceElements;
  expect(values.getLength()).toBe(3);
  const handles: number[] = [];
  for (let i = 0; i < 3; i++) {
    const row = PropertyValue.unacquired(
      array.get(i * 48) as Parameters<typeof PropertyValue.unacquired>[0],
    );
    handles.push(row.Handle);
    expect(row.State).toBe(PropertyState.DEFAULT_VALUE);
  }
  expect(handles).toEqual([1, 2, 3]);
  const flag = own(fast.operatorStar().getFastPropertyValue(2));
  expect(flag.getBoolean()).toBe(true);
  fast.operatorStar().setFastPropertyValue(2, own(new Any(false)));
  expect(ref.operatorStar().getRemoveFile()).toBe(false);
  properties.operatorStar().setPropertyValue(u("RemoveFile"), own(new Any(true)));
  expect(ref.operatorStar().getRemoveFile()).toBe(true);
  expect(own(properties.operatorStar().getPropertyValue(u("RemoveFile"))).getBoolean()).toBe(true);
  for (const name of ["ResourceName", "Uri"]) {
    const value = own(properties.operatorStar().getPropertyValue(u(name))),
      text = own(new OUString());
    expect(value.extract(text, "OUString")).toBe(true);
    expect(text.getLength()).toBeGreaterThan(0);
  }
  for (const handle of [1, 3]) {
    const value = own(fast.operatorStar().getFastPropertyValue(handle)),
      typeName = value.getValueTypeName();
    expect(typeName.getLength()).toBeGreaterThan(0);
    typeName.dispose();
  }
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      properties.operatorStar().getPropertyValue(u("unknown")),
    UnknownPropertyException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      properties.operatorStar().setPropertyValue(u("Uri"), flag),
    UnknownPropertyException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      fast.operatorStar().getFastPropertyValue(-5),
    UnknownPropertyException,
  );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      fast.operatorStar().setFastPropertyValue(1, flag),
    UnknownPropertyException,
  );
  const text = own(new OUString(u("wrong"))),
    wrong = own(new Any(text.getDataAddress(), "OUString"));
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      properties.operatorStar().setPropertyValue(u("RemoveFile"), wrong),
    RuntimeException,
  );
  expect(ref.operatorStar().getRemoveFile()).toBe(true);
});
it("applies property batches in order and stops without rollback", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const ref = temp(),
    access = own(new Reference<XPropertyAccess>(ref, UNO_QUERY, XPropertyAccess.static_type)),
    rows = [
      own(new PropertyValue(u("RemoveFile"), 2, own(new Any(false)), PropertyState.DEFAULT_VALUE)),
      own(new PropertyValue(u("Uri"), 1, own(new Any(false)), PropertyState.DEFAULT_VALUE)),
    ],
    values = own(
      new Values(
        {
          /** Checks the declared real-runtime source contract. @param offset - Actual declared argument. @returns Original result or test completion. */ get(
            offset: number,
          ): unknown {
            return rows[offset / 48];
          },
        },
        rows.length,
      ),
    );
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      access.operatorStar().setPropertyValues(values),
    UnknownPropertyException,
  );
  expect(ref.operatorStar().getRemoveFile()).toBe(false);
});
it("default TempFileNamed owns real private files and retains first stream mode until closed", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const value = own(new TempFileNamed());
  expect(value.IsValid()).toBe(true);
  const uri = read(new OUString(value.GetURL())),
    name = read(value.GetFileName());
  expect(getFileSystem().stat(name).mode & 0o777).toBe(0o600);
  const first = value.GetStream(StreamMode.READ);
  expect(first).toBeInstanceOf(SvFileStream);
  expect(first.IsWritable()).toBe(false);
  expect(value.GetStream(StreamMode.WRITE)).toBe(first);
  value.CloseStream();
  const stream = value.GetStream(StreamMode.READWRITE);
  expect(stream).not.toBe(first);
  stream.WriteBytes(Uint8Array.of(9, 8, 7), 3);
  value.GetURL();
  expect(direct(uri, 3)).toEqual([9, 8, 7]);
  value.EnableKillingFile();
  value.CloseStream();
  expect(getFileSystem().stat(name)).toBeDefined();
});
it("retains original empty-name memory fallback under a real denied creation", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  setAllowedPaths(u("r:/tmp").getStr());
  const value = own(new TempFileNamed());
  expect(value.IsValid()).toBe(false);
  expect(value.GetURL().getLength()).toBe(0);
  expect(read(value.GetFileName())).toBe("");
  const stream = value.GetStream(StreamMode.READWRITE);
  expect(stream).toBeInstanceOf(SvMemoryStream);
  expect(stream.WriteBytes(Uint8Array.of(9), 1)).toBe(1);
  value.EnableKillingFile();
});
it("shares actual unique-token sequence under the source global mutex", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const first = new UniqueTokens(),
    second = new UniqueTokens(),
    a = own(new OUString()),
    b = own(new OUString());
  expect(first.next(a)).toBe(true);
  expect(second.next(b)).toBe(true);
  expect(b.toUInt64(36)).toBe((a.toUInt64(36) + 1n) % 2176782336n);
  expect(read(new OUString(a))).toMatch(/^[0-9a-z]{1,6}$/);
  expect(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      first.next(null),
  ).toThrow("assert(token");
});
it("exposes boolean Any extraction without changing the signed32 specialization", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  expect(own(new Any(true)).getBoolean()).toBe(true);
  expect(own(new Any(false)).getBoolean()).toBe(false);
  const integer = own(new Any([23], "sal_Int32"));
  expect(integer.get("sal_Int32")).toBe(23);
  const empty = own(new Any());
  fails(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      empty.getBoolean(),
    RuntimeException,
  );
});
it("preserves closed-input guards while seek/output stay available until both close", /** Original endpoint state flags do not close the whole object early. @returns Nothing. */ () => {
  const reference = temp(),
    value = reference.operatorStar(),
    input = own(value.getInputStream()),
    output = own(value.getOutputStream()),
    data = own(new Bytes());
  output.operatorStar().writeBytes(bytes([1, 2, 3]));
  input.operatorStar().closeInput();
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().readBytes(data, 1),
    NotConnectedException,
  );
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().readSomeBytes(data, 1),
    NotConnectedException,
  );
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().skipBytes(1),
    NotConnectedException,
  );
  const concrete = reference.get();
  if (!(concrete instanceof ByteReader)) throw new Error("actual ByteReader absent");
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      concrete.readSomeBytes(new Int8Array(1), 1),
    NotConnectedException,
  );
  value.seek(1n);
  expect(value.getPosition()).toBe(1n);
  output.operatorStar().flush();
  expect(value.getLength()).toBe(3n);
  output.operatorStar().closeOutput();
  expect(own(value.getInputStream()).is()).toBe(true);
  expect(own(value.getOutputStream()).is()).toBe(true);
});
it("keeps the original distinct error/count precheck order on a real failed stream open", /** Name creation succeeds, then the actual approved path gate denies opening for write. @returns Nothing. */ () => {
  const reference = temp(),
    value = reference.operatorStar(),
    name = read(value.getResourceName()),
    input = own(value.getInputStream()),
    data = own(new Bytes());
  setAllowedPaths(u("r:/tmp").getStr());
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      value.getLength(),
    NotConnectedException,
  );
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().readBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().readSomeBytes(data, -1),
    NotConnectedException,
  );
  const concrete = reference.get();
  if (!(concrete instanceof ByteReader)) throw new Error("actual ByteReader absent");
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      concrete.readSomeBytes(new Int8Array(1), -1),
    BufferSizeExceededException,
  );
  fails(
    /** Checks the actual declared source operation. @returns Actual result. */ () =>
      input.operatorStar().readBytes(data, 4),
    NotConnectedException,
  );
  expect(data.getLength()).toBe(4);
  expect(getFileSystem().stat(name).size).toBe(0);
});
it("retains release-profile assert-only property listeners and successful ordered batches", /** Source listener methods have no registration body; native debug assertion behavior remains unqualified. @returns Nothing. */ () => {
  const reference = temp(),
    property = own(new Reference<XPropertySet>(reference, UNO_QUERY, XPropertySet.static_type)),
    access = own(new Reference<XPropertyAccess>(reference, UNO_QUERY, XPropertyAccess.static_type)),
    listener = own(new Reference<XPropertyChangeListener>()),
    veto = own(new Reference<XVetoableChangeListener>());
  property.operatorStar().addPropertyChangeListener(u("RemoveFile"), listener);
  property.operatorStar().removePropertyChangeListener(u("RemoveFile"), listener);
  property.operatorStar().addVetoableChangeListener(u("RemoveFile"), veto);
  property.operatorStar().removeVetoableChangeListener(u("RemoveFile"), veto);
  const row = own(
      new PropertyValue(u("RemoveFile"), 2, own(new Any(false)), PropertyState.DEFAULT_VALUE),
    ),
    values = own(
      new Values(
        {
          /** Checks the actual declared source operation. @param offset - Actual argument. @returns Actual result. */ get(
            offset: number,
          ): unknown {
            void offset;
            return row;
          },
        },
        1,
      ),
    );
  access.operatorStar().setPropertyValues(values);
  expect(reference.operatorStar().getRemoveFile()).toBe(false);
  access.operatorStar().setPropertyValues(own(new Values()));
});
it("retries the original exclusive name collision without changing the colliding file", /** The next name is derived from a real public token, not injected into private state. @returns Nothing. */ () => {
  const tokens = new UniqueTokens(),
    value = own(new OUString());
  tokens.next(value);
  const next = (value.toUInt64(36) + 1n) % 2176782336n,
    pid = getpid(),
    collision = "/tmp/lu" + pid + next.toString(36) + ".tmp",
    fs = getFileSystem(),
    original = fs.open(collision, "w");
  fs.write(original, Uint8Array.of(9), 0, 1);
  fs.close(original);
  const named = own(new TempFileNamed());
  expect(named.IsValid()).toBe(true);
  expect(read(named.GetFileName())).not.toBe(collision);
  expect(direct("file://" + collision, 1)).toEqual([9]);
});
it("deletes an unopened empty file after both endpoints close", /** Closing does not need a prior connected stream acquisition. @returns Nothing. */ () => {
  const reference = temp(),
    value = reference.operatorStar(),
    name = read(value.getResourceName());
  own(value.getOutputStream()).operatorStar().closeOutput();
  own(value.getInputStream()).operatorStar().closeInput();
  expect(
    /** Queries the actual file lifetime. @returns Native result. */ () =>
      getFileSystem().stat(name),
  ).toThrow();
});
it("keeps the file alive through the real exception Context reference until that value is destroyed", /** Ordinary JS references do not substitute the original UNO logical lifetime. @returns Nothing. */ () => {
  const reference = temp(),
    name = read(reference.operatorStar().getResourceName()),
    owner = reference.get();
  if (!(owner instanceof OTempFileService)) throw new Error("actual TempFile service absent");
  owner.closeInput();
  let held: NotConnectedException | undefined;
  try {
    owner.closeInput();
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    held = error;
  }
  if (!held) throw new Error("actual exception absent");
  reference.dispose();
  expect(getFileSystem().stat(name)).toBeDefined();
  held.dispose();
  expect(
    /** Queries the actual file lifetime. @returns Native result. */ () =>
      getFileSystem().stat(name),
  ).toThrow();
});
