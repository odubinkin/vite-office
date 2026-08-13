/** @fileoverview Verifies deterministic browser plain-text download construction, click dispatch, and URL cleanup. */

import { describe, expect, it } from "vitest";

import {
  downloadPlainText,
  type DownloadAnchor,
  type DownloadDocument,
  type DownloadUrl,
} from "./browser-download";

/** Creates deterministic fake browser capabilities and observable download state. @returns Download test doubles and their captured values. */
function createDownloadEnvironment(): {
  readonly anchor: DownloadAnchor;
  readonly document: DownloadDocument;
  readonly url: DownloadUrl;
  readonly values: { blob: Blob | undefined; clicked: boolean; revoked: string | undefined };
} {
  const values: { blob: Blob | undefined; clicked: boolean; revoked: string | undefined } = {
    blob: undefined,
    clicked: false,
    revoked: undefined,
  };
  const anchor: DownloadAnchor = {
    /** Records a synthetic browser click. @returns Nothing; updates the observable fixture. */
    click: function click(): void {
      values.clicked = true;
    },
    download: "",
    href: "",
  };
  return {
    anchor,
    document: {
      /** Returns the fixture anchor for the required anchor tag. @param tagName - Requested DOM tag. @returns Fixture anchor. */
      createElement: function createElement(tagName: "a"): DownloadAnchor {
        expect(tagName).toBe("a");
        return anchor;
      },
    },
    url: {
      /** Captures the Blob and returns a deterministic object URL. @param blob - Text Blob passed by adapter. @returns Fixed object URL. */
      createObjectURL: function createObjectURL(blob: Blob): string {
        values.blob = blob;
        return "blob:writer-export";
      },
      /** Records object-URL cleanup. @param url - URL released by the adapter. @returns Nothing. */
      revokeObjectURL: function revokeObjectURL(url: string): void {
        values.revoked = url;
      },
    },
    values,
  };
}

describe("browser plain-text download" /** Groups Blob download lifecycle cases. @returns Nothing; Vitest registers cases. */, function defineDownloadTests(): void {
  it("writes UTF-8 plain text, clicks its anchor, and releases the object URL" /** Verifies exact payload, MIME type, filename, click, and cleanup. @returns A promise resolved after Blob inspection. */, async function downloadsText(): Promise<void> {
    const environment = createDownloadEnvironment();
    downloadPlainText("Hello Writer", "writer.txt", environment.document, environment.url);
    expect(environment.anchor).toMatchObject({
      download: "writer.txt",
      href: "blob:writer-export",
    });
    expect(environment.values.clicked).toBe(true);
    expect(environment.values.revoked).toBe("blob:writer-export");
    await expect(environment.values.blob?.text()).resolves.toBe("Hello Writer");
    expect(environment.values.blob?.type).toBe("text/plain;charset=utf-8");
  });
});
