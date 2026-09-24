/** @fileoverview Keeps a physical Writer page visible before paragraphs are projected. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { createDefaultWriterPageDescriptor } from "../../source/core/layout/pagedesc";
import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { WriterViewProjection } from "../presentation/writer-view-projection";
import { WriterPlainTextEditor } from "./WriterPlainTextEditor";

describe("empty Writer page", /** Groups empty Writer page. @returns Test callback result. */ () => {
  it("renders the initial physical page without an editable paragraph", /** Checks renders the initial physical page without an editable paragraph. @returns Test callback result. */ () => {
    render(
      <WriterPlainTextEditor
        activeParagraphId=""
        cursorSelection={{ point: { paragraphId: "", offset: 0 } }}
        editWindow={
          {
            FocusNode: vi.fn(),
            GetDoc: /** Resolves the empty-page document. @returns Canonical document. */ () =>
              createWriterDocument(),
          } as unknown as SwEditWin
        }
        pageDescriptor={createDefaultWriterPageDescriptor("en-US").GetValue()}
        paragraphs={[]}
      />,
    );
    expect(screen.getByRole("document", { name: "Page 1" })).toBeInTheDocument();
  });

  it("drops a pending browser measurement when the page unmounts", /** Checks drops a pending browser measurement when the page unmounts. @returns Test callback result. */ () => {
    const document = createWriterDocument();
    const node = document.paragraphs[0]!;
    const projected = new WriterViewProjection().Project(
      document,
      node,
      new SwPaM(new SwPosition(node, 0)),
      createDocument({ id: "measure", suiteId: "writer", title: "Measure" }),
    );
    const geometry = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      height: 20,
    } as DOMRect);
    const view = render(
      <WriterPlainTextEditor
        activeParagraphId={projected.activeParagraph.id}
        cursorSelection={projected.cursorSelection}
        editWindow={
          {
            FocusNode: vi.fn(),
            GetDoc: /** Resolves the measurement document. @returns Canonical document. */ () =>
              document,
          } as unknown as SwEditWin
        }
        pageDescriptor={projected.pageDescriptor}
        paragraphs={projected.paragraphs}
      />,
    );
    view.unmount();
    geometry.mockRestore();
  });
});
