/** @fileoverview Original oox::FastParser native intrusive parser, UNO token/document references, namespace and stream-close ownership. StorageBase overload opens through the actual synchronous owner. */
import { StorageBase } from "../helper/storagebase";
import { FastSaxParser } from "../../../sax/inc/fastparser";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import type { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { FastTokenHandler } from "./fasttokenhandler";
import { StaticNamespaceMap } from "../token/namespacemap";

/** Original guard retains the input independently of the caller's mutable InputSource. */
class InputStreamCloseGuard {
  private readonly mxInStream: Reference<XInputStream>;
  /** Original Reference copy and boolean member initialization. @param stream - Borrowed source reference. @param mbCloseStream - Original close request. @returns Guard. */
  constructor(
    stream: Reference<XInputStream>,
    private readonly mbCloseStream: boolean,
  ) {
    this.mxInStream = new Reference(stream);
  }
  /** Original destructor catches only UNO exceptions from close and releases the retained member after the body. @returns Nothing. */
  dispose(): void {
    try {
      if (this.mxInStream.is() && this.mbCloseStream) {
        try {
          (this.mxInStream.get() as XInputStream).closeInput();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    } finally {
      this.mxInStream.dispose();
    }
  }
}

/** Original noncopyable wrapper, with actual rtl parser reference and UNO token reference. */
export class FastParser {
  private readonly mxTokenHandler = new Reference<XFastTokenHandler>();
  private readonly mrNamespaceMap = StaticNamespaceMap();
  private readonly mxParser = new RtlReference<FastSaxParser>();
  /** Original parser/token-handler construction and assignment. @returns Parser wrapper. */
  constructor() {
    try {
      this.mxParser.set(new FastSaxParser());
      this.mxTokenHandler.assign(new FastTokenHandler());
      this.mxParser.operatorArrow().setTokenHandler(this.mxTokenHandler);
    } catch (error) {
      this.mxParser.dispose();
      this.mxTokenHandler.dispose();
      throw error;
    }
  }
  /** Original member destruction releases the actual parser/locator owner; no input stream is implicitly closed. @returns Nothing. */
  dispose(): void {
    this.mxParser.dispose();
    this.mxTokenHandler.dispose();
  }
  /** Original transitional registration followed by a distinct strict URI, preserving duplicate-registration failures. @param id - Generated namespace identity. @returns Nothing. */
  registerNamespace(id: number): void {
    if (!this.mxParser.is()) throw new RuntimeException();
    const uri = this.mrNamespaceMap.maTransitionalNamespaceMap.get(id);
    if (uri === undefined) throw new IllegalArgumentException();
    this.mxParser.operatorArrow().registerNamespace(uri, id);
    const strict = this.mrNamespaceMap.maStrictNamespaceMap.get(id);
    if (strict !== undefined && !uri.equals(strict))
      this.mxParser.operatorArrow().registerNamespace(strict, id);
  }
  /** Original receiver assignment to the actual owned SAX parser. @param handler - Consumed receiver. @returns Nothing. */
  setDocumentHandler(handler: Reference<XFastDocumentHandler>): void {
    if (!this.mxParser.is()) throw new RuntimeException();
    this.mxParser.operatorArrow().setFastDocumentHandler(handler);
  }
  /** Original clear uses the parser's normal receiver assignment. @returns Nothing. */
  clearDocumentHandler(): void {
    if (!this.mxParser.is()) return;
    const empty = new Reference<XFastDocumentHandler>();
    try {
      this.mxParser.operatorArrow().setFastDocumentHandler(empty);
    } finally {
      empty.dispose();
    }
  }
  /** Original token-handler borrow, retaining the exact lexical owner supplied to the SAX parser. @returns Consumed token handler. */
  getTokenHandler(): ReferenceConstParameter<XFastTokenHandler> {
    return this.mxTokenHandler;
  }
  /** Original source overload; false is the pinned header default. @param source - Borrowed InputSource. @param close - Close even on parsing failure. @returns Nothing. */
  parseStream(source: InputSource, close?: boolean): void;
  /** Original input/name and storage/name overloads open the actual synchronous storage when supplied, then construct an InputSource and delegates using the default false close policy. @param stream - Borrowed input. @param name - Source system identifier. @returns Nothing. */
  parseStream(stream: Reference<XInputStream> | StorageBase, name: OUStringConstReference): void;
  /** Original overload lowering retains source and guard owners across callbacks and exception unwind. @param source - Native selected source. @param argument - Close policy or stream name. @returns Nothing. */
  parseStream(
    source: InputSource | Reference<XInputStream> | StorageBase,
    argument: boolean | OUStringConstReference = false,
  ): void {
    if (source instanceof StorageBase) {
      const stream = source.openInputStream(argument as OUStringConstReference);
      try {
        this.parseStream(stream, argument as OUStringConstReference);
      } finally {
        stream.dispose();
      }
      return;
    }
    if (source instanceof Reference) {
      const input = new InputSource();
      try {
        input.sSystemId = argument as OUStringConstReference;
        input.aInputStream = source;
        this.parseStream(input);
      } finally {
        input.dispose();
      }
      return;
    }
    const guard = new InputStreamCloseGuard(source.aInputStream, argument as boolean);
    try {
      if (!this.mxParser.is()) throw new RuntimeException();
      this.mxParser.operatorArrow().parseStream(source);
    } finally {
      guard.dispose();
    }
  }
}
