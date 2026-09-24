# Sfx command dispatch

The supported command path follows the pinned Sfx ownership split. `SfxSlot` in
[`msg.ts`](../../apps/office/src/sfx2/source/control/msg.ts) owns immutable slot
identity and Execute/GetState callbacks. `SfxInterface` in
[`objface.ts`](../../apps/office/src/sfx2/source/control/objface.ts) owns the
generated slot map. [`shell.ts`](../../apps/office/src/sfx2/source/control/shell.ts)
binds that interface to a concrete shell context, and
[`dispatch.ts`](../../apps/office/src/sfx2/source/control/dispatch.ts) performs
only shell-stack resolution and `SfxRequest` execution.

Writer interface metadata is attached in
[`swriter.ts`](../../apps/office/src/sw/sdi/swriter.ts) from generated SDI, HRC,
XCU, and UI-resource data. Concrete Writer shell files retain command execution
and state. Upstream commands therefore require a generated numeric slot; the
dispatcher never manufactures one. Browser extensions use their separately
reserved IDs.

Shortcut normalization belongs to
[`keymapping.ts`](../../apps/office/src/framework/browser/accelerators/keymapping.ts).
Promise pending/error observation belongs to the browser-only
[`browser-dispatcher.ts`](../../apps/office/src/framework/browser/dispatch/browser-dispatcher.ts),
so core Sfx execution has no browser operation state.

Dispatch returns explicit `executed`, `disabled`, or `missing` outcomes. Menus,
toolbars, selectors, and accelerators resolve the same active slot and binding
state rather than maintaining a second command registry. `SfxControllerItem` in
[`ctrlitem.ts`](../../apps/office/src/sfx2/source/control/ctrlitem.ts) owns one
stable slot snapshot and one bindings subscription per visible control; the
browser hook disposes it with the presenter. Generated Writer menu placement is
used directly, without an additional handwritten command filter.
