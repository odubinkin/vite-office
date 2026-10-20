/** @fileoverview Source-backed shared Writer/Calc command captions, accelerator notation and native toggle flags. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  findEnglishLabel,
  findEnglishLabelProperty,
  findShortcuts,
  findCommandPropertyBits,
  convertShortcut,
  stripMnemonic,
  decodeXml,
  escapeRegExp,
} from "./office-ui-command-catalog";
const root = "vendor/libreoffice-reference/officecfg/registry/data/org/openoffice/Office/";
const calc = readFileSync(root + "UI/CalcCommands.xcu", "utf8");
const generic = readFileSync(root + "UI/GenericCommands.xcu", "utf8");
const module = "com.sun.star.sheet.SpreadsheetDocument";
const accelerators = readFileSync(root + "Accelerators.xcu", "utf8");
it("uses the same source captions and accelerator order for both suite generators", /** Checks actual pinned command resources. @returns Nothing. */ () => {
  expect(stripMnemonic(findEnglishLabel(".uno:OpenFromCalc", calc, generic))).toBe("Open");
  expect(findShortcuts(".uno:OpenFromCalc", accelerators, module)[0]).toBe("Ctrl+O");
  expect(findShortcuts(".uno:SaveAs", accelerators, module).slice(0, 2)).toEqual([
    "Ctrl+Shift+S",
    "Meta+Shift+S",
  ]);
  expect(findShortcuts(".uno:Redo", accelerators, module).slice(0, 2)).toEqual([
    "Ctrl+Shift+Z",
    "Meta+Shift+Z",
  ]);
  expect(findShortcuts(".uno:Unknown", accelerators, module)).toEqual([]);
  expect(findCommandPropertyBits(".uno:Bold", calc, generic) & 8).toBe(8);
  expect(findCommandPropertyBits(".uno:Unknown", calc, generic)).toBe(0);
  expect(findEnglishLabelProperty(".uno:OpenFromCalc", "PopupLabel", calc)).toBeUndefined();
  expect(
    /** Verifies missing source resources fail closed. @returns Nothing. */ () =>
      findEnglishLabel(".uno:Unknown", calc, generic),
  ).toThrow("Missing upstream English label");
});
it("preserves shared notation and catalog inheritance without fabricating labels", /** Verifies deterministic pure transformations. @returns Nothing. */ () => {
  expect(convertShortcut("RETURN_MOD1_MOD2_SHIFT")).toBe("Ctrl+Alt+Shift+Enter");
  expect(convertShortcut("F2")).toBe("F2");
  expect(stripMnemonic("~Save As...")).toBe("Save As");
  expect(decodeXml("&lt;A&amp;B&gt;")).toBe("<A&B>");
  expect(escapeRegExp(".uno:X[1](a)+?")).toBe("\\.uno:X\\[1\\]\\(a\\)\\+\\?");
  const module =
    '<node oor:name=".uno:X"><prop oor:name="Label"><value xml:lang="en-US">~Module</value></prop></node>';
  const fallback =
    '<node oor:name=".uno:X"><prop oor:name="Properties"><value>8</value></prop></node>';
  expect(findEnglishLabel(".uno:X", module, fallback)).toBe("~Module");
  expect(findCommandPropertyBits(".uno:X", module, fallback)).toBe(8);
});

it("audits generated Calc source hashes and preserves the complete native top menu order", /** Pins source closure independently of the runtime adapter. @returns Nothing. */ () => {
  const artifact = JSON.parse(
    readFileSync("apps/office/src/sc/uiconfig/scalc/calc-ui.generated.json", "utf8"),
  ) as {
    sources: { path: string; sha256: string }[];
    surfaces: { menubar: { label: string }[] };
    commands: Record<string, { shortcuts: string[] }>;
  };
  for (const source of artifact.sources)
    expect(source.sha256).toBe(
      createHash("sha256")
        .update(readFileSync("vendor/libreoffice-reference/" + source.path))
        .digest("hex"),
    );
  expect(
    artifact.surfaces.menubar.map(
      /** Reads native label order. @param item - Source menu. @returns Caption. */ (item) =>
        item.label,
    ),
  ).toEqual([
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Styles",
    "Sheet",
    "Data",
    "Tools",
    "Window",
    "Help",
  ]);
  expect(artifact.commands[".uno:Save"]).toBeUndefined();
  expect(artifact.commands[".uno:Cut"]).toBeDefined();
  expect(artifact.commands[".uno:Redo"]?.shortcuts[0]).toBe("Ctrl+Shift+Z");
});

it("resolves only the active native module and honors key overrides", /** Audits real collisions and primary/secondary fallback. @returns Nothing. */ () => {
  expect(findShortcuts(".uno:UnderlineDouble", accelerators, module)).not.toContain("Ctrl+D");
  expect(findShortcuts(".uno:JumpToNextTable", accelerators, module)).toEqual([
    "Ctrl+TAB",
    "Meta+TAB",
    "Ctrl+PAGEDOWN",
    "Meta+PAGEDOWN",
  ]);
  expect(findShortcuts(".uno:FillDown", accelerators, module)).toContain("Ctrl+D");
  const xml = `<root><node oor:name="PrimaryKeys"><node oor:name="Global"><node oor:name="A_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Global</value></prop></node><node oor:name="B_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Fallback</value></prop></node></node><node oor:name="Modules"><node oor:name="test"><node oor:name="A_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Module</value></prop></node></node></node></node><node oor:name="SecondaryKeys"><node oor:name="Modules"><node oor:name="test"><node oor:name="A_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Shadowed</value></prop></node><node oor:name="C_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Secondary</value></prop></node></node></node></node></root>`;
  expect(findShortcuts(".uno:Global", xml, "test")).toEqual([]);
  expect(findShortcuts(".uno:Module", xml, "test")).toEqual(["Ctrl+A", "Meta+A"]);
  expect(findShortcuts(".uno:Fallback", xml, "test")).toEqual(["Ctrl+B", "Meta+B"]);
  expect(findShortcuts(".uno:Secondary", xml, "test")).toEqual(["Ctrl+C", "Meta+C"]);
  expect(findShortcuts(".uno:Shadowed", xml, "test")).toEqual([]);
});

it("removes empty configured keys before falling back to global bindings", /** Matches native configuration cache removal rather than shadowing with an empty command. @returns Nothing. */ () => {
  const xml = `<root><node oor:name="PrimaryKeys"><node oor:name="Global"><node oor:name="A_MOD1"><prop oor:name="Command"><value xml:lang="en-US">.uno:Global</value></prop></node></node><node oor:name="Modules"><node oor:name="test"><node oor:name="A_MOD1"><prop oor:name="Command"><value xml:lang="en-US"></value></prop></node></node></node></node></root>`;
  expect(findShortcuts(".uno:Global", xml, "test")).toEqual(["Ctrl+A", "Meta+A"]);
});
