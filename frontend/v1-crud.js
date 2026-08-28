/* FinPlan v1 — reliable CRUD entry points */
(() => {
    const API = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const $ = (s, r = document) => r.querySelector(s);
    const fa = () => document.documentElement.lang === "fa";
    const token = () => localStorage.getItem("finplan-token");
    const text = (en, f) => fa() ? f : en;
    const esc = v => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
    const month = () => localStorage.getItem("finplan-month") || new Date().toISOString().slice(0,7);
    const toast = m => window.showToast?.(m);

    function openModal(kind) {
        $("#v1CrudModal")?.remove();
        const transaction = kind === "transaction";
        document.body.insertAdjacentHTML("beforeend", `<div class="v1-modal v1-crud-modal" id="v1CrudModal"><div class="v1-modal-backdrop" data-close></div><section class="v1-modal-card" role="dialog" aria-modal="true" aria-labelledby="v1CrudTitle"><button class="v1-modal-close" type="button" data-close aria-label="Close">×</button><span class="panel-label">${transaction?text("TRANSACTION","تراکنش"):text("BUDGET","بودجه")}</span><h2 id="v1CrudTitle">${transaction?text("Add transaction","افزودن تراکنش"):text("Add budget","افزودن بودجه")}</h2><p class="v1-crud-subtitle">${transaction?text("Record an income or expense in your personal account.","درآمد یا هزینه را در حساب شخصی خود ثبت کن."):text("Set a monthly spending limit for a category.","برای یک دسته‌بندی، سقف هزینه ماهانه تعیین کن.")}</p><form class="v1-form" id="v1CrudForm"><label>${transaction?text("Title","عنوان"):text("Category","دسته‌بندی")}<input name="primary" required maxlength="80" autocomplete="off" placeholder="${transaction?text("e.g. Groceries","مثلاً خرید روزانه"):text("e.g. Food","مثلاً خوراک")}"></label><div class="v1-form-grid"><label>${text("Amount","مبلغ")}<input name="amount" type="number" min="1" step="1" required inputmode="numeric" placeholder="${transaction?"0":"1000000"}"></label>${transaction?`<label>${text("Type","نوع")}<select name="type"><option value="expense">${text("Expense","هزینه")}</option><option value="income">${text("Income","درآمد")}</option></select></label>`:`<label>${text("Month","ماه")}<input name="month" type="month" required value="${esc(month())}"></label>`}</div>${transaction?`<label>${text("Category","دسته‌بندی")}<input name="category" required maxlength="40" autocomplete="off" placeholder="${text("e.g. Food","مثلاً خوراک")}"></label>`:""}<div class="v1-form-actions"><button type="button" class="secondary-button" data-close>${text("Cancel","انصراف")}</button><button type="submit" class="primary-button">＋ ${transaction?text("Add transaction","ثبت تراکنش"):text("Add budget","ثبت بودجه")}</button></div><div class="v1-crud-error" id="v1CrudError" role="alert"></div></form></section></div>`);
        const form=$("#v1CrudForm");form.dataset.kind=kind;
        form.querySelectorAll("[data-close]").forEach(e=>e.onclick=()=>$("#v1CrudModal")?.remove());
        form.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
        $("#v1CrudForm [name=primary]")?.focus();
    }

    async function submit(form) {
        const data=new FormData(form),kind=form.dataset.kind,error=$("#v1CrudError");
        if(!token()){window.dispatchEvent(new CustomEvent("finplan:auth-required"));return}
        const amount=Number(data.get("amount"));
        if(!String(data.get("primary")||"").trim()||!Number.isFinite(amount)||amount<=0){error.textContent=text("Please complete the required fields.","لطفاً فیلدهای لازم را صحیح تکمیل کن.");return}
        const payload=kind==="transaction"?{title:String(data.get("primary")).trim(),amount:Math.round(amount),type:String(data.get("type")),category:String(data.get("category")||"").trim()}:{category:String(data.get("primary")).trim(),amount:Math.round(amount),month:String(data.get("month")||month())};
        if(kind==="transaction"&&!payload.category){error.textContent=text("Category is required.","دسته‌بندی الزامی است.");return}
        try{const response=await fetch(`${API}/${kind==="transaction"?"transactions":"budgets"}`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`},body:JSON.stringify(payload)});const body=await response.json().catch(()=>({}));if(response.status===401){window.dispatchEvent(new CustomEvent("finplan:auth-required"));return}if(!response.ok){error.textContent=response.status===400?text("This category already has a budget for this month.","برای این دسته‌بندی در این ماه قبلاً بودجه ثبت شده است."):text("Could not save. Please try again.","ذخیره انجام نشد. دوباره تلاش کن.");console.error("FinPlan CRUD",response.status,body);return}$("#v1CrudModal")?.remove();toast(kind==="transaction"?text("Transaction added successfully.","تراکنش با موفقیت ثبت شد."):text("Budget added successfully.","بودجه با موفقیت ثبت شد."));await window.refreshDashboard?.();if(kind==="transaction")window.dispatchEvent(new CustomEvent("finplan:transactions-refresh"));else window.dispatchEvent(new CustomEvent("finplan:workspace",{detail:"budgets"}))}catch(e){console.error(e);error.textContent=text("Could not connect to the server.","اتصال به سرور انجام نشد.")}
    }
    document.addEventListener("click",event=>{const button=event.target.closest("#addTransactionButton, #workspaceAddTransaction, #addBudgetButton");if(!button)return;event.preventDefault();event.stopImmediatePropagation();openModal(button.id==="addBudgetButton"?"budget":"transaction")},true);
    document.addEventListener("submit",event=>{const form=event.target.closest("#v1CrudForm");if(!form)return;event.preventDefault();event.stopImmediatePropagation();submit(form)},true);
    document.addEventListener("keydown",event=>{if(event.key==="Escape")$("#v1CrudModal")?.remove()});
})();