/** @fileoverview Original Content handle and Content_Impl identity/lifecycle/command state from content.cxx. Cursor/transfer and property mutation methods remain unported and are not advertised; no positive content, broker or context provider is substituted. */
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { SimpleReferenceObject } from "../../../salhelper/source/simplereferenceobject";
import {
  Reference,
  UNO_QUERY,
  type BaseReference,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { queryInterface } from "../../../cppuhelper/inc/queryinterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XContentEventListener } from "../../../offapi/com/sun/star/ucb/XContentEventListener";
import type { XContent } from "../../../offapi/com/sun/star/ucb/XContent";
import type { XContentIdentifier } from "../../../offapi/com/sun/star/ucb/XContentIdentifier";
import type { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import { XCommandProcessor } from "../../../offapi/com/sun/star/ucb/XCommandProcessor";
import type { XUniversalContentBroker } from "../../../offapi/com/sun/star/ucb/XUniversalContentBroker";
import { UniversalContentBroker } from "../../../offapi/com/sun/star/ucb/UniversalContentBroker";
import { IllegalIdentifierException } from "../../../offapi/com/sun/star/ucb/IllegalIdentifierException";
import { ContentCreationException } from "../../../offapi/com/sun/star/ucb/ContentCreationException";
import { ContentCreationError as CreationError } from "../../../offapi/com/sun/star/ucb/ContentCreationError";
import type { ContentEvent } from "../../../offapi/com/sun/star/ucb/ContentEvent";
import { ContentAction } from "../../../offapi/com/sun/star/ucb/ContentAction";
import { Command } from "../../../offapi/com/sun/star/ucb/Command";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { XNameAccess } from "../../../cppu/inc/com/sun/star/container/XNameAccess";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import { XRow } from "../../../offapi/com/sun/star/sdbc/XRow";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as unknownPropertyType,
} from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { cancelCommandExecution } from "../../inc/cancelcommandexecution";
import { ActiveDataSink } from "../../inc/activedatasink";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import {
  OpenCommandArgument2,
  cppu_detail_getUnoType as openArgumentType,
} from "../../../offapi/com/sun/star/ucb/OpenCommandArgument2";
import { OpenMode } from "../../../offapi/com/sun/star/ucb/OpenMode";
/** Original compile-time sequence declarations use the existing logical LP64 sizeof bindings. */
const PropertyNames = Sequence.specialize<rtl_uStringSlot>("OUString", 8),
  PropertyValues = Sequence.specialize<Any>("Any", 24),
  Properties = Sequence.specialize<Property>(propertyType, 32);
/** Original static constexpr command-name literal; storage retains native static flags. */
const sgetPropertyValues = new OUStringLiteral(
  Uint16Array.from(
    "getPropertyValues\0",
    /** Original known UTF16 literal unit. @param c - Source character. @returns Code unit. */ (
      c,
    ) => c.charCodeAt(0),
  ),
);
/** Original borrowed environment owner, without assign/clear/destruction exposure. */
export type CommandEnvironmentConstReference = Pick<
  Reference<XCommandEnvironment>,
  "get" | "is" | "operatorArrow" | "operatorStar"
> &
  BaseReference;
/** Compiler-known source ASCII literal. @param value - Source bytes. @returns Owned RTL string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Original ASCII code unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original creation failure with empty Context. @param message - Borrowed message. @param error - Original enum. @returns Never. */
function creationFailure(message: OUStringConstReference, error: CreationError): never {
  const context = new Reference();
  try {
    throw new ContentCreationException(message, context, error);
  } finally {
    context.dispose();
  }
}
/** Original provider presence check. @param broker - Real broker. @param url - Original URL. @returns Nothing. */
function ensureContentProviderForURL(
  broker: Reference<XUniversalContentBroker>,
  url: OUStringConstReference,
): void {
  const provider = broker.operatorStar().queryContentProvider(url);
  try {
    if (!provider.is()) {
      const message = literal("No Content Provider available for URL: ");
      try {
        message.append(url);
        creationFailure(message, CreationError.NO_CONTENT_PROVIDER);
      } finally {
        message.dispose();
      }
    }
  } finally {
    provider.dispose();
  }
}
/** Original checked identifier acquisition. @param broker - Real broker. @param url - Original URL. @returns Acquired identifier. */
function getContentIdentifierThrow(
  broker: Reference<XUniversalContentBroker>,
  url: OUStringConstReference,
): Reference<XContentIdentifier> {
  const id = broker.operatorStar().createContentIdentifier(url);
  try {
    if (!id.is()) {
      ensureContentProviderForURL(broker, url);
      const message = literal("Unable to create Content Identifier!");
      try {
        creationFailure(message, CreationError.IDENTIFIER_CREATION_FAILED);
      } finally {
        message.dispose();
      }
    }
    return id;
  } catch (error) {
    id.dispose();
    throw error;
  }
}
/** Original checked content acquisition, catching only IllegalIdentifierException. @param broker - Real broker. @param id - Real identifier. @returns Acquired content. */
function getContentThrow(
  broker: Reference<XUniversalContentBroker>,
  id: Reference<XContentIdentifier>,
): Reference<XContent> {
  const content = new Reference<XContent>(),
    message = new OUString();
  try {
    try {
      const result = broker.operatorStar().queryContent(id);
      try {
        content.assign(result);
      } finally {
        result.dispose();
      }
    } catch (error) {
      if (!(error instanceof IllegalIdentifierException)) throw error;
      try {
        message.assign(error.Message);
      } finally {
        error.dispose();
      }
    }
    if (!content.is()) {
      const url = id.operatorStar().getContentIdentifier();
      try {
        ensureContentProviderForURL(broker, url);
      } finally {
        url.dispose();
      }
      const detail = literal("Unable to create Content for <"),
        identifier = id.operatorStar().getContentIdentifier(),
        tail = literal(">: ");
      try {
        detail.append(identifier);
        detail.append(tail);
        detail.append(message);
        creationFailure(detail, CreationError.CONTENT_CREATION_FAILED);
      } finally {
        tail.dispose();
        identifier.dispose();
        detail.dispose();
      }
    }
    return content;
  } catch (error) {
    content.dispose();
    throw error;
  } finally {
    message.dispose();
  }
}
/** Original intrusive client implementation. Internal fields bind the source friend listener, not a public testing/state interface. Native mutex/thread scheduling is not represented by an invented JS lock. */
class Content_Impl extends SimpleReferenceObject {
  readonly m_aURL = new OUString();
  readonly m_xCtx = new Reference<XComponentContext>();
  readonly m_xContent = new Reference<XContent>();
  readonly m_xCommandProcessor = new Reference<XCommandProcessor>();
  readonly m_xEnv = new Reference<XCommandEnvironment>();
  readonly m_xContentEventListener = new RtlReference<ContentEventListener_Impl>();
  /** Original default or context/content/environment construction. @param args - Original arguments. @returns Actual implementation. */
  constructor(
    ...args:
      | []
      | [
          context: Reference<XComponentContext>,
          content: Reference<XContent>,
          environment: Reference<XCommandEnvironment>,
        ]
  ) {
    super();
    try {
      if (args.length === 3) {
        this.m_xCtx.assign(args[0]);
        this.m_xContent.assign(args[1]);
        this.m_xEnv.assign(args[2]);
        if (!args[0].is()) throw new Error("assert(rCtx.is())");
        if (this.m_xContent.is()) {
          this.m_xContentEventListener.set(new ContentEventListener_Impl(this));
          const listener = new Reference<XContentEventListener>(this.m_xContentEventListener.get());
          try {
            this.m_xContent.operatorStar().addContentEventListener(listener);
          } finally {
            listener.dispose();
          }
        }
      }
    } catch (error) {
      this.disposeMembers();
      super.destroy();
      throw error;
    }
  }
  /** Original remove-listener call catches RuntimeException only. @param content - Borrowed content. @returns Nothing. */
  private removeListener(content: Reference<XContent>): void {
    try {
      const listener = new Reference<XContentEventListener>(this.m_xContentEventListener.get());
      try {
        content.operatorStar().removeContentEventListener(listener);
      } finally {
        listener.dispose();
      }
    } catch (error) {
      if (!(error instanceof RuntimeException)) throw error;
      error.dispose();
    }
  }
  /** Original reinitialization retains cached URL and clears command processor before listener removal. @param content - New content or empty reference. @returns Nothing. */
  reinit(content: Reference<XContent>): void {
    this.m_xCommandProcessor.clear();
    if (this.m_xContent.is()) this.removeListener(this.m_xContent);
    if (content.is()) {
      this.m_xContent.assign(content);
      const listener = new Reference<XContentEventListener>(this.m_xContentEventListener.get());
      try {
        this.m_xContent.operatorStar().addContentEventListener(listener);
      } finally {
        listener.dispose();
      }
    } else {
      this.getURL_NoLock();
      this.m_xContent.clear();
    }
  }
  /** Original destructor body and reverse fields/base cleanup. @returns Nothing. */
  protected override destroy(): void {
    try {
      if (this.m_xContent.is()) this.removeListener(this.m_xContent);
    } finally {
      this.disposeMembers();
      super.destroy();
    }
  }
  /** Compiler lowering of original reverse member cleanup, including constructor unwinding. @returns Nothing. */
  private disposeMembers(): void {
    this.m_xContentEventListener.dispose();
    this.m_xEnv.dispose();
    this.m_xCommandProcessor.dispose();
    this.m_xContent.dispose();
    this.m_xCtx.dispose();
    this.m_aURL.dispose();
  }
  /** Original source identity guard, clearing URL/processor/content before detaching listener. @param event - Actual disposing event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    if (!event.Source.operatorEquals(this.m_xContent)) return;
    const content = new Reference(this.m_xContent);
    try {
      this.m_aURL.clear();
      this.m_xCommandProcessor.clear();
      this.m_xContent.clear();
      if (content.is()) this.removeListener(content);
    } finally {
      content.dispose();
    }
  }
  /** Original lazy borrowed URL getter. @returns Borrowed cached URL. */
  getURL(): OUStringConstReference {
    if (this.m_aURL.isEmpty() && this.m_xContent.is()) return this.getURL_NoLock();
    return this.m_aURL;
  }
  /** Original content identifier lookup only while URL is empty. @returns Borrowed cached URL. */
  private getURL_NoLock(): OUStringConstReference {
    if (this.m_aURL.isEmpty() && this.m_xContent.is()) {
      const id = this.m_xContent.operatorStar().getIdentifier();
      try {
        if (id.is()) {
          const url = id.operatorStar().getContentIdentifier();
          try {
            this.m_aURL.assign(url);
          } finally {
            url.dispose();
          }
        }
      } finally {
        id.dispose();
      }
    }
    return this.m_aURL;
  }
  /** Original acquired content getter and lazy recreation. @returns Actual content reference. */
  getContent(): Reference<XContent> {
    if (!this.m_xContent.is() && !this.m_aURL.isEmpty())
      return new Reference(this.getContent_NoLock());
    return new Reference(this.m_xContent);
  }
  /** Original real broker recreation path; debug-only ENSURE argument calls are omitted in the product path. @returns Borrowed content field. */
  private getContent_NoLock(): Reference<XContent> {
    if (!this.m_xContent.is() && !this.m_aURL.isEmpty()) {
      const broker = UniversalContentBroker.create(this.getComponentContext());
      try {
        const id = broker.operatorStar().createContentIdentifier(this.m_aURL);
        try {
          if (id.is()) {
            try {
              const content = broker.operatorStar().queryContent(id);
              try {
                this.m_xContent.assign(content);
              } finally {
                content.dispose();
              }
            } catch (error) {
              if (!(error instanceof IllegalIdentifierException)) throw error;
              error.dispose();
            }
            if (this.m_xContent.is()) {
              const listener = new Reference<XContentEventListener>(
                this.m_xContentEventListener.get(),
              );
              try {
                this.m_xContent.operatorStar().addContentEventListener(listener);
              } finally {
                listener.dispose();
              }
            }
          }
        } finally {
          id.dispose();
        }
      } finally {
        broker.dispose();
      }
    }
    return this.m_xContent;
  }
  /** Original borrowed context getter and source nonempty assertion. @returns Actual stored context. */
  private getComponentContext(): Reference<XComponentContext> {
    if (!this.m_xCtx.is()) throw new Error("assert(m_xCtx.is())");
    return this.m_xCtx;
  }
  /** Original lazy UNO query and acquired processor return. @returns Processor or empty reference. */
  getCommandProcessor(): Reference<XCommandProcessor> {
    if (!this.m_xCommandProcessor.is())
      this.m_xCommandProcessor.set(
        this.getContent_NoLock(),
        UNO_QUERY,
        XCommandProcessor.static_type,
      );
    return new Reference(this.m_xCommandProcessor);
  }
  /** Original synchronous command execution with ID0 and stored environment. @param command - Borrowed actual command. @returns Owned result or void Any for missing processor. */
  executeCommand(command: Readonly<Command>): Any {
    const processor = this.getCommandProcessor();
    try {
      return !processor.is()
        ? new Any()
        : processor.operatorStar().execute(command, 0, this.m_xEnv);
    } finally {
      processor.dispose();
    }
  }
  /** Original borrowed environment field. @returns Borrowed reference. */
  getEnvironment(): CommandEnvironmentConstReference {
    return this.m_xEnv;
  }
  /** Original environment assignment. @param environment - Borrowed new reference. @returns Nothing. */
  setEnvironment(environment: Reference<XCommandEnvironment>): void {
    this.m_xEnv.assign(environment);
  }
  /** Original post-insert invalidation keeps content and other state. @returns Nothing. */
  inserted(): void {
    this.m_aURL.clear();
  }
}
/** Original listener has a raw borrowed parent and explicitly queries both event interfaces before OWeakObject. */
class ContentEventListener_Impl extends OWeakObject implements XContentEventListener {
  /** Original raw borrowed parent. @param content - Actual implementation. @returns Listener. */
  constructor(private readonly m_rContent: Content_Impl) {
    super();
  }
  /** Original declared interface order and weak-base fallback. @param type - Demanded type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    const result = queryInterface(type, [
      [XContentEventListener.static_type, this],
      [XEventListener.static_type, this],
    ]);
    if (result.hasValue()) return result;
    try {
      return super.queryInterface(type);
    } finally {
      result.dispose();
    }
  }
  /** Original qualified weak-base acquire. @returns Nothing. */
  override acquire(): void {
    super.acquire();
  }
  /** Original qualified weak-base release. @returns Nothing. */
  override release(): void {
    super.release();
  }
  /** Original source guard and DELETED/EXCHANGED actions only. @param event - Borrowed source event. @returns Nothing. */
  contentEvent(event: Readonly<ContentEvent>): void {
    if (!event.Source.operatorEquals(this.m_rContent.m_xContent)) return;
    if (event.Action === ContentAction.DELETED) {
      const empty = new Reference<XContent>();
      try {
        this.m_rContent.reinit(empty);
      } finally {
        empty.dispose();
      }
    } else if (event.Action === ContentAction.EXCHANGED) this.m_rContent.reinit(event.Content);
  }
  /** Original disposing delegate. @param event - Borrowed source event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.m_rContent.disposing(event);
  }
}
/** Original public shared intrusive client handle; unported methods are absent rather than positive placeholders. */
export class Content {
  private m_xImpl = new RtlReference<Content_Impl>();
  /** Original default, copy, URL and content-reference constructors. @param args - Original selected arguments. @returns Client handle. */
  constructor(
    ...args:
      | []
      | [source: Content]
      | [
          url: OUStringConstReference,
          environment: Reference<XCommandEnvironment>,
          context: Reference<XComponentContext>,
        ]
      | [
          content: Reference<XContent>,
          environment: Reference<XCommandEnvironment>,
          context: Reference<XComponentContext>,
        ]
  ) {
    if (args.length === 0) this.m_xImpl.set(new Content_Impl());
    else if (args.length === 1) this.m_xImpl.assign(args[0].m_xImpl);
    else if (args[0] instanceof Reference)
      this.m_xImpl.set(new Content_Impl(args[2], args[0], args[1]));
    else {
      const broker = UniversalContentBroker.create(args[2]);
      try {
        const id = getContentIdentifierThrow(broker, args[0]);
        try {
          const content = getContentThrow(broker, id);
          try {
            this.m_xImpl.set(new Content_Impl(args[2], content, args[1]));
          } finally {
            content.dispose();
          }
        } finally {
          id.dispose();
        }
      } finally {
        broker.dispose();
      }
    }
  }
  /** Original move construction transfers the intrusive handle. @param source - Actual rvalue. @returns Transferred client. */
  static move(source: Content): Content {
    const result = Object.create(Content.prototype) as Content;
    result.m_xImpl = RtlReference.move(source.m_xImpl);
    return result;
  }
  /** Original static create uses unchecked identifier and IllegalIdentifier-only no-throw content lookup. @param url - Original URL. @param environment - Original environment. @param context - Actual context. @param result - Existing output client. @returns Success. */
  static create(
    url: OUStringConstReference,
    environment: Reference<XCommandEnvironment>,
    context: Reference<XComponentContext>,
    result: Content,
  ): boolean {
    const broker = UniversalContentBroker.create(context);
    try {
      const id = broker.operatorStar().createContentIdentifier(url);
      try {
        if (!id.is()) return false;
        const content = new Reference<XContent>();
        try {
          try {
            const found = broker.operatorStar().queryContent(id);
            try {
              content.assign(found);
            } finally {
              found.dispose();
            }
          } catch (error) {
            if (!(error instanceof IllegalIdentifierException)) throw error;
            error.dispose();
          }
          if (!content.is()) return false;
          result.m_xImpl.set(new Content_Impl(context, content, environment));
          return true;
        } finally {
          content.dispose();
        }
      } finally {
        id.dispose();
      }
    } finally {
      broker.dispose();
    }
  }
  /** Original default destructor delegates intrusive ownership. @returns Nothing. */
  dispose(): void {
    this.m_xImpl.dispose();
  }
  /** Original copy assignment. @param source - Borrowed source client. @returns This client. */
  assign(source: Content): this {
    this.m_xImpl.assign(source.m_xImpl);
    return this;
  }
  /** Original move assignment retains underlying handle self-move behavior. @param source - Actual rvalue. @returns This client. */
  moveAssign(source: Content): this {
    this.m_xImpl.moveAssign(source.m_xImpl);
    return this;
  }
  /** Original acquired content getter. @returns Content or empty reference. */
  get(): Reference<XContent> {
    return this.m_xImpl.operatorStar().getContent();
  }
  /** Original borrowed URL getter. @returns Actual cached URL. */
  getURL(): OUStringConstReference {
    return this.m_xImpl.operatorStar().getURL();
  }
  /** Original borrowed environment getter. @returns Stored field. */
  getCommandEnvironment(): CommandEnvironmentConstReference {
    return this.m_xImpl.operatorStar().getEnvironment();
  }
  /** Original environment replacement shared by copied handles. @param environment - Borrowed new environment. @returns Nothing. */
  setCommandEnvironment(environment: Reference<XCommandEnvironment>): void {
    this.m_xImpl.operatorStar().setEnvironment(environment);
  }
  /** Original singleton property-name sequence and copied first result. @param name - Borrowed property name. @returns Owned Any, including a void result. */
  getPropertyValue(name: OUStringConstReference): Any {
    const initializer = new OUString(name);
    let names: Sequence<rtl_uStringSlot>;
    try {
      names = new PropertyNames(
        {
          /** Compiler lowering of the singleton initializer-list's actual OUString lvalue. @param offset - Declared zero offset. @returns Existing string pointer field. */
          get(offset: number): rtl_uStringSlot {
            void offset;
            return initializer.getDataAddress();
          },
        },
        1,
      );
    } finally {
      initializer.dispose();
    }

    try {
      const values = this.getPropertyValues(names);
      try {
        return new Any(values.operatorIndex(0));
      } finally {
        values.dispose();
      }
    } finally {
      names.dispose();
    }
  }
  /** Original row lookup then native Any sequence initialization and one-based getObject loop. @param names - Actual property-name sequence. @returns Owned result sequence. */
  getPropertyValues(names: Sequence<rtl_uStringSlot>): Sequence<Any> {
    const row = this.getPropertyValuesInterface(names);
    try {
      const count = names.getLength(),
        values = new PropertyValues(count);
      try {
        if (row.is()) {
          const data = values.getArray() as SequenceElements;
          for (let n = 0; n < count; ++n) {
            const typeMap = new Reference<XNameAccess>();
            try {
              const value = row.operatorStar().getObject(n + 1, typeMap);
              try {
                // The existing source Any move body runs on the actual allocated element address; no wrapper, copy or new owner is constructed.
                Any.prototype.moveAssign.call(data.get(n * 24) as Any, value);
              } finally {
                value.dispose();
              }
            } finally {
              typeMap.dispose();
            }
          }
        }
        return values;
      } catch (error) {
        values.dispose();
        throw error;
      }
    } finally {
      row.dispose();
    }
  }
  /** Original Property defaults, explicit Name/Handle writes, command construction and row extraction. @param names - Actual source names. @returns Acquired row or empty reference. */
  getPropertyValuesInterface(names: Sequence<rtl_uStringSlot>): Reference<XRow> {
    const count = names.getLength(),
      properties = new Properties(count);
    try {
      const props = properties.getArray() as SequenceElements,
        source = names.getConstArray() as SequenceElements;
      for (let n = 0; n < count; ++n) {
        // Compiler lowering of Property* indexing and its actual Name/Handle member addresses. Type and Attributes keep original default construction.
        const property = props.get(n * 32) as SequenceElements;
        (OUString.unacquired(property.get(0) as rtl_uStringSlot) as OUString).assign(
          OUString.unacquired(source.get(n * 8) as rtl_uStringSlot),
        );
        (property.get(8) as [number])[0] = -1;
      }
      const command = new Command();
      try {
        command.Name.assign(sgetPropertyValues);
        command.Handle = -1;
        command.Argument.insert(properties.getAddress(), ["Sequence", propertyType]);
        const result = this.m_xImpl.operatorStar().executeCommand(command);
        try {
          const row = new Reference<XRow>();
          try {
            result.extract(row.getAddress(), XRow.static_type);
            return row;
          } catch (error) {
            row.dispose();
            throw error;
          }
        } finally {
          result.dispose();
        }
      } finally {
        command.dispose();
      }
    } finally {
      properties.dispose();
    }
  }
  /** Original boolean document-property lookup and generic command cancellation. @returns Original IsDocument value or typed failure. */
  isDocument(): boolean {
    const name = literal("IsDocument"),
      value = this.getPropertyValue(name),
      output: [boolean] = [false];
    try {
      if (value.extract(output, "bool")) return output[0];
    } finally {
      value.dispose();
      name.dispose();
    }
    const message = literal("Unable to retrieve value of property 'IsDocument'!"),
      context = this.get();
    try {
      const error = new UnknownPropertyException(message, context);
      try {
        const payload = new Any(error, unknownPropertyType);
        try {
          return cancelCommandExecution(
            payload,
            this.m_xImpl.operatorStar().getEnvironment() as Reference<XCommandEnvironment>,
          );
        } finally {
          payload.dispose();
        }
      } finally {
        error.dispose();
      }
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original document stream opening through an actual ActiveDataSink and open command. @returns Acquired input stream or empty reference. */
  openStream(): Reference<XInputStream> {
    if (!this.isDocument()) return new Reference<XInputStream>();
    const sink = new Reference<XActiveDataSink>(new ActiveDataSink()),
      argument = new OpenCommandArgument2();
    try {
      argument.Mode = OpenMode.DOCUMENT;
      argument.Priority = 0;
      argument.Sink = sink;
      const properties = new Properties(0);
      try {
        argument.Properties = properties;
      } finally {
        properties.dispose();
      }
      const command = new Command();
      try {
        const name = literal("open");
        try {
          command.Name = name;
        } finally {
          name.dispose();
        }
        command.Handle = -1;
        command.Argument.insert(argument, openArgumentType);
        const result = this.m_xImpl.operatorStar().executeCommand(command);
        result.dispose();
      } finally {
        command.dispose();
      }
      return sink.operatorStar().getInputStream();
    } finally {
      argument.dispose();
      sink.dispose();
    }
  }
  /** Original name/argument command creates handle -1 before delegating. @param name - Original command name. @param argument - Borrowed actual argument. @returns Owned command result. */
  executeCommand(name: OUStringConstReference, argument: Any): Any {
    const command = new Command();
    try {
      command.Name = name;
      command.Handle = -1;
      command.Argument = argument;
      return this.m_xImpl.operatorStar().executeCommand(command);
    } finally {
      command.dispose();
    }
  }
}
