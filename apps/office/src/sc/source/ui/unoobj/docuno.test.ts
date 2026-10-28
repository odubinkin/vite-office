/** @fileoverview Actual Calc document/shell/model registration and lifetime for OOXML model access. Full spreadsheet UNO/filter/services and cross-thread ownership remain unverified. */
import { expect, it } from "vitest";
import { ScModelObj } from "../../../inc/docuno";
import { ScDocument } from "../../../inc/document";
import { ScDocShell } from "../docshell/docsh";
import { SfxBaseModel } from "../../../../sfx2/source/doc/sfxbasemodel";
import { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import { SfxListener } from "../../../../svl/source/notify/lstner";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
it("registers the model on actual shell and document owners, then unregisters in destructor order", /** Real owner identity and native registered-source counts. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell);
  try {
    expect(model.GetDocument()).toBe(doc);
    expect(model.GetEmbeddedObject()).toBe(shell);
    expect(model.GetObjectShell()).toBe(shell);
    expect(model.IsInitialized()).toBe(true);
    expect(model.GetBroadcasterCount()).toBe(2);
    expect(model.IsListening(shell)).toBe(true);
    const uno = model.GetBroadcasterJOE(1);
    expect(uno).not.toBe(shell);
    expect(model.IsListening(uno)).toBe(true);
    uno.Broadcast(new SfxHint(SfxHintId.ScDataChanged));
    model.Dispose();
    expect(model.GetBroadcasterCount()).toBe(0);
    expect(model.GetObjectShell()).toBeNull();
    expect(model.IsInitialized()).toBe(false);
    // Native object is destroyed here; post-destructor inspection only verifies the explicit host cleanup binding.
  } finally {
    model.Dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("clears Calc's shell pointer on original document Dying before physical stores are cleared", /** Preserves native independent base-model and Calc shell references. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell);
  try {
    doc.Dispose();
    expect(model.GetDocument()).toBeNull();
    expect(model.GetEmbeddedObject()).toBeNull();
    expect(model.GetObjectShell()).toBe(shell);
    expect(model.GetBroadcasterCount()).toBe(1);
    expect(model.IsListening(shell)).toBe(true);
  } finally {
    model.Dispose();
    shell.Dispose();
  }
});
it("handles source options-only null construction and serial removal without a broadcaster", /** Exercises nullable original constructor/getter paths without fake document providers. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    model = new ScModelObj(null),
    listener = new SfxListener();
  try {
    expect(model.GetDocument()).toBeNull();
    expect(model.GetEmbeddedObject()).toBeNull();
    expect(model.GetObjectShell()).toBeNull();
    expect(model.IsInitialized()).toBe(false);
    expect(model.GetBroadcasterCount()).toBe(0);
    doc.RemoveUnoObject(listener);
    expect(listener.GetBroadcasterCount()).toBe(0);
    doc.AddUnoObject(listener);
    doc.RemoveUnoObject(listener);
    expect(listener.GetBroadcasterCount()).toBe(0);
    doc.AddUnoObject(listener);
    doc.Dispose();
    expect(listener.GetBroadcasterCount()).toBe(0);
  } finally {
    listener.Dispose();
    model.Dispose();
    doc.Dispose();
  }
});
it("shares the original lazily created document broadcaster across independent models", /** Real native listener registration remains document-owned. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    first = new ScModelObj(shell),
    second = new ScModelObj(shell);
  try {
    expect(first.GetBroadcasterJOE(1)).toBe(second.GetBroadcasterJOE(1));
    first.Dispose();
    expect(second.GetBroadcasterCount()).toBe(2);
    shell.Dispose();
    expect(second.GetDocument()).toBeNull();
    expect(second.GetEmbeddedObject()).toBeNull();
    expect(second.GetBroadcasterCount()).toBe(1);
  } finally {
    first.Dispose();
    second.Dispose();
    doc.Dispose();
  }
});
it("keeps base notification source/data guards and explicit unported service admission", /** Unsupported service guards are local admission checks, not native-equivalence witnesses. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new SfxBaseModel(shell),
    other = new SfxBroadcaster();
  try {
    model.Notify(other, new SfxHint(SfxHintId.DocChanged));
    model.Notify(shell, new SfxHint(SfxHintId.Dying));
    for (const id of [
      SfxHintId.DocChanged,
      SfxHintId.ThisIsAnSfxEventHint,
      SfxHintId.TitleChanged,
      SfxHintId.ModeChanged,
    ])
      expect(
        /** Exercises explicit unsupported local service admission only. @returns Nothing. */ () =>
          model.Notify(shell, new SfxHint(id)),
      ).toThrow("services are not implemented");
    model.Dispose();
    model.Notify(shell, new SfxHint(SfxHintId.DocChanged));
    const calc = new ScModelObj(shell);
    try {
      expect(
        /** Exercises explicit unsupported local service admission only. @returns Nothing. */ () =>
          calc.Notify(calc.GetBroadcasterJOE(1), new SfxHint(SfxHintId.DataChanged)),
      ).toThrow("services are not implemented");
    } finally {
      calc.Dispose();
    }
  } finally {
    model.Dispose();
    other.Dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
