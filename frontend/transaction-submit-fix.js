/* FinPlan v1 — transaction submit reliability layer */
(() => {
    const API = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const $ = s => document.querySelector(s);
    const fa = () => document.documentElement.lang === "fa";
    const toast = m => window.showToast?.(m);
    const submit = async (event) => {
        const form = event.target.closest("#workspaceTransactionForm");
        if (!form) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const token = localStorage.getItem("finplan-token");
        if (!token) { window.dispatchEvent(new CustomEvent("finplan:auth-required")); return; }
        const data = new FormData(form);
        const payload = {
            title: String(data.get("title") || "").trim(),
            amount: Number(data.get("amount")),
            type: String(data.get("type") || "expense"),
            category: String(data.get("category") || "").trim()
        };
        if (!payload.title || !payload.category || !Number.isFinite(payload.amount) || payload.amount <= 0) {
            toast(fa() ? "لطفاً همه فیلدها را صحیح پر کن." : "Please complete all fields correctly.");
            return;
        }
        const id = form.dataset.transactionId;
        const url = id ? `${API}/transactions/${encodeURIComponent(id)}` : `${API}/transactions`;
        try {
            const response = await fetch(url, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const body = await response.json().catch(() => ({}));
            if (response.status === 401) { window.dispatchEvent(new CustomEvent("finplan:auth-required")); return; }
            if (!response.ok) {
                console.error("FinPlan transaction submit:", response.status, body);
                throw new Error(body.detail || `HTTP ${response.status}`);
            }
            $("#transactionWorkspaceModal")?.remove();
            toast(id ? (fa() ? "تراکنش به‌روزرسانی شد." : "Transaction updated.") : (fa() ? "تراکنش با موفقیت ثبت شد." : "Transaction added successfully."));
            await window.refreshDashboard?.();
            window.dispatchEvent(new CustomEvent("finplan:transactions-refresh"));
        } catch (error) {
            console.error(error);
            toast(fa() ? "ثبت تراکنش ناموفق بود." : "Could not save transaction.");
        }
    };
    document.addEventListener("submit", submit, true);
})();