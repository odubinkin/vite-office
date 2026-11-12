/** @fileoverview Real native UNO document, parser callback, IO and live-list operations without a host DOM; the production registered DocumentBuilder shares the same realm-local native module. */
import { initializeLibXml2 } from "../../apps/office/src/external/libxml2/libxml2";
import { installParserCallbacks } from "../../apps/office/src/external/libxml2/parsercallbacks";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
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
import type { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { implementations } from "../../apps/office/src/desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../apps/office/src/desktop/source/app/appinit";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import {
  WeakComponentImplHelper as PublicComponent,
  WeakImplHelper as PublicWeak,
} from "../../apps/office/src/comphelper/inc/compbase";
import { XEventListener } from "../../apps/office/src/udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../apps/office/src/udkapi/com/sun/star/lang/EventObject";
import { OPropertyArrayHelper } from "../../apps/office/src/cppuhelper/inc/propshlp";
import { OPropertySetHelperInfo_Impl } from "../../apps/office/src/cppuhelper/source/propshlp";
import { XPropertySetInfo } from "../../apps/office/src/udkapi/com/sun/star/beans/XPropertySetInfo";
import { PropertyBag } from "../../apps/office/src/comphelper/inc/propertybag";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/Property";
import { REMOVABLE } from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyAttribute";
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
