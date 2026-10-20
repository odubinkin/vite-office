Original Calc UI goal remains active. Task14 replaces browser stored-cell snapshots with actual owning ScCellValue and deep same-position formula/token clones. Task13 supplies native input modification guards;task12 supplies native input modes/F2.

Next source-backed work:
- Native ScUndoEnterData/ScViewFunc/ScDocFunc ownership and selected-sheet group input,with correct per-sheet compilation and history.
- Formatting toolbar/native format services;sheet-group visual selection and source context menu.
- Native SelectAll/GetDataArea,clipboard,clear/edit operations and viewport/input-line/status fidelity.
- Formula relocation/foreign-document/name/external/group copy services,reference input,autocomplete and rich/multiline input require actual kernel services.
- Full UI/current-core resource and interaction audit remains required.

Keep shared Writer chrome,file dialogs,persistence and save/recovery deviations. Work only in vite-office-calc on calc;user merges. Each task runs allCalc100percent and related modules;next full suite task20.
