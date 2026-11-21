/** @fileoverview Preserves the native hyphenation item through the ODT filter and Writer search. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  ParagraphHyphenationKeepType,
  SvxHyphenZoneItem,
} from "../../../editeng/source/items/paraitem";
import { MID_HYPHEN_ZONE, MID_HYPHEN_MIN_LEAD } from "../../../editeng/inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { RES_PARATR_HYPHENZONE } from "../../inc/hintids";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("opens and finds an authored native hyphenation item through the Attributes checklist", /** Adapts the ODF tdf149324 and tdf149420 assertions through a regular Open and the Attributes picker. @returns Completion. */ async () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  try {
    const shell = session.view.GetWrtShell();
    const item = new SvxHyphenZoneItem(true, RES_PARATR_HYPHENZONE, {
      minLead: 3,
      minTrail: 2,
      compoundMinLead: 4,
      compoundMinTrail: 3,
      maxHyphens: 0,
      minWordLength: 7,
      noCaps: true,
      noLastWord: true,
      zone: 567,
      paragraphEndZone: 240,
      columnEndZone: 360,
      pageEndZone: 540,
      spreadEndZone: 720,
      keep: true,
      keepType: ParagraphHyphenationKeepType.COLUMN,
      keepLine: true,
    });
    const paragraph = shell.GetActiveParagraph();
    shell.Insert("Authored paragraph");
    shell.SplitNode();
    shell.Insert("Ordinary paragraph");
    paragraph.SetAttr(item);

    const metadata = session.docShell.GetDocumentState();
    const bytes = await writeOdtDocument(session.docShell.GetDoc(), metadata);
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    expect(content).toContain('fo:hyphenate="true"');
    expect(content).toContain('fo:hyphenation-ladder-count="none"');
    expect(content).toContain('loext:hyphenation-zone-spread="720"');
    expect(content).toContain('loext:hyphenation-keep-type="column"');

    const opened = await session.docShell.Open(bytes, metadata);
    const [authored, ordinary] = opened.paragraphs;
    const restored = authored?.GetAttr(RES_PARATR_HYPHENZONE);
    expect(restored).toBeInstanceOf(SvxHyphenZoneItem);
    expect(restored?.equals(item)).toBe(true);
    expect(ordinary?.GetAttr(RES_PARATR_HYPHENZONE).QueryValue()).toMatchObject({
      hyphen: false,
      maxHyphens: 0,
      minWordLength: 0,
      zone: 0,
      compoundMinLead: 2,
      compoundMinTrail: 2,
    });

    const workbench = render(<WriterWorkbench isActive view={session.view} />);
    try {
      fireEvent.keyDown(window, { key: "h", ctrlKey: true });
      const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
      fireEvent.click(dialog.getByText("Other options"));
      fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
      const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
      fireEvent.click(attributes.getByRole("checkbox", { name: "Hyphenation" }));
      fireEvent.click(attributes.getByRole("button", { name: "OK" }));
      fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
      const result = session.view.GetWrtShell().GetCursor();
      expect(result.HasMark()).toBe(true);
      expect([...result.GetRingContainer()]).toHaveLength(1);
      expect(result.Start().GetNode()).toBe(authored);
      expect(result.End().GetContentIndex()).toBe("Authored paragraph".length);
    } finally {
      workbench.unmount();
    }
  } finally {
    session.Close();
  }
});

it("narrows native byte and word hyphenation members and reads signed UNO shorts", /** Verifies the original sal_uInt8 and sal_uInt16 casts and ignores CONVERT_TWIPS. @returns Nothing. */ () => {
  const item = SvxHyphenZoneItem.CreateDefault();
  const byte = new Any([257], "sal_Int32");
  const word = new Any([65535], "sal_Int32");
  const output = new Any();
  try {
    expect(item.QueryValue()).toMatchObject({ maxHyphens: 255 });
    expect(item.PutValue(byte, MID_HYPHEN_MIN_LEAD)).toBe(true);
    expect(item.PutValue(word, MID_HYPHEN_ZONE)).toBe(true);
    expect(item.QueryValue()).toMatchObject({ minLead: 1, zone: 65535 });
    expect(item.QueryValue(output, MID_HYPHEN_ZONE | 128)).toBe(true);
    const value: [number] = [0];
    expect(output.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(-1);
    expect(item.Clone().equals(item)).toBe(true);
  } finally {
    byte.dispose();
    word.dispose();
    output.dispose();
  }
});

it("matches complete Text Flow hyphenation settings and replaces only the matching paragraph", /** Drives exact format controls and checks native item history. @returns Nothing. */ () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const authored = shell.GetActiveParagraph();
  shell.Insert("Matched");
  shell.SplitNode();
  const other = shell.GetActiveParagraph();
  shell.Insert("Unmatched");
  const settings = {
    minLead: 3,
    minTrail: 2,
    maxHyphens: 0,
    minWordLength: 4,
    noLastWord: true,
    keep: true,
    keepType: ParagraphHyphenationKeepType.SPREAD,
  };
  authored.SetAttr(new SvxHyphenZoneItem(true, RES_PARATR_HYPHENZONE, settings));
  other.SetAttr(new SvxHyphenZoneItem(true, RES_PARATR_HYPHENZONE, { ...settings, minLead: 4 }));
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const format = dialog.getByRole("button", { name: "Format…" });
    fireEvent.click(format);
    let page = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(page.getByRole("tab", { name: "Text Flow" }));
    const automatic = page.getByRole("checkbox", { name: "Automatically" });
    const lead = page.getByRole("spinbutton", { name: "Characters at line end" });
    expect(automatic).toBePartiallyChecked();
    expect(lead).toBeDisabled();
    fireEvent.click(automatic);
    fireEvent.click(automatic);
    expect(lead).toBeEnabled();
    fireEvent.change(lead, { target: { value: "3" } });
    const across = page.getByRole("checkbox", { name: "Page" });
    fireEvent.click(across);
    fireEvent.click(across);
    expect(page.getByRole("checkbox", { name: "Column" })).toBeChecked();
    expect(page.getByRole("spinbutton", { name: "Spread end zone" })).toBeDisabled();
    fireEvent.click(page.getByRole("checkbox", { name: "Hyphenate words in CAPS" }));
    fireEvent.click(page.getByRole("checkbox", { name: "Move Line" }));
    fireEvent.click(page.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    const cursor = shell.GetCursor();
    expect(cursor.HasMark()).toBe(true);
    expect(cursor.Start().GetNode()).toBe(authored);

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(format);
    page = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(page.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(page.getByRole("checkbox", { name: "Automatically" }));
    fireEvent.click(page.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(authored.GetAttr(RES_PARATR_HYPHENZONE).QueryValue()).toMatchObject({ hyphen: false });
    expect(other.GetAttr(RES_PARATR_HYPHENZONE).QueryValue()).toMatchObject({
      hyphen: true,
      minLead: 4,
    });
    expect(shell.Undo()).toBe(true);
    expect(authored.GetAttr(RES_PARATR_HYPHENZONE).QueryValue()).toMatchObject({
      hyphen: true,
      minLead: 3,
    });
  } finally {
    workbench.unmount();
    session.Close();
  }
});
