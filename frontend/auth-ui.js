/* FinPlan v1 — authentication UI */
(() => {
    const API_BASE = window.FINPLAN_API_BASE || "";
    const $ = (s, r = document) => r.querySelector(s);
    const token = () => localStorage.getItem("finplan-token");
    const fa = () => document.documentElement.lang === "fa";
    const api = async (path, options = {}) => {
        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        if (token()) headers.set("Authorization", `Bearer ${token()}`);
        const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    };
    let registerMode = false;
    function mount() {
        if ($("#authScreen")) return;
        document.body.insertAdjacentHTML("afterbegin", `<section id="authScreen" class="auth-screen" hidden><div class="auth-glow"></div><div class="auth-card"><div class="auth-brand"><span>F</span><div><strong>FinPlan</strong><small>PERSONAL FINANCE</small></div></div><div class="auth-heading"><span class="panel-label" id="authEyebrow">WELCOME BACK</span><h1 id="authTitle">Sign in to FinPlan</h1><p id="authSubtitle">Your financial workspace, saved to your account.</p></div><form id="authForm"><div class="auth-field auth-name-field" hidden><label>Name<input name="name" maxlength="80" autocomplete="name"></label></div><div class="auth-field"><label>Email<input name="email" type="email" required autocomplete="email"></label></div><div class="auth-field"><label>Password<input name="password" type="password" minlength="8" required autocomplete="current-password"></label></div><button class="primary-button auth-submit" type="submit" id="authSubmit">Sign in</button></form><button class="auth-switch" type="button" id="authSwitch">Create an account</button><div class="auth-error" id="authError" role="alert"></div></div></section>`);
        $("#authForm").addEventListener("submit", submit);
        $("#authSwitch").addEventListener("click", () => { updateMode(!registerMode); $("#authError").textContent=""; });
        updateMode(false);
    }
    function updateMode(register) { registerMode=register; $("#authEyebrow").textContent=register?(fa()?"حساب جدید":"NEW ACCOUNT"):(fa()?"خوش آمدی":"WELCOME BACK"); $("#authTitle").textContent=register?(fa()?"حساب FinPlan بساز":"Create your FinPlan account"):(fa()?"وارد FinPlan شو":"Sign in to FinPlan"); $("#authSubtitle").textContent=register?(fa()?"اطلاعات مالی‌ات را در حساب خودت نگه دار.":"Keep your financial workspace tied to your account."):(fa()?"فضای مالی شخصی تو، ذخیره‌شده در حسابت.":"Your financial workspace, saved to your account."); $(".auth-name-field").hidden=!register; $(".auth-name-field input").required=register; $("[name=password]").autocomplete=register?"new-password":"current-password"; $("#authSubmit").textContent=register?(fa()?"ساخت حساب":"Create account"):(fa()?"ورود":"Sign in"); $("#authSwitch").textContent=register?(fa()?"حساب دارم؛ ورود":"I already have an account"):(fa()?"ساخت حساب جدید":"Create an account"); }
    async function submit(event) { event.preventDefault(); const data=new FormData(event.currentTarget); const payload={email:String(data.get("email")||"").trim(),password:String(data.get("password")||"")}; if(registerMode)payload.name=String(data.get("name")||"").trim(); try { const result=await api(registerMode?"/auth/register":"/auth/login",{method:"POST",body:JSON.stringify(payload)}); localStorage.setItem("finplan-token",result.token); localStorage.setItem("finplan-user",JSON.stringify(result.user)); enterApp(result.user); } catch(error) { console.error(error); $("#authError").textContent=registerMode?(fa()?"ساخت حساب ناموفق بود.":"Could not create the account."):(fa()?"ایمیل یا رمز عبور اشتباه است.":"Invalid email or password."); } }
    function enterApp(user) { $("#authScreen").hidden=true; $(".app-shell").hidden=false; const name=user?.name||"Moheb"; $(".profile-info strong")?.replaceChildren(document.createTextNode(name)); $("#welcomeName")?.replaceChildren(document.createTextNode(name)); window.dispatchEvent(new CustomEvent("finplan:authenticated",{detail:user})); if(typeof window.refreshDashboard==="function")window.refreshDashboard(); }
    function showAuth(){ $("#authScreen").hidden=false; $(".app-shell").hidden=true; }
    async function init(){ mount(); if(token()){ try { const user=await api("/auth/me"); localStorage.setItem("finplan-user",JSON.stringify(user)); enterApp(user); } catch { localStorage.removeItem("finplan-token"); localStorage.removeItem("finplan-user"); showAuth(); } } else showAuth(); }
    window.finplanLogout=()=>{localStorage.removeItem("finplan-token");localStorage.removeItem("finplan-user");location.reload();};
    window.addEventListener("finplan:language-change",()=>{if($("#authScreen")&&!$("#authScreen").hidden)updateMode(registerMode);});
    window.addEventListener("finplan:auth-required",showAuth);
    document.addEventListener("DOMContentLoaded",init);
})();