/** @fileoverview Consumed native Security/Scripting configuration flags for change export. */

/** Original security preference IDs consumed by Calc change tracking export. */
export enum EOption {
  DocWarnRemovePersonalInfo = 6,
  DocWarnKeepRedlineInfo = 7,
}

/** Consumed Security/Scripting values with their original configuration defaults. */
export interface SecurityOptionsSnapshot {
  readonly removePersonalInfoOnSaving: boolean;
  readonly keepRedlineInfoOnSaving: boolean;
}

/** Native defaults from Common.xcs. */
const settings = {
  removePersonalInfoOnSaving: false,
  keepRedlineInfoOnSaving: false,
};

/** Original option query on the active configuration store. @param option - Supported original option ID. @returns Current preference. */
export function IsOptionSet(option: EOption): boolean {
  return option === EOption.DocWarnRemovePersonalInfo
    ? settings.removePersonalInfoOnSaving
    : settings.keepRedlineInfoOnSaving;
}

/** Original option mutation on the active configuration store. @param option - Supported original option ID. @param enabled - Configured preference. @returns Nothing. */
export function SetOption(option: EOption, enabled: boolean): void {
  if (option === EOption.DocWarnRemovePersonalInfo) settings.removePersonalInfoOnSaving = enabled;
  else settings.keepRedlineInfoOnSaving = enabled;
}

/** Captures active security preferences for a filter running in a separate realm. @returns Cloneable active security values. */
export function captureSecurityOptions(): SecurityOptionsSnapshot {
  return {
    removePersonalInfoOnSaving: IsOptionSet(EOption.DocWarnRemovePersonalInfo),
    keepRedlineInfoOnSaving: IsOptionSet(EOption.DocWarnKeepRedlineInfo),
  };
}
