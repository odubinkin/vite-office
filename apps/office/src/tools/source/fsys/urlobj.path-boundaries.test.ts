/** @fileoverview Original path-production admission, delimiter and cursor rollback contracts over real protocol and encoding owners. */
import { expect, it } from "vitest";
import { EncodeMechanism, INetProtocol as P } from "../../inc/urlobj";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { parsePath } from "./urlobj.path";

it.each([
  [P.NotValid, "/x", null, 0],
  [P.Ftp, "relative", null, 0],
  [P.Ftp, "#fragment", "/", 0],
  [P.Http, "relative", null, 0],
  [P.Http, "?query", "/", 0],
  [P.Http, "/path?query", "/path", 5],
  [P.File, "relative", null, 0],
  [P.File, "", "/", 0],
  [P.File, "\\folder\\child#fragment", "/folder/child", 13],
  [P.File, "/C|\\a#fragment", "/C:/a", 5],
  [P.Mailto, "?query", "", 0],
  [P.VndSunStarHelp, "", "/", 0],
  [P.VndSunStarHelp, "?query", "/", 0],
  [P.VndSunStarHelp, "#fragment", "/", 0],
  [P.VndSunStarHelp, "relative", null, 0],
  [P.VndSunStarHelp, "/topic?query", "/topic", 6],
  [P.VndSunStarHier, "relative", null, 0],
  [P.VndSunStarPkg, "relative", null, 0],
  [P.VndSunStarPkg, "?query", "/", 0],
  [P.VndSunStarCmd, "#fragment", null, 0],
  [P.VndSunStarExpand, "", null, 0],
  [P.Telnet, "/x", null, 0],
  [P.Telnet, "/", "/", 1],
  [P.VndSunStarTdoc, "", null, 0],
  [P.VndSunStarTdoc, "relative", null, 0],
  [P.Generic, "", null, 0],
  [P.Sftp, "#fragment", null, 0],
] as const)(
  "preserves native path admission and rollback for protocol %i and %s",
  /** tools/source/fsys/urlobj.cxx parsePath admits protocol-specific initial units and commits its source cursor only on success; input includes an unconsumed prefix/suffix outside its pointer range. @param protocol - Original protocol. @param input - Original path range. @param expected - Canonical path or failure. @param consumed - Original consumed units. @returns Nothing. */ (
    protocol,
    input,
    expected,
    consumed,
  ) => {
    const cursor = { text: `X${input}Z`, index: 1, end: 1 + input.length };
    expect(
      parsePath(
        protocol,
        cursor,
        EncodeMechanism.WasEncoded,
        RTL_TEXTENCODING_UTF8,
        false,
        47,
        92,
        63,
        35,
        "",
      ),
    ).toBe(expected);
    expect(cursor).toEqual({ text: `X${input}Z`, index: 1 + consumed, end: 1 + input.length });
  },
);

it("honors an already consumed file slash without rechecking the next segment as an initial delimiter", /** File URL production passes the native skipped-initial-slash flag after admitting its earlier prefix. @returns Nothing. */ () => {
  const cursor = { text: "folder#fragment", index: 0, end: 15 };
  expect(
    parsePath(
      P.File,
      cursor,
      EncodeMechanism.WasEncoded,
      RTL_TEXTENCODING_UTF8,
      true,
      47,
      92,
      63,
      35,
      "file:",
    ),
  ).toBe("file:/folder");
  expect(cursor.index).toBe(6);
});
