/** @fileoverview Packed source diagnostics consumed by the Sfx filter and shell. */
import { OUString } from "../../sal/inc/rtl/ustring";
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

  /** Original unsigned hexadecimal diagnostic text. @returns Owned native text. */
  toHexString(): OUString {
    const result = OUString.createFromAscii(new TextEncoder().encode("0x\0")),
      number = new OUString(OUString.numberUnsigned(this.m_value, 16));
    try {
      result.append(number);
      return result;
    } finally {
      number.dispose();
    }
  }

  /** Original errcode.cxx formatter; unnamed enum values retain empty area/class views. @returns Owned native text. */
  toString(): OUString {
    const result = this.toHexString(),
      suffix = OUString.createFromAscii(
        new TextEncoder().encode(
          "(" +
            (this.IsWarning() ? "Warning" : "Error") +
            " Area:" +
            (ErrCodeArea[this.GetArea()] ?? "") +
            " Class:" +
            (ErrCodeClass[this.GetClass()] ?? "") +
            " Code:\0",
        ),
      ),
      code = new OUString(OUString.number(this.GetCode())),
      close = OUString.createFromAscii(new Uint8Array([41, 0]));
    try {
      result.append(suffix);
      result.append(code);
      result.append(close);
      return result;
    } finally {
      close.dispose();
      code.dispose();
      suffix.dispose();
    }
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

/** Original general I/O diagnostic. */
export const ERRCODE_IO_GENERAL = new ErrCode(ErrCodeArea.Io, ErrCodeClass.General, 13);

/** Original ERRCODE_IO_MISPLACEDCHAR packed diagnostic. */
export const ERRCODE_IO_MISPLACEDCHAR = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 1);
/** Original ERRCODE_IO_NOTEXISTS packed diagnostic. */
export const ERRCODE_IO_NOTEXISTS = new ErrCode(ErrCodeArea.Io, ErrCodeClass.NotExists, 2);
/** Original ERRCODE_IO_ALREADYEXISTS packed diagnostic. */
export const ERRCODE_IO_ALREADYEXISTS = new ErrCode(ErrCodeArea.Io, ErrCodeClass.AlreadyExists, 3);
/** Original ERRCODE_IO_NOTADIRECTORY packed diagnostic. */
export const ERRCODE_IO_NOTADIRECTORY = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 4);
/** Original ERRCODE_IO_NOTAFILE packed diagnostic. */
export const ERRCODE_IO_NOTAFILE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 5);
/** Original ERRCODE_IO_INVALIDDEVICE packed diagnostic. */
export const ERRCODE_IO_INVALIDDEVICE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Path, 6);
/** Original ERRCODE_IO_ACCESSDENIED packed diagnostic. */
export const ERRCODE_IO_ACCESSDENIED = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Access, 7);
/** Original ERRCODE_IO_LOCKVIOLATION packed diagnostic. */
export const ERRCODE_IO_LOCKVIOLATION = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Locking, 8);
/** Original ERRCODE_IO_OUTOFSPACE packed diagnostic. */
export const ERRCODE_IO_OUTOFSPACE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Space, 9);
/** Original ERRCODE_IO_ISWILDCARD packed diagnostic. */
export const ERRCODE_IO_ISWILDCARD = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 11);
/** Original ERRCODE_IO_NOTSUPPORTED packed diagnostic. */
export const ERRCODE_IO_NOTSUPPORTED = new ErrCode(ErrCodeArea.Io, ErrCodeClass.NotSupported, 12);
/** Original ERRCODE_IO_TOOMANYOPENFILES packed diagnostic. */
export const ERRCODE_IO_TOOMANYOPENFILES = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Space, 14);
/** Original ERRCODE_IO_CANTREAD packed diagnostic. */
export const ERRCODE_IO_CANTREAD = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Read, 15);
/** Original ERRCODE_IO_CANTWRITE packed diagnostic. */
export const ERRCODE_IO_CANTWRITE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Write, 16);
/** Original ERRCODE_IO_OUTOFMEMORY packed diagnostic. */
export const ERRCODE_IO_OUTOFMEMORY = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Space, 17);
/** Original ERRCODE_IO_CANTSEEK packed diagnostic. */
export const ERRCODE_IO_CANTSEEK = new ErrCode(ErrCodeArea.Io, ErrCodeClass.General, 18);
/** Original ERRCODE_IO_CANTTELL packed diagnostic. */
export const ERRCODE_IO_CANTTELL = new ErrCode(ErrCodeArea.Io, ErrCodeClass.General, 19);
/** Original ERRCODE_IO_WRONGVERSION packed diagnostic. */
export const ERRCODE_IO_WRONGVERSION = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Version, 20);
/** Original ERRCODE_IO_WRONGFORMAT packed diagnostic. */
export const ERRCODE_IO_WRONGFORMAT = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Format, 21);
/** Original ERRCODE_IO_INVALIDCHAR packed diagnostic. */
export const ERRCODE_IO_INVALIDCHAR = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 22);
/** Original ERRCODE_IO_UNKNOWN packed diagnostic. */
export const ERRCODE_IO_UNKNOWN = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Unknown, 23);
/** Original ERRCODE_IO_INVALIDACCESS packed diagnostic. */
export const ERRCODE_IO_INVALIDACCESS = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Access, 24);
/** Original ERRCODE_IO_CANTCREATE packed diagnostic. */
export const ERRCODE_IO_CANTCREATE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Create, 25);
/** Original ERRCODE_IO_INVALIDPARAMETER packed diagnostic. */
export const ERRCODE_IO_INVALIDPARAMETER = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 26);
/** Original ERRCODE_IO_ABORT packed diagnostic. */
export const ERRCODE_IO_ABORT = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Abort, 27);
/** Original ERRCODE_IO_NOTEXISTSPATH packed diagnostic. */
export const ERRCODE_IO_NOTEXISTSPATH = new ErrCode(ErrCodeArea.Io, ErrCodeClass.NotExists, 28);
/** Original ERRCODE_IO_PENDING packed diagnostic. */
export const ERRCODE_IO_PENDING = new ErrCode(ErrCodeArea.Io, ErrCodeClass.NotExists, 29);
/** Original ERRCODE_IO_RECURSIVE packed diagnostic. */
export const ERRCODE_IO_RECURSIVE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 30);
/** Original ERRCODE_IO_NAMETOOLONG packed diagnostic. */
export const ERRCODE_IO_NAMETOOLONG = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 31);
/** Original ERRCODE_IO_INVALIDLENGTH packed diagnostic. */
export const ERRCODE_IO_INVALIDLENGTH = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 32);
/** Original ERRCODE_IO_CURRENTDIR packed diagnostic. */
export const ERRCODE_IO_CURRENTDIR = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 33);
/** Original ERRCODE_IO_NOTSAMEDEVICE packed diagnostic. */
export const ERRCODE_IO_NOTSAMEDEVICE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Parameter, 34);
/** Original ERRCODE_IO_DEVICENOTREADY packed diagnostic. */
export const ERRCODE_IO_DEVICENOTREADY = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Read, 35);
/** Original ERRCODE_IO_BADCRC packed diagnostic. */
export const ERRCODE_IO_BADCRC = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Read, 36);
/** Original ERRCODE_IO_WRITEPROTECTED packed diagnostic. */
export const ERRCODE_IO_WRITEPROTECTED = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Access, 37);
/** Original ERRCODE_IO_BROKENPACKAGE packed diagnostic. */
export const ERRCODE_IO_BROKENPACKAGE = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Format, 38);
/** Original ERRCODE_IO_NOTSTORABLEINBINARYFORMAT packed diagnostic. */
export const ERRCODE_IO_NOTSTORABLEINBINARYFORMAT = new ErrCode(
  ErrCodeArea.Io,
  ErrCodeClass.Format,
  39,
);
/** Original ERRCODE_IO_FILTERDISABLED packed diagnostic. */
export const ERRCODE_IO_FILTERDISABLED = new ErrCode(ErrCodeArea.Io, ErrCodeClass.Format, 40);
/** Original SVSTREAM_GENERALERROR macro alias. */
export const SVSTREAM_GENERALERROR = ERRCODE_IO_GENERAL;
/** Original SVSTREAM_FILE_NOT_FOUND macro alias. */
export const SVSTREAM_FILE_NOT_FOUND = ERRCODE_IO_NOTEXISTS;
/** Original SVSTREAM_PATH_NOT_FOUND macro alias. */
export const SVSTREAM_PATH_NOT_FOUND = ERRCODE_IO_NOTEXISTSPATH;
/** Original SVSTREAM_TOO_MANY_OPEN_FILES macro alias. */
export const SVSTREAM_TOO_MANY_OPEN_FILES = ERRCODE_IO_TOOMANYOPENFILES;
/** Original SVSTREAM_ACCESS_DENIED macro alias. */
export const SVSTREAM_ACCESS_DENIED = ERRCODE_IO_ACCESSDENIED;
/** Original SVSTREAM_SHARING_VIOLATION macro alias. */
export const SVSTREAM_SHARING_VIOLATION = ERRCODE_IO_LOCKVIOLATION;
/** Original SVSTREAM_LOCKING_VIOLATION macro alias. */
export const SVSTREAM_LOCKING_VIOLATION = ERRCODE_IO_LOCKVIOLATION;
/** Original SVSTREAM_SHARE_BUFF_EXCEEDED macro alias. */
export const SVSTREAM_SHARE_BUFF_EXCEEDED = ERRCODE_IO_LOCKVIOLATION;
/** Original SVSTREAM_INVALID_ACCESS macro alias. */
export const SVSTREAM_INVALID_ACCESS = ERRCODE_IO_INVALIDACCESS;
/** Original SVSTREAM_INVALID_HANDLE macro alias. */
export const SVSTREAM_INVALID_HANDLE = ERRCODE_IO_GENERAL;
/** Original SVSTREAM_CANNOT_MAKE macro alias. */
export const SVSTREAM_CANNOT_MAKE = ERRCODE_IO_CANTCREATE;
/** Original SVSTREAM_INVALID_PARAMETER macro alias. */
export const SVSTREAM_INVALID_PARAMETER = ERRCODE_IO_INVALIDPARAMETER;
/** Original SVSTREAM_READ_ERROR macro alias. */
export const SVSTREAM_READ_ERROR = ERRCODE_IO_CANTREAD;
/** Original SVSTREAM_WRITE_ERROR macro alias. */
export const SVSTREAM_WRITE_ERROR = ERRCODE_IO_CANTWRITE;
/** Original SVSTREAM_SEEK_ERROR macro alias. */
export const SVSTREAM_SEEK_ERROR = ERRCODE_IO_CANTSEEK;
/** Original SVSTREAM_OUTOFMEMORY macro alias. */
export const SVSTREAM_OUTOFMEMORY = ERRCODE_IO_OUTOFMEMORY;
/** Original SVSTREAM_FILEFORMAT_ERROR macro alias. */
export const SVSTREAM_FILEFORMAT_ERROR = ERRCODE_IO_WRONGFORMAT;
/** Original SVSTREAM_WRONGVERSION macro alias. */
export const SVSTREAM_WRONGVERSION = ERRCODE_IO_WRONGVERSION;
/** Original SVSTREAM_DISK_FULL macro alias. */
export const SVSTREAM_DISK_FULL = ERRCODE_IO_OUTOFSPACE;

/** Code-only ErrCodeMsg constructor used by the native CSV filter. */
export class ErrCodeMsg {
  /** Stores the source code by value through its immutable representation. @param mnCode - Source code. @returns Constructed instance. */
  constructor(private readonly mnCode = ERRCODE_NONE) {}

  /** Original formatter for the supported code-only constructor with source-default empty argument members, without LIBO_ERRMSG_USE_SOURCE_LOCATION. @returns Owned native text. */
  toString(): OUString {
    return this.mnCode.toString();
  }

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
