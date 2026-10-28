/** @fileoverview Real SfxBaseModel/ScModelObj XChild, native entry checks and shared weak/parent/subcomponent lifetimes. Full XModel, model factory, UNO close/dispose and SolarMutex behavior remain unverified. */
import { expect, it } from "vitest";
import { SfxBaseModel } from "./sfxbasemodel";
import { SfxModelSubComponent } from "../inc/docundomanager";
import { ScModelObj } from "../../../sc/inc/docuno";
import { ScDocument } from "../../../sc/inc/document";
import { ScDocShell } from "../../../sc/source/ui/docshell/docsh";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import {
  NotInitializedException,
  cppu_detail_getUnoType as notInitializedType,
  getCppuType as deprecatedExceptionType,
} from "../../../cppu/inc/com/sun/star/lang/NotInitializedException";
import { XChild, getCppuType as childType } from "../../../udkapi/com/sun/star/container/XChild";
import { XModel } from "../../../offapi/com/sun/star/frame/XModel";
import { XMultiServiceFactory } from "../../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import { WeakReferenceHelper } from "../../../cppuhelper/source/weak";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { typelib_TypeClass as C } from "../../../cppu/inc/typelib/typeclass";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_CompoundTypeDescription as P,
  type typelib_InterfaceTypeDescription as I,
} from "../../../cppu/inc/typelib/typedescription";
/** Inspects and destroys the actual caught UNO value, retaining the model through the original Context field. @param action - Original caller action. @param type - Expected generated exception class. @param model - Actual model identity. @returns Nothing. */
function entryFailure(
  action: () => void,
  type: typeof RuntimeException,
  model: SfxBaseModel,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    caught = true;
    expect(error).toBeInstanceOf(type);
    const value = error as RuntimeException;
    try {
      expect(text(value.Message)).toBe("");
      expect(value.Context.get()).toBe(model);
    } finally {
      value.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Native subcomponent caller exposes the original protected forwarding methods; no independent query/reference provider is installed. */
class SubComponent extends SfxModelSubComponent {
  /** Calls the original protected constructor from a concrete subcomponent caller. @param model - Actual borrowed model. @returns Subcomponent. */
  static create(model: SfxBaseModel): SubComponent {
    return new SubComponent(model);
  }
  /** Original concrete undo component's acquisition pattern. @returns Nothing. */
  acquire(): void {
    this.acquireModel();
  }
  /** Original concrete undo component's release pattern. @returns Nothing. */
  release(): void {
    this.releaseModel();
  }
  /** Exposes the source protected borrowed getter. @returns Actual model. */
  model(): SfxBaseModel {
    return this.getBaseModel();
  }
}
it("queries the actual implemented XChild identity and retains native normal type metadata", /** No full XModel or service-factory capability is advertised by the partial model. @returns Nothing. */ () => {
  const model = new SfxBaseModel(null),
    owner = new Reference(model),
    child = Reference.query(owner, XChild.static_type),
    missingModel = Reference.query(owner, XModel.static_type),
    missingFactory = Reference.query(owner, XMultiServiceFactory.static_type),
    descriptor: [D | null] = [null],
    type = XChild.static_type(),
    name = type.getTypeName();
  try {
    expect(child.get()).toBe(model);
    expect(missingModel.is()).toBe(false);
    expect(missingFactory.is()).toBe(false);
    expect(childType()).toBe(type);
    expect(childType(null)).toBe(type);
    expect(XChild.static_type(null)).toBe(type);
    expect(text(name)).toBe("com.sun.star.container.XChild");
    type.getDescription(descriptor);
    const iface = descriptor[0] as unknown as I,
      base = (iface.ppBaseTypes as I[])[0] as I,
      baseName = new OUString(base.aBase.pTypeName);
    try {
      expect(iface.aBase.bComplete).toBe(false);
      expect(iface.nBaseTypes).toBe(1);
      expect(text(baseName)).toBe("com.sun.star.uno.XInterface");
    } finally {
      baseName.dispose();
    }
  } finally {
    if (descriptor[0] !== null) typelib_typedescription_release(descriptor[0]);
    name.dispose();
    missingFactory.dispose();
    missingModel.dispose();
    child.dispose();
    owner.dispose();
  }
});
it("copies actual parent References and releases them before the listener-base destructor", /** Actual models and shared shell/document broadcasters provide lifetime evidence. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    baseline = shell.GetListenerCount(),
    model = new ScModelObj(shell),
    parent = new ScModelObj(shell),
    owner = new Reference(model),
    parentOwner = new Reference(parent),
    weak = new WeakReferenceHelper(parentOwner),
    empty = new Reference<XInterface>();
  try {
    const initial = model.getParent();
    expect(initial.is()).toBe(false);
    initial.dispose();
    model.MethodEntryCheck(false);
    model.MethodEntryCheck(true);
    model.setParent(parentOwner);
    parentOwner.dispose();
    const copied = model.getParent();
    expect(copied.get()).toBe(parent);
    model.setParent(empty);
    expect(shell.GetListenerCount()).toBe(baseline + 2);
    copied.dispose();
    expect(shell.GetListenerCount()).toBe(baseline + 1);
    const dead = weak.get();
    expect(dead.is()).toBe(false);
    dead.dispose();
    model.setParent(owner);
    const self = model.getParent();
    expect(self.get()).toBe(model);
    self.dispose();
    model.setParent(empty);
    owner.dispose();
    expect(shell.GetListenerCount()).toBe(baseline);
  } finally {
    empty.dispose();
    weak.dispose();
    parentOwner.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("permits parent assignment while initializing and preserves ordered disposed/initialization failures", /** Disposed cases inspect the existing explicit host destructor binding, not a claimed UNO close/dispose implementation or post-destruction C++ call. @returns Nothing. */ () => {
  const model = new SfxBaseModel(null),
    owner = new Reference(model),
    parent = new SfxBaseModel(null),
    parentOwner = new Reference(parent);
  try {
    model.MethodEntryCheck(false);
    model.setParent(parentOwner);
    entryFailure(
      /** Original fully-alive check. @returns Nothing. */ () => model.MethodEntryCheck(true),
      NotInitializedException,
      model,
    );
    entryFailure(
      /** Original parent-read guard. @returns Nothing. */ () => {
        model.getParent();
      },
      NotInitializedException,
      model,
    );
    model.Dispose();
    entryFailure(
      /** Original disposed precedence with initialization disabled. @returns Nothing. */ () =>
        model.MethodEntryCheck(false),
      DisposedException,
      model,
    );
    entryFailure(
      /** Original disposed precedence with initialization required. @returns Nothing. */ () =>
        model.MethodEntryCheck(true),
      DisposedException,
      model,
    );
    entryFailure(
      /** Assignment also rejects disposed state. @returns Nothing. */ () =>
        model.setParent(parentOwner),
      DisposedException,
      model,
    );
    entryFailure(
      /** Read also rejects disposed state. @returns Nothing. */ () => {
        model.getParent();
      },
      DisposedException,
      model,
    );
  } finally {
    owner.dispose();
    parentOwner.dispose();
  }
});
it("shares the original model lifetime and entry validation with a real native subcomponent caller", /** No second model counter or replacement document provider exists. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    baseline = shell.GetListenerCount(),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    sub = SubComponent.create(model);
  try {
    expect(sub.model()).toBe(model);
    sub.MethodEntryCheck();
    sub.acquire();
    owner.dispose();
    expect(shell.GetListenerCount()).toBe(baseline + 1);
    sub.MethodEntryCheck();
    sub.release();
    expect(shell.GetListenerCount()).toBe(baseline);
    const options = new SfxBaseModel(null),
      optionsOwner = new Reference(options),
      optionsSub = SubComponent.create(options);
    try {
      entryFailure(
        /** Original subcomponent always requires initialization. @returns Nothing. */ () =>
          optionsSub.MethodEntryCheck(),
        NotInitializedException,
        options,
      );
    } finally {
      optionsOwner.dispose();
    }
  } finally {
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("preserves generated NotInitializedException values, base metadata, copy and move ownership", /** Exercises actual generated factories and field owners without synthetic exception metadata. @returns Nothing. */ () => {
  const model = new SfxBaseModel(null),
    owner = new Reference(model),
    message = new OUString(Uint16Array.of(110, 111, 116, 0)),
    empty = new NotInitializedException(),
    value = new NotInitializedException(message, owner),
    copy = new NotInitializedException(value),
    moved = NotInitializedException.move(copy),
    type = notInitializedType(),
    name = type.getTypeName(),
    descriptor: [D | null] = [null];
  try {
    expect(value).toBeInstanceOf(RuntimeException);
    expect(text(empty.Message)).toBe("");
    expect(empty.Context.is()).toBe(false);
    expect(value.Context.get()).toBe(model);
    expect(moved.Context.get()).toBe(model);
    expect(copy.Context.is()).toBe(false);
    expect(moved.Message.pData).toBe(message.pData);
    expect(copy.Message.getLength()).toBe(0);
    expect(deprecatedExceptionType()).toBe(type);
    expect(notInitializedType()).toBe(type);
    expect(text(name)).toBe("com.sun.star.lang.NotInitializedException");
    expect(Number(type.getTypeClass())).toBe(C.EXCEPTION);
    type.getDescription(descriptor);
    const compound = descriptor[0] as unknown as P,
      base = compound.pBaseTypeDescription as P,
      baseName = new OUString(base.aBase.pTypeName);
    try {
      expect(compound.nMembers).toBe(0);
      expect(text(baseName)).toBe("com.sun.star.uno.RuntimeException");
    } finally {
      baseName.dispose();
    }
  } finally {
    if (descriptor[0] !== null) typelib_typedescription_release(descriptor[0]);
    name.dispose();
    moved.dispose();
    copy.dispose();
    value.dispose();
    empty.dispose();
    message.dispose();
    owner.dispose();
  }
});

it("destroys the parent member before the SfxListener base while revoking the actual weak reference first", /** Observes the native member/base destruction order through a genuine derived model destructor callback and actual broadcaster counts. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    baseline = shell.GetListenerCount(),
    observations: number[] = [],
    model = new ScModelObj(shell),
    owner = new Reference(model),
    weak = new WeakReferenceHelper(owner);
  /** Actual caller model adds a destructor observer; it does not replace model/query/type providers. */
  class Parent extends ScModelObj {
    /** Observes native zero-reference destruction before releasing this model's actual registrations. @returns Nothing. */
    protected override destroy(): void {
      const dead = weak.get();
      try {
        expect(dead.is()).toBe(false);
        observations.push(shell.GetListenerCount());
      } finally {
        dead.dispose();
      }
      super.destroy();
    }
  }
  const parent = new Parent(shell),
    parentOwner = new Reference(parent);
  try {
    model.setParent(parentOwner);
    parentOwner.dispose();
    owner.dispose();
    expect(observations).toEqual([baseline + 2]);
    expect(shell.GetListenerCount()).toBe(baseline);
  } finally {
    parentOwner.dispose();
    owner.dispose();
    weak.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
