/** @fileoverview Original CharacterClassificationImpl case dispatch, Unicode default and locale service cache. */
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { XCharacterClassification } from "../../../offapi/com/sun/star/i18n/XCharacterClassification";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getFallbackLocaleServiceNames, getFirstLocaleServiceName } from "../localedata/localedata";

/** Original lookup-table item owns its locale and acquired classifier. */
interface LookupTableItem {
  readonly aLocale: Locale;
  readonly aName: string;
  readonly xCI: Reference<XCharacterClassification>;
}

/** Original enclosing character classification service for case conversion. */
export class CharacterClassificationImpl
  extends WeakImplHelper.specialize(XCharacterClassification, XServiceInfo)
  implements XCharacterClassification, XServiceInfo
{
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly xUCI = new Reference<XCharacterClassification>();
  private readonly lookupTable: LookupTableItem[] = [];
  private cachedItem: LookupTableItem | undefined;

  /** Loads the original default Unicode component. @param context - Actual component context. @returns Classifier. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    const locale = new Locale();
    try {
      if (this.createLocaleSpecificCharacterClassification("Unicode", locale))
        this.xUCI.assign((this.cachedItem as LookupTableItem).xCI);
    } catch (error) {
      this.destroy();
      throw error;
    } finally {
      locale.dispose();
    }
  }

  /** Original locale-dispatched uppercase mapping. @param input - Counted input. @param pos - UTF-16 start. @param count - Requested length. @param locale - Native locale. @returns Owned result. */
  toUpper(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    return this.getLocaleSpecificCharacterClassification(locale).toUpper(input, pos, count, locale);
  }

  /** Original locale-dispatched lowercase mapping. @param input - Counted input. @param pos - UTF-16 start. @param count - Requested length. @param locale - Native locale. @returns Owned result. */
  toLower(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    return this.getLocaleSpecificCharacterClassification(locale).toLower(input, pos, count, locale);
  }

  /** Original locale-dispatched title mapping. @param input - Counted input. @param pos - UTF-16 start. @param count - Requested length. @param locale - Native locale. @returns Owned result. */
  toTitle(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    return this.getLocaleSpecificCharacterClassification(locale).toTitle(input, pos, count, locale);
  }

  /** Original service implementation name. @returns Owned name. */
  getImplementationName(): OUString {
    return unicode("com.sun.star.i18n.CharacterClassification");
  }

  /** Original shared service-name predicate. @param name - Requested service. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }

  /** Original advertised UNO service. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = this.getImplementationName();
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }

  /** Releases references and values owned by the native members. @returns Nothing. */
  protected override destroy(): void {
    for (const item of this.lookupTable) {
      item.xCI.dispose();
      item.aLocale.dispose();
    }
    this.xUCI.dispose();
    this.m_xContext.dispose();
    super.destroy();
  }

  /** Stores a copy of the requested locale and resolved classifier. @param locale - Actual locale. @param name - Native suffix. @param classifier - Acquired input reference. @returns Nothing. */
  private remember(
    locale: LocaleConstReference,
    name: string,
    classifier: Reference<XCharacterClassification>,
  ): void {
    this.cachedItem = { aLocale: new Locale(locale), aName: name, xCI: new Reference(classifier) };
    this.lookupTable.push(this.cachedItem);
  }

  /** Reuses a named component or resolves it through the original UNO context. @param name - Native service suffix. @param locale - Requested locale. @returns Whether the resolved component supplied the actual interface. */
  private createLocaleSpecificCharacterClassification(
    name: string,
    locale: LocaleConstReference,
  ): boolean {
    for (const item of this.lookupTable) {
      this.cachedItem = item;
      if (name === item.aName) {
        this.remember(locale, name, item.xCI);
        return true;
      }
    }
    const manager = this.m_xContext.operatorStar().getServiceManager();
    const service = unicode("com.sun.star.i18n.CharacterClassification_" + name);
    try {
      const instance = manager.operatorStar().createInstanceWithContext(service, this.m_xContext);
      try {
        if (!instance.is()) return false;
        const classifier = new Reference<XCharacterClassification>(
          instance,
          UNO_QUERY,
          XCharacterClassification.static_type,
        );
        try {
          if (!classifier.is()) return false;
          this.remember(locale, name, classifier);
          return true;
        } finally {
          classifier.dispose();
        }
      } finally {
        instance.dispose();
      }
    } finally {
      service.dispose();
      manager.dispose();
    }
  }

  /** Looks up the current, requested and fallback locales in the native order. @param locale - Actual requested locale. @returns Borrowed classifier interface. */
  private getLocaleSpecificCharacterClassification(
    locale: LocaleConstReference,
  ): XCharacterClassification {
    if (this.cachedItem?.aLocale.equals(locale)) return this.cachedItem.xCI.operatorStar();
    for (const item of this.lookupTable) {
      this.cachedItem = item;
      if (item.aLocale.equals(locale)) return item.xCI.operatorStar();
    }
    let loaded = this.createLocaleSpecificCharacterClassification(
      getFirstLocaleServiceName(locale),
      locale,
    );
    if (!loaded) {
      for (const fallback of getFallbackLocaleServiceNames(locale)) {
        loaded = this.createLocaleSpecificCharacterClassification(fallback, locale);
        if (loaded) break;
      }
    }
    if (loaded) return (this.cachedItem as LookupTableItem).xCI.operatorStar();
    if (this.xUCI.is()) {
      this.remember(locale, "Unicode", this.xUCI);
      return (this.cachedItem as LookupTableItem).xCI.operatorStar();
    }
    throw new RuntimeException();
  }
}

/** Original enclosing classifier constructor. @param context - Source component context. @param arguments_ - Unused arguments. @returns Acquired component. */
export function com_sun_star_i18n_CharacterClassification_get_implementation(
  context: XComponentContext | null,
  arguments_: Sequence<Any>,
): XInterface {
  void arguments_;
  const reference = new Reference(context);
  try {
    return acquire(new CharacterClassificationImpl(reference));
  } finally {
    reference.dispose();
  }
}
