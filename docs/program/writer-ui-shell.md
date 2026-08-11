# LibreOffice-style Writer UI shell

The browser Writer workbench uses the familiar structural regions of
LibreOffice Writer while retaining Vite Office's existing indigo, slate, rounded,
and accessible design language. It is not a pixel-perfect copy of the native
application and does not claim visual or command parity.

[`WriterWorkspaceChrome`](../../apps/office/src/components/WriterWorkspaceChrome.tsx)
defines the durable UI placement contract:

- a Writer menu bar with the expected top-level menu locations;
- standard and formatting toolbars;
- a horizontal ruler region;
- a central page-like document canvas;
- a right properties sidebar; and
- a Writer status bar.

Implemented commands are placed in the standard toolbar through
[`WriterCommandToolbar`](../../apps/office/src/components/WriterCommandToolbar.tsx):
browser-local save/load, plain-text download, undo/redo, and paragraph append.
The existing editor renders in the document canvas. The formatting toolbar now
contains real left, center, right, and justified controls for the focused
paragraph; their current value appears in the properties sidebar. Paragraph
removal remains a contextual control because keyboard/range editing is not
implemented yet.

The menu items, remaining character-format controls, ruler, page count,
language indicator, and most Writer commands are visual placement contracts
only. They do not currently open menus, measure layout, or provide native
LibreOffice behavior. Each enabled capability must receive its own mapped
feature task and tests.

The Writer integration and Playwright tests assert named structural landmarks
and command placement rather than a brittle screenshot baseline. A separate
visual-regression task will define viewport, font, tolerance, and snapshot
policy when rendering behavior is sufficiently stable.
