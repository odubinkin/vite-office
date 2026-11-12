/** @fileoverview Complete original OPropertyBag service algorithms. Compiler multiple-inheritance binding shares one weak identity; OSL mutex scopes and native physical ABI are erased rather than emulated. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { OPropertyStateHelper } from "../../inc/propstate";
import { OMutexAndBroadcastHelper } from "../../inc/broadcasthelper";
import { OInterfaceContainerHelper3 } from "../../inc/interfacecontainer3";
import { PropertyBag } from "../../inc/propertybag";
import { NamedValueCollection } from "../../inc/namedvaluecollection";
import { concatSequences } from "../../inc/sequence";
import {
  OPropertyArrayHelper,
  PROPERTYSET_SELF_EVENT_HOOK,
} from "../../../cppuhelper/inc/propshlp";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XPropertyBag } from "../../../udkapi/com/sun/star/beans/XPropertyBag";
import { XSet } from "../../../udkapi/com/sun/star/container/XSet";
import type { XEnumeration } from "../../../udkapi/com/sun/star/container/XEnumeration";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as valueType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  BOUND,
  REMOVABLE,
  MAYBEDEFAULT,
} from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign } from "../../../sal/rtl/ustring";
import type { rtl_uStringSlot, rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_ustr_compare } from "../../../sal/inc/rtl/ustring.h";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
const WeakBase = WeakImplHelper.specialize(
    XPropertyBag,
    XModifiable,
    XServiceInfo,
    XInitialization,
    XSet,
  ),
  PBase = OPropertyStateHelper.specialize(WeakBase),
  Types = Sequence.specialize<Type>("Type", 8),
  Names = Sequence.specialize<OUString>("OUString", 8),
  Properties = Sequence.specialize<Property>(propertyType, 32),
  Values = Sequence.specialize<PropertyValue>(valueType, 48),
  Anys = Sequence.specialize<Any>("Any", 24),
  Handles = Sequence.specialize<number>("sal_Int32", 4),
  Listeners = OInterfaceContainerHelper3.specialize<XModifyListener>(XModifyListener);
/** Original source ASCII literal. @param text - Literal. @returns Owned string. */
function literal(text: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(text + "\0"));
}
/** Original UnoTypeLess compares null-terminated type names. */
export class UnoTypeLess {
  /** Original operator(). @param left - Type. @param right - Type. @returns Strict order. */
  call(left: Type, right: Type): boolean {
    return (
      rtl_ustr_compare(
        (left.getTypeLibType() as R).pTypeName.buffer,
        (right.getTypeLibType() as R).pTypeName.buffer,
      ) < 0
    );
  }
}
const less = new UnoTypeLess();
/** Original full dynamic property UNO service. */
export class OPropertyBag
  extends PBase
  implements XPropertyBag, XModifiable, XServiceInfo, XInitialization, XSet
{
  private readonly broadcastBase: OMutexAndBroadcastHelper;
  private m_pArrayHelper: OPropertyArrayHelper | null = null;
  private readonly m_aDynamicProperties = new PropertyBag();
  private readonly m_aAllowedTypes: Type[] = [];
  private readonly m_bAutoAddProperties: [boolean] = [false];
  private readonly m_NotifyListeners = new Listeners();
  private m_isModified = false;
  /** Original actual broadcast base precedes its dependent property facet. @returns Service. */
  constructor() {
    const base = new OMutexAndBroadcastHelper();
    super(base.GetBroadcastHelper(), PROPERTYSET_SELF_EVENT_HOOK);
    this.broadcastBase = base;
  }
  /** Original reverse member and base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_NotifyListeners.dispose();
    for (const type of this.m_aAllowedTypes) type.dispose();
    this.m_aDynamicProperties.dispose();
    this.m_pArrayHelper?.dispose();
    this.destroyPropertySetRoot();
    this.destroyPropertySetHelper();
    this.broadcastBase.dispose();
  }
  /** Original weak base query precedes the state helper. @param type - Type. @returns Owned Any. */
  override queryInterface(type: Type): Any {
    const result = WeakBase.prototype.queryInterface.call(this, type);
    if (result.hasValue()) return result;
    result.dispose();
    return PBase.prototype.queryInterface.call(this, type);
  }
  /** Original weak and static property-state type lists concatenate without deduplication. @returns Owned types. */
  override getTypes(): Sequence<Type> {
    const weak = WeakBase.prototype.getTypes.call(this),
      state = PBase.getTypes();
    try {
      return concatSequences(Types, weak, state);
    } finally {
      state.dispose();
      weak.dispose();
    }
  }
  /** Original obsolete identifier. @returns Empty sequence. */
  getImplementationId(): Sequence<number> {
    return new (Sequence.specialize<number>("sal_Int8", 1))();
  }
  /** Original qualified weak acquire. @returns Nothing. */
  override acquire(): void {
    WeakBase.prototype.acquire.call(this);
  }
  /** Original qualified weak release. @returns Nothing. */
  override release(): void {
    WeakBase.prototype.release.call(this);
  }
  /** Original set union owns each distinct type by comparator equivalence. @param types - Native sequence. @returns Nothing. */
  private insertTypes(types: Sequence<Type>): void {
    for (let i = 0; i < types.getLength(); ++i) {
      const candidate = new Type(types.operatorIndex(i));
      let at = 0;
      while (
        at < this.m_aAllowedTypes.length &&
        less.call(this.m_aAllowedTypes[at] as Type, candidate)
      )
        ++at;
      if (
        at === this.m_aAllowedTypes.length ||
        less.call(candidate, this.m_aAllowedTypes[at] as Type)
      )
        this.m_aAllowedTypes.splice(at, 0, candidate);
      else candidate.dispose();
    }
  }
  /** Original comparator-based set membership. @param type - Type. @returns Allowed. */
  private allows(type: Type): boolean {
    return (
      this.m_aAllowedTypes.length === 0 ||
      this.m_aAllowedTypes.some(
        /** Compares the declared type by the original strict ordering. @param entry - Declared source operand. @returns Original operation result. */ (
          entry,
        ) => !less.call(entry, type) && !less.call(type, entry),
      )
    );
  }
  /** Original positional constructor arguments or NamedValueCollection, including repeated-initialization union/sticky empty-name flag. @param args - Actual initialization arguments. @returns Nothing. */
  initialize(args: Sequence<Any>): void {
    const types = new Types(),
      empty: [boolean] = [false],
      automatic: [boolean] = [false];
    try {
      if (
        args.getLength() === 3 &&
        Any.prototype.extract.call(args.operatorIndex(0), types.getAddress(), [
          "Sequence",
          "Type",
        ]) &&
        Any.prototype.extract.call(args.operatorIndex(1), empty, "bool") &&
        Any.prototype.extract.call(args.operatorIndex(2), automatic, "bool")
      ) {
        this.insertTypes(types);
        this.m_bAutoAddProperties[0] = automatic[0];
      } else {
        const collection = new NamedValueCollection(args, "Any"),
          allowedName = literal("AllowedTypes"),
          automaticName = literal("AutomaticAddition"),
          emptyName = literal("AllowEmptyPropertyName");
        try {
          if (
            collection.get_ensureType(
              allowedName,
              types.getAddress(),
              UnoType.get(["Sequence", "Type"]),
            )
          )
            this.insertTypes(types);
          collection.get_ensureType(automaticName, this.m_bAutoAddProperties, UnoType.get("bool"));
          collection.get_ensureType(emptyName, empty, UnoType.get("bool"));
        } finally {
          emptyName.dispose();
          automaticName.dispose();
          allowedName.dispose();
          collection.dispose();
        }
      }
      if (empty[0]) this.m_aDynamicProperties.setAllowEmptyPropertyName(true);
    } finally {
      types.dispose();
    }
  }
  /** Original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.comphelper.OPropertyBag");
  }
  /** Original supportsService helper. @param name - Service name. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }
  /** Original one supported service. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.beans.PropertyBag");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            name.getDataAddress(),
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original hook runs for every non-vetoable nonempty batch before attribute filtering. @param handles - Ignored handles. @param count - Count. @param vetoable - Veto flag. @param ignoreRuntime - Ignore runtime exceptions. @returns Nothing. */
  fireEvents(
    handles: readonly number[],
    count: number,
    vetoable: boolean,
    ignoreRuntime: boolean,
  ): void {
    void handles;
    if (count && !vetoable) this.setModifiedImpl(true, ignoreRuntime);
  }
  /** Original flag assignment then notification, even if already true. @param modified - Flag. @param ignoreRuntime - Original firing policy. @returns Nothing. */
  private setModifiedImpl(modified: boolean, ignoreRuntime: boolean): void {
    this.m_isModified = modified;
    if (!modified) return;
    try {
      const self = new Reference<XInterface>(this),
        event = new EventObject(self);
      try {
        this.m_NotifyListeners.notifyEach(
          /** Invokes the original XModifyListener member pointer. @param this - Actual source listener. @param value - Declared source operand. @returns Nothing. */ function (
            this: XModifyListener,
            value: EventObject,
          ): void {
            this.modified(value);
          },
          event,
        );
      } finally {
        event.dispose();
        self.dispose();
      }
    } catch (error) {
      if (error instanceof RuntimeException) {
        if (!ignoreRuntime) throw error;
        error.dispose();
      } else if (error instanceof Exception) error.dispose();
      else throw error;
    }
  }
  /** Original flag getter. @returns Modified. */
  isModified(): boolean {
    return this.m_isModified;
  }
  /** Original explicit modification. @param modified - Flag. @returns Nothing. */
  setModified(modified: boolean): void {
    this.setModifiedImpl(modified, false);
  }
  /** Original listener insertion. @param listener - Listener. @returns Nothing. */
  addModifyListener(listener: Reference<XModifyListener>): void {
    this.m_NotifyListeners.addInterface(listener);
  }
  /** Original listener removal. @param listener - Listener. @returns Nothing. */
  removeModifyListener(listener: Reference<XModifyListener>): void {
    this.m_NotifyListeners.removeInterface(listener);
  }
  /** Original immutable descriptor snapshot component. @returns Acquired info. */
  getPropertySetInfo() {
    return PBase.createPropertySetInfo(this.getInfoHelper());
  }
  /** Original lazy descriptor rebuild. @returns Actual helper. */
  protected override getInfoHelper(): OPropertyArrayHelper {
    if (!this.m_pArrayHelper) {
      const properties = new Properties();
      try {
        this.m_aDynamicProperties.describeProperties(properties);
        this.m_pArrayHelper = new OPropertyArrayHelper(properties);
      } finally {
        properties.dispose();
      }
    }
    return this.m_pArrayHelper;
  }
  /** Original unique_ptr reset. @returns Nothing. */
  private invalidateInfo(): void {
    this.m_pArrayHelper?.dispose();
    this.m_pArrayHelper = null;
  }
  /** Original prime/seed cycle followed by linear search. @returns Free handle. */
  private findFreeHandle(): number {
    let check = 11;
    while (this.m_aDynamicProperties.hasPropertyByHandle(check) && check !== 1)
      check = (check * 11) % 1009;
    if (check === 1) while (this.m_aDynamicProperties.hasPropertyByHandle(check)) ++check;
    return check;
  }
  /** Original allowed-type check, dynamic insertion, info invalidation and modification. @param name - Name. @param attributes - Attributes. @param initial - Initial value. @returns Nothing. */
  addProperty(name: OUStringConstReference, attributes: number, initial: Any): void {
    if (
      Any.prototype.hasValue.call(initial) &&
      !this.allows(Any.prototype.getValueType.call(initial))
    ) {
      const message = new OUString(),
        self = new Reference(this);
      try {
        throw new IllegalTypeException(message, self);
      } finally {
        self.dispose();
        message.dispose();
      }
    }
    this.m_aDynamicProperties.addProperty(name, this.findFreeHandle(), attributes, initial);
    this.invalidateInfo();
    this.setModified(true);
  }
  /** Original removal and modification. @param name - Name. @returns Nothing. */
  removeProperty(name: OUStringConstReference): void {
    this.m_aDynamicProperties.removeProperty(name);
    this.invalidateInfo();
    this.setModified(true);
  }
  /** Original XSet workaround always false. @param element - Ignored. @returns False. */
  has(element: Any): boolean {
    void element;
    return false;
  }
  /** Original default-void insertion through actual Property extraction. @param element - Property Any. @returns Nothing. */
  insert(element: Any): void {
    const property = new Property();
    try {
      if (!Any.prototype.extract.call(element, property, propertyType))
        this.illegal("element is not Property");
      if (!this.allows(property.Type)) this.illegal("not in list of allowed types");
      this.m_aDynamicProperties.addVoidProperty(
        property.Name,
        property.Type,
        this.findFreeHandle(),
        property.Attributes,
      );
      this.invalidateInfo();
    } finally {
      property.dispose();
    }
    this.setModified(true);
  }
  /** Original IllegalArgumentException with self context and argument one. @param text - Source literal. @returns Never. */
  private illegal(text: string): never {
    const message = literal(text),
      self = new Reference(this);
    try {
      throw new IllegalArgumentException(message, self, 1);
    } finally {
      self.dispose();
      message.dispose();
    }
  }
  /** Original unsupported XSet removal. @param element - Ignored. @returns Never. */
  remove(element: Any): never {
    void element;
    const message = new OUString(),
      self = new Reference(this);
    try {
      throw new NoSuchElementException(message, self);
    } finally {
      self.dispose();
      message.dispose();
    }
  }
  /** Original empty enumeration. @returns Empty reference. */
  createEnumeration(): Reference<XEnumeration> {
    return new Reference<XEnumeration>();
  }
  /** Original VOID element type. @returns Owned type. */
  getElementType(): Type {
    return new Type();
  }
  /** Original workaround does not expose membership. @returns False. */
  hasElements(): boolean {
    return false;
  }
  /** Original actual value getter callback. @param value - Output. @param handle - Handle. @returns Nothing. */
  protected override readFastPropertyValue(value: Any, handle: number): void {
    this.m_aDynamicProperties.getFastPropertyValue(handle, value);
  }
  /** Original actual conversion callback. @param converted - Output. @param old - Output. @param handle - Handle. @param value - Input. @returns Changed. */
  protected override convertFastPropertyValue(
    converted: Any,
    old: Any,
    handle: number,
    value: Any,
  ): boolean {
    return this.m_aDynamicProperties.convertFastPropertyValue(handle, value, converted, old);
  }
  /** Original nonbroadcast assignment callback. @param handle - Handle. @param value - Value. @returns Nothing. */
  protected override setFastPropertyValue_NoBroadcast(handle: number, value: Any): void {
    this.m_aDynamicProperties.setFastPropertyValue(handle, value);
  }
  /** Original MAYBEDEFAULT gate, including zero attributes after an invalid diagnostic-only handle lookup. @param handle - Handle. @returns State. */
  override getPropertyStateByHandle(handle: number): PropertyState {
    const attributes: [number] = [0];
    this.getInfoHelper().fillPropertyMembersByHandle(null, attributes, handle);
    return attributes[0] & MAYBEDEFAULT
      ? super.getPropertyStateByHandle(handle)
      : PropertyState.DIRECT_VALUE;
  }
  /** Original actual stored default. @param handle - Handle. @returns Owned Any. */
  override getPropertyDefaultByHandle(handle: number): Any {
    const output = new Any();
    try {
      this.m_aDynamicProperties.getPropertyDefaultByHandle(handle, output);
      return output;
    } catch (error) {
      output.dispose();
      throw error;
    }
  }
  /** Original XPropertyAccess overload. @returns Owned property values. */
  override getPropertyValues(): Sequence<PropertyValue>;
  /** Original inherited XMultiPropertySet overload. @param names - Names. @returns Owned values. */
  override getPropertyValues(names: Sequence<OUString>): Sequence<Any>;
  /** Native overload selection by declared argument count. @param names - Optional original multi-property overload. @returns Owned native sequence. */
  override getPropertyValues(names?: Sequence<OUString>): Sequence<PropertyValue> | Sequence<Any> {
    if (names !== undefined) return super.getPropertyValues(names);
    const properties = new Properties();
    let values = new Anys();
    let namesLocal: Sequence<OUString> | undefined;
    try {
      this.m_aDynamicProperties.describeProperties(properties);
      namesLocal = new Names(properties.getLength());
      for (let i = 0; i < properties.getLength(); ++i) {
        const property = Property.unacquired(
          properties.operatorIndex(i) as { get(offset: number): unknown },
        );
        rtl_uString_assign(
          namesLocal.operatorIndex(i) as unknown as rtl_uStringSlot,
          property.Name.pData as rtl_uString,
        );
      }
      try {
        const obtained = super.getPropertyValues(namesLocal);
        values.dispose();
        values = obtained;
        if (values.getLength() !== namesLocal.getLength()) {
          const message = literal("property name and value counts out of sync"),
            context = new Reference();
          try {
            throw new RuntimeException(message, context);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
      } catch (error) {
        if (error instanceof RuntimeException || !(error instanceof Exception)) throw error;
        error.dispose();
      }
      const info = this.getInfoHelper(),
        output = new Values(namesLocal.getLength());
      try {
        for (let i = 0; i < namesLocal.getLength(); ++i) {
          const name = OUString.unacquired(
              namesLocal.operatorIndex(i) as unknown as rtl_uStringSlot,
            ),
            handle = info.getHandleByName(name),
            item = new PropertyValue();
          try {
            item.Name = name;
            item.Handle = handle;
            item.Value = values.operatorIndex(i);
            item.State = this.getPropertyStateByHandle(handle);
            this.assignValue(output.operatorIndex(i), item);
          } finally {
            item.dispose();
          }
        }
        return output;
      } catch (error) {
        output.dispose();
        throw error;
      }
    } finally {
      namesLocal?.dispose();
      values.dispose();
      properties.dispose();
    }
  }
  /** Original generated PropertyValue assignment. @param destination - Initialized native slot. @param source - Value owner. @returns Nothing. */
  private assignValue(destination: unknown, source: PropertyValue): void {
    const type = valueType().getTypeLibType() as R;
    uno_type_assignData(
      destination,
      type,
      source,
      type,
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    );
  }
  /** Original XPropertyAccess setter. @param properties - Input. @returns Nothing. */
  override setPropertyValues(properties: Sequence<PropertyValue>): void;
  /** Original inherited multi-property setter. @param names - Names. @param values - Values. @returns Nothing. */
  override setPropertyValues(names: Sequence<OUString>, values: Sequence<Any>): void;
  /** Native overload count chooses original implementation. @param source - Property sequence or names. @param values - Multi-property values. @returns Nothing. */
  override setPropertyValues(
    source: Sequence<PropertyValue> | Sequence<OUString>,
    values?: Sequence<Any>,
  ): void {
    if (values !== undefined) {
      super.setPropertyValues(source as Sequence<OUString>, values);
      return;
    }
    this.impl_setPropertyValues_throw(source as Sequence<PropertyValue>);
  }
  /** Original COW sort, unknown-property precheck, optional addition, and normalized fast batch assignment. @param source - Property sequence. @returns Nothing. */
  private impl_setPropertyValues_throw(source: Sequence<PropertyValue>): void {
    const properties = new Values(source),
      owned: PropertyValue[] = [];
    try {
      for (let i = 0; i < properties.getLength(); ++i)
        owned.push(
          new PropertyValue(
            PropertyValue.unacquired(
              properties.operatorIndex(i) as { get(offset: number): unknown },
            ),
          ),
        );
      owned.sort(
        /** Compares property names in original UTF16 order. @param a - Declared source operand. @param b - Declared source operand. @returns Original operation result. */ (
          a,
          b,
        ) => a.Name.compareTo(b.Name),
      );
      properties.getArray();
      for (let i = 0; i < owned.length; ++i)
        this.assignValue(properties.operatorIndex(i), owned[i] as PropertyValue);
      const names = new Names(properties.getLength()),
        handles = new Handles(properties.getLength()),
        values = new Anys(properties.getLength());
      try {
        for (let i = 0; i < properties.getLength(); ++i) {
          const item = PropertyValue.unacquired(
            properties.operatorIndex(i) as { get(offset: number): unknown },
          );
          rtl_uString_assign(
            names.operatorIndex(i) as unknown as rtl_uStringSlot,
            item.Name.pData as rtl_uString,
          );
        }
        try {
          const mapped: number[] = [];
          for (let i = 0; i < names.getLength(); ++i) {
            const name = OUString.unacquired(names.operatorIndex(i) as unknown as rtl_uStringSlot),
              handle = this.getInfoHelper().getHandleByName(name);
            (handles.operatorIndex(i) as unknown as [number])[0] = handle;
            mapped.push(handle);
            if (handle !== -1) continue;
            if (this.m_bAutoAddProperties[0]) {
              this.addProperty(
                name,
                BOUND | REMOVABLE | MAYBEDEFAULT,
                PropertyValue.unacquired(
                  properties.operatorIndex(i) as { get(offset: number): unknown },
                ).Value as Any,
              );
              continue;
            }
            const self = new Reference(this);
            try {
              throw new UnknownPropertyException(name, self);
            } finally {
              self.dispose();
            }
          }
          const requested: Any[] = [];
          for (let i = 0; i < properties.getLength(); ++i) {
            const item = PropertyValue.unacquired(
              properties.operatorIndex(i) as { get(offset: number): unknown },
            );
            Any.prototype.assign.call(values.operatorIndex(i), item.Value as Any);
            requested.push(values.operatorIndex(i));
          }
          this.setFastPropertyValues(names.getLength(), mapped, requested, names.getLength());
        } catch (error) {
          if (
            error instanceof PropertyVetoException ||
            error instanceof IllegalArgumentException ||
            error instanceof WrappedTargetException ||
            error instanceof RuntimeException ||
            error instanceof UnknownPropertyException ||
            !(error instanceof Exception)
          )
            throw error;
          try {
            return withCaughtException(
              error,
              /** Copies the actual source Unicode name. @returns Original operation result. */ () => {
                const message = new OUString(),
                  self = new Reference(this),
                  caught = getCaughtException();
                try {
                  throw new WrappedTargetException(message, self, caught);
                } finally {
                  caught.dispose();
                  self.dispose();
                  message.dispose();
                }
              },
            );
          } finally {
            error.dispose();
          }
        }
      } finally {
        values.dispose();
        handles.dispose();
        names.dispose();
      }
    } finally {
      for (const item of owned) item.dispose();
      properties.dispose();
    }
  }
}
/** Original acquired factory ignores arguments; the real service manager supplies XInitialization. @param context - Ignored context. @param args - Ignored arguments. @returns Acquired service. */
export function com_sun_star_comp_comphelper_OPropertyBag(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new OPropertyBag());
}
