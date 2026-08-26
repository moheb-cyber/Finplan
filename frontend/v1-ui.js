/* FinPlan v1 — final UI interactions */
(() => {
    const API_BASE = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const $ = (selector, root = document) => root.querySelector(selector);
    const lang = () => document.documentElement.lang === "fa" ? "fa" : "en";
    const fa = () => lang() === "fa";
    const api = async (path, options = {}) => {
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: { "Content-Type": "application/json", ...(options.headers || {}) }
        });
        if (!response.ok) throw new Error(`API ${response.status}`);
        return response.json();
    };
    const toast = message => {
        const el = $("#toast");
        if (!el) return;
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
    };
    const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    function addTransactionModal() {
        if ($("#transactionModal")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <div class="v1-modal" id="transactionModal" hidden>
                <div class="v1-modal-backdrop" data-close-modal></div>
                <section class="v1-modal-card" role="dialog" aria-modal="true" aria-labelledby="transactionModalTitle">
                    <button class="v1-modal-close" type="button" data-close-modal aria-label="Close">×</button>
                    <span class="panel-label">${fa() ? "تراکنش" : "TRANSACTION"}</span>
                    <h2 id="transactionModalTitle">${fa() ? "افزودن تراکنش" : "Add transaction"}</h2>
                    <form id="transactionForm" class="v1-form">
                        <label>${fa() ? "عنوان" : "Title"}<input name="title" required maxlength="80" autocomplete="off"></label>
                        <label>${fa() ? "مبلغ" : "Amount"}<input name="amount" type="number" min="1" step="1" required inputmode="decimal"></label>
                        <div class="v1-form-grid">
                            <label>${fa() ? "نوع" : "Type"}<select name="type"><option value="expense">${fa() ? "هزینه" : "Expense"}</option><option value="income">${fa() ? "درآمد" : "Income"}</option></select></label>
                            <label>${fa() ? "دسته‌بندی" : "Category"}<input name="category" required maxlength="40" value="General"></label>
                        </div>
                        <label>${fa() ? "تاریخ" : "Date"}<input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
                        <div class="v1-form-actions"><button type="button" class="panel-button" data-close-modal>${fa() ? "انصراف" : "Cancel"}</button><button class="primary-button" type="submit">${fa() ? "افزودن تراکنش" : "Add transaction"}</button></div>
                    </form>
                </section>
            </div>`);
        $("#transactionModal").querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeTransactionModal));
        $("#transactionForm").addEventListener("submit", submitTransaction);
    }

    function openTransactionModal() {
        addTransactionModal();
        $("#transactionModal").hidden = false;
        setTimeout(() => $("#transactionForm input[name=title]")?.focus(), 0);
    }
    function closeTransactionModal() { if ($("#transactionModal")) $("#transactionModal").hidden = true; }

    async function submitTransaction(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const payload = {
            title: String(data.get("title") || "").trim(),
            amount: Math.round(Number(data.get("amount"))),
            type: data.get("type"),
            category: String(data.get("category") || "").trim()
        };
        if (!payload.title || !payload.category || !Number.isFinite(payload.amount) || payload.amount <= 0) return;
        try {
            await api("/transactions", { method: "POST", body: JSON.stringify(payload) });
            closeTransactionModal();
            form.reset();
            toast(fa() ? "تراکنش با موفقیت اضافه شد." : "Transaction added successfully.");
            window.dispatchEvent(new CustomEvent("finplan:dashboard-refresh"));
            window.dispatchEvent(new CustomEvent("finplan:transactions-refresh"));
            if (typeof window.refreshDashboard === "function") await window.refreshDashboard();
        } catch (error) {
            console.error(error);
            toast(fa() ? "افزودن تراکنش ناموفق بود." : "Could not add transaction.");
        }
    }

    function settingsWorkspace() {
        const root = $("#transactionsWorkspace");
        if (!root) return;
        root.hidden = false;
        root.classList.add("visible");
        root.dataset.workspace = "settings";
        const savedTheme = localStorage.getItem("finplan-theme") || "dark";
        root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${fa() ? "تنظیمات" : "SETTINGS"}</span><h2>${fa() ? "تنظیمات FinPlan" : "FinPlan settings"}</h2></div></div><div class="settings-grid"><article class="workspace-card settings-card"><div><span class="panel-label">${fa() ? "ظاهر" : "APPEARANCE"}</span><h3>${fa() ? "تم رابط کاربری" : "Interface theme"}</h3><p>${fa() ? "ظاهر برنامه را انتخاب کن." : "Choose how FinPlan looks."}</p></div><div class="settings-choice"><button class="settings-option ${savedTheme === "dark" ? "active" : ""}" data-theme="dark">${fa() ? "تیره" : "Dark"}</button><button class="settings-option ${savedTheme === "light" ? "active" : ""}" data-theme="light">${fa() ? "روشن" : "Light"}</button></div></article><article class="workspace-card settings-card"><div><span class="panel-label">${fa() ? "زبان" : "LANGUAGE"}</span><h3>${fa() ? "زبان برنامه" : "Interface language"}</h3><p>${fa() ? "زبان متن‌های رابط را تغییر بده." : "Switch interface language."}</p></div><button class="settings-wide" id="settingsLanguage">${fa() ? "فارسی" : "English"}</button></article><article class="workspace-card settings-card"><div><span class="panel-label">${fa() ? "واحد پول" : "CURRENCY"}</span><h3>${fa() ? "واحد نمایش مبالغ" : "Display currency"}</h3><p>${fa() ? "واحد نمایش Dashboard را انتخاب کن." : "Choose the dashboard display currency."}</p></div><button class="settings-wide" id="settingsCurrency">${$(".currency-current")?.textContent || "USD"}</button></article><article class="workspace-card settings-card"><div><span class="panel-label">${fa() ? "داده" : "DATA"}</span><h3>${fa() ? "تنظیمات محلی" : "Local preferences"}</h3><p>${fa() ? "تنظیمات ظاهری و انتخاب‌های محلی را پاک می‌کند؛ تراکنش‌ها حذف نمی‌شوند." : "Reset local UI preferences. Your transactions are not deleted."}</p></div><button class="settings-danger" id="resetPreferences">${fa() ? "بازنشانی تنظیمات" : "Reset preferences"}</button></article></div>`;
        root.querySelectorAll("[data-theme]").forEach(button => button.addEventListener("click", () => applyTheme(button.dataset.theme)));
        $("#settingsLanguage")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("finplan:toggle-language")));
        $("#settingsCurrency")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("finplan:toggle-currency")));
        $("#resetPreferences")?.addEventListener("click", () => { localStorage.removeItem("finplan-theme"); applyTheme("dark"); toast(fa() ? "تنظیمات بازنشانی شد." : "Preferences reset."); });
    }

    function applyTheme(theme) {
        const value = theme === "light" ? "light" : "dark";
        localStorage.setItem("finplan-theme", value);
        document.documentElement.dataset.theme = value;
        settingsWorkspace();
    }

    function profileFix() {
        const profile = $(".profile");
        if (!profile) return;
        profile.innerHTML = `<div class="avatar" aria-hidden="true">M</div><div class="profile-info"><strong>Moheb</strong><span data-i18n="personalAccount">Personal account</span></div>`;
        profile.classList.add("profile-fixed");
    }

    function wire() {
        addTransactionModal();
        $("#addTransactionButton")?.addEventListener("click", openTransactionModal);
        $(".profile") && profileFix();
        const savedTheme = localStorage.getItem("finplan-theme") || "dark";
        document.documentElement.dataset.theme = savedTheme;
        window.addEventListener("finplan:open-settings", settingsWorkspace);
        window.addEventListener("finplan:toggle-language", () => { const button = $("#languageSelector"); button?.click(); setTimeout(settingsWorkspace, 0); });
        window.addEventListener("finplan:toggle-currency", () => { const button = $("#currencySelector"); button?.click(); setTimeout(settingsWorkspace, 0); });
        document.querySelectorAll(".nav-item[data-section]").forEach(item => item.addEventListener("click", event => {
            if (item.dataset.section !== "settings") return;
            event.preventDefault();
            document.querySelectorAll(".nav-item[data-section]").forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            [".dashboard-grid", ".summary-grid", ".budget-list-panel", ".transactions-panel"].forEach(selector => $(selector)?.setAttribute("hidden", "true"));
            settingsWorkspace();
        }));
    }
    document.addEventListener("DOMContentLoaded", wire);
})();