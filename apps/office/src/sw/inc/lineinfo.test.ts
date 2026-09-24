/** @fileoverview Tests pinned SwLineNumberInfo defaults and document ownership. */

import { describe, expect, it } from "vitest";

import { createWriterDocument } from "../source/core/doc/doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../browser/filter/xml/writer-document-codec";
import { createWriterDocumentSession } from "../browser/composition/writer-module";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_LINENUMBER } from "./hintids";
import { LineNumberPosition, SwLineNumberInfo } from "./lineinfo";

describe("SwLineNumberInfo", /** Groups pinned line-number contract checks. @returns Nothing. */ () => {
  it("starts with pinned Writer defaults and owns independent copies", /** Compares sw/source/core/doc/lineinfo.cxx defaults. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const info = document.GetLineNumberInfo();
    expect(info.QueryValue()).toEqual({
      divider: "",
      dividerCountBy: 3,
      posFromLeft: 283,
      countBy: 5,
      position: LineNumberPosition.Left,
      paintLineNumbers: false,
      countBlankLines: true,
      countInFlys: false,
      restartEachPage: false,
    });
    info.SetPaintLineNumbers(true);
    expect(document.GetLineNumberInfo().IsPaintLineNumbers()).toBe(false);
    expect(document.SetLineNumberInfo(info)).toBe(true);
    expect(document.SetLineNumberInfo(info)).toBe(false);
    info.SetPaintLineNumbers(false);
    expect(document.GetLineNumberInfo().IsPaintLineNumbers()).toBe(true);
    expect(document.GetLineNumberInfo().Clone().equals(document.GetLineNumberInfo())).toBe(true);
  });

  it("copies every browser-relevant setting", /** Checks mutable upstream-style field accessors and value identity. @returns Nothing. */ () => {
    const info = new SwLineNumberInfo();
    info.SetDivider("—");
    info.SetDividerCountBy(7);
    info.SetPosFromLeft(360);
    info.SetCountBy(2);
    info.SetPos(LineNumberPosition.Outside);
    info.SetPaintLineNumbers(true);
    info.SetCountBlankLines(false);
    info.SetCountInFlys(true);
    info.SetRestartEachPage(true);
    expect(info.GetDivider()).toBe("—");
    expect(info.GetDividerCountBy()).toBe(7);
    expect(info.GetPosFromLeft()).toBe(360);
    expect(info.GetCountBy()).toBe(2);
    expect(info.GetPos()).toBe(LineNumberPosition.Outside);
    expect(info.IsPaintLineNumbers()).toBe(true);
    expect(info.IsCountBlankLines()).toBe(false);
    expect(info.IsCountInFlys()).toBe(true);
    expect(info.IsRestartEachPage()).toBe(true);
    expect(SwLineNumberInfo.FromValue(info.QueryValue()).equals(info)).toBe(true);
    for (const field of Object.keys(info.QueryValue()) as (keyof ReturnType<
      SwLineNumberInfo["QueryValue"]
    >)[]) {
      const changed = { ...info.QueryValue(), [field]: null };
      expect(
        /** Restores a malformed field. @returns Invalid value. */ () =>
          SwLineNumberInfo.FromValue(changed),
      ).toThrow("invalid");
      const candidate = { ...info.QueryValue(), [field]: field === "divider" ? "different" : 0 };
      if (field === "position") candidate.position = LineNumberPosition.Right;
      expect(new SwLineNumberInfo(candidate).equals(info)).toBe(false);
    }
    for (const value of [null, [], 1])
      expect(
        /** Restores a malformed object. @returns Invalid value. */ () =>
          SwLineNumberInfo.FromValue(value),
      ).toThrow("invalid");
    expect(
      /** Rejects negative position enum. @returns Invalid value. */ () =>
        SwLineNumberInfo.FromValue({ ...info.QueryValue(), position: -1 }),
    ).toThrow("invalid");
    expect(
      /** Rejects oversized position enum. @returns Invalid value. */ () =>
        SwLineNumberInfo.FromValue({ ...info.QueryValue(), position: 4 }),
    ).toThrow("invalid");
  });

  it("routes painting through the Writer shell and keeps paragraph participation undoable", /** Verifies shell ownership and existing paragraph item history. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const shell = session.view.GetWrtShell();
    expect(session.docShell.IsModified()).toBe(false);
    expect(shell.SetPaintLineNumbers(true)).toBe(true);
    expect(session.docShell.IsModified()).toBe(true);
    expect(shell.SetPaintLineNumbers(true)).toBe(false);
    expect(shell.GetLineNumberInfo().IsPaintLineNumbers()).toBe(true);
    const noCount = new SfxBoolItem(RES_LINENUMBER, false);
    expect(shell.SetParagraphItem(noCount)).toBe(true);
    expect((shell.GetActiveParagraph().GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(
      false,
    );
    expect(shell.Undo()).toBe(true);
    expect((shell.GetActiveParagraph().GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(
      true,
    );
    expect(shell.Redo()).toBe(true);
    expect((shell.GetActiveParagraph().GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(
      false,
    );
    session.Close();
  });

  it("persists settings in snapshots and opens older snapshots with pinned defaults", /** Checks snapshot compatibility. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const info = document.GetLineNumberInfo();
    info.SetCountBy(2);
    info.SetPaintLineNumbers(true);
    document.SetLineNumberInfo(info);
    const snapshot = encodeWriterDocument(document);
    expect(decodeWriterDocument(snapshot).GetLineNumberInfo().QueryValue()).toEqual(
      info.QueryValue(),
    );
    const oldSnapshot = { ...snapshot };
    delete (oldSnapshot as { lineNumberInfo?: unknown }).lineNumberInfo;
    expect(decodeWriterDocument(oldSnapshot).GetLineNumberInfo().QueryValue()).toEqual(
      new SwLineNumberInfo().QueryValue(),
    );
    expect(
      /** Rejects a malformed stored interval. @returns Decoded document. */ () =>
        decodeWriterDocument({
          ...snapshot,
          lineNumberInfo: { ...info.QueryValue(), countBy: "bad" },
        }),
    ).toThrow("invalid");
  });
});
