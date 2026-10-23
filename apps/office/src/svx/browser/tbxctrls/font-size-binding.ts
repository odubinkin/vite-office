/** @fileoverview Persistent browser external-store binding of the actual numeric and toolbox font-size owners. */
import { FontSizeBox } from "../../../svtools/source/control/ctrlbox";
import { SvxFontSizeBox_Base } from "../../source/tbxctrls/tbunocontroller";
import {
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
} from "../../../unotools/source/misc/syslocale";
/** Actual frame status and execution ports of a mounted font combo. */
export interface FontSizeSelectProps {
  readonly value: unknown;
  readonly enabled: boolean;
  readonly label: string;
  readonly onSelect: (value: number) => void;
  readonly focusDocument?: () => void;
  readonly inSidebar?: boolean;
}
/** Retains native text independently from React renders and actual parent status assignments. */
export class FontSizeBinding {
  readonly owner: SvxFontSizeBox_Base;
  private readonly listeners = new Set<() => void>();
  private snapshot: string;
  /** Creates the actual source control pair and assigns initial frame state. @param configuration - Live frame binding. @returns Browser binding. */
  constructor(private configuration: FontSizeSelectProps) {
    this.owner = new SvxFontSizeBox_Base(
      new FontSizeBox(getSystemDecimalSeparator(), getSystemDecimalSeparatorAlternate()),
      /** Executes through the current frame port. @param value - Source float points. @returns Nothing. */ (
        value,
      ) => this.configuration.onSelect(value),
      /** Focuses the actual document container. @returns Nothing. */ () =>
        this.configuration.focusDocument?.(),
    );
    this.owner.UpdateFont();
    this.owner.statusChanged_Impl(
      Math.round(Number(configuration.value) * 10),
      configuration.value === undefined,
    );
    this.snapshot = this.owner.widget.get_active_text();
  }
  /** Updates platform callbacks without inventing a native status event on every React render. @param configuration - Current parent binding. @returns Nothing. */
  Update(configuration: FontSizeSelectProps): void {
    const changed = !Object.is(configuration.value, this.configuration.value);
    this.configuration = configuration;
    if (changed) {
      this.owner.statusChanged_Impl(
        Math.round(Number(configuration.value) * 10),
        configuration.value === undefined,
      );
      this.Publish();
    }
  }
  /** Publishes only changed source text after an actual widget event. @returns Nothing. */
  Publish(): void {
    const text = this.owner.widget.get_active_text();
    if (text === this.snapshot) return;
    this.snapshot = text;
    for (const listener of this.listeners) listener();
  }
  /** Retains original entry text without triggering direct-pick dispatch. @param text - Widget edit. @returns Nothing. */
  SetText(text: string): void {
    this.owner.widget.set_active_or_entry_text(text);
    this.owner.SelectHdl(false);
    this.Publish();
  }
  readonly GetSnapshot =
    /** Borrows stable native text for React's external-store boundary. @returns Current text. */ (): string =>
      this.snapshot;
  readonly Subscribe =
    /** Registers a mounted observer. @param listener - Observer. @returns Cleanup. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Removes this mounted subscription. @returns Nothing. */ () => {
        this.listeners.delete(listener);
      };
    };
}
