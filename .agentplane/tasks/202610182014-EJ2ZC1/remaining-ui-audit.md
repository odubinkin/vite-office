Original Calc UI goal remains active. Task13 removes browser JSON equality gating and follows native input modification/Undo semantics;task12 supplied native TYPE/TABLE/TOP modes and original F2 slot.

Next source-backed work:
- Move actual cell input/action payload ownership toward ScCellValue,ScDocFunc and ScUndoEnterData contracts without simulating missing formula clone or EditEngine services.
- Apply input to the canonical selected-sheet group as native ScViewFunc EnterData does;retain correct per-sheet formula compilation and Undo ownership.
- Formatting toolbar and native format services;sheet-group visual styling and source context menu.
- Native SelectAll/GetDataArea,clipboard,clear/edit operations,viewport/input-line/status fidelity.
- Formula reference selection,autocomplete,rich/multiline and non-scalar navigation depend on actual native kernel services.
- Full current-core UI resource/interaction audit remains required.

Reuse actual shared Writer chrome,file dialogs and browser persistence deviations. Work only in vite-office-calc on calc;user merges. Each leaf runs allCalc100percent and related modules;full suite next task20.
