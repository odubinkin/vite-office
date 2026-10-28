/** @fileoverview Native INetURLObject scheme metadata and sorted prefix recognition. */
import { INetProtocol } from "../../inc/urlobj";
import { toAsciiLowerCase } from "../../../sal/inc/rtl/character";
import type { UriCursor } from "./urlobj";
/** Original SchemeInfo flags controlling authority, path and query production. */
export interface SchemeInfo {
  /** Original m_sScheme field. */
  readonly m_sScheme: string;
  /** Original m_aPrefix field. */
  readonly m_aPrefix: string;
  /** Original m_bAuthority field. */
  readonly m_bAuthority: boolean;
  /** Original m_bUser field. */
  readonly m_bUser: boolean;
  /** Original m_bAuth field. */
  readonly m_bAuth: boolean;
  /** Original m_bPassword field. */
  readonly m_bPassword: boolean;
  /** Original m_bHost field. */
  readonly m_bHost: boolean;
  /** Original m_bPort field. */
  readonly m_bPort: boolean;
  /** Original m_bHierarchical field. */
  readonly m_bHierarchical: boolean;
  /** Original m_bQuery field. */
  readonly m_bQuery: boolean;
}
/** Exact native enumarray order. */
const schemes: readonly SchemeInfo[] = [
  {
    m_sScheme: "",
    m_aPrefix: "",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "ftp",
    m_aPrefix: "ftp://",
    m_bAuthority: true,
    m_bUser: true,
    m_bAuth: false,
    m_bPassword: true,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: "http",
    m_aPrefix: "http://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "file",
    m_aPrefix: "file://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: "mailto",
    m_aPrefix: "mailto:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "vnd.sun.star.webdav",
    m_aPrefix: "vnd.sun.star.webdav://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "private",
    m_aPrefix: "private:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "vnd.sun.star.help",
    m_aPrefix: "vnd.sun.star.help://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "https",
    m_aPrefix: "https://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "slot",
    m_aPrefix: "slot:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "macro",
    m_aPrefix: "macro:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "javascript",
    m_aPrefix: "javascript:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "data",
    m_aPrefix: "data:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "cid",
    m_aPrefix: "cid:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "vnd.sun.star.hier",
    m_aPrefix: "vnd.sun.star.hier:",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: ".uno",
    m_aPrefix: ".uno:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: ".component",
    m_aPrefix: ".component:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "vnd.sun.star.pkg",
    m_aPrefix: "vnd.sun.star.pkg://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "ldap",
    m_aPrefix: "ldap://",
    m_bAuthority: true,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "db",
    m_aPrefix: "db:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "vnd.sun.star.cmd",
    m_aPrefix: "vnd.sun.star.cmd:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "telnet",
    m_aPrefix: "telnet://",
    m_bAuthority: true,
    m_bUser: true,
    m_bAuth: false,
    m_bPassword: true,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: "vnd.sun.star.expand",
    m_aPrefix: "vnd.sun.star.expand:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: false,
  },
  {
    m_sScheme: "vnd.sun.star.tdoc",
    m_aPrefix: "vnd.sun.star.tdoc:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: "",
    m_aPrefix: "",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: false,
  },
  {
    m_sScheme: "smb",
    m_aPrefix: "smb://",
    m_bAuthority: true,
    m_bUser: true,
    m_bAuth: false,
    m_bPassword: true,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "hid",
    m_aPrefix: "hid:",
    m_bAuthority: false,
    m_bUser: false,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: false,
    m_bPort: false,
    m_bHierarchical: false,
    m_bQuery: true,
  },
  {
    m_sScheme: "sftp",
    m_aPrefix: "sftp://",
    m_bAuthority: true,
    m_bUser: true,
    m_bAuth: false,
    m_bPassword: true,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: true,
  },
  {
    m_sScheme: "vnd.libreoffice.cmis",
    m_aPrefix: "vnd.libreoffice.cmis://",
    m_bAuthority: true,
    m_bUser: true,
    m_bAuth: false,
    m_bPassword: false,
    m_bHost: true,
    m_bPort: false,
    m_bHierarchical: true,
    m_bQuery: true,
  },
];
/** Original enumarray lookup over initialized protocol values. @param protocol - Original enum index. @returns Native scheme metadata. */
export function getSchemeInfo(protocol: INetProtocol): SchemeInfo {
  const info = schemes[protocol];
  if (info === undefined) throw new Error("Invalid native INetProtocol index");
  return info;
}
/** Original kind ordering controls external-prefix translation. */
export enum PrefixKind {
  Official,
  Internal,
  External,
}
/** Original recognized-prefix record. */
export interface PrefixInfo {
  /** Original source prefix. */ readonly m_aPrefix: string;
  /** Original translated prefix. */ readonly m_aTranslatedPrefix: string;
  /** Original protocol. */ readonly m_eScheme: INetProtocol;
  /** Original prefix kind. */ readonly m_eKind: PrefixKind;
}
/** Sorted source table, including the dummy initial entry used by the narrowing algorithm. */
const prefixes: readonly PrefixInfo[] = [
  {
    m_aPrefix: "",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.NotValid,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: ".component:",
    m_aTranslatedPrefix: "staroffice.component:",
    m_eScheme: INetProtocol.Component,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: ".uno:",
    m_aTranslatedPrefix: "staroffice.uno:",
    m_eScheme: INetProtocol.Uno,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "cid:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Cid,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "data:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Data,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "db:",
    m_aTranslatedPrefix: "staroffice.db:",
    m_eScheme: INetProtocol.Db,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "file:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.File,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "ftp:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Ftp,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "hid:",
    m_aTranslatedPrefix: "staroffice.hid:",
    m_eScheme: INetProtocol.Hid,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "http:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Http,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "https:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Https,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "javascript:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Javascript,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "ldap:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Ldap,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "macro:",
    m_aTranslatedPrefix: "staroffice.macro:",
    m_eScheme: INetProtocol.Macro,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "mailto:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Mailto,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "private:",
    m_aTranslatedPrefix: "staroffice.private:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "private:factory/",
    m_aTranslatedPrefix: "staroffice.factory:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "private:helpid/",
    m_aTranslatedPrefix: "staroffice.helpid:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "private:java/",
    m_aTranslatedPrefix: "staroffice.java:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "private:searchfolder:",
    m_aTranslatedPrefix: "staroffice.searchfolder:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "private:trashcan:",
    m_aTranslatedPrefix: "staroffice.trashcan:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "sftp:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Sftp,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "slot:",
    m_aTranslatedPrefix: "staroffice.slot:",
    m_eScheme: INetProtocol.Slot,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "smb:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Smb,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "staroffice.component:",
    m_aTranslatedPrefix: ".component:",
    m_eScheme: INetProtocol.Component,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.db:",
    m_aTranslatedPrefix: "db:",
    m_eScheme: INetProtocol.Db,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.factory:",
    m_aTranslatedPrefix: "private:factory/",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.helpid:",
    m_aTranslatedPrefix: "private:helpid/",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.hid:",
    m_aTranslatedPrefix: "hid:",
    m_eScheme: INetProtocol.Hid,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.java:",
    m_aTranslatedPrefix: "private:java/",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.macro:",
    m_aTranslatedPrefix: "macro:",
    m_eScheme: INetProtocol.Macro,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.private:",
    m_aTranslatedPrefix: "private:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.searchfolder:",
    m_aTranslatedPrefix: "private:searchfolder:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.slot:",
    m_aTranslatedPrefix: "slot:",
    m_eScheme: INetProtocol.Slot,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.trashcan:",
    m_aTranslatedPrefix: "private:trashcan:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice.uno:",
    m_aTranslatedPrefix: ".uno:",
    m_eScheme: INetProtocol.Uno,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "staroffice:",
    m_aTranslatedPrefix: "private:",
    m_eScheme: INetProtocol.PrivSoffice,
    m_eKind: PrefixKind.External,
  },
  {
    m_aPrefix: "telnet:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Telnet,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.libreoffice.cmis:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.Cmis,
    m_eKind: PrefixKind.Internal,
  },
  {
    m_aPrefix: "vnd.sun.star.cmd:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarCmd,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.expand:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarExpand,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.help:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarHelp,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.hier:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarHier,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.pkg:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarPkg,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.tdoc:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarTdoc,
    m_eKind: PrefixKind.Official,
  },
  {
    m_aPrefix: "vnd.sun.star.webdav:",
    m_aTranslatedPrefix: "",
    m_eScheme: INetProtocol.VndSunStarWebdav,
    m_eKind: PrefixKind.Official,
  },
];
/** Original sorted-prefix pointer narrowing, preserving the longest earlier match on failure. @param cursor - Native UTF16 pointer range. @returns Recognized record or null, with source cursor admission. */
export function getPrefix(cursor: UriCursor): PrefixInfo | null {
  let first = 1,
    last = prefixes.length - 1,
    matched = cursor.index,
    p = cursor.index,
    i = 0;
  let match: PrefixInfo | null = null;
  for (; first < last; ++i) {
    const info = prefixes[first] as PrefixInfo;
    if (i === info.m_aPrefix.length) {
      match = info;
      ++first;
      matched = p;
    }
    if (p >= cursor.end) break;
    const char = toAsciiLowerCase(cursor.text.charCodeAt(p++));
    while (first <= last && ((prefixes[first] as PrefixInfo).m_aPrefix.charCodeAt(i) || 0) < char)
      ++first;
    while (first <= last && ((prefixes[last] as PrefixInfo).m_aPrefix.charCodeAt(i) || 0) > char)
      --last;
  }
  if (first === last) {
    const info = prefixes[first] as PrefixInfo;
    let q = i;
    while (
      p < cursor.end &&
      q < info.m_aPrefix.length &&
      toAsciiLowerCase(cursor.text.charCodeAt(p)) === info.m_aPrefix.charCodeAt(q)
    ) {
      ++p;
      ++q;
    }
    if (q === info.m_aPrefix.length) {
      cursor.index = p;
      return info;
    }
  }
  cursor.index = matched;
  return match;
}
