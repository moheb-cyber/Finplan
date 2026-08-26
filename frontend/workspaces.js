/* FinPlan v1 — Budgets & Analytics workspaces */
(() => {
    const API_BASE = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const state = { month: localStorage.getItem("finplan-month") || new Date().toISOString().slice(0, 7), budgets: [], transactions: [] };
    const $ = selector => document.querySelector(selector);
    const lang = () => document.documentElement.lang === "fa" ? "fa" : "en";
    const fa = () => lang() === "fa";
    const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const money = value => fa() ? `${Number(value || 0).toLocaleString("fa-IR")} ﷼` : `$${Number(value || 0).toLocaleString("en-US")}`;
    const api = async (path, options = {}) => { const r = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }); if (!r.ok) throw new Error(`API ${r.status}`); return r.json(); };
    const toast = message => { const el = $("#toast"); if (!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2400); };
    const month = () => state.month;

    function mount(kind) {
        const root = $("#transactionsWorkspace");
        if (!root) return;
        root.hidden = false;
        root.classList.add("visible");
        root.dataset.workspace = kind;
        if (kind === "budgets") renderBudgets(root);
        if (kind === "analytics") renderAnalytics(root);
        if (kind === "dashboard") { root.classList.remove("visible"); root.hidden = true; }
    }

    async function renderBudgets(root) {
        root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${fa() ? "بودجه" : "BUDGETS"}</span><h2>${fa() ? "مدیریت بودجه ماهانه" : "Monthly budgets"}</h2></div><button class="primary-button workspace-add" id="addBudgetButton" type="button">＋ ${fa() ? "افزودن بودجه" : "Add budget"}</button></div><div class="workspace-grid" id="budgetWorkspaceGrid"><div class="loading-state">Loading…</div></div>`;
        try {
            const [budgets, summary] = await Promise.all([api(`/budgets?month=${encodeURIComponent(month())}`), api(`/budgets/summary?month=${encodeURIComponent(month())}`)]);
            state.budgets = budgets;
            const byCategory = Object.fromEntries(summary.map(item => [item.category, item]));
            $("#budgetWorkspaceGrid").innerHTML = budgets.map(item => {
                const s = byCategory[item.category] || { spent: 0, remaining: item.amount, spent_percentage: 0, status: "on_track" };
                return `<article class="workspace-card"><div class="workspace-card-top"><div><span class="panel-label">${esc(item.category)}</span><strong>${money(item.amount)}</strong></div><span class="workspace-status ${esc(s.status)}">${s.status === "over_budget" ? (fa() ? "عبور از بودجه" : "Over budget") : s.status === "reached" ? (fa() ? "تکمیل" : "Reached") : (fa() ? "در مسیر" : "On track")}</span></div><div class="workspace-progress"><span style="width:${Math.min(Math.max(Number(s.spent_percentage) || 0, 0), 100)}%"></span></div><div class="workspace-card-meta"><span>${fa() ? "مصرف" : "Spent"} <b>${money(s.spent)}</b></span><span>${fa() ? "باقی‌مانده" : "Remaining"} <b>${money(s.remaining)}</b></span></div><div class="workspace-actions"><button type="button" data-edit-budget="${item.id}">${fa() ? "ویرایش" : "Edit"}</button><button type="button" data-delete-budget="${item.id}">${fa() ? "حذف" : "Delete"}</button></div></article>`;
            }).join("") || `<div class="empty-state">${fa() ? "برای این ماه بودجه‌ای ثبت نشده است." : "No budgets for this month yet."}</div>`;
            $("#addBudgetButton")?.addEventListener("click", addBudget);
            root.querySelectorAll("[data-delete-budget]").forEach(button => button.addEventListener("click", () => deleteBudget(button.dataset.deleteBudget)));
            root.querySelectorAll("[data-edit-budget]").forEach(button => button.addEventListener("click", () => editBudget(button.dataset.editBudget)));
        } catch { $("#budgetWorkspaceGrid").innerHTML = `<div class="empty-state">${fa() ? "دریافت بودجه‌ها ناموفق بود." : "Could not load budgets."}</div>`; }
    }

    async function addBudget() {
        const category = prompt(fa() ? "دسته‌بندی بودجه:" : "Budget category:", "Food");
        if (!category?.trim()) return;
        const amount = Number(prompt(fa() ? "مبلغ بودجه:" : "Budget amount:", "1000"));
        if (!Number.isFinite(amount) || amount <= 0) return;
        try { await api("/budgets", { method: "POST", body: JSON.stringify({ category: category.trim(), amount: Math.round(amount), month: month() }) }); toast(fa() ? "بودجه اضافه شد." : "Budget added."); mount("budgets"); window.dispatchEvent(new CustomEvent("finplan:dashboard-refresh")); } catch (error) { toast(error.message.includes("400") ? (fa() ? "این بودجه از قبل وجود دارد." : "A budget already exists for this category.") : (fa() ? "افزودن بودجه ناموفق بود." : "Could not add budget.")); }
    }

    async function editBudget(id) {
        const item = state.budgets.find(b => String(b.id) === String(id));
        if (!item) return;
        const category = prompt(fa() ? "دسته‌بندی:" : "Category:", item.category);
        if (!category?.trim()) return;
        const amount = Number(prompt(fa() ? "مبلغ:" : "Amount:", item.amount));
        if (!Number.isFinite(amount) || amount <= 0) return;
        try { await api(`/budgets/${id}`, { method: "PUT", body: JSON.stringify({ category: category.trim(), amount: Math.round(amount), month: month() }) }); toast(fa() ? "بودجه به‌روزرسانی شد." : "Budget updated."); mount("budgets"); window.dispatchEvent(new CustomEvent("finplan:dashboard-refresh")); } catch { toast(fa() ? "به‌روزرسانی ناموفق بود." : "Could not update budget."); }
    }

    async function deleteBudget(id) { if (!confirm(fa() ? "این بودجه حذف شود؟" : "Delete this budget?")) return; try { await api(`/budgets/${id}`, { method: "DELETE" }); toast(fa() ? "بودجه حذف شد." : "Budget deleted."); mount("budgets"); window.dispatchEvent(new CustomEvent("finplan:dashboard-refresh")); } catch { toast(fa() ? "حذف ناموفق بود." : "Could not delete budget."); } }

    async function renderAnalytics(root) {
        root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${fa() ? "تحلیل" : "ANALYTICS"}</span><h2>${fa() ? "تحلیل مالی ماه" : "Monthly analytics"}</h2></div><span class="panel-caption">${esc(month())}</span></div><div class="analytics-grid"><div class="workspace-card analytics-main" id="analyticsMain"><div class="loading-state">Loading…</div></div><div class="workspace-card" id="analyticsCategories"><div class="loading-state">Loading…</div></div></div>`;
        try {
            const from = `${month()}-01`, to = `${month()}-31`;
            const [summary, categories] = await Promise.all([api(`/transactions/summary?from_date=${from}&to_date=${to}`), api(`/transactions/expenses-by-category?from_date=${from}&to_date=${to}`)]);
            const total = Number(summary.total_expense) || 0;
            const income = Number(summary.total_income) || 0;
            const balance = Number(summary.balance) || 0;
            $("#analyticsMain").innerHTML = `<div class="analytics-heading"><div><span class="panel-label">${fa() ? "خلاصه" : "SUMMARY"}</span><h3>${fa() ? "عملکرد این ماه" : "This month's performance"}</h3></div><span class="analytics-balance ${balance < 0 ? "negative" : "positive"}">${money(balance)}</span></div><div class="analytics-stats"><div><span>${fa() ? "درآمد" : "Income"}</span><strong>${money(income)}</strong></div><div><span>${fa() ? "هزینه" : "Expenses"}</span><strong>${money(total)}</strong></div><div><span>${fa() ? "تعداد تراکنش" : "Transactions"}</span><strong>${summary.transaction_count}</strong></div></div><div class="analytics-ratio"><span>${fa() ? "نسبت هزینه به درآمد" : "Expense / income"}</span><b>${income ? `${Math.round(total / income * 100)}%` : "—"}</b><div class="workspace-progress"><span style="width:${income ? Math.min(total / income * 100, 100) : 0}%"></span></div></div>`;
            const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
            $("#analyticsCategories").innerHTML = `<span class="panel-label">${fa() ? "دسته‌بندی هزینه" : "EXPENSE CATEGORIES"}</span><h3>${fa() ? "بیشترین هزینه‌ها" : "Where your money goes"}</h3><div class="category-bars">${entries.map(([name, value]) => `<div class="category-bar"><div><span>${esc(name)}</span><b>${money(value)}</b></div><div class="workspace-progress"><span style="width:${total ? value / total * 100 : 0}%"></span></div></div>`).join("") || `<div class="empty-state">${fa() ? "داده‌ای برای تحلیل نیست." : "No expense data yet."}</div>`}</div>`;
        } catch { $("#analyticsMain").innerHTML = `<div class="empty-state">${fa() ? "تحلیل در دسترس نیست." : "Analytics are unavailable."}</div>`; $("#analyticsCategories").innerHTML = ""; }
    }

    window.addEventListener("finplan:workspace", event => mount(event.detail));
    window.addEventListener("finplan:dashboard-refresh", () => { if (state.current === "budgets") mount("budgets"); });
    window.addEventListener("finplan:month-change", event => { state.month = event.detail; if (state.current) mount(state.current); });
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".nav-item[data-section]").forEach(item => item.addEventListener("click", event => {
            const section = item.dataset.section;
            state.current = section;
            if (["budgets", "analytics"].includes(section)) { event.preventDefault(); mount(section); }
            if (section === "dashboard") mount("dashboard");
        }));
        const originalPrompt = window.prompt;
    });
})();