// ============================================================================
// KayForms DevTools Panel Controller
// ============================================================================

let selectedFormId = "";
let playInterval = null;
let currentHistory = [];
let currentCursor = -1;

// --- DOM References ---
const formSelect = document.getElementById("form-select");
const btnExport = document.getElementById("btn-export");
const btnImport = document.getElementById("btn-import");
const importFile = document.getElementById("import-file");
const btnRewind = document.getElementById("btn-rewind");
const btnPlayPause = document.getElementById("btn-play-pause");
const btnClear = document.getElementById("btn-clear");
const timeSlider = document.getElementById("time-slider");
const sliderTicks = document.getElementById("slider-ticks");
const currentStepLabel = document.getElementById("current-step-label");
const totalStepsLabel = document.getElementById("total-steps-label");
const timelineList = document.getElementById("timeline-list");
const jsonValues = document.getElementById("json-values");
const jsonErrors = document.getElementById("json-errors");
const validBadge = document.getElementById("valid-badge");
const entriesCountBadge = document.getElementById("entries-count-badge");

// --- Extension Port Connection ---
const tabId = chrome.devtools.inspectedWindow.tabId;
const port = chrome.runtime.connect({ name: "kayforms-devtools" });
port.postMessage({ type: "init", tabId });

// Listen for updates from content script
port.onMessage.addListener((message) => {
  if (message.type === "history-change") {
    loadForms();
  }
});

// --- Initialization ---
loadForms();
// Periodically check for active forms in case events missed
setInterval(loadForms, 2000);

// --- Form Selector Change ---
formSelect.addEventListener("change", (e) => {
  selectedFormId = e.target.value;
  stopPlayback();
  if (selectedFormId) {
    fetchHistory(selectedFormId);
  } else {
    renderEmptyState();
  }
});

// --- Fetch & Update UI ---
function loadForms() {
  chrome.devtools.inspectedWindow.eval(
    "window.__KAYFORMS_DEVTOOLS__ ? Object.keys(window.__KAYFORMS_DEVTOOLS__.forms) : []",
    (formIds, isException) => {
      if (isException || !formIds) return;

      const previousSelection = selectedFormId;
      
      // Update dropdown
      formSelect.innerHTML = "";
      if (formIds.length === 0) {
        formSelect.innerHTML = '<option value="">-- No Active Forms --</option>';
        selectedFormId = "";
        renderEmptyState();
        return;
      }

      formIds.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id;
        formSelect.appendChild(option);
      });

      // Restore selection if valid
      if (formIds.includes(previousSelection)) {
        selectedFormId = previousSelection;
        formSelect.value = selectedFormId;
      } else {
        selectedFormId = formIds[0];
        formSelect.value = selectedFormId;
      }

      fetchHistory(selectedFormId);
    }
  );
}

function fetchHistory(formId) {
  if (!formId) return;
  chrome.devtools.inspectedWindow.eval(
    `(() => {
      const devtools = window.__KAYFORMS_DEVTOOLS__;
      if (!devtools || !devtools.forms['${formId}']) return null;
      const form = devtools.forms['${formId}'];
      return {
        history: form.getHistory(),
        cursor: form.getCursor()
      };
    })()`,
    (data, isException) => {
      if (isException || !data) return;
      currentHistory = data.history || [];
      currentCursor = data.cursor ?? -1;
      renderUI();
    }
  );
}

function renderEmptyState() {
  timelineList.innerHTML = '<div class="empty-state">No form state changes recorded yet. Interacted fields will show up here.</div>';
  jsonValues.textContent = "{}";
  jsonErrors.textContent = "{}";
  entriesCountBadge.textContent = "0 entries";
  validBadge.className = "badge badge-success";
  validBadge.textContent = "Valid";
  timeSlider.disabled = true;
  timeSlider.max = 0;
  timeSlider.value = 0;
  currentStepLabel.textContent = "0";
  totalStepsLabel.textContent = "0";
}

function renderUI() {
  const history = currentHistory;
  const cursor = currentCursor;

  entriesCountBadge.textContent = `${history.length} entries`;

  if (history.length === 0) {
    renderEmptyState();
    return;
  }

  // Update slider bounds
  timeSlider.disabled = history.length <= 1;
  timeSlider.max = history.length - 1;
  timeSlider.value = cursor;

  currentStepLabel.textContent = cursor + 1;
  totalStepsLabel.textContent = history.length;

  // Render ticks
  sliderTicks.innerHTML = "";
  for (let i = 0; i < history.length; i++) {
    const tick = document.createElement("div");
    tick.className = `slider-tick ${i === cursor ? "active" : ""}`;
    sliderTicks.appendChild(tick);
  }

  // Render Timeline list
  timelineList.innerHTML = "";
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const isCurrent = i === cursor;
    const isFuture = i > cursor;

    const card = document.createElement("div");
    card.className = `entry-card ${isCurrent ? "active" : ""} ${isFuture ? "future" : ""}`;
    card.onclick = () => jumpTo(i);

    // Number indicator
    const num = document.createElement("span");
    num.className = "entry-index";
    num.textContent = `#${i + 1}`;
    card.appendChild(num);

    // Indicator Dot (color matches status)
    const dot = document.createElement("div");
    dot.className = "entry-dot";
    const hasErrors = entry.errors && Object.keys(entry.errors).length > 0;
    if (hasErrors) {
      dot.classList.add("validation-error");
    } else if (entry.changedField) {
      dot.classList.add("changed-field");
    }
    card.appendChild(dot);

    // Details column
    const details = document.createElement("div");
    details.className = "entry-details";

    const row1 = document.createElement("div");
    row1.className = "entry-row";

    const action = document.createElement("span");
    action.className = "entry-action";
    action.textContent = entry.changedField ? "Field Update" : "Form Action";
    row1.appendChild(action);

    const time = document.createElement("span");
    time.className = "entry-time";
    const d = new Date(entry.timestamp);
    time.textContent = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
    row1.appendChild(time);

    details.appendChild(row1);

    if (entry.changedField) {
      const row2 = document.createElement("div");
      row2.className = "entry-row";
      const path = document.createElement("span");
      path.className = "entry-path";
      path.textContent = entry.changedField;
      row2.appendChild(path);
      details.appendChild(row2);
    }

    card.appendChild(details);
    timelineList.appendChild(card);
  }

  // Populate JSON inspector for selected entry
  const selectedEntry = history[cursor] || history[history.length - 1];
  if (selectedEntry) {
    jsonValues.textContent = JSON.stringify(selectedEntry.values, null, 2);
    jsonErrors.textContent = JSON.stringify(selectedEntry.errors, null, 2);

    const hasErrors = selectedEntry.errors && Object.keys(selectedEntry.errors).length > 0;
    if (hasErrors) {
      validBadge.className = "badge badge-danger";
      validBadge.textContent = "Invalid";
    } else {
      validBadge.className = "badge badge-success";
      validBadge.textContent = "Valid";
    }
  }
}

// --- Time-Travel Actions ---
function jumpTo(index) {
  if (!selectedFormId) return;
  chrome.devtools.inspectedWindow.eval(
    `window.__KAYFORMS_DEVTOOLS__.forms['${selectedFormId}'].jumpTo(${index})`,
    () => {
      fetchHistory(selectedFormId);
    }
  );
}

timeSlider.addEventListener("input", (e) => {
  const index = parseInt(e.target.value, 10);
  jumpTo(index);
});

btnRewind.addEventListener("click", () => {
  stopPlayback();
  jumpTo(0);
});

btnClear.addEventListener("click", () => {
  if (!selectedFormId) return;
  stopPlayback();
  chrome.devtools.inspectedWindow.eval(
    `window.__KAYFORMS_DEVTOOLS__.forms['${selectedFormId}'].clearHistory()`,
    () => {
      fetchHistory(selectedFormId);
    }
  );
});

// --- Playback Engine ---
function startPlayback() {
  if (playInterval) return;

  btnPlayPause.textContent = "⏸";
  btnPlayPause.title = "Pause history";
  btnPlayPause.classList.add("playing");

  playInterval = setInterval(() => {
    if (currentCursor < currentHistory.length - 1) {
      chrome.devtools.inspectedWindow.eval(
        `window.__KAYFORMS_DEVTOOLS__.forms['${selectedFormId}'].redo()`,
        () => {
          fetchHistory(selectedFormId);
        }
      );
    } else {
      stopPlayback();
    }
  }, 600);
}

function stopPlayback() {
  if (!playInterval) return;
  clearInterval(playInterval);
  playInterval = null;
  btnPlayPause.textContent = "▶";
  btnPlayPause.title = "Play history";
  btnPlayPause.classList.remove("playing");
}

btnPlayPause.addEventListener("click", () => {
  if (playInterval) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

// --- Export & Import ---
btnExport.addEventListener("click", () => {
  if (!selectedFormId || currentHistory.length === 0) return;

  const dataStr = JSON.stringify(currentHistory, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Chrome extensions can download files via DevTools page inside helper scripts
  // or a simple element injection:
  const a = document.createElement("a");
  a.href = url;
  a.download = `kayforms-${selectedFormId}-history.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

btnImport.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        alert("Invalid history format: must be an array of states.");
        return;
      }

      chrome.devtools.inspectedWindow.eval(
        `window.__KAYFORMS_DEVTOOLS__.forms['${selectedFormId}'].importHistory(${JSON.stringify(importedData)})`,
        () => {
          fetchHistory(selectedFormId);
        }
      );
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
});
