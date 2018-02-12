function _debounce(func, wait) {
  let debounced;
  return function() {
    clearTimeout(debounced);
    debounced = setTimeout(func, wait);
  };
}

let delayedAutoRun;

chrome.storage.local.get('jarsSettings', function(result) {
  window.jarsSettings = result.jarsSettings;
  window.jarsStates = {
    keyupCount: 0
  };

  delayedAutoRun = _debounce(function() {
    document.getElementById('run').click();
  }, window.jarsSettings.autoRunDelay);
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

let originalLayout, sidebar, content, leftPanel, horizontalGutter, rightPanel, htmlPanel, verticalGutter, jsPanel;

function findElements() {
  // save current layout
  document.getElementsByName('editor_mode').forEach(function(element) {
    if(element.checked) {
      originalLayout = element;
    }
  });
  // switch to classic layout
  let classicLayout = document.getElementsByName('editor_mode')[0];
  classicLayout.click();
  classicLayout.checked = false;
  // find all the elements
  sidebar = document.getElementById('sidebar');
  content = document.getElementById('content');
  leftPanel = document.getElementsByClassName('panel-v left')[0];
  horizontalGutter = document.getElementsByClassName('gutter gutter-horizontal')[0];
  rightPanel = document.getElementsByClassName('panel-v right')[0];
  htmlPanel = document.getElementsByClassName('panel-h panel')[0];
  verticalGutter = document.getElementsByClassName('gutter gutter-vertical')[0];
  jsPanel = document.getElementsByClassName('panel-h panel')[1];
}

function hidePanels() {
  if (!hidden) {
    findElements();
    // hide sidebar
    originalValues.sidebarDisplay = sidebar.style.display;
    sidebar.style.display = 'none';
    // max content panel
    originalValues.contentMarginLeft = content.style.marginLeft;
    content.style.marginLeft = 0;
    // max left panel
    originalValues.leftPanelWidth = leftPanel.style.width;
    leftPanel.style.width = '100%';
    // hide horizontal gutter
    originalValues.horizontalGutterDisplay = horizontalGutter.style.display;
    horizontalGutter.style.display = 'none';
    // hide right panel
    originalValues.rightPanelDisplay = rightPanel.style.display;
    rightPanel.style.display = 'none';
    // hide html panel
    originalValues.htmlPanelDisplay = htmlPanel.style.display;
    htmlPanel.style.display = 'none';
    // hide vertical gutter
    originalValues.verticalGutterDisplay = verticalGutter.style.display;
    verticalGutter.style.display = 'none';
    // max js panel
    originalValues.jsPanelHeight = jsPanel.style.height;
    jsPanel.style.height = '100%';

    hideButton.innerHTML = showText;
    hidden = true;

    // show original layout as checked
    originalLayout.checked = true;
  }
};

function showPanels() {
  if (hidden) {
    // show sidebar
    sidebar.style.display = originalValues.sidebarDisplay;
    // restore content panel
    content.style.marginLeft = originalValues.contentMarginLeft;
    // restore left panel
    leftPanel.style.width = originalValues.leftPanelWidth;
    // restore horizontal gutter
    horizontalGutter.style.display = originalValues.horizontalGutterDisplay;
    // restore right panel
    rightPanel.style.display = originalValues.rightPanelDisplay;
    // restore html panel
    htmlPanel.style.display = originalValues.htmlPanelDisplay;
    // restore vertical gutter
    verticalGutter.style.display = originalValues.verticalGutterDisplay;
    // restore js panel
    jsPanel.style.height = originalValues.jsPanelHeight;
    
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
document.getElementsByName('editor_mode').forEach(function(element) {
  element.parentNode.onclick = showPanels;
});