// content-script.js
window.addEventListener("kayforms:history-change", (event) => {
  // Check if detail is present (CustomEvents from the page share details)
  if (event.detail) {
    chrome.runtime.sendMessage({
      source: "kayforms-page",
      detail: event.detail
    });
  }
});
