/**
 * Cookie Eater & AdBlocker - Popup Script v3.0
 * Gestion de l'interface utilisateur
 * Created by Fusion AI
 */

// ==========================================
// INTERNATIONALIZATION (i18n)
// ==========================================

const translations = {
  en: {
    // Status
    status_active: 'Active',
    status_inactive: 'Inactive',
    
    // Tabs
    tab_cookies: 'Cookies',
    tab_adblock: 'AdBlock',
    
    // Stats
    stats_today: 'Today',
    stats_total: 'Total',
    stats_sites: 'Sites',
    stats_page: 'This page',
    
    // Main toggle
    protection_active: 'Protection active',
    adblock_enabled: 'Ad blocking',
    
    // Management mode
    management_mode: 'Management mode',
    mode_reject_all: 'Reject all',
    mode_reject_all_desc: 'Maximum privacy',
    mode_essential: 'Essential only',
    mode_essential_desc: 'Functional cookies only',
    mode_anonymize: 'Accept & Anonymize',
    mode_anonymize_desc: 'Accept then replace with fake data',
    
    // Privacy options
    privacy_options: 'Privacy options',
    opt_hide_banners: 'Hide banners',
    opt_hide_banners_desc: 'Hide banner after processing',
    opt_clean_trackers: 'Clean trackers',
    opt_clean_trackers_desc: 'Remove tracking cookies',
    opt_anonymize: 'Anonymize data',
    opt_anonymize_desc: 'Replace IDs with fake ones',
    opt_notifications: 'Notifications',
    opt_notifications_desc: 'Show discrete notification',
    
    // Buttons
    btn_scan: 'Scan this page',
    btn_clean: 'Clean cookies',
    btn_reset: 'Reset stats',
    btn_options: 'Options & Whitelist',
    btn_reset_adblock: 'Reset stats',
    
    // AdBlocker categories
    block_categories: 'Blocking categories',
    cat_ads: 'Advertisements',
    cat_ads_desc: 'Banners, popups, video ads',
    cat_trackers: 'Trackers',
    cat_trackers_desc: 'Analytics, beacons, pixels',
    cat_social: 'Social widgets',
    cat_social_desc: 'Like buttons, share buttons',
    
    // Whitelist
    whitelist_blocked: 'Ads blocked',
    whitelist_allowed: 'Ads allowed',
    whitelist_allow: 'Allow ads',
    whitelist_block: 'Block ads',
    
    // Footer
    footer_credits: 'Made by Fusion AI',
    
    // Toasts
    toast_scan_launched: 'Scan launched! 🔍',
    toast_cookies_cleaned: 'Cookies cleaned! 🧹',
    toast_stats_reset: 'Stats reset ✓',
    toast_no_active_tab: 'No active tab',
    toast_cannot_scan: 'Cannot scan this page',
    toast_cannot_clean: 'Cannot clean cookies',
    toast_reset_error: 'Reset error',
    toast_mode_reject: '🛡️ Reject all',
    toast_mode_essential: '🔒 Essential only',
    toast_mode_anonymize: '🎭 Accept & Anonymize',
    toast_lang_changed: 'Language changed',
    toast_adblock_enabled: 'Ad blocking enabled',
    toast_adblock_disabled: 'Ad blocking disabled',
    toast_site_whitelisted: 'Site added to whitelist',
    toast_site_removed: 'Site removed from whitelist',
    toast_category_enabled: 'Category enabled',
    toast_category_disabled: 'Category disabled',
    
    // Confirm
    confirm_reset: 'Do you really want to reset all statistics?',
    confirm_reset_adblock: 'Do you really want to reset ad blocking statistics?'
  },
  fr: {
    // Status
    status_active: 'Actif',
    status_inactive: 'Inactif',
    
    // Tabs
    tab_cookies: 'Cookies',
    tab_adblock: 'AdBlock',
    
    // Stats
    stats_today: "Aujourd'hui",
    stats_total: 'Total',
    stats_sites: 'Sites',
    stats_page: 'Cette page',
    
    // Main toggle
    protection_active: 'Protection active',
    adblock_enabled: 'Blocage publicitaire',
    
    // Management mode
    management_mode: 'Mode de gestion',
    mode_reject_all: 'Refuser tout',
    mode_reject_all_desc: 'Maximum de confidentialité',
    mode_essential: 'Essentiels uniquement',
    mode_essential_desc: 'Cookies fonctionnels seulement',
    mode_anonymize: 'Accepter & Anonymiser',
    mode_anonymize_desc: 'Accepte puis remplace par fausses données',
    
    // Privacy options
    privacy_options: 'Options de confidentialité',
    opt_hide_banners: 'Masquer les bannières',
    opt_hide_banners_desc: 'Cache la bannière après traitement',
    opt_clean_trackers: 'Nettoyer les trackers',
    opt_clean_trackers_desc: 'Supprime les cookies de tracking',
    opt_anonymize: 'Anonymiser les données',
    opt_anonymize_desc: 'Remplace les IDs par des faux',
    opt_notifications: 'Notifications',
    opt_notifications_desc: 'Affiche une notification discrète',
    
    // Buttons
    btn_scan: 'Scanner cette page',
    btn_clean: 'Nettoyer les cookies',
    btn_reset: 'Réinitialiser stats',
    btn_options: 'Options & Whitelist',
    btn_reset_adblock: 'Réinitialiser stats',
    
    // AdBlocker categories
    block_categories: 'Catégories de blocage',
    cat_ads: 'Publicités',
    cat_ads_desc: 'Bannières, popups, vidéos pub',
    cat_trackers: 'Trackers',
    cat_trackers_desc: 'Analytics, balises, pixels',
    cat_social: 'Widgets sociaux',
    cat_social_desc: 'Boutons Like, partage',
    
    // Whitelist
    whitelist_blocked: 'Pubs bloquées',
    whitelist_allowed: 'Pubs autorisées',
    whitelist_allow: 'Autoriser pubs',
    whitelist_block: 'Bloquer pubs',
    
    // Footer
    footer_credits: 'Créé par Fusion AI',
    
    // Toasts
    toast_scan_launched: 'Scan lancé ! 🔍',
    toast_cookies_cleaned: 'Cookies nettoyés ! 🧹',
    toast_stats_reset: 'Stats réinitialisées ✓',
    toast_no_active_tab: 'Aucun onglet actif',
    toast_cannot_scan: 'Impossible de scanner cette page',
    toast_cannot_clean: 'Impossible de nettoyer les cookies',
    toast_reset_error: 'Erreur lors de la réinitialisation',
    toast_mode_reject: '🛡️ Refuser tout',
    toast_mode_essential: '🔒 Essentiels uniquement',
    toast_mode_anonymize: '🎭 Accepter & Anonymiser',
    toast_lang_changed: 'Langue changée',
    toast_adblock_enabled: 'Blocage publicitaire activé',
    toast_adblock_disabled: 'Blocage publicitaire désactivé',
    toast_site_whitelisted: 'Site ajouté à la whitelist',
    toast_site_removed: 'Site retiré de la whitelist',
    toast_category_enabled: 'Catégorie activée',
    toast_category_disabled: 'Catégorie désactivée',
    
    // Confirm
    confirm_reset: 'Voulez-vous vraiment réinitialiser toutes les statistiques ?',
    confirm_reset_adblock: 'Voulez-vous vraiment réinitialiser les statistiques de blocage ?'
  }
};

const flags = {
  en: '🇬🇧',
  fr: '🇫🇷'
};

let currentLang = 'en';

/**
 * Get translation for a key
 */
function t(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

/**
 * Apply translations to the page
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
  
  document.getElementById('currentFlag').textContent = flags[currentLang];
  updateStatusIndicator(currentConfig.enabled);
  updateWhitelistUI();
}

/**
 * Toggle language between EN and FR
 */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  chrome.storage.sync.set({ cookieEaterLang: currentLang });
  applyTranslations();
  notifyContentScriptsLang();
  showToast(t('toast_lang_changed') + ' ' + flags[currentLang]);
}

/**
 * Load saved language preference
 */
async function loadLanguage() {
  try {
    const result = await chrome.storage.sync.get('cookieEaterLang');
    if (result.cookieEaterLang) {
      currentLang = result.cookieEaterLang;
    }
  } catch (e) {
    console.log('Using default language');
  }
}

/**
 * Notify content scripts about language change
 */
async function notifyContentScriptsLang() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'langUpdate',
          lang: currentLang
        });
      } catch (e) {}
    }
  } catch (e) {}
}

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
  // Header
  statusIndicator: document.getElementById('statusIndicator'),
  langBtn: document.getElementById('langBtn'),
  
  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Cookie Eater
  enabledToggle: document.getElementById('enabledToggle'),
  autoHideToggle: document.getElementById('autoHideToggle'),
  cleanTrackingToggle: document.getElementById('cleanTrackingToggle'),
  anonymizeToggle: document.getElementById('anonymizeToggle'),
  notificationToggle: document.getElementById('notificationToggle'),
  todayCount: document.getElementById('todayCount'),
  totalCount: document.getElementById('totalCount'),
  domainsCount: document.getElementById('domainsCount'),
  scanBtn: document.getElementById('scanBtn'),
  cleanBtn: document.getElementById('cleanBtn'),
  resetBtn: document.getElementById('resetBtn'),
  modeOptions: document.querySelectorAll('input[name="mode"]'),
  
  // AdBlocker
  adblockToggle: document.getElementById('adblockToggle'),
  adsToggle: document.getElementById('adsToggle'),
  trackersToggle: document.getElementById('trackersToggle'),
  socialToggle: document.getElementById('socialToggle'),
  pageBlockedCount: document.getElementById('pageBlockedCount'),
  todayBlockedCount: document.getElementById('todayBlockedCount'),
  totalBlockedCount: document.getElementById('totalBlockedCount'),
  currentDomain: document.getElementById('currentDomain'),
  whitelistStatus: document.getElementById('whitelistStatus'),
  whitelistIcon: document.getElementById('whitelistIcon'),
  whitelistRow: document.getElementById('whitelistRow'),
  toggleWhitelistBtn: document.getElementById('toggleWhitelistBtn'),
  openOptionsBtn: document.getElementById('openOptionsBtn'),
  resetAdblockBtn: document.getElementById('resetAdblockBtn')
};

// ==========================================
// DEFAULT CONFIGS
// ==========================================

const DEFAULT_CONFIG = {
  enabled: true,
  mode: 'reject_all',
  autoHide: true,
  showNotification: true,
  cleanTrackingCookies: true,
  anonymizeData: true,
  delay: 500
};

let currentConfig = { ...DEFAULT_CONFIG };
let currentAdblockConfig = {
  enabled: true,
  adsEnabled: true,
  trackersEnabled: true,
  socialEnabled: true,
  whitelist: []
};
let currentDomainName = '';
let currentTabId = null;

// ==========================================
// TABS MANAGEMENT
// ==========================================

function initTabs() {
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  // Update buttons
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  
  // Update content
  elements.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });
}

// ==========================================
// COOKIE EATER FUNCTIONS
// ==========================================

async function loadConfig() {
  try {
    const result = await chrome.storage.sync.get('cookieEaterConfig');
    if (result.cookieEaterConfig) {
      currentConfig = { ...DEFAULT_CONFIG, ...result.cookieEaterConfig };
    }
    updateCookieUI();
  } catch (e) {
    console.error('Error loading config:', e);
  }
}

async function saveConfig() {
  try {
    await chrome.storage.sync.set({ cookieEaterConfig: currentConfig });
    
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'configUpdate',
          config: currentConfig
        });
      } catch (e) {}
    }
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

async function loadCookieStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ type: 'getStats' });
    if (stats && stats.cookies) {
      animateNumber(elements.todayCount, stats.cookies.todayProcessed || 0);
      animateNumber(elements.totalCount, stats.cookies.totalProcessed || 0);
      animateNumber(elements.domainsCount, Object.keys(stats.cookies.domains || {}).length);
    }
  } catch (e) {
    console.error('Error loading cookie stats:', e);
  }
}

function updateCookieUI() {
  elements.enabledToggle.checked = currentConfig.enabled;
  updateStatusIndicator(currentConfig.enabled);
  
  elements.autoHideToggle.checked = currentConfig.autoHide;
  elements.notificationToggle.checked = currentConfig.showNotification;
  elements.cleanTrackingToggle.checked = currentConfig.cleanTrackingCookies;
  elements.anonymizeToggle.checked = currentConfig.anonymizeData;
  
  elements.modeOptions.forEach(option => {
    option.checked = option.value === currentConfig.mode;
  });
}

function updateStatusIndicator(enabled) {
  const statusText = elements.statusIndicator.querySelector('.status-text');
  
  if (enabled && currentAdblockConfig.enabled) {
    elements.statusIndicator.classList.remove('inactive');
    statusText.textContent = t('status_active');
  } else {
    elements.statusIndicator.classList.add('inactive');
    statusText.textContent = t('status_inactive');
  }
}

// ==========================================
// ADBLOCKER FUNCTIONS
// ==========================================

async function loadAdblockConfig() {
  try {
    const config = await chrome.runtime.sendMessage({ type: 'getAdblockConfig' });
    if (config) {
      currentAdblockConfig = config;
    }
    updateAdblockUI();
  } catch (e) {
    console.error('Error loading adblock config:', e);
  }
}

async function loadAdblockStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ type: 'getStats' });
    
    if (stats && stats.adblock) {
      animateNumber(elements.todayBlockedCount, stats.adblock.todayBlocked || 0);
      animateNumber(elements.totalBlockedCount, stats.adblock.totalBlocked || 0);
    }
    
    // Page stats
    if (currentTabId) {
      const pageStats = await chrome.runtime.sendMessage({ 
        type: 'getPageStats', 
        tabId: currentTabId 
      });
      if (pageStats) {
        animateNumber(elements.pageBlockedCount, pageStats.pageBlocked || 0);
      }
    }
  } catch (e) {
    console.error('Error loading adblock stats:', e);
  }
}

async function loadCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabId = tab.id;
      const url = new URL(tab.url);
      currentDomainName = url.hostname.replace(/^www\./, '');
      elements.currentDomain.textContent = currentDomainName;
      
      // Check whitelist status
      await checkWhitelistStatus();
    } else {
      elements.currentDomain.textContent = '-';
      elements.whitelistRow.classList.add('disabled');
    }
  } catch (e) {
    elements.currentDomain.textContent = '-';
    elements.whitelistRow.classList.add('disabled');
  }
}

async function checkWhitelistStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'isWhitelisted', 
      domain: currentDomainName 
    });
    
    updateWhitelistUI(response.isWhitelisted);
  } catch (e) {
    console.error('Error checking whitelist:', e);
  }
}

function updateWhitelistUI(isWhitelisted = false) {
  const btnText = elements.toggleWhitelistBtn.querySelector('.btn-text');
  
  if (isWhitelisted) {
    elements.whitelistRow.classList.add('whitelisted');
    elements.whitelistIcon.textContent = '✅';
    elements.whitelistStatus.textContent = t('whitelist_allowed');
    elements.whitelistStatus.setAttribute('data-i18n', 'whitelist_allowed');
    if (btnText) {
      btnText.textContent = t('whitelist_block');
      btnText.setAttribute('data-i18n', 'whitelist_block');
    }
  } else {
    elements.whitelistRow.classList.remove('whitelisted');
    elements.whitelistIcon.textContent = '🛡️';
    elements.whitelistStatus.textContent = t('whitelist_blocked');
    elements.whitelistStatus.setAttribute('data-i18n', 'whitelist_blocked');
    if (btnText) {
      btnText.textContent = t('whitelist_allow');
      btnText.setAttribute('data-i18n', 'whitelist_allow');
    }
  }
}

function updateAdblockUI() {
  elements.adblockToggle.checked = currentAdblockConfig.enabled;
  elements.adsToggle.checked = currentAdblockConfig.adsEnabled;
  elements.trackersToggle.checked = currentAdblockConfig.trackersEnabled;
  elements.socialToggle.checked = currentAdblockConfig.socialEnabled;
}

async function toggleWhitelist() {
  if (!currentDomainName) return;
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'isWhitelisted', 
      domain: currentDomainName 
    });
    
    if (response.isWhitelisted) {
      await chrome.runtime.sendMessage({ 
        type: 'removeFromWhitelist', 
        domain: currentDomainName 
      });
      showToast(t('toast_site_removed'));
      updateWhitelistUI(false);
    } else {
      await chrome.runtime.sendMessage({ 
        type: 'addToWhitelist', 
        domain: currentDomainName 
      });
      showToast(t('toast_site_whitelisted'));
      updateWhitelistUI(true);
    }
    
    // Reload the page to apply changes
    if (currentTabId) {
      chrome.tabs.reload(currentTabId);
    }
  } catch (e) {
    console.error('Error toggling whitelist:', e);
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function animateNumber(element, target) {
  const current = parseInt(element.textContent) || 0;
  if (current === target) return;
  
  const duration = 500;
  const steps = 20;
  const increment = (target - current) / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const value = Math.round(current + increment * step);
    element.textContent = value;
    
    if (step >= steps) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, duration / steps);
}

function showToast(message, type = 'success') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==========================================
// COOKIE EATER ACTIONS
// ==========================================

async function scanCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showToast(t('toast_no_active_tab'), 'error');
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, { type: 'manualScan' });
    showToast(t('toast_scan_launched'));
    
    setTimeout(loadCookieStats, 1000);
  } catch (e) {
    showToast(t('toast_cannot_scan'), 'error');
  }
}

async function cleanCookies() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showToast(t('toast_no_active_tab'), 'error');
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, { type: 'cleanCookies' });
    showToast(t('toast_cookies_cleaned'), 'warning');
  } catch (e) {
    showToast(t('toast_cannot_clean'), 'error');
  }
}

async function resetCookieStats() {
  if (confirm(t('confirm_reset'))) {
    try {
      await chrome.runtime.sendMessage({ type: 'resetStats' });
      showToast(t('toast_stats_reset'));
      loadCookieStats();
    } catch (e) {
      showToast(t('toast_reset_error'), 'error');
    }
  }
}

async function resetAdblockStats() {
  if (confirm(t('confirm_reset_adblock'))) {
    try {
      await chrome.runtime.sendMessage({ type: 'resetAdblockStats' });
      showToast(t('toast_stats_reset'));
      loadAdblockStats();
    } catch (e) {
      showToast(t('toast_reset_error'), 'error');
    }
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Tabs
initTabs();

// Language
elements.langBtn.addEventListener('click', toggleLanguage);

// Cookie Eater toggles
elements.enabledToggle.addEventListener('change', (e) => {
  currentConfig.enabled = e.target.checked;
  updateStatusIndicator(e.target.checked);
  saveConfig();
});

elements.autoHideToggle.addEventListener('change', (e) => {
  currentConfig.autoHide = e.target.checked;
  saveConfig();
});

elements.cleanTrackingToggle.addEventListener('change', (e) => {
  currentConfig.cleanTrackingCookies = e.target.checked;
  saveConfig();
});

elements.anonymizeToggle.addEventListener('change', (e) => {
  currentConfig.anonymizeData = e.target.checked;
  saveConfig();
});

elements.notificationToggle.addEventListener('change', (e) => {
  currentConfig.showNotification = e.target.checked;
  saveConfig();
});

elements.modeOptions.forEach(option => {
  option.addEventListener('change', (e) => {
    currentConfig.mode = e.target.value;
    saveConfig();
    
    const modeToasts = {
      'reject_all': t('toast_mode_reject'),
      'accept_essential': t('toast_mode_essential'),
      'accept_anonymized': t('toast_mode_anonymize')
    };
    showToast(`Mode: ${modeToasts[e.target.value] || e.target.value}`);
  });
});

// Cookie Eater buttons
elements.scanBtn.addEventListener('click', scanCurrentPage);
elements.cleanBtn.addEventListener('click', cleanCookies);
elements.resetBtn.addEventListener('click', resetCookieStats);

// AdBlocker toggles
elements.adblockToggle.addEventListener('change', async (e) => {
  try {
    await chrome.runtime.sendMessage({ 
      type: 'toggleAdblock', 
      enabled: e.target.checked 
    });
    currentAdblockConfig.enabled = e.target.checked;
    updateStatusIndicator(currentConfig.enabled);
    showToast(e.target.checked ? t('toast_adblock_enabled') : t('toast_adblock_disabled'));
  } catch (err) {
    console.error('Error toggling adblock:', err);
  }
});

elements.adsToggle.addEventListener('change', async (e) => {
  try {
    await chrome.runtime.sendMessage({ 
      type: 'toggleCategory', 
      category: 'ads',
      enabled: e.target.checked 
    });
    currentAdblockConfig.adsEnabled = e.target.checked;
    showToast(e.target.checked ? t('toast_category_enabled') : t('toast_category_disabled'));
  } catch (err) {
    console.error('Error toggling ads:', err);
  }
});

elements.trackersToggle.addEventListener('change', async (e) => {
  try {
    await chrome.runtime.sendMessage({ 
      type: 'toggleCategory', 
      category: 'trackers',
      enabled: e.target.checked 
    });
    currentAdblockConfig.trackersEnabled = e.target.checked;
    showToast(e.target.checked ? t('toast_category_enabled') : t('toast_category_disabled'));
  } catch (err) {
    console.error('Error toggling trackers:', err);
  }
});

elements.socialToggle.addEventListener('change', async (e) => {
  try {
    await chrome.runtime.sendMessage({ 
      type: 'toggleCategory', 
      category: 'social',
      enabled: e.target.checked 
    });
    currentAdblockConfig.socialEnabled = e.target.checked;
    showToast(e.target.checked ? t('toast_category_enabled') : t('toast_category_disabled'));
  } catch (err) {
    console.error('Error toggling social:', err);
  }
});

// AdBlocker buttons
elements.toggleWhitelistBtn.addEventListener('click', toggleWhitelist);

elements.openOptionsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

elements.resetAdblockBtn.addEventListener('click', resetAdblockStats);

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load language first
  await loadLanguage();
  applyTranslations();
  
  // Load current tab info
  await loadCurrentTab();
  
  // Load configs
  await loadConfig();
  await loadAdblockConfig();
  
  // Load stats
  await loadCookieStats();
  await loadAdblockStats();
  
  // Refresh stats periodically
  setInterval(() => {
    loadCookieStats();
    loadAdblockStats();
  }, 3000);
});
