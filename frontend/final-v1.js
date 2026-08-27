/* FinPlan v1 final runtime guard */
(() => {
    const API_ORIGIN = window.FINPLAN_API_BASE || "http://127.0.0.1:8000";
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        let url = typeof input === "string" ? input : input?.url;
        if (url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/static/")) {
            const target = `${API_ORIGIN}${url}`;
            if (typeof input === "string") return nativeFetch(target, init);
            return nativeFetch(new Request(target, input), init);
        }
        return nativeFetch(input, init);
    };

    window.addEventListener("finplan:logout", () => {
        localStorage.removeItem("finplan-token");
        localStorage.removeItem("finplan-user");
        sessionStorage.clear();
        window.location.reload();
    });
})();
