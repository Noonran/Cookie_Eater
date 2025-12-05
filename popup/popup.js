/**
 * Cookie Eater - Popup Script v2.0
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
    
    // Stats
    stats_today: 'Today',
    stats_total: 'Total',
    stats_sites: 'Sites',
    
    // Main toggle
    protection_active: 'Protection active',
    
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
    
    // Confirm
    confirm_reset: 'Do you really want to reset all statistics?'
  },
  fr: {
    // Status
    status_active: 'Actif',
    status_inactive: 'Inactif',
    
    // Stats
    stats_today: "Aujourd'hui",
    stats_total: 'Total',
    stats_sites: 'Sites',
    
    // Main toggle
    protection_active: 'Protection active',
    
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
    
    // Confirm
    confirm_reset: 'Voulez-vous vraiment réinitialiser toutes les statistiques ?'
  }
};

const flags = {
  en: '🇬🇧',
  fr: '🇫🇷'
};

let currentLang = 'en'; // Default to English

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
  
  // Update flag
  document.getElementById('currentFlag').textContent = flags[currentLang];
  
  // Update status text
  updateStatusIndicator(currentConfig.enabled);
}

/**
 * Toggle language between EN and FR
 */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  
  // Save language preference
  chrome.storage.sync.set({ cookieEaterLang: currentLang });
  
  // Apply translations
  applyTranslations();
  
  // Notify content scripts about language change
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
      } catch (e) {
        // Tab may not have content script
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

// ==========================================
// MAIN POPUP LOGIC
// ==========================================

// DOM Elements
const elements = {
  statusIndicator: document.getElementById('statusIndicator'),
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
  langBtn: document.getElementById('langBtn'),
  modeOptions: document.querySelectorAll('input[name="mode"]')
};

// Default config
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

/**
 * Load config from storage
 */
async function loadConfig() {
  try {
    const result = await chrome.storage.sync.get('cookieEaterConfig');
    if (result.cookieEaterConfig) {
      currentConfig = { ...DEFAULT_CONFIG, ...result.cookieEaterConfig };
    }
    updateUI();
  } catch (e) {
    console.error('Error loading config:', e);
  }
}

/**
 * Save config
 */
async function saveConfig() {
  try {
    await chrome.storage.sync.set({ cookieEaterConfig: currentConfig });
    
    // Notify content scripts
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'configUpdate',
          config: currentConfig
        });
      } catch (e) {
        // Tab may not have content script
      }
    }
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

/**
 * Load stats
 */
async function loadStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ type: 'getStats' });
    if (stats) {
      animateNumber(elements.todayCount, stats.todayProcessed || 0);
      animateNumber(elements.totalCount, stats.totalProcessed || 0);
      animateNumber(elements.domainsCount, Object.keys(stats.domains || {}).length);
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

/**
 * Animate number
 */
function animateNumber(element, target) {
  const current = parseInt(element.textContent) || 0;
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

/**
 * Update UI based on config
 */
function updateUI() {
  // Main toggle
  elements.enabledToggle.checked = currentConfig.enabled;
  updateStatusIndicator(currentConfig.enabled);
  
  // Options
  elements.autoHideToggle.checked = currentConfig.autoHide;
  elements.notificationToggle.checked = currentConfig.showNotification;
  elements.cleanTrackingToggle.checked = currentConfig.cleanTrackingCookies;
  elements.anonymizeToggle.checked = currentConfig.anonymizeData;
  
  // Mode
  elements.modeOptions.forEach(option => {
    option.checked = option.value === currentConfig.mode;
  });
}

/**
 * Update status indicator
 */
function updateStatusIndicator(enabled) {
  const statusText = elements.statusIndicator.querySelector('.status-text');
  
  if (enabled) {
    elements.statusIndicator.classList.remove('inactive');
    statusText.textContent = t('status_active');
  } else {
    elements.statusIndicator.classList.add('inactive');
    statusText.textContent = t('status_inactive');
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
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

/**
 * Scan current page
 */
async function scanCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showToast(t('toast_no_active_tab'), 'error');
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, { type: 'manualScan' });
    showToast(t('toast_scan_launched'));
    
    setTimeout(loadStats, 1000);
  } catch (e) {
    showToast(t('toast_cannot_scan'), 'error');
  }
}

/**
 * Clean tracking cookies
 */
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

/**
 * Reset stats
 */
async function resetStats() {
  if (confirm(t('confirm_reset'))) {
    try {
      await chrome.runtime.sendMessage({ type: 'resetStats' });
      showToast(t('toast_stats_reset'));
      loadStats();
    } catch (e) {
      showToast(t('toast_reset_error'), 'error');
    }
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

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
    
    // Visual feedback
    const modeToasts = {
      'reject_all': t('toast_mode_reject'),
      'accept_essential': t('toast_mode_essential'),
      'accept_anonymized': t('toast_mode_anonymize')
    };
    showToast(`Mode: ${modeToasts[e.target.value] || e.target.value}`);
  });
});

elements.scanBtn.addEventListener('click', scanCurrentPage);
elements.cleanBtn.addEventListener('click', cleanCookies);
elements.resetBtn.addEventListener('click', resetStats);
elements.langBtn.addEventListener('click', toggleLanguage);

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load language first
  await loadLanguage();
  applyTranslations();
  
  // Then load config and stats
  await loadConfig();
  await loadStats();
  
  // Refresh stats periodically
  setInterval(loadStats, 5000);
});
