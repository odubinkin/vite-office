/** @fileoverview Original current-controller/selection ownership through the actual model and complete concrete caller UNO components. These callers are not a native SfxBaseController or browser view port; no fake model/query/type provider or private registry setter is supplied. */
import { expect, it } from "vitest";
import { SfxBaseModel } from "./sfxbasemodel";
import { ScModelObj } from "../../../sc/inc/docuno";
import { ScDocument } from "../../../sc/inc/document";
import { ScDocShell } from "../../../sc/source/ui/docshell/docsh";
import { WeakImplHelper, type WeakImplHelperConstructor } from "../../../cppuhelper/inc/implbase";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { WeakReferenceHelper } from "../../../cppuhelper/source/weak";
import { OInterfaceContainerHelper3 } from "../../../comphelper/inc/interfacecontainer3";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NotInitializedException } from "../../../cppu/inc/com/sun/star/lang/NotInitializedException";
import { XController } from "../../../offapi/com/sun/star/frame/XController";
import type { XModel } from "../../../offapi/com/sun/star/frame/XModel";
import type { XFrame } from "../../../offapi/com/sun/star/frame/XFrame";
import {
  XSelectionSupplier,
  getCppuType as supplierType,
} from "../../../offapi/com/sun/star/view/XSelectionSupplier";
import {
  XSelectionChangeListener,
  getCppuType as changeType,
} from "../../../offapi/com/sun/star/view/XSelectionChangeListener";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Implements every XController/XComponent method on the caller's actual shared component base. @param Base - Genuine interface specialization. @returns Concrete caller controller. */
function withController(Base: WeakImplHelperConstructor) {
  /** Caller controller stores genuine model/frame/view-data/listener owners. */
  class Controller extends Base implements XController {
    private readonly model = new Reference<XModel>();
    private readonly frame = new Reference<XFrame>();
    private readonly data = new Any();
    private readonly listeners = new (OInterfaceContainerHelper3.specialize<XEventListener>(
      XEventListener,
    ))();
    private suspended = false;
    /** Owns the actual attached frame. @param frame - Borrowed frame. @returns Nothing. */ attachFrame(
      frame: Reference<XFrame>,
    ): void {
      this.frame.assign(frame);
    }
    /** Owns the actual attached model. @param model - Borrowed model. @returns Accepted. */ attachModel(
      model: Reference<XModel>,
    ): boolean {
      this.model.assign(model);
      return true;
    }
    /** Stores the caller's accepted suspension state. @param value - Requested state. @returns Accepted. */ suspend(
      value: boolean,
    ): boolean {
      this.suspended = value;
      return true;
    }
    /** Returns an owned caller view-data value. @returns Actual data. */ getViewData(): Any {
      return new Any(this.data);
    }
    /** Copies caller view data. @param value - Borrowed data. @returns Nothing. */ restoreViewData(
      value: Any,
    ): void {
      this.data.assign(value);
    }
    /** Returns an acquired attached model. @returns Actual model reference. */ getModel(): Reference<XModel> {
      return new Reference(this.model);
    }
    /** Returns an acquired attached frame. @returns Actual frame reference. */ getFrame(): Reference<XFrame> {
      return new Reference(this.frame);
    }
    /** Registers an actual disposal listener. @param listener - Borrowed listener. @returns Nothing. */ addEventListener(
      listener: Reference<XEventListener>,
    ): void {
      this.listeners.addInterface(listener);
    }
    /** Removes one actual disposal listener. @param listener - Borrowed listener. @returns Nothing. */ removeEventListener(
      listener: Reference<XEventListener>,
    ): void {
      this.listeners.removeInterface(listener);
    }
    /** Implements the caller component disposal callback boundary. @returns Nothing. */ dispose(): void {
      const owner = new Reference(this),
        event = new EventObject(owner);
      try {
        this.listeners.disposeAndClear(event);
      } finally {
        event.dispose();
        owner.dispose();
      }
    }
    /** Actual concrete caller observes its protected counter. @returns Count. */ count(): number {
      return this.m_refCount[0] as number;
    }
    /** Actual caller state observer. @returns Whether suspended. */ isSuspended(): boolean {
      return this.suspended;
    }
    /** Releases the caller's genuine owned fields at zero references. @returns Nothing. */ protected override destroy(): void {
      this.listeners.dispose();
      this.data.dispose();
      this.frame.dispose();
      this.model.dispose();
    }
  }
  return Controller;
}
const Plain = withController(WeakImplHelper.specialize(XController)),
  SelectionBase = withController(WeakImplHelper.specialize(XController, XSelectionSupplier));
/** Genuine caller controller additionally implements the complete declared selection supplier. */
class Selectable extends SelectionBase implements XSelectionSupplier {
  private readonly selection = new Any();
  private readonly selectionListeners =
    new (OInterfaceContainerHelper3.specialize<XSelectionChangeListener>(
      XSelectionChangeListener,
    ))();
  /** Actual caller may report its existing getSelection failure. */ failure: RuntimeException | null =
    null;
  /** Actual caller may reenter the model while obtaining its selection. */
  beforeSelection: (() => void) | null = null;
  /** Copies the selected actual Any and notifies real registered listeners. @param value - Borrowed selection. @returns Accepted. */ select(
    value: Any,
  ): boolean {
    this.selection.assign(value);
    const self = new Reference(this),
      event = new EventObject(self);
    try {
      this.selectionListeners.forEach(
        /** Calls the actual declared listener. @param listener - Actual listener. @returns Nothing. */ (
          listener,
        ) => (listener.get() as XSelectionChangeListener).selectionChanged(event),
      );
    } finally {
      event.dispose();
      self.dispose();
    }
    return true;
  }
  /** Returns the actual stored selection or its original caller failure. @returns Owned Any. */ getSelection(): Any {
    this.beforeSelection?.();
    if (this.failure !== null) throw this.failure;
    return new Any(this.selection);
  }
  /** Registers an actual selection listener. @param listener - Borrowed listener. @returns Nothing. */ addSelectionChangeListener(
    listener: Reference<XSelectionChangeListener>,
  ): void {
    this.selectionListeners.addInterface(listener);
  }
  /** Removes one actual selection listener. @param listener - Borrowed listener. @returns Nothing. */ removeSelectionChangeListener(
    listener: Reference<XSelectionChangeListener>,
  ): void {
    this.selectionListeners.removeInterface(listener);
  }
  /** Original caller-owned fields are destroyed before the inherited controller members. @returns Nothing. */ protected override destroy(): void {
    this.selectionListeners.dispose();
    this.selection.dispose();
    super.destroy();
  }
}
it("retains original current-controller copies and accepts unregistered assignment without IDL validation", /** No connectController/view-frame or private registry injection is used. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    controller = new Plain(),
    cr = new Reference(controller),
    controllerWeak = new WeakReferenceHelper(cr),
    empty = new Reference<XController>();
  try {
    const url = model.getURL(),
      initial = model.getCurrentController();
    expect(text(url)).toBe("");
    expect(initial.is()).toBe(false);
    initial.dispose();
    url.dispose();
    model.setCurrentController(cr);
    expect(controller.count()).toBe(2);
    const copied = model.getCurrentController();
    expect(copied.get()).toBe(controller);
    copied.clear();
    copied.dispose();
    expect(controller.count()).toBe(2);
    model.disconnectController(cr);
    const retained = model.getCurrentController();
    expect(retained.get()).toBe(controller);
    retained.dispose();
    const noSupplier = model.getCurrentSelection();
    expect(noSupplier.is()).toBe(false);
    noSupplier.dispose();
    model.setCurrentController(empty);
    expect(controller.count()).toBe(1);
    const noController = model.getCurrentSelection();
    expect(noController.is()).toBe(false);
    noController.dispose();
    model.setCurrentController(cr);
    cr.dispose();
    expect(controller.count()).toBe(1);
    owner.dispose();
    const deadController = controllerWeak.get();
    expect(deadController.is()).toBe(false);
    deadController.dispose();
  } finally {
    controllerWeak.dispose();
    cr.dispose();
    empty.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("uses the actual selection interface and Any extraction while retaining independent selected-object ownership", /** Actual selected root Reference survives controller selection replacement and model destruction. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    controller = new Selectable(),
    cr = new Reference(controller),
    object = new OWeakObject(),
    objectOwner = new Reference(object),
    weak = new WeakReferenceHelper(objectOwner),
    selection = new Any(objectOwner.getAddress(), ["Reference", "XInterface"]),
    wrong = new Any([7], "sal_Int32"),
    empty = new Any();
  try {
    expect(supplierType()).toBe(XSelectionSupplier.static_type());
    expect(supplierType(null)).toBe(XSelectionSupplier.static_type(null));
    expect(changeType()).toBe(XSelectionChangeListener.static_type());
    expect(changeType(null)).toBe(XSelectionChangeListener.static_type(null));
    controller.select(selection);
    selection.clear();
    objectOwner.dispose();
    model.setCurrentController(cr);
    const selected = model.getCurrentSelection();
    expect(selected.get()).toBe(object);
    controller.select(wrong);
    const rejected = model.getCurrentSelection();
    expect(rejected.is()).toBe(false);
    rejected.dispose();
    controller.select(empty);
    const absent = model.getCurrentSelection();
    expect(absent.is()).toBe(false);
    absent.dispose();
    model.Dispose();
    cr.dispose();
    expect(selected.get()).toBe(object);
    selected.dispose();
    const dead = weak.get();
    expect(dead.is()).toBe(false);
    dead.dispose();
  } finally {
    empty.dispose();
    wrong.dispose();
    selection.dispose();
    weak.dispose();
    objectOwner.dispose();
    cr.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("propagates the actual supplier failure after releasing controller/query temporaries", /** No replacement exception or document provider is introduced. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    controller = new Selectable(),
    cr = new Reference(controller),
    failure = new RuntimeException();
  try {
    model.setCurrentController(cr);
    controller.failure = failure;
    let caught: unknown;
    try {
      model.getCurrentSelection();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBe(failure);
    expect(controller.count()).toBe(2);
  } finally {
    controller.failure = null;
    failure.dispose();
    cr.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("retains fully-alive guards for resource, controller and selection methods", /** Actual options-only model remains uninitialized. @returns Nothing. */ () => {
  const model = new SfxBaseModel(null),
    owner = new Reference(model),
    empty = new Reference<XController>();
  try {
    for (const action of [
      /** Guarded resource getter. @returns Value. */ () => model.getURL(),
      /** Guarded controller getter. @returns Value. */ () => model.getCurrentController(),
      /** Guarded assignment. @returns Nothing. */ () => model.setCurrentController(empty),
      /** Guarded disconnect. @returns Nothing. */ () => model.disconnectController(empty),
      /** Guarded selection getter. @returns Value. */ () => model.getCurrentSelection(),
    ]) {
      let caught = false;
      try {
        action();
      } catch (error) {
        caught = true;
        expect(error).toBeInstanceOf(NotInitializedException);
        (error as NotInitializedException).dispose();
      }
      expect(caught).toBe(true);
    }
  } finally {
    empty.dispose();
    owner.dispose();
  }
});

it("holds the selected controller snapshot across reentrant current-controller replacement", /** Actual supplier callback clears the model's current owner while live query temporaries retain the old controller. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    controller = new Selectable(),
    cr = new Reference(controller),
    empty = new Reference<XController>(),
    object = new OWeakObject(),
    objectOwner = new Reference(object),
    selection = new Any(objectOwner.getAddress(), ["Reference", "XInterface"]);
  try {
    controller.select(selection);
    model.setCurrentController(cr);
    controller.beforeSelection =
      /** Real caller callback reenters the actual model API. @returns Nothing. */ () =>
        model.setCurrentController(empty);
    const selected = model.getCurrentSelection(),
      current = model.getCurrentController();
    try {
      expect(selected.get()).toBe(object);
      expect(current.is()).toBe(false);
      expect(controller.count()).toBe(1);
    } finally {
      current.dispose();
      selected.dispose();
    }
  } finally {
    controller.beforeSelection = null;
    selection.dispose();
    objectOwner.dispose();
    empty.dispose();
    cr.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
