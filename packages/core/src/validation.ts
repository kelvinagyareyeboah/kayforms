// ============================================================================
// @kayforms/core — Validation Pipeline
// ============================================================================
// Provides sync + async validation with smart batching, built-in validators,
// and schema adapter hooks for Zod/Yup/Valibot integration.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a form-level validation */
export type ValidationResult = Record<string, string | undefined>;

/** A form-level validator function */
export type ValidatorFn<T> = (
  values: T
) => ValidationResult | Promise<ValidationResult>;

/** A single-field validator function */
export type FieldValidator<V = unknown> = (
  value: V
) => string | undefined | Promise<string | undefined>;

/** Configuration for field-level validation */
export interface FieldValidationConfig<V = unknown> {
  /** Array of validator functions for this field */
  validators?: FieldValidator<V>[];
  /** When to trigger validation (default: inherits from form) */
  validateOn?: "change" | "blur" | "submit";
}

// ---------------------------------------------------------------------------
// Built-in Validators
// ---------------------------------------------------------------------------

export const validators = {
  /**
   * Validates that a value is not empty.
   * Works with strings, arrays, and nullish values.
   */
  required(msg?: string): FieldValidator {
    return (value: unknown) => {
      if (value === null || value === undefined || value === "") {
        return msg ?? "This field is required";
      }
      if (Array.isArray(value) && value.length === 0) {
        return msg ?? "This field is required";
      }
      return undefined;
    };
  },

  /** Validates minimum string length */
  minLength(n: number, msg?: string): FieldValidator<string> {
    return (value: string) => {
      if (typeof value === "string" && value.length < n) {
        return msg ?? `Must be at least ${n} characters`;
      }
      return undefined;
    };
  },

  /** Validates maximum string length */
  maxLength(n: number, msg?: string): FieldValidator<string> {
    return (value: string) => {
      if (typeof value === "string" && value.length > n) {
        return msg ?? `Must be at most ${n} characters`;
      }
      return undefined;
    };
  },

  /** Validates against a regular expression pattern */
  pattern(re: RegExp, msg?: string): FieldValidator<string> {
    return (value: string) => {
      if (typeof value === "string" && value.length > 0 && !re.test(value)) {
        return msg ?? "Invalid format";
      }
      return undefined;
    };
  },

  /** Validates email format */
  email(msg?: string): FieldValidator<string> {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value: string) => {
      if (typeof value === "string" && value.length > 0 && !emailRe.test(value)) {
        return msg ?? "Invalid email address";
      }
      return undefined;
    };
  },

  /** Validates minimum numeric value */
  min(n: number, msg?: string): FieldValidator<number> {
    return (value: number) => {
      if (typeof value === "number" && value < n) {
        return msg ?? `Must be at least ${n}`;
      }
      return undefined;
    };
  },

  /** Validates maximum numeric value */
  max(n: number, msg?: string): FieldValidator<number> {
    return (value: number) => {
      if (typeof value === "number" && value > n) {
        return msg ?? `Must be at most ${n}`;
      }
      return undefined;
    };
  },

  /** Custom validator with user-defined logic */
  custom<V = unknown>(fn: (value: V) => string | undefined): FieldValidator<V> {
    return fn;
  },
};

// ---------------------------------------------------------------------------
// Schema Adapter — Zod / Yup / Valibot interop
// ---------------------------------------------------------------------------

/** Minimal schema interface — works with Zod, Yup, Valibot, or any lib with parse/safeParse */
interface SchemaLike<T> {
  parse?: (value: T) => T;
  safeParse?: (value: T) => { success: boolean; error?: { issues?: Array<{ path?: Array<string | number>; message: string }> }; errors?: Array<{ path?: Array<string | number>; message: string }> };
  validate?: (value: T) => Promise<T>;
  validateSync?: (value: T) => T;
}

/**
 * Create a form-level validator from a schema object (Zod, Yup, Valibot, etc).
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * const schema = z.object({ email: z.string().email(), name: z.string().min(2) });
 * const form = createForm({ initialValues: { email: '', name: '' }, validate: withSchema(schema) });
 * ```
 */
export function withSchema<T extends Record<string, unknown>>(
  schema: SchemaLike<T>
): ValidatorFn<T> {
  return (values: T): ValidationResult => {
    const errors: ValidationResult = {};

    // Zod-style safeParse
    if (schema.safeParse) {
      const result = schema.safeParse(values);
      if (!result.success) {
        const issues = result.error?.issues ?? result.errors ?? [];
        for (const issue of issues) {
          const path = issue.path?.join(".") ?? "";
          if (path && !errors[path]) {
            errors[path] = issue.message;
          }
        }
      }
      return errors;
    }

    // Yup-style validateSync
    if (schema.validateSync) {
      try {
        schema.validateSync(values);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "inner" in err) {
          const yupError = err as {
            inner: Array<{ path?: string; message: string }>;
          };
          for (const e of yupError.inner) {
            if (e.path && !errors[e.path]) {
              errors[e.path] = e.message;
            }
          }
        }
      }
      return errors;
    }

    // Fallback: try parse and catch
    if (schema.parse) {
      try {
        schema.parse(values);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "issues" in err) {
          const zodError = err as {
            issues: Array<{ path: Array<string | number>; message: string }>;
          };
          for (const issue of zodError.issues) {
            const path = issue.path.join(".");
            if (!errors[path]) {
              errors[path] = issue.message;
            }
          }
        }
      }
      return errors;
    }

    return errors;
  };
}

// ---------------------------------------------------------------------------
// Validation Runner
// ---------------------------------------------------------------------------

/**
 * Run an array of field validators against a value.
 * Returns the first error found (short-circuit), or undefined if valid.
 */
export async function runFieldValidators<V>(
  value: V,
  fieldValidators: FieldValidator<V>[]
): Promise<string | undefined> {
  for (const validator of fieldValidators) {
    const result = validator(value);
    // Handle both sync and async validators
    const error = result instanceof Promise ? await result : result;
    if (error) return error;
  }
  return undefined;
}

/**
 * Run field validators synchronously (skip async validators).
 * Used for immediate feedback on keystroke.
 */
export function runFieldValidatorsSync<V>(
  value: V,
  fieldValidators: FieldValidator<V>[]
): string | undefined {
  for (const validator of fieldValidators) {
    const result = validator(value);
    // Only process sync results
    if (result instanceof Promise) continue;
    if (result) return result;
  }
  return undefined;
}
