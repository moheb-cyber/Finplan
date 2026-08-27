/* FinPlan v1 — UI polish and session controls */
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const fa = () => document.documentElement.lang === "fa";
    const userName = () => { try { return JSON.parse(localStorage.getItem("finplan-user") || "null")?.name || "Moheb"; } catch { return "Moheb"; } };
    const safe = value => String(value ?? "").replace(/[<>]/g, "");

    function profile() {
        const p = $(".profile");
        if (!p) return;
        p.innerHTML = `<div class="profile-info"><strong>${safe(userName())}</strong><span>${fa() ? "حساب شخصی" : "Personal account"}</span></div>`;
        p.classList.add("profile-fixed");
    }

    function logout() {
        localStorage.removeItem("finplan-token");
        localStorage.removeItem("finplan-user");
        sessionStorage.clear();
        window.dispatchEvent(new CustomEvent("finplan:logout"));
    }

    function wire() {
        profile();
        document.documentElement.dataset.theme = localStorage.getItem("finplan-theme") === "light" ? "light" : "dark";
        document.addEventListener("click", event => {
            const logoutButton = event.target.closest("#logoutButton");
            if (!logoutButton) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            logout();
        }, true);
    }

    document.addEventListener("DOMContentLoaded", wire);
    window.addEventListener("finplan:language-change", profile);
    window.addEventListener("finplan:authenticated", profile);
})();