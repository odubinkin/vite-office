# Remaining Calc UI work after the first ten-task cycle

The overall user goal is still active. Current green checks prove the implemented slice,not complete LibreOffice Calc UI parity.

- Sheet grouping is owned by ScMarkData and correctly exposed as aria-selected in ScTabControl,but current tab colors depend only on the active sheet. Native grouped-sheet visual feedback and tab context-menu composition still need review.
- The production workbench supplies the shared standard toolbar but no formatting toolbar content. Native textobjectbar resources are generated/audited;their actual control composition and availability still need presentation work against current kernel capabilities.
- F2 starts inline input through the browser controller,while native SetInputMode in Edit remains unavailable. Native TABLE/TYPE input-mode distinction and source input-handler boundaries need implementation before enabling that slot.
- Row/column/all marks work through grid headers. Native SelectAll's SelectRangeBeforeAll default depends on core GetDataArea behavior;do not enable a simplified all-grid replacement for the original command.
- Clipboard,clear-content and editing command services must be matched to existing core ownership and undo contracts before enabling source menu entries.
- Native current-core viewport,formula/input line,status-bar,context-menu and keyboard behavior still require a broader requirement audit. Existing bounded fixed geometry and scalar filter support are explicit limitations.
- Hidden/alternate sheet views,formatting services,reference editing,drawing and unsupported document content remain unported. They cannot be inferred complete from disabled source menu projections.

Evidence inspected: apps/office/src/sc/browser/presentation/ScTabControl.tsx,calc-workbench.tsx,ScGridWindow.tsx;apps/office/src/sc/uiconfig/scalc/calc-ui.generated.json;vendor/libreoffice-reference/sc/source/ui/view/cellsh3.cxx,cellsh4.cxx;vendor/libreoffice-reference/sc/source/ui/app/inputhdl.cxx.
