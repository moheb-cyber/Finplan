/* FinPlan v1 UI enhancements — kept separate from the core runtime. */
(() => {
    const API_BASE = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const state = { transactions: [], budgets: [] };
    const $ = selector => document.querySelector(selector);
    const lang = () => document.documentElement.lang === "fa" ? "fa" : "en";
    const escapeHTML = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const api = async path => { const r = await fetch(`${API_BASE}${path}`); if (!r.ok) throw new Error(r.status); return r.json(); };
    const money = value => document.querySelector(".currency-current")?.textContent === "IRR" ? `${Number(value || 0).toLocaleString("fa-IR")} ﷼` : `$${Number(value || 0).toLocaleString("en-US")}`;

    function renderChart() {
        const bars = $("#expenseBars"), legend = $("#chartLegend"), caption = $("#chartCaption");
        if (!bars) return;
        const expenses = state.transactions.filter(x => x.type === "expense");
        const byCategory = {};
        expenses.forEach(x => { byCategory[x.category] = (byCategory[x.category] || 0) + Number(x.amount || 0); });
        const entries = Object.entries(byCategory).sort((a,b) => b[1] - a[1]).slice(0, 6);
        const max = Math.max(...entries.map(x => x[1]), 1);
        bars.innerHTML = entries.length ? entries.map(([category, amount]) => `<div class="bar-group"><div class="bar" style="height:${Math.max(4, amount / max * 78)}%" title="${escapeHTML(category)}: ${escapeHTML(money(amount))}"></div><span>${escapeHTML(category)}</span></div>`).join("") : `<div class="empty-state">${lang() === "fa" ? "هنوز هزینه‌ای ثبت نشده" : "No expenses yet"}</div>`;
        legend.innerHTML = entries.map(([category, amount]) => `<div class="legend-item"><span class="legend-dot"></span><span>${escapeHTML(category)} · ${escapeHTML(money(amount))}</span></div>`).join("");
        if (caption) caption.textContent = entries.length ? `${expenses.length} ${lang() === "fa" ? "هزینه" : "expenses"}` : "—";
    }

    function renderBudgetCards() {
        const list = $("#budgetList");
        if (!list) return;
        const spent = {};
        state.transactions.filter(x => x.type === "expense").forEach(x => spent[x.category] = (spent[x.category] || 0) + Number(x.amount || 0));
        list.innerHTML = state.budgets.length ? state.budgets.map(item => {
            const used = spent[item.category] || 0;
            const percent = Number(item.amount) ? Math.round(used / Number(item.amount) * 100) : 0;
            return `<div class="budget-item"><div class="budget-item-top"><strong>${escapeHTML(item.category)}</strong><span>${escapeHTML(money(item.amount))}</span></div><div class="budget-item-bar"><div class="budget-item-fill ${percent > 100 ? "over" : ""}" style="width:${Math.min(percent, 100)}%"></div></div><div class="budget-item-bottom"><span>${escapeHTML(money(used))} ${lang() === "fa" ? "هزینه" : "spent"}</span><span>${percent}%</span></div></div>`;
        }).join("") : `<div class="empty-state">${lang() === "fa" ? "برای این ماه بودجه‌ای ثبت نشده" : "No budgets set for this month"}`;
    }

    function ensureAnalyticsPanel() {
        if ($("#analyticsPanel")) return;
        const main = $(".main");
        if (!main) return;
        main.insertAdjacentHTML("beforeend", `<section id="analyticsPanel" class="panel v1-analytics" hidden><div class="panel-header"><div><span class="panel-label">ANALYTICS</span><h3>${lang() === "fa" ? "تحلیل مالی" : "Financial insights"}</h3></div><span class="panel-caption">${lang() === "fa" ? "این ماه" : "This month"}</span></div><div class="insight-grid"><div><span>${lang() === "fa" ? "میانگین هزینه" : "Avg. expense"}</span><strong id="avgExpense">—</strong></div><div><span>${lang() === "fa" ? "بیشترین دسته" : "Top category"}</span><strong id="topCategory">—</strong></div><div><span>${lang() === "fa" ? "تعداد تراکنش" : "Transactions"}</span><strong id="transactionCount">0</strong></div></div><div class="category-breakdown" id="categoryBreakdown"></div></section>`);
    }

    function renderAnalytics() {
        ensureAnalyticsPanel();
        const expenses = state.transactions.filter(x => x.type === "expense");
        const total = expenses.reduce((s,x) => s + Number(x.amount || 0), 0);
        const groups = {};
        expenses.forEach(x => groups[x.category] = (groups[x.category] || 0) + Number(x.amount || 0));
        const sorted = Object.entries(groups).sort((a,b) => b[1]-a[1]);
        $("#avgExpense").textContent = expenses.length ? money(total / expenses.length) : "—";
        $("#topCategory").textContent = sorted[0]?.[0] || "—";
        $("#transactionCount").textContent = state.transactions.length;
        $("#categoryBreakdown").innerHTML = sorted.map(([category, amount]) => `<div class="insight-row"><span>${escapeHTML(category)}</span><strong>${escapeHTML(money(amount))}</strong></div>`).join("");
    }

    function patchNavigation() {
        document.querySelectorAll('.nav-item[data-section]').forEach(item => item.addEventListener("click", event => {
            const section = item.dataset.section;
            if (section !== "budgets" && section !== "analytics") return;
            event.preventDefault();
            document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            const dashboardParts = [".dashboard-grid", ".summary-grid", ".budget-list-panel", ".transactions-panel"];
            dashboardParts.forEach(selector => $(selector)?.setAttribute("hidden", "true"));
            $("#transactionsWorkspace")?.classList.remove("visible");
            ensureAnalyticsPanel();
            $("#analyticsPanel")?.setAttribute("hidden", section !== "analytics");
            if (section === "budgets") $(".budget-list-panel")?.removeAttribute("hidden");
        }));
    }

    async function load() {
        try {
            const month = localStorage.getItem("finplan-month") || new Date().toISOString().slice(0,7);
            [state.transactions, state.budgets] = await Promise.all([
                api(`/transactions?from_date=${month}-01&to_date=${month}-31`),
                api(`/budgets?month=${month}`)
            ]);
            renderChart(); renderBudgetCards(); renderAnalytics();
        } catch (error) { console.warn("FinPlan v1 enhancement data load failed", error); }
    }

    document.addEventListener("DOMContentLoaded", () => { patchNavigation(); load(); });
    window.addEventListener("finplan:transactions-refresh", load);
})();