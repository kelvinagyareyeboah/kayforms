// background.js
const ports = {};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "kayforms-devtools") return;

  let devtoolsTabId;
  const listener = (message) => {
    if (message.type === "init") {
      devtoolsTabId = message.tabId;
      ports[devtoolsTabId] = port;
    }
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
    if (devtoolsTabId) {
      delete ports[devtoolsTabId];
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.source === "kayforms-page" && sender.tab) {
    const tabId = sender.tab.id;
    if (ports[tabId]) {
      ports[tabId].postMessage({
        type: "history-change",
        detail: message.detail
      });
    }
  }
  return true;
});
