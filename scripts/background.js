let enabledIconPath = '../images/icon-enabled-32.png';
let enabledTitleText = 'Auto Run Enabled';
let disabledIconPath = '../images/icon-disabled-32.png';
let disabledTitleText = 'Auto Run Disabled';
let hostName = 'jsfiddle.net';

let toggleJars = function(enabled, pageAction, tabId) {
  if (enabled) {
    chrome.pageAction.setIcon({ path: enabledIconPath, tabId });
    chrome.pageAction.setTitle({ title: enabledTitleText, tabId });
  } else {
    chrome.pageAction.setIcon({ path: disabledIconPath, tabId });
    chrome.pageAction.setTitle({ title: disabledTitleText, tabId });
  }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([ {
      conditions: [ new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostEquals: hostName } }) ],
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    } ]);
  });

  chrome.storage.local.set({ jarsSettings: {
    autoRunEnabled: true,
    autoRunDelay: 1500,
    autoSaveEnabled: true,
    autoSaveKeyCount: 25
  } });
});

chrome.tabs.onUpdated.addListener(function(tabId) {
  chrome.storage.local.get('jarsSettings', function(result) {
    toggleJars(result.jarsSettings.autoRunEnabled, chrome.pageAction, tabId);
  });
});

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  chrome.storage.local.get('jarsSettings', function(result) {
    toggleJars(result.jarsSettings.autoRunEnabled, chrome.pageAction, tabId);
  });
});

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.storage.local.get('jarsSettings', function(result) {
    let { jarsSettings } = result;
    if (jarsSettings.autoRunEnabled) {
      jarsSettings.autoRunEnabled = false;
      chrome.storage.local.set({ jarsSettings });
      toggleJars(false, chrome.pageAction, tab.id);
    } else {
      jarsSettings.autoRunEnabled = true;
      chrome.storage.local.set({ jarsSettings });
      toggleJars(true, chrome.pageAction, tab.id);
    }
  });
});