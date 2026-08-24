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

        onTrack:
            "You're on track with your budget",

        activity: "ACTIVITY",

        recentTransactions:
            "Recent transactions",

        today: "Today",

        yesterday: "Yesterday",

        foodRestaurant:
            "Food & Restaurant",

        monthlySalary:
            "Monthly Salary",

        transportation:
            "Transportation",

        viewAll: "View all",

        personal: "Personal",

        language: "Language",

        english: "English",

        persian: "Persian"
    },


    fa: {

        personalFinance:
            "مدیریت مالی شخصی",

        dashboard:
            "داشبورد",

        transactions:
            "تراکنش‌ها",

        budgets:
            "بودجه‌ها",

        analytics:
            "تحلیل مالی",

        settings:
            "تنظیمات",

        personalAccount:
            "حساب شخصی",

        goodEvening:
            "عصر بخیر",

        moneyMessage:
            "وضعیت مالی شما در این ماه به این صورت است.",

        totalIncome:
            "کل درآمد",

        totalExpenses:
            "کل هزینه‌ها",

        currentBalance:
            "موجودی فعلی",

        budgetRemaining:
            "بودجه باقی‌مانده",

        thisMonth:
            "این ماه",

        healthyBalance:
            "موجودی مناسب",

        used:
            "مصرف شده",

        expenseOverview:
            "بررسی هزینه‌ها",

        spendingThisMonth:
            "هزینه‌های این ماه",

        budget:
            "بودجه",

        monthlyBudget:
            "بودجه ماهانه",

        totalBudget:
            "کل بودجه",

        spent:
            "هزینه شده",

        remaining:
            "باقی‌مانده",

        onTrack:
            "وضعیت بودجه شما مناسب است",

        activity:
            "فعالیت‌ها",

        recentTransactions:
            "تراکنش‌های اخیر",

        today:
            "امروز",

        yesterday:
            "دیروز",

        foodRestaurant:
            "رستوران و غذا",

        monthlySalary:
            "حقوق ماهانه",

        transportation:
            "حمل‌ونقل",

        viewAll:
            "مشاهده همه",

        personal:
            "شخصی",

        language:
            "زبان",

        english:
            "انگلیسی",

        persian:
            "فارسی"
    }

};


// =========================
// LANGUAGE
// =========================

let currentLanguage =
    localStorage.getItem(
        "finplan-language"
    ) || "en";


function t(key) {

    return (
        translations[currentLanguage]?.[key]
        || key
    );

}


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

            const key =
                element.dataset.i18n;


            element.textContent =
                t(key);

        });


    updateLanguageButton();

}


function setLanguage(language) {

    if (!translations[language]) {
        return;
    }


    currentLanguage =
        language;


    localStorage.setItem(
        "finplan-language",
        language
    );


    applyLanguage();

}


// =========================
// CURRENCY
// =========================

let currentCurrency =
    localStorage.getItem(
        "finplan-currency"
    ) || "USD";


function formatMoney(amount) {

    const numericAmount =
        Number(amount);


    if (Number.isNaN(numericAmount)) {

        return amount;

    }


    const isNegative =
        numericAmount < 0;


    const absoluteAmount =
        Math.abs(numericAmount);


    // تومان

    if (currentCurrency === "IRR") {

        const formatted =
            new Intl.NumberFormat(
                "fa-IR"
            ).format(
                absoluteAmount
            );


        return (
            (isNegative ? "-" : "") +
            formatted +
            " تومان"
        );

    }


    // USD

    const formatted =
        new Intl.NumberFormat(
            "en-US"
        ).format(
            absoluteAmount
        );


    return (
        (isNegative ? "-" : "") +
        "$" +
        formatted
    );

}


function updateCurrencyButton() {

    const button =
        document.getElementById(
            "currencySelector"
        );


    if (!button) {
        return;
    }


    const text =
        button.querySelector(
            ".currency-current"
        );


    if (!text) {
        return;
    }


    text.textContent =
        currentCurrency === "IRR"
            ? "تومان"
            : "USD";

}


function updateCurrencyDisplay() {

    document
        .querySelectorAll(
            "[data-money]"
        )
        .forEach(element => {

            const amount =
                element.dataset.money;


            element.textContent =
                formatMoney(amount);

        });


    updateCurrencyButton();

}


function setCurrency(currency) {

    if (
        currency !== "USD" &&
        currency !== "IRR"
    ) {

        return;

    }


    currentCurrency =
        currency;


    localStorage.setItem(
        "finplan-currency",
        currency
    );


    updateCurrencyDisplay();

}


// =========================
// LANGUAGE BUTTON
// =========================

function updateLanguageButton() {

    const button =
        document.getElementById(
            "languageSelector"
        );


    if (!button) {
        return;
    }


    const text =
        button.querySelector(
            ".language-current"
        );


    if (!text) {
        return;
    }


    text.textContent =
        currentLanguage === "fa"
            ? "FA"
            : "EN";

}


// =========================
// PAGE INITIALIZATION
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // Language

        applyLanguage();


        // Currency

        updateCurrencyDisplay();


        // Language button

        const languageSelector =
            document.getElementById(
                "languageSelector"
            );


        if (languageSelector) {

            languageSelector.addEventListener(
                "click",
                () => {

                    const newLanguage =
                        currentLanguage === "en"
                            ? "fa"
                            : "en";


                    setLanguage(
                        newLanguage
                    );

                }
            );

        }


        // Currency button

        const currencySelector =
            document.getElementById(
                "currencySelector"
            );


        if (currencySelector) {

            currencySelector.addEventListener(
                "click",
                () => {

                    const newCurrency =
                        currentCurrency === "USD"
                            ? "IRR"
                            : "USD";


                    setCurrency(
                        newCurrency
                    );

                }
            );

        }

    }
);