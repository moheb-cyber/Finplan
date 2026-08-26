function setupControls() {
    document.querySelector("#languageSelector")?.addEventListener("click", () => setLanguage(currentLanguage === "en" ? "fa" : "en"));
    document.querySelector("#currencySelector")?.addEventListener("click", () => setCurrency(currentCurrency === "USD" ? "IRR" : "USD"));

    document.querySelector("#monthSelector")?.addEventListener("click", async () => {
        const next = window.prompt(t("monthPrompt"), currentMonth);
        if (!next) return;
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(next)) {
            showToast(t("invalidMonth"));
            return;
        }
        currentMonth = next;
        updateMonthLabel();
        await refreshDashboard();
    });

    document.querySelector("#addTransactionButton")?.addEventListener("click", addTransactionPrompt);
    document.querySelector("#notificationButton")?.addEventListener("click", () => showToast(currentLanguage === "fa" ? "اعلان جدیدی وجود ندارد" : "You're all caught up"));
    document.querySelector("#viewTransactionsButton")?.addEventListener("click", () => {
        const transactionsNav = document.querySelector('.nav-item[data-section="transactions"]');
        transactionsNav?.click();
    });
    document.querySelector("#viewBudgetsButton")?.addEventListener("click", () => {
        const budgetsNav = document.querySelector('.nav-item[data-section="budgets"]');
        if (budgetsNav) budgetsNav.click();
        else document.querySelector(".budget-list-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelectorAll(".nav-item[data-section]").forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            document.querySelectorAll(".nav-item[data-section]").forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            const section = item.dataset.section;

            if (section === "dashboard") {
                document.querySelector("#transactionsWorkspace")?.classList.remove("visible");
                document.querySelector(".dashboard-grid")?.removeAttribute("hidden");
                document.querySelector(".summary-grid")?.removeAttribute("hidden");
                document.querySelector(".budget-list-panel")?.removeAttribute("hidden");
                document.querySelector(".transactions-panel")?.removeAttribute("hidden");
                return;
            }

            if (section === "transactions") {
                document.querySelector(".dashboard-grid")?.setAttribute("hidden", "true");
                document.querySelector(".summary-grid")?.setAttribute("hidden", "true");
                document.querySelector(".budget-list-panel")?.setAttribute("hidden", "true");
                document.querySelector(".transactions-panel")?.setAttribute("hidden", "true");
                document.querySelector("#transactionsWorkspace")?.classList.add("visible");
                window.dispatchEvent(new CustomEvent("finplan:transactions-open"));
                return;
            }

            showToast(currentLanguage === "fa" ? `بخش ${t(section)} در مرحله بعد ساخته می‌شود` : `${section[0].toUpperCase() + section.slice(1)} is next`);
        });
    });
}

async function addTransactionPrompt() {
    const title = window.prompt(currentLanguage === "fa" ? "عنوان تراکنش" : "Transaction title");
    if (!title?.trim()) return;
    const amount = Number(window.prompt(currentLanguage === "fa" ? "مبلغ به تومان" : "Amount in toman", "100000"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const type = window.prompt(currentLanguage === "fa" ? "نوع: income یا expense" : "Type: income or expense", "expense")?.toLowerCase();
    if (!['income', 'expense'].includes(type)) return;
    const category = window.prompt(currentLanguage === "fa" ? "دسته‌بندی" : "Category", "General");
    if (!category?.trim()) return;

    try {
        await apiFetch("/transactions", {
            method: "POST",
            body: JSON.stringify({ title: title.trim(), amount: Math.round(amount), type, category: category.trim() })
        });
        showToast(t("transactionAdded"));
        await refreshDashboard();
        window.dispatchEvent(new CustomEvent("finplan:transactions-refresh"));
    } catch (error) {
        console.error(error);
        showToast(t("transactionFailed"));
    }
}

function showToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function initFinPlan() {
    setupControls();
    setLanguage(currentLanguage);
    updateMonthLabel();
    await refreshDashboard();
}

document.addEventListener("DOMContentLoaded", initFinPlan);