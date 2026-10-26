/** @fileoverview Original CellData/RowData/TableData header owners and CellData::IsValid body over actual UNO Reference and tools SvRef values; C++ member/vector destruction binds explicitly to the pinned native lifetime order. */
import { SvRef, SvRefBase } from "../../../../tools/inc/ref";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XTextRange } from "../../../../offapi/com/sun/star/text/XTextRange";
import { TablePropertyMap } from "./PropertyMap";

/** Original final cell retains two independent range references, one map reference and native open/span state. */
export class CellData extends SvRefBase {
  private readonly mStart: Reference<XTextRange>;
  private readonly mEnd: Reference<XTextRange>;
  private readonly mpProps: SvRef<TablePropertyMap>;
  private mbOpen = true;
  private m_nGridSpan = 1;
  /** Original by-value map parameter is copied before member construction, then moved into its member. @param start - Borrowed start range. @param properties - Borrowed original map pointer value. @returns Cell. */
  constructor(start: Reference<XTextRange>, properties: SvRef<TablePropertyMap>) {
    const parameter = new SvRef(properties);
    super();
    this.mStart = new Reference(start);
    this.mEnd = new Reference(start);
    this.mpProps = SvRef.move(parameter);
    parameter.dispose();
  }
  /** Original end assignment closes the cell even when the end reference is empty. @param end - Borrowed range. @returns Nothing. */
  setEnd(end: Reference<XTextRange>): void {
    this.mEnd.assign(end);
    this.mbOpen = false;
  }
  /** Original existing map merges; a missing map acquires the supplied pointer without cloning its contents. @param properties - Borrowed property pointer. @returns Nothing. */
  insertProperties(properties: SvRef<TablePropertyMap>): void {
    if (this.mpProps.is()) this.mpProps.operatorArrow().InsertProps(properties.get());
    else this.mpProps.assign(properties);
  }
  /** Original borrowed const range reference. @returns Member reference. */
  getStart(): Reference<XTextRange> {
    return this.mStart;
  }
  /** Original borrowed const end reference. @returns Member reference. */
  getEnd(): Reference<XTextRange> {
    return this.mEnd;
  }
  /** Original borrowed const map pointer value. @returns Member pointer owner. */
  getProperties(): SvRef<TablePropertyMap> {
    return this.mpProps;
  }
  /** Original cell-open predicate. @returns Open flag. */
  isOpen(): boolean {
    return this.mbOpen;
  }
  /** Original unsigned32 grid span. @returns Span. */
  getGridSpan(): number {
    return this.m_nGridSpan;
  }
  /** Original unsigned32 assignment does not reject zero. @param span - Original unsigned input. @returns Nothing. */
  setGridSpan(span: number): void {
    this.m_nGridSpan = span >>> 0;
  }
  /** Original only replaces start, preserving end/open state. @param start - Borrowed range. @returns Nothing. */
  SetStart(start: Reference<XTextRange>): void {
    this.mStart.assign(start);
  }
  /** Original TableManager.cxx body checks only the stored start and whether getStart throws RuntimeException; its returned pointer is ignored. @returns Validity. */
  IsValid(): boolean {
    if (!this.mStart.is()) return false;
    try {
      const temporary = (this.mStart.get() as XTextRange).getStart();
      temporary.dispose();
    } catch (error) {
      if (!(error instanceof RuntimeException)) throw error;
      error.dispose();
      return false;
    }
    return true;
  }
  /** Original reverse member destruction: map, end, start, then empty intrusive base. @returns Nothing. */
  protected override destroy(): void {
    this.mpProps.dispose();
    this.mEnd.dispose();
    this.mStart.dispose();
    super.destroy();
  }
}

/** Original row stores intrusive cell aliases; its copy constructor copies pointer values and shares the maps/cells. */
export class RowData extends SvRefBase {
  private readonly mCells: SvRef<CellData>[];
  private readonly mpProperties: SvRef<TablePropertyMap>;
  private m_nGridBefore = 0;
  private m_nGridAfter = 0;
  /** Original default and explicit copy constructors begin with a fresh intrusive base. @param source - Optional borrowed row. @returns Row. */
  constructor(source?: Readonly<RowData>) {
    super();
    if (source === undefined) {
      this.mCells = [];
      this.mpProperties = new SvRef();
    } else {
      const row = source as RowData;
      this.mCells = row.mCells.map(
        /** Original vector copy constructs each actual pointer value. @param cell - Borrowed source pointer. @returns Acquired copy. */ (
          cell,
        ) => new SvRef(cell),
      );
      this.mpProperties = new SvRef(row.mpProperties);
      this.m_nGridBefore = row.m_nGridBefore;
      this.m_nGridAfter = row.m_nGridAfter;
    }
  }
  /** Original gridBefore inserts a closed empty cell at front, while ordinary cells append open. @param start - Borrowed range. @param properties - Borrowed map pointer. @param addBefore - Original gridBefore selector. @returns Nothing. */
  addCell(
    start: Reference<XTextRange>,
    properties: SvRef<TablePropertyMap>,
    addBefore = false,
  ): void {
    const cell = new SvRef(new CellData(start, properties));
    try {
      if (addBefore) {
        this.mCells.unshift(new SvRef(cell));
        (this.mCells[0] as SvRef<CellData>).operatorArrow().setEnd(start);
      } else this.mCells.push(new SvRef(cell));
    } finally {
      cell.dispose();
    }
  }
  /** Original ignores an empty row, otherwise closes the last cell. @param end - Borrowed range. @returns Nothing. */
  endCell(end: Reference<XTextRange>): void {
    if (this.mCells.length > 0) (this.mCells.at(-1) as SvRef<CellData>).operatorArrow().setEnd(end);
  }
  /** Original only observes the last cell. @returns Open flag. */
  isCellOpen(): boolean {
    return (
      this.mCells.length > 0 && (this.mCells.at(-1) as SvRef<CellData>).operatorArrow().isOpen()
    );
  }
  /** Original empty-row no-op, otherwise replaces only the last start. @param start - Borrowed range. @returns Nothing. */
  SetCellStart(start: Reference<XTextRange>): void {
    if (this.mCells.length === 0) return;
    (this.mCells.at(-1) as SvRef<CellData>).operatorArrow().SetStart(start);
  }
  /** Original empty-row false, otherwise delegates actual start validity. @returns Validity. */
  IsCellValid(): boolean {
    return (
      this.mCells.length > 0 && (this.mCells.at(-1) as SvRef<CellData>).operatorArrow().IsValid()
    );
  }
  /** Original null input does nothing; existing row properties merge in place. @param properties - Borrowed map pointer. @returns Nothing. */
  insertProperties(properties: SvRef<TablePropertyMap>): void {
    if (properties.is()) {
      if (!this.mpProperties.is()) this.mpProperties.assign(properties);
      else this.mpProperties.operatorArrow().InsertProps(properties.get());
    }
  }
  /** Original empty-row no-op, otherwise merges into the final cell. @param properties - Borrowed map pointer. @returns Nothing. */
  insertCellProperties(properties: SvRef<TablePropertyMap>): void {
    if (this.mCells.length > 0)
      (this.mCells.at(-1) as SvRef<CellData>).operatorArrow().insertProperties(properties);
  }
  /** Original vector size. @returns Cell count. */
  getCellCount(): number {
    return this.mCells.length;
  }
  /** Original unchecked indexed borrowed range; valid index is the producer precondition. @param index - Unsigned cell index. @returns Borrowed reference. */
  getCellStart(index: number): Reference<XTextRange> {
    return (this.mCells[index >>> 0] as SvRef<CellData>).operatorArrow().getStart();
  }
  /** Original unchecked indexed borrowed range. @param index - Unsigned cell index. @returns Borrowed reference. */
  getCellEnd(index: number): Reference<XTextRange> {
    return (this.mCells[index >>> 0] as SvRef<CellData>).operatorArrow().getEnd();
  }
  /** Original unchecked indexed borrowed map pointer. @param index - Unsigned cell index. @returns Borrowed pointer value. */
  getCellProperties(index: number): SvRef<TablePropertyMap> {
    return (this.mCells[index >>> 0] as SvRef<CellData>).operatorArrow().getProperties();
  }
  /** Original borrowed const row property pointer. @returns Member owner. */
  getProperties(): SvRef<TablePropertyMap> {
    return this.mpProperties;
  }
  /** Original unsigned32 gridBefore. @returns Count. */
  getGridBefore(): number {
    return this.m_nGridBefore;
  }
  /** Original unsigned32 gridBefore assignment. @param value - Count. @returns Nothing. */
  setGridBefore(value: number): void {
    this.m_nGridBefore = value >>> 0;
  }
  /** Original unsigned32 gridAfter. @returns Count. */
  getGridAfter(): number {
    return this.m_nGridAfter;
  }
  /** Original unsigned32 gridAfter assignment. @param value - Count. @returns Nothing. */
  setGridAfter(value: number): void {
    this.m_nGridAfter = value >>> 0;
  }
  /** Original unchecked indexed grid span. @param index - Unsigned cell index. @returns Span. */
  getGridSpan(index: number): number {
    return (this.mCells[index >>> 0] as SvRef<CellData>).operatorArrow().getGridSpan();
  }
  /** Original copied scalar vector in cell order. @returns Independent span array. */
  getGridSpans(): number[] {
    return this.mCells.map(
      /** Original scalar push_back. @param cell - Borrowed actual cell pointer. @returns Span. */ (
        cell,
      ) => cell.operatorArrow().getGridSpan(),
    );
  }
  /** Original chooses front/back only when cells exist; zero spans remain valid stored values. @param span - Unsigned span. @param firstCell - Original front selector. @returns Nothing. */
  setCurrentGridSpan(span: number, firstCell = false): void {
    if (this.mCells.length) {
      const cell = firstCell ? this.mCells[0] : this.mCells.at(-1);
      (cell as SvRef<CellData>).operatorArrow().setGridSpan(span);
    }
  }
  /** Original reverse fields and pinned libc++ vector element destruction order. @returns Nothing. */
  protected override destroy(): void {
    this.mpProperties.dispose();
    for (let index = this.mCells.length; index--;)
      (this.mCells[index] as SvRef<CellData>).dispose();
    super.destroy();
  }
}

/** Original table owns completed row pointer values and a distinct current row. */
export class TableData extends SvRefBase {
  private readonly mRows: SvRef<RowData>[] = [];
  private readonly mpRow = new SvRef<RowData>();
  private readonly mnDepth: number;
  /** Original depth conversion and fresh current-row construction. @param depth - Native unsigned depth. @returns Table. */
  constructor(depth: number) {
    super();
    this.mnDepth = depth >>> 0;
    this.newRow();
  }
  /** Original prvalue row pointer move assignment. @returns Nothing. */
  private newRow(): void {
    const row = new SvRef(new RowData());
    try {
      this.mpRow.moveAssign(row);
    } finally {
      row.dispose();
    }
  }
  /** Original finalizes even empty rows, retains the old row by pointer copy and allocates a distinct current row. @param properties - Borrowed row map pointer. @returns Nothing. */
  endRow(properties: SvRef<TablePropertyMap>): void {
    this.mpRow.operatorArrow().insertProperties(properties);
    this.mRows.push(new SvRef(this.mpRow));
    this.newRow();
  }
  /** Original forwards to the current row. @param start - Borrowed range. @param properties - Borrowed map pointer. @returns Nothing. */
  addCell(start: Reference<XTextRange>, properties: SvRef<TablePropertyMap>): void {
    this.mpRow.operatorArrow().addCell(start, properties);
  }
  /** Original closes the current row's last cell. @param end - Borrowed range. @returns Nothing. */
  endCell(end: Reference<XTextRange>): void {
    this.mpRow.operatorArrow().endCell(end);
  }
  /** Original current-cell state. @returns Open flag. */
  isCellOpen(): boolean {
    return this.mpRow.operatorArrow().isCellOpen();
  }
  /** Original forwards start replacement. @param start - Borrowed range. @returns Nothing. */
  SetCellStart(start: Reference<XTextRange>): void {
    this.mpRow.operatorArrow().SetCellStart(start);
  }
  /** Original current-row validity. @returns Validity. */
  IsCellValid(): boolean {
    return this.mpRow.operatorArrow().IsCellValid();
  }
  /** Original current-cell property merge. @param properties - Borrowed map pointer. @returns Nothing. */
  insertCellProperties(properties: SvRef<TablePropertyMap>): void {
    this.mpRow.operatorArrow().insertCellProperties(properties);
  }
  /** Original completed row vector size. @returns Count. */
  getRowCount(): number {
    return this.mRows.length;
  }
  /** Original stored unsigned32 nesting depth. @returns Depth. */
  getDepth(): number {
    return this.mnDepth;
  }
  /** Original unchecked completed-row pointer borrow. @param index - Unsigned row index. @returns Borrowed const pointer value. */
  getRow(index: number): SvRef<RowData> {
    return this.mRows[index >>> 0] as SvRef<RowData>;
  }
  /** Original current-row pointer borrow. @returns Borrowed const pointer value. */
  getCurrentRow(): SvRef<RowData> {
    return this.mpRow;
  }
  /** Original current-row member precedes reverse completed-vector destruction. @returns Nothing. */
  protected override destroy(): void {
    this.mpRow.dispose();
    for (let index = this.mRows.length; index--;) (this.mRows[index] as SvRef<RowData>).dispose();
    super.destroy();
  }
}
