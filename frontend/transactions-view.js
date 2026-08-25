/* =========================================================
   FinPlan — Transactions Workspace
   ========================================================= */


(() => {


    // ==============================
    // Configuration
    // ==============================


    const API_BASE = "http://127.0.0.1:8000";



    // ==============================
    // Application State
    // ==============================


    let filters = {

        type: "all",

        category: "all",

        search: ""

    };


    let transactionsCache = [];




    // ==============================
    // Language Content
    // ==============================


    const labels = {


        en: {


            transactions: "TRANSACTIONS",

            title: "Transaction history",

            search: "Search title or category…",

            allTypes: "All types",

            allCategories: "All categories",

            income: "Income",

            expense: "Expense",

            count: "transactions",

            transaction: "Transaction",

            category: "Category",

            date: "Date",

            amount: "Amount",

            noTransactions: "No transactions yet",

            deleteConfirm: "Delete this transaction?",

            deleted: "Transaction deleted",

            updated: "Transaction updated",

            failed: "Could not complete the action",

            titlePrompt: "Transaction title",

            amountPrompt: "Amount in toman",

            typePrompt: "Type: income or expense",

            categoryPrompt: "Category"


        },



        fa: {


            transactions: "تراکنش‌ها",

            title: "تاریخچه تراکنش‌ها",

            search: "جستجوی عنوان یا دسته‌بندی…",

            allTypes: "همه انواع",

            allCategories: "همه دسته‌ها",

            income: "درآمد",

            expense: "هزینه",

            count: "تراکنش",

            transaction: "تراکنش",

            category: "دسته‌بندی",

            date: "تاریخ",

            amount: "مبلغ",

            noTransactions: "هنوز تراکنشی ثبت نشده است",

            deleteConfirm: "این تراکنش حذف شود؟",

            deleted: "تراکنش حذف شد",

            updated: "تراکنش به‌روزرسانی شد",

            failed: "عملیات انجام نشد",

            titlePrompt: "عنوان تراکنش",

            amountPrompt: "مبلغ به تومان",

            typePrompt: "نوع: income یا expense",

            categoryPrompt: "دسته‌بندی"


        }


    };


    // ==============================
    // Utility Functions
    // ==============================



    const currentLanguage = () => {

        return document.documentElement.lang === "fa"

            ? "fa"

            : "en";

    };




    const text = (key) => {

        return labels[currentLanguage()][key] || key;

    };




    const safe = (value) => {

        return String(value ?? "")

            .replaceAll("&", "&amp;")

            .replaceAll("<", "&lt;")

            .replaceAll(">", "&gt;")

            .replaceAll('"', "&quot;")

            .replaceAll("'", "&#039;");

    };




    const currentCurrency = () => {


        const currency = document.querySelector(".currency-current");


        return currency?.textContent === "IRR"

            ? "IRR"

            : "USD";


    };





    const formatMoney = (value) => {


        const amount = Number(value) || 0;


        if (currentCurrency() === "IRR") {


            return `${

                new Intl.NumberFormat("fa-IR", {

                    maximumFractionDigits: 0

                }).format(amount)

            } تومان`;


        }



        return `$${

            new Intl.NumberFormat("en-US", {

                maximumFractionDigits: 2

            }).format(amount / 100000)

        }`;


    };






    const showToast = (message) => {


        const toast = document.querySelector("#toast");


        if (!toast) return;



        toast.textContent = message;


        toast.classList.add("show");



        clearTimeout(showToast.timer);



        showToast.timer = setTimeout(() => {


            toast.classList.remove("show");


        }, 2600);



    };







    const formatDate = (value) => {


        const date = new Date(value);


        if (Number.isNaN(date.getTime())) {


            return "";


        }



        const now = new Date();



        const yesterday = new Date(now);


        yesterday.setDate(now.getDate() - 1);




        if (date.toDateString() === now.toDateString()) {


            return currentLanguage() === "fa"

                ? "امروز"

                : "Today";


        }




        if (date.toDateString() === yesterday.toDateString()) {


            return currentLanguage() === "fa"

                ? "دیروز"

                : "Yesterday";


        }





        return new Intl.DateTimeFormat(

            currentLanguage() === "fa"

                ? "fa-IR"

                : "en-US",

            {

                month: "short",

                day: "numeric"

            }


        ).format(date);



    };





    const filterTransactions = () => {


        const search = filters.search

            .trim()

            .toLowerCase();




        return [...transactionsCache]

            .filter(item => {


                return filters.type === "all"

                    || item.type === filters.type;


            })


            .filter(item => {


                return filters.category === "all"

                    || item.category === filters.category;


            })


            .filter(item => {


                if (!search) return true;



                return `${item.title} ${item.category}`

                    .toLowerCase()

                    .includes(search);



            })


            .sort((a, b) => {


                return new Date(b.created_at)

                    - new Date(a.created_at);


            });



    };
    // ==============================
    // API Handler
    // ==============================


    const api = async (endpoint, options = {}) => {


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


            throw new Error(

                `API Error ${response.status}: ${await response.text()}`

            );


        }



        return response.json();


    };








    // ==============================
    // Dynamic Styles
    // ==============================


    const styleText = `


    .transactions-workspace{

        display:none;

        margin-top:12px;

    }



    .transactions-workspace.visible{

        display:block;

    }



    .transactions-toolbar{

        display:grid;

        grid-template-columns:

        minmax(180px,1.5fr)

        repeat(2,minmax(140px,.7fr));

        gap:9px;

        margin-top:18px;

    }




    .transactions-input,

    .transactions-select{


        height:40px;

        width:100%;

        padding:0 12px;

        border:1px solid var(--border);

        border-radius:11px;

        background:rgba(255,255,255,.025);

        color:var(--text);

        outline:none;

        font-size:11px;


    }




    .transactions-input:focus,

    .transactions-select:focus{


        border-color:rgba(212,175,55,.35);


    }





    .transactions-summary{


        display:grid;

        grid-template-columns:repeat(3,1fr);

        gap:9px;

        margin-top:12px;


    }




    .transaction-stat{


        padding:14px;

        border:1px solid var(--border);

        border-radius:13px;

        background:rgba(255,255,255,.018);


    }




    .transaction-stat span{


        display:block;

        color:var(--muted);

        font-size:9px;


    }




    .transaction-stat strong{


        display:block;

        margin-top:7px;

        font-size:16px;


    }




    .transaction-stat.income strong{

        color:var(--green);

    }




    .transaction-stat.expense strong{

        color:var(--red);

    }




    .transaction-table{


        margin-top:12px;

        overflow:hidden;

        border:1px solid var(--border);

        border-radius:14px;


    }




    .transaction-row{


        display:grid;

        grid-template-columns:

        1.5fr .85fr .8fr .85fr auto;


        gap:12px;

        align-items:center;


        min-height:58px;

        padding:0 15px;


        border-top:1px solid var(--border);

        font-size:10px;


    }




    .transaction-row:first-child{

        border-top:0;

    }




    .transaction-main{


        display:flex;

        align-items:center;

        gap:9px;

        min-width:0;


    }




    .transaction-category,

    .transaction-date{


        color:var(--muted);


    }





    .transaction-actions{


        display:flex;

        justify-content:flex-end;

        gap:5px;


    }




    .transaction-action{


        width:30px;

        height:30px;

        border:1px solid var(--border);

        border-radius:8px;

        background:transparent;

        color:var(--muted);

        cursor:pointer;


    }





    .transactions-empty{


        padding:42px 15px;

        text-align:center;

        color:var(--muted);

        font-size:10px;


    }



    `;








    const injectStyles = () => {


        if(document.querySelector("#transactionsWorkspaceStyles"))

            return;



        const style = document.createElement("style");


        style.id = "transactionsWorkspaceStyles";


        style.textContent = styleText;


        document.head.appendChild(style);



    };









    // ==============================
    // Create Transactions Workspace
    // ==============================


    const createWorkspace = () => {


        if(document.querySelector("#transactionsWorkspace"))

            return;



        const main = document.querySelector(".main");

        if(!main)

            return;



        const section = document.createElement("section");



        section.id = "transactionsWorkspace";


        section.className = "transactions-workspace panel";




        section.innerHTML = `


        <div class="panel-header">


            <div>

                <span class="panel-label">

                    ${safe(text("transactions"))}

                </span>


                <h3>

                    ${safe(text("title"))}

                </h3>


            </div>



            <span class="panel-caption"

                id="transactionsWorkspaceCount">

                0

            </span>



        </div>





        <div class="transactions-toolbar">


            <input

                id="transactionSearch"

                class="transactions-input"

                placeholder="${safe(text("search"))}"

                type="search"

            >




            <select

                id="transactionTypeFilter"

                class="transactions-select">


                <option value="all">

                    ${safe(text("allTypes"))}

                </option>


                <option value="income">

                    ${safe(text("income"))}

                </option>


                <option value="expense">

                    ${safe(text("expense"))}

                </option>



            </select>





            <select

                id="transactionCategoryFilter"

                class="transactions-select">


                <option value="all">

                    ${safe(text("allCategories"))}

                </option>



            </select>



        </div>





        <div class="transactions-summary">


            <div class="transaction-stat income">

                <span>${safe(text("income"))}</span>

                <strong id="transactionIncomeTotal">

                    -

                </strong>


            </div>




            <div class="transaction-stat expense">


                <span>${safe(text("expense"))}</span>


                <strong id="transactionExpenseTotal">

                    -

                </strong>


            </div>




            <div class="transaction-stat">


                <span>${safe(text("count"))}</span>


                <strong id="transactionCountTotal">

                    0

                </strong>


            </div>



        </div>





        <div

        class="transaction-table"

        id="transactionTable">


        </div>



        `;



        main.appendChild(section);





        document

        .querySelector("#transactionSearch")

        ?.addEventListener("input", event => {


            filters.search = event.target.value;


            renderTransactions();


        });





        document

        .querySelector("#transactionTypeFilter")

        ?.addEventListener("change", event => {


            filters.type = event.target.value;


            renderTransactions();


        });





        document

        .querySelector("#transactionCategoryFilter")

        ?.addEventListener("change", event => {


            filters.category = event.target.value;


            renderTransactions();


        });



    };
    // ==============================
    // Category Manager
    // ==============================


    const refreshCategories = () => {


        const select = document.querySelector(

            "#transactionCategoryFilter"

        );



        if(!select)

            return;



        const categories = [

            ...new Set(

                transactionsCache

                    .map(item => item.category)

                    .filter(Boolean)

            )

        ]

        .sort();



        const current = filters.category;



        select.innerHTML = `

            <option value="all">

                ${safe(text("allCategories"))}

            </option>

            ${
                categories

                .map(category => `

                    <option value="${safe(category)}">

                        ${safe(category)}

                    </option>

                `)

                .join("")

            }

        `;



        select.value = categories.includes(current)

            ? current

            : "all";



        if(!categories.includes(current)){

            filters.category = "all";

        }


    };










    // ==============================
    // Render Transactions Table
    // ==============================


    const renderTransactions = () => {



        createWorkspace();


        refreshCategories();



        const items = filterTransactions();




        const incomeTotal = items

            .filter(item => item.type === "income")

            .reduce(

                (sum,item) => sum + Number(item.amount || 0),

                0

            );




        const expenseTotal = items

            .filter(item => item.type === "expense")

            .reduce(

                (sum,item) => sum + Number(item.amount || 0),

                0

            );






        const incomeElement = document.querySelector(

            "#transactionIncomeTotal"

        );



        const expenseElement = document.querySelector(

            "#transactionExpenseTotal"

        );



        const countElement = document.querySelector(

            "#transactionCountTotal"

        );



        const counter = document.querySelector(

            "#transactionsWorkspaceCount"

        );





        if(incomeElement)

            incomeElement.textContent = formatMoney(incomeTotal);



        if(expenseElement)

            expenseElement.textContent = formatMoney(expenseTotal);



        if(countElement)

            countElement.textContent = items.length;



        if(counter)

            counter.textContent =

                `${items.length} ${text("count")}`;






        const table = document.querySelector(

            "#transactionTable"

        );



        if(!table)

            return;







        if(items.length === 0){


            table.innerHTML = `

                <div class="transactions-empty">

                    ${safe(text("noTransactions"))}

                </div>

            `;


            return;


        }








        table.innerHTML = `


        <div class="transaction-row header">


            <span>

                ${safe(text("transaction"))}

            </span>


            <span>

                ${safe(text("category"))}

            </span>


            <span>

                ${safe(text("date"))}

            </span>


            <span>

                ${safe(text("amount"))}

            </span>


            <span></span>


        </div>





        ${
            items.map(item => {



                const isIncome = item.type === "income";



                return `


                <div

                    class="transaction-row"

                    data-id="${item.id}">


                    

                    <div class="transaction-main">


                        <div class="transaction-icon 

                        ${isIncome ? "income" : "expense"}">


                            ${isIncome ? "↗" : "↘"}


                        </div>



                        <strong>

                            ${safe(item.title)}

                        </strong>



                    </div>





                    <span class="transaction-category">

                        ${safe(item.category)}

                    </span>





                    <span class="transaction-date">

                        ${safe(formatDate(item.created_at))}

                    </span>





                    <strong

                    class="transaction-amount

                    ${isIncome ? "income-text" : "expense-text"}">


                        ${isIncome ? "+" : "−"}

                        ${formatMoney(item.amount)}


                    </strong>






                    <div class="transaction-actions">


                        <button

                        class="transaction-action"

                        data-action="edit"

                        data-id="${item.id}">


                            ✎


                        </button>





                        <button

                        class="transaction-action delete"

                        data-action="delete"

                        data-id="${item.id}">


                            ×


                        </button>



                    </div>



                </div>


                `;


            }).join("")

        }


        `;



    };

    // ==============================
    // Transaction Actions
    // ==============================


    const handleTransactionAction = async (event) => {


        const button = event.target.closest(

            "button[data-action]"

        );



        if(!button)

            return;




        const id = Number(button.dataset.id);



        const transaction = transactionsCache.find(

            item => Number(item.id) === id

        );



        if(!transaction)

            return;





        try {



            // DELETE


            if(button.dataset.action === "delete"){



                const confirmDelete = window.confirm(

                    `${text("deleteConfirm")}\n\n${transaction.title}`

                );



                if(!confirmDelete)

                    return;



                await api(

                    `/transactions/${id}`,

                    {

                        method:"DELETE"

                    }

                );



                showToast(text("deleted"));



                await loadTransactions();



                return;


            }








            // EDIT


            const title = window.prompt(

                text("titlePrompt"),

                transaction.title

            );



            if(!title)

                return;





            const amount = Number(

                window.prompt(

                    text("amountPrompt"),

                    transaction.amount

                )

            );



            if(!Number.isFinite(amount) || amount <= 0)

                return;







            const type = window.prompt(

                text("typePrompt"),

                transaction.type

            )

            ?.toLowerCase();





            if(

                !["income","expense"]

                .includes(type)

            )

                return;







            const category = window.prompt(

                text("categoryPrompt"),

                transaction.category

            );



            if(!category)

                return;







            await api(

                `/transactions/${id}`,

                {


                    method:"PUT",


                    body:JSON.stringify({

                        title:title.trim(),

                        amount:Math.round(amount),

                        type,

                        category:category.trim()


                    })


                }

            );





            showToast(text("updated"));



            await loadTransactions();






        }

        catch(error){



            console.error(error);



            showToast(text("failed"));



        }



    };









    // ==============================
    // Load Transactions From Server
    // ==============================


    const loadTransactions = async () => {


        try{


            transactionsCache = await api(

                "/transactions"

            );



            renderTransactions();



        }


        catch(error){



            console.error(error);



            const table = document.querySelector(

                "#transactionTable"

            );



            if(table){


                table.innerHTML = `

                    <div class="transactions-empty">

                        ${safe(text("failed"))}

                    </div>

                `;


            }



        }



    };









    // ==============================
    // View Switching
    // ==============================


    const showTransactions = () => {


        createWorkspace();



        document

        .querySelectorAll(

            ".main > section:not(#transactionsWorkspace)"

        )

        .forEach(section => {


            section.dataset.oldDisplay =

                section.style.display;



            section.style.display = "none";



        });





        document

        .querySelector("#transactionsWorkspace")

        ?.classList.add("visible");



        loadTransactions();



        window.scrollTo({

            top:0,

            behavior:"smooth"

        });



    };








    const showDashboard = () => {



        document

        .querySelectorAll(

            ".main > section:not(#transactionsWorkspace)"

        )

        .forEach(section => {


            section.style.display =

                section.dataset.oldDisplay || "";



        });





        document

        .querySelector("#transactionsWorkspace")

        ?.classList.remove("visible");




        window.scrollTo({

            top:0,

            behavior:"smooth"

        });



    };









    // ==============================
    // Navigation Handler
    // ==============================


    const setupNavigation = () => {



        document.addEventListener(

            "click",

            event => {



                const nav = event.target.closest(

                    ".nav-item[data-section]"

                );



                const viewButton = event.target.closest(

                    "#viewTransactionsButton"

                );




                if(!nav && !viewButton)

                    return;





                const section = nav?.dataset.section;





                if(

                    !viewButton &&

                    section !== "transactions" &&

                    section !== "dashboard"

                )

                    return;





                event.preventDefault();





                document

                .querySelectorAll(

                    ".nav-item[data-section]"

                )

                .forEach(item => {


                    item.classList.toggle(

                        "active",

                        item === nav

                    );


                });








                if(

                    viewButton ||

                    section === "transactions"

                ){


                    showTransactions();


                }

                else{


                    showDashboard();


                }




            },

            true

        );



    };









    // ==============================
    // Application Start
    // ==============================


    document.addEventListener(

        "DOMContentLoaded",

        () => {


            injectStyles();


            setupNavigation();


            document

            .querySelector("#transactionTable")

            ?.addEventListener(

                "click",

                handleTransactionAction

            );



        }

    );



})();