# Browser Writer command placement

Enabled Writer commands normally use their pinned LibreOffice menu and toolbar
locations. Browser file commands have the approved exceptions described below.
The browser workbench keeps its own indigo/slate visual language and does not
copy native menu pixels.

Current mappings are derived from pinned `libreoffice-26.8.0.2`:

The generated Writer UI manifest records the complete reviewed graph as an
explicit disposition for every encountered command reference: supported
upstream, browser extension, or excluded with source and reason. Supported
resources include generated labels, shortcuts, semantics, selection values,
validated Sifr icon names, and typed SDI argument schemas. Menus and toolbars
consume that generated order directly; no second handwritten allowlist filters
implemented commands.

- `sw/uiconfig/swriter/menubar/menubar.xml` places New, Open, Save, and Save As
  in **File**. The browser keeps **New**, **Open**, **Save As**, and **Export**
  there. Open selects a browser copy or imports ODT/TXT; Save As creates a
  separate browser copy; Export downloads ODT/TXT. Manual Save is absent because
  a nonempty document is saved automatically as a primary ODT package.
- The same file places Undo and Redo in **Edit**.
- It places `.uno:Cut`, `.uno:Copy`, and `.uno:Paste` in **Edit** and the
  standard toolbar. The browser **Copy** command writes sanitized visible plain
  text and bounded inline HTML through a browser-only clipboard adapter; it has
  no document-history transition. **Cut** writes that same data and then deletes
  a same-paragraph selection as one history transition. **Paste** reads plain
  text or bounded sanitized HTML with semantic emphasis, font family,
  foreground/highlight, paragraphs, and nested lists. Inline content inserts at
  a same-paragraph selection or caret; supported block/list fragments create
  Writer paragraphs through one undoable operation.
- It places `.uno:SelectAll` in **Edit**. The browser **Select All** command
  requests a native selection range over the current integrated Writer body; it
  has no standard-toolbar counterpart in this bounded slice. Native
  **Ctrl/Cmd+A** routes to this same action; arrow movement at paragraph
  boundaries and pointer drags crossing paragraphs continue through the
  bounded document body.
- It places `.uno:Sidebar` in **View**. The bounded browser **Sidebar** check
  item controls the existing properties-sidebar chrome and has no standard
  toolbar counterpart in this slice.
- It places `.uno:StatusBarVisible` directly in **View**. The browser **Status
  Bar** check item controls the existing status-bar chrome and has no standard
  toolbar counterpart in this slice.
- It nests `.uno:Ruler` under **View → Rulers**. The browser **Horizontal
  ruler** check item controls the existing horizontal-ruler chrome and likewise
  has no standard toolbar counterpart in this slice.
- It places alignment under **Format → Alignment**, and the nested
  `.uno:FormatBulletsMenu` contains `.uno:RemoveBullets`, `.uno:DefaultBullet`,
  and `.uno:DefaultNumbering`. The browser follows that nesting through
  **Format → Bullets and Numbering**. Its initial active-paragraph commands are
  **Remove Bullets**, **Unordered List**, **Ordered List**, **Demote**, and
  **Promote**. Demote and Promote are disabled outside a list and at the root or
  bounded deepest level respectively.
- It nests `.uno:Bold`, `.uno:Italic`, and `.uno:UnderlineSingle` under
  **Format → Text**. The browser provides the same three commands there and
  applies them to a native non-empty same-paragraph selection, or records a
  pending direct attribute at a collapsed caret. **Ctrl/Cmd+B**,
  **Ctrl/Cmd+I**, and **Ctrl/Cmd+U** invoke the same command shell.
- `WriterCommands.xcu` and the Writer pool declare the built-in style family;
  all 126 pinned paragraph-style choices are available through the generated
  style command family and formatting-toolbar selector.

Generated slot/interface metadata is assembled at the upstream-corresponding
`sw/sdi/swriter.ts` boundary. Execute and GetState handlers remain in the
dedicated `SwTextShell`, `SwListShell`, `SwViewCommandShell`, and thin browser
workflow shell; dispatcher priority is determined solely by the active Sfx
shell stack. `SwWrtShell` supplies cursor/edit operations and `SwView` supplies
frame/lifecycle coordination without a parallel Writer registry layer.

`sw/uiconfig/swriter/toolbar/standardbar.xml` supplies Open, Save, Cut, Copy,
Paste, Undo, and Redo. The browser toolbar retains Open, Cut, Copy, Paste,
Undo, and Redo. Save As appears only in **File**; manual Save is absent.
This placement is an approved browser divergence and must survive parity work.
The former **Add
paragraph** toolbar control was removed: normal Writer paragraph
creation is caret/Enter behavior, not a standalone toolbar command. The
implemented browser equivalent now intercepts unmodified **Enter** at a
collapsed editable-paragraph caret, splits the text into an adjacent paragraph,
inherits its bounded style, alignment, and list state, and focuses the trailing paragraph.
It intentionally has no menu or toolbar item. This follows Writer's normal
editing interaction; pinned upstream tests use
`ControlCharacter::PARAGRAPH_BREAK` in `sw/qa/**` to create the corresponding
document-model break.

`sw/uiconfig/swriter/toolbar/textobjectbar.xml` places `.uno:DefaultBullet`
and `.uno:DefaultNumbering` after the paragraph alignment controls. The same
toolbar also places `.uno:Bold`, `.uno:Italic`, and `.uno:UnderlineSingle`
before those paragraph controls; the browser keeps that order. There is no generic paragraph
movement control in the browser toolbar or menu: the previous adjacent-body
operation was not a placement-equivalent implementation of Writer list-item
movement and is now retained only as an unmapped document-model primitive for a
future, properly mapped capability.

`sw/uiconfig/swriter/toolbar/numobjectbar.xml` places `.uno:DecrementLevel`
and `.uno:IncrementLevel`. The browser renders their bounded equivalents next
to the default-list controls only as active-list commands: **Demote** increases
the active paragraph's zero-based nesting level, while **Promote** decreases
it. This preserves Writer placement without claiming its full list-level model.
