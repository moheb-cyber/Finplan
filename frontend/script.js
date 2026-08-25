/* =========================================================
   FinPlan — Dashboard Controller
   ========================================================= */

const API_BASE = "http://127.0.0.1:8000";

let currentLanguage = "en";
let currentCurrency = "USD";
let currentMonth = "2026-08";
let usdRate = 100000;

let dashboardData = null;
let budgetsData = null;
let transactionsData = [];
let expensesByCategory = {};

const translations = {
    en: {
        personalFinance: "PERSONAL FINANCE",
        dashboard: "Dashboard",
        transactions: "Transactions",
        budgets: "Budgets",
        analytics: "Analytics",
        settings: "Settings",
        personalAccount: "Personal account",
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        moneyMessage: "Here's what's happening with your money this month.",
        totalIncome: "Total Income",
        totalExpenses: "Total Expenses",
        currentBalance: "Current Balance",
        budgetRemaining: "Budget Remaining",
        thisMonth: "this month",
        healthyBalance: "Healthy balance",
        used: "used",
        expenseOverview: "EXPENSE OVERVIEW",
        spendingThisMonth: "Spending this month",
        budget: "BUDGET",
        monthlyBudget: "Monthly budget",
        viewAll: "View all",
        totalBudget: "total budget",
        spent: "Spent",
        remaining: "Remaining",
        onTrack: "You're on track with your budget",
        reached: "Your budget has been fully used",
        overBudget: "You're over your monthly budget",
        noBudget: "No budget has been set for this month",
        activity: "ACTIVITY",
        recentTransactions: "Recent transactions",
        budgetOverviewLabel: "BUDGETS",
        budgetOverview: "Budget overview",
        categories: "categories",
        addTransaction: "Add transaction",
        transactionAdded: "Transaction added successfully",
        transactionFailed: "Could not add transaction",
        monthPrompt: "Enter month in YYYY-MM format",
        invalidMonth: "Please use YYYY-MM format",
        noTransactions: "No transactions yet",
        noBudgets: "No budgets set for this month",
        loading: "Loading…",
        today: "Today",
        yesterday: "Yesterday",
        income: "Income",
        expense: "Expense",
        overBudgetShort: "Over budget",
        onTrackShort: "On track",
        reachedShort: "Reached"
    },
    fa: {
        personalFinance: "مدیریت مالی شخصی",
        dashboard: "داشبورد",
        transactions: "تراکنش‌ها",
        budgets: "بودجه‌ها",
        analytics: "تحلیل مالی",
        settings: "تنظیمات",
        personalAccount: "حساب شخصی",
        goodMorning: "صبح بخیر",
        goodAfternoon: "عصر بخیر",
        goodEvening: "شب بخیر",
        moneyMessage: "این خلاصه وضعیت مالی شما در این ماه است.",
        totalIncome: "کل درآمد",
        totalExpenses: "کل هزینه‌ها",
        currentBalance: "موجودی فعلی",
        budgetRemaining: "بودجه باقی‌مانده",
        thisMonth: "این ماه",
        healthyBalance: "وضعیت موجودی مناسب است",
        used: "مصرف شده",
        expenseOverview: "بررسی هزینه‌ها",
        spendingThisMonth: "هزینه‌های این ماه",
        budget: "بودجه",
        monthlyBudget: "بودجه ماهانه",
        viewAll: "مشاهده همه",
        totalBudget: "کل بودجه",
        spent: "هزینه شده",
        remaining: "باقی‌مانده",
        onTrack: "وضعیت بودجه مناسب است",
        reached: "کل بودجه مصرف شده است",
        overBudget: "از بودجه ماهانه عبور کرده‌اید",
        noBudget: "برای این ماه بودجه‌ای ثبت نشده است",
        activity: "فعالیت",
        recentTransactions: "تراکنش‌های اخیر",
        budgetOverviewLabel: "بودجه‌ها",
        budgetOverview: "نمای کلی بودجه",
        categories: "دسته",
        addTransaction: "افزودن تراکنش",
        transactionAdded: "تراکنش با موفقیت اضافه شد",
        transactionFailed: "افزودن تراکنش انجام نشد",
        monthPrompt: "ماه را با فرمت YYYY-MM وارد کنید",
        invalidMonth: "فرمت ماه باید YYYY-MM باشد",
        noTransactions: "هنوز تراکنشی ثبت نشده است",
        noBudgets: "برای این ماه بودجه‌ای ثبت نشده است",
        loading: "در حال بارگذاری…",
        today: "امروز",
        yesterday: "دیروز",
        income: "درآمد",
        expense: "هزینه",
        overBudgetShort: "عبور از بودجه",
        onTrackShort: "مناسب",
        reachedShort: "تکمیل"
    }
};

function t(key) {
    return translations[currentLanguage][key] || key;
}

async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`API ${response.status}: ${message}`);
    }

    return response.json();
}

function monthRange(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const start = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
    const nextYear = monthNumber === 12 ? year + 1 : year;
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
    return { start, end };
}

function updateMonthLabel() {
    const label = document.querySelector("#monthLabel");
    if (!label) return;
    const date = new Date(`${currentMonth}-01T00:00:00`);
    label.textContent = new Intl.DateTimeFormat(
        currentLanguage === "fa" ? "fa-IR" : "en-US",
        { month: "long", year: "numeric" }
    ).format(date);
}

async function loadDashboard() {
    dashboardData = await apiFetch(`/dashboard?month=${encodeURIComponent(currentMonth)}`);
    renderDashboard();
}

async function loadBudgets() {
    budgetsData = await apiFetch(`/dashboard/budgets?month=${encodeURIComponent(currentMonth)}`);
    renderBudgets();
}

async function loadTransactions() {
    transactionsData = await apiFetch("/transactions");
    renderTransactions();
}

async function loadExpensesByCategory() {
    const { start, end } = monthRange(currentMonth);
    expensesByCategory = await apiFetch(
        `/transactions/expenses-by-category?from_date=${start}&to_date=${end}`
    );
    renderExpenseChart();
}

async function refreshDashboard() {
    setLoadingStates();
    const results = await Promise.allSettled([
        loadDashboard(),
        loadBudgets(),
        loadTransactions(),
        loadExpensesByCategory()
    ]);

    const failed = results.filter(result => result.status === "rejected");
    if (failed.length) {
        console.error("FinPlan refresh errors:", failed);
        showToast(currentLanguage === "fa" ? "بخشی از اطلاعات بارگذاری نشد" : "Some data could not be loaded");
    }
}

function setLoadingStates() {
    const budgetList = document.querySelector("#budgetList");
    const transactionsList = document.querySelector("#transactionsList");
    if (budgetList) budgetList.innerHTML = `<div class="loading-state">${escapeHTML(t("loading"))}</div>`;
    if (transactionsList) transactionsList.innerHTML = `<div class="loading-state">${escapeHTML(t("loading"))}</div>`;
}

function renderDashboard() {
    if (!dashboardData) return;

    setDashboardMoney("income", dashboardData.income);
    setDashboardMoney("expense", dashboardData.expense);
    setDashboardMoney("balance", dashboardData.balance);
    setDashboardMoney("budget-remaining", dashboardData.budget_remaining);
    setDashboardMoney("budget-remaining-2", dashboardData.budget_remaining);
    setDashboardMoney("budget-total", dashboardData.total_budget);
    setDashboardMoney("budget-spent", dashboardData.budget_spent);

    document.querySelectorAll('[data-dashboard="budget-percentage"]').forEach(element => {
        element.textContent = `${formatNumber(dashboardData.budget_spent_percentage)}%`;
    });

    const percentage = clamp(Number(dashboardData.budget_spent_percentage) || 0, 0, 100);
    const progress = document.querySelector('[data-dashboard="progress"]');
    if (progress) progress.style.width = `${percentage}%`;

    const status = document.querySelector('[data-dashboard="budget-status"]');
    const dot = document.querySelector(".status-dot");
    if (status) {
        const statusKey = {
            on_track: "onTrack",
            reached: "reached",
            over_budget: "overBudget",
            no_budget: "noBudget"
        }[dashboardData.budget_status] || "onTrack";
        status.textContent = t(statusKey);
    }
    if (dot) dot.classList.toggle("warning", dashboardData.budget_status === "over_budget");

    const balanceStatus = document.querySelector('[data-dashboard="balance-status"]');
    if (balanceStatus) {
        balanceStatus.className = `card-meta ${dashboardData.balance >= 0 ? "positive" : "negative"}`;
        balanceStatus.textContent = dashboardData.balance >= 0 ? t("healthyBalance") : t("overBudget");
    }
}

function setDashboardMoney(key, amount) {
    document.querySelectorAll(`[data-dashboard="${key}"]`).forEach(element => {
        element.textContent = formatMoney(amount);
    });
}

function renderBudgets() {
    const list = document.querySelector("#budgetList");
    const count = document.querySelector("#budgetCount");
    if (!list) return;

    const budgets = budgetsData?.budgets || [];
    if (count) count.textContent = `${formatNumber(budgets.length)} ${t("categories")}`;

    if (!budgets.length) {
        list.innerHTML = `<div class="empty-state">${escapeHTML(t("noBudgets"))}</div>`;
        return;
    }

    list.innerHTML = budgets.map(budget => {
        const percentage = clamp(Number(budget.spent_percentage) || 0, 0, 100);
        const isOver = budget.status === "over_budget";
        const statusText = isOver ? t("overBudgetShort") : budget.status === "reached" ? t("reachedShort") : t("onTrackShort");
        return `
            <div class="budget-item">
                <div class="budget-item-top">
                    <strong>${escapeHTML(budget.category)}</strong>
                    <span>${formatNumber(budget.spent_percentage)}%</span>
                </div>
                <div class="budget-item-bar">
                    <div class="budget-item-fill ${isOver ? "over" : ""}" style="width:${percentage}%"></div>
                </div>
                <div class="budget-item-bottom">
                    <span>${formatMoney(budget.spent)} / ${formatMoney(budget.budget)}</span>
                    <span class="${isOver ? "over-budget" : "on-track"}">${escapeHTML(statusText)}</span>
                </div>
            </div>
        `;
    }).join("");
}

function renderTransactions() {
    const list = document.querySelector("#transactionsList");
    if (!list) return;

    const recent = [...transactionsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);

    if (!recent.length) {
        list.innerHTML = `<div class="empty-state">${escapeHTML(t("noTransactions"))}</div>`;
        return;
    }

    list.innerHTML = recent.map(transaction => {
        const isIncome = transaction.type === "income";
        const sign = isIncome ? "+" : "−";
        return `
            <div class="transaction">
                <div class="transaction-icon ${isIncome ? "income" : "expense"}">${isIncome ? "↗" : "↘"}</div>
                <div class="transaction-info">
                    <strong>${escapeHTML(transaction.title)}</strong>
                    <span>${escapeHTML(formatTransactionDate(transaction.created_at))} · ${escapeHTML(transaction.category)}</span>
                </div>
                <strong class="transaction-amount ${isIncome ? "income-text" : "expense-text"}">${sign}${formatMoney(transaction.amount)}</strong>
            </div>
        `;
    }).join("");
}

function renderExpenseChart() {
    const chartArea = document.querySelector("#expenseBars");
    const legend = document.querySelector("#chartLegend");
    const caption = document.querySelector("#chartCaption");
    if (!chartArea) return;

    const entries = Object.entries(expensesByCategory || {}).sort((a, b) => b[1] - a[1]);
    chartArea.innerHTML = "";
    if (legend) legend.innerHTML = "";

    if (!entries.length) {
        chartArea.innerHTML = `<div class="empty-state">${escapeHTML(t("noTransactions"))}</div>`;
        if (caption) caption.textContent = "—";
        return;
    }

    const visible = entries.slice(0, 6);
    const max = Math.max(...visible.map(([, value]) => Number(value) || 0), 1);
    const total = entries.reduce((sum, [, value]) => sum + (Number(value) || 0), 0);

    visible.forEach(([category, amount]) => {
        const group = document.createElement("div");
        group.className = "bar-group";
        const height = clamp((Number(amount) / max) * 100, 3, 100);
        group.innerHTML = `<div class="bar" style="height:${height}%" title="${escapeHTML(category)}: ${escapeHTML(formatMoney(amount))}"></div><span>${escapeHTML(shortenCategory(category))}</span>`;
        chartArea.appendChild(group);
    });

    if (caption) caption.textContent = formatMoney(total);
    if (legend) {
        visible.slice(0, 4).forEach(([category]) => {
            legend.insertAdjacentHTML("beforeend", `<span class="legend-item"><i class="legend-dot"></i>${escapeHTML(shortenCategory(category))}</span>`);
        });
    }
}

function shortenCategory(category) {
    return String(category).length > 13 ? `${String(category).slice(0, 12)}…` : category;
}

function formatMoney(amount) {
    const value = Number(amount) || 0;
    if (currentCurrency === "IRR") {
        return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(value)} تومان`;
    }
    return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / usdRate)}`;
}

function formatNumber(value) {
    return new Intl.NumberFormat(currentLanguage === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatTransactionDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t("today");
    if (date.toDateString() === yesterday.toDateString()) return t("yesterday");
    return new Intl.DateTimeFormat(currentLanguage === "fa" ? "fa-IR" : "en-US", { month: "short", day: "numeric" }).format(date);
}

function setLanguage(language) {
    if (!translations[language]) return;
    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[language][key]) element.textContent = translations[language][key];
    });

    const current = document.querySelector(".language-current");
    if (current) current.textContent = language === "fa" ? "FA" : "EN";
    updateGreeting();
    updateMonthLabel();
    renderDashboard();
    renderBudgets();
    renderTransactions();
    renderExpenseChart();
}

function setCurrency(currency) {
    if (!['USD', 'IRR'].includes(currency)) return;
    currentCurrency = currency;
    const current = document.querySelector(".currency-current");
    if (current) current.textContent = currency;
    renderDashboard();
    renderBudgets();
    renderTransactions();
    renderExpenseChart();
}

function updateGreeting() {
    const hour = new Date().getHours();
    const key = hour < 12 ? "goodMorning" : hour < 18 ? "goodAfternoon" : "goodEvening";
    const greeting = document.querySelector("#greeting");
    if (greeting) greeting.textContent = t(key);
}

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
    document.querySelector("#viewTransactionsButton")?.addEventListener("click", () => showToast(currentLanguage === "fa" ? "صفحه تراکنش‌ها در مرحله بعد اضافه می‌شود" : "Transactions view is next"));
    document.querySelector("#viewBudgetsButton")?.addEventListener("click", () => document.querySelector(".budget-list-panel")?.scrollIntoView({ behavior: "smooth", block: "center" }));

    document.querySelectorAll(".nav-item[data-section]").forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            document.querySelectorAll(".nav-item[data-section]").forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            const section = item.dataset.section;
            if (section !== "dashboard") showToast(currentLanguage === "fa" ? `بخش ${t(section)} در مرحله بعد ساخته می‌شود` : `${section[0].toUpperCase() + section.slice(1)} is next`);
        });
    });
}

async function addTransactionPrompt() {
    const title = window.prompt(currentLanguage === "fa" ? "عنوان تراکنش" : "Transaction title");
    if (!title) return;
    const amount = Number(window.prompt(currentLanguage === "fa" ? "مبلغ به تومان" : "Amount in toman", "100000"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const type = window.prompt(currentLanguage === "fa" ? "نوع: income یا expense" : "Type: income or expense", "expense")?.toLowerCase();
    if (!['income', 'expense'].includes(type)) return;
    const category = window.prompt(currentLanguage === "fa" ? "دسته‌بندی" : "Category", "General");
    if (!category) return;

    try {
        await apiFetch("/transactions", {
            method: "POST",
            body: JSON.stringify({ title: title.trim(), amount: Math.round(amount), type, category: category.trim() })
        });
        showToast(t("transactionAdded"));
        await refreshDashboard();
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
