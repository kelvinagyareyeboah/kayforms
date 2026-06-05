// ============================================================================
// @kayforms/core — Signal Engine
// ============================================================================
// Minimal, high-performance reactive primitives with automatic dependency
// tracking. Inspired by Solid, Preact Signals, and the TC39 Signals proposal.
//
// Architecture:
//   Signal<T>   — writable reactive value
//   Computed<T> — read-only derived value (lazy, cached, glitch-free)
//   Effect      — side-effect that auto-tracks dependencies
//   batch()     — defer notifications until all writes complete
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A reactive value that can be read and written */
export interface Signal<T> {
  /** Read the current value (tracks dependency if inside a computed/effect) */
  readonly value: T;
  /** Write a new value and notify subscribers */
  set(next: T): void;
  /** Read without tracking (useful in event handlers) */
  peek(): T;
  /** Subscribe to changes (returns unsubscribe function) */
  subscribe(listener: (value: T) => void): () => void;
}

/** A read-only derived value that recomputes when dependencies change */
export interface Computed<T> {
  /** Read the current value (recomputes if stale, tracks dependency) */
  readonly value: T;
  /** Read without tracking */
  peek(): T;
  /** Subscribe to changes */
  subscribe(listener: (value: T) => void): () => void;
}

/** Cleanup function returned by effects */
export type EffectCleanup = () => void;

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Base class for all reactive nodes in the dependency graph */
interface ReactiveNode {
  /** Nodes that depend on this node */
  subscribers: Set<ReactiveNode>;
  /** Nodes this node depends on */
  dependencies: Set<ReactiveNode>;
  /** Called when a dependency changes */
  notify(): void;
  /** Unique ID for debugging */
  _id: number;
}

let nodeIdCounter = 0;

/** Stack of currently-evaluating subscribers (for automatic tracking) */
const subscriberStack: ReactiveNode[] = [];

/** Current batch depth (0 = not batching) */
let batchDepth = 0;

/** Pending notifications deferred during a batch */
const batchQueue = new Set<ReactiveNode>();

// ---------------------------------------------------------------------------
// Dependency Tracking
// ---------------------------------------------------------------------------

function getCurrentSubscriber(): ReactiveNode | undefined {
  return subscriberStack[subscriberStack.length - 1];
}

function trackDependency(source: ReactiveNode): void {
  const subscriber = getCurrentSubscriber();
  if (subscriber) {
    source.subscribers.add(subscriber);
    subscriber.dependencies.add(source);
  }
}

function notifySubscribers(source: ReactiveNode): void {
  // Copy to avoid mutation during iteration
  const subs = [...source.subscribers];
  for (const sub of subs) {
    if (batchDepth > 0) {
      batchQueue.add(sub);
    } else {
      sub.notify();
    }
  }
}

function cleanupDependencies(node: ReactiveNode): void {
  for (const dep of node.dependencies) {
    dep.subscribers.delete(node);
  }
  node.dependencies.clear();
}

// ---------------------------------------------------------------------------
// Signal — Writable reactive value
// ---------------------------------------------------------------------------

class SignalImpl<T> implements ReactiveNode {
  _id: number;
  subscribers = new Set<ReactiveNode>();
  dependencies = new Set<ReactiveNode>(); // Always empty for signals
  private _value: T;
  private _listeners = new Set<(value: T) => void>();

  constructor(initial: T) {
    this._id = nodeIdCounter++;
    this._value = initial;
  }

  get value(): T {
    trackDependency(this);
    return this._value;
  }

  set(next: T): void {
    if (Object.is(this._value, next)) return;
    this._value = next;
    notifySubscribers(this);
    // Notify plain listeners
    for (const listener of this._listeners) {
      listener(next);
    }
  }

  peek(): T {
    return this._value;
  }

  subscribe(listener: (value: T) => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  notify(): void {
    // Signals don't get notified — they are leaf sources
  }
}

// ---------------------------------------------------------------------------
// Computed — Derived reactive value (lazy + cached)
// ---------------------------------------------------------------------------

const enum ComputedState {
  Clean,
  Dirty,
  Computing,
}

class ComputedImpl<T> implements ReactiveNode {
  _id: number;
  subscribers = new Set<ReactiveNode>();
  dependencies = new Set<ReactiveNode>();
  private _value: T | undefined = undefined;
  private _fn: () => T;
  private _state: ComputedState = ComputedState.Dirty;
  private _listeners = new Set<(value: T) => void>();

  constructor(fn: () => T) {
    this._id = nodeIdCounter++;
    this._fn = fn;
  }

  get value(): T {
    trackDependency(this);
    if (this._state !== ComputedState.Clean) {
      this._recompute();
    }
    return this._value as T;
  }

  peek(): T {
    if (this._state !== ComputedState.Clean) {
      this._recompute();
    }
    return this._value as T;
  }

  subscribe(listener: (value: T) => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  notify(): void {
    const oldState = this._state;
    this._state = ComputedState.Dirty;

    // Only propagate if we were clean (avoid cascading re-notifications)
    if (oldState === ComputedState.Clean) {
      // Eagerly recompute to check if value actually changed
      const oldValue = this._value;
      this._recompute();
      if (!Object.is(oldValue, this._value)) {
        notifySubscribers(this);
        for (const listener of this._listeners) {
          listener(this._value as T);
        }
      }
    }
  }

  private _recompute(): void {
    if (this._state === ComputedState.Computing) {
      throw new Error(
        `[kayforms] Circular dependency detected in computed (node #${this._id})`
      );
    }
    this._state = ComputedState.Computing;
    cleanupDependencies(this);

    subscriberStack.push(this);
    try {
      this._value = this._fn();
    } finally {
      subscriberStack.pop();
      this._state = ComputedState.Clean;
    }
  }
}

// ---------------------------------------------------------------------------
// Effect — Side effect with automatic dependency tracking
// ---------------------------------------------------------------------------

class EffectImpl implements ReactiveNode {
  _id: number;
  subscribers = new Set<ReactiveNode>();
  dependencies = new Set<ReactiveNode>();
  private _fn: () => void | EffectCleanup;
  private _cleanup: EffectCleanup | undefined;
  private _disposed = false;

  constructor(fn: () => void | EffectCleanup) {
    this._id = nodeIdCounter++;
    this._fn = fn;
    // Run immediately to establish initial dependencies
    this._run();
  }

  notify(): void {
    if (!this._disposed) {
      this._run();
    }
  }

  private _run(): void {
    // Run previous cleanup
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }

    cleanupDependencies(this);

    subscriberStack.push(this);
    try {
      const result = this._fn();
      if (typeof result === "function") {
        this._cleanup = result;
      }
    } finally {
      subscriberStack.pop();
    }
  }

  dispose(): void {
    this._disposed = true;
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }
    cleanupDependencies(this);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a writable reactive signal.
 *
 * @example
 * ```ts
 * const count = createSignal(0);
 * console.log(count.value); // 0
 * count.set(1);
 * console.log(count.value); // 1
 * ```
 */
export function createSignal<T>(initial: T): Signal<T> {
  return new SignalImpl(initial);
}

/**
 * Create a read-only computed signal that derives its value from other signals.
 * Recomputes lazily only when dependencies change.
 *
 * @example
 * ```ts
 * const firstName = createSignal('Kay');
 * const lastName = createSignal('Forms');
 * const fullName = createComputed(() => `${firstName.value} ${lastName.value}`);
 * console.log(fullName.value); // 'Kay Forms'
 * ```
 */
export function createComputed<T>(fn: () => T): Computed<T> {
  return new ComputedImpl(fn);
}

/**
 * Create a side effect that automatically re-runs when its dependencies change.
 * Returns a dispose function to stop the effect.
 *
 * @example
 * ```ts
 * const name = createSignal('World');
 * const dispose = createEffect(() => {
 *   console.log(`Hello, ${name.value}!`);
 *   return () => console.log('cleanup');
 * });
 * name.set('Kayforms'); // logs cleanup, then 'Hello, Kayforms!'
 * dispose(); // stops tracking
 * ```
 */
export function createEffect(fn: () => void | EffectCleanup): EffectCleanup {
  const effect = new EffectImpl(fn);
  return () => effect.dispose();
}

/**
 * Batch multiple signal writes into a single notification flush.
 * Subscribers are only notified after the batch completes.
 *
 * @example
 * ```ts
 * const a = createSignal(1);
 * const b = createSignal(2);
 * batch(() => {
 *   a.set(10);
 *   b.set(20);
 *   // No notifications fired yet
 * });
 * // All subscribers notified once here
 * ```
 */
export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      // Flush all pending notifications
      const pending = [...batchQueue];
      batchQueue.clear();
      for (const node of pending) {
        node.notify();
      }
    }
  }
}

/**
 * Run a function without tracking any signal reads as dependencies.
 * Useful for reading signals inside event handlers or effects without
 * creating unwanted subscriptions.
 *
 * @example
 * ```ts
 * createEffect(() => {
 *   const tracked = name.value; // tracked
 *   const untracked = untrack(() => other.value); // NOT tracked
 * });
 * ```
 */
export function untrack<T>(fn: () => T): T {
  // Temporarily clear the subscriber stack so no dependencies are tracked
  const saved = subscriberStack.splice(0, subscriberStack.length);
  try {
    return fn();
  } finally {
    subscriberStack.push(...saved);
  }
}
