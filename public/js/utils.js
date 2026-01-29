// Basic client utilities (safe no-ops)
(function () {
  window.RC = window.RC || {};
  window.RC.toast = function toast(message) {
    // Keep it simple for now; can be swapped for Bootstrap toast later
    if (message) console.log('[RefugeeConnect]', message);
  };
})();

