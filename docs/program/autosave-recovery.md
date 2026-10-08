# Browser persistence decision

Writer uses browser-local ODT as its primary saved document. AutoRecovery files,
recovery history, restore prompts, startup recovery, and cross-tab recovery leases
remain intentionally unsupported. `autorecovery.ts`, `recovery.ts`, and
`WriterRecoveryPrompt.tsx` are inert provenance markers, not pending parity work.

## Deliberate divergence from LibreOffice

The pinned LibreOffice defaults to a 10-minute timer that writes temporary ODF
recovery files. Saving directly to the original document is a separate option
that defaults to off. Its scheduler checks modified-since-last-save state,
postpones work until 10 seconds of user idle, and avoids concurrent UI saves.

Vite Office deliberately uses primary browser ODT storage instead. A modified
document becomes eligible 10 seconds after its first unsaved change. Once due,
the scheduler waits for one second without input, but writes after at most 30
seconds of continuous input. UI capture postpones the write until release.
Unmodified documents are skipped, and only one write per document runs at a
time. An IndexedDB transaction must finish before the shell advances its save
position. The Writer model and action-based undo history remain live while the
browser session is open; undo history is not encoded in the ODT.

The toolbar has no manual Save button. Ctrl/Meta+S immediately writes the current
document through the same browser-local storage path as autosave. Save As creates a separate named browser copy and adopts
it as the current primary document, leaving the previous copy in place. Editing
the title changes the primary copy's name atomically on the next immediate save.
An occupied title opens the same collision dialog as computer-file import: the
user may explicitly replace the existing browser record or accept/edit a
first-free indexed suggestion. If the edited alternative is also occupied, the
dialog repeats with its next indexed suggestion instead of silently failing.
Export is a download-only dialog with ODT and TXT choices. Open is a dialog listing browser
copies and accepting ODT or TXT from the computer. When an imported filename
matches a browser copy, Open pauses before replacing the active document and
asks whether to overwrite that exact browser record or save a separate copy.
The separate-copy field starts with the first available one-based suffix, such
as `Plan (1)` or `Running tracks (3)`. Nonempty imported files are saved to
IndexedDB immediately after that choice; empty imports are never persisted.

A newly created document remains memory-only until its trimmed body contains at
least two whitespace-delimited words. Its first browser title is those first two
words joined by one space, unless the user already renamed it. An occupied title
receives the same first-available parenthesized suffix. Save As appears only in
the File menu, not the toolbar.

These naming thresholds, collision choices, and storage differences are approved
product behavior. Parity audits must record them as intentional browser
divergences rather than replacing the scheduler, storage format, automatic
naming, or file dialogs with LibreOffice's desktop recovery workflow.
