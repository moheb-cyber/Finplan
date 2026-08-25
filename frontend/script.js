// =========================
// FINPLAN
// =========================


// =========================
// TRANSLATIONS
// =========================

const translations = {

    en: {
        personalFinance: "PERSONAL FINANCE",
        dashboard: "Dashboard",
        transactions: "Transactions",
        budgets: "Budgets",
        analytics: "Analytics",
        settings: "Settings",
        personalAccount: "Personal account",
        goodEvening: "Good evening",
        moneyMessage:
            "Here's what's happening with your money this month.",
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
        totalBudget: "total budget",
        spent: "Spent",
        remaining: "Remaining",
        onTrack: "You're on track with your budget",
        activity: "ACTIVITY",
        recentTransactions: "Recent transactions",
        today: "Today",
        yesterday: "Yesterday",
        foodRestaurant: "Food & Restaurant",
        monthlySalary: "Monthly Salary",
        transportation: "Transportation",
        viewAll: "View all"
    },

    fa: {
        personalFinance: "مدیریت مالی شخصی",
        dashboard: "داشبورد",
        transactions: "تراکنش‌ها",
        budgets: "بودجه‌ها",
        analytics: "تحلیل مالی",
        settings: "تنظیمات",
        personalAccount: "حساب شخصی",
        goodEvening: "عصر بخیر",
        moneyMessage:
            "وضعیت مالی شما در این ماه به این صورت است.",
        totalIncome: "کل درآمد",
        totalExpenses: "کل هزینه‌ها",
        currentBalance: "موجودی فعلی",
        budgetRemaining: "بودجه باقی‌مانده",
        thisMonth: "این ماه",
        healthyBalance: "موجودی مناسب",
        used: "مصرف شده",
        expenseOverview: "بررسی هزینه‌ها",
        spendingThisMonth: "هزینه‌های این ماه",
        budget: "بودجه",
        monthlyBudget: "بودجه ماهانه",
        totalBudget: "کل بودجه",
        spent: "هزینه شده",
        remaining: "باقی‌مانده",
        onTrack: "وضعیت بودجه شما مناسب است",
        activity: "فعالیت‌ها",
        recentTransactions: "تراکنش‌های اخیر",
        today: "امروز",
        yesterday: "دیروز",
        foodRestaurant: "رستوران و غذا",
        monthlySalary: "حقوق ماهانه",
        transportation: "حمل‌ونقل",
        viewAll: "مشاهده همه"
    }

};


// =========================
// STATE
// =========================

let currentLanguage =
    localStorage.getItem("finplan-language") || "en";

let currentCurrency =
    localStorage.getItem("finplan-currency") || "USD";

let dashboardData = null;


// =========================
// TRANSLATION
// =========================

function t(key) {

    return translations[currentLanguage]?.[key] || key;

}


// =========================
// APPLY LANGUAGE
// =========================

function applyLanguage() {

    document.documentElement.lang =
        currentLanguage;

    document.documentElement.dir =
        currentLanguage === "fa"
            ? "rtl"
            : "ltr";


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            element.textContent =
                t(element.dataset.i18n);

        });


    updateLanguageButton();


    if (dashboardData) {
        renderDashboard(dashboardData);
    }

}


// =========================
// LANGUAGE BUTTON
// =========================

function updateLanguageButton() {

    const element =
        document.querySelector(
            ".language-current"
        );

    if (!element) {
        return;
    }


    element.textContent =
        currentLanguage === "fa"
            ? "FA"
            : "EN";

}


// =========================
// CHANGE LANGUAGE
// =========================

function setLanguage(language) {

    if (
        language !== "en" &&
        language !== "fa"
    ) {
        return;
    }


    currentLanguage = language;


    localStorage.setItem(
        "finplan-language",
        language
    );


    applyLanguage();

}


// =========================
// CURRENCY BUTTON
// =========================

function updateCurrencyButton() {

    const element =
        document.querySelector(
            ".currency-current"
        );

    if (!element) {
        return;
    }


    element.textContent =
        currentCurrency === "IRR"
            ? "تومان"
            : "USD";

}


// =========================
// FORMAT MONEY
// =========================

function formatMoney(amount) {

    const value = Number(amount) || 0;


    if (currentCurrency === "IRR") {

        return (
            new Intl.NumberFormat("fa-IR")
                .format(value)
            + " تومان"
        );

    }


    return (
        "$" +
        new Intl.NumberFormat("en-US")
            .format(value)
    );

}


// =========================
// CHANGE CURRENCY
// =========================

function setCurrency(currency) {

    if (
        currency !== "USD" &&
        currency !== "IRR"
    ) {
        return;
    }


    currentCurrency = currency;


    localStorage.setItem(
        "finplan-currency",
        currency
    );


    updateCurrencyButton();


    if (dashboardData) {
        renderDashboard(dashboardData);
    }

}


// =========================
// RENDER DASHBOARD
// =========================

function renderDashboard(data) {

    dashboardData = data;


    // -------------------------
    // SUMMARY
    // -------------------------

    const totalIncome =
        document.getElementById(
            "totalIncome"
        );

    const totalExpenses =
        document.getElementById(
            "totalExpenses"
        );

    const currentBalance =
        document.getElementById(
            "currentBalance"
        );

    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );


    if (totalIncome) {

        totalIncome.textContent =
            formatMoney(data.income);

    }


    if (totalExpenses) {

        totalExpenses.textContent =
            formatMoney(data.expense);

    }


    if (currentBalance) {

        currentBalance.textContent =
            formatMoney(data.balance);

    }


    if (budgetRemaining) {

        budgetRemaining.textContent =
            formatMoney(data.budget_remaining);

    }


    // -------------------------
    // BUDGET
    // -------------------------

    const totalBudget =
        document.getElementById(
            "totalBudget"
        );

    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    const budgetRemainingDetail =
        document.getElementById(
            "budgetRemainingDetail"
        );


    if (totalBudget) {

        totalBudget.textContent =
            formatMoney(data.total_budget);

    }


    if (budgetSpent) {

        budgetSpent.textContent =
            formatMoney(data.budget_spent);

    }


    if (budgetRemainingDetail) {

        budgetRemainingDetail.textContent =
            formatMoney(data.budget_remaining);

    }


    // -------------------------
    // BUDGET PERCENTAGE
    // -------------------------

    let percentage = 0;


    if (Number(data.total_budget) > 0) {

        percentage =
            (
                Number(data.budget_spent) /
                Number(data.total_budget)
            ) * 100;

    }


    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    const roundedPercentage =
        Math.round(percentage);


    const budgetPercentage =
        document.getElementById(
            "budgetPercentage"
        );

    const budgetPercentagePanel =
        document.getElementById(
            "budgetPercentagePanel"
        );


    if (budgetPercentage) {

        budgetPercentage.textContent =
            `${roundedPercentage}%`;

    }


    if (budgetPercentagePanel) {

        budgetPercentagePanel.textContent =
            `${roundedPercentage}%`;

    }


    // -------------------------
    // PROGRESS
    // -------------------------

    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (progress) {

        progress.style.width =
            `${safePercentage}%`;

    }


    // -------------------------
    // STATUS
    // -------------------------

    const status =
        document.getElementById(
            "budgetStatus"
        );


    if (status) {

        if (
            data.budget_status ===
            "over_budget"
        ) {

            status.textContent =
                currentLanguage === "fa"
                    ? "از بودجه تعیین‌شده عبور کرده‌اید"
                    : "You've exceeded your budget";

        } else {

            status.textContent =
                t("onTrack");

        }

    }

}


// =========================
// LOAD DASHBOARD
// =========================

async function loadDashboard() {

    const month = "2026-08";


    try {

        const response =
            await fetch(
                `http://127.0.0.1:8000/dashboard?month=${month}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Dashboard data:",
            data
        );


        renderDashboard(data);

    }

    catch (error) {

        console.error(
            "Dashboard API error:",
            error
        );

    }

}


// =========================
// INITIALIZATION
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyLanguage();

        updateCurrencyButton();


        // LANGUAGE

        const languageSelector =
            document.getElementById(
                "languageSelector"
            );


        if (languageSelector) {

            languageSelector.addEventListener(
                "click",
                () => {

                    setLanguage(
                        currentLanguage === "en"
                            ? "fa"
                            : "en"
                    );

                }
            );

        }


        // CURRENCY

        const currencySelector =
            document.getElementById(
                "currencySelector"
            );


        if (currencySelector) {

            currencySelector.addEventListener(
                "click",
                () => {

                    setCurrency(
                        currentCurrency === "USD"
                            ? "IRR"
                            : "USD"
                    );

                }
            );

        }


        // LOAD API DATA

        loadDashboard();

    }
);