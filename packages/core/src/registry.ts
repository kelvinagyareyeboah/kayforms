// ============================================================================
// @kayforms/core — Cross-Form Signal Registry
// ============================================================================
// Enables reactive cross-form communication. Form A can react to Form B's
// values, validity, or any derived state — all through the same signal graph.
// ============================================================================

import { createSignal, type Signal } from "./signal";
import { type FormStore } from "./form";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormRegistry {
  /** Register a form in the registry */
  register<T extends Record<string, unknown>>(form: FormStore<T>): void;
  /** Unregister a form */
  unregister(id: string): void;
  /** Get a registered form by ID */
  get<T extends Record<string, unknown>>(id: string): FormStore<T> | undefined;
  /** Get all registered form IDs */
  getIds(): string[];
  /** Signal that fires when the registry changes (form added/removed) */
  readonly changed: Signal<number>;
  /** Dispose the registry */
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Singleton registry
// ---------------------------------------------------------------------------

let _globalRegistry: FormRegistry | undefined;

/**
 * Get or create the global form registry.
 * Forms with an `id` auto-register here on creation.
 *
 * @example
 * ```ts
 * const registry = getFormRegistry();
 *
 * const profileForm = createForm({ id: 'profile', initialValues: { name: '' } });
 * registry.register(profileForm);
 *
 * const paymentForm = createForm({ id: 'payment', initialValues: { card: '' } });
 * registry.register(paymentForm);
 *
 * // Cross-form computed
 * const canCheckout = createComputed(() => {
 *   const profile = registry.get('profile');
 *   const payment = registry.get('payment');
 *   return (profile?.valid.value ?? false) && (payment?.valid.value ?? false);
 * });
 * ```
 */
export function getFormRegistry(): FormRegistry {
  if (!_globalRegistry) {
    _globalRegistry = createFormRegistry();
  }
  return _globalRegistry;
}

/**
 * Create a new isolated form registry (useful for testing or SSR).
 */
export function createFormRegistry(): FormRegistry {
  const forms = new Map<string, FormStore>();
  const changed = createSignal(0);

  return {
    register<T extends Record<string, unknown>>(form: FormStore<T>): void {
      if (!form.id) {
        throw new Error(
          "[kayforms] Cannot register a form without an id. Pass `id` to createForm()."
        );
      }
      if (forms.has(form.id)) {
        console.warn(
          `[kayforms] Form with id "${form.id}" is already registered. Overwriting.`
        );
      }
      forms.set(form.id, form as FormStore);
      changed.set(changed.peek() + 1);
    },

    unregister(id: string): void {
      if (forms.delete(id)) {
        changed.set(changed.peek() + 1);
      }
    },

    get<T extends Record<string, unknown>>(
      id: string
    ): FormStore<T> | undefined {
      // Reading `changed` signal creates a dependency so computeds
      // that access the registry will re-evaluate when forms are added/removed
      const _version = changed.value;
      void _version;
      return forms.get(id) as FormStore<T> | undefined;
    },

    getIds(): string[] {
      return [...forms.keys()];
    },

    changed,

    dispose(): void {
      for (const form of forms.values()) {
        form.dispose();
      }
      forms.clear();
      changed.set(0);
    },
  };
}

/**
 * Reset the global registry (useful for testing).
 */
export function resetGlobalRegistry(): void {
  _globalRegistry?.dispose();
  _globalRegistry = undefined;
}
