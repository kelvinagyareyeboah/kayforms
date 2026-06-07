// ============================================================================
// @kayforms/core — Time-Travel Debugging
// ============================================================================
// Records form history and exposes undo/redo/jumpTo APIs.
// Fits within a <1KB bundle budget.
// ============================================================================

import { createEffect, batch } from "./signal";
import { type FormStore } from "./form";

export interface TimeTravelEntry {
  timestamp: number;
  values: any;
  errors: any;
  formLevelErrors?: any;
  changedField?: string;
  touched?: Record<string, boolean>;
}

export interface TimeTravelOptions {
  maxHistory?: number;
}

export interface TimeTravelMethods {
  undo(): void;
  redo(): void;
  jumpTo(index: number): void;
  clearHistory(): void;
  getHistory(): TimeTravelEntry[];
  getCursor(): number;
  importHistory(importedHistory: TimeTravelEntry[]): void;
}

// Global hook for Chrome Extension / DevTools bridge
if (typeof window !== "undefined") {
  const g = window as any;
  if (!g.__KAYFORMS_DEVTOOLS__) {
    const listeners = new Set<() => void>();
    g.__KAYFORMS_DEVTOOLS__ = {
      forms: {},
      listeners,
      onHistoryChange(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  }
}

/**
 * Enable time-travel debugging on a FormStore instance.
 * Attaches undo, redo, jumpTo, clearHistory, and getHistory methods to the form.
 */
export function enableTimeTravel<T extends Record<string, unknown>>(
  form: FormStore<T>,
  options: TimeTravelOptions = {}
): FormStore<T> & TimeTravelMethods {
  const maxHistory = options.maxHistory ?? 100;
  let history: TimeTravelEntry[] = [];
  let cursor = -1;
  let isRestoring = false;

  // Tiny dot-path differences finder
  function findDiffPath(a: any, b: any, prefix = ""): string | undefined {
    if (a === b) return undefined;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
      return prefix;
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      const diff = findDiffPath(a[key], b[key], nextPrefix);
      if (diff !== undefined) return diff;
    }
    return undefined;
  }

  // Tiny nested getByPath
  function getByPath(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  // Effect tracks changes to values, errors, and touched signals
  const unsubscribe = createEffect(() => {
    const vals = form.values.value;
    const errs = form.errors.value;

    const touched: Record<string, boolean> = {};
    const fields = (form as any)._fields;
    if (fields) {
      for (const [path, field] of fields) {
        touched[path] = field.touched.value;
      }
    }

    if (isRestoring) return;

    const clonedVals = structuredClone(vals);
    const clonedErrs = structuredClone(errs);
    const formLevelSignal = (form as any)._formLevelErrors;
    const formLevelErrors = formLevelSignal ? structuredClone(formLevelSignal.value) : {};

    const prevEntry = history[history.length - 1];
    let changedField: string | undefined = undefined;

    if (prevEntry) {
      changedField = findDiffPath(prevEntry.values, clonedVals);
      if (
        changedField === undefined &&
        JSON.stringify(prevEntry.errors) === JSON.stringify(clonedErrs) &&
        JSON.stringify(prevEntry.touched) === JSON.stringify(touched)
      ) {
        return;
      }
    }

    const entry: TimeTravelEntry = {
      timestamp: Date.now(),
      values: clonedVals,
      errors: clonedErrs,
      formLevelErrors,
      touched,
      changedField,
    };

    if (cursor >= 0 && cursor < history.length - 1) {
      history = history.slice(0, cursor + 1);
    }

    history.push(entry);
    if (history.length > maxHistory) {
      history.shift();
    }
    cursor = history.length - 1;

    // Notify listeners and DevTools Chrome Extension
    if (typeof window !== "undefined") {
      const g = window as any;
      if (g.__KAYFORMS_DEVTOOLS__) {
        for (const l of g.__KAYFORMS_DEVTOOLS__.listeners) {
          try { l(); } catch (_) {}
        }
      }
      window.dispatchEvent(
        new CustomEvent("kayforms:history-change", {
          detail: { formId: form.id || "default", cursor, historyLength: history.length },
        })
      );
    }
  });

  function jumpTo(index: number): void {
    if (index < 0 || index >= history.length) return;
    cursor = index;
    const entry = history[index];

    isRestoring = true;
    batch(() => {
      // 1. Restore form level values
      form.values.set(structuredClone(entry.values));

      // 2. Restore form-level errors
      const formLevelSignal = (form as any)._formLevelErrors;
      if (formLevelSignal && entry.formLevelErrors) {
        formLevelSignal.set(structuredClone(entry.formLevelErrors));
      }

      // 3. Restore field specific values, errors, touched
      const fields = (form as any)._fields;
      if (fields) {
        for (const [path, field] of fields) {
          const val = getByPath(entry.values, path);
          field.value.set(val);

          const err = getByPath(entry.errors, path);
          field.error.set(err);

          const isTouched = entry.touched?.[path] ?? false;
          field.touched.set(isTouched);
        }
      }
    });
    isRestoring = false;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kayforms:history-change", {
          detail: { formId: form.id || "default", cursor, historyLength: history.length },
        })
      );
    }
  }

  const methods: TimeTravelMethods = {
    undo() {
      if (cursor > 0) {
        jumpTo(cursor - 1);
      }
    },
    redo() {
      if (cursor < history.length - 1) {
        jumpTo(cursor + 1);
      }
    },
    jumpTo,
    clearHistory() {
      history = [];
      cursor = -1;
      
      const fields = (form as any)._fields;
      const touched: Record<string, boolean> = {};
      if (fields) {
        for (const [path, field] of fields) {
          touched[path] = field.touched.peek();
        }
      }

      history.push({
        timestamp: Date.now(),
        values: structuredClone(form.values.peek()),
        errors: structuredClone(form.errors.peek()),
        formLevelErrors: (form as any)._formLevelErrors ? structuredClone((form as any)._formLevelErrors.peek()) : {},
        touched,
      });
      cursor = 0;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kayforms:history-change", {
            detail: { formId: form.id || "default", cursor, historyLength: history.length },
          })
        );
      }
    },
    getHistory() {
      return history;
    },
    getCursor() {
      return cursor;
    },
    importHistory(importedHistory) {
      if (!Array.isArray(importedHistory) || importedHistory.length === 0) return;
      history = importedHistory;
      cursor = history.length - 1;
      jumpTo(cursor);
    },
  };

  // Attach methods to form instance
  Object.assign(form, methods);

  // Register with global devtools registry
  const formId = form.id || "default";
  if (typeof window !== "undefined") {
    const g = window as any;
    if (g.__KAYFORMS_DEVTOOLS__) {
      g.__KAYFORMS_DEVTOOLS__.forms[formId] = form;
    }
  }

  // Hook form dispose
  const originalDispose = form.dispose;
  form.dispose = () => {
    unsubscribe();
    if (typeof window !== "undefined") {
      const g = window as any;
      if (g.__KAYFORMS_DEVTOOLS__) {
        delete g.__KAYFORMS_DEVTOOLS__.forms[formId];
      }
    }
    originalDispose.call(form);
  };

  return form as FormStore<T> & TimeTravelMethods;
}
