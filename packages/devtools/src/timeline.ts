// ============================================================================
// @kayforms/devtools — Timeline Component
// ============================================================================
// Renders the action log timeline with scrubber controls.
// Pure DOM manipulation — no framework dependencies.
// ============================================================================

import { createEffect, type DevToolsBridge, type HistoryEntry } from "@kayforms/core";

// ---------------------------------------------------------------------------
// Timeline Renderer
// ---------------------------------------------------------------------------

export function createTimeline(
  container: HTMLElement,
  bridge: DevToolsBridge
): () => void {
  const cleanups: (() => void)[] = [];

  // --- Timeline entries list ---
  const listEl = document.createElement("div");
  listEl.className = "kf-timeline";
  container.appendChild(listEl);

  // --- Scrubber bar ---
  const scrubberEl = document.createElement("div");
  scrubberEl.className = "kf-scrubber";

  const controlsEl = document.createElement("div");
  controlsEl.className = "kf-scrubber-controls";

  const undoBtn = document.createElement("button");
  undoBtn.textContent = "⏪";
  undoBtn.title = "Undo";
  undoBtn.onclick = () => bridge.undo();

  const redoBtn = document.createElement("button");
  redoBtn.textContent = "⏩";
  redoBtn.title = "Redo";
  redoBtn.onclick = () => bridge.redo();

  const resumeBtn = document.createElement("button");
  resumeBtn.textContent = "▶";
  resumeBtn.title = "Resume (live)";
  resumeBtn.onclick = () => bridge.resume();

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "🗑";
  clearBtn.title = "Clear history";
  clearBtn.onclick = () => bridge.clear();

  controlsEl.append(undoBtn, redoBtn, resumeBtn, clearBtn);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "0";
  slider.value = "0";
  slider.addEventListener("input", () => {
    const index = parseInt(slider.value, 10);
    bridge.jumpTo(index);
  });

  const countEl = document.createElement("span");
  countEl.className = "kf-scrubber-count";
  countEl.textContent = "0";

  scrubberEl.append(controlsEl, slider, countEl);
  container.appendChild(scrubberEl);

  // --- Render entries ---
  function renderEntry(entry: HistoryEntry, index: number, isCurrent: boolean): HTMLElement {
    const el = document.createElement("div");
    el.className = `kf-timeline-entry${isCurrent ? " kf-current" : ""}`;
    el.onclick = () => bridge.jumpTo(index);

    // Color dot
    const dot = document.createElement("div");
    dot.className = `kf-entry-dot kf-action-${entry.action}`;
    el.appendChild(dot);

    // Content
    const content = document.createElement("div");
    content.className = "kf-entry-content";

    // Action + path
    const actionLine = document.createElement("div");
    const actionSpan = document.createElement("span");
    actionSpan.className = "kf-entry-action";
    actionSpan.textContent = entry.action;
    actionLine.appendChild(actionSpan);

    if (entry.path) {
      const pathSpan = document.createElement("span");
      pathSpan.className = "kf-entry-path";
      pathSpan.textContent = entry.path;
      actionLine.appendChild(pathSpan);
    }
    content.appendChild(actionLine);

    // Value change
    if (entry.prevValue !== undefined || entry.nextValue !== undefined) {
      const valuesEl = document.createElement("div");
      valuesEl.className = "kf-entry-values";

      if (entry.prevValue !== undefined && entry.action !== "INIT") {
        const prevEl = document.createElement("span");
        prevEl.className = "kf-entry-prev";
        prevEl.textContent = truncate(JSON.stringify(entry.prevValue), 20);
        valuesEl.appendChild(prevEl);

        const arrow = document.createElement("span");
        arrow.textContent = "→";
        arrow.style.color = "#8899aa";
        valuesEl.appendChild(arrow);
      }

      const nextEl = document.createElement("span");
      nextEl.className = "kf-entry-next";
      nextEl.textContent = truncate(JSON.stringify(entry.nextValue), 30);
      valuesEl.appendChild(nextEl);

      content.appendChild(valuesEl);
    }

    // Timestamp
    const timeEl = document.createElement("div");
    timeEl.className = "kf-entry-time";
    const date = new Date(entry.timestamp);
    timeEl.textContent = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`;
    content.appendChild(timeEl);

    el.appendChild(content);
    return el;
  }

  // --- Reactive updates ---
  const disposeEffect = createEffect(() => {
    const entries = bridge.history.value;
    const cursorVal = bridge.cursor.value;
    const currentIndex = cursorVal === -1 ? entries.length - 1 : cursorVal;

    // Clear and re-render (simple approach — could be optimized with diffing)
    listEl.innerHTML = "";

    // Render in reverse (newest first)
    for (let i = entries.length - 1; i >= 0; i--) {
      const entryEl = renderEntry(entries[i], i, i === currentIndex);
      listEl.appendChild(entryEl);
    }

    // Update scrubber
    slider.max = String(Math.max(0, entries.length - 1));
    slider.value = String(currentIndex);
    countEl.textContent = `${currentIndex + 1}/${entries.length}`;

    // Auto-scroll to current entry
    if (cursorVal === -1 && listEl.firstChild) {
      (listEl.firstChild as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
  cleanups.push(disposeEffect);

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    listEl.remove();
    scrubberEl.remove();
  };
}

// ---------------------------------------------------------------------------
// State Inspector
// ---------------------------------------------------------------------------

export function createInspector(
  container: HTMLElement,
  bridge: DevToolsBridge
): () => void {
  const inspectorEl = document.createElement("div");
  inspectorEl.className = "kf-inspector";
  container.appendChild(inspectorEl);

  function renderTree(obj: unknown, depth = 0): HTMLElement {
    const fragment = document.createElement("div");

    if (obj === null || obj === undefined) {
      const valueEl = document.createElement("span");
      valueEl.className = "kf-tree-value";
      valueEl.textContent = String(obj);
      fragment.appendChild(valueEl);
      return fragment;
    }

    if (typeof obj !== "object") {
      const valueEl = document.createElement("span");
      valueEl.className = "kf-tree-value";
      valueEl.textContent = JSON.stringify(obj);
      fragment.appendChild(valueEl);
      return fragment;
    }

    const entries = Object.entries(obj as Record<string, unknown>);
    for (const [key, value] of entries) {
      const nodeEl = document.createElement("div");
      nodeEl.className = "kf-tree-node";

      const keyEl = document.createElement("span");
      keyEl.className = "kf-tree-key";
      keyEl.textContent = key;
      nodeEl.appendChild(keyEl);

      const colonEl = document.createElement("span");
      colonEl.className = "kf-tree-bracket";
      colonEl.textContent = ": ";
      nodeEl.appendChild(colonEl);

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const bracketOpen = document.createElement("span");
        bracketOpen.className = "kf-tree-bracket";
        bracketOpen.textContent = "{";
        nodeEl.appendChild(bracketOpen);

        if (depth < 3) {
          nodeEl.appendChild(renderTree(value, depth + 1));
        } else {
          const ellipsis = document.createElement("span");
          ellipsis.className = "kf-tree-value";
          ellipsis.textContent = "...";
          nodeEl.appendChild(ellipsis);
        }

        const bracketClose = document.createElement("span");
        bracketClose.className = "kf-tree-bracket";
        bracketClose.textContent = "}";
        nodeEl.appendChild(bracketClose);
      } else {
        const valueEl = document.createElement("span");
        valueEl.className = "kf-tree-value";
        valueEl.textContent = JSON.stringify(value);
        nodeEl.appendChild(valueEl);
      }

      fragment.appendChild(nodeEl);
    }

    return fragment;
  }

  const disposeEffect = createEffect(() => {
    const entries = bridge.history.value;
    const cursorVal = bridge.cursor.value;
    const currentIndex = cursorVal === -1 ? entries.length - 1 : cursorVal;

    inspectorEl.innerHTML = "";

    const snapshot = bridge.getSnapshotAt(currentIndex);
    if (snapshot) {
      inspectorEl.appendChild(renderTree(snapshot));
    } else if (entries.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.style.cssText =
        "padding: 20px; text-align: center; color: var(--kf-text-muted);";
      emptyEl.textContent = "No form data recorded yet";
      inspectorEl.appendChild(emptyEl);
    }
  });

  return () => {
    disposeEffect();
    inspectorEl.remove();
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}
