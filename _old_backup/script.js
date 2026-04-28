// ---------- Footer year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Mobile nav toggle ----------
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Highlight nav link on scroll ----------
const sections = document.querySelectorAll('section[id], header[id]');
const navItems = document.querySelectorAll('.nav-links a');
if (sections.length && navItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach((link) => {
            const href = link.getAttribute('href') || '';
            link.style.color = href === `#${id}` ? 'var(--text)' : '';
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
}

// ---------- Currency picker ----------
// Rates: USD -> target currency. Update periodically.
const RATES = {
  USD: { symbol: '$',   rate: 1,     flag: 'us' },
  EUR: { symbol: '€',   rate: 0.92,  flag: 'eu' },
  GBP: { symbol: '£',   rate: 0.79,  flag: 'gb' },
  AED: { symbol: 'AED', rate: 3.67,  flag: 'ae' },
  SAR: { symbol: 'SAR', rate: 3.75,  flag: 'sa' },
  KWD: { symbol: 'KWD', rate: 0.31,  flag: 'kw' },
  QAR: { symbol: 'QAR', rate: 3.64,  flag: 'qa' },
  BHD: { symbol: 'BHD', rate: 0.377, flag: 'bh' },
  OMR: { symbol: 'OMR', rate: 0.385, flag: 'om' },
  EGP: { symbol: 'EGP', rate: 48.5,  flag: 'eg' },
  INR: { symbol: '₹',   rate: 83.5,  flag: 'in' },
  CAD: { symbol: 'C$',  rate: 1.36,  flag: 'ca' },
  AUD: { symbol: 'A$',  rate: 1.51,  flag: 'au' },
};
const STORAGE_KEY = 'sahab-currency';

function formatAmount(n) {
  return Math.round(n).toLocaleString('en-US');
}

function applyCurrency(code) {
  const info = RATES[code];
  if (!info) return false;

  // Update all prices
  document.querySelectorAll('[data-base-usd]').forEach((el) => {
    const baseUsd = parseFloat(el.dataset.baseUsd);
    el.textContent = formatAmount(baseUsd * info.rate);
  });

  // Update all currency symbols
  document.querySelectorAll('[data-currency-symbol]').forEach((el) => {
    el.textContent = info.symbol;
    el.classList.toggle('currency-text', info.symbol.length > 1);
  });

  // Update the trigger button (flag + code + symbol)
  const triggerFlag = document.querySelector('[data-trigger-flag]');
  const triggerCode = document.querySelector('[data-trigger-code]');
  const triggerSym = document.querySelector('[data-trigger-sym]');
  if (triggerFlag) triggerFlag.src = `https://flagcdn.com/w40/${info.flag}.png`;
  if (triggerCode) triggerCode.textContent = code;
  if (triggerSym) triggerSym.textContent = info.symbol;

  try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  return true;
}

function initCurrencyPicker() {
  const picker = document.querySelector('[data-currency-picker]');
  if (!picker) return;

  const trigger = picker.querySelector('[data-trigger]');
  const menu = picker.querySelector('[data-menu]');
  const options = picker.querySelectorAll('.currency-option');
  if (!trigger || !menu) return;

  const openMenu = () => {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    picker.classList.add('is-open');
  };
  const closeMenu = () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    picker.classList.remove('is-open');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      const code = opt.dataset.code;
      applyCurrency(code);
      // Mark selected
      options.forEach((o) => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      closeMenu();
    });
  });

  // Keyboard: Escape closes, Enter/Space toggles
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) closeMenu();
  });

  // Restore saved choice
  let initial = 'USD';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && RATES[saved]) initial = saved;
  } catch (e) {}
  applyCurrency(initial);
  const current = picker.querySelector(`.currency-option[data-code="${initial}"]`);
  if (current) current.classList.add('is-selected');
}

// Wait for DOM, then init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCurrencyPicker);
} else {
  initCurrencyPicker();
}
