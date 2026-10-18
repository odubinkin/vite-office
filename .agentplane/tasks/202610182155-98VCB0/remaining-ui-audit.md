# Remaining Calc UI work after task20

The overall approved goal remains active. This task implements native formatobjectbar composition and actual reuse of Writer controls; it does not certify all Calc formatting behavior or complete browser/native parity.

- Formatting slots and document attribute ownership are not connected. Unavailable controls remain disabled and unknown font values remain blank. ScDocumentPool, EditTextObject prerequisites, attribute arrays and column/table/document integration still require source-backed implementation before enabling formatting.
- Native editable font controls, color/border/conditional palettes, contextual text-direction visibility and dropdown behaviors remain unfinished.
- Remaining UI work includes native cell context menus, status/input/view fidelity and mobile top-menu reachability. At390px the existing top menubar clips later menus. The formatting toolbar itself is confined to the viewport and leaves a usable grid.
- Current menu shortcuts already share both the actual CommandMenuBar renderer and office-ui-command-catalog conversion with Writer. Generated strings for every command common to Writer/Calc match. Browser inspection of the final built app confirmed Open Ctrl+O and Save As Ctrl+Shift+S in both applications with identical shortcut classes; Calc File/Edit opened successfully. This is direct evidence for the latest user report, not a claim about every external/stale running build.
- Keep all subsequent edits in this checkout on calc. No user branch integration. Next full regression cadence is task30; intervening tasks run whole Calc raw100percent coverage and affected modules.
