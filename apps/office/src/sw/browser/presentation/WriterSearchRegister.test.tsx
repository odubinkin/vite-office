/** @fileoverview Searches native page line-spacing participation after an ordinary ODT open. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { RES_PARATR_REGISTER } from "../../inc/hintids";
import { SwRegisterItem } from "../../source/core/para/paratr";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("finds inherited and direct page line-spacing after opening an ODT", /** Exercises the supported register item through ODF and the native Attributes checklist. @returns Completion. */ async () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  try {
    const shell = session.view.GetWrtShell();
    const doc = session.docShell.GetDoc();
    const inherited = shell.GetActiveParagraph();
    shell.Insert("Inherited participation");
    shell.SplitNode();
    const direct = shell.GetActiveParagraph();
    shell.Insert("Direct participation");
    shell.SplitNode();
    const disabled = shell.GetActiveParagraph();
    shell.Insert("Disabled participation");

    const style = doc.GetTextFormatColl("heading-1");
    style.SetFormatAttr(new SwRegisterItem(true));
    inherited.ChgFormatColl(style);
    direct.SetAttr(new SwRegisterItem(true));
    disabled.ChgFormatColl(style);
    disabled.SetAttr(new SwRegisterItem(false));

    const metadata = session.docShell.GetDocumentState();
    const bytes = await writeOdtDocument(doc, metadata);
    const archive = await DocumentArchive.open(bytes);
    const styles = await archive.readTextEntry("styles.xml");
    const content = await archive.readTextEntry("content.xml");
    expect(styles).toContain('style:register-true="true"');
    expect(content).toContain('style:register-true="true"');
    expect(content).toContain('style:register-true="false"');

    const opened = await session.docShell.Open(bytes, metadata);
    const nodes = opened.paragraphs;
    expect(
      nodes.map(
        /** Reads effective participation from the paragraph item or its style. @param node - Restored paragraph. @returns Participation. */
        (node) => (node.GetAttr(RES_PARATR_REGISTER) as SwRegisterItem).GetValue(),
      ),
    ).toEqual([true, true, false]);
    expect(nodes[0]?.GetAttr(RES_PARATR_REGISTER)).toBeInstanceOf(SwRegisterItem);
    expect(nodes[1]?.GetAttr(RES_PARATR_REGISTER)).toBeInstanceOf(SwRegisterItem);
    expect(nodes[2]?.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_REGISTER, false)).toBeInstanceOf(
      SwRegisterItem,
    );
    expect(
      (opened.GetAttrPool().GetPoolDefaultItem(RES_PARATR_REGISTER) as SwRegisterItem).GetValue(),
    ).toBe(false);

    const workbench = render(<WriterWorkbench isActive view={session.view} />);
    try {
      fireEvent.keyDown(window, { key: "h", ctrlKey: true });
      const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
      fireEvent.click(dialog.getByText("Other options"));
      fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
      const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
      fireEvent.click(attributes.getByRole("checkbox", { name: "Page line-spacing" }));
      fireEvent.click(attributes.getByRole("button", { name: "OK" }));
      expect(dialog.getByText("Page line-spacing", { exact: true })).toBeVisible();
      const findAll = dialog.getByRole("button", { name: "Find All" });
      fireEvent.click(findAll);
      const cursor = session.view.GetWrtShell().GetCursor();
      expect([...cursor.GetRingContainer()]).toHaveLength(1);
      expect(cursor.Start().GetNode()).toBe(nodes[1]);

      fireEvent.change(dialog.getByLabelText("Find", { exact: true }), {
        target: { value: "participation" },
      });
      fireEvent.click(dialog.getByRole("checkbox", { name: "Including Styles" }));
      fireEvent.click(findAll);
      const matches = [...session.view.GetWrtShell().GetCursor().GetRingContainer()].map(
        /** Resolves the actual matched model node. @param match - Search range. @returns Paragraph owner. */
        (match) => match.Start().GetNode(),
      );
      expect(matches).toHaveLength(2);
      expect(matches).toEqual(expect.arrayContaining(nodes.slice(0, 2)));
    } finally {
      workbench.unmount();
    }
  } finally {
    session.Close();
  }
});
