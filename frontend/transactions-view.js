/* FinPlan v1 — Transactions workspace */
(() => {
    const labels = { en:{transactions:"TRANSACTIONS",title:"Transaction history",search:"Search title or category…",allTypes:"All types",allCategories:"All categories",income:"Income",expense:"Expense",count:"transactions",noTransactions:"No transactions yet",deleteConfirm:"Delete this transaction?",deleted:"Transaction deleted",updated:"Transaction updated",failed:"Could not complete the action",add:"Add transaction",edit:"Edit transaction",save:"Save changes",cancel:"Cancel",titleField:"Title",amount:"Amount",type:"Type",category:"Category"}, fa:{transactions:"تراکنش‌ها",title:"تاریخچه تراکنش‌ها",search:"جستجوی عنوان یا دسته‌بندی…",allTypes:"همه انواع",allCategories:"همه دسته‌ها",income:"درآمد",expense:"هزینه",count:"تراکنش",noTransactions:"هنوز تراکنشی ثبت نشده است",deleteConfirm:"این تراکنش حذف شود؟",deleted:"تراکنش حذف شد",updated:"تراکنش به‌روزرسانی شد",failed:"عملیات انجام نشد",add:"افزودن تراکنش",edit:"ویرایش تراکنش",save:"ذخیره تغییرات",cancel:"انصراف",titleField:"عنوان",amount:"مبلغ",type:"نوع",category:"دسته‌بندی"} };
    const lang = () => document.documentElement.lang === "fa" ? "fa" : "en";
    const text = key => labels[lang()][key] || key;
    const token = () => localStorage.getItem("finplan-token");
    const esc = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
    const money = value => document.querySelector(".currency-current")?.textContent === "IRR" ? `${Number(value || 0).toLocaleString("fa-IR")} ﷼` : `$${Number(value || 0).toLocaleString("en-US")}`;
    const root = () => document.querySelector("#transactionsWorkspace");
    const toast = message => window.showToast?.(message);
    let filters = { type:"all", category:"all", search:"" }, cache = [];

    async function api(path, options = {}) {
        if (!token()) throw new Error("Unauthorized");
        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        headers.set("Authorization", `Bearer ${token()}`);
        const response = await fetch(path, { ...options, headers });
        if (response.status === 401) { window.dispatchEvent(new CustomEvent("finplan:auth-required")); throw new Error("Unauthorized"); }
        if (!response.ok) throw new Error(`API ${response.status}`);
        return response.json();
    }

    function render() {
        const r = root(); if (!r) return;
        const items = cache.filter(i => (filters.type === "all" || i.type === filters.type) && (filters.category === "all" || i.category === filters.category) && (!filters.search || `${i.title} ${i.category}`.toLowerCase().includes(filters.search.toLowerCase()))).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        const categories = [...new Set(cache.map(x => x.category).filter(Boolean))].sort();
        r.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${text("transactions")}</span><h2>${text("title")}</h2></div><div class="workspace-header-actions"><span class="panel-caption">${items.length} ${text("count")}</span><button class="primary-button" id="workspaceAddTransaction" type="button">＋ ${text("add")}</button></div></div><div class="workspace-filters"><input id="transactionSearch" type="search" placeholder="${text("search")}" value="${esc(filters.search)}"><select id="transactionType" aria-label="${text("type")}"><option value="all">${text("allTypes")}</option><option value="income" ${filters.type === "income" ? "selected" : ""}>${text("income")}</option><option value="expense" ${filters.type === "expense" ? "selected" : ""}>${text("expense")}</option></select><select id="transactionCategory" aria-label="${text("category")}"><option value="all">${text("allCategories")}</option>${categories.map(c => `<option value="${esc(c)}" ${filters.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div><div class="workspace-table">${items.map(i => `<div class="transaction-row workspace-row"><div><strong>${esc(i.title)}</strong><span>${esc(i.category)}</span></div><div class="transaction-row-meta"><span>${new Intl.DateTimeFormat(lang()==="fa"?"fa-IR":"en-US",{month:"short",day:"numeric"}).format(new Date(i.created_at))}</span><strong class="${i.type === "income" ? "positive" : "negative"}">${i.type === "income" ? "+" : "-"}${money(i.amount)}</strong><button class="table-action" data-edit="${i.id}" type="button" aria-label="${text("edit")}">✎</button><button class="table-action danger" data-delete="${i.id}" type="button" aria-label="Delete">×</button></div></div>`).join("") || `<div class="empty-state">${text("noTransactions")}</div>`}</div>`;
        $("#transactionSearch").oninput = e => { filters.search = e.target.value; render(); };
        $("#transactionType").onchange = e => { filters.type = e.target.value; render(); };
        $("#transactionCategory").onchange = e => { filters.category = e.target.value; render(); };
        $("#workspaceAddTransaction").onclick = () => openForm();
        r.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => remove(b.dataset.delete));
        r.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openForm(b.dataset.edit));
    }

    function openForm(id = null) {
        const item = id ? cache.find(x => String(x.id) === String(id)) : null;
        document.querySelector("#transactionWorkspaceModal")?.remove();
        document.body.insertAdjacentHTML("beforeend", `<div class="v1-modal" id="transactionWorkspaceModal"><div class="v1-modal-backdrop" data-close></div><section class="v1-modal-card" role="dialog" aria-modal="true"><button class="v1-modal-close" type="button" data-close>×</button><span class="panel-label">${text("transactions")}</span><h2>${item ? text("edit") : text("add")}</h2><form class="v1-form" id="workspaceTransactionForm"><label>${text("titleField")}<input name="title" required maxlength="80" value="${esc(item?.title || "")}"></label><div class="v1-form-grid"><label>${text("amount")}<input name="amount" type="number" min="1" step="1" required value="${item?.amount ?? ""}"></label><label>${text("type")}<select name="type"><option value="expense" ${item?.type === "expense" || !item ? "selected" : ""}>${text("expense")}</option><option value="income" ${item?.type === "income" ? "selected" : ""}>${text("income")}</option></select></label></div><label>${text("category")}<input name="category" required maxlength="40" value="${esc(item?.category || "General")}"></label><div class="v1-form-actions"><button type="button" class="secondary-button" data-close>${text("cancel")}</button><button class="primary-button" type="submit">${item ? text("save") : text("add")}</button></div></form></section></div>`);
        document.querySelectorAll("#transactionWorkspaceModal [data-close]").forEach(e => e.onclick = () => document.querySelector("#transactionWorkspaceModal")?.remove());
        $("#workspaceTransactionForm").onsubmit = e => saveForm(e, id);
        $("#workspaceTransactionForm input[name=title]")?.focus();
    }

    async function saveForm(e, id) {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const payload = { title:String(d.get("title") || "").trim(), amount:Math.round(Number(d.get("amount"))), type:d.get("type"), category:String(d.get("category") || "").trim() };
        if (!payload.title || !payload.category || !Number.isFinite(payload.amount) || payload.amount <= 0) return;
        try { await api(id ? `/transactions/${id}` : "/transactions", { method:id ? "PUT" : "POST", body:JSON.stringify(payload) }); document.querySelector("#transactionWorkspaceModal")?.remove(); await load(); toast(id ? text("updated") : text("add")); await window.refreshDashboard?.(); } catch(error) { if(error.message !== "Unauthorized") console.error(error); toast(text("failed")); }
    }
    async function remove(id) { if(!confirm(text("deleteConfirm"))) return; try { await api(`/transactions/${id}`, {method:"DELETE"}); await load(); toast(text("deleted")); await window.refreshDashboard?.(); } catch(error) { if(error.message !== "Unauthorized") console.error(error); toast(text("failed")); } }
    async function load() { if(!token()) return; try { cache = await api("/transactions"); render(); } catch(error) { if(error.message !== "Unauthorized") console.error(error); } }
    function open() { const r=root(); if(!r)return; r.hidden=false; r.classList.add("visible"); r.dataset.workspace="transactions"; load(); }

    window.addEventListener("finplan:transactions-open", open);
    window.addEventListener("finplan:transactions-refresh", load);
    window.addEventListener("finplan:language-change", () => { if(root()?.dataset.workspace === "transactions") render(); });
    document.addEventListener("DOMContentLoaded", () => { $("#addTransactionButton")?.addEventListener("click", openForm); });
})();