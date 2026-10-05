/** @fileoverview Verifies body and cell paragraphs share actual native style/list projections and shell history without upstream execution. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import { SvxULSpaceItem, SvxFirstLineIndentItem } from "../../../editeng/source/items/frmitems";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_FONTSIZE,
  RES_MARGIN_FIRSTLINE,
  RES_UL_SPACE,
} from "../../inc/hintids";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases real native sessions and DOM surfaces. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates actual body and cell text in one persistent Writer session. @returns Real owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    node = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    neighbor = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (node === undefined || neighbor === undefined) throw new Error("Missing canonical cell");
  node.SetText("CellText");
  neighbor.SetText("Neighbor");
  shell.FocusNode(node);
  return { session, doc, shell, table, node, neighbor };
}
/** Mounts the actual workbench through its existing store. @param owner - Session owners. @returns Nothing. */
function mount(owner: ReturnType<typeof fixture>) {
  render(
    <WriterWorkbench
      isActive
      view={owner.session.view}
      fileDialogs={owner.session.fileDialogs}
      services={owner.session.services}
    />,
  );
}
describe("shared native cell paragraph display", /** Registers actual node-to-display and history contracts. @returns Nothing. */ () => {
  it.each(["center", "right", "justify"] as const)(
    "renders native cell alignment=%s through the common paragraph",
    /** Checks literal style and neighboring owner isolation. @param alignment - Native value. @returns Nothing. */ (
      alignment,
    ) => {
      const owner = fixture();
      owner.node.SetParagraphAlignment(alignment);
      mount(owner);
      const cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
      expect(cell).toHaveStyle({ textAlign: alignment });
      expect(cell).toHaveAttribute("data-alignment", alignment);
      expect(cell).toHaveAttribute("role", "textbox");
      expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).toHaveStyle({
        textAlign: "left",
      });
      expect(owner.neighbor.GetText()).toBe("Neighbor");
    },
  );
  it("renders effective margins, signed first-line offset, font, color and cell spacing", /** Checks literal native item values reach the common paragraph. @returns Nothing. */ () => {
    const owner = fixture();
    owner.node.SetParagraphTextLeftMargin(400);
    owner.node.SetParagraphFirstLineIndent(-80);
    owner.node.SetParagraphRightMargin(300);
    owner.node.SetAttr(new SvxULSpaceItem(100, 200, RES_UL_SPACE));
    owner.node.SetAttr(new SvxFontHeightItem(280, RES_CHRATR_FONTSIZE));
    owner.node.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#123456"));
    owner.node.SetAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "#abcdef"));
    mount(owner);
    const cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    expect(cell).toHaveStyle({
      marginInlineStart: "20pt",
      marginInlineEnd: "15pt",
      textIndent: "-4pt",
      fontSize: "14pt",
      color: "#123456",
      backgroundColor: "#abcdef",
    });
    expect(cell.parentElement?.parentElement).toHaveStyle({
      marginBlockStart: "5pt",
      marginBlockEnd: "10pt",
    });
    expect((owner.node.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(280);
    expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).not.toHaveStyle({
      fontSize: "14pt",
    });
  });
  it("uses the core automatic first-line result inside the cell", /** Checks authored automatic state stays separate from rendered layout. @returns Nothing. */ () => {
    const owner = fixture();
    owner.node.SetAttr(new SvxFontHeightItem(300, RES_CHRATR_FONTSIZE));
    owner.node.SetAttr(new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE, true));
    mount(owner);
    const cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    expect(cell).toHaveStyle({ textIndent: "30pt" });
    expect(
      (
        owner.node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
    ).toBe(120);
  });
  it.each([
    ["numbered", "1."],
    ["bullet", "•"],
  ] as const)(
    "renders the native %s label in the cell",
    /** Checks real numbering owner and shared accessible description. @param kind - Native kind. @param label - Literal supported label. @returns Nothing. */ (
      kind,
      label,
    ) => {
      const owner = fixture();
      expect(owner.shell.SetParagraphListKind(kind)).toBe(true);
      mount(owner);
      const cell = screen.getByLabelText("Row 1 column 1 paragraph 1"),
        id = cell.getAttribute("data-writer-paragraph-id");
      expect(owner.node.GetListLabel()).toBe(label);
      expect(screen.getByTestId("writer-list-marker-" + id)).toHaveTextContent(label);
      expect(cell).toHaveAttribute("data-list-kind", kind);
      expect(cell).toHaveAccessibleDescription(
        new RegExp("Paragraph list: " + (kind === "bullet" ? "Unordered" : "Ordered") + " List"),
      );
      expect(owner.doc.paragraphs[0]?.GetListKind()).toBe("none");
    },
  );
  it("restores cell alignment and native list display through real Undo/Redo", /** Checks display changes follow the same actual shell history. @returns Nothing. */ () => {
    const owner = fixture();
    mount(owner);
    const cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    act(
      /** Changes the native owner. @returns Nothing. */ () => {
        owner.shell.SetParagraphAlignment("center");
        owner.shell.SetParagraphListKind("numbered");
      },
    );
    expect(cell).toHaveStyle({ textAlign: "center" });
    expect(cell).toHaveAttribute("data-list-kind", "numbered");
    act(
      /** Removes native list history. @returns Nothing. */ () => {
        owner.shell.Undo();
      },
    );
    expect(cell).toHaveAttribute("data-list-kind", "none");
    act(
      /** Removes alignment history. @returns Nothing. */ () => {
        owner.shell.Undo();
      },
    );
    expect(cell).toHaveStyle({ textAlign: "left" });
    act(
      /** Replays the same native owners. @returns Nothing. */ () => {
        owner.shell.Redo();
        owner.shell.Redo();
      },
    );
    expect(cell).toHaveStyle({ textAlign: "center" });
    expect(cell).toHaveAttribute("data-list-kind", "numbered");
    expect(owner.neighbor.GetParagraphAlignment()).toBe("left");
  });
  it("keeps style descriptions unique across the body and cell paragraphs", /** Checks stable native identity rather than duplicate ordinal IDs. @returns Nothing. */ () => {
    const owner = fixture();
    owner.shell.SetParagraphStyle("heading-1");
    mount(owner);
    const cell = screen.getByLabelText("Row 1 column 1 paragraph 1"),
      body = screen.getByRole("textbox", { name: "Writer document text" });
    expect(cell).toHaveAttribute("data-style", "heading-1");
    expect(cell).toHaveStyle({ fontSize: "18pt", fontWeight: "700" });
    expect(cell.getAttribute("aria-describedby")).not.toBe(body.getAttribute("aria-describedby"));
    expect(cell).toHaveAccessibleDescription(/Heading 1/);
  });
  it("uses the same paragraph style and native list label on the closed measurement surface", /** Checks native display inputs are shared without another attribute renderer. @returns Nothing. */ () => {
    const owner = fixture(),
      roots: ShadowRoot[] = [];
    owner.node.SetParagraphAlignment("right");
    owner.shell.SetParagraphListKind("numbered");
    const attach = HTMLElement.prototype.attachShadow;
    vi.spyOn(HTMLElement.prototype, "attachShadow").mockImplementation(
      /** Captures the existing closed device surface for independent inspection. @param this - Host. @param init - Native init. @returns Actual shadow root. */ function (
        this: HTMLElement,
        init: ShadowRootInit,
      ) {
        const root = attach.call(this, init);
        roots.push(root);
        return root;
      },
    );
    mount(owner);
    const visible = screen.getByLabelText("Row 1 column 1 paragraph 1"),
      measured = roots.flatMap(
        /** Reads actual measurement paragraphs. @param root - Device root. @returns Cell paragraph or empty. */ (
          root,
        ) =>
          Array.from(
            root.querySelectorAll<HTMLElement>('[aria-label="Row 1 column 1 paragraph 1"]'),
          ),
      )[0];
    expect(measured).toBeDefined();
    expect(measured).toHaveStyle({ textAlign: "right" });
    expect(measured?.getAttribute("data-writer-paragraph-id")).toBe(
      visible.getAttribute("data-writer-paragraph-id"),
    );
    expect(measured?.parentElement?.querySelector("[data-writer-list-marker]")).toHaveTextContent(
      "1.",
    );
  });
  it("reads the frozen native projection without repeating cell attribute assembly", /** Checks one display source and no native mutation during rendering. @returns Nothing. */ () => {
    const owner = fixture(),
      snapshot = owner.session.viewStore.GetSnapshot(),
      paragraphs = new Map(
        snapshot.textNodes.map(
          /** Indexes real immutable text. @param paragraph - Projection. @returns Map entry. */ (
            paragraph,
          ) => [paragraph.nodeIndex, paragraph],
        ),
      ),
      getAttr = vi.spyOn(owner.node, "GetAttr"),
      revision = owner.doc.GetDocumentStateManager().GetModelRevision();
    render(
      <WriterEditableTable
        onSelectRow={vi.fn()}
        table={owner.table}
        paragraphs={paragraphs}
        activeParagraphId={snapshot.activeParagraph.id}
      />,
    );
    expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveTextContent("CellText");
    expect(getAttr).not.toHaveBeenCalled();
    expect(owner.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  });
  it("rejects missing native cell projections instead of creating a synthetic display", /** Checks the actual-node projection contract cannot silently diverge. @returns Nothing. */ () => {
    const owner = fixture();
    expect(
      /** Attempts a table with absent text projections. @returns Render result. */ () =>
        render(
          <WriterEditableTable onSelectRow={vi.fn()} table={owner.table} paragraphs={new Map()} />,
        ),
    ).toThrow("no connected paragraph projection");
  });
});
