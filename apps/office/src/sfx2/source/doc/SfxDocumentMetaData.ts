/** @fileoverview Original SfxDocumentMetaData.cxx component state, declared facets and public metadata operations. This in-progress owner is not registered until its original storage/medium dependencies and source QA are complete. */
import { WeakComponentImplHelper } from "../../../comphelper/inc/compbase";
import { OInterfaceContainerHelper4 } from "../../../comphelper/inc/interfacecontainer4";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XDocumentProperties2 } from "../../../offapi/com/sun/star/document/XDocumentProperties2";
import { XCloneable } from "../../../offapi/com/sun/star/util/XCloneable";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { XModifyBroadcaster } from "../../../offapi/com/sun/star/util/XModifyBroadcaster";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { XSAXSerializable } from "../../../offapi/com/sun/star/xml/sax/XSAXSerializable";
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XPropertyContainer } from "../../../udkapi/com/sun/star/beans/XPropertyContainer";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { NamedValue } from "../../../udkapi/com/sun/star/beans/NamedValue";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { StringPair } from "../../../udkapi/com/sun/star/beans/StringPair";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { createDOM, createUserDefined, getURLProperties } from "./SfxDocumentMetaData.services";
import * as elements from "./SfxDocumentMetaData.elements";
import { init, updateUserDefinedAndAttributes } from "./SfxDocumentMetaData.init";
import * as properties from "./SfxDocumentMetaData.properties";
import * as storage from "./SfxDocumentMetaData.storage";
/** Source-known literal. @param value - ASCII text. @returns Actual owned string. */
export function literal(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
/** Exact UTF16 key binding for original standard-node caches; native tree nodes remain actual acquired references. @param value - Native QName. @returns Language-level map key. */
export function key(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Actual original owner; split member bodies operate on this same receiver. Synchronization tokens are erased, not replaced by a second owner. */
export class SfxDocumentMetaData
  extends WeakComponentImplHelper.specialize(
    XServiceInfo,
    XDocumentProperties2,
    XInitialization,
    XCloneable,
    XModifiable,
    XSAXSerializable,
  )
  implements
    XServiceInfo,
    XDocumentProperties2,
    XInitialization,
    XCloneable,
    XModifiable,
    XSAXSerializable
{
  readonly m_xContext: Reference<XComponentContext>;
  readonly m_NotifyListeners = new (OInterfaceContainerHelper4.specialize<XModifyListener>(
    XModifyListener,
  ))();
  m_isInitialized = false;
  m_isModified = false;
  readonly m_xDoc = new Reference<XDocument>();
  readonly m_xParent = new Reference<XNode>();
  readonly m_meta = new Map<string, Reference<XNode>>();
  readonly m_metaList = new Map<string, Reference<XNode>[]>();
  readonly m_xUserDefined = new Reference<XPropertyContainer>();
  readonly m_TemplateName = new OUString();
  readonly m_TemplateURL = new OUString();
  readonly m_TemplateDate = new DateTime();
  readonly m_AutoloadURL = new OUString();
  m_AutoloadSecs = 0;
  readonly m_DefaultTarget = new OUString();
  /** Original context construction and synchronous initialization; no constructor receiver reference is acquired on success. @param context - Actual source context. @returns Owner. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    try {
      const doc = this.createDOM();
      try {
        this.init(doc);
      } finally {
        doc.dispose();
      }
    } catch (error) {
      this.destroyMembers();
      super.destroy();
      throw error;
    }
  }
  /** Original factory hook. @param context - Source context. @returns New source owner. */
  protected createMe(context: Reference<XComponentContext>): SfxDocumentMetaData {
    return new SfxDocumentMetaData(context);
  }
  /** Original default DOM service path. @returns Native document. */
  createDOM(): Reference<XDocument> {
    return createDOM(this.m_xContext, this);
  }
  /** Original init responsibility. @param doc - Actual native document. @returns Nothing. */
  init(doc: Reference<XDocument>): void {
    init.call(this, doc);
  }
  /** Original initialized-state guard. @returns Nothing. */
  checkInit(): void {
    if (!this.m_isInitialized) this.runtime("SfxDocumentMetaData::checkInit: not initialized");
  }
  /** Original source RuntimeException with this receiver. @param message - Original literal. @returns Never. */
  runtime(message: string): never {
    const text = literal(message),
      self = new Reference<XInterface>(this);
    try {
      throw new RuntimeException(text, self);
    } finally {
      self.dispose();
      text.dispose();
    }
  }
  /** Source exception wrapping owns the original dynamic caught Any. @param message - Original literal. @param error - Caught original exception. @returns Never. */
  wrapped(message: string, error: Exception): never {
    try {
      const caught = withCaughtException(error, getCaughtException),
        text = literal(message),
        self = new Reference<XInterface>(this);
      try {
        throw new WrappedTargetRuntimeException(text, self, caught);
      } finally {
        self.dispose();
        text.dispose();
        caught.dispose();
      }
    } finally {
      error.dispose();
    }
  }
  /** Original argument error. @param message - Source literal. @param index - Original signed16 argument position. @returns Never. */
  illegal(message: string, index = 0): never {
    const text = literal(message),
      self = new Reference<XInterface>(this);
    try {
      throw new IllegalArgumentException(text, self, (index << 16) >> 16);
    } finally {
      self.dispose();
      text.dispose();
    }
  }
  /** Original cache copy/move assignment. @param name - Actual standard QName key. @param node - Source node. @returns Nothing. */
  cacheNode(name: string, node: Reference<XNode>): void {
    const copy = new Reference(node),
      old = this.m_meta.get(name);
    this.m_meta.set(name, copy);
    old?.dispose();
  }
  /** Original acquired cache-vector assignment. @param name - Standard QName. @param nodes - Moved original vector. @returns Nothing. */
  cacheList(name: string, nodes: Reference<XNode>[]): void {
    const old = this.m_metaList.get(name);
    this.m_metaList.set(name, nodes);
    if (old) for (const node of old) node.dispose();
  }
  /** Original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("SfxDocumentMetaData");
  }
  /** Original service predicate. @param name - Requested service. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original supported-service sequence. @returns Native sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.document.DocumentProperties");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Borrows the actual supported-service name. @returns Native string cell. */
          get() {
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original disposing hook and ordering. @returns Nothing. */
  protected override disposingComponent(): void {
    const self = new Reference<XInterface>(this),
      event = new EventObject(self);
    try {
      this.m_NotifyListeners.disposeAndClear(event);
    } finally {
      event.dispose();
      self.dispose();
    }
    this.m_isInitialized = false;
    this.clearCaches();
    this.m_xParent.clear();
    this.m_xDoc.clear();
    this.m_xUserDefined.clear();
  }
  /** Original native map destruction in UTF16 comparator order. @returns Nothing. */
  clearCaches(): void {
    for (const name of [...this.m_meta.keys()].sort()) this.m_meta.get(name)?.dispose();
    this.m_meta.clear();
    for (const name of [...this.m_metaList.keys()].sort())
      for (const node of this.m_metaList.get(name) as Reference<XNode>[]) node.dispose();
    this.m_metaList.clear();
  }
  /** Original implicit reverse member destruction; scalar structs have trivial destructors. @returns Nothing. */
  private destroyMembers(): void {
    this.m_DefaultTarget.dispose();
    this.m_AutoloadURL.dispose();
    this.m_TemplateURL.dispose();
    this.m_TemplateName.dispose();
    this.m_xUserDefined.dispose();
    for (const name of [...this.m_metaList.keys()].sort())
      for (const node of this.m_metaList.get(name) as Reference<XNode>[]) node.dispose();
    this.m_metaList.clear();
    for (const name of [...this.m_meta.keys()].sort()) this.m_meta.get(name)?.dispose();
    this.m_meta.clear();
    this.m_xParent.dispose();
    this.m_xDoc.dispose();
    this.m_NotifyListeners.dispose();
    this.m_xContext.dispose();
  }
  /** Original empty destructor body followed by member/base destruction, without implicit dispose notification. @returns Nothing. */
  protected override destroy(): void {
    this.destroyMembers();
    super.destroy();
  }
  /** Original scalar-node getter. @param name - Source ASCII key. @returns Owned text. */
  getMetaText(name: string): OUString {
    return elements.getMetaText.call(this, name);
  }
  /** Original scalar-node setter. @param name - Native QName. @param value - Native text. @returns Change. */
  setMetaText(name: OUStringConstReference, value: OUStringConstReference): boolean {
    return elements.setMetaText.call(this, name, value);
  }
  /** Original scalar setter and modification outside the source lock. @param name - Native QName. @param value - Native text. @returns Nothing. */
  setMetaTextAndNotify(name: OUStringConstReference, value: OUStringConstReference): void {
    if (this.setMetaText(name, value)) this.setModified(true);
  }
  /** Original attribute getter intentionally does not check initialization because init uses it. @param name - Element QName. @param attribute - Attribute QName. @returns Owned value. */
  getMetaAttr(name: OUStringConstReference, attribute: OUStringConstReference): OUString {
    return elements.getMetaAttr.call(this, name, attribute);
  }
  /** Original list getter. @param name - ASCII QName. @returns Native strings. */
  getMetaList(name: string): Sequence<OUString> {
    return elements.getMetaList.call(this, name);
  }
  /** Original list setter. @param name - QName. @param values - Native strings. @param attrs - Original optional attributes. @returns Change. */
  setMetaList(
    name: OUStringConstReference,
    values: Readonly<Sequence<OUString>>,
    attrs: import("./SfxDocumentMetaData.values").AttrVector | null,
  ): boolean {
    return elements.setMetaList.call(this, name, values, attrs);
  }
  /** Original replace/delete attribute element. @param name - QName. @param attrs - Optional attributes. @returns Nothing. */
  updateElement(
    name: OUStringConstReference,
    attrs: import("./SfxDocumentMetaData.values").AttrVector[number] | null = null,
  ): void {
    elements.updateElement.call(this, name, attrs);
  }
  /** Original lazy user bag over the same member. @returns Nothing. */
  createUserDefined(): void {
    createUserDefined(this.m_xContext, this.m_xUserDefined, this.m_NotifyListeners);
  }
  /** Original serialization synchronization. @returns Nothing. */
  updateUserDefinedAndAttributes(): void {
    updateUserDefinedAndAttributes.call(this);
  }
  /** Original URL property set responsibility. @param medium - Native descriptor. @returns Actual native property set. */
  getURLProperties(medium: Readonly<Sequence<PropertyValue>>) {
    return getURLProperties(this.m_xContext, medium);
  }
  /** Original Author read. @returns Owned text. */ getAuthor(): OUString {
    return properties.getAuthor.call(this);
  }
  /** Original Author assignment. @param value - Native text. @returns Nothing. */ setAuthor(
    value: OUStringConstReference,
  ): void {
    return properties.setAuthor.call(this, value);
  }
  /** Original Generator read. @returns Owned text. */ getGenerator(): OUString {
    return properties.getGenerator.call(this);
  }
  /** Original Generator assignment. @param value - Native text. @returns Nothing. */ setGenerator(
    value: OUStringConstReference,
  ): void {
    return properties.setGenerator.call(this, value);
  }
  /** Original Title read. @returns Owned text. */ getTitle(): OUString {
    return properties.getTitle.call(this);
  }
  /** Original Title assignment. @param value - Native text. @returns Nothing. */ setTitle(
    value: OUStringConstReference,
  ): void {
    return properties.setTitle.call(this, value);
  }
  /** Original Subject read. @returns Owned text. */ getSubject(): OUString {
    return properties.getSubject.call(this);
  }
  /** Original Subject assignment. @param value - Native text. @returns Nothing. */ setSubject(
    value: OUStringConstReference,
  ): void {
    return properties.setSubject.call(this, value);
  }
  /** Original Description read. @returns Owned text. */ getDescription(): OUString {
    return properties.getDescription.call(this);
  }
  /** Original Description assignment. @param value - Native text. @returns Nothing. */ setDescription(
    value: OUStringConstReference,
  ): void {
    return properties.setDescription.call(this, value);
  }
  /** Original ModifiedBy read. @returns Owned text. */ getModifiedBy(): OUString {
    return properties.getModifiedBy.call(this);
  }
  /** Original ModifiedBy assignment. @param value - Native text. @returns Nothing. */ setModifiedBy(
    value: OUStringConstReference,
  ): void {
    return properties.setModifiedBy.call(this, value);
  }
  /** Original PrintedBy read. @returns Owned text. */ getPrintedBy(): OUString {
    return properties.getPrintedBy.call(this);
  }
  /** Original PrintedBy assignment. @param value - Native text. @returns Nothing. */ setPrintedBy(
    value: OUStringConstReference,
  ): void {
    return properties.setPrintedBy.call(this, value);
  }
  /** Original Coverage read. @returns Owned text. */ getCoverage(): OUString {
    return properties.getCoverage.call(this);
  }
  /** Original Coverage assignment. @param value - Native text. @returns Nothing. */ setCoverage(
    value: OUStringConstReference,
  ): void {
    return properties.setCoverage.call(this, value);
  }
  /** Original Identifier read. @returns Owned text. */ getIdentifier(): OUString {
    return properties.getIdentifier.call(this);
  }
  /** Original Identifier assignment. @param value - Native text. @returns Nothing. */ setIdentifier(
    value: OUStringConstReference,
  ): void {
    return properties.setIdentifier.call(this, value);
  }
  /** Original Rights read. @returns Owned text. */ getRights(): OUString {
    return properties.getRights.call(this);
  }
  /** Original Rights assignment. @param value - Native text. @returns Nothing. */ setRights(
    value: OUStringConstReference,
  ): void {
    return properties.setRights.call(this, value);
  }
  /** Original Source read. @returns Owned text. */ getSource(): OUString {
    return properties.getSource.call(this);
  }
  /** Original Source assignment. @param value - Native text. @returns Nothing. */ setSource(
    value: OUStringConstReference,
  ): void {
    return properties.setSource.call(this, value);
  }
  /** Original Type read. @returns Owned text. */ getType(): OUString {
    return properties.getType.call(this);
  }
  /** Original Type assignment. @param value - Native text. @returns Nothing. */ setType(
    value: OUStringConstReference,
  ): void {
    return properties.setType.call(this, value);
  }
  /** Original CreationDate conversion. @returns Scalar value. */ getCreationDate(): DateTime {
    return properties.getCreationDate.call(this);
  }
  /** Original CreationDate assignment. @param value - Native value. @returns Nothing. */ setCreationDate(
    value: Readonly<DateTime>,
  ): void {
    return properties.setCreationDate.call(this, value);
  }
  /** Original ModificationDate conversion. @returns Scalar value. */ getModificationDate(): DateTime {
    return properties.getModificationDate.call(this);
  }
  /** Original ModificationDate assignment. @param value - Native value. @returns Nothing. */ setModificationDate(
    value: Readonly<DateTime>,
  ): void {
    return properties.setModificationDate.call(this, value);
  }
  /** Original PrintDate conversion. @returns Scalar value. */ getPrintDate(): DateTime {
    return properties.getPrintDate.call(this);
  }
  /** Original PrintDate assignment. @param value - Native value. @returns Nothing. */ setPrintDate(
    value: Readonly<DateTime>,
  ): void {
    return properties.setPrintDate.call(this, value);
  }
  /** Original Keywords read. @returns Native sequence. */ getKeywords(): Sequence<OUString> {
    return properties.getKeywords.call(this);
  }
  /** Original Keywords assignment. @param value - Native sequence. @returns Nothing. */ setKeywords(
    value: Readonly<Sequence<OUString>>,
  ): void {
    return properties.setKeywords.call(this, value);
  }
  /** Original Contributor read. @returns Native sequence. */ getContributor(): Sequence<OUString> {
    return properties.getContributor.call(this);
  }
  /** Original Contributor assignment. @param value - Native sequence. @returns Nothing. */ setContributor(
    value: Readonly<Sequence<OUString>>,
  ): void {
    return properties.setContributor.call(this, value);
  }
  /** Original Publisher read. @returns Native sequence. */ getPublisher(): Sequence<OUString> {
    return properties.getPublisher.call(this);
  }
  /** Original Publisher assignment. @param value - Native sequence. @returns Nothing. */ setPublisher(
    value: Readonly<Sequence<OUString>>,
  ): void {
    return properties.setPublisher.call(this, value);
  }
  /** Original Relation read. @returns Native sequence. */ getRelation(): Sequence<OUString> {
    return properties.getRelation.call(this);
  }
  /** Original Relation assignment. @param value - Native sequence. @returns Nothing. */ setRelation(
    value: Readonly<Sequence<OUString>>,
  ): void {
    return properties.setRelation.call(this, value);
  }
  /** Original delayed TemplateName member read. @returns Owned text. */ getTemplateName(): OUString {
    return properties.getTemplateName.call(this);
  }
  /** Original delayed TemplateName assignment. @param value - Native text. @returns Nothing. */ setTemplateName(
    value: OUStringConstReference,
  ): void {
    return properties.setTemplateName.call(this, value);
  }
  /** Original delayed TemplateURL member read. @returns Owned text. */ getTemplateURL(): OUString {
    return properties.getTemplateURL.call(this);
  }
  /** Original delayed TemplateURL assignment. @param value - Native text. @returns Nothing. */ setTemplateURL(
    value: OUStringConstReference,
  ): void {
    return properties.setTemplateURL.call(this, value);
  }
  /** Original delayed AutoloadURL member read. @returns Owned text. */ getAutoloadURL(): OUString {
    return properties.getAutoloadURL.call(this);
  }
  /** Original delayed AutoloadURL assignment. @param value - Native text. @returns Nothing. */ setAutoloadURL(
    value: OUStringConstReference,
  ): void {
    return properties.setAutoloadURL.call(this, value);
  }
  /** Original delayed DefaultTarget member read. @returns Owned text. */ getDefaultTarget(): OUString {
    return properties.getDefaultTarget.call(this);
  }
  /** Original delayed DefaultTarget assignment. @param value - Native text. @returns Nothing. */ setDefaultTarget(
    value: OUStringConstReference,
  ): void {
    return properties.setDefaultTarget.call(this, value);
  }
  /** Original language conversion. @returns Native locale. */ getLanguage(): Locale {
    return properties.getLanguage.call(this);
  }
  /** Original language assignment. @param value - Native locale. @returns Nothing. */ setLanguage(
    value: Readonly<Locale>,
  ): void {
    return properties.setLanguage.call(this, value);
  }
  /** Original template scalar read. @returns Value copy. */ getTemplateDate(): DateTime {
    return properties.getTemplateDate.call(this);
  }
  /** Original template scalar assignment. @param value - Source scalar. @returns Nothing. */ setTemplateDate(
    value: Readonly<DateTime>,
  ): void {
    return properties.setTemplateDate.call(this, value);
  }
  /** Original delay read. @returns Seconds. */ getAutoloadSecs(): number {
    return properties.getAutoloadSecs.call(this);
  }
  /** Original negative check precedes initialization check. @param value - Seconds. @returns Nothing. */ setAutoloadSecs(
    value: number,
  ): void {
    return properties.setAutoloadSecs.call(this, value);
  }
  /** Original statistic read. @returns Native named values. */ getDocumentStatistics(): Sequence<NamedValue> {
    return elements.getDocumentStatistics.call(this);
  }
  /** Original statistic write always modifies. @param values - Native input. @returns Nothing. */ setDocumentStatistics(
    values: Readonly<Sequence<NamedValue>>,
  ): void {
    elements.setDocumentStatistics.call(this, values);
  }
  /** Original bounded editing-cycle parsing. @returns Signed16 value or0. */ getEditingCycles(): number {
    return properties.getEditingCycles.call(this);
  }
  /** Original signed negative admission. @param value - Signed16 cycles. @returns Nothing. */ setEditingCycles(
    value: number,
  ): void {
    return properties.setEditingCycles.call(this, value);
  }
  /** Original editing duration read. @returns Signed32 seconds. */ getEditingDuration(): number {
    return properties.getEditingDuration.call(this);
  }
  /** Original editing duration assignment. @param value - Signed32 seconds. @returns Nothing. */ setEditingDuration(
    value: number,
  ): void {
    return properties.setEditingDuration.call(this, value);
  }
  /** Original user reset uses the actual shared local platform clock and source defaults. @param value - Author. @returns Nothing. */ resetUserData(
    value: OUStringConstReference,
  ): void {
    return properties.resetUserData.call(this, value);
  }
  /** Original acquired bag read. @returns Actual property container. */ getUserDefinedProperties(): Reference<XPropertyContainer> {
    this.checkInit();
    this.createUserDefined();
    return new Reference(this.m_xUserDefined);
  }
  /** Original input-storage path. @param value - Actual storage. @param medium - Native descriptor. @returns Nothing. */ loadFromStorage(
    value: Reference<XStorage>,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void {
    storage.loadFromStorage.call(this, value, medium);
  }
  /** Original output-storage path. @param value - Actual storage. @param medium - Native descriptor. @returns Nothing. */ storeToStorage(
    value: Reference<XStorage>,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void {
    storage.storeToStorage.call(this, value, medium);
  }
  /** Original input-medium path. @param url - Native URL. @param medium - Native descriptor. @returns Nothing. */ loadFromMedium(
    url: OUStringConstReference,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void {
    storage.loadFromMedium.call(this, url, medium);
  }
  /** Original output-medium path. @param url - Native URL. @param medium - Native descriptor. @returns Nothing. */ storeToMedium(
    url: OUStringConstReference,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void {
    storage.storeToMedium.call(this, url, medium);
  }
  /** Original initialization accepts every argument but retains the last document. @param args - Native arguments. @returns Nothing. */ initialize(
    args: Sequence<Any>,
  ): void {
    const doc = new Reference<XDocument>();
    try {
      for (let i = 0; i < args.getLength(); ++i) {
        if (
          !Any.prototype.extract.call(args.operatorIndex(i), doc.getAddress(), [
            "Reference",
            XDocument.static_type,
          ])
        )
          this.illegal("SfxDocumentMetaData::initialize: argument must be XDocument", i);
        if (!doc.is()) this.illegal("SfxDocumentMetaData::initialize: argument is null", i);
      }
      if (!doc.is()) {
        const fresh = this.createDOM();
        try {
          doc.assign(fresh);
        } finally {
          fresh.dispose();
        }
      }
      this.init(doc);
    } finally {
      doc.dispose();
    }
  }
  /** Original clone copies DOM only, preserving original mutation/error scope and new-owner factory. @returns Actual clone. */ createClone(): Reference<XCloneable> {
    this.checkInit();
    const result = new Reference(this.createMe(this.m_xContext));
    try {
      const doc = this.createDOM();
      try {
        try {
          this.updateUserDefinedAndAttributes();
          const rootElement = this.m_xDoc.operatorStar().getDocumentElement();
          try {
            const root = new Reference<XNode>(rootElement, UNO_QUERY_THROW, XNode.static_type);
            try {
              const copy = doc.operatorStar().importNode(root, true);
              try {
                doc.operatorStar().appendChild(copy).dispose();
              } finally {
                copy.dispose();
              }
            } finally {
              root.dispose();
            }
          } finally {
            rootElement.dispose();
          }
          result.operatorStar().init(doc);
        } catch (error) {
          if (error instanceof RuntimeException) throw error;
          if (!(error instanceof Exception)) throw error;
          this.wrapped("SfxDocumentMetaData::createClone: exception", error);
        }
        return new Reference<XCloneable>(result);
      } finally {
        doc.dispose();
      }
    } finally {
      result.dispose();
    }
  }
  /** Original modification includes the optional bag's own flag. @returns Combined state. */ isModified(): boolean {
    this.checkInit();
    const bag = new Reference<XModifiable>(this.m_xUserDefined, UNO_QUERY, XModifiable.static_type);
    try {
      return this.m_isModified || (bag.is() && bag.operatorStar().isModified());
    } finally {
      bag.dispose();
    }
  }
  /** Original repeated true assignments notify, false clears the user bag separately. @param value - New state. @returns Nothing. */ setModified(
    value: boolean,
  ): void {
    this.checkInit();
    this.m_isModified = value;
    const bag = new Reference<XModifiable>();
    try {
      if (!value && this.m_xUserDefined.is())
        bag.set(this.m_xUserDefined, UNO_QUERY, XModifiable.static_type);
      if (value) {
        try {
          const self = new Reference<XInterface>(this),
            event = new EventObject(self);
          try {
            this.m_NotifyListeners.notifyEach(
              /** Delivers the modification event to the current listener. @param event - Modification event shared by the listener iteration. @returns Nothing. */ function (
                event: EventObject,
              ) {
                this.modified(event);
              },
              event,
            );
          } finally {
            event.dispose();
            self.dispose();
          }
        } catch (error) {
          if (error instanceof RuntimeException) throw error;
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      } else if (bag.is()) bag.operatorStar().setModified(false);
    } finally {
      bag.dispose();
    }
  }
  /** Original listener registration also targets an existing user bag. @param listener - Actual listener. @returns Nothing. */ addModifyListener(
    listener: Reference<XModifyListener>,
  ): void {
    this.checkInit();
    this.m_NotifyListeners.addInterface(listener);
    const bag = new Reference<XModifyBroadcaster>(
      this.m_xUserDefined,
      UNO_QUERY,
      XModifyBroadcaster.static_type,
    );
    try {
      if (bag.is()) bag.operatorStar().addModifyListener(listener);
    } finally {
      bag.dispose();
    }
  }
  /** Original listener removal also targets an existing user bag. @param listener - Actual listener. @returns Nothing. */ removeModifyListener(
    listener: Reference<XModifyListener>,
  ): void {
    this.checkInit();
    this.m_NotifyListeners.removeInterface(listener);
    const bag = new Reference<XModifyBroadcaster>(
      this.m_xUserDefined,
      UNO_QUERY,
      XModifyBroadcaster.static_type,
    );
    try {
      if (bag.is()) bag.operatorStar().removeModifyListener(listener);
    } finally {
      bag.dispose();
    }
  }
  /** Original DOM synchronization and native SAX facet dispatch. @param handler - Actual source writer/handler. @param namespaces - Native extra namespaces. @returns Nothing. */ serialize(
    handler: Reference<XDocumentHandler>,
    namespaces: Sequence<StringPair>,
  ): void {
    this.checkInit();
    this.updateUserDefinedAndAttributes();
    const sax = new Reference<XSAXSerializable>(
      this.m_xDoc,
      UNO_QUERY_THROW,
      XSAXSerializable.static_type,
    );
    try {
      sax.operatorStar().serialize(handler, namespaces);
    } finally {
      sax.dispose();
    }
  }
}
/** Original acquired component factory; registration waits for the whole owner/dependencies. @param context - Native context. @param args - Ignored arguments. @returns Actual root. */
export function SfxDocumentMetaData_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const ref = new Reference<XComponentContext>(context);
  try {
    return acquire(new SfxDocumentMetaData(ref));
  } finally {
    ref.dispose();
  }
}
