/* =========================================================
   FinPlan — Transactions Workspace
   ========================================================= */

(() => {
    let transactionFilters = {
        type: "all",
        category: "all",
        search: ""
    };

    const styles = `
        .transactions-workspace{display:none;margin-top:12px}
        .transactions-workspace.visible{display:block}
        .transactions-toolbar{display:grid;grid-template-columns:minmax(180px,1.5fr) repeat(2,minmax(140px,.7fr));gap:9px;margin-top:18px}
        .transactions-input,.transactions-select{height:40px;width:100%;padding:0 12px;border:1px solid var(--border);border-radius:11px;background:rgba(255,255,255,.025);color:var(--text);outline:none;font-size:11px}
        .transactions-input::placeholder{color:var(--muted-2)}
        .transactions-input:focus,.transactions-select:focus{border-color:rgba(212,175,55,.35);background:rgba(255,255,255,.035)}
        .transactions-select option{background:#151515;color:#f4f3ef}
        .transactions-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}
        .transaction-stat{padding:14px;border:1px solid var(--border);border-radius:13px;background:rgba(255,255,255,.018)}
        .transaction-stat span{display:block;color:var(--muted);font-size:9px}
        .transaction-stat strong{display:block;margin-top:7px;font-size:16px}
        .transaction-stat.income strong{color:var(--green)}
        .transaction-stat.expense strong{color:var(--red)}
        .transaction-table{margin-top:12px;overflow:hidden;border:1px solid var(--border);border-radius:14px}
        .transaction-row{display:grid;grid-template-columns:1.5fr .85fr .8fr .85fr auto;gap:12px;align-items:center;min-height:58px;padding:0 15px;border-top:1px solid var(--border);font-size:10px}
        .transaction-row:first-child{border-top:0}
        .transaction-row.header{min-height:38px;background:rgba(255,255,255,.025);color:var(--muted-2);font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
        .transaction-main{min-width:0;display:flex;align-items:center;gap:9px}
        .transaction-main strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .transaction-row .transaction-icon{width:32px;height:32px;border-radius:9px}
        .transaction-category,.transaction-date{color:var(--muted)}
        .transaction-actions{display:flex;justify-content:flex-end;gap:5px}
        .transaction-action{width:30px;height:30px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--muted);cursor:pointer}
        .transaction-action:hover{color:var(--text);border-color:rgba(212,175,55,.3);background:rgba(212,175,55,.06)}
        .transaction-action.delete:hover{color:var(--red);border-color:rgba(223,119,119,.3);background:rgba(223,119,119,.06)}
        .transactions-empty{padding:42px 15px;text-align:center;color:var(--muted);font-size:10px}
        .transactions-close{display:none}
        @media(max-width:850px){.transactions-toolbar{grid-template-columns:1fr 1fr}.transactions-toolbar .transactions-input{grid-column:1/-1}.transaction-row{grid-template-columns:1.5fr .8fr auto}.transaction-row.header{display:none}.transaction-row .transaction-date,.transaction-row .transaction-category{display:none}}
        @media(max-width:620px){.transactions-summary{grid-template-columns:1fr}.transactions-toolbar{grid-template-columns:1fr}.transactions-toolbar .transactions-input{grid-column:auto}.transaction-row{grid-template-columns:1fr auto;padding:9px 12px}.transaction-row .transaction-amount{grid-column:2}.transaction-row .transaction-actions{grid-column:2}.transaction-main{grid-row:1/3}.transactions-workspace .panel-header{align-items:center}.transactions-workspace .panel-caption{display:none}}
    `;

    function injectStyles() {
        if (document.querySelector("#transactionsWorkspaceStyles")) return;
        const style = document.createElement("style");
        style.id = "transactionsWorkspaceStyles";
        style.textContent = styles;
        document.head.appendChild(style);
    }

    function t(key) {
        return window.translations?.[window.currentLanguage || "en"]?.[key] || key;
    }

    function money(value) {
        if (typeof window.formatMoney === "function") return window.formatMoney(value);
        return String(value ?? 0);
    }

    function safe(value) {
        if (typeof window.escapeHTML === "function") return window.escapeHTML(value);
        return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function allTransactions() {
        return Array.isArray(window.transactionsData) ? window.transactionsData : [];
    }

    function filteredTransactions() {
        const search = transactionFilters.search.trim().toLowerCase();
        return allTransactions()
            .filter(item => transactionFilters.type === "all" || item.type === transactionFilters.type)
            .filter(item => transactionFilters.category === "all" || item.category === transactionFilters.category)
            .filter(item => !search || `${item.title} ${item.category}`.toLowerCase().includes(search))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    function categories() {
        return [...new Set(allTransactions().map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }

    function buildWorkspace() {
        if (document.querySelector("#transactionsWorkspace")) return;

        const main = document.querySelector(".main");
        const dashboardPanels = main?.querySelectorAll(":scope > section");
        if (!main || !dashboardPanels?.length) return;

        const workspace = document.createElement("section");
        workspace.id = "transactionsWorkspace";
        workspace.className = "transactions-workspace panel";
        workspace.innerHTML = `
            <div class="panel-header">
                <div>
                    <span class="panel-label">${safe(t("transactions"))}</span>
                    <h3>${window.currentLanguage === "fa" ? "مدیریت تراکنش‌ها" : "Transaction history"}</h3>
                </div>
                <span class="panel-caption" id="transactionsWorkspaceCount">0</span>
            </div>
            <div class="transactions-toolbar">
                <input id="transactionSearch" class="transactions-input" type="search" autocomplete="off" placeholder="${safe(window.currentLanguage === "fa" ? "جستجوی عنوان یا دسته‌بندی…" : "Search title or category…")}">
                <select id="transactionTypeFilter" class="transactions-select">
                    <option value="all">${safe(window.currentLanguage === "fa" ? "همه انواع" : "All types")}</option>
                    <option value="income">${safe(t("income"))}</option>
                    <option value="expense">${safe(t("expense"))}</option>
                </select>
                <select id="transactionCategoryFilter" class="transactions-select"></select>
            </div>
            <div class="transactions-summary">
                <div class="transaction-stat income"><span>${safe(t("income"))}</span><strong id="transactionIncomeTotal">—</strong></div>
                <div class="transaction-stat expense"><span>${safe(t("expense"))}</span><strong id="transactionExpenseTotal">—</strong></div>
                <div class="transaction-stat"><span>${safe(window.currentLanguage === "fa" ? "تعداد تراکنش‌ها" : "Transactions")}</span><strong id="transactionCountTotal">0</strong></div>
            </div>
            <div class="transaction-table" id="transactionTable"></div>
        `;

        main.appendChild(workspace);

        document.querySelector("#transactionSearch")?.addEventListener("input", event => {
            transactionFilters.search = event.target.value;
            renderWorkspace();
        });
        document.querySelector("#transactionTypeFilter")?.addEventListener("change", event => {
            transactionFilters.type = event.target.value;
            renderWorkspace();
        });
        document.querySelector("#transactionCategoryFilter")?.addEventListener("change", event => {
            transactionFilters.category = event.target.value;
            renderWorkspace();
        });
        document.querySelector("#transactionTable")?.addEventListener("click", handleAction);
    }

    function refreshCategoryFilter() {
        const select = document.querySelector("#transactionCategoryFilter");
        if (!select) return;
        const current = transactionFilters.category;
        select.innerHTML = `<option value="all">${safe(window.currentLanguage === "fa" ? "همه دسته‌ها" : "All categories")}</option>` + categories().map(category => `<option value="${safe(category)}">${safe(category)}</option>`).join("");
        select.value = categories().includes(current) ? current : "all";
        if (!categories().includes(current)) transactionFilters.category = "all";
    }

    function renderWorkspace() {
        buildWorkspace();
        const workspace = document.querySelector("#transactionsWorkspace");
        if (!workspace) return;

        refreshCategoryFilter();
        const items = filteredTransactions();
        const income = items.filter(item => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const expense = items.filter(item => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);

        document.querySelector("#transactionIncomeTotal").textContent = money(income);
        document.querySelector("#transactionExpenseTotal").textContent = money(expense);
        document.querySelector("#transactionCountTotal").textContent = String(items.length);
        document.querySelector("#transactionsWorkspaceCount").textContent = `${items.length} ${window.currentLanguage === "fa" ? "تراکنش" : "transactions"}`;

        const table = document.querySelector("#transactionTable");
        if (!table) return;
        if (!items.length) {
            table.innerHTML = `<div class="transactions-empty">${safe(t("noTransactions"))}</div>`;
            return;
        }

        table.innerHTML = `
            <div class="transaction-row header">
                <span>${safe(window.currentLanguage === "fa" ? "تراکنش" : "Transaction")}</span>
                <span>${safe(window.currentLanguage === "fa" ? "دسته‌بندی" : "Category")}</span>
                <span>${safe(window.currentLanguage === "fa" ? "تاریخ" : "Date")}</span>
                <span>${safe(window.currentLanguage === "fa" ? "مبلغ" : "Amount")}</span>
                <span></span>
            </div>
            ${items.map(item => {
                const incomeType = item.type === "income";
                const sign = incomeType ? "+" : "−";
                const date = typeof window.formatTransactionDate === "function" ? window.formatTransactionDate(item.created_at) : new Date(item.created_at).toLocaleDateString();
                return `
                    <div class="transaction-row" data-id="${Number(item.id)}">
                        <div class="transaction-main">
                            <div class="transaction-icon ${incomeType ? "income" : "expense"}">${incomeType ? "↗" : "↘"}</div>
                            <strong>${safe(item.title)}</strong>
                        </div>
                        <span class="transaction-category">${safe(item.category)}</span>
                        <span class="transaction-date">${safe(date)}</span>
                        <strong class="transaction-amount ${incomeType ? "income-text" : "expense-text"}">${sign}${money(item.amount)}</strong>
                        <div class="transaction-actions">
                            <button class="transaction-action" type="button" data-action="edit" data-id="${Number(item.id)}" aria-label="Edit">✎</button>
                            <button class="transaction-action delete" type="button" data-action="delete" data-id="${Number(item.id)}" aria-label="Delete">×</button>
                        </div>
                    </div>
                `;
            }).join("")}
        `;
    }

    async function handleAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const id = Number(button.dataset.id);
        const transaction = allTransactions().find(item => Number(item.id) === id);
        if (!transaction) return;

        if (button.dataset.action === "delete") {
            const confirmed = window.confirm(window.currentLanguage === "fa" ? `تراکنش «${transaction.title}» حذف شود؟` : `Delete “${transaction.title}”?`);
            if (!confirmed) return;
            try {
                await window.apiFetch(`/transactions/${id}`, { method: "DELETE" });
                window.showToast?.(window.currentLanguage === "fa" ? "تراکنش حذف شد" : "Transaction deleted");
                await window.refreshDashboard?.();
                renderWorkspace();
            } catch (error) {
                console.error(error);
                window.showToast?.(window.currentLanguage === "fa" ? "حذف تراکنش انجام نشد" : "Could not delete transaction");
            }
            return;
        }

        const title = window.prompt(window.currentLanguage === "fa" ? "عنوان تراکنش" : "Transaction title", transaction.title);
        if (!title) return;
        const amount = Number(window.prompt(window.currentLanguage === "fa" ? "مبلغ به تومان" : "Amount in toman", String(transaction.amount)));
        if (!Number.isFinite(amount) || amount <= 0) return;
        const type = window.prompt(window.currentLanguage === "fa" ? "نوع: income یا expense" : "Type: income or expense", transaction.type)?.toLowerCase();
        if (!["income", "expense"].includes(type)) return;
        const category = window.prompt(window.currentLanguage === "fa" ? "دسته‌بندی" : "Category", transaction.category);
        if (!category) return;

        try {
            await window.apiFetch(`/transactions/${id}`, {
                method: "PUT",
                body: JSON.stringify({ title: title.trim(), amount: Math.round(amount), type, category: category.trim() })
            });
            window.showToast?.(window.currentLanguage === "fa" ? "تراکنش به‌روزرسانی شد" : "Transaction updated");
            await window.refreshDashboard?.();
            renderWorkspace();
        } catch (error) {
            console.error(error);
            window.showToast?.(window.currentLanguage === "fa" ? "به‌روزرسانی انجام نشد" : "Could not update transaction");
        }
    }

    function showWorkspace() {
        buildWorkspace();
        const workspace = document.querySelector("#transactionsWorkspace");
        if (!workspace) return;
        document.querySelectorAll(".main > section:not(#transactionsWorkspace)").forEach(section => {
            section.dataset.dashboardVisibility = section.dataset.dashboardVisibility || section.style.display || "";
            section.style.display = "none";
        });
        workspace.classList.add("visible");
        renderWorkspace();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showDashboard() {
        const workspace = document.querySelector("#transactionsWorkspace");
        document.querySelectorAll(".main > section:not(#transactionsWorkspace)").forEach(section => {
            section.style.display = section.dataset.dashboardVisibility || "";
        });
        workspace?.classList.remove("visible");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function installNavigation() {
        document.addEventListener("click", event => {
            const nav = event.target.closest(".nav-item[data-section]");
            const viewTransactions = event.target.closest("#viewTransactionsButton");
            if (!nav && !viewTransactions) return;

            const section = nav?.dataset.section;
            if (section !== "transactions" && !viewTransactions && section !== "dashboard") return;

            event.preventDefault();
            event.stopImmediatePropagation();

            document.querySelectorAll(".nav-item[data-section]").forEach(item => item.classList.toggle("active", item === nav));

            if (section === "transactions" || viewTransactions) showWorkspace();
            else showDashboard();
        }, true);
    }

    function patchExternalRefresh() {
        const original = window.refreshDashboard;
        if (typeof original !== "function" || original.__transactionsPatched) return;
        const wrapped = async (...args) => {
            const result = await original(...args);
            if (document.querySelector("#transactionsWorkspace.visible")) renderWorkspace();
            return result;
        };
        wrapped.__transactionsPatched = true;
        window.refreshDashboard = wrapped;
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectStyles();
        installNavigation();
        setTimeout(() => {
            patchExternalRefresh();
            if (window.transactionsData) renderWorkspace();
        }, 0);
    });
})();
