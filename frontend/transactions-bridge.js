/* FinPlan v1 — deterministic Transactions navigation */
(() => {
  function mount() {
    const root = document.querySelector('#transactionsWorkspace');
    if (!root) return;
    root.hidden = false;
    root.classList.add('visible');
    root.dataset.workspace = 'transactions';
    if (typeof window.openTransactionsWorkspace === 'function') {
      window.openTransactionsWorkspace();
    } else {
      setTimeout(mount, 50);
    }
  }
  document.addEventListener('click', (event) => {
    const item = event.target.closest('.nav-item[data-section="transactions"]');
    if (!item) return;
    event.preventDefault();
    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.dashboard-grid,.summary-grid,.budget-list-panel,.transactions-panel').forEach(el => el.setAttribute('hidden','true'));
    mount();
  }, true);
  window.addEventListener('finplan:transactions-open', mount);
})();