# LibreOffice-style Writer UI shell

The browser Writer workbench uses the familiar structural regions of
LibreOffice Writer while retaining Vite Office's existing indigo, slate, rounded,
and accessible design language. It is not a pixel-perfect copy of the native
application and does not claim visual or command parity.

[`WriterWorkspaceChrome`](../../apps/office/src/components/WriterWorkspaceChrome.tsx)
defines the durable UI placement contract:

- a Writer menu bar with the expected top-level menu locations;
- standard and formatting toolbars;
- a horizontal ruler region that **View → Rulers → Horizontal ruler** can hide;
- a central page-like document canvas;
- a right properties sidebar that the **View → Sidebar** command can hide; and
- a Writer status bar that **View → Status Bar** can hide.

Implemented commands are placed in the standard toolbar through
[`WriterCommandToolbar`](../../apps/office/src/components/WriterCommandToolbar.tsx):
browser-local save/load and undo/redo. The functional
[`WriterMenuBar`](../../apps/office/src/components/WriterMenuBar.tsx) also puts
each enabled command in its matching Writer menu. See
[Writer command placement](writer-command-placement.md) for pinned provenance.
**Edit → Select All** is a direct browser selection action: it selects the
complete current page-integrated document body without changing its serialized
paragraph model, transaction history, or browser-local snapshot. It has no
standard-toolbar control in this bounded Writer slice.
**Edit → Copy** and the standard-toolbar **Copy** button send the current native
selection to the browser clipboard without an application backend. They first
use the asynchronous browser Clipboard API and then use a local legacy fallback
when the browser denies or omits that API; neither path changes the document,
history, or local snapshot.
When the user hides the properties sidebar from **View → Sidebar**, the canvas
uses the released workspace width and the document, toolbars, and status bar
remain available. The preference is transient workspace chrome state: it does
not change the Writer document, its history, or browser-local snapshot.
The nested **View → Rulers → Horizontal ruler** check item similarly controls
only the existing measurement-ruler chrome and releases its row when hidden.
It does not add a toolbar control or alter document history, content, or local
snapshots.
The direct **View → Status Bar** check item controls only the existing status
feedback row. Hiding it leaves the document canvas and editing controls intact,
and it does not alter document history, content, or browser-local snapshots.
The existing editor renders as integrated editable paragraph blocks in the document canvas. The formatting toolbar now
contains real left, center, right, and justified controls for the focused
paragraph; their current value appears in the properties sidebar. The existing
Paragraph style selector likewise applies Default Paragraph Style or Heading 1
to the focused paragraph. The page does not display persistent paragraph action
buttons. Adjacent paragraph movement is in the formatting toolbar's Paragraph
Format menu, which follows Writer menubar placement without claiming
LibreOffice drag, range, or tracked-change movement. Whole-paragraph removal
has no browser UI until keyboard/range editing is explicitly implemented.

Every visible top-level menu is an interactive trigger. File, Edit, View,
Format, and Styles expose their bounded commands; Insert, Table, Tools, Window,
and Help instead open an explicit unavailable-command state until a separately
mapped feature task implements a command in that location. This prevents a
visible Writer menu label from becoming a dead control or implying an
unimplemented LibreOffice command. The menu bar deliberately keeps overflow
visible so positioned popups are not clipped below the toolbar row.

The remaining character-format controls, ruler, page count, language indicator,
and most Writer commands are visual placement contracts only. They do not yet
measure layout or provide native LibreOffice behavior. Each enabled capability
must receive its own mapped feature task and tests.

The Writer integration and Playwright tests assert named structural landmarks
and command placement rather than a brittle screenshot baseline. A separate
visual-regression task will define viewport, font, tolerance, and snapshot
policy when rendering behavior is sufficiently stable.
