document.addEventListener('keyup', function() {
  if (typeof window.keyupCount === 'undefined') {
    window.keyupCount = 0;
  }

  window.keyupCount++;
  document.getElementById('run').click();
  window.keyupCount % 25 === 0 && document.getElementById('update').click();
});