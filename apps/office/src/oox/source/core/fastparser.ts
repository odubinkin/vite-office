/** @fileoverview Original oox::FastParser namespace, InputSource and optional stream-close ownership over the existing native SAX slice. Complete UNO document/token-handler service and StorageBase overload remain unported. */
import { FastSaxParser, type FastDocument } from "../../../sax/source/fastparser/fastparser";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
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

/** Consumed original wrapper; document/token receivers bind the existing host SAX interfaces without advertising complete UNO service identity. */
export class FastParser {
  private readonly mxTokenHandler: FastTokenHandler;
  private readonly mrNamespaceMap = StaticNamespaceMap();
  private readonly mxParser: FastSaxParser;
  /** Original parser/token-handler construction and assignment. @returns Parser wrapper. */
  constructor() {
    this.mxParser = new FastSaxParser();
    this.mxTokenHandler = new FastTokenHandler();
    this.mxParser.setTokenHandler(this.mxTokenHandler);
  }
  /** Original member destruction releases the actual parser/locator owner; no input stream is implicitly closed. @returns Nothing. */
  dispose(): void {
    this.mxParser.dispose();
  }
  /** Original transitional registration followed by a distinct strict URI, preserving duplicate-registration failures. @param id - Generated namespace identity. @returns Nothing. */
  registerNamespace(id: number): void {
    const uri = this.mrNamespaceMap.maTransitionalNamespaceMap.get(id);
    if (uri === undefined) throw new IllegalArgumentException();
    this.mxParser.registerNamespace(uri, id);
    const strict = this.mrNamespaceMap.maStrictNamespaceMap.get(id);
    if (strict !== undefined && uri !== strict) this.mxParser.registerNamespace(strict, id);
  }
  /** Original receiver assignment to the actual owned SAX parser. @param handler - Consumed receiver. @returns Nothing. */
  setDocumentHandler(handler: FastDocument | null): void {
    this.mxParser.setFastDocumentHandler(handler);
  }
  /** Original clear uses the parser's normal receiver assignment. @returns Nothing. */
  clearDocumentHandler(): void {
    this.mxParser.setFastDocumentHandler(null);
  }
  /** Original token-handler borrow, retaining the exact lexical owner supplied to the SAX parser. @returns Consumed token handler. */
  getTokenHandler(): FastTokenHandler {
    return this.mxTokenHandler;
  }
  /** Original source overload; false is the pinned header default. @param source - Borrowed InputSource. @param close - Close even on parsing failure. @returns Nothing. */
  parseStream(source: InputSource, close?: boolean): void;
  /** Original input/name overload constructs an InputSource and delegates using the default false close policy. @param stream - Borrowed input. @param name - Source system identifier. @returns Nothing. */
  parseStream(stream: Reference<XInputStream>, name: OUStringConstReference): void;
  /** Original overload lowering retains source and guard owners across callbacks and exception unwind. @param source - Native selected source. @param argument - Close policy or stream name. @returns Nothing. */
  parseStream(
    source: InputSource | Reference<XInputStream>,
    argument: boolean | OUStringConstReference = false,
  ): void {
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
      this.mxParser.parseStream(source);
    } finally {
      guard.dispose();
    }
  }
}
