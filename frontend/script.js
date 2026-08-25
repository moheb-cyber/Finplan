/* =========================================================
   FinPlan - Frontend Controller
   ========================================================= */

const API_BASE = "http://127.0.0.1:8000";

let currentLanguage = "en";
let currentCurrency = "USD";
let currentMonth = "2026-08";

let dashboardData = null;
let budgetsData = null;
let transactionsData = [];
let expensesByCategory = {};


/* =========================================================
   TRANSLATIONS
   ========================================================= */

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
        viewAll: "View all",
        totalBudget: "total budget",
        spent: "Spent",
        remaining: "Remaining",
        onTrack: "You're on track with your budget",

        activity: "ACTIVITY",
        recentTransactions: "Recent transactions",

        foodRestaurant: "Food & Restaurant",
        monthlySalary: "Monthly Salary",
        transportation: "Transportation",

        today: "Today",
        yesterday: "Yesterday",

        income: "Income",
        expense: "Expense"
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

        moneyMessage:
            "این خلاصه وضعیت مالی شما در این ماه است.",

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

        activity: "فعالیت",
        recentTransactions: "تراکنش‌های اخیر",

        foodRestaurant: "غذا و رستوران",
        monthlySalary: "حقوق ماهانه",
        transportation: "حمل‌ونقل",

        today: "امروز",
        yesterday: "دیروز",

        income: "درآمد",
        expense: "هزینه"
    }
};


/* =========================================================
   API
   ========================================================= */

async function apiFetch(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                `API ${response.status}: ${errorText}`
            );
        }

        return await response.json();

    } catch (error) {

        console.error(
            `API Error: ${endpoint}`,
            error
        );

        throw error;
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

    try {

        dashboardData = await apiFetch(
            `/dashboard?month=${currentMonth}`
        );

        console.log(
            "Dashboard:",
            dashboardData
        );

        renderDashboard();

    } catch (error) {

        console.error(
            "Dashboard loading failed:",
            error
        );
    }
}


/* =========================================================
   BUDGETS
   ========================================================= */

async function loadBudgets() {

    try {

        budgetsData = await apiFetch(
            `/dashboard/budgets?month=${currentMonth}`
        );

        console.log(
            "Budgets:",
            budgetsData
        );

        renderBudgets();

    } catch (error) {

        console.error(
            "Budgets loading failed:",
            error
        );
    }
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

async function loadTransactions() {

    try {

        transactionsData = await apiFetch(
            "/transactions"
        );

        console.log(
            "Transactions:",
            transactionsData
        );

        renderTransactions();

    } catch (error) {

        console.error(
            "Transactions loading failed:",
            error
        );
    }
}


/* =========================================================
   EXPENSES BY CATEGORY
   ========================================================= */

async function loadExpensesByCategory() {

    try {

        expensesByCategory = await apiFetch(
            "/transactions/expenses-by-category"
        );

        console.log(
            "Expenses by category:",
            expensesByCategory
        );

        renderExpenseChart();

    } catch (error) {

        console.error(
            "Expense categories loading failed:",
            error
        );
    }
}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {

    if (!dashboardData) return;


    const income = document.querySelector(
        '[data-dashboard="income"]'
    );

    const expense = document.querySelector(
        '[data-dashboard="expense"]'
    );

    const balance = document.querySelector(
        '[data-dashboard="balance"]'
    );

    const budgetRemaining = document.querySelector(
        '[data-dashboard="budget-remaining"]'
    );

    const budgetTotal = document.querySelector(
        '[data-dashboard="budget-total"]'
    );

    const budgetSpent = document.querySelector(
        '[data-dashboard="budget-spent"]'
    );

    const budgetPercentage = document.querySelector(
        '[data-dashboard="budget-percentage"]'
    );

    const progressFill = document.querySelector(
        '[data-dashboard="progress"]'
    );


    if (income) {

        income.textContent =
            formatMoney(
                dashboardData.income
            );
    }


    if (expense) {

        expense.textContent =
            formatMoney(
                dashboardData.expense
            );
    }


    if (balance) {

        balance.textContent =
            formatMoney(
                dashboardData.balance
            );
    }


    if (budgetRemaining) {

        budgetRemaining.textContent =
            formatMoney(
                dashboardData.budget_remaining
            );
    }


    if (budgetTotal) {

        budgetTotal.textContent =
            formatMoney(
                dashboardData.total_budget
            );
    }


    if (budgetSpent) {

        budgetSpent.textContent =
            formatMoney(
                dashboardData.budget_spent
            );
    }


    if (budgetPercentage) {

        budgetPercentage.textContent =
            `${formatNumber(
                dashboardData.budget_spent_percentage
            )}%`;
    }


    if (progressFill) {

        const percentage =
            Math.min(
                Math.max(
                    dashboardData.budget_spent_percentage,
                    0
                ),
                100
            );

        progressFill.style.width =
            `${percentage}%`;
    }
}


/* =========================================================
   RENDER BUDGET
   ========================================================= */

function renderBudgets() {

    if (!budgetsData) return;

    console.log(
        "Rendering budgets:",
        budgetsData.budgets
    );

    const budgetList =
        document.querySelector(
            ".budget-list"
        );

    if (!budgetList) return;


    budgetList.innerHTML = "";


    budgetsData.budgets.forEach(
        budget => {

            const item =
                document.createElement("div");

            item.className =
                "budget-item";


            const percentage =
                Math.min(
                    Math.max(
                        budget.spent_percentage,
                        0
                    ),
                    100
                );


            item.innerHTML = `

                <div class="budget-item-top">

                    <strong>
                        ${escapeHTML(
                            budget.category
                        )}
                    </strong>

                    <span>
                        ${formatNumber(
                            budget.spent_percentage
                        )}%
                    </span>

                </div>

                <div class="budget-item-bar">

                    <div
                        class="budget-item-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <div class="budget-item-bottom">

                    <span>
                        ${formatMoney(
                            budget.spent
                        )}
                        /
                        ${formatMoney(
                            budget.budget
                        )}
                    </span>

                    <span class="
                        ${
                            budget.status === "over_budget"
                                ? "over-budget"
                                : "on-track"
                        }
                    ">

                        ${
                            budget.status === "over_budget"
                                ? "Over budget"
                                : "On track"
                        }

                    </span>

                </div>

            `;


            budgetList.appendChild(item);

        }
    );
}


/* =========================================================
   RENDER TRANSACTIONS
   ========================================================= */

function renderTransactions() {

    const list =
        document.querySelector(
            ".transactions-list"
        );

    if (!list) return;


    list.innerHTML = "";


    const recent =
        [...transactionsData]
        .sort(
            (a, b) =>
                new Date(b.created_at)
                -
                new Date(a.created_at)
        )
        .slice(0, 5);


    recent.forEach(
        transaction => {

            const item =
                document.createElement("div");

            item.className =
                "transaction";


            const isIncome =
                transaction.type === "income";


            const sign =
                isIncome
                    ? "+"
                    : "-";


            item.innerHTML = `

                <div class="
                    transaction-icon
                    ${isIncome
                        ? "income"
                        : "expense"}
                ">

                    ${
                        isIncome
                            ? "↗"
                            : "↘"
                    }

                </div>


                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(
                            transaction.title
                        )}
                    </strong>

                    <span>

                        ${formatTransactionDate(
                            transaction.created_at
                        )}

                        ·

                        ${escapeHTML(
                            transaction.category
                        )}

                    </span>

                </div>


                <strong class="
                    transaction-amount
                    ${
                        isIncome
                            ? "income-text"
                            : "expense-text"
                    }
                ">

                    ${sign}${formatMoney(
                        transaction.amount
                    )}

                </strong>

            `;


            list.appendChild(item);

        }
    );
}


/* =========================================================
   EXPENSE CHART
   ========================================================= */

function renderExpenseChart() {

    if (!expensesByCategory) return;


    const chartArea =
        document.querySelector(
            ".bars"
        );

    if (!chartArea) return;


    chartArea.innerHTML = "";


    const entries =
        Object.entries(
            expensesByCategory
        );


    if (!entries.length) return;


    const max =
        Math.max(
            ...entries.map(
                ([, value]) => value
            )
        );


    entries.forEach(
        ([category, amount]) => {

            const group =
                document.createElement(
                    "div"
                );

            group.className =
                "bar-group";


            const height =
                max > 0
                    ? (amount / max) * 100
                    : 0;


            group.innerHTML = `

                <div
                    class="bar"
                    style="height:${height}%"
                    title="${escapeHTML(
                        category
                    )}: ${formatMoney(
                        amount
                    )}"
                ></div>

                <span>
                    ${escapeHTML(
                        category
                    )}
                </span>

            `;


            chartArea.appendChild(
                group
            );

        }
    );
}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatMoney(amount) {

    const numericAmount =
        Number(amount) || 0;


    if (currentCurrency === "IRR") {

        return (
            new Intl.NumberFormat(
                "fa-IR"
            ).format(
                numericAmount
            )
            +
            " تومان"
        );
    }


    /*
       Backend amounts are currently
       stored in Iranian toman.

       Temporary display conversion:
       1 USD = 100,000 تومان

       We'll later move this rate
       into Settings / API.
    */

    const usdRate = 100000;


    const dollars =
        numericAmount / usdRate;


    return (
        "$" +
        new Intl.NumberFormat(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        ).format(
            dollars
        )
    );
}


function formatNumber(value) {

    return new Intl.NumberFormat(
        currentLanguage === "fa"
            ? "fa-IR"
            : "en-US",
        {
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );
}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(language) {

    if (
        language !== "en" &&
        language !== "fa"
    ) {
        return;
    }


    currentLanguage =
        language;


    document.documentElement.lang =
        language;


    document.documentElement.dir =
        language === "fa"
            ? "rtl"
            : "ltr";


    document
        .querySelectorAll(
            "[data-i18n]"
        )
        .forEach(
            element => {

                const key =
                    element.dataset.i18n;


                if (
                    translations[language][key]
                ) {

                    element.textContent =
                        translations[language][key];

                }

            }
        );


    const languageCurrent =
        document.querySelector(
            ".language-current"
        );


    if (languageCurrent) {

        languageCurrent.textContent =
            language === "fa"
                ? "FA"
                : "EN";
    }


    refreshMoney();


    updateGreeting();
}


/* =========================================================
   REFRESH MONEY
   ========================================================= */

function refreshMoney() {

    document
        .querySelectorAll(
            "[data-money]"
        )
        .forEach(
            element => {

                const amount =
                    Number(
                        element.dataset.money
                    );


                element.textContent =
                    formatMoney(
                        amount
                    );

            }
        );


    renderDashboard();

    renderTransactions();

    renderBudgets();
}


/* =========================================================
   CURRENCY SWITCH
   ========================================================= */

function setCurrency(currency) {

    if (
        currency !== "USD" &&
        currency !== "IRR"
    ) {
        return;
    }


    currentCurrency =
        currency;


    const current =
        document.querySelector(
            ".currency-current"
        );


    if (current) {

        current.textContent =
            currency === "IRR"
                ? "IRR"
                : "USD";
    }


    refreshMoney();
}


/* =========================================================
   GREETING
   ========================================================= */

function updateGreeting() {

    const hour =
        new Date().getHours();


    let key =
        "goodEvening";


    if (hour < 12) {

        key =
            "goodMorning";

    } else if (hour < 18) {

        key =
            "goodAfternoon";

    }


    const greeting =
        document.querySelector(
            '[data-i18n="goodEvening"]'
        );


    if (greeting) {

        greeting.textContent =
            translations[
                currentLanguage
            ][key];
    }
}


/* =========================================================
   DATE
   ========================================================= */

function formatTransactionDate(
    dateString
) {

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return new Intl.DateTimeFormat(
        currentLanguage === "fa"
            ? "fa-IR"
            : "en-US",
        {
            month: "short",
            day: "numeric"
        }
    ).format(date);
}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LANGUAGE MENU
   ========================================================= */

function setupLanguageSelector() {

    const button =
        document.querySelector(
            "#languageSelector"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const next =
                currentLanguage === "en"
                    ? "fa"
                    : "en";


            setLanguage(next);

        }
    );
}


/* =========================================================
   CURRENCY MENU
   ========================================================= */

function setupCurrencySelector() {

    const button =
        document.querySelector(
            "#currencySelector"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const next =
                currentCurrency === "USD"
                    ? "IRR"
                    : "USD";


            setCurrency(next);

        }
    );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initFinPlan() {

    console.log(
        "FinPlan starting..."
    );


    setupLanguageSelector();

    setupCurrencySelector();


    setLanguage(
        currentLanguage
    );


    await Promise.allSettled([

        loadDashboard(),

        loadBudgets(),

        loadTransactions(),

        loadExpensesByCategory()

    ]);


    updateGreeting();


    console.log(
        "FinPlan ready."
    );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initFinPlan
);