/** @fileoverview Native SfxListener vector registrations from pinned svl/source/notify/lstner.cxx. */
import type { SfxHint } from "../../inc/hint";
import type { SfxBroadcaster } from "./SfxBroadcaster";

/** Original duplicate subscription policy. Unexpected duplicates violate the native assertion precondition. */
export enum DuplicateHandling {
  Unexpected,
  Prevent,
  Allow,
}

/** Native reciprocal listener with ordered, possibly repeated broadcaster registrations. */
export class SfxListener {
  private maBCs: SfxBroadcaster[] = [];
  /** Copies the full native registration vector, including duplicates. @param source - Optional copy source. @returns New native owner. */
  public constructor(source?: SfxListener) {
    if (source !== undefined) {
      this.maBCs = [...source.maBCs];
      for (let i = 0; i < this.maBCs.length; ++i)
        (this.maBCs[i] as SfxBroadcaster).AddListener(this);
    }
  }
  /** Starts a subscription with original duplicate handling. Public host methods represent the native friend declaration. @param broadcaster - Source. @param handling - Duplicate policy. @returns Nothing. */
  public StartListening(
    broadcaster: SfxBroadcaster,
    handling = DuplicateHandling.Unexpected,
  ): void {
    const already = handling !== DuplicateHandling.Allow && this.IsListening(broadcaster);
    if (already && handling === DuplicateHandling.Unexpected)
      throw new Error("Unexpected duplicate listener");
    if (!already || handling !== DuplicateHandling.Prevent) {
      broadcaster.AddListener(this);
      this.maBCs.push(broadcaster);
    }
  }
  /** Ends the first or all matching native registrations. @param broadcaster - Source. @param removeAllDuplicates - Whether all matching entries are removed. @returns Nothing. */
  public EndListening(broadcaster: SfxBroadcaster, removeAllDuplicates = false): void {
    for (
      let i = this.maBCs.indexOf(broadcaster);
      i !== -1;
      i = this.maBCs.indexOf(broadcaster, i)
    ) {
      broadcaster.RemoveListener(this);
      this.maBCs.splice(i, 1);
      if (!removeAllDuplicates) break;
    }
  }
  /** Moves out the registration vector before reciprocal removals, matching the native destructor helper. @returns Nothing. */
  public EndListeningAll(): void {
    const previous = this.maBCs;
    this.maBCs = [];
    for (const broadcaster of previous) broadcaster.RemoveListener(this);
  }
  /** Removes every dying-source entry without reciprocal removal. @param broadcaster - Dying source. @returns Nothing. */
  public RemoveBroadcaster_Impl(broadcaster: SfxBroadcaster): void {
    this.maBCs = this.maBCs.filter(
      /** Keeps other registrations. @param source - Registered source. @returns Whether retained. */
      (source) => source !== broadcaster,
    );
  }
  /** Original membership query. @param broadcaster - Source. @returns Whether registered. */
  public IsListening(broadcaster: SfxBroadcaster): boolean {
    return this.maBCs.includes(broadcaster);
  }
  /** Original sal_uInt16 count conversion. @returns Count modulo 65536. */
  public GetBroadcasterCount(): number {
    return this.maBCs.length & 0xffff;
  }
  /** Original indexed source access; valid index is a native precondition. @param index - Native uint16 index. @returns Source. */
  public GetBroadcasterJOE(index: number): SfxBroadcaster {
    return this.maBCs[index] as SfxBroadcaster;
  }
  /** Native base notification assertion. @param broadcaster - Source. @param _hint - Original hint. @returns Nothing. */
  public Notify(broadcaster: SfxBroadcaster, _hint: SfxHint): void {
    void _hint;
    if (!this.IsListening(broadcaster))
      throw new Error("SfxListener requires a registered broadcaster");
  }
  /** Original dynamic-type query. @returns False in the base class. */
  public IsSdrView(): boolean {
    return false;
  }
  /** Original dynamic-type query. @returns False in the base class. */
  public IsSwXStyle(): boolean {
    return false;
  }
  /** Explicit native listener destructor boundary. @returns Nothing. */
  public Dispose(): void {
    this.EndListeningAll();
  }
}
