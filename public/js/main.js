// App-wide client bootstrap
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Enable tooltips if Bootstrap is available
    if (window.bootstrap && window.bootstrap.Tooltip) {
      document
        .querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach((el) => new window.bootstrap.Tooltip(el));
    }
  });
})();

