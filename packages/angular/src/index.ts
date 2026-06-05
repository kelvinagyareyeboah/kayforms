// ============================================================================
// @kayforms/angular — Angular Signals Adapter
// ============================================================================
// Bridges Kayforms signals to Angular core Signals.
// Uses DestroyRef for clean, automatic subscription teardown.
// ============================================================================

import {
  signal as angularSignal,
  inject,
  DestroyRef,
  type Signal as AngularSignal,
} from "@angular/core";
import {
  createForm,
  type FormConfig,
  type FormStore,
  type FormErrors,
  type FieldNode,
  type Signal as KaySignal,
  type Computed as KayComputed,
} from "@kayforms/core";

// ---------------------------------------------------------------------------
// Signal → Angular Signal bridge
// ---------------------------------------------------------------------------

/**
 * Wrap a Kayforms Signal or Computed in an Angular core Signal.
 * Automatically unsubscribes when the host context is destroyed (via DestroyRef).
 */
export function toAngularSignal<T>(
  signal: KaySignal<T> | KayComputed<T>
): AngularSignal<T> {
  const angSig = angularSignal<T>(signal.peek());

  const unsubscribe = signal.subscribe((next) => {
    angSig.set(next);
  });

  // Automatically unsubscribe if running in an active Angular injection context
  try {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      unsubscribe();
    });
  } catch (err) {
    // Silent catch if called outside an injection context (e.g. manually managed)
  }

  // Return a read-only view of the Angular Signal
  return angSig.asReadonly();
}

// ---------------------------------------------------------------------------
// createAngularForm
// ---------------------------------------------------------------------------

export interface AngularFormReturn<T extends Record<string, unknown>> {
  /** Underlying Kayforms form store */
  store: FormStore<T>;
  /** Angular Signal for values */
  values: AngularSignal<T>;
  /** Angular Signal for errors */
  errors: AngularSignal<FormErrors<T>>;
  /** Angular Signal for dirty state */
  dirty: AngularSignal<boolean>;
  /** Angular Signal for validity */
  valid: AngularSignal<boolean>;
  /** Angular Signal for submitting state */
  submitting: AngularSignal<boolean>;
  /** Angular Signal for validating state */
  validating: AngularSignal<boolean>;
  /** Submission wrapper */
  handleSubmit: (e?: Event) => void;
  /** Reset helper */
  reset: (values?: Partial<T>) => void;
  /** Get a field node by path */
  getField: <V = unknown>(path: string) => FieldNode<V>;
}

/**
 * Create and manage a Kayforms form in an Angular component or service.
 * Registers auto-dispose of the store and subscriptions on DestroyRef trigger.
 */
export function createAngularForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): AngularFormReturn<T> {
  const store = createForm(config);

  try {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      store.dispose();
    });
  } catch (err) {
    // Silent catch if called outside injection context
  }

  const values = toAngularSignal(store.values);
  const errors = toAngularSignal(store.errors);
  const dirty = toAngularSignal(store.dirty);
  const valid = toAngularSignal(store.valid);
  const submitting = toAngularSignal(store.submitting);
  const validating = toAngularSignal(store.validating);

  const handleSubmit = (e?: Event) => {
    e?.preventDefault();
    store.submit();
  };

  const reset = (newValues?: Partial<T>) => {
    store.reset(newValues);
  };

  return {
    store,
    values,
    errors,
    dirty,
    valid,
    submitting,
    validating,
    handleSubmit,
    reset,
    getField: store.getField,
  };
}

// ---------------------------------------------------------------------------
// createAngularField
// ---------------------------------------------------------------------------

export interface AngularFieldReturn<V = unknown> {
  /** Underlying FieldNode */
  field: FieldNode<V>;
  /** Angular Signal for value */
  value: AngularSignal<V>;
  /** Angular Signal for error */
  error: AngularSignal<string | undefined>;
  /** Angular Signal for touched state */
  touched: AngularSignal<boolean>;
  /** Angular Signal for dirty state */
  dirty: AngularSignal<boolean>;
  /** Angular Signal for validating state */
  validating: AngularSignal<boolean>;
  /** Triggered value update */
  onChange: (value: V) => void;
  /** Blur handler */
  onBlur: () => void;
  /** Props for binding to plain DOM inputs */
  inputProps: {
    value: V;
    onInput: (e: any) => void;
    onBlur: () => void;
  };
}

/**
 * Bind a single field's reactive signals in an Angular component or directive.
 */
export function createAngularField<V = unknown>(
  store: FormStore<any>,
  path: string
): AngularFieldReturn<V> {
  const field = store.getField<V>(path);

  const value = toAngularSignal(field.value);
  const error = toAngularSignal(field.error);
  const touched = toAngularSignal(field.touched);
  const dirty = toAngularSignal(field.dirty);
  const validating = toAngularSignal(field.validating);

  const onChange = (v: V) => field.onChange(v);
  const onBlur = () => field.onBlur();

  const handleInput = (e: any) => {
    field.onChange(e.target.value as V);
  };

  return {
    field,
    value,
    error,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    get inputProps() {
      return {
        value: field.value.peek(),
        onInput: handleInput,
        onBlur,
      };
    },
  };
}
