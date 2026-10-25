/** @fileoverview Native OOXMLParserState group flags, context handles, property stacks, floating-table filtering, postponed breaks and textbox save/restore. Host references bind original shared/raw pointers. */
import type { Stream } from "../inc/dmapper/resourcemodel";
import type { OOXMLDocument } from "../inc/ooxml/OOXMLDocument";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { OOXMLBreakHandler } from "./Handler";
import { OOXMLPropertySet } from "./OOXMLPropertySet";

/** Original mutable alternate-content state stack entry. */
export interface SavedAlternateState {
  m_bDiscardChildren: boolean;
  m_bTookChoice: boolean;
}

/** Native parser state shared by fast contexts in one document stream. */
export class OOXMLParserState {
  private mbInSectionGroup = false;
  private mbInParagraphGroup = false;
  private mbInCharacterGroup = false;
  private mbLastParagraphInSection = false;
  private mbForwardEvents = true;
  private mnContexts = 0;
  private mnHandle = 0;
  private mpDocument: OOXMLDocument | null = null;
  private mpCharacterProps: OOXMLPropertySet | null = null;
  private readonly mCellProps: (OOXMLPropertySet | null)[] = [];
  private readonly mRowProps: (OOXMLPropertySet | null)[] = [];
  private readonly mTableProps: (OOXMLPropertySet | null)[] = [];
  private m_nFloatingTableLevels = 0;
  private readonly m_aIsFloatingTable: boolean[] = [];
  private m_inTxbxContent = false;
  private m_savedInParagraphGroup = false;
  private m_savedInCharacterGroup = false;
  private m_savedLastParagraphInSection = false;
  private readonly maSavedAlternateStates: SavedAlternateState[] = [];
  private readonly mvPostponedBreaks: OOXMLPropertySet[] = [];
  private mbStartFootnote = false;
  private m_bFloatingTableEnded = false;

  /** Native group flag. @returns Flag. */ isInSectionGroup(): boolean {
    return this.mbInSectionGroup;
  }
  /** Native group setter. @param value - Flag. @returns Nothing. */ setInSectionGroup(
    value: boolean,
  ): void {
    this.mbInSectionGroup = value;
  }
  /** Native last-paragraph setter. @param value - Flag. @returns Nothing. */ setLastParagraphInSection(
    value: boolean,
  ): void {
    this.mbLastParagraphInSection = value;
  }
  /** Native last-paragraph flag. @returns Flag. */ isLastParagraphInSection(): boolean {
    return this.mbLastParagraphInSection;
  }
  /** Borrows the native mutable alternate state vector. @returns Vector. */ getSavedAlternateStates(): SavedAlternateState[] {
    return this.maSavedAlternateStates;
  }
  /** Native paragraph flag. @returns Flag. */ isInParagraphGroup(): boolean {
    return this.mbInParagraphGroup;
  }
  /** Native paragraph setter. @param value - Flag. @returns Nothing. */ setInParagraphGroup(
    value: boolean,
  ): void {
    this.mbInParagraphGroup = value;
  }
  /** Native character flag. @returns Flag. */ isInCharacterGroup(): boolean {
    return this.mbInCharacterGroup;
  }
  /** Native character setter. @param value - Flag. @returns Nothing. */ setInCharacterGroup(
    value: boolean,
  ): void {
    this.mbInCharacterGroup = value;
  }
  /** Native forwarding setter. @param value - Flag. @returns Nothing. */ setForwardEvents(
    value: boolean,
  ): void {
    this.mbForwardEvents = value;
  }
  /** Native forwarding flag. @returns Flag. */ isForwardEvents(): boolean {
    return this.mbForwardEvents;
  }
  /** Original decimal handle formatting. @returns Handle. */ getHandle(): string {
    return String(this.mnHandle);
  }
  /** Copies the current context counter. @returns Nothing. */ setHandle(): void {
    this.mnHandle = this.mnContexts;
  }
  /** Borrows the original document pointer. @param document - Document or null. @returns Nothing. */ setDocument(
    document: OOXMLDocument | null,
  ): void {
    this.mpDocument = document;
  }
  /** Original nullable pointer access. @returns Document. */ getDocument(): OOXMLDocument | null {
    return this.mpDocument;
  }
  /** Makes the native non-null dereference precondition explicit at the host boundary. @returns Document. */
  private document(): OOXMLDocument {
    if (!this.mpDocument) throw new Error("OOXMLParserState document pointer is null.");
    return this.mpDocument;
  }
  /** Original note ID delegation. @param id - Signed32 note ID. @returns Nothing. */ setXNoteId(
    id: number,
  ): void {
    this.document().setXNoteId(id);
  }
  /** Original note ID delegation. @returns ID. */ getXNoteId(): number {
    return this.document().getXNoteId();
  }
  /** Original document target delegation. @returns Target. */ getTarget(): string {
    return this.document().getTarget();
  }
  /** Emits then releases character properties, preserving callback ordering. @param stream - Receiver. @returns Nothing. */
  resolveCharacterProperties(stream: Stream): void {
    if (this.mpCharacterProps) {
      stream.props(this.mpCharacterProps);
      this.mpCharacterProps = null;
    }
  }
  /** Original append retains property references and duplicate IDs. @param properties - Properties or null. @returns Nothing. */
  setCharacterProperties(properties: OOXMLPropertySet | null): void {
    if (!this.mpCharacterProps) this.mpCharacterProps = properties;
    else this.mpCharacterProps.add(properties);
  }
  /** Original top-cell append ignores calls outside tables. @param properties - Properties or null. @returns Nothing. */
  setCellProperties(properties: OOXMLPropertySet | null): void {
    const index = this.mCellProps.length - 1;
    if (index >= 0) {
      const current = this.mCellProps[index];
      if (!current) this.mCellProps[index] = properties;
      else current.add(properties);
    }
  }
  /** Original top-row append ignores calls outside tables. @param properties - Properties or null. @returns Nothing. */
  setRowProperties(properties: OOXMLPropertySet | null): void {
    const index = this.mRowProps.length - 1;
    if (index >= 0) {
      const current = this.mRowProps[index];
      if (!current) this.mRowProps[index] = properties;
      else current.add(properties);
    }
  }
  /** Native cell resolution replaces an emitted set with an allocated empty set. @param stream - Receiver. @returns Nothing. */
  resolveCellProperties(stream: Stream): void {
    const index = this.mCellProps.length - 1,
      properties = this.mCellProps[index];
    if (index >= 0 && properties) {
      stream.props(properties);
      this.mCellProps[index] = new OOXMLPropertySet();
    }
  }
  /** Native row resolution replaces an emitted set with an allocated empty set. @param stream - Receiver. @returns Nothing. */
  resolveRowProperties(stream: Stream): void {
    const index = this.mRowProps.length - 1,
      properties = this.mRowProps[index];
    if (index >= 0 && properties) {
      stream.props(properties);
      this.mRowProps[index] = new OOXMLPropertySet();
    }
  }
  /** Native third floating table level filters positioning on a copy and retains original table properties for later rows. @param stream - Receiver. @returns Nothing. */
  resolveTableProperties(stream: Stream): void {
    const properties = this.GetTableProperties();
    if (properties) {
      if (
        this.m_nFloatingTableLevels >= 3 &&
        this.m_aIsFloatingTable.length > 0 &&
        this.m_aIsFloatingTable.at(-1)
      ) {
        const filtered = new OOXMLPropertySet(properties);
        filtered.erase(N.LN_CT_TblPrBase_tblpPr);
        stream.props(filtered);
      } else stream.props(properties);
    }
  }
  /** Appends properties before scanning only the incoming set for floating-table positioning. @param properties - Incoming set or null. @returns Nothing. */
  setTableProperties(properties: OOXMLPropertySet | null): void {
    const index = this.mTableProps.length - 1;
    if (index >= 0) {
      const current = this.mTableProps[index];
      if (!current) this.mTableProps[index] = properties;
      else current.add(properties);
      if (properties)
        for (const property of properties) {
          if (property.getId() === N.LN_CT_TblPrBase_tblpPr) {
            this.setCurrentTableFloating();
            break;
          }
        }
    }
  }
  /** Original nullable current table properties. @returns Set or null. */ GetTableProperties(): OOXMLPropertySet | null {
    return this.mTableProps.at(-1) ?? null;
  }
  /** Original per-break lexical handler lifetime delivers markers in insertion order. @param stream - Receiver. @returns Nothing. */
  resolvePostponedBreak(stream: Stream): void {
    for (const properties of this.mvPostponedBreaks) {
      const handler = new OOXMLBreakHandler(null, stream);
      try {
        properties.resolve(handler);
      } finally {
        handler.dispose();
      }
    }
    this.mvPostponedBreaks.length = 0;
  }
  /** Retains the original shared break-property reference. @param properties - Set. @returns Nothing. */ setPostponedBreak(
    properties: OOXMLPropertySet,
  ): void {
    this.mvPostponedBreaks.push(properties);
  }
  /** Pushes native null entries at one new table level. @returns Nothing. */
  startTable(): void {
    this.mCellProps.push(null);
    this.mRowProps.push(null);
    this.mTableProps.push(null);
    this.m_aIsFloatingTable.push(false);
  }
  /** Pops the matching table level and adjusts floating nesting once. @returns Nothing. */
  endTable(): void {
    if (this.mTableProps.length === 0)
      throw new Error("OOXMLParserState native table stack underflow.");
    this.mCellProps.pop();
    this.mRowProps.pop();
    this.mTableProps.pop();
    // startTable pushes all four stacks together; the checked native pop precondition
    // guarantees the floating stack is nonempty on every defined public path.
    if (this.m_aIsFloatingTable.at(-1)) --this.m_nFloatingTableLevels;
    this.m_aIsFloatingTable.pop();
  }
  /** Counts each floating table level only once. @returns Nothing. */
  setCurrentTableFloating(): void {
    const index = this.m_aIsFloatingTable.length - 1;
    if (index >= 0 && !this.m_aIsFloatingTable[index]) {
      this.m_aIsFloatingTable[index] = true;
      ++this.m_nFloatingTableLevels;
    }
  }
  /** Original unsigned context counter. @returns Nothing. */ incContextCount(): void {
    this.mnContexts = (this.mnContexts + 1) >>> 0;
  }
  /** Native single saved textbox state intentionally leaves section state alone. @returns Nothing. */
  startTxbxContent(): void {
    this.m_inTxbxContent = true;
    this.m_savedInParagraphGroup = this.mbInParagraphGroup;
    this.m_savedInCharacterGroup = this.mbInCharacterGroup;
    this.m_savedLastParagraphInSection = this.mbLastParagraphInSection;
    this.mbInParagraphGroup = false;
    this.mbInCharacterGroup = false;
    this.mbLastParagraphInSection = false;
  }
  /** Unmatched closes return without altering flags, as the native warning branch does. @returns Nothing. */
  endTxbxContent(): void {
    if (!this.m_inTxbxContent) return;
    this.mbInParagraphGroup = this.m_savedInParagraphGroup;
    this.mbInCharacterGroup = this.m_savedInCharacterGroup;
    this.mbLastParagraphInSection = this.m_savedLastParagraphInSection;
    this.m_inTxbxContent = false;
  }
  /** Native footnote marker. @param value - Flag. @returns Nothing. */ setStartFootnote(
    value: boolean,
  ): void {
    this.mbStartFootnote = value;
  }
  /** Native footnote flag. @returns Flag. */ isStartFootnote(): boolean {
    return this.mbStartFootnote;
  }
  /** Native floating-table-end marker. @param value - Flag. @returns Nothing. */ SetFloatingTableEnded(
    value: boolean,
  ): void {
    this.m_bFloatingTableEnded = value;
  }
  /** Native floating-table-end flag. @returns Flag. */ GetFloatingTableEnded(): boolean {
    return this.m_bFloatingTableEnded;
  }
}
