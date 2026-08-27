/* FinPlan v1 — actionable settings workspace */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fa = () => document.documentElement.lang === 'fa';
  const copy = (en, faText) => fa() ? faText : en;

  function renderSettings() {
    const root = $('#transactionsWorkspace');
    if (!root) return;
    root.hidden = false;
    root.classList.add('visible');
    root.dataset.workspace = 'settings';

    const theme = localStorage.getItem('finplan-theme') === 'light' ? 'light' : 'dark';
    const currency = localStorage.getItem('finplan-currency') === 'IRR' ? 'IRR' : 'USD';
    const language = localStorage.getItem('finplan-language') === 'fa' ? 'fa' : 'en';

    root.innerHTML = `<div class="workspace-header"><div><span class="panel-label">${copy('SETTINGS', 'تنظیمات')}</span><h2>${copy('FinPlan preferences', 'تنظیمات FinPlan')}</h2></div></div><div class="settings-grid"><article class="workspace-card settings-card"><div><span class="panel-label">${copy('APPEARANCE', 'ظاهر')}</span><h3>${copy('Interface theme', 'تم رابط کاربری')}</h3><p>${copy('Choose the visual theme used by FinPlan.', 'ظاهر مورد استفاده FinPlan را انتخاب کن.')}</p></div><div class="settings-choice"><button type="button" class="settings-option ${theme === 'dark' ? 'active' : ''}" data-setting-theme="dark">${copy('Dark', 'تیره')}</button><button type="button" class="settings-option ${theme === 'light' ? 'active' : ''}" data-setting-theme="light">${copy('Light', 'روشن')}</button></div></article><article class="workspace-card settings-card"><div><span class="panel-label">${copy('LANGUAGE', 'زبان')}</span><h3>${copy('Interface language', 'زبان رابط')}</h3><p>${copy('Switch the interface language instantly.', 'زبان رابط را تغییر بده.')}</p></div><div class="settings-choice"><button type="button" class="settings-option ${language === 'en' ? 'active' : ''}" data-setting-language="en">EN</button><button type="button" class="settings-option ${language === 'fa' ? 'active' : ''}" data-setting-language="fa">FA</button></div></article><article class="workspace-card settings-card"><div><span class="panel-label">${copy('CURRENCY', 'واحد پول')}</span><h3>${copy('Display currency', 'واحد نمایش')}</h3><p>${copy('Choose how amounts are displayed across the dashboard.', 'نحوه نمایش مبالغ را انتخاب کن.')}</p></div><div class="settings-choice"><button type="button" class="settings-option ${currency === 'USD' ? 'active' : ''}" data-setting-currency="USD">USD</button><button type="button" class="settings-option ${currency === 'IRR' ? 'active' : ''}" data-setting-currency="IRR">IRR</button></div></article></div>`;

    root.querySelectorAll('[data-setting-theme]').forEach(button => button.addEventListener('click', () => {
      localStorage.setItem('finplan-theme', button.dataset.settingTheme);
      document.documentElement.dataset.theme = button.dataset.settingTheme;
      renderSettings();
    }));
    root.querySelectorAll('[data-setting-language]').forEach(button => button.addEventListener('click', () => window.setLanguage?.(button.dataset.settingLanguage)));
    root.querySelectorAll('[data-setting-currency]').forEach(button => button.addEventListener('click', () => window.setCurrency?.(button.dataset.settingCurrency)));
  }

  window.addEventListener('finplan:open-settings', renderSettings);
  window.addEventListener('finplan:language-change', () => {
    if ($('#transactionsWorkspace')?.dataset.workspace === 'settings') renderSettings();
  });
  window.addEventListener('finplan:currency-change', () => {
    if ($('#transactionsWorkspace')?.dataset.workspace === 'settings') renderSettings();
  });
})();