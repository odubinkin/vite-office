/** @fileoverview Native text/property/value/resource-table contexts, inherited xml:space, MCE choices and source-ordered callbacks; drawings, document tables and notes remain separate owners. */
import { FieldControl, type Id, type Stream } from "../inc/dmapper/resourcemodel";
import type { DrawingAnchor } from "../dmapper/GraphicImport";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import type { OOXMLDocument } from "../inc/ooxml/OOXMLDocument";
import { OOXMLFactory, type FastAttribute } from "./OOXMLFactory";
import { nativeToken } from "./OOXMLFactory_wml";
import { XML_TOKEN_COUNT } from "../../../../oox/source/token/tokenmap";
import { OOXMLParserState } from "./OOXMLParserState";
import {
  OOXMLPropertySet,
  OOXMLPropertyType as T,
  OOXMLValue as V,
  OOXMLTable,
} from "./OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { OOXMLBreakHandler, OOXMLHeaderFooterHandler, OOXMLHyperlinkHandler } from "./Handler";

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
  /** Original clearProps replaces through the virtual setter; the base setter deliberately remains inert. @returns Nothing. */
  clearProps(): void {
    this.setPropertySet(new OOXMLPropertySet());
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
  /** Reads a native integer property used in a generated action condition. @param id - Property ID. @returns Value or zero. */
  getPropertyInt(id: Id): number {
    let value = 0;
    for (const entry of this.getPropertySet() ?? [])
      if (entry.getId() === id) value = entry.getValue()?.getInt() ?? 0;
    return value;
  }
  /** Resolves a relationship against this part. @param id - Native relationship ID. @returns Target or empty. */
  getTargetForId(id: string): string {
    return this.mpParserState.getDocument()?.getTargetForId(id) ?? "";
  }
  /** Sends the native field start byte. @returns Nothing. */
  fieldstart(): void {
    this.fieldControl(FieldControl.Start);
  }
  /** Sends the native field result delimiter. @returns Nothing. */
  fieldsep(): void {
    this.fieldControl(FieldControl.Separator);
  }
  /** Sends the native field end byte. @returns Nothing. */
  fieldend(): void {
    this.fieldControl(FieldControl.End);
  }
  /** Sends the original lock byte for a locked complex field. @returns Nothing. */
  fieldlock(): void {
    if (this.getPropertyInt(N.LN_CT_FldChar_fldLock)) this.fieldControl(FieldControl.Lock);
  }
  /** Sends the original lock byte for a locked simple field. @returns Nothing. */
  fieldlock_simple(): void {
    if (this.getPropertyInt(N.LN_CT_SimpleField_fldLock)) this.fieldControl(FieldControl.Lock);
  }
  /** Delivers an original field control inside a character group. @param control - Native byte. @returns Nothing. */
  private fieldControl(control: FieldControl): void {
    this.startCharacterGroup();
    if (this.isForwardEvents()) this.stream().text(Uint8Array.of(control), 1);
    this.endCharacterGroup();
  }
  /** Resolves this hyperlink's attribute set into a field command. @returns Nothing. */
  handleHyperlink(): void {
    const handler = new OOXMLHyperlinkHandler(this);
    this.getPropertySet()?.resolve(handler);
    handler.writetext();
  }
  /** Resolves the original header/footer reference action at element end. @returns Nothing. */
  handleHdrFtr(): void {
    if (!this.isForwardEvents()) return;
    const document = this.mpParserState.getDocument();
    const resolve =
      this.mnToken === nativeToken("doc:headerReference")
        ? document?.resolveHeader
        : document?.resolveFooter;
    if (!resolve) return;
    const receiver = this.stream();
    const handler = new OOXMLHeaderFooterHandler(
      /** Resolves the reference against the current native document part. @param type - Page type. @param id - Relationship ID. @returns Nothing. */
      (type, id) => resolve.call(document, receiver, type, id),
    );
    this.getPropertySet()?.resolve(handler);
    handler.finalize();
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
  /** Carries the original table resource marker to the mapper. @param id - Native modifier. @param value - Current table depth or marker. @returns Nothing. */
  protected sendTableMarker(id: Id, value: number): void {
    if (!this.isForwardEvents()) return;
    const properties = new OOXMLPropertySet();
    properties.add(id, V.createInteger(value), T.SPRM);
    this.stream().props(properties);
  }
  /** Opens a cell in original table order. @returns Nothing. */
  startCell(): void {
    this.sendTableMarker(N.LN_tcStart, this.mnTableDepth);
  }
  /** Closes a cell and preserves its native group marker. @returns Nothing. */
  endCell(): void {
    this.sendTableDepth();
    this.sendTableMarker(N.LN_tblCell, 1);
    this.sendTableMarker(N.LN_tcEnd, this.mnTableDepth);
  }
  /** Original row start has no callback. @returns Nothing. */
  startRow(): void {}
  /** Resolves the completed row marker after its properties. @returns Nothing. */
  endRow(): void {
    this.sendTableDepth();
    this.sendTableMarker(N.LN_tblRow, 1);
  }
  /** Routes the generated cell properties to parser state. @returns Nothing. */
  propagateCellProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.setCellProperties(this.getPropertySet());
  }
  /** Routes the generated row properties to parser state. @returns Nothing. */
  propagateRowProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.setRowProperties(this.getPropertySet());
  }
  /** Routes the generated table and grid properties to parser state. @returns Nothing. */
  propagateTableProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.setTableProperties(this.getPropertySet());
  }
  /** Delivers collected properties at the native cell boundary. @returns Nothing. */
  sendCellProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.resolveCellProperties(this.stream());
  }
  /** Delivers collected properties at the native row boundary. @returns Nothing. */
  sendRowProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.resolveRowProperties(this.stream());
  }
  /** Delivers table properties for each row. @returns Nothing. */
  sendTableProperties(): void {
    if (this.isForwardEvents()) this.mpParserState.resolveTableProperties(this.stream());
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
  /** Sends the original block content marker to the mapper. @returns Nothing. */
  startSdt(): void {
    this.sendSdtMarker(N.LN_CT_SdtBlock_sdtContent);
  }

  /** Sends the original end marker after the content is complete. @returns Nothing. */
  endSdt(): void {
    this.sendSdtMarker(N.LN_CT_SdtBlock_sdtEndContent);
  }

  /** Wraps the marker as an original resource attribute. @param resource - Generated resource ID. @returns Nothing. */
  private sendSdtMarker(resource: Id): void {
    const values = new OOXMLPropertySet();
    values.add(resource, V.createInteger(1), T.ATTRIBUTE);
    this.stream().props(values);
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
  /** Notifies both parser and stream of the original closing paragraph. @returns Nothing. */
  setLastParagraphInSection(): void {
    this.mpParserState.setLastParagraphInSection(true);
    this.stream().markLastParagraphInSection();
  }
  /** Sends an inline tab as the original UTF16 control. @returns Nothing. */
  tab(): void {
    if (this.isForwardEvents()) this.stream().utext(Uint16Array.of(9), 1);
  }
  /** Sends the original paragraph control. @returns Nothing. */
  cr(): void {
    if (this.isForwardEvents()) this.stream().utext(Uint16Array.of(13), 1);
  }
  /** Sends the original nonbreaking hyphen. @returns Nothing. */
  noBreakHyphen(): void {
    if (this.isForwardEvents()) this.stream().utext(Uint16Array.of(0x2011), 1);
  }
  /** Sends the original soft hyphen. @returns Nothing. */
  softHyphen(): void {
    if (this.isForwardEvents()) this.stream().utext(Uint16Array.of(0x00ad), 1);
  }
  /** Sends a represented picture to the native drawing consumer. @returns Nothing. */
  handlePicture(): void {
    if (this instanceof OOXMLFastContextHandlerDrawing) this.resolvePicture();
  }
  /** Resolves an inline break before releasing the source context properties. @returns Nothing. */
  handleBreak(): void {
    if (!this.isForwardEvents() || !(this instanceof OOXMLFastContextHandlerProperties)) return;
    const properties = this.getPropertySet();
    if (!properties) return;
    const handler = new OOXMLBreakHandler(this, this.stream());
    try {
      properties.resolve(handler);
    } finally {
      handler.dispose();
    }
  }
  /** Retains a block-level break until the first character group. @returns Nothing. */
  handleOutOfOrderBreak(): void {
    if (!this.isForwardEvents()) return;
    const properties = this.getPropertySet();
    if (properties) this.mpParserState.setPostponedBreak(properties);
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
  /** Native base hexadecimal default hook is inert. @returns Nothing. */ setDefaultHexValue(): void {}
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
  /** Emits an attribute's original UTF-16 value through this stream. @param id - Native property ID. @returns Nothing. */
  sendProperty(id: Id): void {
    for (const property of this.mpPropertySetAttrs) {
      if (property.getId() !== id) continue;
      const value = property.getValue()?.getString();
      if (!value) break;
      try {
        this.stream().utext(value.getStr(), value.getLength());
      } finally {
        value.dispose();
      }
      return;
    }
    this.stream().utext(new Uint16Array(), 0);
  }
}

/** Owns the native parser state for a table and its row/cell contexts. */
export class OOXMLFastContextHandlerTextTable extends OOXMLFastContextHandler {
  /** Pushes the table parser state before exposing its body. @returns Nothing. */
  protected override lcl_startFastElement(): void {
    this.mpParserState.startTable();
    this.mnTableDepth++;
    this.sendTableMarker(N.LN_tblStart, this.mnTableDepth);
    this.startAction();
  }
  /** Closes the corresponding mapper table before restoring parser state. @returns Nothing. */
  protected override lcl_endFastElement(): void {
    try {
      this.endAction();
      this.sendTableMarker(N.LN_tblEnd, this.mnTableDepth);
    } finally {
      this.mnTableDepth--;
      this.mpParserState.endTable();
    }
  }
}

/** Native properties context resolves directly only when its parent is a stream resource. */
export class OOXMLFastContextHandlerProperties extends OOXMLFastContextHandler {
  protected mpPropertySet = new OOXMLPropertySet();
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

/** Original property-table context delivers a cloned property set as one accumulating resource-table entry. */
export class OOXMLFastContextHandlerPropertyTable extends OOXMLFastContextHandlerProperties {
  private readonly mTable: OOXMLTable;
  /** Original constructor keeps the properties context's parent-resource resolution state. @param parent - Native parent context. @returns Context. */
  constructor(parent: OOXMLFastContextHandler) {
    super(parent);
    this.mTable = new OOXMLTable();
  }
  /** Original property clone, table clone and unconditional callback precede end actions; no forwarding or nonzero-ID guard is added. @param element - Unused closing token. @returns Nothing. */
  protected override lcl_endFastElement(element: number): void {
    void element;
    const value = V.createPropertySet(this.mpPropertySet.clone());
    this.mTable.add(value);
    const table = this.mTable.clone();
    this.stream().table(this.mId, table);
    this.endAction();
  }
}

/** Original resource-table context collects completed children in source order and forwards a copied value table. */
export class OOXMLFastContextHandlerTable extends OOXMLFastContextHandler {
  private readonly mTable: OOXMLTable;
  private mCurrentChild: OOXMLFastContextHandler | null;
  /** Original constructor shares its parent's parser state. @param parent - Native parent context. @returns Context. */
  constructor(parent: OOXMLFastContextHandler) {
    super(parent);
    this.mTable = new OOXMLTable();
    this.mCurrentChild = null;
  }
  /** Original table resource controls child property nesting. @returns Resource kind. */
  override getResource(): ResourceEnum_t {
    return ResourceEnum_t.TABLE;
  }
  /** Original previous-child collection precedes creating and retaining the next child. @param element - Fast element token. @returns Native child or null. */
  override createFastChildContext(element: number): OOXMLFastContextHandler | null {
    this.addCurrentChild();
    this.mCurrentChild = super.createFastChildContext(element);
    return this.mCurrentChild;
  }
  /** Original final child collection and clone occur before forwarding guards; the current child is deliberately retained. @param element - Unused end token. @returns Nothing. */
  protected override lcl_endFastElement(element: number): void {
    void element;
    this.addCurrentChild();
    const table = this.mTable.clone();
    if (this.isForwardEvents() && this.mId !== 0) this.stream().table(this.mId, table);
  }
  /** Original dynamic-context/value guards skip empty children and retain non-property values' positions. @returns Nothing. */
  private addCurrentChild(): void {
    if (this.mCurrentChild instanceof OOXMLFastContextHandler) {
      const value = this.mCurrentChild.getValue();
      if (value.hasValue()) this.mTable.add(value);
    }
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
  /** Original unsigned hexadecimal zero only for an absent value. @returns Nothing. */ override setDefaultHexValue(): void {
    if (!this.maValue.hasValue()) this.setValue(V.createHex(0));
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

const drawingAnchor = nativeToken("dmlWordDr:anchor");
const drawingExtent = nativeToken("dmlWordDr:extent");
const drawingGraphic = nativeToken("dml:graphic");
const drawingGraphicData = nativeToken("dml:graphicData");
const drawingPositionH = nativeToken("dmlWordDr:positionH");
const drawingPositionV = nativeToken("dmlWordDr:positionV");
const drawingOffset = nativeToken("dmlWordDr:posOffset");
const drawingAlign = nativeToken("dmlWordDr:align");
const drawingSimplePos = nativeToken("dmlWordDr:simplePos");
const drawingWrapTopAndBottom = nativeToken("dmlWordDr:wrapTopAndBottom");
const drawingWrapNone = nativeToken("dmlWordDr:wrapNone");
const unsupportedDrawingWrap = new Set([
  nativeToken("dmlWordDr:wrapSquare"),
  nativeToken("dmlWordDr:wrapTight"),
  nativeToken("dmlWordDr:wrapThrough"),
]);
const drawingPicture = nativeToken("dmlPicture:pic");
const drawingBlipFill = nativeToken("dmlPicture:blipFill");
const drawingBlip = nativeToken("dml:blip");
const drawingRoot = nativeToken("doc:drawing");

const drawingChildren = new Map<number, readonly number[]>([
  [drawingRoot, [drawingAnchor]],
  [
    drawingAnchor,
    [
      drawingExtent,
      drawingGraphic,
      drawingPositionH,
      drawingPositionV,
      drawingSimplePos,
      drawingWrapNone,
      drawingWrapTopAndBottom,
    ],
  ],
  [drawingPositionH, [drawingOffset, drawingAlign]],
  [drawingPositionV, [drawingOffset, drawingAlign]],
  [drawingGraphic, [drawingGraphicData]],
  [drawingGraphicData, [drawingPicture]],
  [drawingPicture, [drawingBlipFill]],
  [drawingBlipFill, [drawingBlip]],
]);

/** Holds state shared by represented descendants of one source anchor. */
interface PictureState extends DrawingAnchor {
  width: number;
  height: number;
  behindDocument: boolean;
  wrap: WrapTextMode;
  relationship: string;
  anchored: boolean;
  simplePosition: boolean;
}

/** Reads one generated lexical attribute by token. @param attributes - Fast attributes. @param name - Original QName. @returns Value or native empty string. */
function drawingAttribute(attributes: readonly FastAttribute[], name: string): string {
  const token = nativeToken(name);
  return (
    attributes.find(
      /** Selects the source attribute by numeric identity. @param attribute - Native attribute. @returns Match. */
      (attribute) => attribute.token === token,
    )?.value ?? ""
  );
}

/** Native drawing property container with a shape context for an embedded floating raster picture. */
export class OOXMLFastContextHandlerDrawing extends OOXMLFastContextHandlerProperties {
  private readonly picture: PictureState = {
    width: 0,
    height: 0,
    horizontal: { relativeFrom: "", align: "", offset: 0 },
    vertical: { relativeFrom: "", align: "", offset: 0 },
    behindDocument: false,
    wrap: WrapTextMode.NONE,
    relationship: "",
    anchored: false,
    simplePosition: false,
  };

  /** Preserves the DrawingML shape context under this generated drawing definition. @param element - Child fast token. @returns Drawing child or no context. */
  override createFastChildContext(element: number): OOXMLFastContextHandler | null {
    return drawingChildren.get(drawingRoot)?.includes(element)
      ? new OOXMLFastContextHandlerShape(this, element, this.picture)
      : super.createFastChildContext(element);
  }
  /** Runs the native CT_Drawing end action and delivers the resolved picture. @returns Nothing. */
  resolvePicture(): void {
    if (!this.isForwardEvents()) return;
    const picture = this.picture;
    if (!picture.anchored || !picture.relationship || !(picture.width > 0 && picture.height > 0))
      throw new Error("Writer does not support this DrawingML drawing.");
    const graphic = this.mpParserState.getDocument()?.getEmbeddedGraphic?.(picture.relationship);
    if (!graphic) throw new Error("Writer could not resolve the embedded DrawingML picture.");
    this.stream().picture?.(graphic, picture);
  }
}

/** Receives the represented WordprocessingDrawing and Picture resources under a single drawing. */
class OOXMLFastContextHandlerShape extends OOXMLFastContextHandler {
  private value = "";
  /** Retains the active generated element and picture placement owner. @param parent - Parent SAX context. @param element - Child identity. @param picture - Active drawing state. @returns Context. */
  constructor(
    parent: OOXMLFastContextHandler,
    element: number,
    private readonly picture: PictureState,
  ) {
    super(parent);
    this.setToken(element);
  }
  /** Accepts only the source paths through the represented picture shape. @param element - Child token. @returns Picture context or null. */
  override createFastChildContext(element: number): OOXMLFastContextHandler | null {
    if (this.getToken() === drawingAnchor && unsupportedDrawingWrap.has(element))
      throw new Error("Writer does not support this DrawingML wrapping mode.");
    return drawingChildren.get(this.getToken())?.includes(element)
      ? new OOXMLFastContextHandlerShape(this, element, this.picture)
      : null;
  }
  /** Collects the represented DrawingML attributes without opening package streams inside SAX. @param element - Active token. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(element: number, attributes: readonly FastAttribute[]): void {
    const picture = this.picture;
    switch (element) {
      case drawingAnchor: {
        const simple = drawingAttribute(attributes, ":simplePos");
        picture.simplePosition = simple === "1" || simple === "true";
        picture.anchored = true;
        const behind = drawingAttribute(attributes, ":behindDoc");
        picture.behindDocument = behind === "1" || behind === "true";
        break;
      }
      case drawingExtent:
        picture.width = Number(drawingAttribute(attributes, ":cx"));
        picture.height = Number(drawingAttribute(attributes, ":cy"));
        break;
      case drawingSimplePos:
        if (picture.simplePosition) {
          picture.horizontal.relativeFrom = "page";
          picture.horizontal.offset = Number.parseInt(drawingAttribute(attributes, ":x"), 10) || 0;
          picture.vertical.relativeFrom = "page";
          picture.vertical.offset = Number.parseInt(drawingAttribute(attributes, ":y"), 10) || 0;
        }
        break;
      case drawingPositionH:
        if (picture.simplePosition) break;
        picture.horizontal.relativeFrom = drawingAttribute(attributes, ":relativeFrom");
        break;
      case drawingPositionV:
        if (picture.simplePosition) break;
        picture.vertical.relativeFrom = drawingAttribute(attributes, ":relativeFrom");
        break;
      case drawingWrapTopAndBottom:
        picture.wrap = WrapTextMode.NONE;
        break;
      case drawingWrapNone:
        picture.wrap = WrapTextMode.THROUGH;
        break;
      case drawingBlip:
        picture.relationship = drawingAttribute(attributes, "officeRel:embed");
        break;
    }
  }
  /** Combines SAX chunks belonging to one original offset or alignment. @param value - Text chunk. @returns Nothing. */
  override characters(value: string): void {
    if (this.getToken() === drawingOffset || this.getToken() === drawingAlign) this.value += value;
  }
  /** Delivers one axis' lexical value, keeping horizontal and vertical resource state independent. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: number): void {
    if (this.picture.simplePosition || (element !== drawingOffset && element !== drawingAlign))
      return;
    const axis =
      this.mpParent?.getToken() === drawingPositionH
        ? this.picture.horizontal
        : this.picture.vertical;
    if (element === drawingOffset) axis.offset = Number.parseInt(this.value, 10) || 0;
    else axis.align = this.value;
  }
}
