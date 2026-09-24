/** @fileoverview Exercises Writer document boundary validation used by ODT imports. */

import { describe, expect, it } from "vitest";
import { DocumentSettingManager, getDefaultDocumentSettings } from "./DocumentSettingManager";
import { SwDoc } from "./doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

describe("Writer document boundaries", /** Registers malformed document tests. @returns Nothing. */ () => {
  it("validates document settings and page descriptor identity", /** Checks model guards. @returns Nothing. */ () => {
    const settings = new DocumentSettingManager();
    expect(getDefaultDocumentSettings().TAB_COMPAT).toBe(true);
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        settings.SetValues({
          ...getDefaultDocumentSettings(),
          TAB_COMPAT: undefined,
        } as unknown as ReturnType<DocumentSettingManager["GetValues"]>),
    ).toThrow("Stored Writer document setting is invalid");

    const document = new SwDoc();
    const standard = document.GetPageDesc();
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        document.GetPageDesc(9),
    ).toThrow("out of range");
    expect(document.ContainsPageDesc(undefined)).toBe(false);
    expect(document.ContainsPageDesc(standard)).toBe(true);
    const alternate = document.MakePageDesc("Alternate", standard);
    expect(document.ContainsPageDesc(alternate)).toBe(true);
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        document.MakePageDesc("Alternate"),
    ).toThrow("exists");
    expect(document.DelPageDesc(0)).toBe(false);
    expect(document.DelPageDesc("absent")).toBe(false);
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        document.ChgPageDesc({ ...alternate.GetValue(), name: "Wrong" }, "Alternate"),
    ).toThrow("preserve its identity");
    expect(document.ChgPageDesc(alternate.GetValue(), "absent")).toBe(false);
    standard.SetFollow(alternate);
    expect(document.DelPageDesc("Alternate")).toBe(true);
    expect(standard.GetFollow()).toBe(standard);
    expect(document.ContainsPageDesc(alternate)).toBe(false);
    expect(document.DelPageDesc(1)).toBe(false);
    document.MakePageDesc("Unreferenced");
    expect(document.DelPageDesc(1)).toBe(true);
  });

  it("rejects invalid page descriptor graphs during decode", /** Checks corrupt import records. @returns Nothing. */ () => {
    const source = encodeWriterDocument(new SwDoc());
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        decodeWriterDocument({ ...source, pageDescriptors: [null] }),
    ).toThrow("page descriptor collection is invalid");
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        decodeWriterDocument({ ...source, pageDescriptors: [source.pageDescriptors[0], null] }),
    ).toThrow("page descriptor collection is invalid");
    const firstPage = source.pageDescriptors[0];
    if (firstPage === undefined) throw new Error("Missing encoded Standard page.");
    const brokenFollow = {
      ...source,
      pageDescriptors: [{ ...firstPage, followName: "Missing" }],
    };
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        decodeWriterDocument(brokenFollow),
    ).toThrow("follow link is invalid");
  });
});
