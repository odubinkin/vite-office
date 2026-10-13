/** @fileoverview Native represented SwRect values and integer edges from swrect.hxx; tools::Rectangle conversion, set arithmetic and stream APIs remain unported. */
import { Point, Size, type ReadonlyPoint, type ReadonlySize } from "../../tools/inc/gen";
/** Const-qualified native rectangle reads, preserving borrowed object identity. */
export interface ReadonlySwRect {
  Pos(): ReadonlyPoint;
  SSize(): ReadonlySize;
  Left(): number;
  Top(): number;
  Right(): number;
  Bottom(): number;
  Width(): number;
  Height(): number;
  Center(): Point;
  HasArea(): boolean;
  IsEmpty(): boolean;
  Contains(value: ReadonlyPoint | ReadonlySwRect): boolean;
  Equals(value: ReadonlySwRect): boolean;
}
/** Native rectangle owns independent Point and Size values. */
export class SwRect implements ReadonlySwRect {
  private readonly m_Point: Point;
  private readonly m_Size: Size;
  /** Creates a native numeric, value-copy, point/size or inclusive corner rectangle. @param x - Left coordinate, original rectangle or top-left point. @param y - Top coordinate, native size or lower-right point. @param width - Numeric width. @param height - Numeric height. @returns Nothing. */
  public constructor(other?: ReadonlySwRect);
  /** Creates an independent native geometry value. @param point - Native point argument. @param sizeOrCorner - Native sizeOrCorner argument. @returns Nothing. */
  public constructor(point: ReadonlyPoint, sizeOrCorner: ReadonlySize | ReadonlyPoint);
  /** Creates an independent native geometry value. @param x - Native x argument. @param y - Native y argument. @param width - Native width argument. @param height - Native height argument. @returns Nothing. */
  public constructor(x: number, y: number, width: number, height: number);
  /** Creates an independent native geometry value. @param x - Native x argument. @param y - Native y argument. @param width - Native width argument. @param height - Native height argument. @returns Nothing. */
  public constructor(
    x: number | ReadonlyPoint | ReadonlySwRect = 0,
    y: number | ReadonlyPoint | ReadonlySize = 0,
    width = 0,
    height = 0,
  ) {
    if (typeof x === "number") {
      this.m_Point = new Point(x, y as number);
      this.m_Size = new Size(width, height);
    } else if ("Left" in x) {
      this.m_Point = new Point(x.Pos());
      this.m_Size = new Size(x.SSize());
    } else {
      this.m_Point = new Point(x);
      const other = y as ReadonlyPoint | ReadonlySize;
      this.m_Size =
        "Width" in other ? new Size(other) : new Size(other.X() - x.X() + 1, other.Y() - x.Y() + 1);
    }
  }
  /** Borrows or assigns the original point by value. @param point - Original point or numeric left. @param y - Numeric top. @returns Borrowed original point. */
  public Pos(): Point;
  /** Provides the native Pos call contract. @param point - Native point argument. @returns Native getter value or no setter result. */
  public Pos(point: ReadonlyPoint): void;
  /** Provides the native Pos call contract. @param x - Native x argument. @param y - Native y argument. @returns Native getter value or no setter result. */
  public Pos(x: number, y: number): void;
  /** Provides the native Pos call contract. @param point - Native point argument. @param y - Native y argument. @returns Native getter value or no setter result. */
  public Pos(point?: ReadonlyPoint | number, y?: number): Point | void {
    if (point !== undefined) {
      this.m_Point.setX(typeof point === "number" ? point : point.X());
      this.m_Point.setY(typeof point === "number" ? (y as number) : point.Y());
      return;
    }
    return this.m_Point;
  }
  /** Borrows or assigns native size; the numeric form deliberately orders height before width. @param size - Original size or numeric height. @param width - Numeric width. @returns Borrowed original size. */
  public SSize(): ReadonlySize;
  /** Provides the native SSize call contract. @param size - Native size argument. @returns Native getter value or no setter result. */
  public SSize(size: ReadonlySize): void;
  /** Provides the native SSize call contract. @param height - Native height argument. @param width - Native width argument. @returns Native getter value or no setter result. */
  public SSize(height: number, width: number): void;
  /** Provides the native SSize call contract. @param size - Native size argument. @param width - Native width argument. @returns Native getter value or no setter result. */
  public SSize(size?: ReadonlySize | number, width?: number): ReadonlySize | void {
    if (size !== undefined) {
      this.m_Size.setWidth(typeof size === "number" ? (width as number) : size.Width());
      this.m_Size.setHeight(typeof size === "number" ? size : size.Height());
      return;
    }
    return this.m_Size;
  }
  /** Reads or writes original width. @param value - Optional native width. @returns Current width. */
  public Width(): number;
  /** Provides the native Width call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Width(value: number): void;
  /** Provides the native Width call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Width(value?: number): number | void {
    if (value !== undefined) {
      this.m_Size.setWidth(value);
      return;
    }
    return this.m_Size.Width();
  }
  /** Reads or writes original height. @param value - Optional native height. @returns Current height. */
  public Height(): number;
  /** Provides the native Height call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Height(value: number): void;
  /** Provides the native Height call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Height(value?: number): number | void {
    if (value !== undefined) {
      this.m_Size.setHeight(value);
      return;
    }
    return this.m_Size.Height();
  }
  /** Reads or shifts the left edge while retaining the far edge. @param value - Optional native left. @returns Current left. */
  public Left(): number;
  /** Provides the native Left call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Left(value: number): void;
  /** Provides the native Left call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Left(value?: number): number | void {
    if (value !== undefined) {
      this.m_Size.AdjustWidth(this.Left() - Math.trunc(value));
      this.m_Point.setX(value);
      return;
    }
    return this.m_Point.X();
  }
  /** Reads or shifts the top edge while retaining the far edge. @param value - Optional native top. @returns Current top. */
  public Top(): number;
  /** Provides the native Top call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Top(value: number): void;
  /** Provides the native Top call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Top(value?: number): number | void {
    if (value !== undefined) {
      this.m_Size.AdjustHeight(this.Top() - Math.trunc(value));
      this.m_Point.setY(value);
      return;
    }
    return this.m_Point.Y();
  }
  /** Reads or assigns the native last horizontal integer coordinate, preserving the zero-width origin fallback. @param value - Optional native right. @returns Current right. */
  public Right(): number;
  /** Provides the native Right call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Right(value: number): void;
  /** Provides the native Right call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Right(value?: number): number | void {
    if (value !== undefined) {
      this.Width(Math.trunc(value) - this.Left() + 1);
      return;
    }
    return this.Width() ? this.Left() + this.Width() - 1 : this.Left();
  }
  /** Reads or assigns the native last vertical integer coordinate, preserving the zero-height origin fallback. @param value - Optional native bottom. @returns Current bottom. */
  public Bottom(): number;
  /** Provides the native Bottom call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Bottom(value: number): void;
  /** Provides the native Bottom call contract. @param value - Native value argument. @returns Native getter value or no setter result. */
  public Bottom(value?: number): number | void {
    if (value !== undefined) {
      this.Height(Math.trunc(value) - this.Top() + 1);
      return;
    }
    return this.Height() ? this.Top() + this.Height() - 1 : this.Top();
  }
  /** Changes native point and size by value. @param point - Original point. @param size - Original size. @returns Nothing. */
  public Chg(point: ReadonlyPoint, size: ReadonlySize): void {
    this.Pos(point);
    this.SSize(size);
  }
  /** Represents native value assignment without replacing borrowed members. @param other - Original rectangle. @returns Nothing. */
  public Assign(other: ReadonlySwRect): void {
    this.Chg(other.Pos(), other.SSize());
  }
  /** Tests native value equality. @param other - Original rectangle. @returns Whether all values match. */
  public Equals(other: ReadonlySwRect): boolean {
    return (
      this.Left() === other.Left() &&
      this.Top() === other.Top() &&
      this.Width() === other.Width() &&
      this.Height() === other.Height()
    );
  }
  /** Resolves the native integer center using signed truncating division. @returns Independent native point. */
  public Center(): Point {
    return new Point(
      this.Left() + Math.trunc(this.Width() / 2),
      this.Top() + Math.trunc(this.Height() / 2),
    );
  }
  /** Retains the original nonzero predicate, including negative sizes. @returns Whether both dimensions are nonzero. */
  public HasArea(): boolean {
    return this.Height() !== 0 && this.Width() !== 0;
  }
  /** Reads native rectangle emptiness. @returns Whether a dimension is zero. */
  public IsEmpty(): boolean {
    return !this.HasArea();
  }
  /** Resets native owned point and size to their defaults. @returns Nothing. */
  public Clear(): void {
    this.Chg(new Point(), new Size());
  }
  /** Uses original integer edge predicates, including empty-origin containment. @param value - Native point or rectangle. @returns Original containment result. */
  public Contains(value: ReadonlyPoint | ReadonlySwRect): boolean {
    if ("Left" in value)
      return (
        this.Left() <= value.Left() &&
        value.Left() <= this.Right() &&
        this.Left() <= value.Right() &&
        value.Right() <= this.Right() &&
        this.Top() <= value.Top() &&
        value.Top() <= this.Bottom() &&
        this.Top() <= value.Bottom() &&
        value.Bottom() <= this.Bottom()
      );
    return (
      this.Left() <= value.X() &&
      this.Top() <= value.Y() &&
      this.Right() >= value.X() &&
      this.Bottom() >= value.Y()
    );
  }
}
