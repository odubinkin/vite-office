/** @fileoverview Real native UNO document, parser callback, IO and live-list operations without a host DOM; the production registered DocumentBuilder shares the same realm-local native module. */
import { XDocumentHandler } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XSAXSerializable } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XSAXSerializable";
import type { XAttributeList } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XAttributeList";
import type { XLocator } from "../../apps/office/src/offapi/com/sun/star/xml/sax/XLocator";
import type { OUStringConstReference } from "../../apps/office/src/sal/inc/rtl/ustring";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as stringPairType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/StringPair";
import { PropertyBag as PropertyBagService } from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyBag";
import { XModifiable } from "../../apps/office/src/offapi/com/sun/star/util/XModifiable";
import { XPropertyState } from "../../apps/office/src/udkapi/com/sun/star/beans/XPropertyState";
import { Type } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Type";
import { initializeLibXml2 } from "../../apps/office/src/external/libxml2/libxml2";
import { installParserCallbacks } from "../../apps/office/src/external/libxml2/parsercallbacks";
import { Reference, UNO_QUERY } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { SequenceInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { CDocument } from "../../apps/office/src/unoxml/source/dom/document";
import {
  context_t,
  nativeIoContext,
} from "../../apps/office/src/unoxml/source/dom/documentbuilder.io";
import { parserException } from "../../apps/office/src/unoxml/source/dom/documentbuilder.errors";
import { domLiteral } from "../../apps/office/src/unoxml/source/dom/node";
import { warningTestFile } from "../../apps/office/src/test/native-builder-fixtures";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { implementations } from "../../apps/office/src/desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../apps/office/src/desktop/source/app/appinit";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import {
  WeakComponentImplHelper as PublicComponent,
  WeakImplHelper as PublicWeak,
} from "../../apps/office/src/comphelper/inc/compbase";
import { XPropertyChangeListener } from "../../apps/office/src/udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XPropertySetInfo } from "../../apps/office/src/udkapi/com/sun/star/beans/XPropertySetInfo";
import type { PropertyChangeEventConstReference } from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyChangeEvent";
import { XEventListener } from "../../apps/office/src/udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../apps/office/src/udkapi/com/sun/star/lang/EventObject";
import {
  OBroadcastHelper,
  OInterfaceIteratorHelper,
} from "../../apps/office/src/cppuhelper/inc/interfacecontainer";
import { OMultiTypeInterfaceContainerHelperInt32 } from "../../apps/office/src/cppuhelper/inc/propshlp";
import {
  PropertyChangeEvent,
  cppu_detail_getUnoType_PropertyChangeEvent as eventType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyChangeEvent";
import { OStatefulPropertySet } from "../../apps/office/src/comphelper/inc/propstate";
import {
  OPropertyArrayHelper,
  type IPropertyArrayHelper,
} from "../../apps/office/src/cppuhelper/inc/propshlp";
import { OPropertySetHelperInfo_Impl } from "../../apps/office/src/cppuhelper/source/propshlp";
import { XPropertySetInfo } from "../../apps/office/src/udkapi/com/sun/star/beans/XPropertySetInfo";
import { PropertyBag } from "../../apps/office/src/comphelper/inc/propertybag";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/Property";
import {
  REMOVABLE,
  BOUND,
} from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyAttribute";
import { XPathAPI } from "../../apps/office/src/offapi/com/sun/star/xml/xpath/XPathAPI";
import { Converter } from "../../apps/office/src/udkapi/com/sun/star/script/Converter";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { PropertyValueSet } from "../../apps/office/src/ucbhelper/inc/propertyvalueset";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../apps/office/src/cppu/inc/unotype";
import { DocumentBuilder } from "../../apps/office/src/offapi/com/sun/star/xml/dom/DocumentBuilder";
import {
  RuntimeException,
  cppu_detail_getUnoType as runtimeType,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/RuntimeException";
import { throwException, getCaughtException } from "../../apps/office/src/cppuhelper/inc/exc_hlp";
import {
  initializeExceptionAbi,
  withCaughtException,
} from "../../apps/office/src/cppuhelper/browser/exception-abi";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);

/** Executes genuine graph operations in whichever browser realm invokes it. @returns Structured-clone-safe observations, with no native pointer crossing a realm boundary. */
export async function runNativeDomWorkerProbe() {
  const m = await initializeLibXml2(),
    owned: { dispose(): void }[] = [];
  /** Retains one actual source result to deterministic scope exit. @param value - Actual owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owned.push(value);
    return value;
  }
  /** Source literal value binding. @param value - Fixture text. @returns Actual owned RTL value. */
  function u(value: string) {
    return own(domLiteral(value));
  }
  /** Consumes an actual owned API string. @param value - Actual result. @returns Fixture text. */
  function take(value: OUString): string {
    try {
      return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
    } finally {
      value.dispose();
    }
  }
  initializeExceptionAbi();
  InitApplicationServiceManager(implementations);
  /** Actual application-owned SAX observer; only source callbacks mutate observations. */
  class SaxObserver extends PublicWeak.specialize(XDocumentHandler) implements XDocumentHandler {
    readonly calls: string[] = [];
    /** Original begin callback. @returns Nothing. */ startDocument(): void {
      this.calls.push("begin");
    }
    /** Original finish callback. @returns Nothing. */ endDocument(): void {
      this.calls.push("finish");
    }
    /** Original element callback reads real native attributes. @param name - Name. @param attributes - Actual list. @returns Nothing. */ startElement(
      name: OUStringConstReference,
      attributes: Reference<XAttributeList>,
    ): void {
      this.calls.push(
        "start:" + take(new OUString(name)) + ":" + attributes.operatorStar().getLength(),
      );
    }
    /** Original end callback. @param name - Name. @returns Nothing. */ endElement(
      name: OUStringConstReference,
    ): void {
      void name;
      this.calls.push("end");
    }
    /** Original text callback. @param value - Text. @returns Nothing. */ characters(
      value: OUStringConstReference,
    ): void {
      this.calls.push(
        "text:" + String.fromCharCode(...value.getStr().subarray(0, value.getLength())),
      );
    }
    /** Original spacing callback. @param value - Spacing. @returns Nothing. */ ignorableWhitespace(
      value: OUStringConstReference,
    ): void {
      void value;
      this.calls.push("space");
    }
    /** Original PI callback. @param target - Target. @param value - Data. @returns Nothing. */ processingInstruction(
      target: OUStringConstReference,
      value: OUStringConstReference,
    ): void {
      void target;
      void value;
      this.calls.push("pi");
    }
    /** Original locator callback. @param locator - Locator. @returns Nothing. */ setDocumentLocator(
      locator: Reference<XLocator>,
    ): void {
      void locator;
      this.calls.push("locator");
    }
  }
  const saxBuilder = own(
      DocumentBuilder.create(
        own(new Reference<XComponentContext>(getProcessComponentContext().get())),
      ),
    ),
    saxDocument = own(saxBuilder.operatorStar().newDocument()),
    saxRoot = own(saxDocument.operatorStar().createElement(u("root")));
  own(saxDocument.operatorStar().appendChild(saxRoot));
  own(
    saxRoot
      .operatorStar()
      .appendChild(own(saxDocument.operatorStar().createTextNode(u("worker SAX字")))),
  );
  const saxHandler = own(new Reference(new SaxObserver())),
    saxFacet = own(
      new Reference<XSAXSerializable>(saxDocument, UNO_QUERY, XSAXSerializable.static_type),
    ),
    saxNamespaces = own(new (Sequence.specialize<StringPair>(stringPairType, 16))());
  saxFacet.operatorStar().serialize(saxHandler, saxNamespaces);
  const nativeSax = {
    calls: saxHandler.operatorStar().calls,
    sameIdentity: saxFacet.get() === saxDocument.get(),
  };
  const Public = PublicComponent.specialize(),
    publicComponent = own(new Reference(new Public()));
  let publicNotifications = 0,
    publicEventIdentity = false;
  /** Actual public application listener over the source plain helper. */
  class PublicListener extends PublicWeak.specialize(XEventListener) implements XEventListener {
    /** Observes the real component event. @param event - Original event. @returns Nothing. */ disposing(
      event: Readonly<EventObject>,
    ): void {
      ++publicNotifications;
      publicEventIdentity = event.Source.get() === publicComponent.get();
    }
  }
  const publicListener = own(new Reference(new PublicListener()));
  publicComponent.operatorStar().addEventListener(publicListener);
  publicComponent.operatorStar().dispose();
  publicComponent.operatorStar().addEventListener(publicListener);
  publicComponent.operatorStar().dispose();
  const publicTypes = own(publicComponent.operatorStar().getTypes());
  const publicHelpers = {
    notifications: publicNotifications,
    sameEventSource: publicEventIdentity,
    componentTypeCount: publicTypes.getLength(),
  };
  const broadcaster = own(new OBroadcastHelper()),
    listenerType = XEventListener.static_type();
  broadcaster.addListener(listenerType, publicListener);
  broadcaster.addListener(listenerType, publicListener);
  const legacyContainer = broadcaster.getContainer(listenerType);
  if (legacyContainer === null) throw new Error("Native listener container missing");
  const legacyIterator = new OInterfaceIteratorHelper(legacyContainer),
    oldListener = legacyIterator.next();
  broadcaster.removeListener(listenerType, publicListener);
  const oldSnapshot = legacyIterator.next();
  legacyIterator.dispose();
  const legacyInts = own(new OMultiTypeInterfaceContainerHelperInt32());
  legacyInts.addInterface(-7, publicListener);
  const legacyKeys = own(legacyInts.getContainedTypes());
  const legacyListeners = {
    remaining: legacyContainer.getLength(),
    sameFirst: oldListener === publicListener.get(),
    sameSnapshot: oldSnapshot === publicListener.get(),
    keyCount: legacyKeys.getLength(),
    key: ((legacyKeys.getConstArray() as SequenceElements).get(0) as [number])[0],
  };
  const propertyBag = own(new PropertyBag()),
    initialProperty = own(new Any([41], "sal_Int32")),
    newProperty = own(new Any([42], "sal_Int16")),
    convertedProperty = own(new Any()),
    oldProperty = own(new Any()),
    defaultProperty = own(new Any());
  propertyBag.addProperty(u("workerValue"), 7, REMOVABLE, initialProperty);
  const propertyChanged = propertyBag.convertFastPropertyValue(
    7,
    newProperty,
    convertedProperty,
    oldProperty,
  );
  propertyBag.setFastPropertyValue(7, convertedProperty);
  propertyBag.getPropertyDefaultByHandle(7, defaultProperty);
  const PropertyValues = Sequence.specialize<Property>(propertyType, 32),
    descriptions = own(new PropertyValues());
  propertyBag.describeProperties(descriptions);
  const descriptor = own(
      new Property(
        Property.unacquired(
          (descriptions.getConstArray() as SequenceElements).get(0) as {
            get(offset: number): unknown;
          },
        ),
      ),
    ),
    currentProperty: [number] = [0],
    initialDefault: [number] = [0];
  convertedProperty.extract(currentProperty, "sal_Int32");
  defaultProperty.extract(initialDefault, "sal_Int32");
  const dynamicProperties = {
    changed: propertyChanged,
    value: currentProperty[0],
    initialDefault: initialDefault[0],
    name: take(descriptor.Name.copy(0)),
    handle: descriptor.Handle,
    declaredLong: descriptor.Type.equals(UnoType.get("sal_Int32")),
    stableTypeField: descriptor.get(16) === descriptor.Type.getAddress(),
  };
  const arrayHelper = own(new OPropertyArrayHelper(descriptions)),
    propertyInfo = own(new Reference(new OPropertySetHelperInfo_Impl(arrayHelper))),
    infoApi = propertyInfo.operatorStar(),
    infoDescriptor = own(infoApi.getPropertyByName(u("workerValue"))),
    infoQuery = own(infoApi.queryInterface(XPropertySetInfo.static_type())),
    queriedInfo = own(new Reference());
  infoQuery.extract(queriedInfo.getAddress(), XPropertySetInfo.static_type);
  const propertyArray = {
    count: arrayHelper.getCount(),
    handle: arrayHelper.getHandleByName(u("workerValue")),
    missing: arrayHelper.getHandleByName(u("missing")),
    snapshotName: take(infoDescriptor.Name.copy(0)),
    sameInfoIdentity: queriedInfo.get() === infoApi,
  };
  const NativeValues = Sequence.specialize<Any>("Any", 24),
    nativeValues = own(new NativeValues(2)),
    rawValue = (nativeValues.getArray() as SequenceElements).get(0) as Any,
    rawInterface = (nativeValues.getArray() as SequenceElements).get(24) as Any,
    NativeEvents = Sequence.specialize<PropertyChangeEvent>(eventType, 72),
    nativeEvents = own(new NativeEvents(1)),
    eventFields = (nativeEvents.getArray() as SequenceElements).get(0) as {
      get(offset: number): unknown;
    },
    rawOld = eventFields.get(24) as Any,
    rawConverted = eventFields.get(48) as Any,
    liveRawType = Any.prototype.getValueType.call(rawConverted);
  Any.prototype.insert.call(rawValue, [43], "sal_Int16");
  propertyBag.convertFastPropertyValue(7, rawValue, rawConverted, rawOld);
  propertyBag.setFastPropertyValue(7, rawConverted);
  propertyBag.getPropertyDefaultByHandle(7, rawOld);
  Any.prototype.insert.call(rawInterface, publicListener.getAddress(), XEventListener.static_type);
  const rawQuery = own(Reference.fromAny(rawInterface, UNO_QUERY, XEventListener.static_type));
  const nativeAnyFields = {
    value: Any.prototype.get.call(rawConverted, "sal_Int32"),
    initialDefault: Any.prototype.get.call(rawOld, "sal_Int32"),
    liveType:
      liveRawType === Any.prototype.getValueType.call(rawConverted) &&
      liveRawType.equals(UnoType.get("sal_Int32")),
    interfaceIdentity: rawQuery.get() === publicListener.get(),
  };
  /** Concrete native helper caller owns actual source dynamic properties, without registering a substitute metadata service. */
  class StatefulOwner extends OStatefulPropertySet {
    private readonly bag = new PropertyBag();
    private readonly info: OPropertyArrayHelper;
    /** Original property registration and real description snapshot. @returns Owner. */ constructor() {
      super();
      const initial = new Any([41], "sal_Int32"),
        descriptions = new PropertyValues();
      try {
        this.bag.addProperty(u("A"), 7, BOUND, initial);
        this.bag.describeProperties(descriptions);
        this.info = new OPropertyArrayHelper(descriptions);
      } finally {
        descriptions.dispose();
        initial.dispose();
      }
    }
    /** Actual derived fields precede the original base destructor chain. @returns Nothing. */ protected override destroy(): void {
      this.info.dispose();
      this.bag.dispose();
      super.destroy();
    }
    /** Original metadata callback. @returns Actual helper. */ protected override getInfoHelper(): IPropertyArrayHelper {
      return this.info;
    }
    /** Original info factory. @returns Acquired actual snapshot. */ getPropertySetInfo(): Reference<XPropertySetInfo> {
      return OStatefulPropertySet.createPropertySetInfo(this.info);
    }
    /** Original bag conversion. @param converted - Output. @param old - Output. @param handle - Handle. @param value - Input. @returns Changed. */ protected override convertFastPropertyValue(
      converted: Any,
      old: Any,
      handle: number,
      value: Any,
    ): boolean {
      return this.bag.convertFastPropertyValue(handle, value, converted, old);
    }
    /** Original no-broadcast write. @param handle - Handle. @param value - Value. @returns Nothing. */ protected override setFastPropertyValue_NoBroadcast(
      handle: number,
      value: Any,
    ): void {
      this.bag.setFastPropertyValue(handle, value);
    }
    /** Original native output overload. @param value - Output. @param handle - Handle. @returns Nothing. */ protected override readFastPropertyValue(
      value: Any,
      handle: number,
    ): void {
      this.bag.getFastPropertyValue(handle, value);
    }
    /** Original actual default map. @param handle - Handle. @returns Owned default. */ override getPropertyDefaultByHandle(
      handle: number,
    ): Any {
      const value = new Any();
      try {
        this.bag.getPropertyDefaultByHandle(handle, value);
        return value;
      } catch (error) {
        value.dispose();
        throw error;
      }
    }
  }
  const stateful = own(new Reference(new StatefulOwner())),
    statefulApi = stateful.operatorStar(),
    NativeNames = Sequence.specialize<OUString>("OUString", 8),
    stateNames = [u("A"), u("missing")],
    stateInput = own(
      new NativeNames(
        {
          /** Actual name-array pointer. @param offset - Bytes. @returns Existing string field. */ get(
            offset: number,
          ): unknown {
            return (stateNames[offset / 8] as OUString).getDataAddress();
          },
        },
        2,
      ),
    ),
    initialStates = own(statefulApi.getPropertyStates(stateInput)),
    initialStateArray = initialStates.getConstArray() as SequenceElements;
  let notifiedTypeLong = true,
    notifiedValue = 0,
    notifiedOld = 0,
    samePropertySource = false,
    propertyNotifications = 0;
  /** Actual bound listener reads native event fields. */
  class PropertyListener
    extends PublicWeak.specialize(XPropertyChangeListener)
    implements XPropertyChangeListener
  {
    /** Native callback view, without copied event/Any owners. @param event - Source fields. @returns Nothing. */ propertyChange(
      event: PropertyChangeEventConstReference,
    ): void {
      ++propertyNotifications;
      notifiedTypeLong = Any.prototype.getValueType
        .call(event.NewValue as Any)
        .equals(UnoType.get("sal_Int32"));
      notifiedValue = Any.prototype.get.call(event.NewValue as Any, "sal_Int32");
      notifiedOld = Any.prototype.get.call(event.OldValue as Any, "sal_Int32");
      samePropertySource = event.Source.get() === statefulApi;
    }
    /** Original required listener callback. @param event - Event. @returns Nothing. */ disposing(
      event: Readonly<EventObject>,
    ): void {
      void event;
    }
  }
  const bagTypes = own(
      new (Sequence.specialize<Type>("Type", 8))(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            UnoType.get("sal_Int32").getAddress(),
        },
        1,
      ),
    ),
    bagService = own(
      PropertyBagService.createWithTypes(
        own(new Reference<XComponentContext>(getProcessComponentContext().get())),
        bagTypes,
        true,
        false,
      ),
    ),
    bagApi = bagService.operatorStar(),
    bagState = own(
      new Reference<XPropertyState>(bagService, UNO_QUERY, XPropertyState.static_type),
    ),
    bagModified = own(new Reference<XModifiable>(bagService, UNO_QUERY, XModifiable.static_type));
  bagApi.addProperty(u("WorkerValue"), BOUND | REMOVABLE, own(new Any([41], "sal_Int32")));
  bagApi.setPropertyValue(u("WorkerValue"), own(new Any([42], "sal_Int16")));
  const bagValues = own(bagApi.getPropertyValues()),
    registeredPropertyBag = {
      value: own(bagApi.getPropertyValue(u("WorkerValue"))).get("sal_Int32"),
      count: bagValues.getLength(),
      modified: bagModified.operatorStar().isModified(),
      directState: bagState.operatorStar().getPropertyState(u("WorkerValue")),
      sameIdentity: bagState.get() === bagApi,
    };
  const propertyListener = own(new Reference(new PropertyListener()));
  statefulApi.addPropertyChangeListener(u("A"), propertyListener);
  statefulApi.setPropertyValue(u("A"), own(new Any([42], "sal_Int16")));
  const storedProperty = own(statefulApi.getPropertyValue(u("A"))),
    nativePropertyControl = {
      value: storedProperty.get("sal_Int32"),
      storedLong: storedProperty.getValueType().equals(UnoType.get("sal_Int32")),
      notifications: propertyNotifications,
      notifiedTypeLong,
      notifiedValue,
      notifiedOld,
      sameSource: samePropertySource,
      state: statefulApi.getPropertyState(u("A")),
      initialStates: [
        (initialStateArray.get(0) as [number])[0],
        (initialStateArray.get(4) as [number])[0],
      ],
      typeCount: own(statefulApi.getTypes()).getLength(),
    };
  const processContext = getProcessComponentContext() as Reference<XComponentContext>,
    converter = own(Converter.create(processContext)),
    row = own(new Reference(new PropertyValueSet(processContext))),
    rowApi = row.operatorStar(),
    source = own(new Any(u("42").getDataAddress(), "OUString")),
    converted = own(converter.operatorStar().convertTo(source, UnoType.get("sal_Int32"))),
    scalar: [number] = [0];
  if (!converted.extract(scalar, "sal_Int32"))
    throw new Error("Registered converter returned wrong type");
  rowApi.appendString(u("number"), u("42"));
  rowApi.appendString(u("bad"), u("not-a-number"));
  const rowValue = rowApi.getInt(1),
    rowWasNull = rowApi.wasNull();
  const failedFirst = rowApi.getInt(2),
    failedFirstWasNull = rowApi.wasNull();
  const failedSecond = rowApi.getInt(2),
    failedSecondWasNull = rowApi.wasNull();
  const conversion = {
    serviceValue: scalar[0],
    rowValue,
    rowWasNull,
    failedFirst,
    failedFirstWasNull,
    failedSecond,
    failedSecondWasNull,
  };
  const bytes = new TextEncoder().encode(warningTestFile),
    data = own(new Bytes(bytes.length)),
    cells = data.getArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i)
    (cells.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
  const builder = own(DocumentBuilder.create(processContext)),
    builderInput = own(new Reference(new SequenceInputStream(data))),
    builderDocument = own(builder.operatorStar().parse(builderInput)),
    builderRoot = own(builderDocument.operatorStar().getDocumentElement()),
    exception = own(new RuntimeException(u("worker exception"), builder)),
    payload = own(new Any(exception, runtimeType));
  let capturedType = false,
    sameContext = false,
    exceptionMessage = "";
  try {
    throwException(payload);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    own(error);
    sameContext = error.Context.get() === builder.get();
    exceptionMessage = take(error.Message.copy(0));
    withCaughtException(
      error,
      /** Captures actual host current exception. @returns Nothing. */ () => {
        capturedType = own(getCaughtException()).getValueType().equals(runtimeType());
      },
    );
  }
  const documentBuilder = {
    rootName: take(builderRoot.operatorStar().getNodeName()),
    streamOpen: builderInput.operatorStar().available() === 0,
    namespaceAware: builder.operatorStar().isNamespaceAware(),
    validating: builder.operatorStar().isValidating(),
    emptyImplementation: !own(builder.operatorStar().getDOMImplementation()).is(),
    capturedType,
    sameContext,
    exceptionMessage,
  };
  const input = own(new Reference(new SequenceInputStream(data))),
    io = new context_t(),
    context = m._xmlNewParserCtxt();
  io.rInputStream.assign(input);
  io.close = false;
  io.freeOnClose = false;
  let warnings = 0,
    errors = 0,
    warningLine = 0;
  const native = nativeIoContext(io),
    callbacks = installParserCallbacks(context, {
      /** Counts the actual native error callback. @param parser - Native parser. @returns Nothing. */
      error(parser) {
        const error = parserException(parser);
        try {
          ++errors;
        } finally {
          error.dispose();
        }
      },
      /** Reads real generated UNO exception fields from native parser diagnostics. @param parser - Native parser. @returns Nothing. */
      warning(parser) {
        const error = parserException(parser);
        try {
          ++warnings;
          warningLine = error.LineNumber;
        } finally {
          error.dispose();
        }
      },
      /** No resolver is needed by the original warning fixture. @param parser - Actual parser. @param publicId - Native ID. @param systemId - Native ID. @returns Never. */
      resolveEntity(parser, publicId, systemId): never {
        throw new Error(`Unexpected native entity request: ${parser}/${publicId}/${systemId}`);
      },
    });
  let document: Reference<CDocument>;
  try {
    const pointer = m._xmlCtxtReadIO(context, native.read, native.close, native.address, 0, 0, 0);
    if (!pointer) throw new Error("Native probe XML did not parse");
    document = own(CDocument.CreateCDocument(pointer));
  } finally {
    m._xmlFreeParserCtxt(context);
    callbacks.dispose();
    io.dispose();
  }
  try {
    const doc = document.get() as CDocument,
      rootRef = own(doc.getDocumentElement()),
      root = rootRef.get();
    if (!root) throw new Error("Native document has no element");
    const listRef = own(root.getElementsByTagName(u("worker-child"))),
      list = listRef.get();
    if (!list) throw new Error("Native list is missing");
    const before = list.getLength(),
      child = own(doc.createElement(u("worker-child")));
    own(root.appendChild(child));
    const afterAppend = list.getLength(),
      first = own(list.item(0)),
      owner = own(first.get()?.getOwnerDocument() as ReturnType<CDocument["getOwnerDocument"]>);
    const sameOwner = owner.get() === doc;
    own(root.removeChild(child));
    const afterRemove = list.getLength(),
      text = own(doc.createTextNode(u("😀字")));
    const element = child.get();
    if (!element) throw new Error("Native child is missing");
    own(element.appendChild(text));
    return {
      conversion,
      publicHelpers,
      dynamicProperties,
      propertyArray,
      legacyListeners,
      nativeAnyFields,
      nativePropertyControl,
      registeredPropertyBag,
      nativeSax,
      documentBuilder,
      xpath: (
        /** Queries the actual registered native XPath service. @returns Scalar observations only. */ () => {
          const service = own(XPathAPI.create(processContext)),
            result = own(service.operatorStar().eval(builderRoot, u("count(/*)"))),
            nodes = own(service.operatorStar().selectNodeList(builderRoot, u("/*"))),
            first = own(nodes.operatorStar().item(0));
          return {
            count: result.operatorStar().getLong(),
            listLength: nodes.operatorStar().getLength(),
            sameRoot: first.get() === builderRoot.get(),
          };
        }
      )(),
      globals: {
        window: typeof window,
        document: typeof globalThis.document,
        DOMParser: typeof DOMParser,
      },
      rootName: take(root.getNodeName()),
      attribute: take(
        root.getAttributeNS(u("urn:oasis:names:tc:opendocument:xmlns:office:1.0"), u("version")),
      ),
      listCounts: [before, afterAppend, afterRemove],
      sameOwner,
      unicode: take(text.get()?.getData() as OUString),
      utf16Length: text.get()?.getLength(),
      borrowedStreamOpen: input.get()?.available() === 0,
      warnings,
      errors,
      warningLine,
    };
  } finally {
    while (owned.length) (owned.pop() as { dispose(): void }).dispose();
  }
}
