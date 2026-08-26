/* FinPlan — Transactions Workspace */
(() => {
    const API_BASE = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    let filters = { type: "all", category: "all", search: "" };
    let transactionsCache = [];

    const labels = {
        en: { transactions: "TRANSACTIONS", title: "Transaction history", search: "Search title or category…", allTypes: "All types", allCategories: "All categories", income: "Income", expense: "Expense", count: "transactions", transaction: "Transaction", category: "Category", date: "Date", amount: "Amount", noTransactions: "No transactions yet", deleteConfirm: "Delete this transaction?", deleted: "Transaction deleted", updated: "Transaction updated", failed: "Could not complete the action", titlePrompt: "Transaction title", amountPrompt: "Amount", typePrompt: "Type: income or expense", categoryPrompt: "Category" },
        fa: { transactions: "تراکنش‌ها", title: "تاریخچه تراکنش‌ها", search: "جستجوی عنوان یا دسته‌بندی…", allTypes: "همه انواع", allCategories: "همه دسته‌ها", income: "درآمد", expense: "هزینه", count: "تراکنش", transaction: "تراکنش", category: "دسته‌بندی", date: "تاریخ", amount: "مبلغ", noTransactions: "هنوز تراکنشی ثبت نشده است", deleteConfirm: "این تراکنش حذف شود؟", deleted: "تراکنش حذف شد", updated: "تراکنش به‌روزرسانی شد", failed: "عملیات انجام نشد", titlePrompt: "عنوان تراکنش", amountPrompt: "مبلغ", typePrompt: "نوع: income یا expense", categoryPrompt: "دسته‌بندی" }
    };

    const lang = () => document.documentElement.lang === "fa" ? "fa" : "en";
    const text = key => labels[lang()][key] || key;
    const safe = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const currency = () => document.querySelector(".currency-current")?.textContent === "IRR" ? "IRR" : "USD";
    const money = value => currency() === "IRR" ? `${Number(value || 0).toLocaleString("fa-IR")} تومان` : `$${(Number(value || 0) / 100000).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    const toast = message => { const el = document.querySelector("#toast"); if (!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600); };
    const api = async (endpoint, options = {}) => { const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }); if (!response.ok) throw new Error(`API Error ${response.status}`); return response.json(); };

    const filterTransactions = () => transactionsCache.filter(item => (filters.type === "all" || item.type === filters.type) && (filters.category === "all" || item.category === filters.category) && (!filters.search || `${item.title} ${item.category}`.toLowerCase().includes(filters.search.toLowerCase()))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    function render() {
        const root = document.querySelector("#transactionsWorkspace");
        if (!root) return;
        const items = filterTransactions();
        const rows = items.map(item => `<div class="transaction-row workspace-row"><div><strong>${safe(item.title)}</strong><span>${safe(item.category)}</span></div><div class="transaction-row-meta"><span>${new Intl.DateTimeFormat(lang() === "fa" ? "fa-IR" : "en-US", { month: "short", day: "numeric" }).format(new Date(item.created_at))}</span><strong class="${item.type === "income" ? "positive" : "negative"}">${item.type === "income" ? "+" : "-"}${money(item.amount)}</strong><button class="table-action" data-delete="${item.id}" type="button" aria-label="Delete">×</button></div></div>`).join("");
        root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${text("transactions")}</span><h2>${text("title")}</h2></div><span class="panel-caption">${items.length} ${text("count")}</span></div><div class="workspace-filters"><input id="transactionSearch" type="search" placeholder="${text("search")}" value="${safe(filters.search)}"><select id="transactionType"><option value="all">${text("allTypes")}</option><option value="income">${text("income")}</option><option value="expense">${text("expense")}</option></select><select id="transactionCategory"><option value="all">${text("allCategories")}</option>${[...new Set(transactionsCache.map(x => x.category))].sort().map(c => `<option value="${safe(c)}" ${filters.category === c ? "selected" : ""}>${safe(c)}</option>`).join("")}</select></div><div class="workspace-table">${rows || `<div class="empty-state">${text("noTransactions")}</div>`}</div>`;
        root.querySelector("#transactionSearch")?.addEventListener("input", e => { filters.search = e.target.value; render(); });
        root.querySelector("#transactionType")?.addEventListener("change", e => { filters.type = e.target.value; render(); });
        root.querySelector("#transactionCategory")?.addEventListener("change", e => { filters.category = e.target.value; render(); });
        root.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", async () => { if (!confirm(text("deleteConfirm"))) return; try { await api(`/transactions/${button.dataset.delete}`, { method: "DELETE" }); await load(); toast(text("deleted")); } catch { toast(text("failed")); } }));
    }

    async function load() { try { transactionsCache = await api("/transactions"); render(); } catch { const root = document.querySelector("#transactionsWorkspace"); if (root) root.innerHTML = `<div class="empty-state">${text("failed")}</div>`; } }

    function open() { document.querySelector("#transactionsWorkspace")?.classList.add("visible"); load(); }
    window.addEventListener("finplan:transactions-open", open);
    window.addEventListener("finplan:transactions-refresh", load);
})();