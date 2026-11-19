/** @fileoverview Original TempFileNamed parent/file/directory path, name loop and lifetime plus public temporary-name/base-directory functions. Sequential constructor specializations remain unbound; original UNIX TempFileFast now owns the real file stream; no memory substitute except the original empty-name fallback. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  FileBase,
  File,
  Directory,
  DirectoryItem,
  FileStatus,
} from "../../../sal/inc/osl/file.hxx";
import * as osl from "../../../sal/inc/osl/file";
import { osl_File_OpenFlag_Private } from "../../../sal/inc/osl/detail/file";
import { SvStream, SvFileStream, SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import { UniqueTokens } from "../../inc/tempfile";
import { deleteDirRecursively } from "../../../comphelper/source/misc/directoryhelper";
import { getpid } from "../../../external/emscripten/file";
import { Guid } from "../../../tools/inc/Guid";
const gTempNameBase_Impl = new OUString();
let eyeCatcher: OUString | undefined;
/** Original lazy, unnamed temporary-file owner for the selected UNIX platform. */
export class TempFileFast {
  private mxStream: SvFileStream | null = null;
  /** Original move constructor transfers the unique stream without closing it. @param other - Actual rvalue source. @returns Moved owner. */
  static move(other: TempFileFast): TempFileFast {
    const result = new TempFileFast();
    result.mxStream = other.mxStream;
    other.mxStream = null;
    return result;
  }
  /** Original destructor closes its owned stream. @returns Nothing. */
  dispose(): void {
    this.CloseStream();
  }
  /** Original one-time stream creation; subsequent mode arguments do not reopen it. @param mode - Original stream mode. @returns Borrowed real file stream. */
  GetStream(mode: StreamMode): SvStream {
    if (!this.mxStream) {
      const name = CreateTempNameFast();
      try {
        this.mxStream = new SvFileStream(name, mode | StreamMode.TEMPORARY);
      } finally {
        name.dispose();
      }
    }
    return this.mxStream;
  }
  /** Original UNIX close-before-path-conversion/removal order; failure is not replaced by another storage. @returns Nothing. */
  CloseStream(): void {
    if (this.mxStream) {
      const name = new OUString(this.mxStream.GetFileName()),
        previous = this.mxStream;
      this.mxStream = null;
      try {
        previous.dispose();
        if (!name.isEmpty() && FileBase.getFileURLFromSystemPath(name, name) === FileBase.E_None)
          File.remove(name);
      } finally {
        name.dispose();
      }
    }
  }
}
/** Original name construction performs no exclusive reservation or sequential-token fallback. @returns Owned temporary name. */
function CreateTempNameFast(): OUString {
  const name = new OUString(getTempNameBase_Impl());
  try {
    name.append(getEyeCatcher());
    const guid = new Guid(Guid.Generate),
      value = guid.getOUString(),
      extension = literal(".tmp");
    try {
      name.append(value);
      name.append(extension);
      return name;
    } finally {
      extension.dispose();
      value.dispose();
    }
  } catch (error) {
    name.dispose();
    throw error;
  }
}
/** Original string literal binding. @param text - ASCII literal. @returns Original owned value. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Original source literal or initialized-value address binding. @param c - Actual declared argument. @returns Original result or test completion. */ (
        c,
      ) => c.charCodeAt(0),
    ),
  );
}
/** Original trailing separator helper retains an owned value. @param url - Original URL. @returns Owned URL. */
function ensureTrailingSlash(url: OUStringConstReference): OUString {
  const result = new OUString(url);
  if (!url.isEmpty() && !url.endsWith(Uint16Array.of(47))) result.append(Uint16Array.of(47));
  return result;
}
/** Original lazy temp-base initialization and ignored createPath result. @returns Borrowed global URL. */
function getTempNameBase_Impl(): OUString {
  if (gTempNameBase_Impl.isEmpty()) {
    const url = new OUString();
    try {
      if (File.getTempDirURL(url) === FileBase.E_None) {
        const value = ensureTrailingSlash(url);
        try {
          gTempNameBase_Impl.assign(value);
        } finally {
          value.dispose();
        }
        Directory.createPath(gTempNameBase_Impl);
      }
    } finally {
      url.dispose();
    }
  }
  if (!gTempNameBase_Impl.isEmpty() && !gTempNameBase_Impl.endsWith(Uint16Array.of(47)))
    throw new Error("assert(gTempNameBase_Impl.endsWith('/'))");
  return gTempNameBase_Impl;
}
/** Original parent validation for the false-create-parent specialization, including default fallback and ignored createPath status. @param parent - Borrowed optional parent URL. @returns Owned base with separator. */
function ConstructTempDir_Impl(parent: OUStringConstReference | null): OUString {
  const name = new OUString();
  try {
    if (parent !== null && !parent.isEmpty()) {
      const path = new OUString();
      try {
        if (
          FileBase.getSystemPathFromFileURL(parent, path) === FileBase.E_None &&
          FileBase.getFileURLFromSystemPath(path, path) === FileBase.E_None
        ) {
          const item = new DirectoryItem();
          const length = path.getLength() - (path.getStr()[path.getLength() - 1] === 47 ? 1 : 0);
          const lookup = path.copy(0, length);
          try {
            if (DirectoryItem.get(lookup, item) === FileBase.E_None) name.assign(path);
          } finally {
            lookup.dispose();
            item.dispose();
          }
        }
      } finally {
        path.dispose();
      }
    }
    if (name.isEmpty()) {
      name.assign(getTempNameBase_Impl());
      Directory.createPath(name);
    }
    return ensureTrailingSlash(name);
  } finally {
    name.dispose();
  }
}
/** Original selected non-DBG_UTIL UNIX eye catcher uses actual SDK getpid. @returns Borrowed cached value. */
function getEyeCatcher(): OUString {
  if (!eyeCatcher) {
    eyeCatcher = literal("lu");
    const pid = new OUString(OUString.number(getpid()));
    try {
      eyeCatcher.append(pid);
    } finally {
      pid.dispose();
    }
  }
  return eyeCatcher;
}
/** Original UniqueTokens specialization of lcl_createName with default extension and false lock/create-parent flags. @param parent - Optional parent URL. @param keep - Keep the created file/directory. @param directory - Create a directory rather than a file. @returns Created URL or original empty failure. */
function CreateTempName_Impl(
  parent: OUStringConstReference | null,
  keep: boolean,
  directory = true,
): OUString {
  const tokens = new UniqueTokens(),
    leading = getEyeCatcher(),
    base = ConstructTempDir_Impl(parent),
    token = new OUString();
  try {
    while (tokens.next(token)) {
      const name = new OUString(base),
        filePart = new OUString(leading);
      try {
        filePart.append(token);
        name.append(filePart);
        const extension = literal(".tmp");
        try {
          name.append(extension);
        } finally {
          extension.dispose();
        }
        if (directory) {
          const result = Directory.create(
            name,
            osl.osl_File_OpenFlag_Read | osl.osl_File_OpenFlag_Write | osl_File_OpenFlag_Private,
          );
          if (result === FileBase.E_None) {
            if (keep || Directory.remove(name) === FileBase.E_None) return new OUString(name);
            return new OUString();
          }
          if (result !== FileBase.E_EXIST) return new OUString();
          continue;
        }
        const file = new File(name);
        let result: osl.oslFileError;
        try {
          result = file.open(
            osl.osl_File_OpenFlag_Create | osl_File_OpenFlag_Private | osl.osl_File_OpenFlag_NoLock,
          );
          if (result === FileBase.E_None) {
            file.close();
            return new OUString(name);
          }
        } finally {
          file.dispose();
        }
        if (result !== FileBase.E_EXIST) {
          const item = new DirectoryItem(),
            status = new FileStatus(osl.osl_FileStatus_Mask_Type);
          try {
            if (
              DirectoryItem.get(name, item) !== FileBase.E_None ||
              item.getFileStatus(status) !== FileBase.E_None ||
              status.getFileType() !== FileStatus.Directory
            )
              return new OUString();
          } finally {
            status.dispose();
            item.dispose();
          }
        }
      } finally {
        filePart.dispose();
        name.dispose();
      }
    }
    return new OUString();
  } finally {
    token.dispose();
    base.dispose();
  }
}
/** Original parent/file/directory constructor specialization, stream and deletion lifetime. */
export class TempFileNamed {
  private readonly aName: OUString;
  /** Original first constructor defaults parent=null and directory=false. @param parent - Optional parent URL. @param bIsDirectory - Original default false. @returns Named temporary owner. */
  constructor(
    parent: OUStringConstReference | null = null,
    private readonly bIsDirectory = false,
  ) {
    this.aName = CreateTempName_Impl(parent, true, bIsDirectory);
  }
  private pStream: SvStream | null = null;
  private bKillingFileEnabled = false;
  /** Original destructor closes before deletion only when enabled, then destroys remaining stream/member. @returns Nothing. */
  dispose(): void {
    if (this.bKillingFileEnabled) {
      this.CloseStream();
      if (this.bIsDirectory) deleteDirRecursively(this.aName);
      else File.remove(this.aName);
    }
    this.CloseStream();
    this.aName.dispose();
  }
  /** Original name validity query. @returns Whether the URL is nonempty. */
  IsValid(): boolean {
    return !this.aName.isEmpty();
  }
  /** Original ignored conversion status and by-value system path. @returns Owned filename. */
  GetFileName(): OUString {
    const result = new OUString();
    FileBase.getSystemPathFromFileURL(this.aName, result);
    return result;
  }
  /** Original URL access flushes the owned stream for separate-handle readers. @returns Borrowed original URL. */
  GetURL(): OUStringConstReference {
    this.pStream?.Flush();
    return this.aName;
  }
  /** Original lazy first-mode-only open; empty name uses the source SvMemoryStream fallback. @param mode - Original mode. @returns Borrowed actual stream. */
  GetStream(mode: StreamMode): SvStream {
    if (!this.pStream)
      this.pStream = !this.aName.isEmpty()
        ? new SvFileStream(this.aName, mode | StreamMode.TEMPORARY)
        : new SvMemoryStream();
    return this.pStream;
  }
  /** Original optional stream reset. @returns Nothing. */
  CloseStream(): void {
    this.pStream?.dispose();
    this.pStream = null;
  }
  /** Original defaulted deletion flag assignment. @param enabled - Original default true. @returns Nothing. */
  EnableKillingFile(enabled = true): void {
    this.bKillingFileEnabled = enabled;
  }
}

/** Original temporary system-path name reserves and immediately removes a directory. @returns Owned system path, with no retained entry. */
export function CreateTempName(): OUString {
  const name = CreateTempName_Impl(null, false),
    result = new OUString();
  try {
    if (!name.isEmpty()) FileBase.getSystemPathFromFileURL(name, result);
    return result;
  } finally {
    name.dispose();
  }
}
/** Original UniqueTokens URL creation overload. @param parent - Optional parent URL. @param directory - Original default false. @returns Owned kept file/directory URL. */
export function CreateTempURL(
  parent: OUStringConstReference | null = null,
  directory = false,
): OUString {
  return CreateTempName_Impl(parent, true, directory);
}
/** Original base-directory setter creates a private child, retains the original fallback on child failure and returns the actual system path. @param base - Requested base URL. @returns Owned system path, or empty on createPath failure. */
export function SetTempNameBaseDirectory(base: OUStringConstReference): OUString {
  if (base.isEmpty()) return new OUString();
  const path = new OUString(base);
  try {
    if (path.endsWith(Uint16Array.of(47))) {
      const value = path.copy(0, path.getLength() - 1);
      try {
        path.assign(value);
      } finally {
        value.dispose();
      }
    }
    const result = Directory.createPath(path),
      output = new OUString();
    if (result === FileBase.E_None || result === FileBase.E_EXIST) {
      const withSlash = ensureTrailingSlash(base);
      try {
        gTempNameBase_Impl.assign(withSlash);
      } finally {
        withSlash.dispose();
      }
      const privateBase = new TempFileNamed(null, true);
      try {
        if (privateBase.IsValid()) {
          const value = ensureTrailingSlash(privateBase.GetURL());
          try {
            gTempNameBase_Impl.assign(value);
          } finally {
            value.dispose();
          }
        }
        FileBase.getSystemPathFromFileURL(gTempNameBase_Impl, output);
      } finally {
        privateBase.dispose();
      }
    }
    return output;
  } finally {
    path.dispose();
  }
}
/** Original getter revalidates default-base creation and preserves the trailing separator. @returns Owned base URL. */
export function GetTempNameBaseDirectory(): OUString {
  return ConstructTempDir_Impl(null);
}
