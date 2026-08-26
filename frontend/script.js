const API_BASE = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";

let currentLanguage = localStorage.getItem("finplan-language") || "en";
let currentCurrency = localStorage.getItem("finplan-currency") || "USD";
let currentMonth = localStorage.getItem("finplan-month") || new Date().toISOString().slice(0, 7);

const translations = {
    en: {
        dashboard: "Dashboard", transactions: "Transactions", budgets: "Budgets", analytics: "Analytics", settings: "Settings",
        personalFinance: "PERSONAL FINANCE", personalAccount: "Personal account", goodEvening: "Good evening",
        goodMorning: "Good morning", goodAfternoon: "Good afternoon", moneyMessage: "Here's what's happening with your money this month.",
        addTransaction: "Add transaction", totalIncome: "Total Income", totalExpenses: "Total Expenses", currentBalance: "Current Balance",
        budgetRemaining: "Budget Remaining", thisMonth: "this month", healthyBalance: "Healthy balance", used: "used",
        expenseOverview: "EXPENSE OVERVIEW", spendingThisMonth: "Spending this month", budget: "BUDGET", monthlyBudget: "Monthly budget",
        viewAll: "View all", totalBudget: "total budget", spent: "Spent", remaining: "Remaining", onTrack: "You're on track with your budget",
        budgetOverviewLabel: "BUDGETS", budgetOverview: "Budget overview", activity: "ACTIVITY", recentTransactions: "Recent transactions",
        monthPrompt: "Enter month (YYYY-MM):", invalidMonth: "Please enter a valid month like 2026-08.", transactionAdded: "Transaction added.",
        transactionFailed: "Could not add transaction.", noNotifications: "You're all caught up", next: "is next"
    },
    fa: {
        dashboard: "داشبورد", transactions: "تراکنش‌ها", budgets: "بودجه‌ها", analytics: "تحلیل", settings: "تنظیمات",
        personalFinance: "مدیریت مالی شخصی", personalAccount: "حساب شخصی", goodEvening: "عصر بخیر", goodMorning: "صبح بخیر",
        goodAfternoon: "بعدازظهر بخیر", moneyMessage: "وضعیت مالی این ماهت اینجاست.", addTransaction: "افزودن تراکنش",
        totalIncome: "کل درآمد", totalExpenses: "کل هزینه‌ها", currentBalance: "موجودی فعلی", budgetRemaining: "بودجه باقی‌مانده",
        thisMonth: "این ماه", healthyBalance: "موجودی سالم", used: "مصرف شده", expenseOverview: "نمای کلی هزینه‌ها",
        spendingThisMonth: "هزینه‌های این ماه", budget: "بودجه", monthlyBudget: "بودجه ماهانه", viewAll: "مشاهده همه",
        totalBudget: "کل بودجه", spent: "هزینه شده", remaining: "باقی‌مانده", onTrack: "وضعیت بودجه مناسب است",
        budgetOverviewLabel: "بودجه‌ها", budgetOverview: "نمای کلی بودجه", activity: "فعالیت", recentTransactions: "تراکنش‌های اخیر",
        monthPrompt: "ماه را وارد کن (YYYY-MM):", invalidMonth: "فرمت ماه صحیح نیست؛ مثل 2026-08 وارد کن.", transactionAdded: "تراکنش اضافه شد.",
        transactionFailed: "افزودن تراکنش ناموفق بود.", noNotifications: "اعلان جدیدی وجود ندارد", next: "در مرحله بعد ساخته می‌شود"
    }
};

function t(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
}

function formatMoney(value) {
    const amount = Number(value || 0);
    if (currentCurrency === "USD") return `$${amount.toLocaleString("en-US")}`;
    return `${amount.toLocaleString("fa-IR")} ﷼`;
}

function updateMonthLabel() {
    const [year, month] = currentMonth.split("-").map(Number);
    const label = document.querySelector("#monthLabel");
    if (!label) return;
    label.textContent = new Intl.DateTimeFormat(currentLanguage === "fa" ? "fa-IR" : "en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function setLanguage(language) {
    currentLanguage = language === "fa" ? "fa" : "en";
    localStorage.setItem("finplan-language", currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[currentLanguage][key]) element.textContent = translations[currentLanguage][key];
    });
    const button = document.querySelector("#languageSelector .language-current");
    if (button) button.textContent = currentLanguage.toUpperCase();
    updateMonthLabel();
}

function setCurrency(currency) {
    currentCurrency = currency === "IRR" ? "IRR" : "USD";
    localStorage.setItem("finplan-currency", currentCurrency);
    const button = document.querySelector("#currencySelector .currency-current");
    if (button) button.textContent = currentCurrency;
    refreshDashboard();
}

function setDashboardValue(selector, value) {
    document.querySelectorAll(`[data-dashboard="${selector}"]`).forEach(element => {
        element.textContent = typeof value === "number" ? formatMoney(value) : value;
    });
}

async function refreshDashboard() {
    try {
        const data = await apiFetch(`/dashboard?month=${encodeURIComponent(currentMonth)}`);
        setDashboardValue("income", data.income);
        setDashboardValue("expense", data.expense);
        setDashboardValue("balance", data.balance);
        setDashboardValue("budget-total", data.total_budget);
        setDashboardValue("budget-spent", data.budget_spent);
        setDashboardValue("budget-remaining", data.budget_remaining);
        setDashboardValue("budget-remaining-2", data.budget_remaining);
        document.querySelectorAll('[data-dashboard="budget-percentage"]').forEach(el => el.textContent = `${data.budget_spent_percentage}%`);
        const progress = document.querySelector('[data-dashboard="progress"]');
        if (progress) progress.style.width = `${clamp(Number(data.budget_spent_percentage), 0, 100)}%`;
        const status = document.querySelector('[data-dashboard="budget-status"]');
        if (status) status.textContent = data.budget_status === "over_budget" ? (currentLanguage === "fa" ? "از بودجه عبور کرده‌ای" : "You're over budget") : data.budget_status === "no_budget" ? (currentLanguage === "fa" ? "برای این ماه بودجه‌ای ثبت نشده" : "No budget set for this month") : t("onTrack");
        await loadRecentTransactions();
        await loadBudgets();
    } catch (error) {
        console.error("FinPlan dashboard error:", error);
        document.querySelectorAll(".loading-state").forEach(el => el.textContent = currentLanguage === "fa" ? "اتصال به API برقرار نشد" : "Could not connect to API");
    }
}

async function loadRecentTransactions() {
    const list = document.querySelector("#transactionsList");
    if (!list) return;
    try {
        const items = await apiFetch(`/transactions?from_date=${currentMonth}-01&to_date=${currentMonth}-31`);
        list.innerHTML = items.slice(0, 6).map(item => `
            <div class="transaction-row">
                <div><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.category)}</span></div>
                <strong class="${item.type === "income" ? "positive" : "negative"}">${item.type === "income" ? "+" : "-"}${formatMoney(item.amount)}</strong>
            </div>`).join("") || `<div class="empty-state">${currentLanguage === "fa" ? "تراکنشی برای این ماه نیست" : "No transactions this month"}</div>`;
    } catch (error) { list.innerHTML = `<div class="empty-state">${currentLanguage === "fa" ? "خطا در دریافت تراکنش‌ها" : "Could not load transactions"}</div>`; }
}

async function loadBudgets() {
    const list = document.querySelector("#budgetList");
    if (!list) return;
    try {
        const items = await apiFetch(`/budgets?month=${encodeURIComponent(currentMonth)}`);
        document.querySelector("#budgetCount")?.replaceChildren(document.createTextNode(`${items.length} ${currentLanguage === "fa" ? "دسته" : "categories"}`));
        list.innerHTML = items.map(item => `<div class="budget-row"><span>${escapeHTML(item.category)}</span><strong>${formatMoney(item.amount)}</strong></div>`).join("") || `<div class="empty-state">${currentLanguage === "fa" ? "بودجه‌ای ثبت نشده" : "No budgets set"}</div>`;
    } catch (error) { list.innerHTML = `<div class="empty-state">${currentLanguage === "fa" ? "خطا در دریافت بودجه‌ها" : "Could not load budgets"}</div>`; }
}

function setupControls() {
    document.querySelector("#languageSelector")?.addEventListener("click", () => setLanguage(currentLanguage === "en" ? "fa" : "en"));
    document.querySelector("#currencySelector")?.addEventListener("click", () => setCurrency(currentCurrency === "USD" ? "IRR" : "USD"));
    document.querySelector("#monthSelector")?.addEventListener("click", async () => {
        const next = window.prompt(t("monthPrompt"), currentMonth);
        if (!next) return;
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(next)) return showToast(t("invalidMonth"));
        currentMonth = next; localStorage.setItem("finplan-month", currentMonth); updateMonthLabel(); await refreshDashboard();
    });
    document.querySelector("#addTransactionButton")?.addEventListener("click", addTransactionPrompt);
    document.querySelector("#notificationButton")?.addEventListener("click", () => showToast(t("noNotifications")));
    document.querySelector("#viewTransactionsButton")?.addEventListener("click", () => document.querySelector('.nav-item[data-section="transactions"]')?.click());
    document.querySelector("#viewBudgetsButton")?.addEventListener("click", () => document.querySelector('.nav-item[data-section="budgets"]')?.click());

    document.querySelectorAll(".nav-item[data-section]").forEach(item => item.addEventListener("click", event => {
        event.preventDefault();
        document.querySelectorAll(".nav-item[data-section]").forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");
        const section = item.dataset.section;
        const dashboardParts = [".dashboard-grid", ".summary-grid", ".budget-list-panel", ".transactions-panel"];
        if (section === "dashboard") {
            dashboardParts.forEach(selector => document.querySelector(selector)?.removeAttribute("hidden"));
            document.querySelector("#transactionsWorkspace")?.classList.remove("visible");
        } else if (section === "transactions") {
            dashboardParts.forEach(selector => document.querySelector(selector)?.setAttribute("hidden", "true"));
            document.querySelector("#transactionsWorkspace")?.classList.add("visible");
            window.dispatchEvent(new CustomEvent("finplan:transactions-open"));
        } else {
            showToast(currentLanguage === "fa" ? `${t(section)} ${t("next")}` : `${section[0].toUpperCase() + section.slice(1)} ${t("next")}`);
        }
    }));
}

async function addTransactionPrompt() {
    const title = window.prompt(currentLanguage === "fa" ? "عنوان تراکنش" : "Transaction title");
    if (!title?.trim()) return;
    const amount = Number(window.prompt(currentLanguage === "fa" ? "مبلغ" : "Amount", "100000"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const type = window.prompt(currentLanguage === "fa" ? "نوع: income یا expense" : "Type: income or expense", "expense")?.toLowerCase();
    if (!['income', 'expense'].includes(type)) return;
    const category = window.prompt(currentLanguage === "fa" ? "دسته‌بندی" : "Category", "General");
    if (!category?.trim()) return;
    try {
        await apiFetch("/transactions", { method: "POST", body: JSON.stringify({ title: title.trim(), amount: Math.round(amount), type, category: category.trim() }) });
        showToast(t("transactionAdded")); await refreshDashboard(); window.dispatchEvent(new CustomEvent("finplan:transactions-refresh"));
    } catch (error) { console.error(error); showToast(t("transactionFailed")); }
}

function showToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function escapeHTML(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

async function initFinPlan() {
    setupControls(); setLanguage(currentLanguage); updateMonthLabel(); await refreshDashboard();
}

document.addEventListener("DOMContentLoaded", initFinPlan);