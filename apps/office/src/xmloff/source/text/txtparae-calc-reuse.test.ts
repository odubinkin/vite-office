/** @fileoverview Shared native inline text output and explicit paragraph flag preservation for all consuming applications. */
import { expect, it } from "vitest";
import { exportTextParagraphs, exportText } from "./txtparae";
it("retains explicit true and false font-independent line spacing instead of dropping it as absent", /** This is a real shared style contract,not a Calc-only formatting implementation. @returns Nothing. */ () => {
  for (const flag of [false, true]) {
    const output = exportTextParagraphs({
      /** Provides actual neutral paragraph inputs. @returns Paragraph stream. */ *paragraphs() {
        yield {
          style: "default",
          runs: [],
          paragraphProperties: { fontIndependentLineSpacing: flag },
        };
      },
    });
    expect(output.automaticStyles).toContain(`style:font-independent-line-spacing="${flag}"`);
  }
  expect(exportText("  x\ty\n<😀>")).toBe(
    '<text:s text:c="2"/>x<text:tab/>y<text:line-break/>&lt;😀&gt;',
  );
});
