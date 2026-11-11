/** @fileoverview Native standalone seekable readonly component, qualified helper interfaces, seek bounds and disposed-before-missing-interface ordering. */
import { expect, it } from "vitest";
import { OInputSeekStream } from "./oseekinstream";
import { OInputCompStream } from "./ocompinstream";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import type { ByteReader } from "../../../comphelper/inc/bytereader";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { OFOPXML, ZIP } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { nativeText } from "../../../test/ofopxml-values";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Destroys the original UNO exception once. @param operation - Operation. @param expected - Native class. @returns Nothing. */
function failure(operation: () => unknown, expected: unknown): void {
  try {
    operation();
    throw new Error("Expected native exception");
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error.constructor).toBe(expected);
    } finally {
      error.dispose();
    }
  }
}
it("shares actual input identity and position, adds XTypeProvider and keeps all inherited type entries", /** Validates actual source helper dispatch without inferred interfaces. @returns Nothing. */ () => {
  const bytes = new Bytes(4),
    props = new Properties(),
    input = new Reference<XInputStream & ByteReader>(new SequenceInputStream(bytes)),
    owner = new Reference(new OInputSeekStream(input, props, OFOPXML)),
    value = owner.get() as OInputSeekStream;
  bytes.dispose();
  props.dispose();
  input.dispose();
  try {
    for (const declaration of [
      XSeekable,
      XInputStream,
      XStream,
      XTypeProvider,
      XRelationshipAccess,
      XPropertySet,
    ]) {
      const query = owner.query(declaration.static_type);
      expect(query.get()).toBe(value);
      query.dispose();
    }
    const types = value.getTypes(),
      names: string[] = [];
    try {
      for (let i = 0; i < types.getLength(); ++i) {
        const name = types.operatorIndex(i).getTypeName();
        try {
          names.push(nativeText(name));
        } finally {
          name.dispose();
        }
      }
      expect(names).toEqual([
        "com.sun.star.io.XSeekable",
        "com.sun.star.lang.XTypeProvider",
        "com.sun.star.io.XInputStream",
        "com.sun.star.embed.XExtendedStorageStream",
        "com.sun.star.embed.XRelationshipAccess",
        "com.sun.star.beans.XPropertySet",
        "com.sun.star.lang.XTypeProvider",
        "com.sun.star.uno.XWeak",
      ]);
    } finally {
      types.dispose();
    }
    expect(value.getLength()).toBe(4n);
    expect(value.getPosition()).toBe(0n);
    value.seek(3n);
    const alias = value.getInputStream(),
      data = new Bytes();
    try {
      expect((alias.get() as XInputStream).readBytes(data, 2)).toBe(1);
      expect(value.getPosition()).toBe(4n);
      value.seek(0n);
      expect((alias.get() as XInputStream).available()).toBe(4);
      value.seek(4n);
      expect((alias.get() as XInputStream).readBytes(data, 1)).toBe(0);
    } finally {
      data.dispose();
      alias.dispose();
    }
    for (const location of [-1n, 5n, 2147483648n])
      failure(
        /** Original underlying bounds. @returns Nothing. */ () => value.seek(location),
        IllegalArgumentException,
      );
    value.closeInput();
    for (const action of [
      /** Closed seek cannot reopen the underlying stream. @returns Nothing. */ () =>
        value.seek(0n),
      /** Closed position. @returns Position. */ () => value.getPosition(),
      /** Closed length. @returns Length. */ () => value.getLength(),
    ])
      failure(action, DisposedException);
  } finally {
    owner.dispose();
  }
});
it("retains constructor-time nonthrowing query and method-time RuntimeException before disposed state", /** A genuine nonseekable OInputCompStream is the underlying ByteReader, without a fake query provider. @returns Nothing. */ () => {
  const data = new Bytes(),
    props = new Properties(),
    raw = new Reference<XInputStream & ByteReader>(new SequenceInputStream(data)),
    inner = new Reference<XInputStream & ByteReader>(new OInputCompStream(raw, props, ZIP)),
    owner = new Reference(new OInputSeekStream(inner, props, ZIP)),
    value = owner.get() as OInputSeekStream;
  data.dispose();
  props.dispose();
  raw.dispose();
  inner.dispose();
  try {
    for (const action of [
      /** Missing seek. @returns Nothing. */ () => value.seek(0n),
      /** Missing position. @returns Position. */ () => value.getPosition(),
      /** Missing length. @returns Length. */ () => value.getLength(),
    ])
      failure(action, RuntimeException);
    const relations = owner.query(XRelationshipAccess.static_type);
    expect(relations.is()).toBe(false);
    relations.dispose();
    value.closeInput();
    failure(
      /** Disposed guard takes priority over missing seek support. @returns Nothing. */ () =>
        value.seek(0n),
      DisposedException,
    );
  } finally {
    owner.dispose();
  }
});
