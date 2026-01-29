// Basic offline indicator toggling
(function () {
  function update() {
    const el = document.getElementById('offline-indicator');
    if (!el) return;
    if (navigator.onLine) el.classList.add('d-none');
    else el.classList.remove('d-none');
  }

  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  document.addEventListener('DOMContentLoaded', update);
})();

