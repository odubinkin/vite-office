/** @fileoverview Original ICU78.3 uresimp.h logical bundle/entry owners. Mutable byte storage projects inline/heap resource paths; native struct layout, allocator failures and freed-object access remain uncertified. */
import type { Resource } from "./uresbund";
import { ResourceData } from "./uresdata.package";
/** Original logical entry fields from uresimp.h. Native short-name buffer/hash addresses are immutable-string/Map projections. */
export class UResourceDataEntry {
  fName = "";
  readonly fPath: null = null;
  readonly fData = new ResourceData();
  fParent: UResourceDataEntry | null = null;
  fAlias: UResourceDataEntry | null = null;
  fPool: UResourceDataEntry | null = null;
  fBogus = 0;
  private countExisting = 0;
  /** Original uint32 reference count. @returns Native bits. */
  get fCountExisting(): number {
    return this.countExisting;
  }
  /** Original native unsigned assignment, including wrap on increment/decrement. @param value - New count. @returns Nothing. */
  set fCountExisting(value: number) {
    this.countExisting = value >>> 0;
  }
}

/** Native zero Resource token is the shared empty string. */
const zeroResource: Resource = { type: 0, value: "" };
/** Original one bundle owner. Construction projects initialized StackUResourceBundle storage. */
export class UResourceBundle {
  fData: UResourceDataEntry | null = null;
  fValidLocaleDataEntry: UResourceDataEntry | null = null;
  fHasFallback = false;
  fIsTopLevel = false;
  fIndex = 0;
  fSize = 0;
  fKey: string | null = null;
  fRes: Resource | null = zeroResource;
  readonly fResBuf = new Uint8Array(64);
  fResPath: Uint8Array | null = null;
  fResPathLen = 0;
  fVersion: string | null = null;
  /** Projects the source magic-field predicate, without claiming ABI layout. */
  isStackObject = true;
  /** Borrowed source resource token. @returns Raw node/bogus. */
  get resource(): Resource | null {
    return this.fRes;
  }
  /** Raw resource assignment. @param value - Node/bogus. @returns Nothing. */
  set resource(value: Resource | null) {
    this.fRes = value;
  }
  /** Borrowed canonical key. @returns Key/null. */
  get key(): string | null {
    return this.fKey;
  }
  /** Canonical key assignment. @param value - Key/null. @returns Nothing. */
  set key(value: string | null) {
    this.fKey = value;
  }
}
/** Original memset of reusable stack storage; the inline buffer retains its address. @param bundle - Actual owner. @returns Nothing. */
export function ures_initStackObject(bundle: UResourceBundle): void {
  bundle.fData = bundle.fValidLocaleDataEntry = null;
  bundle.fHasFallback = bundle.fIsTopLevel = false;
  bundle.fIndex = bundle.fSize = 0;
  bundle.fKey = null;
  bundle.fRes = zeroResource;
  bundle.fResBuf.fill(0);
  bundle.fResPath = null;
  bundle.fResPathLen = 0;
  bundle.fVersion = null;
  bundle.isStackObject = true;
}
