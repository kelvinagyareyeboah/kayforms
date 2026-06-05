// ============================================================================
// @kayforms/react — React Adapter
// ============================================================================
// Bridges Kayforms signals to React re-renders using useSyncExternalStore.
// Each useField() subscribes only to its own FieldNode — parent components
// never re-render on individual field changes.
// ============================================================================

import {
  useSyncExternalStore,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  createElement,
  type ReactNode,
} from "react";
import {
  createForm,
  type FormConfig,
  type FormStore,
  type FormErrors,
  type FieldNode,
  type Signal,
  type Computed,
} from "@kayforms/core";

// ---------------------------------------------------------------------------
// Signal → React bridge
// ---------------------------------------------------------------------------

/**
 * Subscribe to a Kayforms signal inside a React component.
 * Uses useSyncExternalStore for tear-free concurrent rendering.
 */
export function useSignalValue<T>(signal: Signal<T> | Computed<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return signal.subscribe(onStoreChange);
    },
    [signal]
  );

  const getSnapshot = useCallback(() => signal.value, [signal]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---------------------------------------------------------------------------
// FormContext
// ---------------------------------------------------------------------------

const FormContext = createContext<FormStore | null>(null);

function useFormContext(): FormStore {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error(
      "[kayforms/react] useField must be used inside a <FormProvider>. " +
        "Wrap your form with <FormProvider form={...}>."
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// FormProvider
// ---------------------------------------------------------------------------

export interface FormProviderProps {
  form: FormStore;
  children: ReactNode;
}

/**
 * Provides form context to nested useField() hooks.
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { name: '' } });
 * return (
 *   <FormProvider form={form.store}>
 *     <NameField />
 *   </FormProvider>
 * );
 * ```
 */
export function FormProvider({ form, children }: FormProviderProps) {
  return createElement(FormContext.Provider, { value: form }, children);
}

// ---------------------------------------------------------------------------
// useForm
// ---------------------------------------------------------------------------

export interface UseFormReturn<T extends Record<string, unknown>> {
  /** The reactive form store */
  store: FormStore<T>;
  /** Current values (reactive) */
  values: T;
  /** Current errors (reactive) */
  errors: FormErrors<T>;
  /** Whether the form is dirty */
  dirty: boolean;
  /** Whether the form is valid */
  valid: boolean;
  /** Whether the form is submitting */
  submitting: boolean;
  /** Handle form submission (pass to <form onSubmit>) */
  handleSubmit: (e?: { preventDefault?: () => void }) => void;
  /** Reset the form */
  reset: (values?: Partial<T>) => void;
  /** Get a field node by path */
  getField: <V = unknown>(path: string) => FieldNode<V>;
}

/**
 * Create and manage a Kayforms form in a React component.
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { handleSubmit, getField, valid, submitting } = useForm({
 *     initialValues: { email: '', password: '' },
 *     fieldValidators: {
 *       email: [validators.required(), validators.email()],
 *       password: [validators.required(), validators.minLength(8)],
 *     },
 *     onSubmit: async (values) => {
 *       await login(values);
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Field field={getField('email')} />
 *       <Field field={getField('password')} type="password" />
 *       <button disabled={!valid || submitting}>Login</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  // Create form store once (stable reference)
  const storeRef = useRef<FormStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createForm(config);
  }
  const store = storeRef.current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, [store]);

  // Subscribe to reactive values
  const values = useSignalValue(store.values);
  const errors = useSignalValue(store.errors);
  const dirty = useSignalValue(store.dirty);
  const valid = useSignalValue(store.valid);
  const submitting = useSignalValue(store.submitting);

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      store.submit();
    },
    [store]
  );

  const reset = useCallback(
    (newValues?: Partial<T>) => {
      store.reset(newValues);
    },
    [store]
  );

  return {
    store,
    values,
    errors,
    dirty,
    valid,
    submitting,
    handleSubmit,
    reset,
    getField: store.getField,
  };
}

// ---------------------------------------------------------------------------
// useField
// ---------------------------------------------------------------------------

export interface UseFieldReturn<V = unknown> {
  /** Current field value */
  value: V;
  /** Current error message (undefined = valid) */
  error: string | undefined;
  /** Whether the field has been touched */
  touched: boolean;
  /** Whether the field value differs from initial */
  dirty: boolean;
  /** Whether async validation is in progress */
  validating: boolean;
  /** Update the field value */
  onChange: (value: V) => void;
  /** Mark as touched (call on blur) */
  onBlur: () => void;
  /** Props to spread on an input element */
  inputProps: {
    value: V;
    onChange: (e: { target: { value: unknown } }) => void;
    onBlur: () => void;
  };
}

/**
 * Subscribe to a single field's reactive state.
 * Only re-renders when THIS field changes — not other fields.
 *
 * @example
 * ```tsx
 * function EmailField() {
 *   const { inputProps, error, touched } = useField<string>('email');
 *   return (
 *     <div>
 *       <input {...inputProps} type="email" />
 *       {touched && error && <span className="error">{error}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useField<V = unknown>(path: string): UseFieldReturn<V> {
  const store = useFormContext();
  const field = store.getField<V>(path);

  const value = useSignalValue(field.value);
  const error = useSignalValue(field.error);
  const touched = useSignalValue(field.touched);
  const dirty = useSignalValue(field.dirty);
  const validating = useSignalValue(field.validating);

  const onChange = useCallback(
    (v: V) => field.onChange(v),
    [field]
  );

  const onBlur = useCallback(() => field.onBlur(), [field]);

  const handleInputChange = useCallback(
    (e: { target: { value: unknown } }) => {
      field.onChange(e.target.value as V);
    },
    [field]
  );

  return {
    value,
    error,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    inputProps: {
      value,
      onChange: handleInputChange,
      onBlur,
    },
  };
}
