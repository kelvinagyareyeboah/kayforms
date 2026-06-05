// ============================================================================
// @kayforms/core — Smart Batching Scheduler
// ============================================================================
// Provides intelligent scheduling for different types of form operations:
//   - Sync validations → run immediately (microtask)
//   - Async validations → debounced (configurable delay)
//   - Derived/computed fields → lazy (on read)
// ============================================================================

export interface SchedulerOptions {
  /** Debounce delay for async validators in ms (default: 300) */
  asyncDebounce?: number;
}

export interface Scheduler {
  /** Schedule a synchronous task to run in the current microtask */
  immediate(fn: () => void): void;
  /** Schedule an async task with debouncing by key */
  debounced(key: string, fn: () => void | Promise<void>, delay?: number): void;
  /** Cancel a pending debounced task by key */
  cancel(key: string): void;
  /** Cancel all pending tasks */
  cancelAll(): void;
  /** Flush all pending tasks immediately */
  flush(): void;
}

/**
 * Create a smart batching scheduler for form operations.
 *
 * @example
 * ```ts
 * const scheduler = createScheduler({ asyncDebounce: 300 });
 * scheduler.immediate(() => runSyncValidation(field));
 * scheduler.debounced('email', () => checkEmailExists(email), 500);
 * ```
 */
export function createScheduler(options: SchedulerOptions = {}): Scheduler {
  const defaultDelay = options.asyncDebounce ?? 300;
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const pendingMicrotasks: (() => void)[] = [];
  let microtaskScheduled = false;

  function flushMicrotasks(): void {
    microtaskScheduled = false;
    const tasks = pendingMicrotasks.splice(0, pendingMicrotasks.length);
    for (const task of tasks) {
      task();
    }
  }

  return {
    immediate(fn: () => void): void {
      pendingMicrotasks.push(fn);
      if (!microtaskScheduled) {
        microtaskScheduled = true;
        queueMicrotask(flushMicrotasks);
      }
    },

    debounced(
      key: string,
      fn: () => void | Promise<void>,
      delay?: number
    ): void {
      // Cancel any existing timer for this key
      const existing = pendingTimers.get(key);
      if (existing !== undefined) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        pendingTimers.delete(key);
        fn();
      }, delay ?? defaultDelay);

      pendingTimers.set(key, timer);
    },

    cancel(key: string): void {
      const timer = pendingTimers.get(key);
      if (timer !== undefined) {
        clearTimeout(timer);
        pendingTimers.delete(key);
      }
    },

    cancelAll(): void {
      for (const timer of pendingTimers.values()) {
        clearTimeout(timer);
      }
      pendingTimers.clear();
      pendingMicrotasks.length = 0;
    },

    flush(): void {
      // Flush microtasks
      flushMicrotasks();
      // Flush debounced
      for (const [key, timer] of pendingTimers) {
        clearTimeout(timer);
        pendingTimers.delete(key);
      }
    },
  };
}
