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

Manual Save is absent. Save As creates a separate named browser copy and adopts
it as the current primary document, leaving the previous copy in place. Editing
the title changes the primary copy's name atomically on the next immediate save;
an occupied name is rejected without overwriting another document. Export is a
download-only dialog with ODT and TXT choices. Open is a dialog listing browser
copies and accepting ODT or TXT from the computer.
Nonempty imported files are saved to IndexedDB immediately after opening;
empty documents are never persisted. Save As appears only in the File menu,
not the toolbar.

These differences are approved product behavior. Parity audits must record them
as intentional browser divergences rather than replacing the scheduler, storage
format, or file dialogs with LibreOffice's desktop recovery workflow.
