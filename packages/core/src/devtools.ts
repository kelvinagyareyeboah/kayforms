// ============================================================================
// @kayforms/core — Time-Travel DevTools Bridge
// ============================================================================
// Records every form mutation and enables time-travel debugging:
//   - Snapshot + delta history
//   - Undo / redo / jumpTo
//   - Subscribable for external consumers (in-page panel, Chrome extension)
// ============================================================================

import { createSignal, type Signal } from "./signal";
import { type FormStore } from "./form";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  /** Monotonically increasing entry index */
  index: number;
  /** Unix timestamp in ms */
  timestamp: number;
  /** Action type */
  action: string;
  /** Field path (undefined for form-level actions like RESET, SUBMIT) */
  path?: string;
  /** Value before the action */
  prevValue: unknown;
  /** Value after the action */
  nextValue: unknown;
  /** Form ID (if registered) */
  formId?: string;
  /**
   * Full form snapshot at this point.
   * Only stored every N entries (configurable) to save memory.
   * `undefined` for delta-only entries.
   */
  snapshot?: Record<string, unknown>;
}

export interface DevToolsBridge {
  /** All recorded history entries */
  readonly history: Signal<HistoryEntry[]>;
  /** Current cursor position in the timeline (-1 = latest) */
  readonly cursor: Signal<number>;
  /** Whether time-travel is active (cursor !== -1) */
  readonly isTimeTraveling: Signal<boolean>;

  /** Jump to a specific history index */
  jumpTo(index: number): void;
  /** Undo the last action */
  undo(): void;
  /** Redo the next action */
  redo(): void;
  /** Resume live mode (cursor = latest) */
  resume(): void;
  /** Clear all history */
  clear(): void;
  /** Get the full form snapshot at a given history index */
  getSnapshotAt(index: number): Record<string, unknown> | undefined;

  /** Subscribe to new history entries */
  subscribe(listener: (entry: HistoryEntry) => void): () => void;
  /** Attach to a form store (starts recording) */
  attach(form: FormStore): () => void;
  /** Detach from all forms */
  detach(): void;
}

export interface DevToolsConfig {
  /** Store a full snapshot every N entries (default: 10) */
  snapshotInterval?: number;
  /** Maximum history entries to keep (default: 500) */
  maxEntries?: number;
  /** Enable in production? (default: false) */
  enableInProduction?: boolean;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Create a DevTools bridge for time-travel debugging.
 *
 * @example
 * ```ts
 * import { createDevTools } from '@kayforms/core';
 *
 * const devtools = createDevTools();
 * const form = createForm({ id: 'login', initialValues: { email: '' } });
 * devtools.attach(form);
 *
 * // In your debug panel:
 * devtools.history.value; // all recorded actions
 * devtools.jumpTo(5);     // rewind to entry 5
 * devtools.undo();        // undo last action
 * ```
 */
export function createDevTools(config: DevToolsConfig = {}): DevToolsBridge {
  const {
    snapshotInterval = 10,
    maxEntries = 500,
  } = config;

  // Skip in production unless explicitly enabled
  const isEnabled =
    config.enableInProduction ||
    typeof process === "undefined" ||
    (typeof process !== "undefined" &&
      (process as unknown as Record<string, Record<string, string>>).env?.NODE_ENV !== "production");

  const history = createSignal<HistoryEntry[]>([]);
  const cursor = createSignal(-1);
  const isTimeTraveling = createSignal(false);

  let entryCounter = 0;
  const listeners = new Set<(entry: HistoryEntry) => void>();
  const attachedForms = new Map<string | undefined, () => void>();
  const formStores = new Map<string | undefined, FormStore>();

  function record(
    action: string,
    path: string | undefined,
    prevValue: unknown,
    nextValue: unknown,
    formId: string | undefined,
    form: FormStore
  ): void {
    if (!isEnabled || isTimeTraveling.peek()) return;

    const index = entryCounter++;
    const entry: HistoryEntry = {
      index,
      timestamp: Date.now(),
      action,
      path,
      prevValue,
      nextValue,
      formId,
    };

    // Store full snapshot at intervals
    if (index % snapshotInterval === 0) {
      entry.snapshot = structuredClone(form.values.peek()) as Record<string, unknown>;
    }

    const current = history.peek();
    let next: HistoryEntry[];

    // If we were time-traveling and new actions come in, truncate future
    if (cursor.peek() >= 0 && cursor.peek() < current.length - 1) {
      next = [...current.slice(0, cursor.peek() + 1), entry];
      cursor.set(-1);
    } else {
      next = [...current, entry];
    }

    // Evict oldest entries if over limit
    if (next.length > maxEntries) {
      next = next.slice(next.length - maxEntries);
    }

    history.set(next);

    // Notify listeners
    for (const listener of listeners) {
      listener(entry);
    }
  }

  function reconstructFormState(formId: string | undefined, targetIndex: number) {
    const entries = history.peek();
    let values: Record<string, unknown> = {};
    const touchedStates: Record<string, boolean> = {};

    for (let i = 0; i <= targetIndex; i++) {
      const entry = entries[i];
      if (entry.formId !== formId) continue;

      if (entry.action === "INIT" || entry.action === "RESET") {
        values = structuredClone(entry.nextValue) as Record<string, unknown>;
        for (const k of Object.keys(touchedStates)) {
          touchedStates[k] = false;
        }
      } else if (entry.action === "SUBMIT") {
        values = structuredClone(entry.nextValue) as Record<string, unknown>;
        for (const k of Object.keys(touchedStates)) {
          touchedStates[k] = true;
        }
      } else if (entry.action === "SET_VALUE") {
        if (entry.path) {
          setNestedValue(values, entry.path, entry.nextValue);
        }
      } else if (entry.action === "SET_TOUCHED") {
        if (entry.path) {
          touchedStates[entry.path] = !!entry.nextValue;
        }
      }
    }

    return { values, touchedStates };
  }

  function getSnapshotAt(index: number): Record<string, unknown> | undefined {
    const firstFormId = formStores.keys().next().value;
    return reconstructFormState(firstFormId, index).values;
  }

  function setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
  }

  const bridge: DevToolsBridge = {
    history,
    cursor,
    isTimeTraveling,

    jumpTo(index: number): void {
      const entries = history.peek();
      if (index < 0 || index >= entries.length) return;

      isTimeTraveling.set(true);
      cursor.set(index);

      // Restore form state for all attached forms
      for (const [formId, form] of formStores) {
        const { values: restoredValues, touchedStates } = reconstructFormState(formId, index);
        
        // Reset form values to snapshot
        form.reset(restoredValues);
        
        // Re-apply touched states
        for (const [path, isTouched] of Object.entries(touchedStates)) {
          if (isTouched) {
            form.getField(path).touched.set(true);
          }
        }
      }

      isTimeTraveling.set(false);
    },

    undo(): void {
      const entries = history.peek();
      if (entries.length === 0) return;

      const currentCursor = cursor.peek();
      const target =
        currentCursor === -1 ? entries.length - 2 : currentCursor - 1;

      if (target >= 0) {
        bridge.jumpTo(target);
      }
    },

    redo(): void {
      const entries = history.peek();
      const currentCursor = cursor.peek();

      if (currentCursor === -1 || currentCursor >= entries.length - 1) return;
      bridge.jumpTo(currentCursor + 1);
    },

    resume(): void {
      cursor.set(-1);
    },

    clear(): void {
      history.set([]);
      cursor.set(-1);
      entryCounter = 0;
    },

    getSnapshotAt,

    subscribe(listener: (entry: HistoryEntry) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    attach(form: FormStore): () => void {
      const formId = form.id;
      formStores.set(formId, form);

      // Wire up the form's action listener to record history
      const prevOnAction = form._onAction;
      form._onAction = (action, path, prevValue, nextValue) => {
        prevOnAction?.(action, path, prevValue, nextValue);
        record(action, path, prevValue, nextValue, formId, form);
      };

      // Record initial state
      record("INIT", undefined, undefined, form.values.peek(), formId, form);

      const detach = () => {
        form._onAction = prevOnAction;
        attachedForms.delete(formId);
        formStores.delete(formId);
      };

      attachedForms.set(formId, detach);
      return detach;
    },

    detach(): void {
      for (const [, detachFn] of attachedForms) {
        detachFn();
      }
      attachedForms.clear();
      formStores.clear();
    },
  };

  return bridge;
}
