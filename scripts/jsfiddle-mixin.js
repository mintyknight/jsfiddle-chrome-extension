function _debounce(func, wait) {
  let debounced;
  return function() {
    clearTimeout(debounced);
    debounced = setTimeout(func, wait);
  };
}

let delayedAutoRun;

(function() {
  chrome.storage.local.get('jarsSettings', function(result) {
    window.jarsSettings = result.jarsSettings;
    window.jarsStates = {
      keyupCount: 0
    };

    delayedAutoRun = _debounce(function() {
      document.getElementById('run').click();
    }, window.jarsSettings.autoRunDelay);
  });
})();

document.addEventListener('keyup', function() {
  if (window.jarsSettings.autoRunEnabled) {
    window.jarsStates.keyupCount++;
    delayedAutoRun();
    if (window.jarsStates.keyupCount === window.jarsSettings.autoSaveKeyCount) {
      window.jarsStates.keyupCount = 0;
      document.getElementById('update').click();
    }
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  let { jarsSettings } = changes
  if (jarsSettings) {
    window.jarsSettings = jarsSettings.newValue;
  }
});