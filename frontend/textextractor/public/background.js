chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTabs") {
      chrome.tabs.query({}, (tabs) => {
        sendResponse({ tabs });
      });
      return true;  // Keep the message channel open for async response
    }
  });
  