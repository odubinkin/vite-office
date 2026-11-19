/** @fileoverview Original DirectoryHelper splitAtLastToken over a borrowed UTF16 string_view and an actual OUString output owner; original existence/scan/recursive-delete owners; moveDirContent remains unbound. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Set as OrderedSet, type SetValue } from "../../../external/libcxx/set";
import { File, Directory, DirectoryItem, FileStatus } from "../../../sal/inc/osl/file.hxx";
import {
  oslFileError as E,
  osl_File_OpenFlag_Read,
  osl_FileStatus_Mask_Type,
  osl_FileStatus_Mask_FileName,
} from "../../../sal/inc/osl/file";
import { Uri } from "../../../sal/inc/rtl/uri";
import { rtl_UriCharClass, rtl_UriEncodeMechanism } from "../../../sal/inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { rtl_uString_newFromStr_WithLength } from "../../../sal/inc/rtl/ustring.h";
/** Original reverse token search, including unchanged output at leading/trailing token boundaries. Returned units borrow source storage; callers retain its owner. @param source - Native nonowning UTF16 view. @param token - Original sal_Unicode unit. @param right - Existing native output string. @returns Borrowed left view, possibly empty. */
export function splitAtLastToken(source: Uint16Array, token: number, right: OUString): Uint16Array {
  const index = source.lastIndexOf(token);
  let result = source.subarray(0, 0);
  if (index === -1) {
    result = source;
    right.clear();
  } else if (index > 0) {
    result = source.subarray(0, index);
    if (source.length > index + 1) {
      const suffix = source.subarray(index + 1);
      rtl_uString_newFromStr_WithLength(right.getDataAddress(), suffix, suffix.length);
    }
  }
  return result;
}

/** Actual ordered UTF16 set specialization used by the source directory helper. */
export const DirectoryNames = class extends OrderedSet<OUString> {
  /** Original default std::set<OUString> construction. @returns Empty string set. */
  constructor() {
    super(stringValues);
  }
};
/** Original std::pair<OUString,OUString> basename and extension value. */
export type DirectoryFileName = readonly [OUString, OUString];
/** Actual lexicographic pair set specialization used by the source helper. */
export const DirectoryFiles = class extends OrderedSet<DirectoryFileName> {
  /** Original default std::set<std::pair<OUString,OUString>> construction. @returns Empty pair set. */
  constructor() {
    super(fileValues);
  }
};
const stringValues: SetValue<OUString> = {
  /** Original UTF16 comparator. @param left - First value. @param right - Second value. @returns Source comparison. */
  compare(left, right) {
    return left.compareTo(right);
  },
  /** Original value copy. @param value - Borrowed value. @returns Acquired copy. */
  copy(value) {
    return new OUString(value);
  },
  /** Original value destruction. @param value - Stored owner. @returns Nothing. */
  destroy(value) {
    value.dispose();
  },
};
const fileValues: SetValue<DirectoryFileName> = {
  /** Original pair lexicographic comparator. @param left - First pair. @param right - Second pair. @returns Source comparison. */
  compare(left, right) {
    return left[0].compareTo(right[0]) || left[1].compareTo(right[1]);
  },
  /** Original pair value copy. @param value - Borrowed pair. @returns Acquired pair. */
  copy(value) {
    return [new OUString(value[0]), new OUString(value[1])];
  },
  /** Original pair destruction. @param value - Stored pair. @returns Nothing. */
  destroy(value) {
    value[1].dispose();
    value[0].dispose();
  },
};
/** Original read-open existence check, including directory and permission behavior of the actual File owner. @param url - Source URL. @returns Whether File::open(Read) succeeds. */
export function fileExists(url: OUStringConstReference): boolean {
  if (url.isEmpty()) return false;
  const file = new File(url);
  try {
    return file.open(osl_File_OpenFlag_Read) === E.None;
  } finally {
    file.dispose();
  }
}
/** Original open-based directory existence check. @param url - Source URL. @returns Whether Directory::open succeeds. */
export function dirExists(url: OUStringConstReference): boolean {
  if (url.isEmpty()) return false;
  const directory = new Directory(url);
  try {
    return directory.open() === E.None;
  } finally {
    directory.dispose();
  }
}
/** Original IgnoreEscapes/UricNoSlash/UTF8 segment encoding. @param name - Borrowed filesystem name. @returns Owned encoded segment. */
function encodeUriSegment(name: OUStringConstReference): OUString {
  return Uri.encode(
    name,
    rtl_UriCharClass.rtl_UriCharClassUricNoSlash,
    rtl_UriEncodeMechanism.rtl_UriEncodeIgnoreEscapes,
    RTL_TEXTENCODING_UTF8,
  );
}
/** Original immediate-child scan: accumulates sorted value sets, ignores open/status failures and non-regular/non-directory entries. @param url - Source directory URL. @param directories - Existing encoded directory-name set. @param files - Existing encoded basename/extension pair set. @returns Nothing. */
export function scanDirsAndFiles(
  url: OUStringConstReference,
  directories: OrderedSet<OUString>,
  files: OrderedSet<DirectoryFileName>,
): void {
  if (url.isEmpty()) return;
  const directory = new Directory(url),
    item = new DirectoryItem();
  try {
    if (directory.open() !== E.None) return;
    while (directory.getNextItem(item) === E.None) {
      const status = new FileStatus(osl_FileStatus_Mask_Type | osl_FileStatus_Mask_FileName);
      try {
        if (item.getFileStatus(status) !== E.None) continue;
        if (status.isDirectory()) {
          const name = status.getFileName();
          try {
            if (!name.isEmpty()) {
              const encoded = encodeUriSegment(name);
              try {
                directories.insert(encoded);
              } finally {
                encoded.dispose();
              }
            }
          } finally {
            name.dispose();
          }
        } else if (status.isRegular()) {
          const name = status.getFileName(),
            extension = new OUString();
          try {
            const left = splitAtLastToken(
              name.getStr().subarray(0, name.getLength()),
              46,
              extension,
            );
            const basename = new OUString(left, left.length);
            try {
              name.assign(basename);
              if (!name.isEmpty()) {
                const encodedName = encodeUriSegment(name),
                  encodedExtension = encodeUriSegment(extension);
                try {
                  files.insert([encodedName, encodedExtension]);
                } finally {
                  encodedExtension.dispose();
                  encodedName.dispose();
                }
              }
            } finally {
              basename.dispose();
            }
          } finally {
            extension.dispose();
            name.dispose();
          }
        }
      } finally {
        status.dispose();
      }
    }
  } finally {
    item.dispose();
    directory.dispose();
  }
}
/** Original path concatenation, without normalizing encoded segments. @param base - Directory URL. @param name - Encoded child name. @returns Owned child URL. */
function childURL(base: OUStringConstReference, name: OUStringConstReference): OUString {
  const result = new OUString(base);
  result.append(Uint16Array.of(47));
  result.append(name);
  return result;
}
/** Original recursive removal; true means at least one error, and later siblings are still attempted. @param url - Source directory URL. @returns Accumulated source error flag. */
export function deleteDirRecursively(url: OUStringConstReference): boolean {
  const directories = new DirectoryNames(),
    files = new DirectoryFiles();
  let error = false;
  try {
    scanDirsAndFiles(url, directories, files);
    for (const name of directories) {
      const path = childURL(url, name);
      try {
        error = deleteDirRecursively(path) || error;
      } finally {
        path.dispose();
      }
    }
    for (const [name, extension] of files) {
      const path = childURL(url, name);
      try {
        if (!extension.isEmpty()) {
          path.append(Uint16Array.of(46));
          path.append(extension);
        }
        error = File.remove(path) !== E.None || error;
      } finally {
        path.dispose();
      }
    }
    error = Directory.remove(url) !== E.None || error;
    return error;
  } finally {
    files.dispose();
    directories.dispose();
  }
}
