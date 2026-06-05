// ============================================================================
// @kayforms/devtools — Floating Debug Panel
// ============================================================================
// Zero-dependency, framework-agnostic floating panel that provides:
//   - Timeline of all form mutations
//   - State inspector (tree view)
//   - Time-travel scrubber with undo/redo
//   - Minimizable to a floating orb
//   - Draggable positioning
// ============================================================================

import { createEffect, type DevToolsBridge, type FormStore } from "@kayforms/core";
import { DEVTOOLS_STYLES } from "./styles";
import { createTimeline, createInspector } from "./timeline";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PanelOptions {
  /** Initial position (default: bottom-right) */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Start minimized (default: false) */
  minimized?: boolean;
  /** Initial active tab */
  activeTab?: "timeline" | "state";
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export function createPanel(
  bridge: DevToolsBridge,
  forms: FormStore[],
  options: PanelOptions = {}
): { destroy: () => void; toggle: () => void } {
  const { minimized = false, activeTab = "timeline" } = options;

  // --- Inject styles ---
  const styleEl = document.createElement("style");
  styleEl.textContent = DEVTOOLS_STYLES;
  document.head.appendChild(styleEl);

  // --- Root container ---
  const root = document.createElement("div");
  root.className = `kayform-devtools${minimized ? " kf-minimized" : ""}`;
  root.setAttribute("data-kayform-devtools", "");

  // --- Minimized state ---
  let isMinimized = minimized;
  let currentTab = activeTab;

  // --- Header ---
  const header = document.createElement("div");
  header.className = "kf-header";

  const title = document.createElement("div");
  title.className = "kf-header-title";

  const logo = document.createElement("div");
  logo.className = "kf-header-logo";
  logo.textContent = "K";

  const titleText = document.createElement("span");
  titleText.textContent = "Kayforms DevTools";

  title.append(logo, titleText);

  const actions = document.createElement("div");
  actions.className = "kf-header-actions";

  const minimizeBtn = document.createElement("button");
  minimizeBtn.textContent = "−";
  minimizeBtn.title = "Minimize";
  minimizeBtn.onclick = () => toggle();

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.title = "Close";
  closeBtn.onclick = () => destroy();

  actions.append(minimizeBtn, closeBtn);
  header.append(title, actions);
  root.appendChild(header);

  // --- Body ---
  const body = document.createElement("div");
  body.className = "kf-body";

  // Tabs
  const tabs = document.createElement("div");
  tabs.className = "kf-tabs";

  const timelineTab = document.createElement("button");
  timelineTab.className = `kf-tab${currentTab === "timeline" ? " kf-active" : ""}`;
  timelineTab.textContent = "Timeline";

  const stateTab = document.createElement("button");
  stateTab.className = `kf-tab${currentTab === "state" ? " kf-active" : ""}`;
  stateTab.textContent = "State";

  tabs.append(timelineTab, stateTab);
  body.appendChild(tabs);

  // Tab content containers
  const timelineContainer = document.createElement("div");
  timelineContainer.style.cssText = `flex:1;overflow:hidden;display:flex;flex-direction:column;${
    currentTab !== "timeline" ? "display:none;" : ""
  }`;

  const stateContainer = document.createElement("div");
  stateContainer.style.cssText = `flex:1;overflow:hidden;display:flex;flex-direction:column;${
    currentTab !== "state" ? "display:none;" : ""
  }`;

  body.append(timelineContainer, stateContainer);

  // Wire up tabs
  timelineTab.onclick = () => switchTab("timeline");
  stateTab.onclick = () => switchTab("state");

  function switchTab(tab: "timeline" | "state"): void {
    currentTab = tab;
    timelineTab.className = `kf-tab${tab === "timeline" ? " kf-active" : ""}`;
    stateTab.className = `kf-tab${tab === "state" ? " kf-active" : ""}`;
    timelineContainer.style.display = tab === "timeline" ? "flex" : "none";
    stateContainer.style.display = tab === "state" ? "flex" : "none";
  }

  // --- Status bar ---
  const statusBar = document.createElement("div");
  statusBar.className = "kf-status";
  body.appendChild(statusBar);

  root.appendChild(body);

  // --- Mount timeline + inspector ---
  const cleanupTimeline = createTimeline(timelineContainer, bridge);
  const cleanupInspector = createInspector(stateContainer, bridge);

  // --- Status bar reactive updates ---
  const cleanups: (() => void)[] = [cleanupTimeline, cleanupInspector];

  if (forms.length > 0) {
    const disposeStatus = createEffect(() => {
      const statusParts: string[] = [];

      for (const form of forms) {
        const id = form.id ?? "unnamed";
        const isValid = form.valid.value;
        const isDirty = form.dirty.value;

        const dot = document.createElement("span");
        dot.className = `kf-status-dot ${isValid ? "kf-valid" : "kf-invalid"}`;

        statusParts.push(
          `<span class="kf-status-dot ${isValid ? "kf-valid" : "kf-invalid"}"></span>${id}` +
            `${isDirty ? ' <span class="kf-status-dot kf-dirty"></span>dirty' : ""}`
        );
      }

      statusBar.innerHTML = statusParts.join(" · ");
    });
    cleanups.push(disposeStatus);
  }

  // --- Dragging ---
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  header.addEventListener("mousedown", (e: MouseEvent) => {
    if (isMinimized) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = root.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    root.style.left = `${panelStartX + dx}px`;
    root.style.top = `${panelStartY + dy}px`;
    root.style.right = "auto";
    root.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // --- Toggle minimize ---
  function toggle(): void {
    isMinimized = !isMinimized;
    root.className = `kayform-devtools${isMinimized ? " kf-minimized" : ""}`;
  }

  // Click to expand when minimized
  root.addEventListener("click", (e: Event) => {
    if (isMinimized && e.target === root) {
      toggle();
    }
  });

  // --- Mount to DOM ---
  document.body.appendChild(root);

  // --- Destroy ---
  function destroy(): void {
    for (const cleanup of cleanups) {
      cleanup();
    }
    root.remove();
    styleEl.remove();
  }

  return { destroy, toggle };
}
