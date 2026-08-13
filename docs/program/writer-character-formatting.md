# Browser Writer direct character formatting

## Implemented browser slice

The static Writer workbench supports direct **Bold**, **Italic**, and single
**Underline** formatting for one non-empty native selection contained in one
editable paragraph. The immutable Writer paragraph stores canonical text runs
in [`ndtxt.ts`](../../apps/office/src/sw/source/core/txtnode/ndtxt.ts); its
legacy `text` field is the exact derived visible-text projection. Adjacent runs
with identical attributes are normalized together, so browser-local snapshots,
Undo, Redo, Enter splits, and paragraph joins retain the supported attributes.

At a collapsed caret, each command toggles the pending attributes used by the
next contiguous insertion. The command is available at **Format → Text**, on
the Writer text-object formatting toolbar before alignment/list controls, and
through **Ctrl/Cmd+B**, **Ctrl/Cmd+I**, and **Ctrl/Cmd+U**. These browser
placements derive from pinned `sw/uiconfig/swriter/menubar/menubar.xml` and
`sw/uiconfig/swriter/toolbar/textobjectbar.xml`.

The command adapter is
[`txtattr.ts`](../../apps/office/src/sw/source/uibase/shells/txtattr.ts), mapped
to `sw/source/uibase/shells/txtattr.cxx`; the model is mapped to
`sw/source/core/txtnode/ndtxt.cxx`. It deliberately separates pure range
formatting from browser DOM selection conversion in
[`select.ts`](../../apps/office/src/sw/source/uibase/wrtsh/select.ts).

## Clipboard and accessibility

Rendered runs use `strong`, `em`, and a single-underline `span`. Copy exports
only those semantic elements, portable paragraph styles, and visible text;
screen-reader paragraph descriptions and arbitrary editable markup are never
copied. A partial selection within one shared formatted run retains that shared
format. This is a bounded browser counterpart to Writer transfer preparation,
not a claim of full RTF/HTML filter parity.

## Evidence and limits

Pinned implementation evidence is `sw/source/uibase/shells/txtattr.cxx`
(`SwTextShell::ExecCharAttr`) and `sw/source/core/txtnode/ndtxt.cxx`. Pinned
placement evidence is `sw/uiconfig/swriter/menubar/menubar.xml` (`.uno:Bold`,
`.uno:Italic`, `.uno:UnderlineSingle`) and
`sw/uiconfig/swriter/toolbar/textobjectbar.xml`. Behavioral references include
`sw/qa/extras/tiledrendering/tiledrendering.cxx:testIMEFormattingAtEndOfParagraph`,
`sw/qa/uitest/writer_tests2/formatCharacter.py`, and Writer Help topics
`helpcontent2/source/text/swriter/04/01020000.xhp` and
`helpcontent2/source/text/swriter/guide/shortcut_writing.xhp`.

This slice does not yet implement cross-paragraph or multi-range formatting,
font/size/colour attributes, character styles, double underline, strikeout,
overline, full IME behavior, Paste, RTF, or ODT/DOCX interchange. Those gaps
remain explicit in `LO-WRITER-0109`; they are not browser-runtime exceptions.
