/** @fileoverview Packed source diagnostics consumed by the Sfx filter and shell. */
const ERRCODE_WARNING_MASK = 0x80000000;
const ERRCODE_ERROR_MASK = 0x3fffffff;
const ERRCODE_CLASS_SHIFT = 8;
const ERRCODE_AREA_SHIFT = 13;

/** Original numeric subsystem areas. */
export enum ErrCodeArea {
  Io = 0,
  Sfx = 2,
  Inet = 3,
  Vcl = 4,
  Svx = 8,
  So = 9,
  Sbx = 10,
  Uui = 13,
  Sc = 32,
  Sd = 40,
  Sw = 56,
}

/** Original numeric error classes. */
export enum ErrCodeClass {
  NONE = 0,
  Abort = 1,
  General = 2,
  NotExists = 3,
  AlreadyExists = 4,
  Access = 5,
  Path = 6,
  Locking = 7,
  Parameter = 8,
  Space = 9,
  NotSupported = 10,
  Read = 11,
  Write = 12,
  Unknown = 13,
  Version = 14,
  Format = 15,
  Create = 16,
  Import = 17,
  Export = 18,
  So = 20,
  Sbx = 21,
  Runtime = 22,
  Compiler = 23,
}

/** Distinguishes the source warning constructor from the error constructor. */
export enum WarningFlag {
  Yes,
}

/** Native unsigned packed value with explicit boolean and scalar projections. */
export class ErrCode {
  private readonly m_value: number;

  /** Constructs a packed diagnostic. @param value - Original raw value. @returns Constructed instance. */
  constructor(value?: number);
  /** Constructs a non-warning diagnostic. @param area - Native area. @param errorClass - Native class. @param code - Native code byte. @returns Constructed instance. */
  constructor(area: ErrCodeArea, errorClass: ErrCodeClass, code: number);
  /** Constructs a warning. @param warning - Native warning flag. @param area - Native area. @param errorClass - Native class. @param code - Native code byte. @returns Constructed instance. */
  constructor(warning: WarningFlag, area: ErrCodeArea, errorClass: ErrCodeClass, code: number);
  /** Implements the native raw and area/class/code overloads. @param value - Raw value, area or warning flag. @param areaOrClass - Native area or class. @param classOrCode - Native class or code. @param warningCode - Native warning code. @returns Constructed instance. */
  constructor(value = 0, areaOrClass?: number, classOrCode?: number, warningCode?: number) {
    this.m_value =
      (warningCode !== undefined
        ? ERRCODE_WARNING_MASK |
          ((areaOrClass as number) << ERRCODE_AREA_SHIFT) |
          ((classOrCode as number) << ERRCODE_CLASS_SHIFT) |
          warningCode
        : classOrCode !== undefined
          ? (value << ERRCODE_AREA_SHIFT) |
            ((areaOrClass as number) << ERRCODE_CLASS_SHIFT) |
            classOrCode
          : value) >>> 0;
  }

  /** Original explicit sal_uInt32 conversion. @returns Packed unsigned code. */
  valueOf(): number {
    return this.m_value;
  }

  /** Original explicit bool conversion. @returns Whether the code is nonzero. */
  IsSet(): boolean {
    return this.m_value !== 0;
  }

  /** Tests the native high warning bit. @returns Whether this code is a warning. */
  IsWarning(): boolean {
    return (this.m_value & ERRCODE_WARNING_MASK) !== 0;
  }

  /** Tests the original nonzero and non-warning predicate. @returns Whether this code is an error. */
  IsError(): boolean {
    return this.IsSet() && !this.IsWarning();
  }

  /** Returns the source no-error code for warnings and masks non-warning values. @returns Filtered packed code. */
  IgnoreWarning(): ErrCode {
    return new ErrCode(this.IsWarning() ? 0 : this.m_value & ERRCODE_ERROR_MASK);
  }

  /** Reads the native area field. @returns Source subsystem area. */
  GetArea(): ErrCodeArea {
    return (this.m_value >>> ERRCODE_AREA_SHIFT) & 0x1fff;
  }

  /** Reads the native class field. @returns Source diagnostic class. */
  GetClass(): ErrCodeClass {
    return (this.m_value >>> ERRCODE_CLASS_SHIFT) & 0x1f;
  }

  /** Reads the native low byte. @returns Source diagnostic code. */
  GetCode(): number {
    return this.m_value & 0xff;
  }
}

/** Original zero diagnostic. */
export const ERRCODE_NONE = new ErrCode();

/** Code-only ErrCodeMsg constructor used by the native CSV filter. */
export class ErrCodeMsg {
  /** Stores the source code by value through its immutable representation. @param mnCode - Source code. @returns Constructed instance. */
  constructor(private readonly mnCode = ERRCODE_NONE) {}

  /** Returns the retained packed code. @returns Source code. */
  GetCode(): ErrCode {
    return this.mnCode;
  }

  /** Original explicit bool conversion. @returns Whether a code is retained. */
  IsSet(): boolean {
    return this.mnCode.IsSet();
  }

  /** Uses the source packed warning bit. @returns Whether this is a warning. */
  IsWarning(): boolean {
    return this.mnCode.IsWarning();
  }

  /** Uses the original nonzero, non-warning predicate. @returns Whether this is an error. */
  IsError(): boolean {
    return this.mnCode.IsError();
  }

  /** Original projection that treats warnings as empty. @returns Filtered diagnostic. */
  IgnoreWarning(): ErrCodeMsg {
    return this.IsWarning() ? new ErrCodeMsg() : this;
  }
}
