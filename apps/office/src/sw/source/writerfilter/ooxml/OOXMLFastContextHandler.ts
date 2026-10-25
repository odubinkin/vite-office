/** @fileoverview Native text/property/value fast contexts, inherited xml:space, MCE choices and source-ordered group callbacks; unconsumed drawing/table/note contexts remain separate owners. */
import type { Id, Stream } from "../inc/dmapper/resourcemodel";
import type { OOXMLDocument } from "../inc/ooxml/OOXMLDocument";
import { OOXMLFactory, type FastAttribute } from "./OOXMLFactory";
import { nativeToken } from "./OOXMLFactory_wml";
import { XML_TOKEN_COUNT } from "../../../../oox/source/token/tokenmap";
import { OOXMLParserState } from "./OOXMLParserState";
import { OOXMLPropertySet, OOXMLPropertyType as T, OOXMLValue as V } from "./OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { OUString } from "../../../../sal/inc/rtl/ustring";

/** Original resource enum declaration order; independent of schema ResourceType. */
export enum ResourceEnum_t {
  UNKNOWN,
  STREAM,
  PROPERTIES,
  TABLE,
  SHAPE,
}

/** Native base fast context; default property/value hooks are intentionally inert. */
export class OOXMLFastContextHandler {
  protected mpParent: OOXMLFastContextHandler | null;
  protected mpStream: Stream | null;
  protected mpParserState: OOXMLParserState;
  protected mId = 0;
  protected mnDefine = 0;
  protected mnToken = XML_TOKEN_COUNT;
  protected mnTableDepth = 0;
  protected m_bDiscardChildren = false;
  protected m_bTookChoice = false;
  private mbPreserveSpace = false;
  private mbPreserveSpaceSet = false;
  /** Native root/child constructors share parser state and increment its context count; copy construction is handled separately. @param parent - Parent or root. @returns Context. */
  constructor(parent: OOXMLFastContextHandler | null = null) {
    this.mpParent = parent;
    this.mpStream = parent?.mpStream ?? null;
    this.mpParserState = parent?.mpParserState ?? new OOXMLParserState();
    if (parent) {
      this.mnTableDepth = parent.mnTableDepth;
      this.m_bDiscardChildren = parent.m_bDiscardChildren;
      this.m_bTookChoice = parent.m_bTookChoice;
    }
    this.mpParserState.incContextCount();
  }
  /** Original nullable stream setter. @param stream - Stream. @returns Nothing. */ setStream(
    stream: Stream | null,
  ): void {
    this.mpStream = stream;
  }
  /** Native stream dereference precondition at the host boundary. @returns Stream. */
  protected stream(): Stream {
    if (!this.mpStream) throw new Error("OOXML fast context stream pointer is null.");
    return this.mpStream;
  }
  /** Borrows shared parser state. @returns State. */ getParserState(): OOXMLParserState {
    return this.mpParserState;
  }
  /** Native document pointer assignment. @param document - Document. @returns Nothing. */ setDocument(
    document: OOXMLDocument | null,
  ): void {
    this.mpParserState.setDocument(document);
  }
  /** Native event-forwarding flag. @returns Flag. */ isForwardEvents(): boolean {
    return this.mpParserState.isForwardEvents();
  }
  /** Native forwarding setter. @param value - Flag. @returns Nothing. */ setForwardEvents(
    value: boolean,
  ): void {
    this.mpParserState.setForwardEvents(value);
  }
  /** Native generated identity. @returns ID. */ getId(): Id {
    return this.mId;
  }
  /** Native identity setter. @param value - ID. @returns Nothing. */ setId(value: Id): void {
    this.mId = value >>> 0;
  }
  /** Native definition identity. @returns ID. */ getDefine(): Id {
    return this.mnDefine;
  }
  /** Native definition setter. @param value - ID. @returns Nothing. */ setDefine(value: Id): void {
    this.mnDefine = value >>> 0;
  }
  /** Native element token. @returns Token. */ getToken(): number {
    return this.mnToken;
  }
  /** Native token setter. @param value - Token. @returns Nothing. */ setToken(
    value: number,
  ): void {
    this.mnToken = value;
  }
  /** Native base context is a stream resource. @returns Kind. */ getResource(): ResourceEnum_t {
    return ResourceEnum_t.STREAM;
  }
  /** Original empty base value. @returns Value. */ getValue(): V {
    return new V();
  }
  /** Original base property insertion is inert. @param id - ID. @param value - Value. @returns Nothing. */ newProperty(
    id: Id,
    value: V,
  ): void {
    void id;
    void value;
  }
  /** Base setValue hook binds only value-context generated attribute actions. @param value - Value. @returns Nothing. */ setValue(
    value: V,
  ): void {
    void value;
  }
  /** Original base property setter is inert. @param properties - Set. @returns Nothing. */ setPropertySet(
    properties: OOXMLPropertySet,
  ): void {
    void properties;
  }
  /** Original nullable property hook. @returns Set or null. */ getPropertySet(): OOXMLPropertySet | null {
    return null;
  }
  /** Native explicit local xml:space wins; otherwise follow parent inheritance. @returns Preserve flag. */
  IsPreserveSpace(): boolean {
    return this.mbPreserveSpaceSet
      ? this.mbPreserveSpace
      : (this.mpParent?.IsPreserveSpace() ?? false);
  }
  /** Native xml:space is assigned before attributes/start actions. @param element - Token. @param attributes - Tokenized attributes. @returns Nothing. */
  startFastElement(element: number, attributes: readonly FastAttribute[]): void {
    const space = attributes.find(
      /** Finds the original xml:space token. @param attribute - Attribute. @returns Match. */ (
        attribute,
      ) => attribute.token === nativeToken("xml:space"),
    );
    if (space) {
      this.mbPreserveSpace = space.value === "preserve";
      this.mbPreserveSpaceSet = true;
    }
    if ((element & 0xffff0000) === (nativeToken("mce:AlternateContent") & 0xffff0000))
      this.m_bDiscardChildren = this.prepareMceContext(element, attributes);
    else if (!this.m_bDiscardChildren) {
      OOXMLFactory.attributes(this, attributes);
      this.lcl_startFastElement(element);
    }
  }
  /** Original MCE supported-feature exact comparisons intentionally do not split Requires. @param element - Token. @param attributes - Attributes. @returns Discard flag. */
  private prepareMceContext(element: number, attributes: readonly FastAttribute[]): boolean {
    if (element === nativeToken("mce:AlternateContent")) {
      this.mpParserState
        .getSavedAlternateStates()
        .push({ m_bDiscardChildren: this.m_bDiscardChildren, m_bTookChoice: this.m_bTookChoice });
      this.m_bDiscardChildren = false;
      this.m_bTookChoice = false;
    } else if (element === nativeToken("mce:Choice")) {
      const requires =
        attributes.find(
          /** Reads unqualified Requires. @param attribute - Attribute. @returns Match. */ (
            attribute,
          ) => attribute.token === nativeToken(":Requires"),
        )?.value ?? "";
      if (["wps", "wpg", "w14", "wpc"].includes(requires)) {
        this.m_bTookChoice = true;
        return false;
      }
      return true;
    } else if (element === nativeToken("mce:Fallback")) return this.m_bTookChoice;
    return false;
  }
  /** Original end restores MCE state or performs local end actions. @param element - Token. @returns Nothing. */
  endFastElement(element: number): void {
    if (element === nativeToken("mce:Choice") || element === nativeToken("mce:Fallback"))
      this.m_bDiscardChildren = false;
    else if (element === nativeToken("mce:AlternateContent")) {
      const state = this.mpParserState.getSavedAlternateStates().pop();
      if (!state) throw new Error("OOXML MCE state stack underflow.");
      this.m_bDiscardChildren = state.m_bDiscardChildren;
      this.m_bTookChoice = state.m_bTookChoice;
    } else if (!this.m_bDiscardChildren) this.lcl_endFastElement(element);
  }
  /** Native unknown-element callbacks have no actions. @returns Nothing. */ startUnknownElement(): void {}
  /** Native unknown-element close has no actions. @returns Nothing. */ endUnknownElement(): void {}
  /** Native MCE contexts reuse this handler; rejected children return null. @param element - Token. @returns Context or null. */
  createFastChildContext(element: number): OOXMLFastContextHandler | null {
    if ((element & 0xffff0000) === (nativeToken("mce:AlternateContent") & 0xffff0000)) return this;
    return this.m_bDiscardChildren ? null : OOXMLFactory.createFastChildContext(this, element);
  }
  /** Original defaulted copy constructor slices to the base, retains parent/identity/space flags and does not increment context count. @returns Copied base context. */
  createUnknownChildContext(): OOXMLFastContextHandler {
    const copy = Object.create(OOXMLFastContextHandler.prototype) as OOXMLFastContextHandler;
    copy.mpParent = this.mpParent;
    copy.mpStream = this.mpStream;
    copy.mpParserState = this.mpParserState;
    copy.mId = this.mId;
    copy.mnDefine = this.mnDefine;
    copy.mnToken = this.mnToken;
    copy.mnTableDepth = this.mnTableDepth;
    copy.m_bDiscardChildren = this.m_bDiscardChildren;
    copy.m_bTookChoice = this.m_bTookChoice;
    copy.mbPreserveSpace = this.mbPreserveSpace;
    copy.mbPreserveSpaceSet = this.mbPreserveSpaceSet;
    return copy;
  }
  /** Native character dispatch is independent of event-forwarding until the actual text action. @param value - UTF16 text. @returns Nothing. */
  characters(value: string): void {
    if (!this.m_bDiscardChildren) OOXMLFactory.characters(this, value);
  }
  /** Native local start action. @param element - Element token. @returns Nothing. */ protected lcl_startFastElement(
    element: number,
  ): void {
    void element;
    this.startAction();
  }
  /** Native local end action. @param element - Element token. @returns Nothing. */ protected lcl_endFastElement(
    element: number,
  ): void {
    void element;
    this.endAction();
  }
  /** Native generated start dispatch. @returns Nothing. */ startAction(): void {
    OOXMLFactory.startAction(this);
  }
  /** Native generated end dispatch. @returns Nothing. */ endAction(): void {
    OOXMLFactory.endAction(this);
  }
  /** Copies shared context count to handle before info emission. @returns Nothing. */ setHandle(): void {
    this.mpParserState.setHandle();
    this.stream().info(this.mpParserState.getHandle());
  }
  /** Native depth attributes are emitted only inside a table. @returns Nothing. */
  sendTableDepth(): void {
    if (this.mnTableDepth <= 0) return;
    const properties = new OOXMLPropertySet();
    properties.add(N.LN_tblDepth, V.createInteger(this.mnTableDepth), T.SPRM);
    properties.add(N.LN_inTbl, V.createInteger(1), T.SPRM);
    this.stream().props(properties);
  }
  /** Native group opening closes an existing run and establishes paragraph/section state first. @returns Nothing. */
  startCharacterGroup(): void {
    if (!this.isForwardEvents()) return;
    if (this.mpParserState.isInCharacterGroup()) this.endCharacterGroup();
    if (!this.mpParserState.isInParagraphGroup()) this.startParagraphGroup();
    if (!this.mpParserState.isInCharacterGroup()) {
      this.stream().startCharacterGroup();
      this.mpParserState.setInCharacterGroup(true);
      this.mpParserState.resolveCharacterProperties(this.stream());
      if (this.mpParserState.isStartFootnote()) {
        this.stream().utext(Uint16Array.of(5), 1);
        this.mpParserState.setStartFootnote(false);
      }
    }
    this.mpParserState.resolvePostponedBreak(this.stream());
  }
  /** Native matching run close. @returns Nothing. */ endCharacterGroup(): void {
    if (this.isForwardEvents() && this.mpParserState.isInCharacterGroup()) {
      this.stream().endCharacterGroup();
      this.mpParserState.setInCharacterGroup(false);
    }
  }
  /** Original paragraph start emits a present paraId attribute after grouping. @returns Nothing. */
  startParagraphGroup(): void {
    if (!this.isForwardEvents()) return;
    if (this.mpParserState.GetFloatingTableEnded()) this.mpParserState.SetFloatingTableEnded(false);
    if (this.mpParserState.isInParagraphGroup()) this.endParagraphGroup();
    if (!this.mpParserState.isInSectionGroup()) this.startSectionGroup();
    if (this.mpParserState.isInParagraphGroup()) return;
    this.stream().startParagraphGroup();
    this.mpParserState.setInParagraphGroup(true);
    const properties = this.getPropertySet();
    if (properties) {
      let text = "";
      properties.resolve({
        /** Native string-entry lookup keeps the last matching attribute. @param id - ID. @param value - Value. @returns Nothing. */ attribute(
          id,
          value,
        ) {
          if (id === N.LN_AG_Parids_paraId) {
            const string = value.getString();
            try {
              text = Array.from(
                string.getStr().subarray(0, string.getLength()),
                /** Copies one native UTF16 code unit. @param c - Unit. @returns Character. */ (
                  c,
                ) => String.fromCharCode(c),
              ).join("");
            } finally {
              string.dispose();
            }
          }
        },
        /** Native helper ignores modifiers. @returns Nothing. */ sprm() {},
      });
      if (text !== "") {
        const result = new OOXMLPropertySet();
        const string = new OUString(
          Uint16Array.from(
            text.split(""),
            /** Copies one UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
          ),
          text.length,
        );
        try {
          result.add(N.LN_AG_Parids_paraId, V.createString(string), T.ATTRIBUTE);
        } finally {
          string.dispose();
        }
        this.stream().props(result);
      }
    }
  }
  /** Native paragraph close first closes its character group. @returns Nothing. */ endParagraphGroup(): void {
    if (this.isForwardEvents()) {
      if (this.mpParserState.isInCharacterGroup()) this.endCharacterGroup();
      if (this.mpParserState.isInParagraphGroup()) {
        this.stream().endParagraphGroup();
        this.mpParserState.setInParagraphGroup(false);
      }
    }
  }
  /** Native section starts only after closing a prior section. @returns Nothing. */ startSectionGroup(): void {
    if (this.isForwardEvents()) {
      if (this.mpParserState.isInSectionGroup()) this.endSectionGroup();
      // Native nonvirtual endSectionGroup always clears section state before
      // returning on this forwarding path; its repeated negative guard is redundant.
      this.stream().info(this.mpParserState.getHandle());
      this.stream().startSectionGroup();
      this.mpParserState.setInSectionGroup(true);
    }
  }
  /** Native section close unwinds paragraph/run groups first. @returns Nothing. */ endSectionGroup(): void {
    if (this.isForwardEvents()) {
      if (this.mpParserState.isInParagraphGroup()) this.endParagraphGroup();
      if (this.mpParserState.isInSectionGroup()) {
        this.stream().endSectionGroup();
        this.mpParserState.setInSectionGroup(false);
      }
    }
  }
  /** Native last-section notification. @returns Nothing. */ setLastSectionGroup(): void {
    this.stream().markLastSectionGroup();
  }
  /** Original deferred section boundary is applied before the next paragraph. @returns Nothing. */ handleLastParagraphInSection(): void {
    if (this.mpParserState.isLastParagraphInSection()) {
      this.mpParserState.setLastParagraphInSection(false);
      this.startSectionGroup();
    }
  }
  /** Native CR owns paragraph creation and progress advances even when events are suppressed. @returns Nothing. */ endOfParagraph(): void {
    if (!this.mpParserState.isInCharacterGroup()) this.startCharacterGroup();
    if (this.isForwardEvents()) this.stream().utext(Uint16Array.of(13), 1);
    const document = this.mpParserState.getDocument() as OOXMLDocument | null;
    if (!document) throw new Error("OOXML paragraph document pointer is null.");
    document.incrementProgress();
  }
  /** Native XML-only whitespace normalization leaves NBSP and other Unicode whitespace unchanged. @param text - UTF16 text. @returns Nothing. */ text(
    text: string,
  ): void {
    if (!this.isForwardEvents()) return;
    let normalized = text.replaceAll("\n", " ");
    if (!this.IsPreserveSpace())
      normalized = normalized.replace(/^[\t\n\r ]+|[\t\n\r ]+$/gu, "").replaceAll("\t", " ");
    const data = Uint16Array.from(
      normalized.split(""),
      /** Copies one UTF16 code unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    );
    this.stream().utext(data, data.length);
  }
  /** Native base default-value hooks are inert. @returns Nothing. */ setDefaultBooleanValue(): void {}
  /** Native base default-value hooks are inert. @returns Nothing. */ setDefaultIntegerValue(): void {}
  /** Native base default-value hooks are inert. @returns Nothing. */ setDefaultStringValue(): void {}
  /** Native property-set wrapper retains the current shared set. @param id - Modifier identity. @returns Nothing. */ sendPropertiesWithId(
    id: Id,
  ): void {
    const source = this.getPropertySet();
    if (!source) throw new Error("OOXML property-set pointer is null.");
    const result = new OOXMLPropertySet();
    result.add(id, V.createPropertySet(source), T.SPRM);
    this.stream().props(result);
  }
  /** Original value handoff only when parent owns properties. @returns Nothing. */ protected sendPropertyToParent(): void {
    const parent = this.mpParent?.getPropertySet();
    if (parent) parent.add(this.mId, this.getValue(), T.SPRM);
  }
  /** Original property handoff requires both parent and child sets. @returns Nothing. */ protected sendPropertiesToParent(): void {
    const parent = this.mpParent?.getPropertySet();
    if (parent) {
      const source = this.getPropertySet();
      if (source) parent.add(this.mId, V.createPropertySet(source), T.SPRM);
    }
  }
}

/** Native stream context owns its attribute set. */
export class OOXMLFastContextHandlerStream extends OOXMLFastContextHandler {
  private readonly mpPropertySetAttrs = new OOXMLPropertySet();
  /** Original nonzero attribute insertion. @param id - ID. @param value - Value. @returns Nothing. */ override newProperty(
    id: Id,
    value: V,
  ): void {
    if (id !== 0) this.mpPropertySetAttrs.add(id, value, T.ATTRIBUTE);
  }
  /** Native stream property-set getter. @returns Set. */ override getPropertySet(): OOXMLPropertySet {
    return this.mpPropertySetAttrs;
  }
}

/** Native properties context resolves directly only when its parent is a stream resource. */
export class OOXMLFastContextHandlerProperties extends OOXMLFastContextHandler {
  private mpPropertySet = new OOXMLPropertySet();
  private readonly mbResolve: boolean;
  /** Original parent-resource resolution choice. @param parent - Parent. @returns Context. */ constructor(
    parent: OOXMLFastContextHandler,
  ) {
    super(parent);
    this.mbResolve = parent.getResource() === ResourceEnum_t.STREAM;
  }
  /** Original resource discriminant. @returns Kind. */ override getResource(): ResourceEnum_t {
    return ResourceEnum_t.PROPERTIES;
  }
  /** Original shared property value. @returns Value. */ override getValue(): V {
    return V.createPropertySet(this.mpPropertySet);
  }
  /** Original nonzero attribute insertion. @param id - ID. @param value - Value. @returns Nothing. */ override newProperty(
    id: Id,
    value: V,
  ): void {
    if (id !== 0) this.mpPropertySet.add(id, value, T.ATTRIBUTE);
  }
  /** Original set replacement. @param properties - Set. @returns Nothing. */ override setPropertySet(
    properties: OOXMLPropertySet,
  ): void {
    this.mpPropertySet = properties;
  }
  /** Original property set. @returns Set. */ override getPropertySet(): OOXMLPropertySet {
    return this.mpPropertySet;
  }
  /** End action precedes direct resolution or parent nesting. @param element - Token. @returns Nothing. */ protected override lcl_endFastElement(
    element: number,
  ): void {
    void element;
    this.endAction();
    if (this.mbResolve) {
      if (this.isForwardEvents()) this.stream().props(this.mpPropertySet);
    } else this.sendPropertiesToParent();
  }
}

/** Native scalar context sends its copied value to its parent before end actions. */
export class OOXMLFastContextHandlerValue extends OOXMLFastContextHandler {
  private maValue = new V();
  /** Original value resource kind remains base STREAM. @returns Value. */ override getValue(): V {
    return this.maValue.clone();
  }
  /** Native copied value assignment. @param value - Value. @returns Nothing. */ override setValue(
    value: V,
  ): void {
    this.maValue = value.clone();
  }
  /** Native parent handoff before generated end action. @param element - Token. @returns Nothing. */ protected override lcl_endFastElement(
    element: number,
  ): void {
    void element;
    this.sendPropertyToParent();
    this.endAction();
  }
  /** Original ON/OFF implicit true only for an absent value. @returns Nothing. */ override setDefaultBooleanValue(): void {
    if (!this.maValue.hasValue()) this.setValue(V.createBoolean(true));
  }
  /** Original numeric implicit zero only for an absent value. @returns Nothing. */ override setDefaultIntegerValue(): void {
    if (!this.maValue.hasValue()) this.setValue(V.createInteger(0));
  }
  /** Original string implicit empty only for an absent value. @returns Nothing. */ override setDefaultStringValue(): void {
    if (!this.maValue.hasValue()) {
      const string = new OUString();
      try {
        this.setValue(V.createString(string));
      } finally {
        string.dispose();
      }
    }
  }
}
