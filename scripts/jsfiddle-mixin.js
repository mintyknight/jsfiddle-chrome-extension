function _debounce(func, wait) {
  let debounced;
  return function() {
    clearTimeout(debounced);
    debounced = setTimeout(func, wait);
  };
}

function _autoRun() {
  document.getElementById('run').click();
}

let delayedAutoRun;

chrome.storage.local.get('jarsSettings', function(result) {
  window.jarsSettings = result.jarsSettings;
  window.jarsStates = {
    keyupCount: 0
  };

  delayedAutoRun = _debounce(_autoRun, window.jarsSettings.autoRunDelay);
});

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

let showIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 10 12 4 18 10"></polyline>
  <polyline points="6 15 12 21 18 15"></polyline>
</svg>
`

let hideIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 4 12 10 18 4"></polyline>
  <polyline points="6 21 12 15 18 21"></polyline>
</svg>
`

let hidden = false;
let originalValues = {};
let hideButton = document.createElement('a');
let showText = showIcon + 'Show Extra Panels';
let hideText = hideIcon + 'Hide Extra Panels';
let maxWidth = '100%';
let display = { show: '', hide: 'none' };

let originalLayout, sidebar, content, htmlPanel, jsPanel, cssPanel, resultPanel, hiddenPanels, horizontalGutters;

function findElements() {
  // save current layout
  document.getElementsByName('editor_mode').forEach(function(element) {
    if(element.checked) {
      originalLayout = element;
    }
  });
  // switch to columns layout, following hidding mechanic are based on columns layout
  let columnsLayout = document.getElementsByName('editor_mode')[1];
  columnsLayout.click();
  columnsLayout.checked = false;
  // find all the elements
  sidebar = document.getElementById('sidebar');
  content = document.getElementById('content');
  [ htmlPanel, jsPanel, cssPanel, resultPanel ] = document.getElementsByClassName('panel-v panel');
  hiddenPanels = [ htmlPanel, cssPanel, resultPanel ];
  horizontalGutters = [ ...document.getElementsByClassName('gutter gutter-horizontal') ];
}

function hidePanels() {
  if (!hidden) {
    findElements();
    // hide sidebar
    sidebar.style.display = display.hide;
    // max content panel
    originalValues.contentMarginLeft = content.style.marginLeft;
    content.style.marginLeft = 0;
    // max js panel
    originalValues.jsPanelWidth = jsPanel.style.Width;
    jsPanel.style.width = maxWidth;
    // hide other panels
    hiddenPanels.forEach(function(panel) {
      panel.style.display = display.hide;
    })
    // hide all horizontal gutters
    horizontalGutters.forEach(function(horizontalGutter) {
      horizontalGutter.style.display = display.hide;
    })

    hideButton.innerHTML = showText;
    hidden = true;

    // show original layout as checked
    originalLayout.checked = true;
  }
};

function showPanels() {
  if (hidden) {
    // show sidebar
    sidebar.style.display = display.show;
    // resize content panel
    content.style.marginLeft = originalValues.contentMarginLeft;
    // resize js panel
    jsPanel.style.width = originalValues.jsPanelWidth;
    // show other panels
    hiddenPanels.forEach(function(panel) {
      panel.style.display = display.show;
    })
    // show all horizontal gutters
    horizontalGutters.forEach(function(horizontalGutter) {
      horizontalGutter.style.display = display.show;
    })
    
    hideButton.innerHTML = hideText;
    // toggle hidden before click on the layout to avoid running show twice
    hidden = false;

    // restore layout, needs to uncheck the layout before click
    originalLayout.checked = false;
    originalLayout.click();
  }
};

function togglePanels() {
  if (!hidden) {
    hidePanels();
  } else {
    showPanels();
  }
};

hideButton.innerHTML = hideText;
hideButton.className = 'aiButton';
hideButton.href = '#';
hideButton.onclick = togglePanels;

let hideContainer = document.createElement('li');
hideContainer.className = 'actionItem';
hideContainer.appendChild(hideButton);

// attach hide button to the menu bar
document.getElementsByClassName('actionCont dropdown')[0].appendChild(hideContainer);

// show panels if they were hidden when switching layout from dropdown
Array.prototype.forEach.call(document.getElementsByName('editor_mode'), function(element) {
  element.parentNode.onclick = showPanels;
});