/** @fileoverview Native represented integer Point/Size and closed-interval Rectangle values from tools/gen.hxx; unconsumed transforms, hashing and full geometry APIs remain unported. */
/** Const native point access without writable references. */
export interface ReadonlyPoint {
  X(): number;
  Y(): number;
}
/** Const native size access without writable references. */
export interface ReadonlySize {
  Width(): number;
  Height(): number;
}
/** Original two-coordinate storage shared through the native template bases. */
export class Pair {
  protected mnA: number;
  protected mnB: number;
  /** Initializes native integer coordinates. @param a - First coordinate. @param b - Second coordinate. @returns Nothing. */
  public constructor(a = 0, b = 0) {
    this.mnA = Math.trunc(a) + 0;
    this.mnB = Math.trunc(b) + 0;
  }
  /** Reads the first original value. @returns Integer value. */
  public A(): number {
    return this.mnA;
  }
  /** Reads the second original value. @returns Integer value. */
  public B(): number {
    return this.mnB;
  }
}
/** Original point template base over Pair storage. */
abstract class PointTemplateBase extends Pair implements ReadonlyPoint {
  /** Reads horizontal position. @returns Native coordinate. */
  public X(): number {
    return this.mnA;
  }
  /** Reads vertical position. @returns Native coordinate. */
  public Y(): number {
    return this.mnB;
  }
}
/** Original represented Point template operations. */
abstract class PointTemplate extends PointTemplateBase {
  /** Adjusts the original horizontal coordinate. @param value - Integer delta. @returns Updated coordinate. */
  public AdjustX(value: number): number {
    return (this.mnA += Math.trunc(value));
  }
  /** Adjusts the original vertical coordinate. @param value - Integer delta. @returns Updated coordinate. */
  public AdjustY(value: number): number {
    return (this.mnB += Math.trunc(value));
  }
  /** Reads horizontal position. @returns Native coordinate. */
  public getX(): number {
    return this.X();
  }
  /** Reads vertical position. @returns Native coordinate. */
  public getY(): number {
    return this.Y();
  }
  /** Writes horizontal position. @param value - Integer coordinate. @returns Nothing. */
  public setX(value: number): void {
    this.mnA = Math.trunc(value) + 0;
  }
  /** Writes vertical position. @param value - Integer coordinate. @returns Nothing. */
  public setY(value: number): void {
    this.mnB = Math.trunc(value) + 0;
  }
  /** Moves by native coordinates or a native size. @param horizontal - Horizontal delta or original size. @param vertical - Vertical delta for numeric form. @returns Nothing. */
  public Move(horizontal: number, vertical: number): void;
  /** Provides the native Move call contract. @param size - Native size argument. @returns Native getter value or no setter result. */
  public Move(size: ReadonlySize): void;
  /** Provides the native Move call contract. @param horizontal - Native horizontal argument. @param vertical - Native vertical argument. @returns Native getter value or no setter result. */
  public Move(horizontal: number | ReadonlySize, vertical = 0): void {
    this.AdjustX(typeof horizontal === "number" ? horizontal : horizontal.Width());
    this.AdjustY(typeof horizontal === "number" ? vertical : horizontal.Height());
  }
}
/** Original Point value, retaining native copy construction. */
export class Point extends PointTemplate {
  /** Creates an independent native point. @param x - Horizontal coordinate or original point. @param y - Vertical coordinate. @returns Nothing. */
  public constructor(other?: ReadonlyPoint);
  /** Creates an independent native geometry value. @param x - Native x argument. @param y - Native y argument. @returns Nothing. */
  public constructor(x: number, y: number);
  /** Creates an independent native geometry value. @param x - Native x argument. @param y - Native y argument. @returns Nothing. */
  public constructor(x: number | ReadonlyPoint = 0, y = 0) {
    super(typeof x === "number" ? x : x.X(), typeof x === "number" ? y : x.Y());
  }
}
/** Original size template base over Pair storage. */
abstract class SizeTemplateBase extends Pair implements ReadonlySize {
  /** Reads original width. @returns Native size. */
  public Width(): number {
    return this.mnA;
  }
  /** Reads original height. @returns Native size. */
  public Height(): number {
    return this.mnB;
  }
}
/** Original represented Size template operations. */
abstract class SizeTemplate extends SizeTemplateBase {
  /** Adjusts original width. @param value - Integer delta. @returns Updated width. */
  public AdjustWidth(value: number): number {
    return (this.mnA += Math.trunc(value));
  }
  /** Adjusts original height. @param value - Integer delta. @returns Updated height. */
  public AdjustHeight(value: number): number {
    return (this.mnB += Math.trunc(value));
  }
  /** Reads original width. @returns Native size. */
  public getWidth(): number {
    return this.Width();
  }
  /** Reads original height. @returns Native size. */
  public getHeight(): number {
    return this.Height();
  }
  /** Writes original width. @param value - Integer size. @returns Nothing. */
  public setWidth(value: number): void {
    this.mnA = Math.trunc(value) + 0;
  }
  /** Writes original height. @param value - Integer size. @returns Nothing. */
  public setHeight(value: number): void {
    this.mnB = Math.trunc(value) + 0;
  }
  /** Tests the original nonpositive size predicate. @returns Whether empty. */
  public IsEmpty(): boolean {
    return this.mnA <= 0 || this.mnB <= 0;
  }
  /** Extends both original dimensions. @param x - Width delta. @param y - Height delta. @returns Nothing. */
  public extendBy(x: number, y: number): void {
    this.AdjustWidth(x);
    this.AdjustHeight(y);
  }
}
/** Original Size value, retaining native copy construction. */
export class Size extends SizeTemplate {
  /** Creates an independent native size. @param width - Width or original size. @param height - Height. @returns Nothing. */
  public constructor(other?: ReadonlySize);
  /** Creates an independent native geometry value. @param width - Native width argument. @param height - Native height argument. @returns Nothing. */
  public constructor(width: number, height: number);
  /** Creates an independent native geometry value. @param width - Native width argument. @param height - Native height argument. @returns Nothing. */
  public constructor(width: number | ReadonlySize = 0, height = 0) {
    super(
      typeof width === "number" ? width : width.Width(),
      typeof width === "number" ? height : width.Height(),
    );
  }
}

/** Consumed native closed-interval Rectangle value; unconsumed transforms and open-interval setters remain unported. */
export class Rectangle {
  public static readonly RECT_EMPTY = -32767;
  private mnLeft = 0;
  private mnTop = 0;
  private mnRight = Rectangle.RECT_EMPTY;
  private mnBottom = Rectangle.RECT_EMPTY;
  /** Original default,copy,empty-position,closed-edge and point/size forms. @param args - Actual constructor form. @returns Independent rectangle. */
  constructor(
    ...args:
      | []
      | [source: Rectangle]
      | [left: number, top: number]
      | [left: number, top: number, right: number, bottom: number]
      | [point: ReadonlyPoint, size: ReadonlySize]
  ) {
    if (args.length === 0) return;
    if (args.length === 1) {
      const source = args[0];
      this.mnLeft = source.mnLeft;
      this.mnTop = source.mnTop;
      this.mnRight = source.mnRight;
      this.mnBottom = source.mnBottom;
    } else if (typeof args[0] === "number") {
      this.mnLeft = Math.trunc(args[0]);
      this.mnTop = Math.trunc(args[1] as number);
      if (args.length === 4) {
        this.mnRight = Math.trunc(args[2]);
        this.mnBottom = Math.trunc(args[3]);
      }
    } else {
      const point = args[0],
        size = args[1] as ReadonlySize;
      this.mnLeft = point.X();
      this.mnTop = point.Y();
      this.mnRight = size.Width()
        ? this.mnLeft + size.Width() + (size.Width() > 0 ? -1 : 1)
        : Rectangle.RECT_EMPTY;
      this.mnBottom = size.Height()
        ? this.mnTop + size.Height() + (size.Height() > 0 ? -1 : 1)
        : Rectangle.RECT_EMPTY;
    }
  }
  /** Original left edge. @returns Coordinate. */
  public Left(): number {
    return this.mnLeft;
  }
  /** Original top edge. @returns Coordinate. */
  public Top(): number {
    return this.mnTop;
  }
  /** Original empty-width edge aliases left. @returns Coordinate. */
  public Right(): number {
    return this.IsWidthEmpty() ? this.mnLeft : this.mnRight;
  }
  /** Original empty-height edge aliases top. @returns Coordinate. */
  public Bottom(): number {
    return this.IsHeightEmpty() ? this.mnTop : this.mnBottom;
  }
  /** Original width sentinel predicate. @returns Empty width. */
  public IsWidthEmpty(): boolean {
    return this.mnRight === Rectangle.RECT_EMPTY;
  }
  /** Original height sentinel predicate. @returns Empty height. */
  public IsHeightEmpty(): boolean {
    return this.mnBottom === Rectangle.RECT_EMPTY;
  }
  /** Original empty-axis disjunction. @returns Empty rectangle. */
  public IsEmpty(): boolean {
    return this.IsWidthEmpty() || this.IsHeightEmpty();
  }
  /** Original signed inclusive width. @returns Extent. */
  public GetWidth(): number {
    if (this.IsWidthEmpty()) return 0;
    const width = this.mnRight - this.mnLeft;
    return width < 0 ? width - 1 : width + 1;
  }
  /** Original signed inclusive height. @returns Extent. */
  public GetHeight(): number {
    if (this.IsHeightEmpty()) return 0;
    const height = this.mnBottom - this.mnTop;
    return height < 0 ? height - 1 : height + 1;
  }
  /** Original by-value top-left point. @returns Independent position. */
  public TopLeft(): Point {
    return new Point(this.mnLeft, this.mnTop);
  }
  /** Original union ignores empty operands,assigns into an empty receiver and otherwise normalizes all four raw edges. @param other - Actual rectangle. @returns Receiver,as the native template wrapper. */
  public Union(other: Rectangle): this {
    if (other.IsEmpty()) return this;
    if (this.IsEmpty()) {
      this.mnLeft = other.mnLeft;
      this.mnTop = other.mnTop;
      this.mnRight = other.mnRight;
      this.mnBottom = other.mnBottom;
    } else {
      const left = Math.min(this.mnLeft, other.mnLeft, this.mnRight, other.mnRight);
      const right = Math.max(this.mnLeft, other.mnLeft, this.mnRight, other.mnRight);
      const top = Math.min(this.mnTop, other.mnTop, this.mnBottom, other.mnBottom);
      const bottom = Math.max(this.mnTop, other.mnTop, this.mnBottom, other.mnBottom);
      this.mnLeft = left;
      this.mnRight = right;
      this.mnTop = top;
      this.mnBottom = bottom;
    }
    return this;
  }
}
