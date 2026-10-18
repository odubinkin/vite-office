# Remaining Calc UI work after task21

The approved overall UI/core goal is incomplete. Task21 resolves mobile top-menubar clipping through native hidden-suffix parent-popup structure in the actual shared Writer/Calc component,with full resource reachability,keyboard/resize focus and real browser evidence.

- Calc formatting toolbar composition exists,but actual document attribute ownership/Sfx formatting slots remain unconnected. Controls correctly stay disabled with unknown values blank. Native palettes,editable font widgets,conditional formatting and direction-context behavior remain unfinished.
- Continue source-shaped kernel prerequisites for actual ScDocumentPool default package (including ScPageHFItem/EditTextObject/pool ownership),attribute arrays,column/table/document formatting integration and accepted command/history/serialization behavior. Preserve existing source contracts/defaults;do not enable placeholders.
- Cell context menu,input/status/view fidelity and other source-visible UI behavior still need actual implementation.
- Shared menus still have incomplete native hover-delay/mIgnoreFirstMove,mnemonic and platform behavior. New suffix projection reuses the current shared controller;it is not evidence of complete VCL menu parity. Pointer and keyboard routes are independently verified;do not infer untested mixed hover timing behavior.
- Task21 final evidence covers whole Calc100percent,affected shared/Writer checks,new geometry module100percent and20targeted browser cases accounted for across original run plus replay. Next full regression task30.
