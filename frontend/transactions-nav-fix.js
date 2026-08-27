/* FinPlan v1 — reliable Transactions tab mounting */
(() => {
  const mount = () => {
    const root = document.querySelector('#transactionsWorkspace');
    if (!root) return;
    document.querySelectorAll('.dashboard-grid,.summary-grid,.budget-list-panel,.transactions-panel').forEach(el => el.hidden = true);
    root.hidden = false;
    root.classList.add('visible');
    root.dataset.workspace = 'transactions';
    if (typeof window.openTransactionsWorkspace === 'function') {
      window.openTransactionsWorkspace();
      return;
    }
    window.dispatchEvent(new CustomEvent('finplan:transactions-open'));
  };
  document.addEventListener('click', event => {
    const item = event.target.closest('.nav-item[data-section="transactions"], #viewTransactionsButton');
    if (!item) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-section="transactions"]')?.classList.add('active');
    mount();
  }, true);
})();