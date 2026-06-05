// ============================================================================
// @kayforms/devtools — Public API
// ============================================================================
// Simple one-line setup: import and call connectDevTools(form) to get a
// floating debug panel with time-travel.
// ============================================================================

import { createDevTools, type DevToolsBridge, type FormStore, type DevToolsConfig } from "@kayforms/core";
import { createPanel, type PanelOptions } from "./panel";

export { createPanel, type PanelOptions } from "./panel";
export { DEVTOOLS_STYLES } from "./styles";

// ---------------------------------------------------------------------------
// connectDevTools — One-line setup
// ---------------------------------------------------------------------------

export interface ConnectOptions extends DevToolsConfig, PanelOptions {}

/**
 * Connect one or more forms to the Kayforms DevTools panel.
 * Opens a floating debug panel with time-travel debugging.
 *
 * @example
 * ```ts
 * import { createForm } from '@kayforms/core';
 * import { connectDevTools } from '@kayforms/devtools';
 *
 * const form = createForm({
 *   id: 'login',
 *   initialValues: { email: '', password: '' },
 * });
 *
 * // One line to enable devtools!
 * const devtools = connectDevTools(form);
 *
 * // Multiple forms:
 * connectDevTools(form1, form2, form3);
 *
 * // With options:
 * connectDevTools(form, { minimized: true, maxEntries: 1000 });
 * ```
 *
 * @returns Object with `destroy()` to remove the panel and `bridge` for programmatic access
 */
export function connectDevTools(
  ...args: (FormStore | ConnectOptions)[]
): { destroy: () => void; bridge: DevToolsBridge; toggle: () => void } {
  // Parse arguments: forms + optional options at the end
  let options: ConnectOptions = {};
  let forms: FormStore[];

  const lastArg = args[args.length - 1];
  if (lastArg && typeof lastArg === "object" && !("values" in lastArg)) {
    options = lastArg as ConnectOptions;
    forms = args.slice(0, -1) as FormStore[];
  } else {
    forms = args as FormStore[];
  }

  // Create DevTools bridge
  const bridge = createDevTools({
    snapshotInterval: options.snapshotInterval,
    maxEntries: options.maxEntries,
    enableInProduction: options.enableInProduction,
  });

  // Attach all forms
  const detachFns: (() => void)[] = [];
  for (const form of forms) {
    const detach = bridge.attach(form);
    detachFns.push(detach);
  }

  // Create floating panel
  const panel = createPanel(bridge, forms, {
    position: options.position,
    minimized: options.minimized,
    activeTab: options.activeTab,
  });

  function destroy(): void {
    panel.destroy();
    for (const detach of detachFns) {
      detach();
    }
    bridge.detach();
  }

  return {
    destroy,
    bridge,
    toggle: panel.toggle,
  };
}
