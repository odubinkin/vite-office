/** @fileoverview Verifies one localized command resource projection for Writer surfaces. */

import { describe, expect, it } from "vitest";
import { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { selectWriterCommandResource } from "./writer-command-presentation";

describe("Writer command presentation", /** Runs the focused test callback. @returns Operation result. */ () => {
  it("keeps generated command policy and localizes both visible and control labels", /** Runs the focused test callback. @returns Operation result. */ () => {
    const commandUrl = WRITER_COMMAND_IDS.alignLeft;
    const generated = getWriterCommandResource(commandUrl);
    const localization = new BrowserLocalizationService("fr-FR", {
      "fr-FR": {
        [`writer.command.${commandUrl}.label`]: "Aligner à gauche",
        [`writer.command.${commandUrl}.control-label`]: "Alignement gauche",
      },
    });
    expect(selectWriterCommandResource(localization, commandUrl)).toEqual({
      ...generated,
      controlLabel: "Alignement gauche",
      label: "Aligner à gauche",
    });
    expect(
      selectWriterCommandResource(new BrowserLocalizationService("en-US"), commandUrl),
    ).toEqual(generated);
  });
});
