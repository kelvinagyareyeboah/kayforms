// ============================================================================
// @kayforms/devtools — Injected CSS Styles
// ============================================================================
// Zero-dependency styles for the floating debug panel. Injected as a
// <style> tag so there are no external CSS dependencies.
// ============================================================================

export const DEVTOOLS_STYLES = `
  .kayform-devtools {
    --kf-bg: #1a1a2e;
    --kf-bg-secondary: #16213e;
    --kf-bg-hover: #0f3460;
    --kf-text: #e6e6e6;
    --kf-text-muted: #8899aa;
    --kf-accent: #00d2ff;
    --kf-accent-gradient: linear-gradient(135deg, #00d2ff 0%, #7b2ff7 100%);
    --kf-error: #ff6b6b;
    --kf-success: #51cf66;
    --kf-warning: #ffd43b;
    --kf-border: rgba(255, 255, 255, 0.08);
    --kf-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    --kf-radius: 12px;
    --kf-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --kf-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 420px;
    max-height: 560px;
    background: var(--kf-bg);
    border: 1px solid var(--kf-border);
    border-radius: var(--kf-radius);
    box-shadow: var(--kf-shadow);
    font-family: var(--kf-font);
    font-size: 12px;
    color: var(--kf-text);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: kf-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes kf-slide-in {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .kayform-devtools.kf-minimized {
    width: 48px;
    height: 48px;
    max-height: 48px;
    border-radius: 50%;
    cursor: pointer;
    background: var(--kf-accent-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0;
  }

  .kayform-devtools.kf-minimized:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
  }

  .kayform-devtools.kf-minimized .kf-header {
    background: none;
    border: none;
    padding: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kayform-devtools.kf-minimized .kf-header-title {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kayform-devtools.kf-minimized .kf-header-logo {
    background: none;
    color: white;
    font-size: 16px;
    font-weight: bold;
    width: auto;
    height: auto;
    -webkit-text-fill-color: white;
  }

  .kayform-devtools.kf-minimized .kf-header-title span,
  .kayform-devtools.kf-minimized .kf-body,
  .kayform-devtools.kf-minimized .kf-header-actions {
    display: none;
  }

  /* --- Header --- */
  .kf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--kf-bg-secondary);
    border-bottom: 1px solid var(--kf-border);
    user-select: none;
    cursor: grab;
  }

  .kf-header:active {
    cursor: grabbing;
  }

  .kf-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
    background: var(--kf-accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .kf-header-logo {
    width: 18px;
    height: 18px;
    background: var(--kf-accent-gradient);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    -webkit-text-fill-color: white;
  }

  .kf-header-actions {
    display: flex;
    gap: 4px;
  }

  .kf-header-actions button {
    background: none;
    border: none;
    color: var(--kf-text-muted);
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.15s;
  }

  .kf-header-actions button:hover {
    background: var(--kf-bg-hover);
    color: var(--kf-text);
  }

  /* --- Body --- */
  .kf-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* --- Tabs --- */
  .kf-tabs {
    display: flex;
    border-bottom: 1px solid var(--kf-border);
    padding: 0 8px;
  }

  .kf-tab {
    padding: 8px 12px;
    background: none;
    border: none;
    color: var(--kf-text-muted);
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
  }

  .kf-tab:hover {
    color: var(--kf-text);
  }

  .kf-tab.kf-active {
    color: var(--kf-accent);
    border-bottom-color: var(--kf-accent);
  }

  /* --- Timeline Panel --- */
  .kf-timeline {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .kf-timeline::-webkit-scrollbar {
    width: 4px;
  }

  .kf-timeline::-webkit-scrollbar-thumb {
    background: var(--kf-border);
    border-radius: 2px;
  }

  .kf-timeline-entry {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
  }

  .kf-timeline-entry:hover {
    background: var(--kf-bg-hover);
  }

  .kf-timeline-entry.kf-current {
    background: rgba(0, 210, 255, 0.1);
    border-left: 2px solid var(--kf-accent);
  }

  .kf-entry-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--kf-accent);
    margin-top: 4px;
    flex-shrink: 0;
  }

  .kf-entry-dot.kf-action-SET_VALUE { background: var(--kf-accent); }
  .kf-entry-dot.kf-action-SET_TOUCHED { background: var(--kf-warning); }
  .kf-entry-dot.kf-action-VALIDATE { background: #9775fa; }
  .kf-entry-dot.kf-action-SUBMIT { background: var(--kf-success); }
  .kf-entry-dot.kf-action-RESET { background: var(--kf-error); }
  .kf-entry-dot.kf-action-INIT { background: #868e96; }

  .kf-entry-content {
    flex: 1;
    min-width: 0;
  }

  .kf-entry-action {
    font-weight: 600;
    font-family: var(--kf-mono);
    font-size: 11px;
  }

  .kf-entry-path {
    color: var(--kf-accent);
    font-family: var(--kf-mono);
    font-size: 10px;
    margin-left: 6px;
  }

  .kf-entry-values {
    display: flex;
    gap: 6px;
    margin-top: 2px;
    font-family: var(--kf-mono);
    font-size: 10px;
  }

  .kf-entry-prev {
    color: var(--kf-error);
    text-decoration: line-through;
    opacity: 0.6;
  }

  .kf-entry-next {
    color: var(--kf-success);
  }

  .kf-entry-time {
    color: var(--kf-text-muted);
    font-size: 9px;
    font-family: var(--kf-mono);
    margin-top: 2px;
  }

  /* --- Scrubber --- */
  .kf-scrubber {
    padding: 8px 14px;
    border-top: 1px solid var(--kf-border);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kf-scrubber input[type="range"] {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: var(--kf-bg-hover);
    border-radius: 2px;
    outline: none;
  }

  .kf-scrubber input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--kf-accent-gradient);
    cursor: pointer;
    box-shadow: 0 0 8px rgba(0, 210, 255, 0.4);
    transition: transform 0.15s;
  }

  .kf-scrubber input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .kf-scrubber-controls {
    display: flex;
    gap: 2px;
  }

  .kf-scrubber-controls button {
    background: none;
    border: none;
    color: var(--kf-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.15s;
  }

  .kf-scrubber-controls button:hover {
    background: var(--kf-bg-hover);
    color: var(--kf-accent);
  }

  .kf-scrubber-count {
    font-family: var(--kf-mono);
    font-size: 10px;
    color: var(--kf-text-muted);
    min-width: 40px;
    text-align: center;
  }

  /* --- State Inspector --- */
  .kf-inspector {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .kf-tree-node {
    padding: 2px 0 2px 16px;
    position: relative;
  }

  .kf-tree-key {
    color: #9775fa;
    font-family: var(--kf-mono);
    font-size: 11px;
  }

  .kf-tree-value {
    color: var(--kf-success);
    font-family: var(--kf-mono);
    font-size: 11px;
    margin-left: 4px;
  }

  .kf-tree-value.kf-error-value {
    color: var(--kf-error);
  }

  .kf-tree-bracket {
    color: var(--kf-text-muted);
    font-family: var(--kf-mono);
  }

  /* --- Status Bar --- */
  .kf-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    border-top: 1px solid var(--kf-border);
    font-size: 10px;
    color: var(--kf-text-muted);
  }

  .kf-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 4px;
  }

  .kf-status-dot.kf-valid { background: var(--kf-success); }
  .kf-status-dot.kf-invalid { background: var(--kf-error); }
  .kf-status-dot.kf-dirty { background: var(--kf-warning); }
`;
