# Browser Writer direct character formatting

## Implemented browser slice

The static Writer workbench exposes direct **Bold**, **Italic**, single
**Underline**, **Font name**, and **Font size** formatting for one non-empty
native selection contained in one editable paragraph. The same canonical item
model stores foreground color and highlight imported from ODT or safe clipboard
HTML and preserves them through export and rendering; dedicated color controls
are not yet exposed. `SwTextNode` stores canonical text in
[`ndtxt.ts`](../../apps/office/src/sw/source/core/txtnode/ndtxt.ts), while its
optional [`SwpHints`](../../apps/office/src/sw/source/core/txtnode/ndhints.ts)
owns start-sorted [`SwTextAttr`](../../apps/office/src/sw/source/core/txtnode/txatbase.ts)
ranges. Rendering `runs` are derived from text and hints and are never canonical
storage. Adjacent equal spans are normalized during hint-to-run conversion, so
browser-local snapshots, Undo, Redo, Enter splits, and paragraph joins retain
the supported attributes.

At a collapsed caret, each command updates a pending character `SfxItemSet` used
by the next contiguous insertion. Undo cursor snapshots clone that item set;
boolean/font values exist only in render, clipboard, and command-state projections.
The command is available at **Format → Text**, on
the Writer text-object formatting toolbar before alignment/list controls, and
through **Ctrl/Cmd+B**, **Ctrl/Cmd+I**, and **Ctrl/Cmd+U**. These browser
placements derive from pinned `sw/uiconfig/swriter/menubar/menubar.xml` and
`sw/uiconfig/swriter/toolbar/textobjectbar.xml`.

The command adapter is `SwWrtShell.ToggleCharacterFormat`, backed by
`SwUndoAttr` and `SwTextShell` Execute/GetState handlers attached to generated
slot metadata in `sw/sdi/swriter.ts`; the model is mapped to
`sw/source/core/txtnode/ndtxt.cxx`, `ndhints.cxx`, and `txatbase.cxx`. It
deliberately separates model range formatting from browser DOM selection conversion in
[`writer-selection.ts`](../../apps/office/src/sw/browser/editor/writer-selection.ts).

## Clipboard and accessibility

Rendered runs use semantic emphasis and bounded sanitized style spans. Copy
exports those elements, font/foreground/highlight values, portable paragraph
styles, and visible text;
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

Font selection follows LibreOffice's device-backed `FontList`: Chromium's Local
Font Access API supplies installed families after user permission, with a
deterministic offline fallback when the API is absent or denied. Font family is
stored as `SvxFontItem` deltas and participates in Undo/Redo, snapshots, bounded
ODT interchange, rendering, and clipboard sanitization.

This slice does not yet implement cross-paragraph or multi-range formatting,
character styles, language/script-specific editing, double underline,
strikeout, overline, full IME behavior, RTF, or DOCX interchange. Bounded Paste
and ODT interchange cover the implemented attributes. The remaining gaps stay
explicit in `LO-WRITER-0109`; they are not browser-runtime exceptions.
