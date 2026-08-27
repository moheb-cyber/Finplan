/* FinPlan v1 — UI polish, settings and session controls */
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const fa = () => document.documentElement.lang === "fa";
    const userName = () => { try { return JSON.parse(localStorage.getItem("finplan-user") || "null")?.name || "Moheb"; } catch { return "Moheb"; } };
    const safe = value => String(value ?? "").replace(/[<>]/g, "");

    function profile() {
        const p = $(".profile");
        if (!p) return;
        p.querySelectorAll(":scope > *:not(.profile-info)").forEach(node => node.remove());
        p.innerHTML = `<div class="profile-info"><strong>${safe(userName())}</strong><span>${fa() ? "حساب شخصی" : "Personal account"}</span></div>`;
        p.classList.add("profile-fixed");
    }

    function settings() {
        const root = $("#transactionsWorkspace"); if (!root) return;
        root.hidden = false; root.classList.add("visible"); root.dataset.workspace = "settings";
        const theme = localStorage.getItem("finplan-theme") === "light" ? "light" : "dark";
        root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${fa() ? "تنظیمات" : "SETTINGS"}</span><h2>${fa() ? "تنظیمات FinPlan" : "FinPlan settings"}</h2></div></div><div class="settings-grid"><article class="workspace-card settings-card"><div><span class="panel-label">${fa() ? "ظاهر" : "APPEARANCE"}</span><h3>${fa() ? "تم رابط کاربری" : "Interface theme"}</h3><p>${fa() ? "ظاهر برنامه را انتخاب کن." : "Choose how FinPlan looks."}</p></div><div class="settings-choice"><button type="button" class="settings-option ${theme === "dark" ? "active" : ""}" data-theme="dark">${fa() ? "تیره" : "Dark"}</button><button type="button" class="settings-option ${theme === "light" ? "active" : ""}" data-theme="light">${fa() ? "روشن" : "Light"}</button></div></article></div>`;
        root.querySelectorAll("[data-theme]").forEach(button => button.onclick = () => { localStorage.setItem("finplan-theme", button.dataset.theme); document.documentElement.dataset.theme = button.dataset.theme; settings(); });
    }

    function logout() {
        localStorage.removeItem("finplan-token");
        localStorage.removeItem("finplan-user");
        sessionStorage.clear();
        window.dispatchEvent(new CustomEvent("finplan:logout"));
        setTimeout(() => { if (localStorage.getItem("finplan-token")) localStorage.removeItem("finplan-token"); location.reload(); }, 0);
    }

    function wire() {
        profile();
        document.documentElement.dataset.theme = localStorage.getItem("finplan-theme") === "light" ? "light" : "dark";
        document.addEventListener("click", event => {
            const logoutButton = event.target.closest("#logoutButton");
            if (!logoutButton) return;
            event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); logout();
        }, true);
        const settingsButton = $(".nav-item[data-section='settings']");
        if (settingsButton) settingsButton.onclick = event => { event.preventDefault(); document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active")); settingsButton.classList.add("active"); [".dashboard-grid", ".summary-grid", ".budget-list-panel", ".transactions-panel"].forEach(s => $(s)?.setAttribute("hidden", "true")); settings(); };
    }

    document.addEventListener("DOMContentLoaded", wire);
    window.addEventListener("finplan:language-change", profile);
    window.addEventListener("finplan:authenticated", profile);
})();